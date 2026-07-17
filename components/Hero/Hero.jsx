'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useBanners } from '../../src/hooks/useApi';

/* ─── reusable animation variants ─── */
const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay } }
});

const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut', delay } }
});

/* ─── stat item ─── */
const StatItem = ({ number, label, delay }) => (
    <motion.div
        variants={fadeIn(delay)}
        initial="hidden"
        animate="show"
        className="text-center px-6 py-4"
    >
        <p className="text-3xl sm:text-4xl font-extrabold text-[#f5a623] leading-none mb-1">
            {number}
        </p>
        <p className="text-xs sm:text-sm text-white/60 font-medium tracking-wide uppercase">
            {label}
        </p>
    </motion.div>
);

/* ═══════════════════════════════════════════════ */
const Hero = () => {
    const { t } = useLanguage();

    const defaultBanners = useMemo(() => [{
        images: ['/school1.jpg'],
        headline: t('hero.welcomeTitle'),
        subheadline: t('hero.welcomeSubtitle'),
        stats: [
            { number: '25+', label: t('hero.yearsLabel') || 'Years of Excellence' },
            { number: '2000+', label: t('dashboard.students') || 'Students' },
            { number: '98%', label: 'Success Rate' }
        ]
    }], [t]);

    const [currentSlide, setCurrentSlide] = useState(0);
    const { data: bannersData, isLoading: loading } = useBanners();
    const banners = bannersData?.data || [];

    const [isVisible, setIsVisible] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const intervalRef = useRef(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!loading) { setIsLoaded(true); setTimeout(() => setIsVisible(true), 100); }
    }, [loading]);

    const activeBanners = banners.length > 0 ? banners : defaultBanners;
    const slides = useMemo(() => {
        const all = activeBanners.flatMap(b =>
            (!b.images || b.images.length === 0) ? [] : b.images.map(image => ({ image, banner: b }))
        );
        return all.length > 0 ? all : [{ image: '/school1.jpg', banner: defaultBanners[0] }];
    }, [activeBanners, defaultBanners]);

    useEffect(() => {
        if (!isLoaded || slides.length <= 1) return;
        intervalRef.current = setInterval(() => {
            setCurrentSlide(p => (p + 1) % slides.length);
        }, 6000);
        return () => clearInterval(intervalRef.current);
    }, [isLoaded, slides.length, currentSlide]);

    const nextSlide = useCallback(() => { setCurrentSlide(p => (p + 1) % slides.length); }, [slides.length]);
    const prevSlide = useCallback(() => { setCurrentSlide(p => (p - 1 + slides.length) % slides.length); }, [slides.length]);
    const goToSlide = useCallback((i) => { setCurrentSlide(i); }, []);

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
        setTouchEnd(e.targetTouches[0].clientX);
    };
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const d = touchStart - touchEnd;
        if (d > 50) nextSlide();
        else if (d < -50) prevSlide();
        setTouchStart(0);
        setTouchEnd(0);
    };

    /* ── loading skeleton ── */
    if (loading) {
        return (
            <section className="relative min-h-[85vh] bg-[#1a2e5a] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#f5a623]/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <div className="h-5 w-40 bg-white/10 rounded-full animate-pulse mx-auto" />
                        <div className="space-y-3">
                            <div className="h-12 bg-white/10 rounded-2xl animate-pulse" />
                            <div className="h-12 bg-white/10 rounded-2xl animate-pulse w-4/5 mx-auto" />
                        </div>
                        <div className="h-5 bg-white/10 rounded-xl animate-pulse w-3/4 mx-auto" />
                        <div className="flex gap-4 pt-4 justify-center">
                            <div className="h-12 w-40 bg-[#f5a623]/20 rounded-full animate-pulse" />
                            <div className="h-12 w-36 bg-white/10 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const currentBanner = slides[currentSlide]?.banner;
    const stats = currentBanner?.stats || [];

    return (
        <section
            ref={sectionRef}
            className="relative w-full min-h-[85vh] lg:min-h-screen flex items-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="banner"
            aria-label="Hero section"
        >
            {/* ─── Background Image Layer ─── */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    {slides.map((slide, index) => index === currentSlide && (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={slide.image}
                                alt={slide.banner.alt || 'School banner'}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                sizes="100vw"
                                unoptimized={slide.image.includes('i.ibb.co')}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Navy-tinted overlay matching the navbar */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e5a]/70 via-[#1a2e5a]/60 to-[#132348]/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#132348]/40 via-transparent to-[#132348]/40" />
            </div>

            {/* ─── Main Content ─── */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
                <div className="max-w-3xl mx-auto text-center">

                    {/* Badge */}
                    <motion.div
                        variants={fadeUp(0)}
                        initial="hidden"
                        animate={isVisible ? 'show' : 'hidden'}
                        className="inline-flex items-center gap-2 mb-6 sm:mb-8"
                    >
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
                            <span className="text-[#f5a623] text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
                                {t('common.tagline')}
                            </span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeUp(0.1)}
                        initial="hidden"
                        animate={isVisible ? 'show' : 'hidden'}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5 sm:mb-6"
                    >
                        {currentBanner?.headline?.split('Sunlight School').map((part, i) =>
                            i === 0 ? <span key={i}>{part}</span> : (
                                <React.Fragment key={i}>
                                    <span className="text-[#f5a623]">
                                        Sunlight School
                                    </span>
                                    {part}
                                </React.Fragment>
                            )
                        ) || (
                                <>
                                    {t('hero.welcomeTitle').split(t('common.schoolName')).map((part, i) =>
                                        i === 0 ? <span key={i}>{part}</span> : (
                                            <React.Fragment key={i}>
                                                <span className="text-[#f5a623]">
                                                    {t('common.schoolName')}
                                                </span>
                                                {part}
                                            </React.Fragment>
                                        )
                                    )}
                                </>
                            )}
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        variants={fadeUp(0.2)}
                        initial="hidden"
                        animate={isVisible ? 'show' : 'hidden'}
                        className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto"
                    >
                        {currentBanner?.subheadline || t('hero.welcomeSubtitle')}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={fadeUp(0.3)}
                        initial="hidden"
                        animate={isVisible ? 'show' : 'hidden'}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16"
                    >
                        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="/about"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-[#132348] text-sm tracking-wide bg-gradient-to-r from-[#f5a623] to-[#fdb94e] shadow-[0_4px_20px_rgba(245,166,35,0.35)] hover:shadow-[0_6px_25px_rgba(245,166,35,0.5)] transition-shadow duration-300"
                            >
                                {t('hero.exploreMore')}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white text-sm border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                            >
                                {t('hero.contactUs')}
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Stats Row */}
                    {stats.length > 0 && (
                        <motion.div
                            variants={fadeUp(0.45)}
                            initial="hidden"
                            animate={isVisible ? 'show' : 'hidden'}
                            className="flex items-center justify-center"
                        >
                            <div className="inline-flex items-center divide-x divide-white/15 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                {stats.map((s, i) => (
                                    <StatItem
                                        key={i}
                                        number={s.number}
                                        label={s.label}
                                        delay={0.5 + i * 0.1}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ─── Slide Navigation Arrows ─── */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/15"
                        aria-label="Previous slide"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/15"
                        aria-label="Next slide"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* ─── Bottom: Dots + Progress ─── */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            >
                                <span className={`block rounded-full transition-all duration-300 ${i === currentSlide
                                    ? 'w-7 h-2 bg-[#f5a623]'
                                    : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                                    }`} />
                            </button>
                        ))}
                    </div>
                    <div className="w-16 h-0.5 bg-white/15 rounded-full overflow-hidden">
                        <motion.div
                            key={currentSlide}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 6, ease: 'linear' }}
                            className="h-full bg-[#f5a623] rounded-full"
                        />
                    </div>
                </div>
            )}
        </section>
    );
};

export default Hero;