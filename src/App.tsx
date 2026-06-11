import React, { useState, useEffect } from 'react';
import {
  campusLocations,
  campusVendors,
  transportRoutes,
  activeBuses,
  CampusLocation,
  Vendor,
  TransportRoute,
  Bus,
  LocationReview
} from './data/campusData';
import InteractiveMap from './components/InteractiveMap';
import LocationDetails from './components/LocationDetails';
import VendorDetails from './components/VendorDetails';
import SeatBooking from './components/SeatBooking';
import AIAssistant from './components/AIAssistant';
import {
  Compass,
  Store,
  Bus as BusIcon,
  User as UserIcon,
  Search,
  Star,
  MapPin,
  Heart,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  QrCode,
  Shield,
  Trash2,
  Bookmark,
  Share2,
  Clock,
  LogOut,
  Sliders,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfile {
  name: string;
  role: 'fresher' | 'returning' | 'visitor' | 'parent' | 'tourist';
  email: string;
  matricNo?: string;
  joinedAt: string;
}

export default function App() {
  // Global States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState<'Explore' | 'Marketplace' | 'Transport' | 'Profile'>('Explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLocation, setActiveLocation] = useState<CampusLocation | null>(null);
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [initialBookingStopId, setInitialBookingStopId] = useState<string | undefined>(undefined);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Persistence States synced with localStorage
  const [savedLocIds, setSavedLocIds] = useState<string[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vendorReviews, setVendorReviews] = useState<{ [key: string]: LocationReview[] }>({});

  // Dynamic user input state for onboarding
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authRole, setAuthRole] = useState<'fresher' | 'returning' | 'visitor' | 'parent'>('fresher');
  const [isSignUp, setIsSignUp] = useState(true);
  const [mobileStep, setMobileStep] = useState<'welcome' | 'auth'>('welcome');

  // Load persistence states on startup
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('findin_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedFavs = localStorage.getItem('findin_favorites');
      if (savedFavs) {
        setSavedLocIds(JSON.parse(savedFavs));
      }

      const savedBookings = localStorage.getItem('findin_bookings');
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }

      const savedReviews = localStorage.getItem('findin_reviews');
      if (savedReviews) {
        setVendorReviews(JSON.parse(savedReviews));
      }
    } catch (e) {
      console.error('Error loading localStorage:', e);
    }
  }, []);

  // Save changes to localStorage
  const saveUserToLocalStorage = (profile: UserProfile | null) => {
    setUser(profile);
    if (profile) {
      localStorage.setItem('findin_user', JSON.stringify(profile));
    } else {
      localStorage.removeItem('findin_user');
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;

    if (!isSignUp) {
      // Sign In Flow
      const savedUserStr = localStorage.getItem('findin_user');
      let profile: UserProfile | null = null;
      if (savedUserStr) {
        try {
          const stored = JSON.parse(savedUserStr);
          if (stored && typeof stored === 'object' && stored.email && stored.email.toLowerCase() === authEmail.trim().toLowerCase()) {
            profile = stored;
          }
        } catch (err) {
          console.error("Error reading stored user:", err);
        }
      }

      // If no stored profile or email mismatch, simulate auto-generation so login never blocks
      if (!profile) {
        const simulatedName = authName.trim() || authEmail.trim().split('@')[0];
        const yearCode = authRole === 'fresher' ? '25' : '22';
        const deptValue = Math.floor(100 + Math.random() * 900);
        const mNo = authRole === 'visitor' || authRole === 'parent' ? undefined : `${yearCode}0805${deptValue}`;
        
        profile = {
          name: simulatedName.charAt(0).toUpperCase() + simulatedName.slice(1),
          email: authEmail.trim(),
          role: authRole,
          matricNo: mNo,
          joinedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
      }

      saveUserToLocalStorage(profile);
      setSelectedTab('Explore');
      return;
    }

    // Sign Up Flow
    if (!authName.trim()) return;
    const yearCode = authRole === 'fresher' ? '25' : '22';
    const deptValue = Math.floor(100 + Math.random() * 900);
    const mNo = authRole === 'visitor' || authRole === 'parent' 
      ? undefined 
      : `${yearCode}0805${deptValue}`;

    const profile: UserProfile = {
      name: authName.trim(),
      email: authEmail.trim(),
      role: authRole,
      matricNo: mNo,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    saveUserToLocalStorage(profile);
    setSelectedTab('Explore');
  };

  // Toggle saved favorites
  const toggleFavorite = (locId: string) => {
    let nextFavs;
    if (savedLocIds.includes(locId)) {
      nextFavs = savedLocIds.filter(id => id !== locId);
    } else {
      nextFavs = [...savedLocIds, locId];
    }
    setSavedLocIds(nextFavs);
    localStorage.setItem('findin_favorites', JSON.stringify(nextFavs));
  };

  // Add new dynamic review to campus catalog
  const handleAddVendorReview = (vendorId: string, review: Omit<LocationReview, 'id' | 'date'>) => {
    const fullReview: LocationReview = {
      ...review,
      id: 'rev-' + Math.floor(Math.random() * 100000),
      date: 'Just now'
    };

    const nextReviews = {
      ...vendorReviews,
      [vendorId]: [fullReview, ...(vendorReviews[vendorId] || [])]
    };

    setVendorReviews(nextReviews);
    localStorage.setItem('findin_reviews', JSON.stringify(nextReviews));

    // Optimistically update rating inside our visual modal
    if (activeVendor && activeVendor.id === vendorId) {
      setActiveVendor({
        ...activeVendor,
        reviews: [fullReview, ...activeVendor.reviews],
        reviewsCount: activeVendor.reviewsCount + 1,
        rating: parseFloat(((activeVendor.rating * activeVendor.reviewsCount + review.rating) / (activeVendor.reviewsCount + 1)).toFixed(1))
      });
    }
  };

  // Log active bookings
  const handleAddNewBooking = (newBooking: any) => {
    const nextBookings = [newBooking, ...bookings];
    setBookings(nextBookings);
    localStorage.setItem('findin_bookings', JSON.stringify(nextBookings));
  };

  const cancelBooking = (id: string) => {
    const next = bookings.filter(b => b.id !== id);
    setBookings(next);
    localStorage.setItem('findin_bookings', JSON.stringify(next));
  };

  const handleSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const confirmSignOut = () => {
    setUser(null);
    localStorage.removeItem('findin_user');
    setSelectedTab('Explore');
    setShowLogoutConfirm(false);
  };

  const resetAllData = () => {
    setShowResetConfirm(true);
  };

  const confirmResetAllData = () => {
    localStorage.clear();
    setUser(null);
    setBookings([]);
    setSavedLocIds([]);
    setVendorReviews({});
    setSelectedTab('Explore');
    setShowResetConfirm(false);
  };

  // AI Actions Trigger System Prompts Actions Custom Parsing
  const handleAITriggerAction = (actionType: string, payload: string) => {
    console.log(`Executing AI Command: ${actionType} -> ${payload}`);
    
    switch (actionType) {
      case 'NAVIGATE':
        const cleanPayload = payload.trim().charAt(0).toUpperCase() + payload.trim().slice(1).toLowerCase();
        if (['Explore', 'Marketplace', 'Transport', 'Profile'].includes(cleanPayload)) {
          setSelectedTab(cleanPayload as any);
        }
        break;
      
      case 'SHOW_LOCATION':
        const matchedLoc = campusLocations.find(l => l.id === payload.trim());
        if (matchedLoc) {
          setActiveLocation(matchedLoc);
        }
        break;

      case 'SHOW_VENDOR':
        const matchedVen = campusVendors.find(v => v.id === payload.trim());
        if (matchedVen) {
          setActiveVendor(matchedVen);
        }
        break;

      case 'BOOK_SHUTTLE':
        setShowBookingModal(true);
        // If route or stop matching, bind it
        const possibleLoc = campusLocations.find(l => l.name.toLowerCase() === payload.toLowerCase() || l.id === payload);
        if (possibleLoc) {
          setInitialBookingStopId(possibleLoc.id);
        }
        break;

      default:
        break;
    }
  };

  // Filter Locations for Discovery list
  const filteredLocations = campusLocations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter Campus Vendors
  const filteredVendors = campusVendors.map(v => {
    // Merge dynamic localStorage evaluations
    const custom = vendorReviews[v.id] || [];
    return {
      ...v,
      reviews: [...custom, ...v.reviews],
      reviewsCount: v.reviewsCount + custom.length,
      rating: custom.length > 0 
        ? parseFloat(((v.rating * v.reviewsCount + custom.reduce((sum, r) => sum + r.rating, 0)) / (v.reviewsCount + custom.length)).toFixed(1))
        : v.rating
    };
  }).filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Onboarding Screen Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col lg:flex-row selection:bg-red-600 selection:text-white relative overflow-hidden w-full">
        
        {/* Left Side: Logo & Abstract Wallpaper */}
        <div 
          className={`bg-neutral-950 p-8 md:p-16 flex flex-col justify-between overflow-hidden transition-all duration-[1000ms] ease-in-out min-h-screen ${
            mobileStep === 'welcome' 
              ? 'absolute inset-0 w-full z-20 opacity-100 scale-100 pointer-events-auto' 
              : 'absolute inset-0 w-full z-20 opacity-0 scale-90 pointer-events-none'
          } lg:relative lg:inset-auto lg:w-1/2 lg:z-auto lg:opacity-100 lg:scale-100 lg:pointer-events-auto lg:flex`}
        >
          {/* Abstract geometric shapes & grid wallpaper backdrop with smooth scaling/zoom transition */}
          <div 
            className={`absolute inset-0 opacity-15 pointer-events-none transition-all duration-[1000ms] ease-out ${
              mobileStep === 'welcome' ? 'scale-100 rotate-0 opacity-15' : 'scale-110 lg:scale-100 rotate-3 lg:rotate-0 opacity-0 lg:opacity-15'
            }`} 
            style={{ backgroundImage: "radial-gradient(circle, #3a3a3a 1px, transparent 1px)", backgroundSize: "24px 24px" }} 
          />
          
          {/* Beautiful glowing circles / gradient blob wallpapers with scale/zoom/fade transition */}
          <div className={`absolute top-[-25%] left-[-25%] w-[120%] h-[120%] rounded-full bg-gradient-to-tr from-red-800/20 via-amber-600/10 to-transparent filter blur-3xl pointer-events-none transition-all duration-[1000ms] ease-out ${
            mobileStep === 'welcome' ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 lg:scale-100 translate-y-20 lg:translate-y-0 opacity-0 lg:opacity-100'
          }`} />
          <div className={`absolute bottom-[-15%] right-[-15%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-rose-800/25 via-purple-900/15 to-transparent filter blur-3xl pointer-events-none transition-all duration-[1000ms] ease-out ${
            mobileStep === 'welcome' ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 lg:scale-100 -translate-y-20 lg:translate-y-0 opacity-0 lg:opacity-100'
          }`} />
          
          {/* Floating abstract glowing digital nodes (representing campus locations) with fade transition */}
          <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-[1000ms] ease-out ${
            mobileStep === 'welcome' ? 'scale-100 opacity-100 blur-none' : 'scale-90 lg:scale-100 opacity-0 lg:opacity-100 blur-md lg:blur-none'
          }`}>
            {/* Topography Contour Line effects */}
            <svg className="absolute w-full h-full text-white/5 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M-10,30 Q30,10 50,40 T110,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M-10,50 Q20,30 60,60 T110,40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M-10,70 Q40,50 70,80 T110,65" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            
            {/* Glowing Map Pins / Nodes */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
            <div className="absolute top-[45%] left-2/3 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
            <div className="absolute top-2/3 left-[20%] w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
            <div className="absolute bottom-[20%] left-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            
            {/* Floating connecting paths */}
            <div className="absolute top-1/4 left-1/3 w-[150px] h-[0.5px] bg-gradient-to-r from-red-500/40 to-transparent rotate-12 transform origin-left" />
            <div className="absolute top-2/3 left-[20%] w-[200px] h-[0.5px] bg-gradient-to-r from-rose-500/40 to-transparent -rotate-6 transform origin-left" />
          </div>

          <div className="relative z-10">
            {/* Tagline header */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-600/30">
                F
              </div>
              <span className="text-[10px] font-display font-extrabold text-neutral-400 tracking-widest uppercase">
                CAMPUS OPERATING SYSTEM
              </span>
            </div>
          </div>

          <div className="relative z-10 my-auto py-8 space-y-8">
            <div className="space-y-3">
              <h1 className="text-7xl font-serif font-black italic tracking-tighter text-white leading-none">
                FINDIN<span className="text-red-500">.</span>
              </h1>
              <p className="text-sm text-neutral-400 font-serif italic max-w-[85%] leading-relaxed">
                "Discover the best of Akoka. Navigate transport, verify campus vendors, and explore options with absolute confidence."
              </p>
            </div>

            {/* Feature key indicators */}
            <div className="space-y-4 max-w-sm pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-red-400">
                  <MapPin size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-display font-black text-white leading-none">Zero Discovery Gap</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Map lecture halls, banks, and cafeterias instantly.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-amber-400">
                  <BusIcon size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-display font-black text-white leading-none">Live Shuttle Seat Capacity</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Know seating availability on active Red shuttles before walking.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-emerald-400">
                  <Store size={13} />
                </div>
                <div>
                  <h4 className="text-[11px] font-display font-black text-white leading-none">Verified Campus Marketplace</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Explore catalogs and place orders with top UNILAG services.</p>
                </div>
              </div>
            </div>

            {/* Get Started button - Only visible on small screens to initiate nice zoom/fade transition to form */}
            <div className="block lg:hidden pt-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setMobileStep('auth')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm shadow-xl shadow-red-600/35 active:scale-98 cursor-pointer relative overflow-hidden group"
              >
                Get Started
                <ArrowRight size={14} className="stroke-white animate-pulse" />
              </motion.button>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase">
              COORDINATES: AKOKA, UNILAG
            </span>
            <span className="text-[9px] font-mono text-neutral-600">
              6.5157° N, 3.3897° E • VER. 3.1.0
            </span>
          </div>
        </div>

        {/* Right Side: Onboarding Content */}
        <div className={`w-full min-h-screen bg-neutral-50/40 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          mobileStep === 'auth' 
            ? 'opacity-100 translate-y-0 pointer-events-auto flex' 
            : 'opacity-0 translate-y-12 pointer-events-none'
        } lg:relative lg:w-1/2 lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto lg:flex`}>
          {/* Artistic background blur accents */}
          <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-red-100/30 filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-amber-50/40 filter blur-3xl pointer-events-none" />
          
          <div className="relative w-full max-w-md bg-white border border-neutral-200/60 rounded-[32px] p-8 md:p-10 shadow-xl flex flex-col gap-6">
            
            {/* Mobile Back button to return to branding screen */}
            <button
              type="button"
              onClick={() => setMobileStep('welcome')}
              className="lg:hidden flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 text-xs font-bold transition-all self-start"
            >
              ← Back to Intro
            </button>

            <div className="text-center space-y-1">
              <span className="text-[9px] font-display font-extrabold tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase border border-red-100 inline-block lg:hidden">
                UNILAG CAMPUS NAVIGATOR
              </span>
              <h1 className="text-5xl font-serif font-black italic tracking-tighter text-neutral-900 leading-tight lg:hidden mt-2">
                FINDIN
              </h1>
              <p className="text-xs text-neutral-400 font-serif italic mt-1 max-w-[85%] mx-auto lg:hidden">
                "Discover the best of Akoka. Navigate transport, verify vendors, and explore campus with absolute confidence."
              </p>
              
              {/* Desktop heading: more subtle/clean header */}
              <div className="hidden lg:block text-left space-y-1">
                <span className="text-[9px] font-display font-extrabold tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase border border-red-100 inline-block mb-1">
                  ACCESS PORTAL
                </span>
                <h2 className="text-2xl font-display font-black text-neutral-900 tracking-tight">
                  Welcome to FINDIN
                </h2>
                <p className="text-xs text-neutral-500 font-medium font-sans">
                  Configure your profile to access premium services.
                </p>
              </div>
            </div>

            {/* High-visibility Onboarding Switcher Tab Header */}
            <div className="grid grid-cols-2 bg-neutral-100 p-1 rounded-2xl border border-neutral-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`py-2 px-3 text-[10px] font-display font-black rounded-xl transition-all cursor-pointer ${
                  isSignUp 
                    ? 'bg-neutral-950 text-white shadow-md' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                CREATE PROFILE
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`py-2 px-3 text-[10px] font-display font-black rounded-xl transition-all cursor-pointer ${
                  !isSignUp 
                    ? 'bg-neutral-950 text-white shadow-md' 
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                QUICK SIGN IN
              </button>
            </div>

            <div className="bg-neutral-50/80 border border-neutral-100 p-4 rounded-2xl flex flex-col gap-2.5">
              <span className="text-[8px] font-display font-extrabold text-neutral-400 uppercase tracking-widest block border-b border-neutral-100 pb-1">
                PLATFORM MOTTO
              </span>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-amber-500 text-sm mt-0.5">★</span>
                <p className="text-neutral-600 font-medium leading-relaxed">
                  <strong className="text-neutral-800">Zero Discovery Gap:</strong> Map every lecture hall, lab, or bank kiosk inside Akoka instantly.
                </p>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-red-500 text-sm mt-0.5">✦</span>
                <p className="text-neutral-600 font-medium leading-relaxed">
                  <strong className="text-neutral-800">Live Seat Capacity:</strong> Avoid terminal lines by verifying space on the next active Red shuttle before you walk.
                </p>
              </div>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-display font-extrabold text-neutral-400 uppercase tracking-wider block">YOUR CALLED NAME</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Fola Jacobs"
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/85 focus:border-red-500 focus:ring-1 focus:ring-red-100 px-4 py-3 rounded-xl text-xs text-neutral-800 font-semibold outline-none transition-all placeholder-neutral-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-display font-extrabold text-neutral-400 uppercase tracking-wider block">CAMPUS EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="fola.jacobs@unilag.edu.ng"
                  className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/85 focus:border-red-500 focus:ring-1 focus:ring-red-100 px-4 py-3 rounded-xl text-xs text-neutral-800 font-semibold outline-none transition-all placeholder-neutral-400"
                />
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-display font-extrabold text-neutral-400 uppercase tracking-wider block">YOUR ROLE AT AKOKA</label>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-neutral-700">
                    {[
                      { id: 'fresher', label: 'Freshman (Fresher)' },
                      { id: 'returning', label: 'Returning Student' },
                      { id: 'visitor', label: 'Campus Visitor' },
                      { id: 'parent', label: 'Tourist / Parent' }
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setAuthRole(opt.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          authRole === opt.id
                            ? 'bg-neutral-950 border-neutral-950 text-white shadow-md'
                            : 'bg-neutral-50 hover:bg-neutral-100/60 border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-xs shadow-md shadow-red-600/10 active:scale-98 cursor-pointer mt-2"
              >
                {isSignUp ? "Start Discovering Campus" : "Sign In to FINDIN"}
                <ArrowRight size={14} className="stroke-white" />
              </button>
            </form>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-32">
      
      {/* Premium Header Rail */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100/80 px-4 py-3.5 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-serif font-black italic text-2xl tracking-tighter text-neutral-900 select-none leading-none">
              FINDIN<span className="text-red-600">.</span>
            </span>
            <div className="hidden md:flex items-center gap-1.5 bg-red-50/75 px-2.5 py-1 rounded-full border border-red-100">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
              <span className="text-[9px] text-red-700 font-display font-extrabold tracking-wide uppercase">UNILAG Companion</span>
            </div>
          </div>

          {/* Tab Navigation Center */}
          <nav className="flex items-center gap-1">
            {[
              { id: 'Explore', label: 'Explore', icon: <Compass size={14} /> },
              { id: 'Marketplace', label: 'Marketplace', icon: <Store size={14} /> },
              { id: 'Transport', label: 'Transport Tracker', icon: <BusIcon size={14} /> },
              { id: 'Profile', label: 'Digital ID Passes', icon: <UserIcon size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id as any);
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-extrabold transition-all cursor-pointer ${
                  selectedTab === tab.id
                    ? 'bg-neutral-950 text-white shadow-md shadow-black/10'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* User profile capsule header */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-black text-neutral-800 leading-none block">{user.name}</span>
              <span className="text-[10px] text-neutral-400 font-semibold mt-1 uppercase block leading-none">{user.role}</span>
            </div>
            <div
              onClick={() => setSelectedTab('Profile')}
              className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center font-bold text-xs ring-2 ring-neutral-200 shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Primary Workstation Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 pt-6 md:px-8 flex-1">
        
        {/* SEARCH AND FILTERS LAYER (Visible everywhere except Profile screen) */}
        {selectedTab !== 'Profile' && (
          <div className="mb-6 space-y-4">
            {/* Search Input Box */}
            <div className="relative w-full max-w-2xl mx-auto focus-within:scale-[1.005] transition-all duration-200">
              <Search className="absolute left-4 top-3.5 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                aria-label="Search"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  selectedTab === 'Explore' 
                    ? "Search academic lecture theatres, relaxation front, clinical wings..."
                    : selectedTab === 'Marketplace'
                    ? "Search Efe's Buka Joforo rice, CopyPaste print, lock braiding..."
                    : "Track shuttle bus numbers or drivers near hostels..."
                }
                className="w-full bg-white border border-neutral-200/80 hover:border-neutral-300 focus:border-red-500 focus:ring-1 focus:ring-red-100 px-5 py-3 pl-12 rounded-2xl text-xs text-neutral-800 font-semibold outline-none transition-all placeholder-neutral-400 shadow-sm"
              />
            </div>

            {/* Sub-Category filtering pills dynamically keyed */}
            {selectedTab === 'Explore' && (
              <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1.5 justify-center max-w-xl mx-auto scrollbar-none">
                {[
                  { id: 'all', label: 'All Locations' },
                  { id: 'faculty', label: 'Faculties' },
                  { id: 'administrative', label: 'Admin Corners' },
                  { id: 'recreation', label: 'Water & parks' },
                  { id: 'services', label: 'Retail & dining' },
                  { id: 'utility', label: 'Clinic & gates' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCategory(item.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display font-extrabold transition-all cursor-pointer ${
                      selectedCategory === item.id
                        ? 'bg-neutral-950 text-white shadow-sm'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {selectedTab === 'Marketplace' && (
              <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1.5 justify-center max-w-xl mx-auto scrollbar-none">
                {[
                  { id: 'all', label: 'All Businesses' },
                  { id: 'food', label: 'Buka Foods' },
                  { id: 'printing', label: 'Spiral Printing' },
                  { id: 'salon', label: 'Hair Stylings' },
                  { id: 'gadgets', label: 'Laptop repairs' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCategory(item.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display font-extrabold transition-all cursor-pointer ${
                      selectedCategory === item.id
                        ? 'bg-neutral-950 text-white shadow-sm'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== SCREEN 1: EXPLORE / HOME VIEW ==================== */}
        {selectedTab === 'Explore' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Artistic Flair Editorial Hero Masthead */}
            <div className="relative bg-white border border-neutral-200/60 rounded-[32px] p-8 md:p-10 overflow-hidden min-h-[260px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              {/* Artistic canvas shapes */}
              <div className="absolute top-[20%] right-[-10%] w-96 h-96 rounded-full bg-red-100/30 filter blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-[20%] w-[30%] h-[40%] bg-[radial-gradient(circle_at_bottom,rgba(239,68,68,0.08),transparent)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-1 text-left shrink-0 md:max-w-md">
                <span className="bg-red-50 border border-red-100 text-red-600 text-[9px] font-display font-extrabold tracking-widest px-3 py-1 rounded-full uppercase w-max">
                  UNILAG COMPANION SYSTEM
                </span>
                <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tighter leading-[0.82] text-neutral-900 mt-2 select-none">
                  FIND IT.<br />
                  <span className="text-neutral-200 block transition-colors hover:text-neutral-300">BOOK IT.</span>
                </h1>
                <p className="text-xs text-neutral-500 font-serif italic mt-3 max-w-sm leading-relaxed">
                  Discover verified food bukaterias, easily track moving shuttle buses, check active seat counts, and lookup Akoka lecture theater coordinates instantly.
                </p>
              </div>

              {/* Stat Boxes */}
              <div className="relative z-10 grid grid-cols-3 gap-4 w-full md:w-auto md:flex md:flex-col shrink-0 border-t md:border-t-0 md:border-l border-neutral-100 pt-6 md:pt-0 md:pl-10 text-left">
                <div className="space-y-1">
                  <span className="text-3xl font-serif font-black italic tracking-tight text-neutral-900 block leading-none">9</span>
                  <span className="text-[9px] text-neutral-400 font-display font-extrabold block uppercase tracking-wider">Verified Pins</span>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-serif font-black italic tracking-tight text-emerald-600 block leading-none">100%</span>
                  <span className="text-[9px] text-neutral-400 font-display font-extrabold block uppercase tracking-wider">Live Shuttles</span>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl font-serif font-black italic tracking-tight text-red-600 block leading-none">4.8 <span className="text-xs text-amber-500 inline-block align-middle mt-[-4px]">★</span></span>
                  <span className="text-[9px] text-neutral-400 font-display font-extrabold block uppercase tracking-wider">Student Rating</span>
                </div>
              </div>
            </div>

            {/* Gaps Solving Bento Grid (Telling why FINDIN exists) */}
            <div className="space-y-3 pt-4">
              <div className="text-center sm:text-left">
                <span className="text-[9px] font-display font-extrabold text-red-600 uppercase tracking-widest leading-none block">BRIDGING THE GAP</span>
                <h3 className="text-xl font-serif font-black text-neutral-900 tracking-tight mt-1">Solves three major university problems</h3>
              </div>
              
              {/* Responsive Bento Box layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-neutral-150/80 p-5 rounded-[24px] flex flex-col justify-between shadow-xs hover:border-red-200 hover:shadow-md transition-all duration-300">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-serif font-black italic text-sm">
                      01
                    </div>
                    <h4 className="text-xs font-display font-extrabold text-neutral-900 leading-none">The Discovery Gap</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                      First-time academic visitors, parents, and freshers struggle to find precise laboratories or bank terminals on the wide campus grounds.
                    </p>
                  </div>
                  <span className="text-[10px] font-display font-bold text-red-600 mt-4">FINDIN catalogs spots with SVG guides ➔</span>
                </div>

                <div className="bg-white border border-neutral-150/80 p-5 rounded-[24px] flex flex-col justify-between shadow-xs hover:border-red-200 hover:shadow-md transition-all duration-300">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-serif font-black italic text-sm">
                      02
                    </div>
                    <h4 className="text-xs font-display font-extrabold text-neutral-900 leading-none">The Trust Gap</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                      Students are unsure whether a local printing shop formats theses properly, or which food cafeteria delivers fresh catfish peppersoup.
                    </p>
                  </div>
                  <span className="text-[10px] font-display font-bold text-amber-700 mt-4">Review system builds student validation ➔</span>
                </div>

                <div className="bg-white border border-neutral-150/80 p-5 rounded-[24px] flex flex-col justify-between shadow-xs hover:border-red-200 hover:shadow-md transition-all duration-300">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-serif font-black italic text-sm">
                      03
                    </div>
                    <h4 className="text-xs font-display font-extrabold text-neutral-900 leading-none">The Transportation Gap</h4>
                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                      Akokites waste valuable lecture prep time standing in long queues waiting for non-existent shuttle buses, oblivious to active seats.
                    </p>
                  </div>
                  <span className="text-[10px] font-display font-bold text-emerald-700 mt-4">Seat booking with barcode boardings ➔</span>
                </div>
              </div>
            </div>

            {/* Hot Recommendations Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-[9px] font-display font-extrabold text-red-600 uppercase tracking-widest block">FINDIN SELECTIONS</span>
                  <h3 className="text-xl font-serif font-black text-neutral-900 tracking-tight mt-1">Trending campus locations & spots</h3>
                </div>
                <span className="text-xs font-display font-bold text-neutral-500">{filteredLocations.length} locations near Akoka</span>
              </div>

              {/* Grid block mapping Locations cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLocations.map((loc) => {
                  const isFav = savedLocIds.includes(loc.id);

                  return (
                    <div
                      key={loc.id}
                      className="bg-white border border-neutral-200/75 rounded-[24px] overflow-hidden hover:border-red-200 hover:shadow-md transition-all duration-300 flex flex-col group h-full"
                    >
                      {/* Image container */}
                      <div className="relative h-44 w-full overflow-hidden shrink-0">
                        <img
                          src={loc.image}
                          alt={loc.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Rating overlay badge */}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs border border-neutral-100">
                          <span className="text-amber-500 text-xs">★</span>
                          <span className="text-[10px] font-display font-black text-neutral-800">{loc.rating}</span>
                        </div>

                        {/* Favorite button action */}
                        <button
                          onClick={() => toggleFavorite(loc.id)}
                          className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-sm text-neutral-600 hover:text-red-600 cursor-pointer active:scale-95 transition-all text-xs border border-neutral-100"
                        >
                          <Heart size={14} className={isFav ? 'fill-red-600 stroke-red-600' : ''} />
                        </button>

                        <div className="absolute bottom-3 left-3">
                          <span className="bg-black/80 backdrop-blur-xs text-white text-[8px] font-display font-extrabold px-2 py-0.5 rounded tracking-widest uppercase">
                            {loc.category}
                          </span>
                        </div>
                      </div>

                      {/* Info Panel block */}
                      <div className="p-4.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[14px] font-display font-extrabold text-neutral-900 group-hover:text-red-600 transition-colors leading-snug">
                            {loc.name}
                          </h4>
                          <p className="text-xs text-neutral-500 font-semibold mt-1.5 leading-relaxed line-clamp-2">
                            {loc.description}
                          </p>
                        </div>

                        {/* Expand detailing triggers */}
                        <div className="mt-4 pt-3 border-t border-neutral-100/80 flex items-center justify-between">
                          <p className="text-[10px] text-neutral-400 font-display font-extrabold block">
                            Wait time: <span className="text-emerald-600 font-bold">~2 mins</span>
                          </p>
                          <button
                            onClick={() => setActiveLocation(loc)}
                            className="bg-neutral-50 hover:bg-[#D32F2F] text-neutral-800 hover:text-white border border-neutral-200 px-3.5 py-1.5 rounded-xl text-[10px] font-display font-extrabold tracking-wide transition-all duration-300 cursor-pointer"
                          >
                            Explore Spot ➔
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SCREEN 2: MARKETPLACE / VENDORS SCREEN ==================== */}
        {selectedTab === 'Marketplace' && (
          <div className="space-y-8 animate-fadeIn text-left">
            {/* Tagline overview */}
            <div className="border-b border-neutral-100 pb-4">
              <span className="text-[9px] font-display font-extrabold text-red-600 uppercase tracking-widest block text-center sm:text-left">CAMPUS SHOPS</span>
              <h2 className="text-xl md:text-2.5xl font-serif font-black text-neutral-900 tracking-tight text-center sm:text-left mt-1">
                Browse Campus Businesses
              </h2>
              <p className="text-xs text-neutral-400 font-serif italic text-center sm:text-left mt-1.5 leading-normal max-w-lg">
                Direct WhatsApp integration, student-friendly negotiated catalogs, and verified user ratings.
              </p>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((ven) => (
                <div
                  key={ven.id}
                  className="bg-white border border-neutral-200/75 rounded-[24px] overflow-hidden hover:border-red-200 hover:shadow-md transition-all duration-300 flex flex-col h-full group"
                >
                  <div className="relative h-44 shrink-0">
                    <img
                      src={ven.image}
                      alt={ven.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Category Overlay */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-neutral-800 text-[9px] font-display font-extrabold px-2 py-0.5 rounded-md uppercase shadow-xs">
                      {ven.category}
                    </div>

                    {/* Ratings bubble */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                      <span className="text-amber-500 text-xs text-[11px] leading-none">★</span>
                      <span className="text-xs font-display font-black text-white">{ven.rating}</span>
                      <span className="text-neutral-400 text-[10px] font-semibold">({ven.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="p-4.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-display font-extrabold text-neutral-900 leading-none group-hover:text-red-600 transition-colors">
                        {ven.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-display font-extrabold block mt-1">
                        Located near: {ven.locationName}
                      </p>
                      <p className="text-xs text-neutral-500 font-medium leading-relaxed mt-3.5 line-clamp-2">
                        {ven.description}
                      </p>
                    </div>

                    {/* Footer block containing dynamic catalog indicators */}
                    <div className="mt-5 pt-3.5 border-t border-neutral-100/80 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 font-display font-extrabold">
                        {ven.products.length} catalog items
                      </span>
                      <button
                        onClick={() => setActiveVendor(ven)}
                        className="bg-neutral-50 hover:bg-[#D32F2F] text-neutral-800 hover:text-white border border-neutral-200 px-3.5 py-2 rounded-xl text-[10px] font-display font-extrabold tracking-wide transition-all duration-300 cursor-pointer"
                      >
                        Customize & Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== SCREEN 3: TRANSPORT & ACTIVE BUSES VIEW ==================== */}
        {selectedTab === 'Transport' && (
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="border-b border-neutral-100 pb-4">
              <span className="text-[9px] font-display font-extrabold text-red-600 uppercase tracking-widest block">ACTIVE SHUTTLE TERMINALS</span>
              <h2 className="text-xl md:text-2.5xl font-serif font-black text-neutral-900 tracking-tight mt-1">
                Real-Time Transport & Seat Reservation
              </h2>
              <p className="text-xs text-neutral-400 font-serif italic mt-1 max-w-lg">
                Say goodbye to long terminal queues. Track active coach positions on our vector map and book a seat on the move.
              </p>
            </div>

            {/* Split layout block: Tracker interactive map and bus terminal details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Live Terminal Schedule list - occupies 5 of 12 slots */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-white border border-neutral-200 rounded-[28px] p-5 space-y-4 shadow-sm flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <span className="text-xs font-display font-extrabold text-neutral-800 leading-none">Terminals Schedule</span>
                      <span className="text-[9px] text-red-700 font-display font-extrabold px-2.5 py-1 rounded-full bg-red-50 border border-red-100 uppercase animate-pulse">
                        LIVE MONITOR
                      </span>
                    </div>

                    {/* Array of active buses */}
                    <div className="space-y-2.5">
                      {activeBuses.map((bus) => {
                        const isFull = bus.seatsAvailable === 0;

                        return (
                          <div
                            key={bus.id}
                            className="bg-neutral-50/60 border border-neutral-150 p-3 rounded-2xl flex items-center justify-between gap-4 shadow-3xs hover:border-red-200 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
                                isFull ? 'bg-neutral-400' : 'bg-neutral-950'
                              }`}>
                                <BusIcon size={16} className="stroke-white" />
                              </div>
                              <div className="text-left">
                                <h4 className="text-xs font-display font-extrabold text-neutral-800 leading-none">{bus.shuttleNumber}</h4>
                                <span className="text-[10px] text-neutral-400 font-semibold mt-1 inline-block leading-none">
                                  Driver: {bus.driverName}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`text-[10px] font-display font-extrabold block uppercase ${
                                isFull ? 'text-red-500' : 'text-emerald-600'
                              }`}>
                                {isFull ? 'FULL' : `${bus.seatsAvailable} seats left`}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-semibold mt-1 inline-block leading-none">
                                ETA: {bus.etaMinutes} mins
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking CTA button */}
                  <div className="pt-4 border-t border-neutral-100/80 mt-4 space-y-2">
                    <p className="text-[10px] text-neutral-400 font-serif italic">
                      Shuttle reservations automatically issue a secured boarding ticket stored offline in your personal passbook profile!
                    </p>
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-red-600 hover:bg-neutral-900 text-white font-display font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/10 active:scale-98 cursor-pointer"
                    >
                      <Layers size={14} className="stroke-white" />
                      Go to Seat Reservation
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Map Widget - occupies 7 of 12 slots */}
              <div className="lg:col-span-7">
                <InteractiveMap
                  onSelectLocation={(loc) => setActiveLocation(loc)}
                  selectedLocationId={activeLocation?.id}
                />
              </div>

            </div>
          </div>
        )}

        {/* ==================== SCREEN 4: DIGITAL PASSBOOK & REGISTERED PROFILE ==================== */}
        {selectedTab === 'Profile' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-left">
            {/* Header profile greeting */}
            <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-100 pb-5">
              <div>
                <span className="text-[9px] font-display font-extrabold text-red-600 uppercase tracking-widest block leading-none">VERIFIED IDENTITY</span>
                <h2 className="text-xl md:text-2.5xl font-serif font-black text-neutral-900 tracking-tight mt-1">
                  FINDIN Passbook & Identity
                </h2>
                <p className="text-xs text-neutral-500 font-serif italic mt-1">
                  Managing your active active shuttle bookings, saved campus spots, and customized student credentials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSignOut}
                  className="bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-200 text-neutral-600 hover:text-red-700 rounded-xl px-4 py-2 text-xs font-display font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
                >
                  <LogOut size={13} />
                  Log Out
                </button>
              </div>
            </div>

            {/* GRAND UNILAG DIGITAL IDENTIFICATION STUDENT PASS CARD */}
            <div className="relative bg-gradient-to-tr from-red-700 via-red-600 to-red-800 text-white rounded-[28px] p-6 md:p-8 overflow-hidden shadow-xl min-h-[220px] flex flex-col justify-between">
              {/* Absolute background accent decoration */}
              <div className="absolute top-0 right-0 w-[45%] h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
              <div className="absolute bottom-[-10%] right-[5%] w-[40%] h-[70%] bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05)_0%,transparent_65%)]" />

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-red-100 backdrop-blur-sm border border-white/20">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-[13px] tracking-widest uppercase">UNIVERSITY OF LAGOS</h3>
                    <p className="text-[8px] text-red-100 font-display font-extrabold tracking-widest uppercase mt-0.5">STUDENT IDENTIFICATION PASS</p>
                  </div>
                </div>
                
                <span className="bg-white/10 text-white border border-white/10 text-[8px] font-display font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  {user.role}
                </span>
              </div>

              {/* Matriculation number and User information */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-white/10 relative z-10 text-left">
                <div>
                  <span className="text-[9px] text-red-100 font-display font-extrabold uppercase tracking-widest block leading-none">CLASS PROFILE NAME</span>
                  <p className="text-sm font-sans font-black text-white mt-1 leading-none">{user.name}</p>
                </div>
                <div>
                  <span className="text-[9px] text-red-100 font-display font-extrabold uppercase tracking-widest block leading-none">REG/MATRIC NO</span>
                  <p className="text-sm font-mono font-black text-white mt-1 leading-none">
                    {user.matricNo || 'VISITOR-PASS'}
                  </p>
                </div>
                <div className="mt-2 text-left col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-red-100 font-display font-extrabold uppercase tracking-widest block leading-none">EMAIL DIRECTORY</span>
                    <p className="text-xs font-semibold text-neutral-300 mt-1 leading-none">{user.email}</p>
                  </div>
                  <div className="bg-white p-1 rounded-xs shadow opacity-85 hover:opacity-100 transition-opacity">
                    {/* Simulated visual bar pattern representation */}
                    <div className="flex gap-[1px] h-5 bg-neutral-900 px-1 py-0.5">
                      {[3, 1, 4, 1, 2, 4, 3, 1, 2, 4, 3, 1, 4, 1].map((w, index) => (
                        <div
                          key={index}
                          className="bg-white"
                          style={{ width: `${w}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVE BOOKED TICKETS CARD PASS arena */}
            <div className="space-y-4">
              <span className="text-[9px] font-display font-extrabold text-red-600 uppercase tracking-widest block leading-none">ACTIVE SHUTTLE TICKETS</span>
              
              {bookings.length === 0 ? (
                <div className="bg-white border border-neutral-150 p-8 rounded-3xl text-center space-y-2 shadow-2xs">
                  <p className="text-xs text-neutral-500 font-bold">You do not hold any active booked shuttle tickets right now.</p>
                  <button
                    onClick={() => setSelectedTab('Transport')}
                    className="inline-flex bg-neutral-950 hover:bg-neutral-900 text-white font-display font-extrabold text-[10px] px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Find a Shuttle Route
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-2xs flex flex-col md:flex-row items-center gap-5 justify-between"
                    >
                      <div className="flex items-center gap-4 text-left w-full md:w-auto">
                        <div className="w-11 h-11 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black">
                          <BusIcon size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-neutral-800">{booking.route.name}</h4>
                          <p className="text-xs text-neutral-500 font-semibold mt-1">
                            Seat: <strong className="text-neutral-900 font-bold">{booking.seatNumber}</strong> • {booking.bus.shuttleNumber}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-bold mt-1">
                            Boarding: {booking.boarding} ➔ Destination: {booking.destination}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 justify-between w-full md:w-auto border-t md:border-none pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-neutral-400 font-bold block">FARE COMPLETED</span>
                          <span className="text-xs font-black text-neutral-900 mt-1 block">₦{booking.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="bg-neutral-50 hover:bg-red-50 border border-neutral-200 text-neutral-500 hover:text-red-500 font-black text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            Cancel Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SAVED FAVORITE SPOTS SECTION */}
            <div className="space-y-4">
              <span className="text-[9px] font-extrabold text-[#EF4444] uppercase tracking-widest block leading-none">SAVED OFFLINE FAVORITES</span>
              
              {savedLocIds.length === 0 ? (
                <div className="bg-white border border-neutral-150 p-6 rounded-3xl text-center shadow-2xs">
                  <p className="text-xs text-neutral-500 font-semibold leading-normal">
                    You haven't bookmark-saved any spots yet. Click the heart icon on any venue to pin your top-frequented locations.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campusLocations
                    .filter(l => savedLocIds.includes(l.id))
                    .map((loc) => (
                      <div
                        key={loc.id}
                        className="bg-white border border-neutral-150 p-3.5 rounded-2xl flex items-center gap-4 shadow-3xs hover:border-neutral-300 transition-all cursor-pointer group"
                        onClick={() => setActiveLocation(loc)}
                      >
                        <img
                          src={loc.image}
                          alt={loc.name}
                          className="w-10 h-10 object-cover rounded-xl"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <h5 className="text-xs font-black text-neutral-800 leading-none group-hover:text-red-500 transition-colors truncate">
                            {loc.name}
                          </h5>
                          <span className="text-[9px] text-neutral-400 font-bold mt-1 inline-block uppercase tracking-wider leading-none">
                            ★ {loc.rating} • {loc.category}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* SYSTEM RESET SETTINGS BAR */}
            <div className="bg-red-50/40 border border-red-100 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-sm font-black text-amber-900 flex items-center gap-1 justify-center sm:justify-start">
                  <Sliders size={15} /> System State Settings
                </span>
                <p className="text-[10px] text-amber-700 font-bold mt-1">
                  Want to simulate a brand-new student onboarding flow, or clear booking memory?
                </p>
              </div>
              <button
                onClick={resetAllData}
                className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 font-sans justify-center"
              >
                <Trash2 size={13} />
                Reset System Database
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ==================== GLOBAL DETAILED POPUPS MODALS ARENA ==================== */}
      <AnimatePresence>
        {activeLocation && (
          <LocationDetails
            location={activeLocation}
            onClose={() => setActiveLocation(null)}
            onBookShuttleAtStop={(stopId) => {
              setActiveLocation(null);
              setInitialBookingStopId(stopId);
              setShowBookingModal(true);
            }}
            onSelectVendor={(vId) => {
              setActiveLocation(null);
              const found = campusVendors.find(v => v.id === vId);
              if (found) setActiveVendor(found);
            }}
          />
        )}

        {activeVendor && (
          <VendorDetails
            vendor={activeVendor}
            onClose={() => setActiveVendor(null)}
            onAddReview={handleAddVendorReview}
          />
        )}

        {showBookingModal && (
          <SeatBooking
            initialLocationId={initialBookingStopId}
            onClose={() => {
              setShowBookingModal(false);
              setInitialBookingStopId(undefined);
            }}
            onConfirmBooking={handleAddNewBooking}
          />
        )}

        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-neutral-200 rounded-[28px] max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                <LogOut size={22} className="stroke-red-700" />
              </div>
              <div className="space-y-1.5 text-center">
                <h4 className="text-base font-display font-black text-neutral-900">Log Out of FINDIN?</h4>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Your offline passbooks and favorites will remain securely stored on this browser, but you will need to sign in again to access them.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSignOut}
                  className="flex-1 bg-neutral-950 hover:bg-neutral-900 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-black/10"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-neutral-200 rounded-[28px] max-w-md w-full p-6 shadow-2xl relative text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
                <Trash2 size={22} className="stroke-red-600" />
              </div>
              <div className="space-y-1.5 text-center">
                <h4 className="text-base font-display font-black text-neutral-900">Reset System Database?</h4>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Are you absolutely sure? This will delete all your active shuttle bookings, saved favorites, custom reviews, and onboarding credentials from local storage. This action is irreversible.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:text-neutral-900 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-red-600/10"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL CONVERSATIONAL FLOATING ASSISTANT */}
      <AIAssistant
        onTriggerAction={handleAITriggerAction}
        currentTab={selectedTab}
      />

      {/* FOOTER BAR */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-3.5 px-4 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2 font-medium">
          <p className="text-center md:text-left select-none text-neutral-500 font-bold">
            © 2026 FINDIN UNILAG Akoka Campus Companion. Developed dynamically.
          </p>
          <div className="flex items-center gap-3 scale-90 md:scale-100 mr-2 shrink-0 select-none">
            <span className="font-bold text-neutral-600">Find it.</span>
            <span className="text-neutral-300">|</span>
            <span className="font-bold text-neutral-600">Book it.</span>
            <span className="text-neutral-300">|</span>
            <span className="font-bold text-neutral-600">Get there.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
