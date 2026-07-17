'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Monitor, BookOpen, Cpu, FlaskConical, Dumbbell, Wifi,
    Bus, UtensilsCrossed, ShieldCheck, Stethoscope, Mic2,
    GraduationCap, ChevronDown, ChevronUp, ArrowRight, Sparkles
} from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useFacilities } from '../../src/hooks/useApi';

/* ─── icon + color map: emoji → Lucide icon + navy/gold color schemes ─── */
const iconMap = {
    '🖥️': { Icon: Monitor,          bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/20', text: 'text-[#e6961a]', bar: 'from-[#f5a623] to-[#fdb94e]' },
    '📚': { Icon: BookOpen,         bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' },
    '💻': { Icon: Cpu,              bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' },
    '🔬': { Icon: FlaskConical,     bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' },
    '⚽': { Icon: Dumbbell,         bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/20', text: 'text-[#e6961a]', bar: 'from-[#f5a623] to-[#fdb94e]' },
    '🌐': { Icon: Wifi,             bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' },
    '🚌': { Icon: Bus,              bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/20', text: 'text-[#e6961a]', bar: 'from-[#f5a623] to-[#fdb94e]' },
    '🍽️': { Icon: UtensilsCrossed,  bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/20', text: 'text-[#e6961a]', bar: 'from-[#f5a623] to-[#fdb94e]' },
    '📷': { Icon: ShieldCheck,      bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' },
    '🏥': { Icon: Stethoscope,      bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' },
    '🎤': { Icon: Mic2,             bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' },
    '🎓': { Icon: GraduationCap,    bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/20', text: 'text-[#e6961a]', bar: 'from-[#f5a623] to-[#fdb94e]' },
};

/* alternating style configurations for fallback matches */
const palettes = [
    { bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/20', text: 'text-[#e6961a]', bar: 'from-[#f5a623] to-[#fdb94e]' },
    { bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]', bar: 'from-[#1a2e5a] to-[#132348]' }
];

const fallbackIcons = [Monitor, BookOpen, FlaskConical, Dumbbell, Cpu, Wifi, Bus, UtensilsCrossed, ShieldCheck, Stethoscope, Mic2, GraduationCap];

/* ─── animation variants ─── */
const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 28 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay } }
});

const cardVariant = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.5, ease: 'easeOut' } }
};

const stagger = {
    show: { transition: { staggerChildren: 0.08 } }
};

/* ═══════════════════════════════════════════════════════ */
const Facilities = () => {
    const { t } = useLanguage();
    const [showAll, setShowAll] = useState(false);
    const [hoveredId, setHoveredId] = useState(null);

    const { data: facilitiesData, isLoading: loading, error: fetchError } = useFacilities();
    const facilities = facilitiesData?.data || [];
    const error = fetchError?.message || null;

    /* ─── SKELETON LOADING ─── */
    if (loading) return (
        <section className="py-16 lg:py-24 bg-[#F9FAFB]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="text-center mb-12">
                    <div className="h-5 w-32 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
                    <div className="h-10 w-64 bg-gray-200 rounded-2xl mx-auto mb-3 animate-pulse" />
                    <div className="h-4 w-80 bg-gray-200 rounded-xl mx-auto animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-gray-200 animate-pulse shadow-sm">
                            <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-4" />
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-full" />
                                <div className="h-3 bg-gray-200 rounded w-4/5" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    /* ─── ERROR STATE ─── */
    if (error) return (
        <section className="py-16 bg-[#F9FAFB]">
            <div className="container mx-auto px-4 text-center max-w-lg">
                <div className="bg-white rounded-3xl p-8 border border-[#E5E7EB] shadow-sm">
                    <div className="text-4xl mb-3">⚠️</div>
                    <p className="text-[#1F2937] font-semibold mb-1">{t('facilities.errorLoading')}</p>
                    <p className="text-[#6B7280] text-sm">{error}</p>
                </div>
            </div>
        </section>
    );

    /* fallback school facilities data */
    const displayFacilities = facilities.length > 0 ? facilities : [
        { _id: 'f1', icon: '🖥️', title: 'Smart Classrooms',    description: 'Interactive digital boards and modern AV systems for immersive, tech-enabled learning environments.', features: ['Digital Boards', 'AV System', 'AC Rooms'] },
        { _id: 'f2', icon: '📚', title: 'Digital Library',     description: 'Extensive e-book collection and physical volumes curated for every academic level and interest.', features: ['E-Books', '10K+ Titles', '24/7 Access'] },
        { _id: 'f3', icon: '💻', title: 'Computer Lab',        description: 'High-performance workstations with fast internet connectivity and industry-standard software tools.', features: ['100 PCs', 'High-Speed Net', 'Latest Software'] },
        { _id: 'f4', icon: '🔬', title: 'Science Lab',         description: 'Fully equipped physics, chemistry, and biology labs with modern instruments for practical learning.', features: ['Physics', 'Chemistry', 'Biology'] },
        { _id: 'f5', icon: '⚽', title: 'Sports & Fitness',    description: 'Professional sports facilities covering football, cricket, basketball, and a modern fitness centre.', features: ['Football', 'Basketball', 'Gym'] },
        { _id: 'f6', icon: '🌐', title: 'Online Learning',     description: 'Dedicated e-learning portal with recorded classes, live sessions, and interactive assessment tools.', features: ['Live Classes', 'Recorded', 'Quizzes'] },
        { _id: 'f7', icon: '🚌', title: t('facilities.transportation') || 'School Transport', description: t('facilities.transportationDescription') || 'GPS-tracked school buses covering all major routes with trained, verified drivers.', features: t('facilities.transportationFeatures') || ['GPS Tracking', 'Safe Routes', 'Trained Drivers'] },
        { _id: 'f8', icon: '🍽️', title: 'Cafeteria',           description: 'Hygienic, nutritious meal options prepared fresh daily with a focus on balanced student health.', features: ['Fresh Meals', 'Hygienic', 'Balanced Diet'] },
        { _id: 'f9', icon: '📷', title: 'CCTV Security',       description: '24/7 campus surveillance with smart security systems ensuring a safe and secure school environment.', features: ['24/7 Surveillance', 'Smart Alerts', 'Secured Entry'] },
        { _id: 'f10', icon: '🏥', title: 'Medical Support',   description: 'On-campus medical room with a qualified nurse and emergency protocols to care for student wellbeing.', features: ['On-Campus Nurse', 'Emergency Care', 'Health Records'] },
        { _id: 'f11', icon: '🎤', title: 'Auditorium',         description: 'State-of-the-art auditorium for events, seminars, cultural programmes, and large-scale gatherings.', features: ['500 Seating', 'Stage Setup', 'AV Sound'] },
        { _id: 'f12', icon: '🎓', title: 'Scholarship Program', description: 'Merit-based and need-based scholarship programs to ensure quality education is accessible to all.', features: ['Merit-Based', 'Need-Based', 'Full Grants'] },
    ];

    const visibleFacilities = showAll ? displayFacilities : displayFacilities.slice(0, 8);

    /* ══════════════════════ MAIN RENDER ══════════════════════ */
    return (
        <section className="relative py-16 lg:py-24 bg-[#F9FAFB] overflow-hidden font-[Inter,sans-serif]">

            {/* ambient decorative blobs */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#1a2e5a]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -left-20 w-72 h-72 bg-[#f5a623]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-[#132348]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* ─── SECTION HEADER ─── */}
                <motion.div
                    variants={fadeUp(0)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-14"
                >
                    {/* sparkles badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/25 mb-5">
                        <Sparkles size={13} className="text-[#f5a623]" />
                        <span className="text-[11px] text-[#f5a623] font-bold uppercase tracking-widest">
                            World-Class Infrastructure
                        </span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1F2937] tracking-tight leading-tight mb-4">
                        {t('facilities.ourFacilities') || 'Our'}{' '}
                        <span className="text-[#1a2e5a]">
                            Facilities
                        </span>
                    </h2>
                    <p className="text-[#6B7280] text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                        {t('facilities.subtitle') || 'Everything your child needs to learn, grow, and thrive — under one roof.'}
                    </p>
                </motion.div>

                {/* ─── FACILITIES GRID ─── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                    {visibleFacilities.map((facility, index) => {
                        const emoji  = facility.icon || '';
                        const scheme = iconMap[emoji] || palettes[index % 2];
                        const LucideIcon = iconMap[emoji]?.Icon || fallbackIcons[index % fallbackIcons.length];
                        const isHovered  = hoveredId === (facility._id || facility.id || index);

                        return (
                            <motion.div
                                key={facility._id || facility.id || index}
                                variants={cardVariant}
                                whileHover={{ y: -6, boxShadow: '0 20px 35px -5px rgba(26,46,90,0.08)' }}
                                onHoverStart={() => setHoveredId(facility._id || facility.id || index)}
                                onHoverEnd={() => setHoveredId(null)}
                                className="group relative bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[#1a2e5a]/25 cursor-default"
                            >
                                {/* top colored accent bar using Tailwind gradient config */}
                                <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 group-hover:h-[4px] bg-gradient-to-r ${scheme.bar}`} />

                                <div className="p-6">
                                    {/* icon bubble utilizing config Tailwind classes */}
                                    <div className="mb-5">
                                        <motion.div
                                            animate={{ scale: isHovered ? 1.08 : 1, rotate: isHovered ? 4 : 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${scheme.bg} ${scheme.border} ${scheme.text}`}
                                        >
                                            <LucideIcon size={24} strokeWidth={1.8} />
                                        </motion.div>
                                    </div>

                                    {/* title */}
                                    <h3 className="text-[17px] font-bold text-[#1F2937] mb-2 leading-snug group-hover:text-[#1a2e5a] transition-colors duration-200">
                                        {facility.title}
                                    </h3>

                                    {/* description */}
                                    <p className="text-[#6B7280] text-sm leading-relaxed mb-4 line-clamp-3">
                                        {facility.description}
                                    </p>

                                    {/* feature tags */}
                                    {facility.features && facility.features.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {facility.features.slice(0, 3).map((feat, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-gray-50 text-[#6B7280]"
                                                >
                                                    {feat}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* learn more link */}
                                    <motion.div
                                        animate={{ x: isHovered ? 4 : 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="flex items-center gap-1.5 text-xs font-bold text-[#1a2e5a] group-hover:text-[#f5a623] opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    >
                                        Learn more
                                        <ArrowRight size={13} />
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ─── SHOW MORE / LESS button ─── */}
                {displayFacilities.length > 8 && (
                    <motion.div
                        variants={fadeUp(0.2)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAll(!showAll)}
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-[#1a2e5a] border border-[#1a2e5a]/20 bg-white hover:bg-[#1a2e5a]/5 transition-all duration-200 shadow-sm"
                        >
                            {showAll ? (
                                <><ChevronUp size={16} /> {t('facilities.showLess') || 'Show Less'}</>
                            ) : (
                                <>{t('facilities.seeMore') || 'See All Facilities'} <ChevronDown size={16} /></>
                            )}
                        </motion.button>
                    </motion.div>
                )}

                {/* ─── BOTTOM STAT STRIP ─── */}
                <motion.div
                    variants={fadeUp(0.3)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    {[
                        { value: '12+',  label: 'World-class Facilities' },
                        { value: '2000+', label: 'Happy Students' },
                        { value: '25+',  label: 'Years of Excellence' },
                        { value: '98%',  label: 'Satisfaction Rate' },
                    ].map(({ value, label }) => (
                        <div
                            key={label}
                            className="bg-white rounded-2xl px-5 py-4 border border-[#E5E7EB] shadow-sm text-center"
                        >
                            <div className="text-2xl font-extrabold text-[#f5a623] mb-0.5">
                                {value}
                            </div>
                            <p className="text-[11px] text-[#6B7280] font-semibold leading-tight">{label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Facilities;