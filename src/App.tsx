import React, { useState, useEffect } from 'react';
import { 
  initGoogleAnalytics, 
  trackPageView, 
  trackEnquirySubmit,
  trackDestinationView,
  trackTourView,
  trackArticleView,
  trackEvent,
  trackWhatsAppClick
} from './utils/analytics';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Check, 
  ChevronRight, 
  MessageSquare, 
  Award, 
  ShieldCheck, 
  Clock, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Search, 
  Heart, 
  Share2, 
  Plus, 
  BookOpen, 
  Camera, 
  X,
  Map,
  Compass as SafariIcon,
  Tent,
  Sparkles,
  ChevronLeft,
  Sliders,
  Database,
  Trash2,
  TrendingUp,
  UserCheck,
  RefreshCw,
  FileText,
  Lock,
  Edit3,
  LogOut,
  Eye,
  Globe
} from 'lucide-react';

// Decoupled modules
import { 
  destinationsData, 
  toursData, 
  blogData, 
  testimonialsData, 
  galleryData, 
  Destination, 
  Tour, 
  Article,
  Testimonial,
  GalleryItem,
  DEFAULT_ENQUIRIES
} from './data/travelData';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SEOUpdater from './components/SEOUpdater';
import EnquirySuccess from './components/EnquirySuccess';
import AdminDashboardView from './components/AdminDashboardView';
import { 
  db, 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // General Form States
  const [planSuccessData, setPlanSuccessData] = useState<any | null>(null);
  const [enquiries, setEnquiries] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('kagz_enquiries');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_ENQUIRIES;
  });
  
  // Dynamic CMS States
  const [destinations, setDestinations] = useState<Destination[]>(destinationsData);
  const [tours, setTours] = useState<Tour[]>(toursData);
  const [blogs, setBlogs] = useState<Article[]>(blogData);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(testimonialsData);
  const [gallery, setGallery] = useState<GalleryItem[]>(galleryData);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check local admin session (e.g. from Master Passcode, PIN, or OTP)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kagz_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email || parsed?.role) {
          setIsAdminUser(true);
        }
      }
    } catch (e) {}
  }, []);

  // Pure Auth Subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        // Keep active session if signed in via local admin session
        const stored = localStorage.getItem('kagz_admin_session');
        if (!stored) {
          setIsAdminUser(false);
        }
        setIsAuthChecking(false);
        return;
      }

      const emailLower = user.email?.toLowerCase();
      if (emailLower === 'kungutim541@gmail.com') {
        setIsAdminUser(true);
        setIsAuthChecking(false);
        return;
      }

      try {
        const { getDoc, doc } = await import('firebase/firestore');
        let isAuthorized = false;
        if (emailLower) {
          const emailDoc = await getDoc(doc(db, 'admins', emailLower));
          if (emailDoc.exists()) {
            isAuthorized = true;
          }
        }
        if (!isAuthorized) {
          const uidDoc = await getDoc(doc(db, 'admins', user.uid));
          if (uidDoc.exists()) {
            isAuthorized = true;
          }
        }
        if (!isAuthorized) {
          const staffDoc = await getDoc(doc(db, 'staff', user.uid));
          if (staffDoc.exists()) {
            isAuthorized = true;
          }
        }
        setIsAdminUser(isAuthorized);
      } catch (err) {
        console.error("Error verifying admin status:", err);
        const stored = localStorage.getItem('kagz_admin_session');
        if (!stored) setIsAdminUser(false);
      } finally {
        setIsAuthChecking(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load and subscribe to collections from Firestore
  useEffect(() => {
    // 1. Destinations Subscription
    const unsubDests = onSnapshot(collection(db, 'destinations'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Destination[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Destination);
        });
        setDestinations(list);
      } else {
        setDestinations(destinationsData);
      }
    }, (error) => {
      console.warn("Firestore access error for destinations, falling back to static:", error);
      setDestinations(destinationsData);
      try {
        handleFirestoreError(error, OperationType.LIST, 'destinations');
      } catch (e) {}
    });

    // 2. Tours Subscription
    const unsubTours = onSnapshot(collection(db, 'tours'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Tour[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Tour);
        });
        setTours(list);
      } else {
        setTours(toursData);
      }
    }, (error) => {
      console.warn("Firestore access error for tours, falling back to static:", error);
      setTours(toursData);
      try {
        handleFirestoreError(error, OperationType.LIST, 'tours');
      } catch (e) {}
    });

    // 3. Blogs Subscription
    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Article[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Article);
        });
        setBlogs(list);
      } else {
        setBlogs(blogData);
      }
    }, (error) => {
      console.warn("Firestore access error for blogs, falling back to static:", error);
      setBlogs(blogData);
      try {
        handleFirestoreError(error, OperationType.LIST, 'blogs');
      } catch (e) {}
    });

    // 4. Testimonials Subscription
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Testimonial[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Testimonial);
        });
        setTestimonials(list);
      } else {
        const stored = localStorage.getItem('kagz_testimonials');
        if (stored) setTestimonials(JSON.parse(stored));
      }
    }, (error) => {
      const stored = localStorage.getItem('kagz_testimonials');
      if (stored) setTestimonials(JSON.parse(stored));
    });

    // 5. Gallery Subscription
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      if (!snapshot.empty) {
        const list: GalleryItem[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as GalleryItem);
        });
        setGallery(list);
      } else {
        const stored = localStorage.getItem('kagz_gallery');
        if (stored) setGallery(JSON.parse(stored));
      }
    }, (error) => {
      const stored = localStorage.getItem('kagz_gallery');
      if (stored) setGallery(JSON.parse(stored));
    });

    // 6. Enquiries Subscription (Only if admin is logged in to avoid unauthenticated permission errors)
    let unsubEnquiries = () => {};

    if (isAdminUser) {
      unsubEnquiries = onSnapshot(collection(db, 'enquiries'), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data());
        });
        list.sort((a, b) => (b.dateSubmitted || b.id || '').localeCompare(a.dateSubmitted || a.id || ''));
        if (list.length > 0) {
          setEnquiries(list);
          localStorage.setItem('kagz_enquiries', JSON.stringify(list));
        } else {
          const stored = localStorage.getItem('kagz_enquiries');
          if (stored) {
            setEnquiries(JSON.parse(stored));
          } else {
            setEnquiries(DEFAULT_ENQUIRIES);
            localStorage.setItem('kagz_enquiries', JSON.stringify(DEFAULT_ENQUIRIES));
          }
        }
      }, (error) => {
        console.warn("Firestore access error for enquiries, using local storage fallback:", error);
        const stored = localStorage.getItem('kagz_enquiries');
        if (stored) {
          setEnquiries(JSON.parse(stored));
        } else {
          setEnquiries(DEFAULT_ENQUIRIES);
        }
        try {
          handleFirestoreError(error, OperationType.LIST, 'enquiries');
        } catch (e) {}
      });
    } else {
      const stored = localStorage.getItem('kagz_enquiries');
      if (stored) {
        setEnquiries(JSON.parse(stored));
      } else {
        setEnquiries(DEFAULT_ENQUIRIES);
      }
    }

    return () => {
      unsubDests();
      unsubTours();
      unsubBlogs();
      unsubTestimonials();
      unsubGallery();
      unsubEnquiries();
    };
  }, [isAdminUser]);

  // Centralized enquiry submission handler (Writes to Firestore, falls back to local storage)
  const handleNewEnquiry = async (enquiryData: any) => {
    const id = `enq-${Date.now()}`;
    const newEnq = {
      id,
      name: enquiryData.name || 'Anonymous Traveler',
      email: enquiryData.email || 'no-email@kagztravel.com',
      phone: enquiryData.phone || 'N/A',
      country: enquiryData.country || 'N/A',
      destination: enquiryData.destination || 'Kenya',
      travelDate: enquiryData.travelDate || 'flexible',
      travelers: enquiryData.travelers || '2',
      style: enquiryData.style || 'Classic Luxury Safari',
      message: enquiryData.message || '',
      status: 'New Enquiry',
      priority: enquiryData.priority || 'Standard',
      assignedTo: enquiryData.assignedTo || 'Unassigned',
      budget: enquiryData.budget || 'Custom Quote',
      source: enquiryData.source || 'Website Form',
      dateSubmitted: new Date().toISOString().split('T')[0],
      notes: []
    };
    
    try {
      await setDoc(doc(db, 'enquiries', id), newEnq);
      setEnquiries(prev => [newEnq, ...prev]);
    } catch (err) {
      console.warn("Failed to write enquiry to Firestore, storing locally:", err);
      const updated = [newEnq, ...enquiries];
      setEnquiries(updated);
      localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
      try {
        handleFirestoreError(err, OperationType.CREATE, `enquiries/${id}`);
      } catch (e) {}
    }
    
    // Track Google Analytics lead conversion event
    trackEnquirySubmit(newEnq.destination, newEnq.travelers, newEnq.style);
    
    setPlanSuccessData(enquiryData);
  };

  // Initialize Google Analytics on App Mount
  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  // Hash-based client routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Track GA Pageviews and specific item view interactions on route/hash change
  useEffect(() => {
    const activeRoute = parseRoute();
    trackPageView(currentHash || '#/', `KAGZ Safaris - ${activeRoute.page}`);

    if (activeRoute.page === 'destination' && activeRoute.id) {
      const dest = destinations.find(d => d.id === activeRoute.id);
      trackDestinationView(activeRoute.id, dest?.name || activeRoute.id);
    } else if (activeRoute.page === 'tour' && activeRoute.id) {
      const tour = tours.find(t => t.id === activeRoute.id);
      trackTourView(activeRoute.id, tour?.name || activeRoute.id);
    } else if (activeRoute.page === 'blog' && activeRoute.id) {
      const blog = blogs.find(b => b.id === activeRoute.id);
      trackArticleView(activeRoute.id, blog?.title || activeRoute.id);
    }
  }, [currentHash, destinations, tours, blogs]);

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
    setCurrentHash(hash);
  };

  // Extract Route Path and IDs
  const parseRoute = () => {
    let hash = currentHash || '#/';
    
    // Normalize trailing slash (e.g. '#/admin/' -> '#/admin', except for exactly '#/')
    if (hash.endsWith('/') && hash.length > 3) {
      hash = hash.slice(0, -1);
    }

    if (hash === '#/' || hash === '') return { page: 'home', id: null };
    
    if (hash.startsWith('#/destinations/')) {
      return { page: 'destination', id: hash.replace('#/destinations/', '') };
    }
    if (hash === '#/destinations') return { page: 'destinations', id: null };
    
    if (hash.startsWith('#/tours/')) {
      return { page: 'tour', id: hash.replace('#/tours/', '') };
    }
    if (hash === '#/tours') return { page: 'tours', id: null };
    
    if (hash.startsWith('#/guide/')) {
      return { page: 'blog', id: hash.replace('#/guide/', '') };
    }
    if (hash === '#/guide') return { page: 'guide', id: null };
    
    if (hash === '#/about') return { page: 'about', id: null };
    if (hash === '#/gallery') return { page: 'gallery', id: null };
    if (hash === '#/contact') return { page: 'contact', id: null };
    if (hash === '#/plan') return { page: 'plan', id: null };
    if (hash === '#/admin') return { page: 'admin', id: null };

    return { page: 'home', id: null };
  };

  const route = parseRoute();

  // Robust Image Fallback Handler (Zero-Broken-Image Policy)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.referrerPolicy = 'no-referrer';
    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%231C2421"/><path d="M400,220 L550,420 L250,420 Z" fill="%23C5A880" opacity="0.8"/><circle cx="400" cy="160" r="40" fill="%23EADCC9"/><text x="400" y="480" font-family="serif" font-size="24" fill="%23FAF7F2" text-anchor="middle">KAGZ Wilderness Experience</text></svg>';
  };

  // Clean Separation: If this is the Internal Admin Portal, bypass visitor Navbar & Footer entirely
  if (route.page === 'admin') {
    if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-[#1C2421] flex flex-col items-center justify-center px-4 font-sans select-none">
          <div className="text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#C5A880] animate-spin mx-auto" />
            <h1 className="font-serif text-xl font-medium text-[#FAF7F2]">KAGZ Concierge Portal</h1>
            <p className="text-stone-400 text-[10px] uppercase tracking-widest">Verifying staff credentials...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col font-sans bg-[#FAF7F2]">
        <SEOUpdater currentHash={currentHash} />
        
        {/* Clean, standalone Admin portal (Zero customer-facing components) */}
        <main className="flex-grow">
          <AdminDashboardView 
            enquiries={enquiries} 
            setEnquiries={setEnquiries} 
            destinations={destinations}
            setDestinations={setDestinations}
            tours={tours}
            setTours={setTours}
            blogs={blogs}
            setBlogs={setBlogs}
            testimonials={testimonials}
            setTestimonials={setTestimonials}
            gallery={gallery}
            setGallery={setGallery}
            onNavigate={navigateTo} 
            currentUser={currentUser}
            isAdminUser={isAdminUser}
            setIsAdminUser={setIsAdminUser}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF7F2]">
      {/* Dynamic SEO Updater */}
      <SEOUpdater currentHash={currentHash} />

      {/* Global Navigation Bar */}
      <Navbar currentHash={currentHash} onNavigate={navigateTo} />

      {/* Main Page Render Pipeline with Dynamic CMS State Arrays */}
      <main className="flex-grow">
        {route.page === 'home' && <HomeView onNavigate={navigateTo} onImageError={handleImageError} setLightboxImage={setLightboxImage} destinations={destinations} tours={tours} blogs={blogs} testimonials={testimonials} gallery={gallery} />}
        {route.page === 'destinations' && <DestinationsView onNavigate={navigateTo} onImageError={handleImageError} destinations={destinations} />}
        {route.page === 'destination' && <DestinationDetailView id={route.id || 'kenya'} onNavigate={navigateTo} onImageError={handleImageError} setPlanSuccessData={handleNewEnquiry} destinations={destinations} tours={tours} />}
        {route.page === 'tours' && <ToursView onNavigate={navigateTo} onImageError={handleImageError} tours={tours} />}
        {route.page === 'tour' && <TourDetailView id={route.id || 'maasai-mara-safari'} onNavigate={navigateTo} onImageError={handleImageError} setPlanSuccessData={handleNewEnquiry} tours={tours} />}
        {route.page === 'about' && <AboutView onNavigate={navigateTo} onImageError={handleImageError} />}
        {route.page === 'guide' && <GuideView onNavigate={navigateTo} onImageError={handleImageError} blogs={blogs} />}
        {route.page === 'blog' && <BlogDetailView id={route.id || 'best-time-to-visit-kenya'} onNavigate={navigateTo} onImageError={handleImageError} blogs={blogs} destinations={destinations} />}
        {route.page === 'gallery' && <GalleryPageView onImageError={handleImageError} setLightboxImage={setLightboxImage} gallery={gallery} />}
        {route.page === 'contact' && <ContactView setPlanSuccessData={handleNewEnquiry} planSuccessData={planSuccessData} />}
        {route.page === 'plan' && <PlanView setPlanSuccessData={handleNewEnquiry} planSuccessData={planSuccessData} />}
      </main>

      {/* Global Interactive Lightbox for Galleries */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            aria-label="Close image viewer"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-4xl max-h-[85vh] relative flex flex-col items-center">
            <img 
              src={lightboxImage.src || undefined} 
              alt={lightboxImage.alt}
              onError={handleImageError}
              className="max-w-full max-h-[80vh] object-contain border border-stone-800"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-stone-300 text-sm mt-4 font-serif italic text-center">{lightboxImage.alt}</p>
          </div>
        </div>
      )}

      {/* Global Footer Column Grid */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: HOME (Refactored Earthy & Charcoal Scenery Dissolve Slider)
   ============================================================================ */
interface HomeViewProps {
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  setLightboxImage: (img: { src: string; alt: string } | null) => void;
  destinations: Destination[];
  tours: Tour[];
  blogs: Article[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
}

function HomeView({ onNavigate, onImageError, setLightboxImage, destinations, tours, blogs, testimonials, gallery }: HomeViewProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Discover Africa. Experience More.",
      kicker: "The KAGZ Wilderness Curation",
      description: "Explore slow-paced, carefully curated safari adventures across East and Southern Africa, developed directly with native rangers and ecological partners.",
      background: destinations.find(d => d.id === 'kenya')?.image || undefined,
      badge: "Savanna",
      badgeYear: "KEN",
      circlePackage: "Maasai Mara",
      circleSubtitle: "Wildlife Safari",
      circleActionHash: "#/tours/maasai-mara-safari"
    },
    {
      title: "Secluded Tropical Shores.",
      kicker: "Swahili-Arabic Heritage",
      description: "Unwind on the remote, palm-shaded shores of Zanzibar. Experience Stone Town Spice trails, snorkeling reefs, and sunset dhow cruises.",
      background: destinations.find(d => d.id === 'zanzibar')?.image || undefined,
      badge: "Islands",
      badgeYear: "ZNZ",
      circlePackage: "Zanzibar Spice",
      circleSubtitle: "Beach Getaway",
      circleActionHash: "#/tours/zanzibar-beach-escape"
    }
  ];

  // Auto-rotate slider every 10 seconds for premium presence
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fade-in">
      {/* Interactive Hero Section with Premium Layered Crossfade and Scale Effects */}
      <section className="relative min-h-[90vh] sm:h-[80vh] lg:h-[85vh] flex items-center overflow-hidden bg-[#1C2421] select-none">
        
        {/* Dynamic stacked crossfade slides */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              activeSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Dark Charcoal gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1C2421]/95 via-[#1C2421]/50 to-[#1C2421]/65 z-10" />
            
            {/* Ken Burns image effect */}
            <img 
              src={slide.background} 
              alt={slide.title}
              onError={onImageError}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[12000ms] ease-out ${
                activeSlide === idx ? 'scale-105 translate-x-1' : 'scale-100'
              }`}
            />

            {/* Main Content Row aligned precisely inside each slide layer for smooth crossfade */}
            <div className="absolute inset-0 z-20 flex items-center py-6 md:py-0 overflow-y-auto no-scrollbar">
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6 lg:gap-12 mt-6 md:mt-0">
                
                {/* Left Text Block (Spacious, Simplified, with elegant delayed slide-up motion) */}
                <div className={`text-white max-w-lg md:max-w-md lg:max-w-lg space-y-4 sm:space-y-5 text-left transition-all duration-1000 transform ${
                  activeSlide === idx ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}>
                  <span className="text-[#C5A880] tracking-[0.2em] uppercase font-bold text-[10px] sm:text-xs block">
                    {slide.kicker}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-4xl lg:text-6xl font-normal leading-[1.15] sm:leading-[1.1] text-wrap-balance">
                    {slide.title}
                  </h1>
                  <p className="text-stone-300 text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed font-light line-clamp-4 sm:line-clamp-none">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
                    <button
                      onClick={() => onNavigate('#/destinations')}
                      className="px-7 py-3.5 sm:py-3 bg-[#C5A880] hover:bg-white text-[#1C2421] font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm cursor-pointer text-center"
                    >
                      EXPLORE DESTINATIONS
                    </button>
                    
                    {/* Category Toggles (Dots) */}
                    <div className="flex gap-2 justify-center sm:justify-start">
                      {slides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlide(dotIdx);
                          }}
                          className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                            activeSlide === dotIdx 
                              ? 'bg-[#C5A880] border-[#C5A880] scale-125' 
                              : 'bg-white/30 border-white/40 hover:bg-white/60'
                          }`}
                          aria-label={`Show slide scenario ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side: Luxurious Safari Badge Overlay - Optimized sizing, hidden on mobile, shown and scaled on tablet/desktop */}
                <div className={`hidden md:block relative shrink-0 transition-all duration-1000 transform origin-center scale-75 lg:scale-100 ${
                  activeSlide === idx ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-95 -rotate-1'
                }`}>
                  {/* Overlapping Badge */}
                  <div className="absolute -top-3 -right-3 z-30 w-16 h-20 sm:w-20 sm:h-24 bg-white text-[#1C2421] font-sans font-bold rounded-full flex flex-col justify-center items-center text-center shadow-lg border border-[#C5A880]/15 text-[8px] uppercase tracking-wider">
                    <span>{slide.badge}</span>
                    <span className="text-[#C5A880] text-xs font-bold font-serif">{slide.badgeYear}</span>
                    <span>Bespoke</span>
                  </div>

                  {/* Main elegant circular card with charcoal-gold gradient */}
                  <div className="relative z-20 w-[280px] h-[290px] sm:w-[320px] sm:h-[330px] lg:w-[360px] lg:h-[360px] rounded-full bg-gradient-to-tr from-[#1C2421]/95 via-[#2E2520]/90 to-[#C5A880]/20 backdrop-blur-md border border-white/10 flex flex-col justify-center items-center p-6 lg:p-8 text-center text-white shadow-2xl">
                    
                    {/* Top zigzag line */}
                    <div className="text-[#C5A880] text-lg font-bold tracking-widest mb-1.5 select-none font-mono">
                      &tilde;&tilde;&tilde;&tilde;
                    </div>

                    {/* Dynamic titles */}
                    <span className="text-[9px] lg:text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold mb-1 font-sans">Safari Design</span>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide leading-none uppercase">
                      {slide.circlePackage.split(' ')[0]}
                    </h2>
                    <h3 className="font-sans text-lg sm:text-xl lg:text-2xl font-light text-stone-200 uppercase tracking-widest mt-1 mb-2">
                      {slide.circlePackage.split(' ').slice(1).join(' ')}
                    </h3>
                    
                    {/* Highlight */}
                    <div className="text-xs sm:text-sm font-bold font-sans text-stone-300 uppercase tracking-wider mb-4 lg:mb-5">
                      {slide.circleSubtitle}
                    </div>

                    {/* Outline capsule button */}
                    <button
                      onClick={() => onNavigate(slide.circleActionHash)}
                      className="px-5 py-2 border-2 border-[#C5A880] hover:border-white hover:bg-white/5 text-white hover:text-[#C5A880] font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer font-sans"
                    >
                      Explore Now
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ))}

        {/* Scenic navigation arrows */}
        <button 
          onClick={() => setActiveSlide(activeSlide === 0 ? 1 : 0)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full hidden lg:block cursor-pointer"
          aria-label="Previous scene"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setActiveSlide(activeSlide === 0 ? 1 : 0)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full hidden lg:block cursor-pointer"
          aria-label="Next scene"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* 2. INTRODUCTION SECTION */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-3">Our Travel Philosophy</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C2421] mb-6">
            Travel Beyond the Ordinary
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mb-8" />
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 font-light">
            At KAGZ, we believe that traveling across Africa should be an inspiring and deeply transformative experience. We reject the concept of rigid, crowded tour templates. Instead, we specialize in shaping custom, slow-paced travel that honors the wild environments, respects local community heritage, and matches the personal pace of our guests.
          </p>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
            Whether you dream of following the great migration across the Serengeti, stepping silently into the misty gorilla forests of Rwanda, or unwinding on the clove-scented shores of Zanzibar, our travel designers provide complete, personalized itinerary planning.
          </p>
        </div>
      </section>

      {/* 3. FEATURED DESTINATIONS */}
      <section className="py-20 bg-white border-y border-[#EADCC9]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Curated Horizons</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C2421]">Explore Africa</h2>
            </div>
            <button 
              onClick={() => onNavigate('#/destinations')}
              className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#1C2421] transition-colors"
            >
              <span>View All Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.slice(0, 3).map((dest) => (
              <div 
                key={dest.id}
                className="group bg-[#FAF7F2] border border-[#EADCC9]/30 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-black/10 z-10 group-hover:bg-transparent transition-colors duration-300" />
                  <img 
                    src={dest.image || undefined} 
                    alt={dest.tagline}
                    onError={onImageError}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 left-4 z-20 text-white">
                    <span className="text-[9px] uppercase font-bold tracking-widest bg-[#1C2421] px-2.5 py-1">{dest.category}</span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#1C2421] mb-2">{dest.name}</h3>
                    <p className="text-[#C5A880] text-xs italic mb-4">{dest.tagline}</p>
                    <p className="text-stone-600 text-xs leading-relaxed line-clamp-3 mb-6 font-light">{dest.intro}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(`#/destinations/${dest.id}`)}
                    className="w-full text-center py-2.5 border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300"
                  >
                    Explore {dest.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCES SECTION */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Designed For You</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C2421]">Travel Your Way</h2>
            <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Wildlife & Safari',
                desc: 'Experience Africa\'s incredible wildlife, tracking big cats and magnificent herds across legendary savannas.',
                icon: <SafariIcon className="w-8 h-8 text-[#C5A880]" />,
                img: destinations.find(d => d.id === 'kenya')?.image || undefined
              },
              {
                title: 'Beach Escapes',
                desc: 'Relax along tropical coral coastlines and remote island properties washed by warm turquoise waters.',
                icon: <Compass className="w-8 h-8 text-[#C5A880]" />,
                img: destinations.find(d => d.id === 'zanzibar')?.image || undefined
              },
              {
                title: 'Culture & Heritage',
                desc: 'Discover local Swahili traditions, elder storytelling, ancient stone cities, and living village history.',
                icon: <Award className="w-8 h-8 text-[#C5A880]" />,
                img: galleryData.find(g => g.id === '4')?.src || undefined
              },
              {
                title: 'Adventure Trekking',
                desc: 'Explore high-altitude rainforest pathways, deep volcanic lakes, and climb majestic volcanic peaks.',
                icon: <Tent className="w-8 h-8 text-[#C5A880]" />,
                img: destinations.find(d => d.id === 'tanzania')?.image || undefined
              },
              {
                title: 'Family Holidays',
                desc: 'Create secure, highly educational, and deeply memorable shared experiences for family members of all ages.',
                icon: <ShieldCheck className="w-8 h-8 text-[#C5A880]" />,
                img: destinations.find(d => d.id === 'south-africa')?.image || undefined
              },
              {
                title: 'Romantic Getaways',
                desc: 'Cherish intimate moments under starry skies, secluded luxury camps, and candlelit savanna sunset dining.',
                icon: <Heart className="w-8 h-8 text-[#C5A880]" />,
                img: destinations.find(d => d.id === 'zanzibar')?.image || undefined
              }
            ].map((exp, idx) => (
              <div 
                key={idx}
                className="relative h-80 group overflow-hidden border border-[#EADCC9]/30"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                <img 
                  src={exp.img || undefined} 
                  alt={exp.title}
                  onError={onImageError}
                  className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                  <div className="mb-3">{exp.icon}</div>
                  <h3 className="font-serif text-2xl font-bold mb-2 tracking-wide text-wrap">{exp.title}</h3>
                  <p className="text-stone-300 text-xs font-light leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {exp.desc}
                  </p>
                  <button 
                    onClick={() => onNavigate('#/tours')}
                    className="text-[#C5A880] text-xs font-bold uppercase tracking-widest text-left hover:text-white transition-colors cursor-pointer"
                  >
                    View Experiences &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY TRAVEL WITH KAGZ */}
      <section className="py-20 bg-white border-y border-[#EADCC9]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Our Credentials</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C2421]">Why Travel With KAGZ?</h2>
            <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-center md:text-left">
            {[
              {
                title: 'Local Knowledge',
                desc: 'Our founders and safari guides were born and raised on these lands. Our deep local roots grant you access to remote areas and authentic stories.',
                icon: <Map className="w-10 h-10 text-[#C5A880]" />
              },
              {
                title: 'Carefully Selected Partners',
                desc: 'We personally inspect and partner with highly sustainable, eco-certified wilderness camps, beach villas, and private wildlife conservancies.',
                icon: <Award className="w-10 h-10 text-[#C5A880]" />
              },
              {
                title: 'Personalized Travel',
                desc: 'No algorithm can design a meaningful trip. We draft each safari from scratch, matching your preferred pacing, style, and culinary requests.',
                icon: <Compass className="w-10 h-10 text-[#C5A880]" />
              },
              {
                title: 'Authentic Destinations',
                desc: 'We focus on exclusive, low-impact private reserves that support active wildlife conservation and direct community land leases.',
                icon: <SafariIcon className="w-10 h-10 text-[#C5A880]" />
              },
              {
                title: 'Professional Service',
                desc: 'From airport VIP assistance to local charter flights, our dedicated concierge team supports you around the clock throughout your entire trip.',
                icon: <ShieldCheck className="w-10 h-10 text-[#C5A880]" />
              },
              {
                title: 'Attention To Detail',
                desc: 'Whether arranging cold bush beers after dry drives or private diet preferences at high-altitude retreats, we remember every detail.',
                icon: <Clock className="w-10 h-10 text-[#C5A880]" />
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="p-3 bg-[#FAF7F2] border border-[#EADCC9]/40 text-center flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C2421] mb-2">{item.title}</h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED EXPERIENCES (TOURS) */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Curated Journeys</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C2421]">Featured Experiences</h2>
            </div>
            <button 
              onClick={() => onNavigate('#/tours')}
              className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#1C2421] transition-colors"
            >
              <span>View All Experiences</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tours.slice(0, 2).map((tour) => (
              <div 
                key={tour.id}
                className="group bg-white border border-[#EADCC9]/20 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
                  <img 
                    src={tour.image || undefined} 
                    alt={tour.name}
                    onError={onImageError}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-[#1C2421] text-white text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 z-10 rounded-full">
                    {tour.duration}
                  </div>
                </div>
                <div className="p-8 w-full md:w-1/2 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-[#C5A880] uppercase tracking-wider">{tour.destination} &middot; {tour.category}</span>
                    <h3 className="font-serif text-2xl font-bold text-[#1C2421] mt-2 mb-3 leading-tight">{tour.name}</h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-4 mb-6 font-light">{tour.description}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(`#/tours/${tour.id}`)}
                    className="w-full py-3.5 bg-[#1C2421] hover:bg-[#C5A880] text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300 rounded-none cursor-pointer"
                  >
                    Explore Experience
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. GALLERY PREVIEW */}
      <section className="py-20 bg-white border-t border-[#EADCC9]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Through the Lens</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C2421]">Gallery Preview</h2>
            </div>
            <button 
              onClick={() => onNavigate('#/gallery')}
              className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#1C2421] transition-colors"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.slice(0, 6).map((img) => (
              <div 
                key={img.id}
                onClick={() => setLightboxImage({ src: img.src, alt: img.alt })}
                className="group relative h-48 sm:h-64 overflow-hidden border border-stone-200 cursor-pointer"
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white stroke-[1.2]" />
                </div>
                <img 
                  src={img.src || undefined} 
                  alt={img.alt}
                  onError={onImageError}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 z-20 text-[9px] text-stone-300 bg-black/40 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TRAVEL INSPIRATION (BLOG) */}
      <section className="py-20 bg-[#FAF7F2] border-t border-[#EADCC9]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">KAGZ Dispatch</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C2421]">Travel Inspiration</h2>
            </div>
            <button 
              onClick={() => onNavigate('#/guide')}
              className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A880] hover:text-[#1C2421] transition-colors"
            >
              <span>Read Our Travel Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.slice(0, 3).map((post) => (
              <div 
                key={post.id}
                className="bg-white border border-[#EADCC9]/30 flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mb-3 font-sans">
                      <span className="font-bold text-[#C5A880] uppercase tracking-wider">{post.category}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#1C2421] mb-3 leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-stone-600 text-xs leading-relaxed font-light line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate(`#/guide/${post.id}`)}
                    className="text-xs font-bold text-[#C5A880] uppercase tracking-wider text-left hover:text-[#1C2421] transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read More</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-20 bg-white border-y border-[#EADCC9]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Guest Diaries</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C2421]">What Our Travelers Say</h2>
            <div className="w-12 h-0.5 bg-[#C5A880] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div 
                key={t.id}
                className="bg-[#FAF7F2] p-8 border border-[#EADCC9]/35 flex flex-col justify-between h-full relative"
              >
                <div className="text-stone-600 text-xs sm:text-sm italic leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div className="flex items-center gap-3 border-t border-[#EADCC9]/35 pt-4">
                  <div className="w-10 h-10 rounded-full bg-[#1C2421] text-[#C5A880] font-bold text-xs flex items-center justify-center select-none shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#1C2421]">{t.author}</h4>
                    <p className="text-stone-500 text-[9px] uppercase tracking-wider">{t.location}</p>
                    <p className="text-[#C5A880] text-[9px] mt-0.5 italic">{t.trip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL HOME CTA */}
      <section className="relative py-28 bg-[#1C2421] text-white text-center overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={destinations.find(d => d.id === 'kenya')?.image || undefined} 
          alt="Distant horizon safari view"
          onError={onImageError}
          className="absolute inset-0 w-full h-full object-cover transform scale-100 opacity-40"
        />
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-4">Craft Your Dream Journey</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold mb-6 text-wrap-balance leading-tight">
            Your Next Adventure Starts Here
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Tell us where you want to go, what you want to experience, and we will help you turn your travel ideas into an unforgettable journey.
          </p>
          <button
            onClick={() => onNavigate('#/plan')}
            className="px-10 py-4 bg-[#C5A880] hover:bg-white text-[#1C2421] font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md cursor-pointer"
          >
            Plan Your Trip
          </button>
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: DESTINATIONS DIRECTORY
   ============================================================================ */
interface DestinationsViewProps {
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  destinations: Destination[];
}

function DestinationsView({ onNavigate, onImageError, destinations }: DestinationsViewProps) {
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'East Africa', 'Southern Africa', 'Beach Destinations', 'Wildlife Destinations'];

  const filteredDests = destinations.filter(d => {
    if (filterCategory === 'All') return true;
    return d.category === filterCategory;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
      <div className="text-center mb-12">
        <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Wild Landscapes</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C2421] mb-4">Discover Africa</h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto font-light leading-relaxed">
          From the mist-crowned heights of mountain primate sanctuaries to the infinite golden savannas and spice archipelago shores.
        </p>
      </div>

      {/* Interactive Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-[#EADCC9]/30 pb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-full cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#C5A880] text-white'
                : 'bg-white text-[#1C2421] border border-stone-200 hover:bg-[#FAF7F2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDests.map((dest) => (
          <div 
            key={dest.id}
            className="group bg-white border border-[#EADCC9]/30 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={dest.image || undefined} 
                alt={dest.name}
                onError={onImageError}
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 z-10 text-[9px] uppercase font-bold tracking-wider bg-[#1C2421] text-white px-2.5 py-1 rounded-full">
                {dest.category}
              </div>
            </div>
            <div className="p-8 flex-grow flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C2421] mb-2">{dest.name}</h2>
                <p className="text-stone-500 text-xs italic mb-4 leading-relaxed">{dest.tagline}</p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6 font-light line-clamp-3">
                  {dest.intro}
                </p>
              </div>
              <button
                onClick={() => onNavigate(`#/destinations/${dest.id}`)}
                className="w-full text-center py-3 border border-[#C5A880] text-[#C5A880] hover:bg-[#C5A880] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300 rounded-none cursor-pointer"
              >
                Explore {dest.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: DESTINATION DETAIL
   ============================================================================ */
interface DestinationDetailViewProps {
  id: string;
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  setPlanSuccessData: (data: any) => void;
  destinations: Destination[];
  tours: Tour[];
}

function DestinationDetailView({ id, onNavigate, onImageError, setPlanSuccessData, destinations, tours }: DestinationDetailViewProps) {
  const dest = destinations.find(d => d.id === id) || destinations[0];
  if (!dest) {
    return (
      <div className="py-24 text-center select-none font-sans bg-[#FAF7F2]">
        <div className="max-w-md mx-auto px-4">
          <p className="text-stone-600 font-serif text-lg mb-4">Destination Not Found</p>
          <button onClick={() => onNavigate('#/destinations')} className="text-xs uppercase tracking-widest font-bold text-[#C5A880] hover:underline">
            Back to Destinations
          </button>
        </div>
      </div>
    );
  }
  const relatedToursList = tours.filter(t => dest.relatedTours && dest.relatedTours.includes(t.id));

  // Quick enquiry states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [message, setMessage] = useState('');

  const handleQuickEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setPlanSuccessData({
        name,
        email,
        destination: dest.name,
        travelDate,
        travelers,
        message
      });
      onNavigate('#/plan');
    }
  };

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <section className="relative h-[55vh] sm:h-[60vh] flex items-center justify-center overflow-hidden bg-[#1C2421]">
        <div className="absolute inset-0 bg-black/45 z-10" />
        <img 
          src={dest.image || undefined} 
          alt={dest.name}
          onError={onImageError}
          className="absolute inset-0 w-full h-full object-cover transform scale-100"
        />
        <div className="relative z-20 text-center text-white px-4">
          <p className="text-[#C5A880] text-xs uppercase tracking-[0.25em] font-bold mb-3">{dest.category}</p>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold tracking-tight mb-4">{dest.name}</h1>
          <p className="text-stone-200 text-sm sm:text-base max-w-xl mx-auto italic font-light">{dest.tagline}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content (2 columns) */}
        <div className="lg:col-span-2 space-y-12 select-text">
          {/* Intro */}
          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold text-[#1C2421] tracking-wide border-b border-[#EADCC9]/30 pb-4">
              Destination Introduction
            </h2>
            <p className="text-stone-600 leading-relaxed font-light text-sm sm:text-base">
              {dest.intro}
            </p>
          </div>

          {/* Why Visit (Proof Claim) */}
          <div className="space-y-4 bg-white p-8 border border-[#EADCC9]/30">
            <h2 className="font-serif text-2xl font-bold text-[#1C2421] tracking-wide">Why Visit {dest.name}?</h2>
            <ul className="space-y-3.5">
              {dest.whyVisit.map((pt, idx) => (
                <li key={idx} className="flex gap-3 items-start text-stone-600 text-xs sm:text-sm font-sans font-light">
                  <Check className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Attractions & Experiences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#1C2421] border-b border-[#EADCC9]/30 pb-2">Top Experiences</h3>
              <ul className="space-y-2 text-stone-600 text-xs sm:text-sm font-light">
                {dest.topExperiences.map((exp, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-[#C5A880] font-bold">&middot;</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#1C2421] border-b border-[#EADCC9]/30 pb-2">Must-See Attractions</h3>
              <ul className="space-y-2 text-stone-600 text-xs sm:text-sm font-light">
                {dest.attractions.map((att, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-[#C5A880] font-bold">&middot;</span>
                    <span>{att}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-[#EADCC9]/30 pt-8 text-xs sm:text-sm text-stone-600">
            <div>
              <h4 className="font-serif text-lg font-bold text-[#1C2421] mb-2">Best Time to Visit</h4>
              <p className="font-light leading-relaxed">{dest.bestTimeToVisit}</p>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#1C2421] mb-2">Traveler Tips</h4>
              <p className="font-light leading-relaxed">{dest.travelTips}</p>
            </div>
          </div>

          {/* Related Itineraries */}
          {relatedToursList.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-[#EADCC9]/30">
              <h3 className="font-serif text-2xl font-bold text-[#1C2421]">Suggested Itineraries for {dest.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedToursList.map((t) => (
                  <div key={t.id} className="bg-white border border-[#EADCC9]/30 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#C5A880] font-bold">{t.duration}</span>
                      <h4 className="font-serif text-lg font-bold text-[#1C2421] mt-1 mb-2">{t.name}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">{t.description}</p>
                    </div>
                    <button
                      onClick={() => onNavigate(`#/tours/${t.id}`)}
                      className="text-xs font-bold text-[#C5A880] uppercase tracking-wider hover:text-[#1C2421] text-left transition-colors cursor-pointer"
                    >
                      View Itinerary &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQS */}
          {dest.faq && dest.faq.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-[#EADCC9]/30">
              <h3 className="font-serif text-2xl font-bold text-[#1C2421]">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {dest.faq.map((fq, idx) => (
                  <div key={idx} className="p-5 bg-white border border-stone-100">
                    <h4 className="font-serif text-base font-bold text-[#1C2421] mb-1.5">{fq.q}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">{fq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Enquiry Widget */}
        <div className="space-y-8 select-none">
          <div className="bg-[#1C2421] text-white p-6 md:p-8 border border-white/10 sticky top-28 shadow-lg text-xs">
            <h3 className="font-serif text-2xl font-bold text-[#C5A880] mb-2 tracking-wide">Design Your Journey</h3>
            <p className="text-stone-300 text-xs font-light leading-relaxed mb-6 font-sans">
              Share your travel preferences and our experts will craft a bespoke safari itinerary for {dest.name}.
            </p>

            <form onSubmit={handleQuickEnquirySubmit} className="space-y-4 text-xs text-stone-300">
              <div className="space-y-1">
                <label htmlFor="quick-name" className="block text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">Full Name</label>
                <input 
                  id="quick-name"
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880] placeholder-stone-500 rounded-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="quick-email" className="block text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">Email Address</label>
                <input 
                  id="quick-email"
                  type="email" 
                  required
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880] placeholder-stone-500 rounded-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="quick-date" className="block text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">Preferred Date</label>
                  <input 
                    id="quick-date"
                    type="text" 
                    placeholder="e.g. June 2026"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880] placeholder-stone-500 rounded-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="quick-travelers" className="block text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">Guests Count</label>
                  <select 
                    id="quick-travelers"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880] rounded-none text-xs cursor-pointer"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="quick-msg" className="block text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">Your Travel Ideas</label>
                <textarea 
                  id="quick-msg"
                  rows={3}
                  placeholder="Tell us about your ideal experience..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-white focus:outline-none focus:border-[#C5A880] placeholder-stone-500 rounded-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#C5A880] hover:bg-white text-[#1C2421] hover:text-[#C5A880] font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow-md rounded-full cursor-pointer"
              >
                Send Enquiry Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: TOURS & EXPERIENCES LISTING
   ============================================================================ */
interface ToursViewProps {
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  tours: Tour[];
}

function ToursView({ onNavigate, onImageError, tours }: ToursViewProps) {
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Wildlife', 'Beach', 'Adventure'];

  const filteredTours = tours.filter(t => {
    if (filterCategory === 'All') return true;
    return t.category === filterCategory;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
      <div className="text-center mb-12">
        <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2">Signature Itineraries</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C2421] mb-4">Tours & Experiences</h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Carefully structured schedules developed with local rangers and luxurious partners. Fully editable to match your preferences.
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-[#EADCC9]/30 pb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-full cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#C5A880] text-white'
                : 'bg-white text-[#1C2421] border border-stone-200 hover:bg-[#FAF7F2]'
            }`}
          >
            {cat} Experiences
          </button>
        ))}
      </div>

      {/* Experience Listing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTours.map((tour) => (
          <div 
            key={tour.id}
            className="group bg-white border border-stone-100 overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300"
          >
            <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
              <img 
                src={tour.image || undefined} 
                alt={tour.name}
                onError={onImageError}
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#1C2421] text-white text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 z-10 rounded-full">
                {tour.duration}
              </div>
            </div>
            <div className="p-8 w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#C5A880] uppercase tracking-wider">{tour.destination} &middot; {tour.category}</span>
                <h3 className="font-serif text-2xl font-bold text-[#1C2421] mt-1 mb-2 tracking-wide leading-tight">{tour.name}</h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-4 mb-6 font-light">{tour.description}</p>
              </div>
              <button
                onClick={() => onNavigate(`#/tours/${tour.id}`)}
                className="w-full py-3.5 bg-[#1C2421] hover:bg-[#C5A880] text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300 rounded-none cursor-pointer"
              >
                View Experience
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: EXPERIENCE DETAIL TEMPLATE
   ============================================================================ */
interface TourDetailViewProps {
  id: string;
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  setPlanSuccessData: (data: any) => void;
  tours: Tour[];
}

function TourDetailView({ id, onNavigate, onImageError, setPlanSuccessData, tours }: TourDetailViewProps) {
  const tour = tours.find(t => t.id === id) || tours[0];
  if (!tour) {
    return (
      <div className="py-24 text-center select-none font-sans bg-[#FAF7F2]">
        <div className="max-w-md mx-auto px-4">
          <p className="text-stone-600 font-serif text-lg mb-4">Itinerary Not Found</p>
          <button onClick={() => onNavigate('#/tours')} className="text-xs uppercase tracking-widest font-bold text-[#C5A880] hover:underline">
            Back to Tours
          </button>
        </div>
      </div>
    );
  }
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(0);

  // Quick enquiry states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [message, setMessage] = useState('');

  const handleTourEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setPlanSuccessData({
        name,
        email,
        destination: `${tour.destination} (${tour.name})`,
        travelDate,
        travelers: '2',
        message: `Inquired about itinerary. Additional Message: ${message}`
      });
      onNavigate('#/plan');
    }
  };

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <section className="relative h-[55vh] sm:h-[60vh] flex items-center justify-center overflow-hidden bg-[#1C2421]">
        <div className="absolute inset-0 bg-black/45 z-10" />
        <img 
          src={tour.image || undefined} 
          alt={tour.name}
          onError={onImageError}
          className="absolute inset-0 w-full h-full object-cover transform scale-100"
        />
        <div className="relative z-20 text-center text-white px-4">
          <p className="text-[#C5A880] text-xs uppercase tracking-[0.25em] font-bold mb-3">{tour.destination} &middot; {tour.category}</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 max-w-4xl mx-auto leading-tight text-wrap-balance">{tour.name}</h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto bg-black/30 px-4 py-2 border border-white/10">{tour.duration} Experience</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content (2 columns) */}
        <div className="lg:col-span-2 space-y-12 select-text">
          {/* Overview */}
          <div className="space-y-4">
            <h2 className="font-serif text-3xl font-bold text-[#1C2421] border-b border-[#EADCC9]/30 pb-4">Experience Overview</h2>
            <p className="text-stone-600 leading-relaxed font-light text-sm sm:text-base">
              {tour.overview}
            </p>
          </div>

          {/* Highlights */}
          <div className="bg-white p-8 border border-[#EADCC9]/30 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[#1C2421]">Experience Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tour.highlights.map((h, idx) => (
                <div key={idx} className="flex gap-2 items-start text-stone-600 text-xs sm:text-sm font-sans font-light">
                  <Check className="w-4.5 h-4.5 text-[#C5A880] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Itinerary */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#1C2421] border-b border-[#EADCC9]/30 pb-4">Proposed Itinerary</h3>
            <div className="space-y-3">
              {tour.itinerary.map((it, idx) => (
                <div key={idx} className="bg-white border border-[#EADCC9]/30">
                  <button
                    onClick={() => setActiveDayIdx(activeDayIdx === idx ? null : idx)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left cursor-pointer hover:bg-[#FAF7F2] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-lg font-bold text-[#C5A880]">{it.day}</span>
                      <span className="font-bold text-xs sm:text-sm text-[#1C2421]">{it.title}</span>
                    </div>
                    {activeDayIdx === idx ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                  </button>
                  {activeDayIdx === idx && (
                    <div className="px-6 pb-6 pt-1 text-xs text-stone-600 leading-relaxed font-light border-t border-stone-100">
                      {it.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What to Expect */}
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-[#1C2421]">What To Expect</h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">{tour.whatToExpect}</p>
          </div>

          {/* Packing Guidelines */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1C2421] border-b border-[#EADCC9]/30 pb-2">Recommended Gear & Packing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600 text-xs sm:text-sm font-light">
              {tour.whatToBring.map((gear, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                  <span>{gear}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Enquiry form */}
        <div className="space-y-8 select-none">
          <div className="bg-white p-6 border border-[#EADCC9]/30 sticky top-28 shadow-md">
            <h3 className="font-serif text-xl font-bold text-[#1C2421] mb-2 tracking-wide border-b border-stone-100 pb-2">Enquire About This Tour</h3>
            <p className="text-stone-500 text-xs font-light leading-relaxed mb-6 font-sans">
              Let us know when you would like to go, and we will build a private version of this itinerary.
            </p>

            <form onSubmit={handleTourEnquirySubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="tour-name" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Full Name</label>
                <input 
                  id="tour-name"
                  type="text" 
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 text-stone-900 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tour-email" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Email Address</label>
                <input 
                  id="tour-email"
                  type="email" 
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 text-stone-900 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tour-phone" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Phone Number</label>
                <input 
                  id="tour-phone"
                  type="tel" 
                  placeholder="+1 234 567 890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 text-stone-900 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tour-date" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Target Date / Month</label>
                <input 
                  id="tour-date"
                  type="text" 
                  placeholder="e.g. September 2026"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 text-stone-900 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="tour-msg" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Special Notes</label>
                <textarea 
                  id="tour-msg"
                  rows={3}
                  placeholder="Preferences, active styles, specific requests..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 text-stone-900 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#C5A880] hover:bg-[#1C2421] text-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow-md rounded-full cursor-pointer"
              >
                Request Custom Quotation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: ABOUT US
   ============================================================================ */
interface AboutViewProps {
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

function AboutView({ onNavigate, onImageError }: AboutViewProps) {
  const culturePhoto = galleryData.find(g => g.id === '4')?.src || undefined;

  return (
    <div className="py-16 fade-in select-text max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-sans">Our Story</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C2421] mb-4">About KAGZ</h1>
        <p className="text-stone-500 text-sm font-light leading-relaxed">
          Curating responsible, bespoke luxury African travel since 2018. Based locally in Nairobi, active throughout East and Southern Africa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1C2421] mb-4">Who We Are</h2>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light mb-4 font-sans">
            KAGZ is an independent, premium travel design firm headquartered in Nairobi. Our primary driving goal is to connect travelers with Africa's majestic habitats in an honest, slow-paced, and highly respectful manner.
          </p>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light font-sans">
            We are staffed by former field biologists, professional wilderness guides, and seasoned travel designers who hold deep relationships with private conservancy landowners and community chiefs.
          </p>
        </div>
        <div className="relative h-64 overflow-hidden border border-[#EADCC9]/30">
          <img 
            src={culturePhoto || undefined} 
            alt="Maasai elders"
            onError={onImageError}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="p-8 bg-white border border-[#EADCC9]/30 space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#1C2421]">Our Mission</h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
            To provide high-end travelers with bespoke African itineraries that generate genuine conservation funding, respect local heritage, support fair land-leases for Maasai communities, and protect critical migration pathways.
          </p>
        </div>
        <div className="p-8 bg-white border border-[#EADCC9]/30 space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#1C2421]">Our Vision</h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
            To foster a luxurious travel ecosystem where tourism serves as a direct, active catalyst for wilderness protection, preserving East and Southern Africa's raw beauty for generations to come.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-[#EADCC9]/30">
        <h3 className="font-serif text-2xl font-bold text-[#1C2421] text-center">Our Core Approach</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left text-stone-600">
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-[#1C2421]">1. Authenticity First</h4>
            <p className="text-xs leading-relaxed font-light">
              We never fabricate cultural ceremonies or run commercial tourist caravans. We direct you to real, living experiences.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-[#1C2421]">2. Complete Integration</h4>
            <p className="text-xs leading-relaxed font-light">
              From local flight transfers to dynamic border clearances, we plan every single step seamlessly.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-[#1C2421]">3. Sustainable Pacing</h4>
            <p className="text-xs leading-relaxed font-light">
              We believe a proper safari is about observation, waiting, and presence—not rushing across multiple reserves in a day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: TRAVEL GUIDE (BLOG DIRECTORY)
   ============================================================================ */
interface GuideViewProps {
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  blogs: Article[];
}

function GuideView({ onNavigate, onImageError, blogs }: GuideViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const categories = ['All', 'Travel Tips', 'Safari'];

  const filteredArticles = blogs.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'All' || art.category === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
      <div className="text-center mb-12">
        <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-sans">Safari Wisdom</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C2421] mb-4">Travel Guide</h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Curated advice, savanna packing guides, regional season reviews, and wildlife logs written directly by our safari directors.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-[#EADCC9]/30 pb-8">
        <div className="flex gap-2 w-full md:w-auto font-sans">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded-full cursor-pointer ${
                filterCat === cat
                  ? 'bg-[#C5A880] text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-[#FAF7F2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 font-sans">
          <input
            type="text"
            placeholder="Search travel guide..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900 placeholder-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Guide Article Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((post) => (
            <div 
              key={post.id}
              className="bg-white border border-[#EADCC9]/30 flex flex-col h-full hover:shadow-lg transition-shadow"
            >
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500 mb-3 font-sans">
                    <span className="font-bold text-[#C5A880] uppercase tracking-wider">{post.category}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.date}</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#1C2421] mb-3 leading-snug line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-stone-600 text-xs leading-relaxed mb-6 font-light line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(`#/guide/${post.id}`)}
                  className="text-xs font-bold text-[#C5A880] uppercase tracking-wider text-left hover:text-[#1C2421] transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Article</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-400 text-sm italic">
          No articles matched your filter or search keywords. Please try another search term.
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: SINGLE BLOG ARTICLE READER
   ============================================================================ */
interface BlogDetailViewProps {
  id: string;
  onNavigate: (hash: string) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  blogs: Article[];
  destinations: Destination[];
}

function BlogDetailView({ id, onNavigate, onImageError, blogs, destinations }: BlogDetailViewProps) {
  const article = blogs.find(b => b.id === id) || blogs[0];
  if (!article) {
    return (
      <div className="py-24 text-center select-none font-sans bg-[#FAF7F2]">
        <div className="max-w-md mx-auto px-4">
          <p className="text-stone-600 font-serif text-lg mb-4">Article Not Found</p>
          <button onClick={() => onNavigate('#/guide')} className="text-xs uppercase tracking-widest font-bold text-[#C5A880] hover:underline">
            Back to Travel Guide
          </button>
        </div>
      </div>
    );
  }
  const relatedList = blogs.filter(b => article.related && article.related.includes(b.id));

  const blogFeaturedPhoto = destinations.find(d => d.id === 'kenya')?.image || undefined;

  return (
    <article className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 fade-in select-text">
      {/* Breadcrumbs */}
      <nav className="flex gap-2 items-center text-xs text-stone-500 mb-6 select-none font-sans" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('#/')} className="hover:text-[#C5A880]">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('#/guide')} className="hover:text-[#C5A880]">Travel Guide</button>
        <span>/</span>
        <span className="text-stone-800 font-medium truncate max-w-xs">{article.title}</span>
      </nav>

      <div className="space-y-4">
        <span className="text-xs font-bold text-[#C5A880] uppercase tracking-widest font-sans">{article.category}</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C2421] leading-[1.15]">{article.title}</h1>
        
        <div className="flex items-center gap-4 text-xs text-stone-500 border-b border-[#EADCC9]/30 pb-6 select-none font-sans">
          <span>By {article.author}</span>
          <span aria-hidden="true">&middot;</span>
          <span>Published {article.date}</span>
        </div>
      </div>

      {/* Featured visual */}
      <div className="my-8 relative h-64 sm:h-[450px] overflow-hidden border border-stone-100 select-none">
        <img 
          src={blogFeaturedPhoto || undefined} 
          alt={article.title}
          onError={onImageError}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Core text content */}
      <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed text-sm sm:text-base font-light whitespace-pre-line space-y-6">
        {article.content}
      </div>

      {/* Social shares */}
      <div className="flex justify-between items-center border-t border-[#EADCC9]/30 mt-12 pt-6 select-none text-xs text-stone-500 font-sans">
        <div className="flex gap-4">
          <button className="hover:text-[#C5A880] cursor-pointer inline-flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button className="hover:text-rose-600 cursor-pointer inline-flex items-center gap-1">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Like</span>
          </button>
        </div>
        <span>Article ID: {article.id}</span>
      </div>

      {/* Related Article Cards */}
      {relatedList.length > 0 && (
        <div className="border-t border-[#EADCC9]/30 mt-12 pt-8 select-none">
          <h3 className="font-serif text-xl font-bold text-[#1C2421] mb-6">Related Reading</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedList.map((art) => (
              <div 
                key={art.id}
                onClick={() => onNavigate(`#/guide/${art.id}`)}
                className="p-5 bg-white border border-stone-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#C5A880] tracking-wider font-sans">{art.category}</span>
                  <h4 className="font-serif text-base font-bold text-[#1C2421] mt-1 mb-2 leading-snug line-clamp-2">{art.title}</h4>
                </div>
                <span className="text-xs text-[#C5A880] font-bold mt-4 block uppercase tracking-wider font-sans font-sans">Read Post &rarr;</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

/* ============================================================================
   VIEW COMPONENT: GALLERY PAGE (FULL SCREEN MASONRY GRID)
   ============================================================================ */
interface GalleryPageViewProps {
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  setLightboxImage: (img: { src: string; alt: string } | null) => void;
  gallery: GalleryItem[];
}

function GalleryPageView({ onImageError, setLightboxImage, gallery }: GalleryPageViewProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Wildlife', 'Landscapes', 'Culture', 'Beaches', 'Adventure'];

  const filteredItems = gallery.filter(img => {
    if (activeFilter === 'All') return true;
    return img.category === activeFilter;
  });

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in select-none">
      <div className="text-center mb-12">
        <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-sans">Raw Splendor</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C2421] mb-4">The KAGZ Gallery</h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Wander through high-definition scenes representing true wilderness behavior, stunning geological peaks, and Swahili coastlines.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-[#EADCC9]/30 pb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-full cursor-pointer ${
              activeFilter === f
                ? 'bg-[#C5A880] text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-[#FAF7F2]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Masonry Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {filteredItems.map((img) => (
          <div 
            key={img.id}
            onClick={() => setLightboxImage({ src: img.src, alt: img.alt })}
            className="break-inside-avoid relative overflow-hidden border border-stone-200 cursor-pointer group"
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
              <p className="text-white font-serif text-sm italic">{img.alt}</p>
              <span className="text-[#C5A880] text-[9px] uppercase tracking-wider mt-1">{img.category}</span>
            </div>
            <img 
              src={img.src || undefined} 
              alt={img.alt}
              onError={onImageError}
              className="w-full h-auto object-cover transform scale-100 group-hover:scale-102 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: CONTACT PAGE
   ============================================================================ */
interface ContactViewProps {
  setPlanSuccessData: (data: any) => void;
  planSuccessData: any | null;
}

function ContactView({ setPlanSuccessData, planSuccessData }: ContactViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [destination, setDestination] = useState('Kenya');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [style, setStyle] = useState('Classic Luxury Safari');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setPlanSuccessData({
        name,
        email,
        phone,
        country,
        destination,
        travelDate,
        travelers,
        style,
        message
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setPlanSuccessData(null);
    setName('');
    setEmail('');
    setPhone('');
    setCountry('');
    setTravelDate('');
    setMessage('');
  };

  if (planSuccessData) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EnquirySuccess formData={planSuccessData} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in select-text">
      <div className="text-center mb-12">
        <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-sans">Concierge Direct</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C2421] mb-4">Contact KAGZ</h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Reach our dedicated travel directors directly or submit an interactive safari design request below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Contact info cards */}
        <div className="space-y-6 lg:col-span-1 select-none font-sans">
          <div className="p-6 bg-white border border-stone-100 space-y-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#1C2421] border-b border-stone-100 pb-2">Direct Reach</h3>
            
            <div className="space-y-4 text-xs text-stone-600">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-[#C5A880] shrink-0" />
                <div>
                  <p className="font-bold text-stone-850">Nairobi Headquarters</p>
                  <p className="font-light mt-0.5">Luxury District Office, Karen Estate, Nairobi, Kenya</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Compass className="w-5 h-5 text-[#C5A880] shrink-0" />
                <div>
                  <p className="font-bold text-stone-850">WhatsApp Concierge</p>
                  <p className="font-light mt-0.5">+254 700 000000</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <MessageSquare className="w-5 h-5 text-[#C5A880] shrink-0" />
                <div>
                  <p className="font-bold text-stone-850">Direct Email</p>
                  <p className="font-light mt-0.5">concierge@kagztravel.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#1C2421] text-white space-y-3 border border-white/10 shadow-sm">
            <h4 className="font-serif text-[#C5A880] text-lg font-bold">24/7 Guest Assistance</h4>
            <p className="text-stone-300 text-xs font-light leading-relaxed">
              For active travelers currently on safari, our VIP ground liaison concierge remains reachable 24 hours a day on our priority landline. Refer to your physical travel pouch for details.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 border border-[#EADCC9]/30 shadow-sm font-sans">
          <h3 className="font-serif text-2xl font-bold text-[#1C2421] mb-6">Send An Enquiry</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6 text-xs text-stone-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="con-name" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Full Name</label>
                <input 
                  id="con-name"
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="con-email" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Email Address</label>
                <input 
                  id="con-email"
                  type="email" 
                  required
                  placeholder="e.g. email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="con-phone" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Phone Number</label>
                <input 
                  id="con-phone"
                  type="tel" 
                  placeholder="+1 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="con-country" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Country of Residence</label>
                <input 
                  id="con-country"
                  type="text" 
                  placeholder="e.g. United Kingdom"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label htmlFor="con-dest" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Target Destination</label>
                <select 
                  id="con-dest"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900 cursor-pointer"
                >
                  <option value="Kenya">Kenya Safaris</option>
                  <option value="Tanzania">Tanzania Plains</option>
                  <option value="Zanzibar">Zanzibar Shores</option>
                  <option value="Uganda">Uganda Forests</option>
                  <option value="Rwanda">Rwanda Retreats</option>
                  <option value="South Africa">South Africa Winelands</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="con-date" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Preferred Travel Date</label>
                <input 
                  id="con-date"
                  type="text" 
                  placeholder="e.g. September 2026"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="con-travelers" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Travelers Count</label>
                <select 
                  id="con-travelers"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900 cursor-pointer"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="con-msg" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Tell Us About Your Ideal Trip</label>
              <textarea 
                id="con-msg"
                rows={5}
                required
                placeholder="Preferred animal encounters, physical styles, luxury preferences, specific travel concerns..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] placeholder-stone-400 rounded-none text-xs text-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#C5A880] hover:bg-[#1C2421] text-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow-md rounded-full cursor-pointer"
            >
              Send Enquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW COMPONENT: PLAN YOUR TRIP PAGE (STRUCTURED MULTI-STEP ENQUIRY)
   ============================================================================ */
interface PlanViewProps {
  setPlanSuccessData: (data: any) => void;
  planSuccessData: any | null;
}

function PlanView({ setPlanSuccessData, planSuccessData }: PlanViewProps) {
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [destination, setDestination] = useState('Kenya');
  const [travelDate, setTravelDate] = useState('');
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [style, setStyle] = useState('Classic Luxury');
  const [experience, setExperience] = useState('Wildlife & Safari');
  const [message, setMessage] = useState('');

  const handleNext = () => {
    if (step === 1 && (!name || !email || !phone)) {
      alert('Please fill in your primary contact information.');
      return;
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setPlanSuccessData({
        name,
        email,
        phone,
        country,
        destination,
        travelDate,
        travelers: Number(adults) + Number(children),
        style,
        message: `Style: ${style}. Preference: ${experience}. Notes: ${message}`
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setPlanSuccessData(null);
    setStep(1);
    setName('');
    setEmail('');
    setPhone('');
    setCountry('');
    setTravelDate('');
    setMessage('');
  };

  if (planSuccessData) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EnquirySuccess formData={planSuccessData} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 fade-in select-text">
      <div className="text-center mb-12">
        <p className="text-[#C5A880] text-xs font-bold uppercase tracking-[0.2em] mb-2 font-sans">Safari Architect</p>
        <h1 className="font-serif text-4xl font-bold text-[#1C2421] mb-4">Let's Plan Your Journey</h1>
        <p className="text-stone-500 text-sm font-light leading-relaxed">
          Follow our 3-step travel planner to share your preferences. Our local travel architects will draft a fully customized itinerary.
        </p>
      </div>

      {/* Progress Line */}
      <div className="flex items-center justify-between mb-12 relative px-4 select-none font-sans">
        <div className="absolute left-10 right-10 top-1/2 h-0.5 bg-[#EADCC9] -translate-y-1/2 -z-10" />
        {[
          { num: 1, label: 'Contact' },
          { num: 2, label: 'Destination' },
          { num: 3, label: 'Preferences' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-colors duration-300 ${
              step >= s.num
                ? 'bg-[#C5A880] border-[#C5A880] text-stone-900'
                : 'bg-white border-stone-200 text-[#1C2421]'
            }`}>
              {step > s.num ? <Check className="w-4 h-4 text-stone-900" /> : s.num}
            </div>
            <span className="text-[10px] uppercase font-bold text-stone-500 mt-2">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Interactive planner card */}
      <div className="bg-white p-8 border border-[#EADCC9]/40 shadow-sm font-sans">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs text-stone-800">
          
          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6 fade-in">
              <h3 className="font-serif text-xl font-bold text-[#1C2421] border-b border-stone-100 pb-2">1. Personal Information</h3>
              
              <div className="space-y-1">
                <label htmlFor="plan-name" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Your Full Name *</label>
                <input 
                  id="plan-name"
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="plan-email" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Email Address *</label>
                  <input 
                    id="plan-email"
                    type="email" 
                    required
                    placeholder="e.g. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="plan-phone" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">WhatsApp / Phone *</label>
                  <input 
                    id="plan-phone"
                    type="tel" 
                    required
                    placeholder="e.g. +1 555 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="plan-country" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Country of Residence</label>
                <input 
                  id="plan-country"
                  type="text" 
                  placeholder="e.g. United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Travel Details */}
          {step === 2 && (
            <div className="space-y-6 fade-in">
              <h3 className="font-serif text-xl font-bold text-[#1C2421] border-b border-stone-100 pb-2">2. Destination & Dates</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="plan-dest" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">Where would you like to go?</label>
                  <select 
                    id="plan-dest"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900 cursor-pointer"
                  >
                    <option value="Kenya">Kenya Safaris</option>
                    <option value="Tanzania">Tanzania Endless Plains</option>
                    <option value="Zanzibar">Zanzibar Island</option>
                    <option value="Uganda">Uganda Rainforests</option>
                    <option value="Rwanda">Rwanda Primate Hills</option>
                    <option value="South Africa">South Africa Vineyard & Safari</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="plan-date" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Target Month / Date</label>
                  <input 
                    id="plan-date"
                    type="text" 
                    placeholder="e.g. September 2026"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="plan-adults" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Number of Adults (12+ yrs)</label>
                  <select 
                    id="plan-adults"
                    value={adults}
                    onChange={(e) => setAdults(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900 cursor-pointer"
                  >
                    <option value="1">1 Adult</option>
                    <option value="2">2 Adults</option>
                    <option value="3">3 Adults</option>
                    <option value="4">4 Adults</option>
                    <option value="5">5+ Adults</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="plan-children" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Number of Children (0-11 yrs)</label>
                  <select 
                    id="plan-children"
                    value={children}
                    onChange={(e) => setChildren(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900 cursor-pointer"
                  >
                    <option value="0">No Children</option>
                    <option value="1">1 Child</option>
                    <option value="2">2 Children</option>
                    <option value="3">3+ Children</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Travel Styles */}
          {step === 3 && (
            <div className="space-y-6 fade-in">
              <h3 className="font-serif text-xl font-bold text-[#1C2421] border-b border-stone-100 pb-2">3. Preferred Styles</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="plan-style" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Preferred Travel Style</label>
                  <select 
                    id="plan-style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900 cursor-pointer"
                  >
                    <option value="Classic Luxury Tented">Classic Luxury Tented Camp</option>
                    <option value="Exclusive Boutique Lodge">Exclusive Private Lodge</option>
                    <option value="Active Adventure Trek">Active Adventure Trekking</option>
                    <option value="Relaxed Honeymoon Escape">Intimate Honeymoon Escape</option>
                    <option value="Slow Paced Multigenerational">Multigenerational Family Slow-Pace</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="plan-exp" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Preferred Experience Category</label>
                  <select 
                    id="plan-exp"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900 cursor-pointer"
                  >
                    <option value="Wildlife & Big Cats">Wildlife Tracking & Big Cats</option>
                    <option value="Primate Trekking">Mountain Gorilla & Primate Trekking</option>
                    <option value="Beach & Sea Escape">Coastal Sailing & Beach Escape</option>
                    <option value="Vibrant Swahili Culture">Living Swahili & Maasai Culture</option>
                    <option value="High Altitude Climbing">High Altitude Mountain Climbing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="plan-msg" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Tell Us About Your Ideal Trip</label>
                <textarea 
                  id="plan-msg"
                  rows={4}
                  required
                  placeholder="e.g. I want to see elephant herds with Kilimanjaro background, I prefer organic garden food, I prefer slow paces with zero rush..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 px-3 py-2.5 focus:outline-none focus:border-[#C5A880] rounded-none text-xs text-stone-900"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-t border-[#EBF4F6] pt-6 select-none font-sans">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-2.5 border border-[#1C2421] text-[#1C2421] hover:bg-[#FAF7F2] font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#1C2421] text-white hover:bg-[#C5A880] font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider shadow-sm rounded-full cursor-pointer"
              >
                Send My Enquiry
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}

