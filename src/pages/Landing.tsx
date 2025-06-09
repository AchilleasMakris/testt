import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, CheckSquare, Calendar, BarChart3, Users, Star, ArrowRight, Play, Sparkles, Check, Zap, Shield, Settings, TrendingUp, Clock, Lock, Grid2X2, ListTodo, FileText, UserCheck, Activity, Cog, Home, User, Briefcase, ClipboardList, StickyNote, BarChart, Target, ChevronLeft, ChevronRight, GraduationCapIcon, Euro, ArrowRightCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { NavBar } from '@/components/ui/tubelight-navbar';
import { Pricing } from '@/components/ui/pricing';
import { LogosSlider } from '@/components/ui/logos-slider';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';
import { SparklesText } from '@/components/ui/sparkles-text';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('Dashboard'); // Changed default to Dashboard
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const isMobile = useIsMobile();

  const handleDemoLogin = () => {
    toast({
      title: "Demo Access",
      description: "Please sign up or sign in to explore the demo features."
    });
    window.location.href = 'https://accounts.unitracker.store/sign-up';
  };

  const handleLogin = () => {
    window.location.href = 'https://accounts.unitracker.store/sign-in';
  };

  const handleSignUp = () => {
    window.location.href = 'https://accounts.unitracker.store/sign-up';
  };

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-black" />,
      title: "Course Management",
      description: "Organize all your courses, track grades, and manage credits with ease."
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-black" />,
      title: "Task Tracking", 
      description: "Never miss a deadline with our comprehensive task management system."
    },
    {
      icon: <Calendar className="h-6 w-6 text-black" />,
      title: "Smart Calendar",
      description: "View all your deadlines and schedule in one integrated calendar view."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-black" />,
      title: "Progress Analytics",
      description: "Track your academic progress with detailed statistics and insights."
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-8 w-8 text-black" />,
      title: "Fast and Efficient",
      description: "Experience quick and seamless academic management with our optimized tools."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-black" />,
      title: "Goal Tracking & Motivation",
      description: "Set academic goals, track your progress, and stay motivated with personalized reminders and insights."
    },
    {
      icon: <Clock className="h-8 w-8 text-black" />,
      title: "24/7 Access",
      description: "Access your academic data anytime, anywhere with our cloud-based platform."
    },
    {
      icon: <Settings className="h-8 w-8 text-black" />,
      title: "Customizable Solutions",
      description: "Tailor the tools and features to fit your unique academic needs."
    },
    {
      icon: <Shield className="h-8 w-8 text-black" />,
      title: "Secure and Reliable",
      description: "Trust our platform to keep your data safe and ensure consistent performance."
    },
    {
      icon: <FileText className="h-8 w-8 text-black" />,
      title: "Smart Organization",
      description: "Keep all your notes, assignments, and study materials organized in one place."
    }
  ];
  const testimonials = [
    {
      author: {
        name: "Sarah Miller",
        handle: "Stanford University",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
      },
      text: "UniTracker has completely transformed how I manage my courses! The GPA tracking and ECTS credits feature keep me motivated to stay on top of my studies."
    },    {
      author: {
        name: "Alex Chen",
        handle: "NYU",
        avatar: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&h=150&fit=crop&crop=face"
      },
      text: "The Task section is a lifesaver! I love how it highlights overdue assignments and lets me prioritize with ease."
    },
    {
      author: {
        name: "Maria Gonzalez",
        handle: "Harvard",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face"
      },
      text: "Managing my class schedule has never been easier. The Join Class button for online sessions is a game-changer!"
    },
    {
      author: {
        name: "James Patel",
        handle: "Oxford",
        avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&h=150&fit=crop&crop=face"
      },
      text: "The Attendance Tracker helped me improve my 50% rate to 85% this semester. The detailed records are super helpful!"
    },
    {
      author: {
        name: "Emily Brown",
        handle: "MIT",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
      },
      text: "I use the Notes feature daily to organize my study materials. Filtering by course makes it so convenient!"
    },    {
      author: {
        name: "Liam Kim",
        handle: "UCLA",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face"
      },
      text: "The Statistics section gives me amazing insights into my progress. The pie charts really show where I need to focus."
    },    {
      author: {
        name: "Sophia Lee",
        handle: "University of Toronto",
        avatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face"
      },
      text: "With the Premium Plan, I get unlimited tasks and advanced analytics. It's worth every penny for my busy schedule!"
    },    {
      author: {
        name: "Noah Singh",
        handle: "University of Sydney",
        avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face"
      },
      text: "The Calendar feature keeps all my deadlines and classes in one place. It's my go-to for planning my week!"
    },
    {
      author: {
        name: "Aisha Rahman",
        handle: "University of Cape Town",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
      },
      text: "As a student with multiple courses, the Courses section's GPA tracking keeps me accountable. Highly recommend!"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      yearlyPrice: "0",
      period: "month",
      features: ["Up to 5 courses", "Up to 5 tasks", "Up to 5 notes", "Basic analytics"],
      description: "Get started with essential tools for academic management",
      buttonText: "",
      isPopular: false,
      tier: "free"
    },
    {
      name: "Premium",
      price: "3",
      yearlyPrice: "25",
      period: "month",
      billing: "Billed yearly",
      features: ["Unlimited courses", "Unlimited tasks", "Unlimited notes", "Advanced analytics", "Priority support"],
      description: "Unlock advanced features for enhanced academic strategy",
      buttonText: "Upgrade to Premium",
      isPopular: true,
      tier: "premium"
    },
    {
      name: "University Pass",
      price: "1.5",
      yearlyPrice: "10",
      period: "month",
      billing: "Billed yearly",
      comingSoon: "(Soon)",
      features: ["Unlimited courses", "Unlimited tasks", "Unlimited notes", "University integration", "Student support"],
      description: "Special pricing for university students\n.edu or academic email required.",
      buttonText: "Soon",
      isPopular: false,
      tier: "university"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const universities = [
    { name: 'MIT', logo: '/lovable-uploads/b4477acb-389b-48a2-b391-1655c1ff109d.png' },
    { name: 'EAP', logo: '/lovable-uploads/18823ccd-6a2f-4f44-bb5b-2cc38657deaa.png' },
    { name: 'Stanford', logo: '/lovable-uploads/93ece6b2-4e07-4c4b-bfde-b2a899bf12d5.png' },
    { name: 'NYU', logo: '/lovable-uploads/0c8c067b-6231-4b66-85ea-10da795ba2ff.png' },
    { name: 'Harvard', logo: '/lovable-uploads/f7d26a35-a8d3-477d-a74c-721deb9b14c5.png' },
    { name: 'Oxford', logo: '/lovable-uploads/6b0a293a-9400-48d6-9a81-ef44d0b208ea.png' }
  ];
  // Tubelight navbar items for top nav
  const tubelightNavItems = [
    { name: 'Features', url: '#features', icon: Star },
    { name: 'Benefits', url: '#benefits', icon: Zap },
    { name: 'Pricing', url: '#pricing', icon: Euro },
    { name: 'Testimonials', url: '#testimonials', icon: Users },
    { name: 'FAQ', url: '#faq', icon: isMobile ? HelpCircle : GraduationCap },
  ];
  // Navigation items for sidebar with screenshots
  const navItems = [
    { label: 'Dashboard', screenshot: '/local-uploads/dashboard.png' },
    { label: 'Courses', screenshot: '/local-uploads/courses.png' },
    { label: 'Classes', screenshot: '/local-uploads/classes.png' },
    { label: 'Tasks', screenshot: '/local-uploads/tasks.png' },
    { label: 'Calendar', screenshot: '/local-uploads/calendar.png' },
    { label: 'Attendance', screenshot: '/local-uploads/attendance.png' },
    { label: 'Notes', screenshot: '/local-uploads/notes.png' },
    { label: 'Statistics', screenshot: '/local-uploads/statistics.png' }
  ];

  // Get current screenshot based on active nav item
  const getCurrentScreenshot = () => {
    const activeItem = navItems.find(item => item.label === activeNavItem);
    return activeItem ? activeItem.screenshot : '/local-uploads/dashboard.png';
  };
  // FAQ items for the FAQ section
  const faqItems = [
    {
      id: 'item-1',
      question: 'How does UniTracker help with academic management?',
      answer: 'UniTracker is an all-in-one platform that helps you organize courses, track tasks and deadlines, manage your calendar, monitor attendance, take notes, and analyze your academic progress with detailed statistics and GPA tracking.',
    },
    {
      id: 'item-2',
      question: 'What features are included in the Free plan?',
      answer: 'The Free plan includes up to 5 courses, 5 tasks, 5 notes, and basic analytics. This is perfect for getting started and experiencing the core features of UniTracker.',
    },
    {
      id: 'item-3',
      question: 'Can I upgrade or downgrade my plan anytime?',
      answer: 'Yes, you can upgrade to Premium or downgrade to Free at any time. Changes take effect immediately, and you\'ll only be charged for the upgraded features you use.',
    },
    {
      id: 'item-4',
      question: 'Is my academic data secure and private?',
      answer: "Absolutely! We use industry-standard encryption to protect your data. Your academic information is stored securely and is never shared with third parties. We comply with all major privacy regulations.",
    },
    {
      id: 'item-5',
      question: 'Do you offer student discounts?',
      answer: 'Yes! Our University Pass offers special pricing for students with a valid .edu email address. This plan includes all Premium features at a discounted rate specifically for university students.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Modern NavBar */}
      <NavBar items={tubelightNavItems} />      {/* Header with Logo and Auth Buttons */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3 md:py-4">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-black" />
              </div>
              <span className="text-lg md:text-xl font-semibold">UniTracker</span>
            </motion.div>
            
            {/* Hide auth buttons on small screens where they collide with navbar */}
            <motion.div
              className="flex items-center gap-1 sm:gap-2 md:gap-3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Login Button - Simplified on mobile, full on md+ */}
              <motion.button
                onClick={handleLogin}
                className="relative cursor-pointer text-xs sm:text-sm font-semibold px-2 sm:px-3 md:px-6 py-1.5 md:py-2 rounded-full transition-all duration-300 text-gray-300 hover:text-black bg-gray-900/50 border border-gray-700 md:border-2 hover:border-gradient-to-r hover:border-blue-100 hover:bg-gradient-to-r hover:from-blue-100 hover:via-blue-200 hover:to-purple-200 hover:shadow-[0_0_10px_rgba(191,219,254,0.5)] min-h-[36px] md:min-h-[44px] touch-manipulation flex items-center gap-1 md:gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline text-xs md:text-sm">Login</span>
                <span className="sm:hidden text-xs">Login</span>
              </motion.button>
              
              {/* Sign Up Button - Simplified on mobile, full on md+ */}
              <motion.button
                onClick={handleSignUp}
                className="relative cursor-pointer text-xs sm:text-sm font-semibold px-2 sm:px-3 md:px-6 py-1.5 md:py-2 rounded-full transition-all duration-300 text-gray-300 hover:text-black bg-gray-900/50 border border-gray-700 md:border-2 hover:border-gradient-to-r hover:border-blue-100 hover:bg-gradient-to-r hover:from-blue-100 hover:via-blue-200 hover:to-purple-200 hover:shadow-[0_0_10px_rgba(191,219,254,0.5)] min-h-[36px] md:min-h-[44px] touch-manipulation flex items-center gap-1 md:gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden md:inline text-sm">Sign Up</span>
                <span className="md:hidden text-xs">Sign Up</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 relative">
        <motion.div style={{ y }} className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl"></div>
        </motion.div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black rounded-full mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-sm font-medium">UniTracker hits #1 on Product Hunt</span>
            <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">What&apos;s new →</span>
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={false} // Remove animation for LCP speed
            animate={false}
          >
            Your ultimate academic
            <br />
            <span className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 bg-clip-text text-transparent">
              management tool
            </span>
          </motion.h1>
          
          <p
            className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed px-4"
            style={{ marginTop: 0, marginBottom: 0 }}
          >
            Stay on top of your university life with UniTracker&apos;s all-in-one dashboard—track courses, manage tasks, sync calendars, monitor attendance, and boost your GPA effortlessly.
          </p>
          <div className="h-6 sm:h-8" />
            <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                size="lg"
                onClick={handleSignUp}
                className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto min-h-[48px] touch-manipulation"
              >
                Start for free
              </Button>
            </motion.div>
          </motion.div>
        </div>      </section>
      
      {/* Universities Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-black relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p className="text-gray-400 text-2xl mb-12 font-medium">Universities that their students trust us</p>
          <div className="max-w-6xl mx-auto">
            <LogosSlider />
          </div>
        </motion.div>
      </section>

      {/* App Preview Section - Optimized for laptops */}
      <section className="py-16 px-4 sm:px-6 bg-black relative hidden lg:block">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SparklesText
                text="Dashboard Preview"
                className="text-sm font-medium text-black"
                sparklesCount={3}
                colors={{ first: "#3B82F6", second: "#8B5CF6" }}
              />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Experience the power of UniTracker
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Discover our intuitive dashboard that puts all your academic information at your fingertips
            </p>
          </div>

          {/* Browser Mockup - Optimized for laptop screens */}
          <motion.div
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Interactive Arrow pointing to Courses tab - positioned to align with section width */}
            <div className="absolute -left-40 top-[240px] z-30 max-w-7xl">
              {/* Pulse animation behind the arrow */}
              <motion.div 
                className="absolute left-24 top-1 z-10 h-8 w-8 rounded-full bg-gradient-to-r from-blue-100/30 via-blue-200/30 to-purple-200/30"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0], 
                  scale: [0.8, 1.3, 1.5],
                }}
                transition={{ 
                  duration: 1.8,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeOut"
                }}
              />
              
              <motion.div 
                className="flex items-center max-w-xs"
                initial={{ x: -20, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                }}
                transition={{ 
                  duration: 0.7,
                  delay: 0.8,
                }}
              >
                <motion.div 
                  className="mr-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black text-xs font-medium rounded-full shadow-md whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  Click buttons for demo
                </motion.div>
                <div className="relative flex-shrink-0">
                  <motion.div
                    animate={{ 
                      x: [0, 6, 0], 
                      scale: [1, 1.05, 1],
                      filter: ["drop-shadow(0 0 0 rgba(59, 130, 246, 0))", "drop-shadow(0 0 4px rgba(191, 219, 254, 0.8))", "drop-shadow(0 0 0 rgba(59, 130, 246, 0))"]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowRightCircle size={22} className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 text-black rounded-full" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            {/* Browser Frame - Reduced height for laptop screens */}
            <div className="bg-gray-800 rounded-t-2xl p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 bg-gray-700 rounded-md px-3 py-1 ml-3">
                  <span className="text-gray-400 text-sm">UniTracker Dashboard</span>
                </div>
              </div>
                {/* Dashboard Content - Optimized height for laptops */}
              <div className="bg-white rounded-lg overflow-hidden">
                {/* Main Layout */}
                <div className="flex h-[600px]">
                  {/* Sidebar - Slightly reduced width */}
                  <div className="w-56 bg-blue-50 border-r border-blue-100 p-4 flex-shrink-0 relative">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                          <GraduationCap className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900">UniTracker</div>
                          <div className="text-xs text-gray-600">Academic Management</div>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                    </div>
                    
                    <nav className="space-y-1">
                      {navItems.map((item, index) => {
                        const icons = [Home, BookOpen, Calendar, CheckSquare, Calendar, UserCheck, StickyNote, BarChart, Settings];
                        const Icon = icons[index];
                        const isActive = activeNavItem === item.label;

                        return (
                          <button
                            key={item.label}
                            onClick={() => setActiveNavItem(item.label)}
                            className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all text-sm w-full text-left relative ${
                              isActive
                                ? item.label === 'Dashboard' 
                                  ? 'bg-blue-200 text-blue-900 font-medium shadow-md relative z-10'
                                  : 'bg-blue-200 text-blue-900 font-medium'
                                : 'text-gray-700 hover:bg-blue-100'
                            }`}
                          >
                            {item.label === 'Dashboard' && isActive && (
                              <motion.div 
                                className="absolute inset-0 rounded-md"
                                initial={{ boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' }}
                                animate={{ 
                                  boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.3)', '0 0 0 3px rgba(59, 130, 246, 0.2)', '0 0 0 0 rgba(59, 130, 246, 0.3)']
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity,
                                  repeatType: 'loop'
                                }}
                              />
                            )}

                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{item.label}</span>
                            {item.label === 'Dashboard' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden lg:block">
                                Click to switch views
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                  {/* Main Content - Dynamic Screenshot with optimized scaling */}
                  <div className="flex-1 bg-gray-50 relative overflow-hidden">
                    <img
                      src={getCurrentScreenshot()}
                      alt={`UniTracker ${activeNavItem} Screenshot`}
                      className="w-full h-full object-cover object-top transition-opacity duration-300"
                      style={{
                        userSelect: 'none',
                        pointerEvents: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        transformOrigin: 'top center',
                        objectFit: 'cover'
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SparklesText
                text="Features"
                className="text-sm font-medium text-black"
                sparklesCount={3}
                colors={{ first: "#3B82F6", second: "#8B5CF6" }}
              />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built for Your Academic Success
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              UniTracker brings all your academic needs into one intuitive platform, helping you stay organized and achieve your goals with ease.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >                <Card className="bg-gray-900/50 border-2 border-gray-800 hover:border-gradient-to-r hover:border-blue-100 hover:shadow-[0_0_10px_rgba(191,219,254,0.5)] transition-all duration-300 group h-full">
                  <CardHeader className="text-center">
                    <motion.div
                      className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 rounded-xl w-fit group-hover:bg-purple-900/30 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="text-lg text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SparklesText
                text="Perks"
                className="text-sm font-medium text-black"
                sparklesCount={3}
                colors={{ first: "#3B82F6", second: "#8B5CF6" }}
              />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Discover the benefits
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Explore the powerful features and advantages that UniTracker offers to help you grow your academic presence
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >                <Card className="bg-gray-900/50 border-2 border-gray-800 hover:border-gradient-to-r hover:border-blue-100 hover:shadow-[0_0_10px_rgba(191,219,254,0.5)] transition-all duration-300 p-6 h-full">
                  <div className="flex flex-col items-start space-y-4">
                    <motion.div
                      className="p-3 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 rounded-xl"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex flex-col items-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 mb-4 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black rounded-full font-medium text-sm">Choose your plan</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">Simple and transparent pricing</h2>
            <p className="text-xl text-gray-400 max-w-2xl text-center">Choose the plan that suits your needs. No hidden fees, no surprises.</p>
          </motion.div>
          <React.Suspense fallback={<div className="text-center text-gray-400">Loading plans...</div>}>
            <Pricing
              plans={pricingPlans.map(plan => ({
                ...plan,
                buttonText: plan.tier === "free" ? "" : plan.buttonText
              }))}
              title="Simple, Transparent Pricing"
              description="Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support."
            />
          </React.Suspense>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 bg-black">
        <TestimonialsSection
          title="What our students say"
          description="We are proud to have helped thousands of students across the globe excel in their academic journey. Here are some of their stories"
          testimonials={testimonials}
          className="bg-black text-white"
        />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-black">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl text-white">Frequently Asked Questions</h2>
            <p className="text-gray-400 mt-4 text-balance">Discover quick and comprehensive answers to common questions about our platform, services, and features.</p>
          </div>
          <div className="mx-auto mt-16 max-w-4xl">
            <Accordion
              type="single"
              collapsible
              className="bg-black border-white w-full rounded-2xl border px-8 py-6 shadow-sm">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-white border-dashed">
                  <AccordionTrigger className="cursor-pointer text-base hover:no-underline text-white">{item.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base text-gray-400">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-black">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Elevate your
            <br />
            <span className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 bg-clip-text text-transparent">experience with us</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Ready to get started? Sign up now and start your journey with us.
            We are here to help you grow.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                size="lg"
                onClick={handleSignUp}
                className="bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 border border-blue-200 text-black px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto min-h-[48px] touch-manipulation"
              >
                Get Started
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 px-6 sm:px-8 py-3 text-base sm:text-lg bg-slate-50 text-slate-950 w-full sm:w-auto min-h-[48px] touch-manipulation"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900/50 border-t border-gray-800 py-16 px-4 sm:px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-5 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div className="md:col-span-2" variants={fadeInUp}>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-semibold">UniTracker</span>
              </div>
              <p className="text-gray-400 mb-6">Empower your academic journey.</p>
            </motion.div>
            {/* Product column */}
            <motion.div variants={fadeInUp}>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </motion.div>
            {/* Legal column */}
            <motion.div variants={fadeInUp}>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </motion.div>
          </motion.div>
          <motion.div
            className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p>© 2025 UniTracker. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing;
