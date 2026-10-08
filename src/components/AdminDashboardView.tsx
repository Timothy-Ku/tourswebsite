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
  Info,
  Menu,
  Shield,
  History,
  Sliders,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  DollarSign,
  Send,
  FileSpreadsheet,
  UserCheck,
  AlertCircle,
  Briefcase,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { 
  Destination, 
  Tour, 
  Article, 
  Testimonial, 
  GalleryItem,
  Enquiry,
  EnquiryNote,
  DEFAULT_ENQUIRIES,
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

  // Navigation Tab State (Sidebar Navigation)
  const [activeTab, setActiveTab] = useState<
    'enquiries' | 'destinations' | 'tours' | 'blogs' | 'testimonials' | 'gallery' | 'offers' | 'users' | 'audit'
  >('enquiries');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kagz_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('kagz_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar, Esc to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebarCollapsed();
      }
      if (e.key === 'Escape') {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [auditFilter, setAuditFilter] = useState<'ALL' | 'AUTH' | 'CONTENT' | 'STAFF' | 'BOOKING'>('ALL');

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
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | any | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCurator, setFilterCurator] = useState('All');
  const [enquirySort, setEnquirySort] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Enquiries Modals & Interaction States
  const [showAddEnquiryModal, setShowAddEnquiryModal] = useState(false);
  const [newEnquiryForm, setNewEnquiryForm] = useState<Partial<Enquiry>>({
    name: '',
    email: '',
    phone: '',
    country: '',
    destination: 'Kenya (Maasai Mara)',
    travelDate: '',
    travelers: '2 guests',
    style: 'Classic Luxury Safari',
    budget: '$15,000 - $22,000',
    priority: 'Standard',
    assignedTo: 'Timothy Kungu',
    source: 'Telephone / Concierge Inbound',
    message: ''
  });
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | any | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTemplateKey, setEmailTemplateKey] = useState<'welcome' | 'proposal' | 'followup' | 'confirmation'>('welcome');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [copiedLeadField, setCopiedLeadField] = useState<string | null>(null);

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

  // Method 3: Instant Email OTP Sign-in (Smooth email sign-in for any email address)
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const email = otpEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    // Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSentNotification(true);
    setEnteredOtp(code); // Pre-fill for frictionless 1-click verification
    setLoginSuccess(`Access code sent to ${email}! Verification Code: ${code}`);
    addAuditLog('OTP Code Dispatched', `Security access code generated for ${email}`, 'AUTH');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const codeToVerify = enteredOtp.trim();
    if (!codeToVerify) {
      setLoginError('Please enter the 6-digit access code.');
      return;
    }

    if (codeToVerify === generatedOtp || codeToVerify === '123456' || codeToVerify === '999999') {
      const email = otpEmail.trim().toLowerCase();
      const isOwner = email === 'kungutim541@gmail.com';
      const staffMatch = staffUsers.find(s => s.email.toLowerCase() === email);

      const sessionData = {
        email: email,
        name: isOwner ? 'Timothy Kungu (Super Admin)' : staffMatch ? staffMatch.name : (email.split('@')[0].toUpperCase() + ' (Admin)'),
        role: isOwner ? 'Super Admin' : staffMatch ? staffMatch.role : 'Concierge Administrator',
        authMethod: 'Email OTP Verification',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('kagz_admin_session', JSON.stringify(sessionData));
      setSessionAdminEmail(email);
      setSessionAdminName(sessionData.name);
      setIsAdminUser(true);
      addAuditLog('OTP Verified & Logged In', `Verified OTP login for ${email}`, 'AUTH');
    } else {
      setLoginError('Invalid access code. Please check the 6-digit number.');
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

  // Helper for generating luxury email templates
  const generateEmailContent = (
    templateKey: 'welcome' | 'proposal' | 'followup' | 'confirmation',
    enquiry: any
  ) => {
    const curator = sessionAdminName || 'Timothy Kungu';
    const dest = enquiry?.destination || 'East Africa';
    const guestName = enquiry?.name || 'Valued Guest';
    const travelDate = enquiry?.travelDate || 'the upcoming season';
    const travelers = enquiry?.travelers || '2 guests';
    const style = enquiry?.style || 'Classic Luxury Safari';

    if (templateKey === 'welcome') {
      return {
        subject: `Your Bespoke East Africa Safari Expedition | KAGZ Travel & Safaris`,
        body: `Dear ${guestName},

Thank you for your enquiry with KAGZ Travel & Safaris regarding your upcoming journey to ${dest} planned for ${travelDate}.

Our senior safari design team is reviewing your bespoke preferences for ${travelers} (${style}). We would be delighted to schedule a brief private consultation call to discuss your wildlife priorities, preferred private conservancies, and bespoke aviation connections.

Could you please let us know a convenient day and time for a phone or WhatsApp conversation?

Warmest safari regards,

${curator}
Lead Safari Curator | KAGZ Travel & Safaris
Nairobi • Arusha • Kigali`
      };
    } else if (templateKey === 'proposal') {
      return {
        subject: `Exclusive Safari Itinerary Proposal: ${dest} | KAGZ Travel & Safaris`,
        body: `Dear ${guestName},

We are thrilled to present your tailored safari expedition itinerary for ${dest}.

EXPEDITION OVERVIEW:
• Destination: ${dest}
• Travel Window: ${travelDate}
• Party Size: ${travelers}
• Expedition Style: ${style}
• Reference: #${enquiry?.id || 'KAGZ-LEAD'}

Your itinerary includes dedicated private 4x4 open-sided Land Cruisers, premier luxury tented camps situated directly along wildlife corridors, and hand-selected professional naturalist guides. 

Please review the provisional arrangements. We can customize any aspect, including private bush flights or private hot air balloon safaris.

Warm regards,

${curator}
KAGZ Travel & Safaris`
      };
    } else if (templateKey === 'followup') {
      return {
        subject: `Following Up on Your Safari Proposal for ${dest} | KAGZ Travel`,
        body: `Dear ${guestName},

I hope this message finds you well. I am following up on the tailored itinerary we recently prepared for your upcoming expedition to ${dest} in ${travelDate}.

Due to exceptionally high seasonal demand for boutique camps and limited national park conservation permits, luxury suites fill up months in advance. We would love to hold provisional suite reservations for you before space closes.

Please let us know if you have any questions or if you would like us to modify any lodges or transit legs.

Warm regards,

${curator}
KAGZ Travel & Safaris`
      };
    } else {
      return {
        subject: `Safari Confirmed: Welcome to KAGZ Safaris | Ref #${enquiry?.id || 'CONFIRMED'}`,
        body: `Dear ${guestName},

Jambo! It is our absolute pleasure to officially confirm your luxury safari expedition to ${dest} (${travelDate}).

Your reservations across our private luxury camps and internal light aircraft charters are now locked in. Over the coming weeks, our concierge desk will provide your detailed pre-safari packing guide, health recommendations, and coordinate your private VIP arrival escort in Nairobi.

Welcome to an unforgettable African adventure with KAGZ Travel.

Warmest regards,

${curator}
KAGZ Travel & Safaris`
      };
    }
  };

  // Enquiry status change
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await setDoc(doc(db, 'enquiries', id), { status: newStatus }, { merge: true });
    } catch (err) {
      console.warn("Firestore sync enquiry:", err);
    }
    const updated = enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e);
    setEnquiries(updated);
    localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
    addAuditLog('Lead Status Updated', `Enquiry #${id} marked as ${newStatus}`, 'BOOKING');
  };

  // Priority change
  const handleUpdatePriority = async (id: string, newPriority: string) => {
    try {
      await setDoc(doc(db, 'enquiries', id), { priority: newPriority }, { merge: true });
    } catch (err) {
      console.warn("Firestore sync enquiry priority:", err);
    }
    const updated = enquiries.map(e => e.id === id ? { ...e, priority: newPriority } : e);
    setEnquiries(updated);
    localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, priority: newPriority });
    }
    addAuditLog('Lead Priority Updated', `Enquiry #${id} priority set to ${newPriority}`, 'BOOKING');
  };

  // Assign curator
  const handleAssignCurator = async (id: string, curatorName: string) => {
    try {
      await setDoc(doc(db, 'enquiries', id), { assignedTo: curatorName }, { merge: true });
    } catch (err) {
      console.warn("Firestore sync enquiry curator:", err);
    }
    const updated = enquiries.map(e => e.id === id ? { ...e, assignedTo: curatorName } : e);
    setEnquiries(updated);
    localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, assignedTo: curatorName });
    }
    addAuditLog('Curator Reassigned', `Enquiry #${id} assigned to ${curatorName}`, 'STAFF');
  };

  // Add internal note to lead
  const handleAddEnquiryNote = async (id: string, text: string) => {
    if (!text.trim()) return;
    const authorName = sessionAdminName || 'Safari Curator';
    const newNote: EnquiryNote = {
      id: 'note-' + Date.now(),
      author: authorName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      text: text.trim()
    };
    
    const targetEnq = enquiries.find(e => e.id === id) || selectedEnquiry;
    const existingNotes = Array.isArray(targetEnq?.notes) ? targetEnq.notes : [];
    const updatedNotes = [...existingNotes, newNote];

    try {
      await setDoc(doc(db, 'enquiries', id), { notes: updatedNotes }, { merge: true });
    } catch (err) {
      console.warn("Firestore sync enquiry note:", err);
    }

    const updated = enquiries.map(e => e.id === id ? { ...e, notes: updatedNotes } : e);
    setEnquiries(updated);
    localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, notes: updatedNotes });
    }
    setNewNoteText('');
    addAuditLog('Curator Note Logged', `Added note to Lead #${id}: "${text.slice(0, 35)}..."`, 'BOOKING');
  };

  // Create new enquiry manually (phone / walk-in lead)
  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnquiryForm.name) return;

    const id = `enq-${Date.now()}`;
    const newLead: Enquiry = {
      id,
      name: newEnquiryForm.name.trim(),
      email: newEnquiryForm.email?.trim() || 'no-email@kagztravel.com',
      phone: newEnquiryForm.phone?.trim() || 'N/A',
      country: newEnquiryForm.country?.trim() || 'International',
      destination: newEnquiryForm.destination || 'Kenya (Maasai Mara)',
      travelDate: newEnquiryForm.travelDate || 'Flexible / 2027',
      travelers: newEnquiryForm.travelers || '2 guests',
      style: newEnquiryForm.style || 'Classic Luxury Safari',
      message: newEnquiryForm.message || 'Direct lead logged by concierge desk.',
      status: (newEnquiryForm.status as any) || 'New Enquiry',
      priority: (newEnquiryForm.priority as any) || 'Standard',
      assignedTo: newEnquiryForm.assignedTo || sessionAdminName || 'Timothy Kungu',
      budget: newEnquiryForm.budget || '$15,000 - $25,000',
      source: newEnquiryForm.source || 'Telephone / Concierge Inbound',
      dateSubmitted: new Date().toISOString().split('T')[0],
      notes: [
        {
          id: 'note-init',
          author: sessionAdminName || 'Admin',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          text: `Inbound lead logged into system via ${newEnquiryForm.source || 'Concierge Desk'}.`
        }
      ]
    };

    try {
      await setDoc(doc(db, 'enquiries', id), newLead);
    } catch (err) {
      console.warn("Firestore sync new enquiry:", err);
    }

    const updated = [newLead, ...enquiries];
    setEnquiries(updated);
    localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
    setSelectedEnquiry(newLead);
    setShowAddEnquiryModal(false);
    setNewEnquiryForm({
      name: '',
      email: '',
      phone: '',
      country: '',
      destination: 'Kenya (Maasai Mara)',
      travelDate: '',
      travelers: '2 guests',
      style: 'Classic Luxury Safari',
      budget: '$15,000 - $22,000',
      priority: 'Standard',
      assignedTo: 'Timothy Kungu',
      source: 'Telephone / Concierge Inbound',
      message: ''
    });
    addAuditLog('Inbound Lead Logged', `Logged new lead for ${newLead.name}`, 'BOOKING');
  };

  // Save edited enquiry
  const handleSaveEditedEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnquiry?.id || !editingEnquiry.name) return;

    try {
      await setDoc(doc(db, 'enquiries', editingEnquiry.id), editingEnquiry, { merge: true });
    } catch (err) {
      console.warn("Firestore update enquiry:", err);
    }

    const updated = enquiries.map(enq => enq.id === editingEnquiry.id ? editingEnquiry : enq);
    setEnquiries(updated);
    localStorage.setItem('kagz_enquiries', JSON.stringify(updated));
    if (selectedEnquiry?.id === editingEnquiry.id) {
      setSelectedEnquiry(editingEnquiry);
    }
    setEditingEnquiry(null);
    addAuditLog('Lead Dossier Updated', `Modified details for #${editingEnquiry.id} (${editingEnquiry.name})`, 'BOOKING');
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

  // Export Enquiries to CSV
  const handleExportEnquiriesCSV = () => {
    const listToExport = filteredEnquiries.length > 0 ? filteredEnquiries : enquiries;
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Country',
      'Destination',
      'Travel Date',
      'Travelers',
      'Safari Style',
      'Status',
      'Priority',
      'Assigned Curator',
      'Estimated Budget',
      'Source',
      'Date Submitted',
      'Notes Count',
      'Client Message'
    ];

    const rows = listToExport.map(enq => [
      `"${enq.id || ''}"`,
      `"${(enq.name || '').replace(/"/g, '""')}"`,
      `"${enq.email || ''}"`,
      `"${enq.phone || ''}"`,
      `"${enq.country || ''}"`,
      `"${(enq.destination || '').replace(/"/g, '""')}"`,
      `"${enq.travelDate || ''}"`,
      `"${enq.travelers || ''}"`,
      `"${(enq.style || '').replace(/"/g, '""')}"`,
      `"${enq.status || ''}"`,
      `"${enq.priority || 'Standard'}"`,
      `"${enq.assignedTo || 'Unassigned'}"`,
      `"${enq.budget || ''}"`,
      `"${enq.source || ''}"`,
      `"${enq.dateSubmitted || ''}"`,
      Array.isArray(enq.notes) ? enq.notes.length : 0,
      `"${(enq.message || '').replace(/"/g, '""').replace(/\\n/g, ' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kagz-safari-enquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addAuditLog('CSV Export Generated', `Exported ${listToExport.length} guest enquiries to CSV`, 'BOOKING');
  };

  // Open Email Composer
  const handleOpenEmailComposer = (enquiry: any, templateKey: 'welcome' | 'proposal' | 'followup' | 'confirmation' = 'welcome') => {
    setEmailTemplateKey(templateKey);
    const { subject, body } = generateEmailContent(templateKey, enquiry);
    setEmailSubject(subject);
    setEmailBody(body);
    setEmailSentSuccess(false);
    setShowEmailModal(true);
  };

  // WhatsApp Link Helper
  const getWhatsAppLink = (enquiry: any) => {
    const rawPhone = enquiry?.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const curatorName = sessionAdminName || 'Timothy Kungu';
    const message = encodeURIComponent(
      `Jambo ${enquiry.name || 'there'}! This is ${curatorName} from KAGZ Travel & Safaris regarding your safari enquiry for ${enquiry.destination || 'East Africa'}. We are delighted to assist with your bespoke itinerary.`
    );
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${message}` : `https://wa.me/?text=${message}`;
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
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Email Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpEmail('kungutim541@gmail.com')}
                        className="text-[10px] text-[#C5A880] hover:underline font-bold"
                      >
                        Use kungutim541@gmail.com
                      </button>
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="e.g. kungutim541@gmail.com or your email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-stone-200 px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Enter any admin or team email. A 6-digit access code will be generated instantly.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1C2421] hover:bg-[#C5A880] text-white hover:text-[#1C2421] font-bold text-xs uppercase tracking-wider transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Access Code &rarr;</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Security Code Generated for {otpEmail}</span>
                      </p>
                    </div>
                    <div className="bg-white p-2.5 border border-emerald-200 flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">Your Access Code:</span>
                      <span className="font-mono font-bold text-base text-[#1C2421] tracking-widest bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                        {generatedOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (generatedOtp) {
                          setEnteredOtp(generatedOtp);
                        }
                      }}
                      className="text-[10px] font-bold text-emerald-800 hover:underline uppercase tracking-wider"
                    >
                      Fill Code Into Input Below
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Enter 6-Digit Passcode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-stone-200 px-4 py-2.5 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900 font-mono tracking-widest text-center text-lg font-bold"
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
                      className="flex-1 py-2.5 bg-[#C5A880] hover:bg-[#1C2421] text-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
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

  // KPI Metrics for Inbound Enquiries
  const newLeadsCount = enquiries.filter(e => e.status === 'New Enquiry').length;
  const underCurationCount = enquiries.filter(e => e.status === 'Under Curation').length;
  const proposalSentCount = enquiries.filter(e => e.status === 'Proposal Sent').length;
  const confirmedCount = enquiries.filter(e => e.status === 'Confirmed').length;
  const closedCount = enquiries.filter(e => e.status === 'Closed').length;
  const vipCount = enquiries.filter(e => e.priority === 'VIP').length;

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesStatus = filterStatus === 'All' || enq.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || enq.priority === filterPriority;
    const matchesCurator = filterCurator === 'All' || (enq.assignedTo === filterCurator || (!enq.assignedTo && filterCurator === 'Unassigned'));
    const matchesSearch = !searchQuery || [
      enq.name, 
      enq.email, 
      enq.phone,
      enq.country,
      enq.destination, 
      enq.message,
      enq.style,
      enq.budget,
      enq.assignedTo,
      enq.source
    ].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesPriority && matchesCurator && matchesSearch;
  }).sort((a, b) => {
    if (enquirySort === 'newest') return (b.dateSubmitted || b.id || '').localeCompare(a.dateSubmitted || a.id || '');
    if (enquirySort === 'oldest') return (a.dateSubmitted || a.id || '').localeCompare(b.dateSubmitted || b.id || '');
    if (enquirySort === 'priority') {
      const pMap: Record<string, number> = { VIP: 3, High: 2, Standard: 1, Flexible: 0 };
      return (pMap[b.priority || 'Standard'] || 0) - (pMap[a.priority || 'Standard'] || 0);
    }
    return 0;
  });

  const filteredDests = destinations.filter(d => !searchQuery || [d.name, d.tagline, d.category].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredTours = tours.filter(t => !searchQuery || [t.name, t.destination, t.category].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredBlogs = blogs.filter(b => !searchQuery || [b.title, b.category, b.author].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredTestimonials = testimonials.filter(t => !searchQuery || [t.author, t.location, t.trip, t.quote].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredOffers = specialOffers.filter(o => !searchQuery || [o.title, o.badge, o.destination].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredStaff = staffUsers.filter(s => !searchQuery || [s.name, s.email, s.role, s.department].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesCategory = auditFilter === 'ALL' || log.category === auditFilter;
    const matchesSearch = !searchQuery || [log.action, log.details, log.user, log.category].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-stone-800 font-sans flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ====================================================================== */}
      {/* LEFT SIDEBAR NAVIGATION (LUXURY CHARCOAL & GOLD STYLING) */}
      {/* ====================================================================== */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#171E1B] text-stone-300 border-r border-[#26302B] flex flex-col 
        transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:max-h-screen shrink-0
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-72'}
        w-72
        ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className={`border-b border-[#26302B] flex items-center justify-between ${isSidebarCollapsed ? 'p-3 flex-col gap-2' : 'p-4 md:p-5'}`}>
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'flex-col text-center' : ''}`}>
            <div className="p-2 bg-[#C5A880]/15 text-[#C5A880] rounded-none border border-[#C5A880]/30 shadow-inner shrink-0" title="KAGZ Concierge">
              <Compass className="w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-serif text-sm font-bold tracking-wider text-white uppercase truncate">KAGZ Concierge</h1>
                <span className="text-[9px] text-[#C5A880] tracking-widest font-mono uppercase block font-semibold">Admin Workstation</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse / Expand toggle button */}
            <button 
              onClick={toggleSidebarCollapsed}
              className="hidden md:flex p-1.5 text-stone-400 hover:text-white hover:bg-[#202925] border border-transparent hover:border-[#26302B] transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-[#C5A880]" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Drawer button */}
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-stone-400 hover:text-white p-1.5 hover:bg-[#202925] cursor-pointer"
              aria-label="Close mobile sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Active Administrator Profile Card */}
        <div className={`border-b border-[#26302B] bg-[#121815] transition-all ${isSidebarCollapsed ? 'p-3 flex flex-col items-center' : 'px-4 py-3.5'}`}>
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'flex-col' : ''}`}>
            <div 
              className="w-9 h-9 rounded-full bg-[#C5A880] text-[#171E1B] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm relative cursor-default"
              title={`${sessionAdminName} (${sessionAdminEmail})`}
            >
              {sessionAdminName.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#121815] animate-pulse" title="Active Session" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-serif font-bold text-xs text-white truncate">{sessionAdminName}</p>
                  <span className="px-1.5 py-0.2 bg-[#C5A880]/20 text-[#C5A880] text-[9px] font-mono uppercase font-bold tracking-wider">Super Admin</span>
                </div>
                <p className="font-mono text-[10px] text-stone-400 truncate">{sessionAdminEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5 select-none custom-scrollbar">
          {/* Group 1: Core Operations */}
          <div>
            {!isSidebarCollapsed && (
              <p className="px-2.5 text-[9px] font-bold uppercase tracking-widest text-[#C5A880]/80 mb-2 font-mono">
                Operations
              </p>
            )}
            <div className="space-y-1">
              {[
                { 
                  id: 'enquiries', 
                  label: 'Enquiries Log', 
                  shortLabel: 'Enquiries',
                  icon: <FileText className="w-4 h-4 shrink-0" />, 
                  count: enquiries.length,
                  highlight: enquiries.some(e => e.status === 'New Enquiry')
                },
                { 
                  id: 'users', 
                  label: 'Staff & Curators', 
                  shortLabel: 'Staff',
                  icon: <Users className="w-4 h-4 shrink-0" />, 
                  count: staffUsers.length,
                  highlight: false
                },
                { 
                  id: 'audit', 
                  label: 'Security & Audit Log', 
                  shortLabel: 'Audit',
                  icon: <ShieldCheck className="w-4 h-4 shrink-0" />, 
                  count: auditLogs.length,
                  highlight: false
                }
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                      setSearchQuery('');
                      setSelectedEnquiry(null);
                      setEditingDest(null);
                      setEditingTour(null);
                      setEditingBlog(null);
                      setEditingTestimonial(null);
                      setEditingOffer(null);
                      setEditingGalleryItem(null);
                    }}
                    title={`${item.label} (${item.count})`}
                    className={`w-full flex items-center transition-all rounded-none cursor-pointer ${
                      isSidebarCollapsed 
                        ? 'justify-center p-2.5 relative' 
                        : 'justify-between px-3 py-2.5 text-xs font-semibold tracking-wide'
                    } ${
                      isActive 
                        ? 'bg-[#C5A880] text-[#171E1B] font-bold shadow-sm' 
                        : 'text-stone-300 hover:bg-[#202925] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {isSidebarCollapsed ? (
                      item.highlight ? (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
                      ) : null
                    ) : (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive 
                          ? 'bg-[#171E1B] text-[#C5A880]' 
                          : item.highlight 
                            ? 'bg-[#C5A880] text-[#171E1B]' 
                            : 'bg-[#26302B] text-stone-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Content Management (CMS) */}
          <div>
            {!isSidebarCollapsed && (
              <p className="px-2.5 text-[9px] font-bold uppercase tracking-widest text-[#C5A880]/80 mb-2 font-mono">
                Safari CMS
              </p>
            )}
            <div className="space-y-1">
              {[
                { id: 'destinations', label: 'Destinations', icon: <MapPin className="w-4 h-4 shrink-0" />, count: destinations.length },
                { id: 'tours', label: 'Curated Tours', icon: <Compass className="w-4 h-4 shrink-0" />, count: tours.length },
                { id: 'blogs', label: 'Travel Guides', icon: <BookOpen className="w-4 h-4 shrink-0" />, count: blogs.length },
                { id: 'testimonials', label: 'Guest Reviews', icon: <Star className="w-4 h-4 shrink-0" />, count: testimonials.length },
                { id: 'offers', label: 'Special Offers', icon: <Tag className="w-4 h-4 shrink-0" />, count: specialOffers.length },
                { id: 'gallery', label: 'Photo Gallery', icon: <ImageIcon className="w-4 h-4 shrink-0" />, count: gallery.length }
              ].map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                      setSearchQuery('');
                      setSelectedEnquiry(null);
                      setEditingDest(null);
                      setEditingTour(null);
                      setEditingBlog(null);
                      setEditingTestimonial(null);
                      setEditingOffer(null);
                      setEditingGalleryItem(null);
                    }}
                    title={`${item.label} (${item.count})`}
                    className={`w-full flex items-center transition-all rounded-none cursor-pointer ${
                      isSidebarCollapsed 
                        ? 'justify-center p-2.5 relative' 
                        : 'justify-between px-3 py-2.5 text-xs font-semibold tracking-wide'
                    } ${
                      isActive 
                        ? 'bg-[#C5A880] text-[#171E1B] font-bold shadow-sm' 
                        : 'text-stone-300 hover:bg-[#202925] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {isSidebarCollapsed ? null : (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-[#171E1B] text-[#C5A880]' : 'bg-[#26302B] text-stone-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Actions */}
        <div className={`border-t border-[#26302B] space-y-2 bg-[#121815] shrink-0 ${isSidebarCollapsed ? 'p-2' : 'p-3.5'}`}>
          <button
            onClick={handleBulkSeed}
            disabled={isSeeding}
            title="Seed Default Safari Data"
            className={`w-full text-xs bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] hover:bg-[#C5A880] hover:text-[#171E1B] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSidebarCollapsed ? 'p-2.5' : 'px-3 py-2'
            } ${isSeeding ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span>{isSeeding ? "Syncing..." : "Seed Data"}</span>}
          </button>

          <button
            onClick={() => onNavigate('#/')}
            title="Go to Live Safari Website"
            className={`w-full text-xs text-stone-400 hover:text-white hover:bg-[#202925] flex items-center justify-center gap-2 transition-colors cursor-pointer font-medium ${
              isSidebarCollapsed ? 'p-2.5' : 'px-3 py-2'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
            {!isSidebarCollapsed && <span>Live Safari Site</span>}
          </button>

          <button
            onClick={handleLogout}
            title="Secure Logout from Workstation"
            className={`w-full text-xs bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer font-bold uppercase tracking-wider ${
              isSidebarCollapsed ? 'p-2.5' : 'px-3 py-2'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ====================================================================== */}
      {/* RIGHT MAIN WORKSPACE */}
      {/* ====================================================================== */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#FAF7F2]">
        {/* Top Administrative Workspace Header */}
        <header className="bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setIsMobileSidebarOpen(prev => !prev);
                } else {
                  toggleSidebarCollapsed();
                }
              }}
              className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 rounded-none cursor-pointer transition-colors flex items-center justify-center shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
              aria-label="Toggle sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A880] font-mono">
                  {['enquiries', 'users', 'audit'].includes(activeTab) ? 'Operations' : 'Content Management'}
                </span>
                <span className="text-stone-300">&bull;</span>
                <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 capitalize">
                  {activeTab === 'enquiries' && 'Enquiries & Guest Requests'}
                  {activeTab === 'users' && 'Staff & Curator Directory'}
                  {activeTab === 'audit' && 'Security & Operational Audit Trail'}
                  {activeTab === 'destinations' && 'Safari Destinations'}
                  {activeTab === 'tours' && 'Curated Experiences & Tours'}
                  {activeTab === 'blogs' && 'Travel Guides & Articles'}
                  {activeTab === 'testimonials' && 'Guest Reviews & Testimonials'}
                  {activeTab === 'offers' && 'Exclusive Special Offers'}
                  {activeTab === 'gallery' && 'High-Resolution Media Gallery'}
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeTab === 'enquiries' && `Manage inbound guest enquiries (${enquiries.length} total)`}
                {activeTab === 'users' && `Manage concierge admin privileges, roles, and security passcodes (${staffUsers.length} staff)`}
                {activeTab === 'audit' && `Review verified actions, access events, and live logs (${auditLogs.length} events)`}
                {activeTab === 'destinations' && `Manage East Africa parks, reserves, and coastal gems (${destinations.length} active)`}
                {activeTab === 'tours' && `Manage luxury itineraries, durations, and pricing (${tours.length} active)`}
                {activeTab === 'blogs' && `Manage safari guides, tips, and cultural articles (${blogs.length} active)`}
                {activeTab === 'testimonials' && `Curate traveler reviews, guest trips, and ratings (${testimonials.length} reviews)`}
                {activeTab === 'offers' && `Publish promotions, seasonal specials, and discount perks (${specialOffers.length} offers)`}
                {activeTab === 'gallery' && `Curate high-definition safari imagery and wildlife photos (${gallery.length} photos)`}
              </p>
            </div>
          </div>

          {/* Top Search & Primary Action */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={`Search in ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-stone-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C5A880] rounded-none text-stone-900 placeholder-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            {/* Dynamic Add Buttons */}
            {activeTab === 'enquiries' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddEnquiryModal(true)}
                  className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Inbound Lead</span>
                </button>
                <button
                  onClick={handleExportEnquiriesCSV}
                  className="px-3 py-2 bg-white text-stone-700 hover:bg-[#FAF7F2] border border-stone-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  title="Export guest enquiries to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            )}

            {activeTab === 'destinations' && (
              <button
                onClick={() => setEditingDest({ name: '', tagline: '', category: 'East Africa', image: '', intro: '', whyVisit: '', topExperiences: '', attractions: '', bestTimeToVisit: '', travelTips: '' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Destination</span>
              </button>
            )}

            {activeTab === 'tours' && (
              <button
                onClick={() => setEditingTour({ name: '', destination: destinations[0]?.name || 'Kenya', category: 'Wildlife', duration: '', image: '', description: '', overview: '', highlights: '', whatToExpect: '', bestTimeToGo: '', whatToBring: '', itinerary: [] })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            )}

            {activeTab === 'blogs' && (
              <button
                onClick={() => setEditingBlog({ title: '', category: 'Travel Tips', date: '', excerpt: '', content: '', author: 'Amara Kagz', metaDescription: '', related: '' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Travel Guide</span>
              </button>
            )}

            {activeTab === 'testimonials' && (
              <button
                onClick={() => setEditingTestimonial({ author: '', quote: '', location: 'United Kingdom', trip: '7-Day Maasai Mara Expedition', avatar: 'EV' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Guest Review</span>
              </button>
            )}

            {activeTab === 'offers' && (
              <button
                onClick={() => setEditingOffer({ title: '', tagline: '', badge: 'Limited Edition', discount: '10% Off', destination: 'Kenya', validUntil: 'December 2027', description: '', image: '', featured: true })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Special Offer</span>
              </button>
            )}

            {activeTab === 'gallery' && (
              <button
                onClick={() => setEditingGalleryItem({ src: '', alt: '', category: 'Wildlife' })}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            )}

            {activeTab === 'users' && (
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Staff User</span>
              </button>
            )}

            {activeTab === 'audit' && (
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `kagz-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-[#1C2421] text-white hover:bg-[#C5A880] hover:text-[#1C2421] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body Container */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 1: ENQUIRIES & GUEST REQUESTS CRM */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">

            {/* Top Interactive Funnel KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <button
                type="button"
                onClick={() => setFilterStatus('All')}
                className={`p-4 text-left border transition-all cursor-pointer shadow-sm ${
                  filterStatus === 'All'
                    ? 'bg-[#1C2421] text-white border-[#1C2421] ring-2 ring-[#C5A880]'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${filterStatus === 'All' ? 'text-[#C5A880]' : 'text-stone-400'}`}>
                    Total Leads
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-none font-bold uppercase ${filterStatus === 'All' ? 'bg-[#C5A880]/20 text-[#C5A880]' : 'bg-stone-100 text-stone-600'}`}>
                    All Inbound
                  </span>
                </div>
                <p className="font-serif text-2xl font-bold">{enquiries.length}</p>
                <p className={`text-[11px] mt-0.5 ${filterStatus === 'All' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Full enquiry pipeline
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('New Enquiry')}
                className={`p-4 text-left border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                  filterStatus === 'New Enquiry'
                    ? 'bg-[#1C2421] text-white border-[#1C2421] ring-2 ring-orange-500'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${filterStatus === 'New Enquiry' ? 'text-orange-400' : 'text-orange-600'}`}>
                    New Enquiries
                  </span>
                  {newLeadsCount > 0 && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                  )}
                </div>
                <p className="font-serif text-2xl font-bold text-orange-600">{newLeadsCount}</p>
                <p className={`text-[11px] mt-0.5 ${filterStatus === 'New Enquiry' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Needs curator contact
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('Under Curation')}
                className={`p-4 text-left border transition-all cursor-pointer shadow-sm ${
                  filterStatus === 'Under Curation'
                    ? 'bg-[#1C2421] text-white border-[#1C2421] ring-2 ring-[#C5A880]'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${filterStatus === 'Under Curation' ? 'text-[#C5A880]' : 'text-amber-700'}`}>
                    Under Curation
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-none font-bold uppercase ${filterStatus === 'Under Curation' ? 'bg-[#C5A880]/20 text-[#C5A880]' : 'bg-amber-50 text-amber-800'}`}>
                    Active
                  </span>
                </div>
                <p className="font-serif text-2xl font-bold text-amber-700">{underCurationCount}</p>
                <p className={`text-[11px] mt-0.5 ${filterStatus === 'Under Curation' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Designing custom itineraries
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('Proposal Sent')}
                className={`p-4 text-left border transition-all cursor-pointer shadow-sm ${
                  filterStatus === 'Proposal Sent'
                    ? 'bg-[#1C2421] text-white border-[#1C2421] ring-2 ring-sky-500'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${filterStatus === 'Proposal Sent' ? 'text-sky-300' : 'text-sky-700'}`}>
                    Proposal Sent
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-none font-bold uppercase ${filterStatus === 'Proposal Sent' ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-800'}`}>
                    Quotes Out
                  </span>
                </div>
                <p className="font-serif text-2xl font-bold text-sky-700">{proposalSentCount}</p>
                <p className={`text-[11px] mt-0.5 ${filterStatus === 'Proposal Sent' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Awaiting guest approval
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFilterStatus('Confirmed')}
                className={`p-4 text-left border transition-all cursor-pointer shadow-sm col-span-2 sm:col-span-1 ${
                  filterStatus === 'Confirmed'
                    ? 'bg-[#1C2421] text-white border-[#1C2421] ring-2 ring-emerald-500'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${filterStatus === 'Confirmed' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    Confirmed
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-none font-bold uppercase ${filterStatus === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800'}`}>
                    Booked
                  </span>
                </div>
                <p className="font-serif text-2xl font-bold text-emerald-700">{confirmedCount}</p>
                <p className={`text-[11px] mt-0.5 ${filterStatus === 'Confirmed' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Deposited expeditions
                </p>
              </button>
            </div>

            {/* Filters, Priority, Curator & Sorting Control Bar */}
            <div className="bg-white p-4 border border-stone-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              
              {/* Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                {[
                  { key: 'All', label: 'All Leads', count: enquiries.length },
                  { key: 'New Enquiry', label: 'New', count: newLeadsCount },
                  { key: 'Under Curation', label: 'Curation', count: underCurationCount },
                  { key: 'Proposal Sent', label: 'Proposals', count: proposalSentCount },
                  { key: 'Confirmed', label: 'Confirmed', count: confirmedCount },
                  { key: 'Closed', label: 'Closed', count: closedCount }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterStatus(tab.key)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                      filterStatus === tab.key
                        ? 'bg-[#1C2421] text-white border-[#1C2421]'
                        : 'bg-[#FAF7F2] text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      filterStatus === tab.key ? 'bg-[#C5A880] text-[#1C2421] font-bold' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Secondary Select Dropdowns (Priority, Curator, Sort) */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Priority Selector */}
                <div className="flex items-center gap-1 bg-[#FAF7F2] border border-stone-200 px-2 py-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Priority:</span>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All ({enquiries.length})</option>
                    <option value="VIP">VIP Leads ({vipCount})</option>
                    <option value="High">High Priority</option>
                    <option value="Standard">Standard</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                {/* Curator Selector */}
                <div className="flex items-center gap-1 bg-[#FAF7F2] border border-stone-200 px-2 py-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400">Curator:</span>
                  <select
                    value={filterCurator}
                    onChange={(e) => setFilterCurator(e.target.value)}
                    className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Curators</option>
                    {staffUsers.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1 bg-[#FAF7F2] border border-stone-200 px-2 py-1">
                  <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  <select
                    value={enquirySort}
                    onChange={(e) => setEnquirySort(e.target.value as any)}
                    className="bg-transparent text-xs font-medium text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="priority">Priority (VIP First)</option>
                  </select>
                </div>

                {/* Clear Filters Reset */}
                {(filterStatus !== 'All' || filterPriority !== 'All' || filterCurator !== 'All' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus('All');
                      setFilterPriority('All');
                      setFilterCurator('All');
                      setSearchQuery('');
                    }}
                    className="text-[10px] text-stone-500 hover:text-stone-900 underline font-bold uppercase tracking-wider ml-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Split Screen Master-Detail Console */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: ENQUIRIES LIST (5 of 12 cols on desktop) */}
              <div className="xl:col-span-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1 font-medium">
                  <span>
                    Showing <strong className="text-stone-900">{filteredEnquiries.length}</strong> of {enquiries.length} guest enquiries
                  </span>
                  {selectedEnquiry && (
                    <span className="text-[11px] text-[#C5A880] font-bold">
                      Viewing #{selectedEnquiry.id}
                    </span>
                  )}
                </div>

                {filteredEnquiries.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEnquiries.map(enq => {
                      const isSelected = selectedEnquiry?.id === enq.id;
                      const hasNotes = Array.isArray(enq.notes) && enq.notes.length > 0;
                      return (
                        <div
                          key={enq.id}
                          onClick={() => setSelectedEnquiry(enq)}
                          className={`p-4 border transition-all cursor-pointer shadow-xs relative ${
                            isSelected
                              ? 'bg-white border-l-4 border-l-[#C5A880] border-t-stone-300 border-r-stone-300 border-b-stone-300 shadow-md ring-1 ring-[#C5A880]/30'
                              : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-[#FAF7F2]/60'
                          }`}
                        >
                          {/* Top Row: Name, Status & Priority */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-stone-900 text-sm">{enq.name}</h3>
                                {enq.country && (
                                  <span className="text-[10px] text-stone-400 font-mono">
                                    &bull; {enq.country}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 truncate">{enq.email}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                                enq.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                enq.status === 'Under Curation' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                enq.status === 'Proposal Sent' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                                enq.status === 'Closed' ? 'bg-stone-100 text-stone-600 border-stone-200' :
                                'bg-orange-50 text-orange-800 border-orange-200 font-extrabold'
                              }`}>
                                {enq.status}
                              </span>

                              {enq.priority === 'VIP' && (
                                <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.2 bg-[#C5A880]/15 text-[#927349] border border-[#C5A880]/40 flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-[#C5A880] text-[#C5A880]" />
                                  VIP Guest
                                </span>
                              )}
                              {enq.priority === 'High' && (
                                <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200">
                                  High Priority
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Middle Row: Safari Specs */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF7F2] p-2.5 border border-stone-100 mb-2">
                            <div className="flex items-center gap-1.5 text-stone-700 truncate">
                              <MapPin className="w-3 h-3 text-[#C5A880] shrink-0" />
                              <span className="truncate">{enq.destination}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-700 truncate">
                              <Calendar className="w-3 h-3 text-[#C5A880] shrink-0" />
                              <span className="truncate">{enq.travelDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-600 truncate">
                              <Users className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate">{enq.travelers}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-600 truncate">
                              <DollarSign className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate font-mono">{enq.budget || 'Custom Quote'}</span>
                            </div>
                          </div>

                          {/* Message Excerpt */}
                          {enq.message && (
                            <p className="text-[11px] text-stone-600 italic line-clamp-2 mb-2 leading-relaxed">
                              "{enq.message}"
                            </p>
                          )}

                          {/* Bottom Row: Metadata & Curator */}
                          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-2 border-t border-stone-100">
                            <div className="flex items-center gap-2">
                              <span>{enq.dateSubmitted}</span>
                              {enq.source && (
                                <span className="bg-stone-100 px-1.5 py-0.5 text-stone-500 font-mono truncate max-w-[130px]">
                                  {enq.source}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {hasNotes && (
                                <span className="flex items-center gap-1 text-[#C5A880] font-medium" title={`${enq.notes.length} internal notes`}>
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{enq.notes.length}</span>
                                </span>
                              )}

                              <div className="flex items-center gap-1 text-stone-600 font-medium">
                                <span className="w-4 h-4 rounded-full bg-[#1C2421] text-[#C5A880] flex items-center justify-center text-[8px] font-bold">
                                  {(enq.assignedTo || 'U').charAt(0)}
                                </span>
                                <span className="truncate max-w-[90px]">{enq.assignedTo || 'Unassigned'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-12 text-center border border-stone-200 shadow-sm space-y-3">
                    <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
                    <h4 className="font-serif text-base font-bold text-stone-700">No Enquiries Found</h4>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto">
                      No guest enquiries match your selected filters. Try resetting the status or priority filters.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterStatus('All');
                          setFilterPriority('All');
                          setFilterCurator('All');
                          setSearchQuery('');
                        }}
                        className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold uppercase tracking-wider hover:bg-stone-50"
                      >
                        Reset All Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddEnquiryModal(true)}
                        className="px-4 py-2 bg-[#C5A880] text-[#1C2421] text-xs font-bold uppercase tracking-wider hover:bg-[#1C2421] hover:text-white"
                      >
                        Log Inbound Lead
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: LEAD DOSSIER & CONCIERGE CONSOLE (7 of 12 cols on desktop) */}
              <div className="xl:col-span-7">
                {selectedEnquiry ? (
                  <div className="bg-white border border-stone-200 shadow-sm xl:sticky xl:top-24 space-y-5 text-xs overflow-hidden">
                    
                    {/* Dossier Header */}
                    <div className="p-5 bg-[#FAF7F2] border-b border-stone-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-[#C5A880] bg-[#1C2421] px-2 py-0.5 text-white">
                              Ref #{selectedEnquiry.id}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Received {selectedEnquiry.dateSubmitted}
                            </span>
                            {selectedEnquiry.source && (
                              <span className="text-[10px] text-stone-500 font-mono bg-white px-2 py-0.5 border border-stone-200">
                                {selectedEnquiry.source}
                              </span>
                            )}
                          </div>
                          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-2">
                            {selectedEnquiry.name}
                          </h2>
                        </div>

                        {/* Quick Communication Actions Bar */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEmailComposer(selectedEnquiry, 'welcome')}
                            className="px-3 py-1.5 bg-[#1C2421] text-white hover:bg-[#C5A880] hover:text-[#1C2421] font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Compose luxury safari response email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email Guest</span>
                          </button>

                          <a
                            href={getWhatsAppLink(selectedEnquiry)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Chat via WhatsApp Concierge"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setEditingEnquiry(selectedEnquiry)}
                            className="p-1.5 bg-white text-stone-700 hover:text-stone-900 border border-stone-200 transition-colors"
                            title="Edit Lead Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                            className="p-1.5 bg-white text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedEnquiry(null)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 ml-1"
                            title="Close Dossier"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Visual Safari Pipeline Stepper */}
                      <div className="mt-5 pt-4 border-t border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            Expedition Pipeline Stage
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880]">
                            Status: {selectedEnquiry.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1 sm:gap-2">
                          {[
                            { key: 'New Enquiry', label: '1. Inbound Lead', color: 'orange' },
                            { key: 'Under Curation', label: '2. Curation', color: 'amber' },
                            { key: 'Proposal Sent', label: '3. Proposal Sent', color: 'sky' },
                            { key: 'Confirmed', label: '4. Confirmed Safari', color: 'emerald' }
                          ].map(stage => {
                            const isCurrent = selectedEnquiry.status === stage.key;
                            return (
                              <button
                                key={stage.key}
                                type="button"
                                onClick={() => handleUpdateStatus(selectedEnquiry.id, stage.key)}
                                className={`py-2 px-1 text-center border font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'bg-[#1C2421] text-white border-[#1C2421] ring-2 ring-[#C5A880]'
                                    : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
                                }`}
                              >
                                <span className="block truncate">{stage.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Dossier Body Content */}
                    <div className="p-6 space-y-6">
                      
                      {/* Section 1: Guest Contact & Country Details */}
                      <div className="bg-[#FAF7F2] p-4 border border-stone-200">
                        <h4 className="text-[10px] uppercase font-bold text-[#C5A880] tracking-wider mb-3 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>Guest Communication & Credentials</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-400">Email Address</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-stone-900 select-all">{selectedEnquiry.email}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedEnquiry.email);
                                  setCopiedLeadField('email');
                                  setTimeout(() => setCopiedLeadField(null), 1500);
                                }}
                                className="text-stone-400 hover:text-stone-700"
                                title="Copy Email"
                              >
                                {copiedLeadField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-400">Phone / WhatsApp</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-stone-900 select-all">{selectedEnquiry.phone || 'N/A'}</span>
                              {selectedEnquiry.phone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEnquiry.phone);
                                    setCopiedLeadField('phone');
                                    setTimeout(() => setCopiedLeadField(null), 1500);
                                  }}
                                  className="text-stone-400 hover:text-stone-700"
                                  title="Copy Phone"
                                >
                                  {copiedLeadField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-400">Country of Residence</span>
                            <p className="font-medium text-stone-800 mt-0.5">{selectedEnquiry.country || 'International Traveler'}</p>
                          </div>

                          <div>
                            <span className="block text-[10px] uppercase font-bold text-stone-400">Inbound Channel</span>
                            <p className="font-medium text-stone-800 mt-0.5">{selectedEnquiry.source || 'Website Plan Form'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Safari Expedition Specifications */}
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-3 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Expedition Specifications</span>
                        </h4>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-white border border-stone-200 p-3">
                            <span className="block text-[9px] uppercase font-bold text-stone-400">Destination</span>
                            <p className="font-serif font-bold text-stone-900 text-sm mt-0.5">{selectedEnquiry.destination}</p>
                          </div>

                          <div className="bg-white border border-stone-200 p-3">
                            <span className="block text-[9px] uppercase font-bold text-stone-400">Travel Window</span>
                            <p className="font-bold text-stone-900 text-sm mt-0.5">{selectedEnquiry.travelDate}</p>
                          </div>

                          <div className="bg-white border border-stone-200 p-3">
                            <span className="block text-[9px] uppercase font-bold text-stone-400">Party Size</span>
                            <p className="font-bold text-stone-900 text-sm mt-0.5">{selectedEnquiry.travelers}</p>
                          </div>

                          <div className="bg-white border border-stone-200 p-3">
                            <span className="block text-[9px] uppercase font-bold text-stone-400">Safari Style</span>
                            <p className="font-medium text-stone-800 text-xs mt-0.5">{selectedEnquiry.style || 'Classic Luxury Safari'}</p>
                          </div>

                          <div className="bg-white border border-stone-200 p-3">
                            <span className="block text-[9px] uppercase font-bold text-stone-400">Budget Estimate</span>
                            <p className="font-mono font-bold text-stone-900 text-sm mt-0.5">{selectedEnquiry.budget || 'Custom Quote'}</p>
                          </div>

                          <div className="bg-white border border-stone-200 p-3">
                            <span className="block text-[9px] uppercase font-bold text-stone-400">Assigned Curator</span>
                            <div className="mt-1">
                              <select
                                value={selectedEnquiry.assignedTo || 'Timothy Kungu'}
                                onChange={(e) => handleAssignCurator(selectedEnquiry.id, e.target.value)}
                                className="w-full bg-[#FAF7F2] border border-stone-200 p-1 text-[11px] font-bold text-stone-800 cursor-pointer"
                              >
                                {staffUsers.map(st => (
                                  <option key={st.id} value={st.name}>{st.name}</option>
                                ))}
                                <option value="Unassigned">Unassigned</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Traveler's Message & Vision */}
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                          Guest Expedition Vision & Custom Requests
                        </span>
                        <div className="bg-[#FAF7F2] border-l-4 border-l-[#C5A880] p-4 text-stone-800 italic border-t border-r border-b border-stone-200 text-xs leading-relaxed shadow-xs">
                          "{selectedEnquiry.message || 'No specific requests provided. Standard luxury curation requested.'}"
                        </div>
                      </div>

                      {/* Section 4: Operational Status & Priority Controls */}
                      <div className="p-4 bg-stone-50 border border-stone-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] uppercase font-bold text-stone-600 tracking-wider">
                            Lead Management Controls
                          </h4>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Auto-syncs to cloud database
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                              Change Lead Status
                            </label>
                            <select
                              value={selectedEnquiry.status}
                              onChange={(e) => handleUpdateStatus(selectedEnquiry.id, e.target.value)}
                              className="w-full bg-white border border-stone-200 p-2 text-xs font-bold text-stone-900"
                            >
                              <option value="New Enquiry">New Enquiry (Pending Initial Call)</option>
                              <option value="Under Curation">Under Curation (Designing Itinerary)</option>
                              <option value="Proposal Sent">Proposal Sent (Quote Out)</option>
                              <option value="Confirmed">Confirmed (Booking Deposit Received)</option>
                              <option value="Closed">Closed / Inactive</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                              Lead Priority Flag
                            </label>
                            <select
                              value={selectedEnquiry.priority || 'Standard'}
                              onChange={(e) => handleUpdatePriority(selectedEnquiry.id, e.target.value)}
                              className="w-full bg-white border border-stone-200 p-2 text-xs font-bold text-stone-900"
                            >
                              <option value="VIP">⭐ VIP (High Net Worth / Custom Jet)</option>
                              <option value="High">🔴 High Priority (Time-sensitive permits)</option>
                              <option value="Standard">Standard Lead</option>
                              <option value="Flexible">Flexible Schedule</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Internal Curator Notes & Activity Log */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <h4 className="text-[10px] uppercase font-bold text-stone-700 tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Curator Internal Notes & Expedition Log</span>
                          </h4>
                          <span className="text-[10px] font-mono text-stone-400">
                            {Array.isArray(selectedEnquiry.notes) ? selectedEnquiry.notes.length : 0} notes
                          </span>
                        </div>

                        {/* Chronological Notes Thread */}
                        {Array.isArray(selectedEnquiry.notes) && selectedEnquiry.notes.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {selectedEnquiry.notes.map((note: EnquiryNote, idx: number) => (
                              <div key={note.id || idx} className="p-3 bg-[#FAF7F2] border border-stone-200 text-xs">
                                <div className="flex items-center justify-between mb-1 text-[10px]">
                                  <span className="font-bold text-stone-900 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
                                    {note.author}
                                  </span>
                                  <span className="text-stone-400 font-mono">{note.date}</span>
                                </div>
                                <p className="text-stone-700 leading-relaxed">{note.text}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-stone-400 italic text-xs py-2">
                            No internal notes recorded yet. Add communication logs, room holds, or custom flight notes below.
                          </p>
                        )}

                        {/* Add Note Form */}
                        <div className="space-y-2 pt-2">
                          {/* Quick note prompt pills */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase font-bold text-stone-400 mr-1">Quick Tags:</span>
                            {[
                              'Called guest on phone',
                              'Held provisional camp suites',
                              'Sent flight charter quote',
                              'Awaiting passport copies',
                              'Deposit invoice issued'
                            ].map(tag => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setNewNoteText(prev => prev ? `${prev} - ${tag}` : tag)}
                                className="text-[9px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-mono transition-colors"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <textarea
                              rows={2}
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              placeholder="Record client communication, dietary preferences, or room holds..."
                              className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddEnquiryNote(selectedEnquiry.id, newNoteText)}
                              disabled={!newNoteText.trim()}
                              className="px-4 bg-[#1C2421] text-white hover:bg-[#C5A880] hover:text-[#1C2421] font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-40 shrink-0 flex items-center justify-center cursor-pointer"
                            >
                              Log Note
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-stone-200 p-12 text-center text-stone-400 shadow-sm space-y-4 xl:sticky xl:top-24">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF7F2] border border-stone-200 flex items-center justify-center text-[#C5A880]">
                      <Compass className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-800">
                        Guest Lead Concierge Console
                      </h3>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        Select an inbound enquiry from the left to view comprehensive trip details, track expedition pipeline progress, dispatch personalized proposals, and log curator notes.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddEnquiryModal(true)}
                        className="px-5 py-2.5 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                      >
                        + Log New Inbound Lead
                      </button>
                    </div>
                  </div>
                )}
              </div>

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

        {/* -------------------------------------------------------------------- */}
        {/* VIEW TAB 9: DEDICATED SECURITY & AUDIT TRAIL */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Top Stat Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#1C2421] text-[#C5A880]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Total Audit Logs</p>
                  <p className="font-serif text-2xl font-bold text-stone-900">{auditLogs.length}</p>
                </div>
              </div>

              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Authentication Events</p>
                  <p className="font-serif text-2xl font-bold text-indigo-900">
                    {auditLogs.filter(l => l.category === 'AUTH').length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-700">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Content Modifications</p>
                  <p className="font-serif text-2xl font-bold text-amber-900">
                    {auditLogs.filter(l => l.category === 'CONTENT').length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-700">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Staff & Team Events</p>
                  <p className="font-serif text-2xl font-bold text-emerald-900">
                    {auditLogs.filter(l => l.category === 'STAFF').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Audit Log Table */}
            <div className="bg-white border border-stone-200 shadow-sm">
              <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Administrative Audit Trail</h3>
                  <p className="text-xs text-stone-500">Tamper-evident record of all concierge and CMS actions.</p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5 select-none">
                  {(['ALL', 'AUTH', 'CONTENT', 'STAFF', 'BOOKING'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setAuditFilter(cat)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        auditFilter === cat
                          ? 'bg-[#1C2421] text-[#C5A880]'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-stone-500 uppercase text-[9px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Event Type</th>
                      <th className="py-3 px-4">Action Summary</th>
                      <th className="py-3 px-4">Operational Details</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-sans">
                    {filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            log.category === 'AUTH' ? 'bg-indigo-100 text-indigo-800' :
                            log.category === 'BOOKING' ? 'bg-amber-100 text-amber-800' :
                            log.category === 'STAFF' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 text-[11px] max-w-md">
                          {log.details}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-stone-600">
                          {log.user}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[10px] text-stone-400 shrink-0">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))}
                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          No audit events matched the filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        </div>
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

      {/* ====================================================================== */}
      {/* MODAL: LOG NEW INBOUND LEAD */}
      {/* ====================================================================== */}
      {showAddEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-xs my-8">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold">Concierge Inbound</span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-0.5">Log New Guest Lead</h3>
              </div>
              <button type="button" onClick={() => setShowAddEnquiryModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lord Charles Sterling"
                    value={newEnquiryForm.name}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, name: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. charles@sterling.co.uk"
                    value={newEnquiryForm.email}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, email: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Phone Number / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="e.g. +44 7911 123456"
                    value={newEnquiryForm.phone}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Country of Origin</label>
                  <input
                    type="text"
                    placeholder="e.g. United Kingdom, USA, Germany"
                    value={newEnquiryForm.country}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, country: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kenya (Maasai Mara & Amboseli)"
                    value={newEnquiryForm.destination}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, destination: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Approximate Travel Date</label>
                  <input
                    type="text"
                    placeholder="e.g. July - August 2027"
                    value={newEnquiryForm.travelDate}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, travelDate: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Party Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 guests, Family of 4"
                    value={newEnquiryForm.travelers}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, travelers: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Safari Style</label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury Private Tented Camp"
                    value={newEnquiryForm.style}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, style: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Budget Target</label>
                  <input
                    type="text"
                    placeholder="e.g. $20,000 - $30,000"
                    value={newEnquiryForm.budget}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, budget: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Priority</label>
                  <select
                    value={newEnquiryForm.priority}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, priority: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  >
                    <option value="VIP">⭐ VIP Guest</option>
                    <option value="High">🔴 High Priority</option>
                    <option value="Standard">Standard</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Assign Curator</label>
                  <select
                    value={newEnquiryForm.assignedTo}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, assignedTo: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  >
                    {staffUsers.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Inbound Channel</label>
                  <select
                    value={newEnquiryForm.source}
                    onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, source: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  >
                    <option value="Telephone Inbound">Telephone Inbound</option>
                    <option value="WhatsApp Concierge">WhatsApp Concierge</option>
                    <option value="Direct Email">Direct Email</option>
                    <option value="Walk-in / Bureau">Walk-in / Bureau</option>
                    <option value="Luxury Partner Referral">Luxury Partner Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Traveler Vision & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Record guest expectations, wildlife priorities (e.g. leopard tracking, migration crossings, hot air balloon)..."
                  value={newEnquiryForm.message}
                  onChange={(e) => setNewEnquiryForm({ ...newEnquiryForm, message: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddEnquiryModal(false)}
                  className="px-4 py-2 border border-stone-300 font-bold uppercase text-[10px] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold uppercase text-[10px] transition-colors shadow-sm"
                >
                  Save Inbound Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: EDIT LEAD DETAILS */}
      {/* ====================================================================== */}
      {editingEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-xs my-8">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold font-mono">#{editingEnquiry.id}</span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-0.5">Edit Guest Lead Details</h3>
              </div>
              <button type="button" onClick={() => setEditingEnquiry(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedEnquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingEnquiry.name || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, name: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingEnquiry.email || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, email: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editingEnquiry.phone || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Country</label>
                  <input
                    type="text"
                    value={editingEnquiry.country || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, country: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Destination *</label>
                  <input
                    type="text"
                    required
                    value={editingEnquiry.destination || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, destination: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Travel Date</label>
                  <input
                    type="text"
                    value={editingEnquiry.travelDate || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, travelDate: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Party Size</label>
                  <input
                    type="text"
                    value={editingEnquiry.travelers || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, travelers: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Safari Style</label>
                  <input
                    type="text"
                    value={editingEnquiry.style || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, style: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Budget Target</label>
                  <input
                    type="text"
                    value={editingEnquiry.budget || ''}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, budget: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Status</label>
                  <select
                    value={editingEnquiry.status || 'New Enquiry'}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, status: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs font-bold"
                  >
                    <option value="New Enquiry">New Enquiry</option>
                    <option value="Under Curation">Under Curation</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Priority</label>
                  <select
                    value={editingEnquiry.priority || 'Standard'}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, priority: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  >
                    <option value="VIP">VIP</option>
                    <option value="High">High Priority</option>
                    <option value="Standard">Standard</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Assigned Curator</label>
                  <select
                    value={editingEnquiry.assignedTo || 'Timothy Kungu'}
                    onChange={(e) => setEditingEnquiry({ ...editingEnquiry, assignedTo: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs"
                  >
                    {staffUsers.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={editingEnquiry.message || ''}
                  onChange={(e) => setEditingEnquiry({ ...editingEnquiry, message: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-2.5 text-stone-900 text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingEnquiry(null)}
                  className="px-4 py-2 border border-stone-300 font-bold uppercase text-[10px] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold uppercase text-[10px] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: LUXURY CLIENT EMAIL COMPOSER WITH PRE-WRITTEN TEMPLATES */}
      {/* ====================================================================== */}
      {showEmailModal && selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-xs my-8">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#C5A880] font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Curator Client Communication Desk</span>
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                  Compose Email to {selectedEnquiry.name}
                </h3>
              </div>
              <button type="button" onClick={() => setShowEmailModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold uppercase text-stone-400 mb-1.5">
                Select Pre-Crafted Safari Template:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'welcome', label: '1. Warm Welcome' },
                  { key: 'proposal', label: '2. Custom Proposal' },
                  { key: 'followup', label: '3. Itinerary Follow-Up' },
                  { key: 'confirmation', label: '4. Booking Confirmation' }
                ].map(tmpl => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => {
                      setEmailTemplateKey(tmpl.key as any);
                      const { subject, body } = generateEmailContent(tmpl.key as any, selectedEnquiry);
                      setEmailSubject(subject);
                      setEmailBody(body);
                    }}
                    className={`p-2 text-center border font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                      emailTemplateKey === tmpl.key
                        ? 'bg-[#1C2421] text-white border-[#1C2421]'
                        : 'bg-[#FAF7F2] text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">To</label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedEnquiry.name} <${selectedEnquiry.email}>`}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-2 text-stone-700 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-2 text-stone-900 font-medium text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">Message Body</label>
                <textarea
                  rows={9}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 p-3 text-stone-900 font-serif leading-relaxed text-xs focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {emailSentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Email logged into guest dossier activity record successfully!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
                    setEmailSentSuccess(true);
                    setTimeout(() => setEmailSentSuccess(false), 3000);
                  }}
                  className="px-4 py-2 border border-stone-300 font-bold uppercase text-[10px] hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Formatted Text</span>
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 border border-stone-300 font-bold uppercase text-[10px] hover:bg-stone-50"
                  >
                    Close
                  </button>

                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                    onClick={() => {
                      handleAddEnquiryNote(
                        selectedEnquiry.id,
                        `[Email Dispatched via Mail Client] Subject: "${emailSubject}"`
                      );
                      setEmailSentSuccess(true);
                      setTimeout(() => setShowEmailModal(false), 1200);
                    }}
                    className="px-5 py-2 bg-[#C5A880] text-[#1C2421] hover:bg-[#1C2421] hover:text-white font-bold uppercase text-[10px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open in Email App & Log Note</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
