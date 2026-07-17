'use client';
import React, { useState, useEffect } from 'react';
import { useGallery } from '../../src/hooks/useApi';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Maximize2, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    Image as ImageIcon, 
    Calendar, 
    Sparkles, 
    Clock, 
    Compass, 
    ZoomIn,
    RefreshCw
} from 'lucide-react';

/* ─── category config: dynamic Tailwind styles mapping to navy/gold ─── */
const categoryConfig = {
    'CampusLife': { icon: '🏫', bg: 'bg-[#1a2e5a]/10', text: 'text-[#1a2e5a]', border: 'border-[#1a2e5a]/30' },
    'ClassroomActivities': { icon: '📚', bg: 'bg-[#1a2e5a]/10', text: 'text-[#1a2e5a]', border: 'border-[#1a2e5a]/30' },
    'SportsEvents': { icon: '⚽', bg: 'bg-[#f5a623]/10', text: 'text-[#f5a623]', border: 'border-[#f5a623]/30' },
    'CulturalPrograms': { icon: '🎭', bg: 'bg-[#f5a623]/10', text: 'text-[#f5a623]', border: 'border-[#f5a623]/30' },
    'ScienceFair': { icon: '🔬', bg: 'bg-[#1a2e5a]/10', text: 'text-[#1a2e5a]', border: 'border-[#1a2e5a]/30' },
    'GraduationCeremony': { icon: '🎓', bg: 'bg-[#f5a623]/10', text: 'text-[#f5a623]', border: 'border-[#f5a623]/30' },
    'EducationalTours': { icon: '🚌', bg: 'bg-[#1a2e5a]/10', text: 'text-[#1a2e5a]', border: 'border-[#1a2e5a]/30' },
    'AnnualFunction': { icon: '🎪', bg: 'bg-[#1a2e5a]/10', text: 'text-[#1a2e5a]', border: 'border-[#1a2e5a]/30' },
    'AwardCeremony': { icon: '🏆', bg: 'bg-[#f5a623]/10', text: 'text-[#f5a623]', border: 'border-[#f5a623]/30' },
    'StudentActivities': { icon: '🎨', bg: 'bg-[#f5a623]/10', text: 'text-[#f5a623]', border: 'border-[#f5a623]/30' }
};

const fallbackGalleries = [
    {
        _id: 'fb1',
        title: 'Vibrant Campus Life',
        description: 'Students enjoying the lush green open spaces, modern courtyards, and collaborative study circles.',
        category: 'CampusLife',
        images: [
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
            'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
            'https://images.unsplash.com/photo-1562774053-701939374585?w=800'
        ],
        eventDate: '2025-05-20',
        featured: true,
        isActive: true
    },
    {
        _id: 'fb2',
        title: 'Interactive Smart Classrooms',
        description: 'Hands-on collaborative learning sessions using digital interactive boards and tablet-based modules.',
        category: 'ClassroomActivities',
        images: [
            'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
            'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
        ],
        eventDate: '2025-04-18',
        featured: false,
        isActive: true
    },
    {
        _id: 'fb3',
        title: 'Annual Athletic Championship',
        description: 'Showcasing student speed, strength, and sportsmanship during the inter-school relay and track events.',
        category: 'SportsEvents',
        images: [
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
            'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800',
            'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800'
        ],
        eventDate: '2025-02-15',
        featured: false,
        isActive: true
    },
    {
        _id: 'fb4',
        title: 'Spring Festival of Arts',
        description: 'A colorful presentation of theatrical acts, traditional dance forms, and global music performances by students.',
        category: 'CulturalPrograms',
        images: [
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
        ],
        eventDate: '2025-03-10',
        featured: false,
        isActive: true
    },
    {
        _id: 'fb5',
        title: 'Annual Science & Tech Fair',
        description: 'Exhibiting working smart city models, green energy generators, and student-designed coding software.',
        category: 'ScienceFair',
        images: [
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?w=800'
        ],
        eventDate: '2025-01-20',
        featured: true,
        isActive: true
    },
    {
        _id: 'fb6',
        title: 'Graduation Class of 2025',
        description: 'Celebrating the milestones and future pathways of our graduating seniors as they transition to top universities.',
        category: 'GraduationCeremony',
        images: [
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
            'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800',
            'https://images.unsplash.com/photo-1589161782253-62580798be12?w=800'
        ],
        eventDate: '2025-05-30',
        featured: false,
        isActive: true
    },
    {
        _id: 'fb7',
        title: 'Field Study to Planetarium',
        description: 'Observing celestial motions, astronomical discoveries, and space science simulations on a guided field trip.',
        category: 'EducationalTours',
        images: [
            'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
            'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800'
        ],
        eventDate: '2025-03-24',
        featured: false,
        isActive: true
    },
    {
        _id: 'fb8',
        title: '30th Anniversary Annual Day',
        description: 'Honoring our history, legacy of excellence, and achievements through multi-department cultural ensembles.',
        category: 'AnnualFunction',
        images: [
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
            'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800'
        ],
        eventDate: '2024-12-15',
        featured: true,
        isActive: true
    },
    {
        _id: 'fb9',
        title: 'Academic Excellence Honors',
        description: 'Recognizing toppers, scholarship holders, and exceptional co-curricular performers with medals and scrolls.',
        category: 'AwardCeremony',
        images: [
            'https://images.unsplash.com/photo-1531844251246-9a1bfaae0d76?w=800',
            'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
        ],
        eventDate: '2024-11-20',
        featured: false,
        isActive: true
    },
    {
        _id: 'fb10',
        title: 'Debate & Public Speaking Club',
        description: 'Students engaging in mock parliaments and panel debates, polishing their communication and critical reasoning skills.',
        category: 'StudentActivities',
        images: [
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800'
        ],
        eventDate: '2025-04-05',
        featured: false,
        isActive: true
    }
];

const Gallery = () => {
    const { data: galleriesData, isLoading: loading, error: fetchError, refetch } = useGallery();
    const galleries = galleriesData?.data || [];
    const error = fetchError?.message || null;

    const [activeCategory, setActiveCategory] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const { t, language } = useLanguage();

    const formatDate = (dateString, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => {
        if (!dateString) return '';
        const locale = language === 'en' ? 'en-US' : 'bn-BD';
        try {
            return new Date(dateString).toLocaleDateString(locale, opts);
        } catch (e) {
            return dateString;
        }
    };

    const getCategoryLabel = (category) => {
        const key = `gallery.categories.${category}`;
        const label = t(key);
        if (label && label !== key) return label;
        return category.replace(/([A-Z])/g, ' $1').trim();
    };

    const displayGalleries = galleries.length > 0 
        ? galleries.filter(item => item.isActive !== false) 
        : fallbackGalleries;

    // Get unique active categories
    const categories = ['all', ...new Set(displayGalleries.map(item => item.category))];

    // Filter galleries
    const filteredGalleries = activeCategory === 'all'
        ? displayGalleries
        : displayGalleries.filter(item => item.category === activeCategory);

    // Featured Hero card
    const featuredGallery = activeCategory === 'all'
        ? (displayGalleries.find(item => item.featured) || displayGalleries[0])
        : null;

    // Other grid items
    const gridGalleries = featuredGallery
        ? filteredGalleries.filter(item => item._id !== featuredGallery._id)
        : filteredGalleries;

    const visibleGridGalleries = showAll ? gridGalleries : gridGalleries.slice(0, 6);
    const hasMoreGalleries = gridGalleries.length > 6;

    // Lightbox triggers
    const openLightbox = (gallery, imageIndex) => {
        setSelectedImage(gallery);
        setLightboxIndex(imageIndex);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        setLightboxIndex(0);
    };

    const nextImage = () => {
        if (selectedImage && selectedImage.images) {
            setLightboxIndex((prev) => (prev + 1) % selectedImage.images.length);
        }
    };

    const prevImage = () => {
        if (selectedImage && selectedImage.images) {
            setLightboxIndex((prev) => (prev - 1 + selectedImage.images.length) % selectedImage.images.length);
        }
    };

    // Keyboard navigation inside lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { 
            opacity: 1, 
            y: 0, 
            transition: { type: 'spring', stiffness: 100, damping: 15 } 
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } }
    };

    /* ─── SKELETON LOADING STATE ─── */
    if (loading) {
        return (
            <section className="relative py-20 lg:py-28 bg-[#F9FAFB]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded-2xl w-80 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded-xl w-3/4 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-3xl overflow-hidden animate-pulse shadow-sm h-96">
                                <div className="aspect-video bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between">
                                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="h-7 bg-gray-200 rounded-xl w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden font-[Inter,sans-serif]">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1a2e5a]/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#f5a623]/5 blur-[150px] pointer-events-none" />
            <div className="absolute top-[40%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#132348]/5 blur-[110px] pointer-events-none" />
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5E7EB_1px,transparent_1px),linear-gradient(to_bottom,#E5E7EB_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Non-blocking API Error Notification */}
                {error && (
                    <div className="mb-8 max-w-2xl mx-auto">
                        <div className="flex items-center justify-between gap-4 bg-[#f5a623]/10 border border-[#f5a623]/25 text-[#1F2937] rounded-2xl p-4 shadow-sm backdrop-blur-md">
                            <div className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#e6961a]" />
                                <span>{t('gallery.errorLoading') || 'Failed to load live gallery data. Showing default collections.'}</span>
                            </div>
                            <button 
                                onClick={() => refetch()} 
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a2e5a] hover:bg-[#132348] text-white rounded-full text-xs font-bold shadow-sm transition-all duration-300 cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{t('gallery.retry') || 'Retry'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Section Heading */}
                <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
                    <motion.span 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/25 uppercase mb-4 animate-pulse"
                    >
                        <Compass className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'স্মৃতি অ্যালবাম' : 'Visual Journal'}
                    </motion.span>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mb-4"
                    >
                        {t('gallery.title') || 'School Gallery'}
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#374151] text-lg sm:text-xl font-semibold leading-relaxed"
                    >
                        {t('gallery.subtitle') || 'Explore our vibrant collection of school events, achievements, and memorable moments.'}
                    </motion.p>
                </div>

                {/* Categories Tab Selector */}
                <div className="flex justify-center mb-12 lg:mb-16 px-4">
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1 justify-center max-w-full">
                        {categories.map((category) => {
                            const config = categoryConfig[category] || { icon: '📁', bg: 'bg-gray-50', text: 'text-[#6B7280]' };
                            return (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setShowAll(false);
                                    }}
                                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-2 relative z-10 ${
                                        activeCategory === category
                                            ? 'bg-[#1a2e5a] text-white shadow-sm'
                                            : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{category === 'all' ? '✨' : config.icon}</span>
                                    <span>{category === 'all' ? (language === 'bn' ? 'সব স্মৃতি' : 'All Memories') : getCategoryLabel(category)}</span>
                                    {activeCategory === category && (
                                        <motion.div 
                                            layoutId="activeGalleryTab" 
                                            className="absolute inset-0 border border-[#f5a623]/30 rounded-xl pointer-events-none -z-10"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Showcase layout: Featured large hero card + Grid list */}
                <div>
                    {/* Featured Large Hero Card */}
                    {featuredGallery && (
                        <motion.div
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                            className="group relative bg-white border border-[#E5E7EB] rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 mb-12 flex flex-col lg:flex-row h-auto lg:h-[500px]"
                        >
                            {/* Accent line using theme colors */}
                            <div className="absolute top-0 left-0 w-full h-[6px] lg:w-[6px] lg:h-full bg-gradient-to-r lg:bg-gradient-to-b from-[#1a2e5a] via-[#132348] to-[#fdb94e]" />
                            
                            {/* Image Showcase */}
                            <div className="w-full lg:w-[60%] h-72 lg:h-full relative overflow-hidden bg-gray-50">
                                <img 
                                    src={featuredGallery.images?.[0] || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800'} 
                                    alt={featuredGallery.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />
                                
                                <span className="absolute top-6 left-8 bg-[#f5a623] text-[#132348] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
                                    🌟 {language === 'bn' ? 'ফিচার্ড অ্যালবাম' : 'Featured Event'}
                                </span>

                                {featuredGallery.images && featuredGallery.images.length > 1 && (
                                    <span className="absolute bottom-6 left-8 bg-black/60 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm flex items-center gap-1.5">
                                        <ImageIcon className="w-4 h-4" />
                                        <span>{featuredGallery.images.length} {t('gallery.photos') || 'photos'}</span>
                                    </span>
                                )}
                            </div>

                            {/* Content Box */}
                            <div className="w-full lg:w-[40%] p-8 lg:p-12 flex flex-col justify-between relative bg-white/40 backdrop-blur-md">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${categoryConfig[featuredGallery.category]?.bg || 'bg-gray-100'} ${categoryConfig[featuredGallery.category]?.text || 'text-gray-700'} border ${categoryConfig[featuredGallery.category]?.border || 'border-gray-200'} flex items-center gap-1.5`}>
                                            <span>{categoryConfig[featuredGallery.category]?.icon || '📁'}</span>
                                            <span>{getCategoryLabel(featuredGallery.category)}</span>
                                        </span>
                                        <span className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(featuredGallery.eventDate)}
                                        </span>
                                    </div>

                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] tracking-tight group-hover:text-[#1a2e5a] transition-colors duration-300 leading-tight">
                                        {featuredGallery.title}
                                    </h3>

                                    <p className="text-[#374151] text-sm sm:text-base font-semibold leading-relaxed">
                                        {featuredGallery.description}
                                    </p>
                                </div>

                                {/* Gold CTA Button */}
                                <div className="pt-8 border-t border-[#E5E7EB] mt-8 lg:mt-0">
                                    <button 
                                        onClick={() => openLightbox(featuredGallery, 0)}
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#f5a623] to-[#fdb94e] text-[#132348] font-bold text-sm shadow-[0_4px_14px_rgba(245,166,35,0.25)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                        <span>{t('gallery.viewGallery') || 'View Memories'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Gallery Cards Grid */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                    >
                        <AnimatePresence mode="popLayout">
                            {visibleGridGalleries.map((gallery, idx) => {
                                const config = categoryConfig[gallery.category] || { icon: '📁', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
                                const mainImage = gallery.images && gallery.images.length > 0 ? gallery.images[0] : 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400';
                                
                                return (
                                    <motion.div
                                        key={gallery._id || idx}
                                        variants={cardVariants}
                                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                        className="group bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#1a2e5a]/25 flex flex-col justify-between overflow-hidden relative"
                                    >
                                        {/* Accent top border */}
                                        <div className="absolute top-0 left-0 w-full h-[5px] bg-[#E5E7EB] group-hover:bg-gradient-to-r group-hover:from-[#1a2e5a] group-hover:to-[#fdb94e] transition-colors duration-300" />
                                        
                                        <div>
                                            {/* Image container */}
                                            <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F4F6] rounded-t-3xl">
                                                <img 
                                                    src={mainImage} 
                                                    alt={gallery.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                                                {/* Left status badge */}
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    {gallery.featured && (
                                                        <span className="bg-[#f5a623] text-[#132348] px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-sm uppercase tracking-wider">
                                                            ★ {language === 'bn' ? 'ফিচার্ড' : 'Featured'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Image count pill */}
                                                {gallery.images && gallery.images.length > 1 && (
                                                    <span className="absolute top-4 right-4 bg-black/60 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                        <span>{gallery.images.length}</span>
                                                    </span>
                                                )}

                                                {/* Action Hover overlay */}
                                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <button 
                                                        onClick={() => openLightbox(gallery, 0)}
                                                        className="transform scale-90 group-hover:scale-100 bg-white text-[#1a2e5a] hover:text-[#f5a623] p-4 rounded-full shadow-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                                                    >
                                                        <Maximize2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Content container */}
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${config.bg} ${config.text} border ${config.border} flex items-center gap-1`}>
                                                        <span>{config.icon}</span>
                                                        <span>{getCategoryLabel(gallery.category)}</span>
                                                    </span>
                                                    <span className="text-[10px] text-[#6B7280] font-semibold flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatDate(gallery.eventDate)}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-[#1F2937] mb-2 leading-tight group-hover:text-[#1a2e5a] transition-colors duration-200">
                                                    {gallery.title}
                                                </h3>

                                                <p className="text-[#374151] text-xs font-semibold leading-relaxed line-clamp-3">
                                                    {gallery.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* View memories button */}
                                        <div className="p-6 pt-0 mt-auto">
                                            <button 
                                                onClick={() => openLightbox(gallery, 0)}
                                                className="w-full inline-flex items-center justify-between px-5 py-3 rounded-full bg-gray-50 group-hover:bg-[#1a2e5a] text-[#1F2937] group-hover:text-white font-bold text-xs transition-all duration-300 border border-[#E5E7EB] cursor-pointer"
                                            >
                                                <span>{t('gallery.viewGallery') || 'View Gallery'}</span>
                                                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {/* Pagination Button */}
                    {hasMoreGalleries && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="inline-flex items-center gap-1 px-6 py-3.5 bg-white border border-[#1a2e5a]/20 hover:bg-[#1a2e5a]/5 text-[#1a2e5a] font-bold text-xs rounded-full shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                            >
                                <span>{showAll ? (t('gallery.buttons.seeLess') || 'See Less') : (t('gallery.buttons.seeMore') || 'See More Galleries')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/*Fullscreen Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4 backdrop-blur-md"
                    >
                        <motion.div 
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#E5E7EB] flex flex-col justify-between"
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeLightbox}
                                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white text-[#1F2937] hover:text-[#f5a623] rounded-full flex items-center justify-center shadow-lg hover:bg-[#F3F4F6] transition-all duration-200 border border-[#E5E7EB] cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Slideshow arrows */}
                            {selectedImage.images && selectedImage.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white text-[#1a2e5a] hover:text-[#f5a623] rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-150 cursor-pointer"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 bg-white text-[#1a2e5a] hover:text-[#f5a623] rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-150 cursor-pointer"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Visual Display */}
                            <div className="relative aspect-[16/10] bg-gray-50 flex items-center justify-center overflow-hidden">
                                <img
                                    src={selectedImage.images[lightboxIndex]}
                                    alt={`${selectedImage.title} - Image ${lightboxIndex + 1}`}
                                    className="w-full h-full object-contain max-h-[50vh]"
                                />
                                
                                {selectedImage.images && selectedImage.images.length > 1 && (
                                    <span className="absolute top-4 left-4 bg-black/60 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm">
                                        {lightboxIndex + 1} of {selectedImage.images.length}
                                    </span>
                                )}
                            </div>

                            {/* Content Panel */}
                            <div className="p-6 sm:p-8 bg-white">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight mb-2">{selectedImage.title}</h3>
                                        <p className="text-[#374151] text-xs sm:text-sm font-semibold leading-relaxed">{selectedImage.description}</p>
                                    </div>
                                    <div className="md:text-right shrink-0">
                                        <div className="flex items-center gap-2 mb-2 justify-start md:justify-end">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${categoryConfig[selectedImage.category]?.bg || 'bg-gray-100'} ${categoryConfig[selectedImage.category]?.text || 'text-gray-700'} border ${categoryConfig[selectedImage.category]?.border || 'border-gray-200'} flex items-center gap-1`}>
                                                <span>{categoryConfig[selectedImage.category]?.icon || '📁'}</span>
                                                <span>{getCategoryLabel(selectedImage.category)}</span>
                                            </span>
                                        </div>
                                        <div className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5 justify-start md:justify-end">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(selectedImage.eventDate, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div> 
                                    </div>
                                </div>

                                {/* Thumbnail selection strip */}
                                {selectedImage.images && selectedImage.images.length > 1 && (
                                    <div className="border-t border-[#E5E7EB] pt-4 mt-6">
                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                            {selectedImage.images.map((image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setLightboxIndex(index)}
                                                    className={`shrink-0 relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                                                        index === lightboxIndex
                                                            ? 'border-[#f5a623] scale-105 shadow-md'
                                                            : 'border-[#E5E7EB] hover:border-[#1a2e5a]'
                                                    }`}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Gallery;