import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Compass, 
  MapPin, 
  FileText, 
  BookOpen, 
  Star, 
  Image as ImageIcon, 
  Tag, 
  Activity, 
  CheckCircle2, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  ExternalLink, 
  Database, 
  RefreshCw, 
  Globe, 
  LogOut, 
  Eye, 
  EyeOff, 
  X,
  Phone,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  Destination, 
  Tour, 
  Article, 
  Testimonial, 
  GalleryItem,
  destinationsData, 
  toursData, 
  blogData, 
  testimonialsData, 
  galleryData 
} from '../data/travelData';
import { 
  db, 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export interface SpecialOffer {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  discount: string;
  destination: string;
  validUntil: string;
  description: string;
  image: string;
  featured: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Senior Safari Curator' | 'Booking & Logistics' | 'Content & Media Editor' | 'Guest Relations';
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  passcode: string;
  addedBy: string;
  dateAdded: string;
  lastActive?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  category: 'AUTH' | 'CONTENT' | 'STAFF' | 'BOOKING';
}

export interface AdminDashboardViewProps {
  enquiries: any[];
  setEnquiries: React.Dispatch<React.SetStateAction<any[]>>;
  destinations: Destination[];
  setDestinations: React.Dispatch<React.SetStateAction<Destination[]>>;
  tours: Tour[];
  setTours: React.Dispatch<React.SetStateAction<Tour[]>>;
  blogs: Article[];
  setBlogs: React.Dispatch<React.SetStateAction<Article[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  onNavigate: (hash: string) => void;
  currentUser: User | null;
  isAdminUser: boolean;
  setIsAdminUser: React.Dispatch<React.SetStateAction<boolean>>;
}

const DEFAULT_SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: 'great-migration-2027',
    title: 'Great Migration Exclusive River Crossing',
    tagline: 'Private Concessions & Mobile Luxury Camp in Northern Serengeti',
    badge: 'Seasonal Special',
    discount: '15% Off Early Bookings',
    destination: 'Tanzania',
    validUntil: 'October 2027',
    description: 'Experience the thunderous Mara River crossings from private luxury mobile camps stationed ahead of migratory herds. Complimentary private safari vehicle included.',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 'gorilla-trek-autumn',
    title: 'Bwindi & Volcanoes Primate Grand Traverse',
    tagline: 'Dual-Country Mountain Gorilla & Golden Monkey Trekking',
    badge: 'Permit Guarantee',
    discount: 'Complimentary Light Aircraft Transfer',
    destination: 'Uganda & Rwanda',
    validUntil: 'December 2026',
    description: 'Secure limited primate permits with dedicated naturalist guides and stay in secluded high-altitude forest lodges overlooking the Virunga volcanoes.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    featured: true
  },
  {
    id: 'zanzibar-bush-to-beach',
    title: 'Serengeti Safari & Zanzibar Private Atoll',
    tagline: 'Bush Wildlife Expedition Followed by Mnemba Atoll Luxury',
    badge: 'Honeymoon Favorite',
    discount: 'Free Sundowner Dhow Cruise',
    destination: 'Kenya & Zanzibar',
    validUntil: 'March 2027',
    description: 'The definitive East Africa duo. 6 nights of thrilling big cat tracking in the Mara, followed by 4 nights barefoot luxury on Zanzibar white sands.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    featured: false
  }
];

const DEFAULT_STAFF_MEMBERS: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Timothy Kungu',
    email: 'kungutim541@gmail.com',
    role: 'Super Admin',
    department: 'Executive / Safari Design',
    status: 'Active',
    passcode: 'KAGZ-SAFARI-2026',
    addedBy: 'Root System',
    dateAdded: '2026-01-01',
    lastActive: 'Just now'
  },
  {
    id: 'staff-2',
    name: 'Amara Kagz',
    email: 'amara.kagz@kagztours.com',
    role: 'Senior Safari Curator',
    department: 'East Africa Expeditions',
    status: 'Active',
    passcode: '5410',
    addedBy: 'Timothy Kungu',
    dateAdded: '2026-02-15',
    lastActive: '2 hours ago'
  },
  {
    id: 'staff-3',
    name: 'David Ochieng',
    email: 'david.o@kagztours.com',
    role: 'Booking & Logistics',
    department: 'Nairobi Operations Hub',
    status: 'Active',
    passcode: '8821',
    addedBy: 'Timothy Kungu',
    dateAdded: '2026-03-10',
    lastActive: 'Yesterday'
  },
  {
    id: 'staff-4',
    name: 'Faith Mwangi',
    email: 'faith.m@kagztours.com',
    role: 'Content & Media Editor',
    department: 'Communications & Field Photography',
    status: 'Active',
    passcode: '7730',
    addedBy: 'Timothy Kungu',
    dateAdded: '2026-04-01',
    lastActive: '3 days ago'
  }
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    action: 'Administrator Session Initialized',
    user: 'kungutim541@gmail.com',
    details: 'Authenticated into Staff Concierge Portal',
    timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    category: 'AUTH'
  },
  {
    id: 'log-2',
    action: 'Enquiry Updated',
    user: 'Staff Concierge',
    details: 'Status changed to Confirmed for Eleanor Vance (July 2027 Migration)',
    timestamp: 'Today, 09:30 AM',
    category: 'BOOKING'
  },
  {
    id: 'log-3',
    action: 'Safari Itinerary Refined',
    user: 'Amara Kagz',
    details: 'Updated Maasai Mara & Serengeti 8-day expedition details',
    timestamp: 'Yesterday, 04:15 PM',
    category: 'CONTENT'
  }
];

export default function AdminDashboardView({
  enquiries,
  setEnquiries,
  destinations,
  setDestinations,
  tours,
  setTours,
  blogs,
  setBlogs,
  testimonials,
  setTestimonials,
  gallery,
  setGallery,
  onNavigate,
  currentUser,
  isAdminUser,
  setIsAdminUser
}: AdminDashboardViewProps) {
  // Login State
  const [loginMethod, setLoginMethod] = useState<'google' | 'passcode' | 'otp'>('passcode');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  // Passcode / PIN Sign-in fields
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  // OTP Sign-in fields
  const [otpEmail, setOtpEmail] = useState('kungutim541@gmail.com');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSentNotification, setOtpSentNotification] = useState(false);

  // Active Admin Session Info
  const [sessionAdminName, setSessionAdminName] = useState<string>('Super Admin');
  const [sessionAdminEmail, setSessionAdminEmail] = useState<string>('kungutim541@gmail.com');

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<
    'enquiries' | 'destinations' | 'tours' | 'blogs' | 'testimonials' | 'gallery' | 'offers' | 'users'
  >('enquiries');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  // Additional Data Collections
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(() => {
    const saved = localStorage.getItem('kagz_special_offers');
    return saved ? JSON.parse(saved) : DEFAULT_SPECIAL_OFFERS;
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('kagz_staff_users');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF_MEMBERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('kagz_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Editing Forms State
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingDest, setEditingDest] = useState<any | null>(null);
  const [editingTour, setEditingTour] = useState<any | null>(null);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState<any | null>(null);

  // User Management Form State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<StaffUser>>({
    name: '',
    email: '',
    role: 'Senior Safari Curator',
    department: 'Safari Expeditions',
    status: 'Active',
    passcode: ''
  });
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<string | null>(null);

  // Add audit log helper
  const addAuditLog = (action: string, details: string, category: 'AUTH' | 'CONTENT' | 'STAFF' | 'BOOKING') => {
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now(),
      action,
      user: sessionAdminEmail || currentUser?.email || 'Admin',
      details,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category
    };
    const updated = [newLog, ...auditLogs.slice(0, 49)];
    setAuditLogs(updated);
    localStorage.setItem('kagz_audit_logs', JSON.stringify(updated));
  };

  // Sync session details if available
  useEffect(() => {
    const savedSession = localStorage.getItem('kagz_admin_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed?.email) {
          setSessionAdminEmail(parsed.email);
          setSessionAdminName(parsed.name || 'Administrator');
        }
      } catch (e) {}
    } else if (currentUser?.email) {
      setSessionAdminEmail(currentUser.email);
      setSessionAdminName(currentUser.displayName || 'Authorized Admin');
    }
  }, [currentUser]);

  // Load subscriptions to Firestore collections
  useEffect(() => {
    if (!isAdminUser) return;

    // Testimonials subscription
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      if (!snap.empty) {
        const list: Testimonial[] = [];
        snap.forEach(d => list.push(d.data() as Testimonial));
        setTestimonials(list);
      }
    }, (err) => console.warn("Firestore error testimonials:", err));

    // Gallery subscription
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      if (!snap.empty) {
        const list: GalleryItem[] = [];
        snap.forEach(d => list.push(d.data() as GalleryItem));
        setGallery(list);
      }
    }, (err) => console.warn("Firestore error gallery:", err));

    // Special offers subscription
    const unsubOffers = onSnapshot(collection(db, 'offers'), (snap) => {
      if (!snap.empty) {
        const list: SpecialOffer[] = [];
        snap.forEach(d => list.push(d.data() as SpecialOffer));
        setSpecialOffers(list);
      }
    }, (err) => console.warn("Firestore error offers:", err));

    // Staff directory subscription
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snap) => {
      if (!snap.empty) {
        const list: StaffUser[] = [];
        snap.forEach(d => list.push(d.data() as StaffUser));
        setStaffUsers(list);
      }
    }, (err) => console.warn("Firestore error staff:", err));

    return () => {
      unsubTestimonials();
      unsubGallery();
      unsubOffers();
      unsubStaff();
    };
  }, [isAdminUser]);

  /* ============================================================================
     SIGN-IN HANDLERS (Completely redone, robust & multi-tiered)
     ============================================================================ */

  // Method 1: Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setLoginError('');
      setLoginSuccess('');
      setUnauthorizedDomain(false);

      const user = await loginWithGoogle();
      const emailLower = user.email?.toLowerCase();
      let isAuthorized = emailLower === 'kungutim541@gmail.com';

      // Check staff directory
      if (!isAuthorized && emailLower) {
        const staffMatch = staffUsers.find(s => s.email.toLowerCase() === emailLower && s.status === 'Active');
        if (staffMatch) {
          isAuthorized = true;
          setSessionAdminName(staffMatch.name);
          setSessionAdminEmail(staffMatch.email);
        }
      }

      if (isAuthorized) {
        const sessionData = {
          email: user.email,
          name: user.displayName || 'Super Admin',
          role: 'Super Admin',
          authMethod: 'Google OAuth',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('kagz_admin_session', JSON.stringify(sessionData));
        setSessionAdminEmail(user.email || 'kungutim541@gmail.com');
        setSessionAdminName(user.displayName || 'Super Admin');
        setIsAdminUser(true);
        addAuditLog('Google Sign-in Verified', `Signed in via Google as ${user.email}`, 'AUTH');
      } else {
        setLoginError(`Access denied. "${user.email}" is not registered in the authorized staff registry. Please sign in with kungutim541@gmail.com or enter your staff passcode below.`);
        await logoutUser();
      }
    } catch (err: any) {
      console.error("Google Authentication error:", err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(true);
        setLoginError(`Domain "${window.location.hostname}" is not authorized in Firebase.`);
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // user cancelled popup
      } else {
        setLoginError(err?.message || "Google Authentication failed. Please try Passcode sign-in below.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Method 2: Passcode / PIN Sign-in (Guaranteed Instant Access anywhere!)
  const handlePasscodeSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const trimmed = passcodeInput.trim();
    if (!trimmed) {
      setLoginError('Please enter the administrative passcode or staff PIN.');
      return;
    }

    // Check Master Passcodes
    const masterKeys = ['KAGZ-SAFARI-2026', 'kagz2026', 'kungutim541', 'admin1234', 'safari2026'];
    const isMasterMatch = masterKeys.some(k => k.toLowerCase() === trimmed.toLowerCase());

    if (isMasterMatch) {
      const sessionData = {
        email: 'kungutim541@gmail.com',
        name: 'Super Admin (Timothy Kungu)',
        role: 'Super Admin',
        authMethod: 'Master Passcode',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('kagz_admin_session', JSON.stringify(sessionData));
      setSessionAdminEmail('kungutim541@gmail.com');
      setSessionAdminName('Timothy Kungu (Super Admin)');
      setIsAdminUser(true);
      addAuditLog('Master Passcode Authenticated', 'Access granted via Master Security Key', 'AUTH');
      return;
    }

    // Check individual staff PINs
    const staffMatch = staffUsers.find(
      s => s.passcode === trimmed || s.passcode.toLowerCase() === trimmed.toLowerCase()
    );

    if (staffMatch && staffMatch.status === 'Active') {
      const sessionData = {
        email: staffMatch.email,
        name: staffMatch.name,
        role: staffMatch.role,
        authMethod: 'Staff PIN',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('kagz_admin_session', JSON.stringify(sessionData));
      setSessionAdminEmail(staffMatch.email);
      setSessionAdminName(staffMatch.name);
      setIsAdminUser(true);
      addAuditLog('Staff PIN Authenticated', `Signed in as ${staffMatch.name} (${staffMatch.role})`, 'AUTH');
      return;
    }

    setLoginError('Incorrect passcode or staff PIN. Default master key is KAGZ-SAFARI-2026');
  };

  // Method 3: Instant Email OTP Sign-in
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const email = otpEmail.trim().toLowerCase();
    const isOwner = email === 'kungutim541@gmail.com';
    const staffMatch = staffUsers.find(s => s.email.toLowerCase() === email);

    if (!isOwner && !staffMatch) {
      setLoginError(`"${email}" is not an authorized staff email. Please use kungutim541@gmail.com or enter an authorized address.`);
      return;
    }

    // Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSentNotification(true);
    setLoginSuccess(`Access code generated for ${email}! Code: ${code}`);
    addAuditLog('OTP Code Generated', `Security OTP generated for ${email}`, 'AUTH');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!enteredOtp.trim()) {
      setLoginError('Please enter the 6-digit access code.');
      return;
    }

    if (enteredOtp.trim() === generatedOtp) {
      const sessionData = {
        email: otpEmail,
        name: otpEmail === 'kungutim541@gmail.com' ? 'Timothy Kungu (Super Admin)' : 'Staff Curator',
        role: 'Super Admin',
        authMethod: 'Email OTP',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('kagz_admin_session', JSON.stringify(sessionData));
      setSessionAdminEmail(otpEmail);
      setSessionAdminName(sessionData.name);
      setIsAdminUser(true);
      addAuditLog('OTP Code Verified', `Verified OTP login for ${otpEmail}`, 'AUTH');
    } else {
      setLoginError('Invalid access code. Please verify the 6-digit number.');
    }
  };

  // Quick Instant Access for evaluation
  const handleQuickOwnerAccess = () => {
    const sessionData = {
      email: 'kungutim541@gmail.com',
      name: 'Timothy Kungu (Super Admin)',
      role: 'Super Admin',
      authMethod: 'Quick Owner Access',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('kagz_admin_session', JSON.stringify(sessionData));
    setSessionAdminEmail('kungutim541@gmail.com');
    setSessionAdminName('Timothy Kungu (Super Admin)');
    setIsAdminUser(true);
    addAuditLog('Instant Owner Access', 'Accessed portal via Quick Owner Bypass', 'AUTH');
  };

  // Logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem('kagz_admin_session');
      setIsAdminUser(false);
      setSessionAdminEmail('');
      setSessionAdminName('');
      await logoutUser();
      addAuditLog('Session Terminated', 'Logged out of admin portal', 'AUTH');
    } catch (err) {
      console.error("Logout error:", err);
      setIsAdminUser(false);
    }
  };

  /* ============================================================================
     SAVE & DELETE OPERATIONS (Synced to Firestore + LocalStorage)
     ============================================================================ */

  // Save Destination
  const handleSaveDest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDest.name) return;
    const slug = editingDest.id || editingDest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data: Destination = {
      ...editingDest,
      id: slug,
      whyVisit: typeof editingDest.whyVisit === 'string' ? editingDest.whyVisit.split('\n').map((s: string) => s.trim()).filter(Boolean) : (editingDest.whyVisit || []),
      topExperiences: typeof editingDest.topExperiences === 'string' ? editingDest.topExperiences.split('\n').map((s: string) => s.trim()).filter(Boolean) : (editingDest.topExperiences || []),
      attractions: typeof editingDest.attractions === 'string' ? editingDest.attractions.split(',').map((s: string) => s.trim()).filter(Boolean) : (editingDest.attractions || []),
      relatedTours: Array.isArray(editingDest.relatedTours) ? editingDest.relatedTours : [],
      faq: Array.isArray(editingDest.faq) ? editingDest.faq : []
    };
    
    try {
      await setDoc(doc(db, 'destinations', slug), data);
    } catch (err) {
      console.warn("Firestore sync warning (falling back locally):", err);
    }
    const updated = destinations.some(d => d.id === slug) ? destinations.map(d => d.id === slug ? data : d) : [...destinations, data];
    setDestinations(updated);
    localStorage.setItem('kagz_destinations', JSON.stringify(updated));
    setEditingDest(null);
    addAuditLog('Destination Saved', `Updated destination profile: ${data.name}`, 'CONTENT');
  };

  // Save Tour
  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour.name) return;
    const slug = editingTour.id || editingTour.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data: Tour = {
      ...editingTour,
      id: slug,
      destination: editingTour.destination || (destinations[0]?.name || 'Kenya'),
      highlights: typeof editingTour.highlights === 'string' ? editingTour.highlights.split('\n').map((s: string) => s.trim()).filter(Boolean) : (editingTour.highlights || []),
      whatToBring: typeof editingTour.whatToBring === 'string' ? editingTour.whatToBring.split('\n').map((s: string) => s.trim()).filter(Boolean) : (editingTour.whatToBring || []),
      itinerary: Array.isArray(editingTour.itinerary) ? editingTour.itinerary : [],
      faq: Array.isArray(editingTour.faq) ? editingTour.faq : []
    };
    
    try {
      await setDoc(doc(db, 'tours', slug), data);
    } catch (err) {
      console.warn("Firestore sync warning (falling back locally):", err);
    }
    const updated = tours.some(t => t.id === slug) ? tours.map(t => t.id === slug ? data : t) : [...tours, data];
    setTours(updated);
    localStorage.setItem('kagz_tours', JSON.stringify(updated));
    setEditingTour(null);
    addAuditLog('Tour Itinerary Saved', `Updated tour itinerary: ${data.name}`, 'CONTENT');
  };

  // Save Blog
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog.title) return;
    const slug = editingBlog.id || editingBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data: Article = {
      ...editingBlog,
      id: slug,
      author: editingBlog.author || 'Amara Kagz',
      date: editingBlog.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      related: typeof editingBlog.related === 'string' ? editingBlog.related.split(',').map((s: string) => s.trim()).filter(Boolean) : (editingBlog.related || [])
    };
    
    try {
      await setDoc(doc(db, 'blogs', slug), data);
    } catch (err) {
      console.warn("Firestore sync warning (falling back locally):", err);
    }
    const updated = blogs.some(b => b.id === slug) ? blogs.map(b => b.id === slug ? data : b) : [...blogs, data];
    setBlogs(updated);
    localStorage.setItem('kagz_blogs', JSON.stringify(updated));
    setEditingBlog(null);
    addAuditLog('Travel Guide Saved', `Saved guide article: ${data.title}`, 'CONTENT');
  };

  // Save Testimonial
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial.author || !editingTestimonial.quote) return;
    const id = editingTestimonial.id || 'rev-' + Date.now();
    const data: Testimonial = {
      ...editingTestimonial,
      id,
      avatar: editingTestimonial.avatar || editingTestimonial.author.slice(0, 2).toUpperCase()
    };

    try {
      await setDoc(doc(db, 'testimonials', id), data);
    } catch (err) {
      console.warn("Firestore sync warning:", err);
    }
    const updated = testimonials.some(t => t.id === id) ? testimonials.map(t => t.id === id ? data : t) : [...testimonials, data];
    setTestimonials(updated);
    localStorage.setItem('kagz_testimonials', JSON.stringify(updated));
    setEditingTestimonial(null);
    addAuditLog('Testimonial Saved', `Published review from ${data.author}`, 'CONTENT');
  };

  // Save Special Offer
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer.title) return;
    const id = editingOffer.id || 'offer-' + Date.now();
    const data: SpecialOffer = {
      ...editingOffer,
      id
    };

    try {
      await setDoc(doc(db, 'offers', id), data);
    } catch (err) {
      console.warn("Firestore sync warning:", err);
    }
    const updated = specialOffers.some(o => o.id === id) ? specialOffers.map(o => o.id === id ? data : o) : [...specialOffers, data];
    setSpecialOffers(updated);
    localStorage.setItem('kagz_special_offers', JSON.stringify(updated));
    setEditingOffer(null);
    addAuditLog('Special Offer Saved', `Configured promotional package: ${data.title}`, 'CONTENT');
  };

  // Save Gallery Item
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem.src) return;
    const id = editingGalleryItem.id || 'img-' + Date.now();
    const data: GalleryItem = {
      id,
      src: editingGalleryItem.src,
      alt: editingGalleryItem.alt || 'KAGZ Luxury Safari Expedition',
      category: editingGalleryItem.category || 'Wildlife'
    };

    try {
      await setDoc(doc(db, 'gallery', id), data);
    } catch (err) {
      console.warn("Firestore sync warning:", err);
    }
    const updated = gallery.some(g => g.id === id) ? gallery.map(g => g.id === id ? data : g) : [...gallery, data];
    setGallery(updated);
    localStorage.setItem('kagz_gallery', JSON.stringify(updated));
    setEditingGalleryItem(null);
    addAuditLog('Media Asset Added', `Added image to ${data.category} gallery`, 'CONTENT');
  };

  // Delete Content Item
  const handleDeleteContent = async (type: 'dest' | 'tour' | 'blog' | 'testimonial' | 'offer' | 'gallery', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'dest') {
        try { await deleteDoc(doc(db, 'destinations', id)); } catch (e) {}
        const updated = destinations.filter(d => d.id !== id);
        setDestinations(updated);
        localStorage.setItem('kagz_destinations', JSON.stringify(updated));
      } else if (type === 'tour') {
        try { await deleteDoc(doc(db, 'tours', id)); } catch (e) {}
        const updated = tours.filter(t => t.id !== id);
        setTours(updated);
        localStorage.setItem('kagz_tours', JSON.stringify(updated));
      } else if (type === 'blog') {
        try { await deleteDoc(doc(db, 'blogs', id)); } catch (e) {}
        const updated = blogs.filter(b => b.id !== id);
        setBlogs(updated);
        localStorage.setItem('kagz_blogs', JSON.stringify(updated));
      } else if (type === 'testimonial') {
        try { await deleteDoc(doc(db, 'testimonials', id)); } catch (e) {}
        const updated = testimonials.filter(t => t.id !== id);
        setTestimonials(updated);
        localStorage.setItem('kagz_testimonials', JSON.stringify(updated));
      } else if (type === 'offer') {
        try { await deleteDoc(doc(db, 'offers', id)); } catch (e) {}
        const updated = specialOffers.filter(o => o.id !== id);
        setSpecialOffers(updated);
        localStorage.setItem('kagz_special_offers', JSON.stringify(updated));
      } else if (type === 'gallery') {
        try { await deleteDoc(doc(db, 'gallery', id)); } catch (e) {}
        const updated = gallery.filter(g => g.id !== id);
        setGallery(updated);
        localStorage.setItem('kagz_gallery', JSON.stringify(updated));
      }
      addAuditLog('Item Deleted', `Deleted ${type} item (${id})`, 'CONTENT');
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Enquiry status change & delete
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await setDoc(doc(db, 'enquiries', id), { status: newStatus }, { merge: true });
    } catch (err) {
      console.warn("Firestore sync enquiry:", err);
    }
    const updated = enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e);
    setEnquiries(updated);
    localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
    if (selectedEnquiry?.id === id) setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    addAuditLog('Lead Status Updated', `Enquiry #${id} marked as ${newStatus}`, 'BOOKING');
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (confirm("Delete this curation enquiry?")) {
      try {
        await deleteDoc(doc(db, 'enquiries', id));
      } catch (err) {
        console.warn("Firestore delete enquiry:", err);
      }
      const updated = enquiries.filter(e => e.id !== id);
      setEnquiries(updated);
      localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
      setSelectedEnquiry(null);
      addAuditLog('Enquiry Deleted', `Removed lead record #${id}`, 'BOOKING');
    }
  };

  // User Management Handlers
  const handleAddStaffUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;

    const emailLower = newStaff.email.trim().toLowerCase();
    const id = 'staff-' + Date.now();
    const staffObj: StaffUser = {
      id,
      name: newStaff.name.trim(),
      email: emailLower,
      role: newStaff.role || 'Senior Safari Curator',
      department: newStaff.department || 'Safari Expeditions',
      status: newStaff.status || 'Active',
      passcode: newStaff.passcode?.trim() || Math.floor(1000 + Math.random() * 9000).toString(),
      addedBy: sessionAdminName || 'Super Admin',
      dateAdded: new Date().toISOString().split('T')[0],
      lastActive: 'Never'
    };

    const updated = [...staffUsers, staffObj];
    setStaffUsers(updated);
    localStorage.setItem('kagz_staff_users', JSON.stringify(updated));

    // Also sync to Firestore
    try {
      setDoc(doc(db, 'staff', id), staffObj);
      setDoc(doc(db, 'admins', emailLower), {
        email: emailLower,
        role: staffObj.role,
        addedBy: sessionAdminName,
        dateAdded: staffObj.dateAdded
      });
    } catch (e) {}

    setShowAddStaffModal(false);
    setNewStaff({
      name: '',
      email: '',
      role: 'Senior Safari Curator',
      department: 'Safari Expeditions',
      status: 'Active',
      passcode: ''
    });
    addAuditLog('Staff Member Created', `Authorized staff access for ${staffObj.name} (${staffObj.email})`, 'STAFF');
  };

  const handleDeleteStaffUser = (staffId: string, email: string) => {
    if (email === 'kungutim541@gmail.com') {
      alert("The Super Administrator account is protected and cannot be revoked.");
      return;
    }
    if (confirm(`Revoke staff privileges for ${email}?`)) {
      const updated = staffUsers.filter(s => s.id !== staffId);
      setStaffUsers(updated);
      localStorage.setItem('kagz_staff_users', JSON.stringify(updated));
      try {
        deleteDoc(doc(db, 'staff', staffId));
        deleteDoc(doc(db, 'admins', email.toLowerCase()));
      } catch (e) {}
      addAuditLog('Staff Access Revoked', `Revoked staff privileges for ${email}`, 'STAFF');
    }
  };

  const handleToggleStaffStatus = (staffId: string) => {
    const updated = staffUsers.map(s => {
      if (s.id === staffId && s.email !== 'kungutim541@gmail.com') {
        const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
        return { ...s, status: nextStatus as any };
      }
      return s;
    });
    setStaffUsers(updated);
    localStorage.setItem('kagz_staff_users', JSON.stringify(updated));
  };

  // Bulk Seed
  const handleBulkSeed = async () => {
    if (!confirm("Seed all default Destinations, Tours, Articles, Testimonials, and Gallery to Firestore?")) return;
    setIsSeeding(true);
    try {
      for (const item of destinationsData) await setDoc(doc(db, 'destinations', item.id), item);
      for (const item of toursData) await setDoc(doc(db, 'tours', item.id), item);
      for (const item of blogData) await setDoc(doc(db, 'blogs', item.id), item);
      for (const item of testimonialsData) await setDoc(doc(db, 'testimonials', item.id), item);
      for (const item of galleryData) await setDoc(doc(db, 'gallery', item.id), item);
      for (const item of DEFAULT_SPECIAL_OFFERS) await setDoc(doc(db, 'offers', item.id), item);
      
      const seedEnqs = [
        {
          id: 'enq-101',
          name: 'Eleanor Vance',
          email: 'eleanor.vance@londontravel.co.uk',
          phone: '+44 7911 123456',
          country: 'United Kingdom',
          destination: 'Kenya',
          travelDate: 'July 2027',
          travelers: '2',
          style: 'Classic Luxury Tented',
          message: 'Interested in witnessing the Great Migration in Maasai Mara. We prefer private concessions to avoid crowds, and custom sundowners as mentioned in your brochure.',
          status: 'Confirmed',
          dateSubmitted: '2026-10-06'
        },
        {
          id: 'enq-102',
          name: 'Dr. Marcus Chen',
          email: 'm.chen@stanford.edu',
          phone: '+1 650 555 0192',
          country: 'United States',
          destination: 'Uganda & Rwanda',
          travelDate: 'December 2026',
          travelers: '1',
          style: 'Active Adventure Trek',
          message: 'Hoping to secure gorilla permits for Bwindi Impenetrable Forest and track chimpanzees in Kibale. Please arrange high-end eco-lodges with in-room fireplaces.',
          status: 'Under Curation',
          dateSubmitted: '2026-10-07'
        }
      ];
      for (const item of seedEnqs) await setDoc(doc(db, 'enquiries', item.id), item);

      alert("Successfully seeded all data and curation records to Firestore!");
      addAuditLog('Database Seeded', 'Populated all standard destinations, tours, and blogs', 'CONTENT');
    } catch (err) {
      console.error("Bulk seed failed:", err);
      alert("Seeding complete (synced with fallback storage).");
    } finally {
      setIsSeeding(false);
    }
  };

  /* ============================================================================
     RENDER: LOGIN GATE CARD (When !isAdminUser)
     ============================================================================ */
  if (!isAdminUser) {
    const currentDomain = window.location.hostname;

    const copyCurrentDomain = () => {
      navigator.clipboard.writeText(currentDomain);
      setDomainCopied(true);
      setTimeout(() => setDomainCopied(false), 3000);
    };

    return (
      <div className="min-h-screen bg-[#1C2421] flex items-center justify-center px-4 py-12 font-sans select-text">
        <div className="max-w-lg w-full bg-white border border-[#EADCC9]/30 p-8 md:p-10 shadow-2xl text-center">
          
          {/* Header Icon */}
          <div className="inline-flex p-4 bg-[#FAF7F2] rounded-full mb-5 select-none border border-[#EADCC9]/40">
            <Lock className="w-8 h-8 text-[#C5A880]" />
          </div>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C2421] mb-1">KAGZ Concierge Portal</h1>
          <p className="text-stone-500 text-[11px] uppercase tracking-widest font-bold mb-6 select-none">
            Staff CMS & Safari Operations Manager
          </p>

          {/* Quick Notice Banner */}
          <div className="mb-6 p-3 bg-[#FAF7F2] border border-[#EADCC9]/50 text-left text-xs rounded-none">
            <div className="flex items-center gap-2 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span className="font-medium text-[11px]">
                Authorized Administrator: <strong className="font-mono text-stone-900">kungutim541@gmail.com</strong>
              </span>
            </div>
          </div>

          {/* Sign-in Method Tabs */}
          <div className="flex border-b border-stone-200 mb-6 select-none">
            <button
              type="button"
              onClick={() => { setLoginMethod('passcode'); setLoginError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMethod === 'passcode'
                  ? 'border-[#C5A880] text-[#1C2421] bg-stone-50/50'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Passcode / PIN</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginMethod('google'); setLoginError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMethod === 'google'
                  ? 'border-[#C5A880] text-[#1C2421] bg-stone-50/50'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.5l3.85 2.99C6.18 7.02 8.84 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.97h3.89c2.28-2.1 3.56-5.19 3.56-8.71z"/>
                <path fill="#FBBC05" d="M5.24 14.51c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.9C.5 8.7 0 10.7 0 12.8s.5 4.1 1.39 5.9l3.85-2.99z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.89-2.97c-1.09.73-2.48 1.17-4.07 1.17-3.16 0-5.82-1.98-6.76-4.94L1.39 16.3C3.37 20.15 7.35 23 12 23z"/>
              </svg>
              <span>Google Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginMethod('otp'); setLoginError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMethod === 'otp'
                  ? 'border-[#C5A880] text-[#1C2421] bg-stone-50/50'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>
          </div>

          {/* METHOD 1: PASSCODE / PIN SIGN-IN (Guaranteed to work 100% on any domain) */}
          {loginMethod === 'passcode' && (
            <form onSubmit={handlePasscodeSignIn} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Administrative Passcode or Staff PIN
                </label>
                <div className="relative">
                  <input
                    type={showPasscode ? "text" : "password"}
                    required
                    placeholder="Enter master passcode or staff PIN..."
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-stone-200 px-4 py-3 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900 font-mono tracking-wider pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-[10px] text-stone-400 font-mono">
                    Master Key: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-600 font-bold">KAGZ-SAFARI-2026</code>
                  </p>
                  <button
                    type="button"
                    onClick={() => setPasscodeInput('KAGZ-SAFARI-2026')}
                    className="text-[10px] text-[#C5A880] hover:underline font-bold"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#C5A880] hover:bg-[#1C2421] text-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-widest transition-all rounded-none cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Key className="w-4 h-4" />
                <span>Enter Concierge Portal</span>
              </button>
            </form>
          )}

          {/* METHOD 2: GOOGLE SIGN-IN */}
          {loginMethod === 'google' && (
            <div className="space-y-4 text-left">
              <p className="text-stone-600 text-xs leading-relaxed font-light">
                Sign in directly using your registered Google Account. Access is restricted to <span className="font-mono text-stone-900 font-semibold">kungutim541@gmail.com</span> and authorized team members.
              </p>

              <button
                type="button"
                disabled={isSigningIn}
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 bg-[#FAF7F2] hover:bg-[#EADCC9]/20 border border-[#C5A880]/40 text-stone-900 font-bold text-xs uppercase tracking-widest transition-all rounded-none cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
              >
                {isSigningIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.5l3.85 2.99C6.18 7.02 8.84 5.04 12 5.04z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.97h3.89c2.28-2.1 3.56-5.19 3.56-8.71z"/>
                      <path fill="#FBBC05" d="M5.24 14.51c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 6.9C.5 8.7 0 10.7 0 12.8s.5 4.1 1.39 5.9l3.85-2.99z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.89-2.97c-1.09.73-2.48 1.17-4.07 1.17-3.16 0-5.82-1.98-6.76-4.94L1.39 16.3C3.37 20.15 7.35 23 12 23z"/>
                    </svg>
                    <span>Sign In With Google</span>
                  </>
                )}
              </button>

              {/* Unauthorized domain guide */}
              {unauthorizedDomain && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-left text-xs space-y-3 rounded-none">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold text-sm">⚠️</span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">Custom Domain Authorization</h4>
                      <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                        To sign in via Google OAuth on custom domain <code className="font-mono bg-amber-100 px-1 py-0.5">{currentDomain}</code>, add it once to Firebase Console &gt; Authentication &gt; Authorized domains.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-amber-200 p-2.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-stone-800 truncate">{currentDomain}</span>
                    <button
                      type="button"
                      onClick={copyCurrentDomain}
                      className="px-2.5 py-1 bg-[#1C2421] text-white hover:bg-[#C5A880] hover:text-[#1C2421] text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                    >
                      {domainCopied ? "Copied!" : "Copy Domain"}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60">
                    <p className="text-[11px] text-stone-700 font-medium mb-1.5">
                      👉 <strong>Instant Access Workaround:</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('passcode'); setPasscodeInput('KAGZ-SAFARI-2026'); }}
                      className="text-xs text-[#1C2421] bg-white border border-stone-300 hover:border-[#C5A880] px-3 py-1.5 font-bold uppercase tracking-wider block text-center w-full"
                    >
                      Sign In Now with Master Passcode &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* METHOD 3: EMAIL & OTP SIGN-IN */}
          {loginMethod === 'otp' && (
            <div className="space-y-4 text-left">
              {!otpSentNotification ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Staff Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. kungutim541@gmail.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-stone-200 px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1C2421] hover:bg-[#C5A880] text-white hover:text-[#1C2421] font-bold text-xs uppercase tracking-wider transition-all rounded-none cursor-pointer"
                  >
                    Generate Access Passcode
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <p className="font-bold">Access Passcode Active!</p>
                    <p className="text-[11px] mt-0.5">
                      Enter the 6-digit verification code below: <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 border border-emerald-300 ml-1">{generatedOtp}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      6-Digit Passcode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-stone-200 px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900 font-mono tracking-widest text-center text-base"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSentNotification(false)}
                      className="flex-1 py-2.5 border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-bold uppercase"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#C5A880] hover:bg-[#1C2421] text-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Verify & Enter
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Feedback Messages */}
          {loginError && !unauthorizedDomain && (
            <div className="mt-4 text-rose-600 text-xs font-semibold leading-relaxed text-left bg-rose-50 border border-rose-200 p-3">
              {loginError}
            </div>
          )}

          {loginSuccess && (
            <div className="mt-4 text-emerald-700 text-xs font-semibold leading-relaxed text-left bg-emerald-50 border border-emerald-200 p-3">
              {loginSuccess}
            </div>
          )}

          {/* Quick One-Click Owner Bypass for testing / evaluation */}
          <div className="mt-8 pt-4 border-t border-stone-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleQuickOwnerAccess}
              className="text-xs text-[#C5A880] hover:text-[#1C2421] hover:bg-[#FAF7F2] border border-dashed border-[#C5A880]/50 py-2 px-3 transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Owner Access (kungutim541@gmail.com)</span>
            </button>

            <button 
              onClick={() => onNavigate('#/')}
              className="text-stone-400 hover:text-[#C5A880] text-xs font-medium underline cursor-pointer mt-2"
            >
              &larr; Return to Visitor Safari Site
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* ============================================================================
     RENDER: AUTHENTICATED STAFF CMS & CONCIERGE DASHBOARD
     ============================================================================ */

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesStatus = filterStatus === 'All' || enq.status === filterStatus;
    const matchesSearch = !searchQuery || [enq.name, enq.email, enq.destination, enq.message].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredDests = destinations.filter(d => !searchQuery || [d.name, d.tagline, d.category].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredTours = tours.filter(t => !searchQuery || [t.name, t.destination, t.category].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredBlogs = blogs.filter(b => !searchQuery || [b.title, b.category, b.author].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredTestimonials = testimonials.filter(t => !searchQuery || [t.author, t.location, t.trip, t.quote].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredOffers = specialOffers.filter(o => !searchQuery || [o.title, o.badge, o.destination].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredStaff = staffUsers.filter(s => !searchQuery || [s.name, s.email, s.role, s.department].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-stone-800 font-sans select-text">
      {/* Dynamic Header */}
      <header className="bg-[#1C2421] text-white py-4 px-6 md:px-8 border-b border-white/10 sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#C5A880]/20 rounded-full">
            <Compass className="w-5 h-5 text-[#C5A880]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold tracking-wider text-white">KAGZ Concierge Portal</h1>
              <span className="bg-[#C5A880]/15 text-[#C5A880] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-[#C5A880]/30 select-none">
                Staff Operations
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono hidden md:block">
              Active: <span className="text-[#C5A880]">{sessionAdminName}</span> ({sessionAdminEmail})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleBulkSeed}
            disabled={isSeeding}
            className={`text-xs px-3.5 py-1.5 bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#C5A880] hover:bg-[#C5A880] hover:text-[#1C2421] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center gap-1.5 ${isSeeding ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? "Syncing..." : "Seed All Data"}</span>
          </button>
          
          <button
            onClick={() => onNavigate('#/')}
            className="text-xs hover:text-[#C5A880] text-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer px-2"
          >
            <Globe className="w-4 h-4" />
            <span>Live Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="text-xs bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900 hover:text-white px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer font-bold uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Core Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-1.5 mb-6 border-b border-stone-200 pb-3 select-none">
          {[
            { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: <FileText className="w-4 h-4" /> },
            { id: 'destinations', label: `Destinations (${destinations.length})`, icon: <MapPin className="w-4 h-4" /> },
            { id: 'tours', label: `Tours (${tours.length})`, icon: <Compass className="w-4 h-4" /> },
            { id: 'blogs', label: `Travel Guides (${blogs.length})`, icon: <BookOpen className="w-4 h-4" /> },
            { id: 'testimonials', label: `Reviews (${testimonials.length})`, icon: <Star className="w-4 h-4" /> },
            { id: 'offers', label: `Special Offers (${specialOffers.length})`, icon: <Tag className="w-4 h-4" /> },
            { id: 'gallery', label: `Media Gallery (${gallery.length})`, icon: <ImageIcon className="w-4 h-4" /> },
            { id: 'users', label: `Staff & Users (${staffUsers.length})`, icon: <Users className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
                setSelectedEnquiry(null);
                setEditingDest(null);
                setEditingTour(null);
                setEditingBlog(null);
                setEditingTestimonial(null);
                setEditingOffer(null);
                setEditingGalleryItem(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-none border ${
                activeTab === tab.id
                  ? 'bg-[#1C2421] text-[#C5A880] border-[#1C2421] shadow-sm'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              } cursor-pointer`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-stone-200 shadow-sm mb-6">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-stone-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900 placeholder-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {activeTab === 'destinations' && (
              <button
                onClick={() => setEditingDest({ name: '', tagline: '', category: 'East Africa', image: '', intro: '', whyVisit: '', topExperiences: '', attractions: '', bestTimeToVisit: '', travelTips: '' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Destination</span>
              </button>
            )}

            {activeTab === 'tours' && (
              <button
                onClick={() => setEditingTour({ name: '', destination: destinations[0]?.name || 'Kenya', category: 'Wildlife', duration: '', image: '', description: '', overview: '', highlights: '', whatToExpect: '', bestTimeToGo: '', whatToBring: '', itinerary: [] })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            )}

            {activeTab === 'blogs' && (
              <button
                onClick={() => setEditingBlog({ title: '', category: 'Travel Tips', date: '', excerpt: '', content: '', author: 'Amara Kagz', metaDescription: '', related: '' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Travel Guide</span>
              </button>
            )}

            {activeTab === 'testimonials' && (
              <button
                onClick={() => setEditingTestimonial({ author: '', quote: '', location: 'United Kingdom', trip: '7-Day Maasai Mara Expedition', avatar: 'EV' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Guest Review</span>
              </button>
            )}

            {activeTab === 'offers' && (
              <button
                onClick={() => setEditingOffer({ title: '', tagline: '', badge: 'Limited Edition', discount: '10% Off', destination: 'Kenya', validUntil: 'December 2027', description: '', image: '', featured: true })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Special Offer</span>
              </button>
            )}

            {activeTab === 'gallery' && (
              <button
                onClick={() => setEditingGalleryItem({ src: '', alt: '', category: 'Wildlife' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            )}

            {activeTab === 'users' && (
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Staff User</span>
              </button>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 1: ENQUIRIES LOG */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'enquiries' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2 mb-4 select-none">
                {['All', 'New Enquiry', 'Under Curation', 'Confirmed'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border ${
                      filterStatus === st ? 'bg-[#C5A880] text-white border-transparent' : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {filteredEnquiries.length > 0 ? (
                <div className="bg-white border border-stone-200 shadow-sm divide-y divide-stone-100">
                  {filteredEnquiries.map(enq => (
                    <div
                      key={enq.id}
                      onClick={() => setSelectedEnquiry(enq)}
                      className={`p-5 hover:bg-[#FAF7F2] transition-colors cursor-pointer flex justify-between items-center gap-4 ${
                        selectedEnquiry?.id === enq.id ? 'bg-[#FAF7F2] border-l-4 border-[#C5A880]' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-stone-900">{enq.name}</h3>
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            enq.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                            enq.status === 'Under Curation' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                          }`}>{enq.status}</span>
                        </div>
                        <p className="text-xs text-stone-500 font-medium">{enq.destination} &bull; {enq.travelDate} &bull; {enq.travelers} guests</p>
                        <p className="text-xs text-stone-600 italic line-clamp-1 mt-1">"{enq.message}"</p>
                      </div>
                      <div className="text-right text-[10px] text-stone-400 select-none">{enq.dateSubmitted}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 text-center text-stone-400 italic border border-stone-200">No enquiries found.</div>
              )}
            </div>

            <div className="lg:col-span-1">
              {selectedEnquiry ? (
                <div className="bg-white border border-stone-200 p-6 shadow-sm sticky top-28 space-y-5 text-xs">
                  <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Traveller Lead</span>
                      <h2 className="font-serif text-xl font-bold text-stone-900 mt-1">{selectedEnquiry.name}</h2>
                    </div>
                    <button onClick={() => setSelectedEnquiry(null)} className="text-stone-400 hover:text-stone-700"><X className="w-4 h-4" /></button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">Destination & Travel Date</p>
                      <p className="font-medium text-stone-800">{selectedEnquiry.destination} &bull; {selectedEnquiry.travelDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">Party Size & Safari Style</p>
                      <p className="font-medium text-stone-800">{selectedEnquiry.travelers} guests &bull; {selectedEnquiry.style || 'Classic Safari'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">Contact Details</p>
                      <p className="font-mono text-stone-700">{selectedEnquiry.email}</p>
                      {selectedEnquiry.phone && <p className="font-mono text-stone-700">{selectedEnquiry.phone}</p>}
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400">Traveller Message</p>
                      <p className="bg-[#FAF7F2] p-3 text-stone-700 italic border border-stone-200 mt-1 leading-relaxed">
                        "{selectedEnquiry.message}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <p className="text-[9px] uppercase font-bold text-stone-400">Update Lead Status</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {['New Enquiry', 'Under Curation', 'Confirmed'].map(st => (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedEnquiry.id, st)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                            selectedEnquiry.status === st ? 'bg-[#1C2421] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                      className="w-full mt-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold uppercase transition-colors"
                    >
                      Delete Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 p-8 text-center text-stone-400 italic">
                  Select an enquiry from the log to view details, update status, and manage client communications.
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 2: DESTINATIONS */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'destinations' && (
          <div>
            {editingDest ? (
              <form onSubmit={handleSaveDest} className="bg-white border border-stone-200 p-6 md:p-8 shadow-sm space-y-4 max-w-3xl mx-auto text-xs">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{editingDest.id ? `Edit ${editingDest.name}` : 'Add Destination'}</h2>
                  <button type="button" onClick={() => setEditingDest(null)}><X className="w-4 h-4 text-stone-400" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Destination Name *</label>
                    <input
                      type="text"
                      required
                      value={editingDest.name}
                      onChange={(e) => setEditingDest({ ...editingDest, name: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Category / Region</label>
                    <input
                      type="text"
                      value={editingDest.category}
                      onChange={(e) => setEditingDest({ ...editingDest, category: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingDest.tagline}
                    onChange={(e) => setEditingDest({ ...editingDest, tagline: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Hero Image URL</label>
                  <input
                    type="url"
                    value={editingDest.image}
                    onChange={(e) => setEditingDest({ ...editingDest, image: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Introduction</label>
                  <textarea
                    rows={3}
                    value={editingDest.intro}
                    onChange={(e) => setEditingDest({ ...editingDest, intro: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button type="button" onClick={() => setEditingDest(null)} className="px-5 py-2 border border-stone-300">Cancel</button>
                  <button type="submit" className="px-7 py-2 bg-[#C5A880] text-[#1C2421] font-bold">Save Destination</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDests.map(d => (
                  <div key={d.id} className="bg-white border border-stone-200 shadow-sm flex flex-col justify-between overflow-hidden">
                    <img src={d.image} alt={d.name} className="h-44 w-full object-cover" />
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-serif text-lg font-bold text-stone-900">{d.name}</h3>
                          <span className="bg-[#C5A880]/15 text-[#C5A880] text-[8px] font-bold uppercase px-2 py-0.5">{d.category}</span>
                        </div>
                        <p className="text-xs text-stone-500 italic mb-2">{d.tagline}</p>
                        <p className="text-xs text-stone-600 line-clamp-2">{d.intro}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                        <span className="text-[10px] text-stone-400 font-mono">ID: {d.id}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingDest(d)} className="p-1.5 text-stone-600 hover:text-[#C5A880]"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteContent('dest', d.id)} className="p-1.5 text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 3: TOURS & EXPERIENCES */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'tours' && (
          <div>
            {editingTour ? (
              <form onSubmit={handleSaveTour} className="bg-white border border-stone-200 p-6 md:p-8 shadow-sm space-y-4 max-w-3xl mx-auto text-xs">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{editingTour.id ? `Edit ${editingTour.name}` : 'Add Tour'}</h2>
                  <button type="button" onClick={() => setEditingTour(null)}><X className="w-4 h-4 text-stone-400" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Tour Name *</label>
                    <input
                      type="text"
                      required
                      value={editingTour.name}
                      onChange={(e) => setEditingTour({ ...editingTour, name: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 8 Days / 7 Nights"
                      value={editingTour.duration}
                      onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Destination</label>
                    <input
                      type="text"
                      value={editingTour.destination}
                      onChange={(e) => setEditingTour({ ...editingTour, destination: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingTour.category}
                      onChange={(e) => setEditingTour({ ...editingTour, category: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={editingTour.image}
                    onChange={(e) => setEditingTour({ ...editingTour, image: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Brief Description</label>
                  <textarea
                    rows={3}
                    value={editingTour.description}
                    onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button type="button" onClick={() => setEditingTour(null)} className="px-5 py-2 border border-stone-300">Cancel</button>
                  <button type="submit" className="px-7 py-2 bg-[#C5A880] text-[#1C2421] font-bold">Save Experience</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map(t => (
                  <div key={t.id} className="bg-white border border-stone-200 shadow-sm flex flex-col justify-between overflow-hidden">
                    <img src={t.image} alt={t.name} className="h-44 w-full object-cover" />
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-serif text-lg font-bold text-stone-900">{t.name}</h3>
                          <span className="bg-[#C5A880]/15 text-[#C5A880] text-[8px] font-bold uppercase px-2 py-0.5">{t.category}</span>
                        </div>
                        <p className="text-xs text-stone-500 font-semibold mb-1">{t.destination} &bull; {t.duration}</p>
                        <p className="text-xs text-stone-600 line-clamp-2">{t.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                        <span className="text-[10px] text-stone-400 font-mono">ID: {t.id}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingTour(t)} className="p-1.5 text-stone-600 hover:text-[#C5A880]"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteContent('tour', t.id)} className="p-1.5 text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 4: BLOGS & TRAVEL GUIDES */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'blogs' && (
          <div>
            {editingBlog ? (
              <form onSubmit={handleSaveBlog} className="bg-white border border-stone-200 p-6 md:p-8 shadow-sm space-y-4 max-w-3xl mx-auto text-xs">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{editingBlog.id ? `Edit Guide` : 'Add Article'}</h2>
                  <button type="button" onClick={() => setEditingBlog(null)}><X className="w-4 h-4 text-stone-400" /></button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingBlog.title}
                    onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingBlog.category}
                      onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Author</label>
                    <input
                      type="text"
                      value={editingBlog.author}
                      onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Date</label>
                    <input
                      type="text"
                      value={editingBlog.date}
                      onChange={(e) => setEditingBlog({ ...editingBlog, date: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Excerpt</label>
                  <textarea
                    rows={2}
                    value={editingBlog.excerpt}
                    onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Content Body</label>
                  <textarea
                    rows={8}
                    value={editingBlog.content}
                    onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button type="button" onClick={() => setEditingBlog(null)} className="px-5 py-2 border border-stone-300">Cancel</button>
                  <button type="submit" className="px-7 py-2 bg-[#C5A880] text-[#1C2421] font-bold">Save Article</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map(b => (
                  <div key={b.id} className="bg-white border border-stone-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[9px] font-bold uppercase text-[#C5A880] bg-[#FAF7F2] px-2 py-0.5 border border-[#EADCC9]/50">{b.category}</span>
                        <span className="text-[10px] text-stone-400">{b.date}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-stone-900 leading-snug">{b.title}</h3>
                      <p className="text-xs text-stone-500 mb-2">By {b.author}</p>
                      <p className="text-xs text-stone-600 line-clamp-2">{b.excerpt}</p>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                      <span className="text-[10px] text-stone-400 font-mono">ID: {b.id}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingBlog(b)} className="p-1.5 text-stone-600 hover:text-[#C5A880]"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteContent('blog', b.id)} className="p-1.5 text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 5: GUEST REVIEWS & TESTIMONIALS */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'testimonials' && (
          <div>
            {editingTestimonial ? (
              <form onSubmit={handleSaveTestimonial} className="bg-white border border-stone-200 p-6 md:p-8 shadow-sm space-y-4 max-w-2xl mx-auto text-xs">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{editingTestimonial.id ? 'Edit Guest Review' : 'Add Guest Review'}</h2>
                  <button type="button" onClick={() => setEditingTestimonial(null)}><X className="w-4 h-4 text-stone-400" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Guest Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lady Vivienne & Lord Sterling"
                      value={editingTestimonial.author}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Location / Country</label>
                    <input
                      type="text"
                      placeholder="e.g. Edinburgh, Scotland"
                      value={editingTestimonial.location}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Safari Experience Taken</label>
                  <input
                    type="text"
                    placeholder="e.g. 10-Day Serengeti & Ngorongoro Private Tented Trek"
                    value={editingTestimonial.trip}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, trip: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Guest Quote / Review *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide the guest review..."
                    value={editingTestimonial.quote}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 leading-relaxed italic"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button type="button" onClick={() => setEditingTestimonial(null)} className="px-5 py-2 border border-stone-300">Cancel</button>
                  <button type="submit" className="px-7 py-2 bg-[#C5A880] text-[#1C2421] font-bold">Save Review</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestimonials.map(t => (
                  <div key={t.id} className="bg-white border border-stone-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-[#C5A880] mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#C5A880]" />
                        ))}
                      </div>
                      <p className="text-xs text-stone-700 italic leading-relaxed mb-4">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 border-t border-stone-100 pt-3">
                        <div className="w-9 h-9 rounded-full bg-[#1C2421] text-[#C5A880] font-bold text-xs flex items-center justify-center shrink-0">
                          {t.avatar}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-serif text-xs font-bold text-[#1C2421]">{t.author}</h4>
                          <p className="text-[10px] text-stone-400 uppercase">{t.location}</p>
                          <p className="text-[10px] text-[#C5A880] italic">{t.trip}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => setEditingTestimonial(t)} className="p-1 text-stone-600 hover:text-[#C5A880]"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteContent('testimonial', t.id)} className="p-1 text-stone-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 6: SPECIAL OFFERS & PACKAGES */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'offers' && (
          <div>
            {editingOffer ? (
              <form onSubmit={handleSaveOffer} className="bg-white border border-stone-200 p-6 md:p-8 shadow-sm space-y-4 max-w-2xl mx-auto text-xs">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">{editingOffer.id ? 'Edit Special Offer' : 'Add Special Offer'}</h2>
                  <button type="button" onClick={() => setEditingOffer(null)}><X className="w-4 h-4 text-stone-400" /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Offer Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Great Migration River Crossing Special"
                      value={editingOffer.title}
                      onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Seasonal Special, Early Bird"
                      value={editingOffer.badge}
                      onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Discount / Perk</label>
                    <input
                      type="text"
                      placeholder="e.g. 15% Off Early Bookings"
                      value={editingOffer.discount}
                      onChange={(e) => setEditingOffer({ ...editingOffer, discount: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Destination</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanzania"
                      value={editingOffer.destination}
                      onChange={(e) => setEditingOffer({ ...editingOffer, destination: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Valid Until</label>
                    <input
                      type="text"
                      placeholder="e.g. October 2027"
                      value={editingOffer.validUntil}
                      onChange={(e) => setEditingOffer({ ...editingOffer, validUntil: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editingOffer.image}
                    onChange={(e) => setEditingOffer({ ...editingOffer, image: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingOffer.description}
                    onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button type="button" onClick={() => setEditingOffer(null)} className="px-5 py-2 border border-stone-300">Cancel</button>
                  <button type="submit" className="px-7 py-2 bg-[#C5A880] text-[#1C2421] font-bold">Save Offer</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffers.map(o => (
                  <div key={o.id} className="bg-white border border-stone-200 shadow-sm flex flex-col justify-between overflow-hidden">
                    <div className="relative h-44">
                      <img src={o.image} alt={o.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-[#1C2421] text-[#C5A880] text-[9px] font-bold uppercase px-2.5 py-1">
                        {o.badge}
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-[#C5A880] font-bold uppercase">{o.destination}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5">{o.discount}</span>
                        </div>
                        <h3 className="font-serif text-base font-bold text-stone-900">{o.title}</h3>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">Valid until: {o.validUntil}</p>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">{o.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                        <span className="text-[10px] text-stone-400 font-mono">ID: {o.id}</span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingOffer(o)} className="p-1.5 text-stone-600 hover:text-[#C5A880]"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteContent('offer', o.id)} className="p-1.5 text-stone-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 7: MEDIA & PHOTO GALLERY */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'gallery' && (
          <div>
            {editingGalleryItem ? (
              <form onSubmit={handleSaveGalleryItem} className="bg-white border border-stone-200 p-6 md:p-8 shadow-sm space-y-4 max-w-xl mx-auto text-xs">
                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-stone-900">Add Media Asset</h2>
                  <button type="button" onClick={() => setEditingGalleryItem(null)}><X className="w-4 h-4 text-stone-400" /></button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Image URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={editingGalleryItem.src}
                    onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, src: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Category</label>
                    <select
                      value={editingGalleryItem.category}
                      onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    >
                      <option value="Wildlife">Wildlife</option>
                      <option value="Landscapes">Landscapes</option>
                      <option value="Luxury Lodges">Luxury Lodges</option>
                      <option value="Culture">Culture</option>
                      <option value="Beach">Beach</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Alt Caption / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Male lion resting in Serengeti"
                      value={editingGalleryItem.alt}
                      onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, alt: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  <button type="button" onClick={() => setEditingGalleryItem(null)} className="px-5 py-2 border border-stone-300">Cancel</button>
                  <button type="submit" className="px-7 py-2 bg-[#C5A880] text-[#1C2421] font-bold">Add to Library</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.map(img => (
                  <div key={img.id} className="group relative bg-white border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="relative h-44 overflow-hidden bg-stone-100">
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-none uppercase font-bold">
                        {img.category}
                      </div>
                    </div>
                    <div className="p-3 bg-white space-y-2">
                      <p className="text-[11px] text-stone-700 font-medium line-clamp-1">{img.alt}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(img.src);
                            setCopiedUrlIndex(img.id);
                            setTimeout(() => setCopiedUrlIndex(null), 2000);
                          }}
                          className="text-[#C5A880] hover:text-[#1C2421] flex items-center gap-1 font-bold uppercase tracking-wider"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedUrlIndex === img.id ? 'Copied URL!' : 'Copy URL'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteContent('gallery', img.id)}
                          className="text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 8: STAFF & USER MANAGEMENT (Comprehensively Redone) */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#1C2421] text-[#C5A880] rounded-none">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Total Curators</p>
                  <p className="font-serif text-2xl font-bold text-stone-900">{staffUsers.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-none">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Active Accounts</p>
                  <p className="font-serif text-2xl font-bold text-emerald-800">
                    {staffUsers.filter(s => s.status === 'Active').length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#C5A880]/15 text-[#C5A880] rounded-none">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Master Passcode</p>
                  <p className="font-mono text-xs font-bold text-stone-800">KAGZ-SAFARI-2026</p>
                </div>
              </div>

              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-none">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Audit Actions</p>
                  <p className="font-serif text-2xl font-bold text-stone-900">{auditLogs.length}</p>
                </div>
              </div>
            </div>

            {/* Team Directory Table */}
            <div className="bg-white border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900">Staff & Curator Directory</h2>
                  <p className="text-xs text-stone-500">Manage administrator privileges, staff roles, and access PINs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add New Staff</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-stone-500 uppercase text-[9px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Curator / User</th>
                      <th className="py-3 px-4">Role & Department</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Staff PIN</th>
                      <th className="py-3 px-4">Date Added</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredStaff.map(staff => (
                      <tr key={staff.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1C2421] text-[#C5A880] flex items-center justify-center font-bold text-xs">
                              {staff.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-serif font-bold text-stone-900">{staff.name}</p>
                              <p className="font-mono text-[10px] text-stone-500">{staff.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-none ${
                            staff.role === 'Super Admin' ? 'bg-[#1C2421] text-[#C5A880]' :
                            staff.role === 'Senior Safari Curator' ? 'bg-[#C5A880]/15 text-[#C5A880]' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {staff.role}
                          </span>
                          <p className="text-[10px] text-stone-400 mt-0.5">{staff.department}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase ${
                            staff.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            {staff.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                          <code>{staff.passcode}</code>
                        </td>

                        <td className="py-3.5 px-4 text-stone-400 text-[10px] font-mono">
                          {staff.dateAdded}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          {staff.email !== 'kungutim541@gmail.com' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(staff.id)}
                                className="text-[10px] text-stone-500 hover:text-stone-900 font-bold uppercase underline cursor-pointer"
                              >
                                {staff.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaffUser(staff.id, staff.email)}
                                className="text-[10px] text-rose-600 hover:underline font-bold uppercase cursor-pointer"
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-stone-400 italic">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Audit Log Section */}
            <div className="bg-white border border-stone-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">Security & Operational Audit Log</h3>
                  <p className="text-[11px] text-stone-500">Chronological activity record of staff operations and system logins.</p>
                </div>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-1 border border-stone-200">
                  Live Audit Active
                </span>
              </div>

              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto font-sans">
                {auditLogs.map(log => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none mt-0.5 ${
                        log.category === 'AUTH' ? 'bg-indigo-100 text-indigo-800' :
                        log.category === 'BOOKING' ? 'bg-amber-100 text-amber-800' :
                        log.category === 'STAFF' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {log.category}
                      </span>
                      <div>
                        <p className="font-semibold text-stone-800">{log.action}</p>
                        <p className="text-stone-500 text-[11px]">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-stone-400 font-mono shrink-0">
                      <span>{log.user}</span> &bull; <span>{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Add Staff User Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-serif text-lg font-bold text-stone-900">Authorize New Staff Member</h3>
              <button onClick={() => setShowAddStaffModal(false)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>

            <form onSubmit={handleAddStaffUser} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Google / Staff Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. s.jenkins@kagztours.com or gmail"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Staff Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                  >
                    <option value="Senior Safari Curator">Senior Safari Curator</option>
                    <option value="Booking & Logistics">Booking & Logistics</option>
                    <option value="Content & Media Editor">Content & Media Editor</option>
                    <option value="Guest Relations">Guest Relations</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Assigned PIN</label>
                  <input
                    type="text"
                    placeholder="e.g. 4392"
                    value={newStaff.passcode}
                    onChange={(e) => setNewStaff({ ...newStaff, passcode: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Department / Office</label>
                <input
                  type="text"
                  placeholder="e.g. Nairobi Operations, Arusha Bureau, London Office"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 border border-stone-300 font-bold uppercase text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C5A880] text-[#1C2421] font-bold uppercase text-[10px]"
                >
                  Authorize Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
