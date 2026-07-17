'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
    BookOpen, Globe, Sparkles, GraduationCap
} from 'lucide-react';
import { useLanguage } from '../../src/contexts/LanguageContext';

/* ── animation variants ── */
const mobileMenuVariant = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    show: { opacity: 1, height: 'auto', transition: { duration: 0.35, ease: 'easeOut' } },
};

const mobileItemVariant = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const dropdownVariant = {
    hidden: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.15 } },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const Navbar = ({ onOpenLogin }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(null);
    const profileRef = useRef(null);

    const { t, language, changeLanguage } = useLanguage();

    /* ── read user from localStorage (SSR-safe) ── */
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const raw = localStorage.getItem('user');
        if (!raw) return;
        let cancelled = false;
        const parsed = (() => { try { return JSON.parse(raw); } catch { return null; } })();
        const id = window.setTimeout(() => { if (!cancelled) setUser(parsed); }, 0);
        return () => { cancelled = true; clearTimeout(id); };
    }, []);

    /* ── scroll detection for background/shadow transformation ── */
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* ── close profile dropdown on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target))
                setShowProfile(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setShowProfile(false);
        window.location.reload();
    };

    const toggleLanguage = () => changeLanguage(language === 'en' ? 'bn' : 'en');

    /* ── nav links (excluding Admissions as it's the main CTA) ── */
    const baseLinks = [
        { name: t('nav.aboutUs'), href: '/about' },
        { name: t('nav.academics'), href: '/academics' },
        { name: t('nav.notices'), href: '/notices' },
        { name: t('nav.contact'), href: '/contact' },
    ];

    const userNavLinks = (() => {
        if (!user) return baseLinks;
        const roleLink =
            user.role === 'admin' ? { name: t('nav.adminDashboard'), href: '/dashboard', icon: <LayoutDashboard size={15} /> } :
            user.role === 'teacher' ? { name: t('nav.teacherboard'), href: '/teacherboard', icon: <BookOpen size={15} /> } :
            user.role === 'student' ? { name: t('nav.portal'), href: '/portal', icon: <GraduationCap size={15} /> } : null;
        return roleLink ? [roleLink, ...baseLinks] : baseLinks;
    })();

    /* ── user initials for avatar ── */
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <>
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-[#132348] border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
                        : 'bg-[#1a2e5a]/95 backdrop-blur-md border-b border-white/5'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 lg:h-20">

                        {/* ── LOGO ── */}
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 3 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#f5a623] to-[#fdb94e] text-[#1a2e5a] shadow-md shrink-0"
                            >
                                <GraduationCap size={22} className="stroke-[2.5]" />
                            </motion.div>
                            <div className="leading-tight">
                                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                                    {t('common.schoolName')}
                                </h1>
                                <p className="text-[10px] text-[#fdb94e] font-semibold tracking-wider uppercase mt-1 hidden sm:block">
                                    {t('common.tagline')}
                                </p>
                            </div>
                        </Link>

                        {/* ── DESKTOP NAV LINKS ── */}
                        <div className="hidden lg:flex items-center gap-6">
                            {userNavLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="relative group py-2 text-[15px] font-semibold text-white/85 hover:text-white transition-colors duration-200"
                                >
                                    <span className="flex items-center gap-1.5">
                                        {link.icon && <span className="text-[#fdb94e]">{link.icon}</span>}
                                        {link.name}
                                    </span>
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f5a623] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                                </Link>
                            ))}
                        </div>

                        {/* ── RIGHT ACTIONS ── */}
                        <div className="hidden lg:flex items-center gap-4">
                            {/* Language Button */}
                            <button
                                onClick={toggleLanguage}
                                className="px-3 py-1.5 text-white/90 border border-white/25 hover:border-[#f5a623] hover:text-[#f5a623] bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all duration-200 tracking-wide flex items-center gap-1.5"
                                title={language === 'en' ? 'বাংলা তে পরিবর্তন করুন' : 'Switch to English'}
                            >
                                <Globe size={13} />
                                <span>{language === 'en' ? 'বাং' : 'EN'}</span>
                            </button>

                            {/* Authentication / Profile */}
                            {user ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setShowProfile(!showProfile)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-xl transition-all duration-200 text-white font-medium text-sm"
                                    >
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#f5a623] to-[#fdb94e] text-[#1a2e5a] flex items-center justify-center font-bold text-xs">
                                            {initials}
                                        </div>
                                        <span className="max-w-[100px] truncate">{user.name}</span>
                                        <ChevronDown size={14} className={`opacity-60 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showProfile && (
                                            <motion.div
                                                variants={dropdownVariant}
                                                initial="hidden"
                                                animate="show"
                                                exit="hidden"
                                                className="absolute right-0 mt-2 w-56 bg-[#132348] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-1.5"
                                            >
                                                <div className="px-4 py-2.5 border-b border-white/5">
                                                    <p className="text-xs text-[#fdb94e] font-semibold uppercase tracking-wider">{user.role}</p>
                                                    <p className="text-sm font-bold text-white truncate mt-0.5">{user.name}</p>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 text-sm font-semibold transition-colors text-left"
                                                >
                                                    <LogOut size={16} />
                                                    {t('common.logout')}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={onOpenLogin}
                                    className="px-4 py-2 text-sm font-semibold text-white/90 hover:text-white border border-white/20 hover:border-white/50 hover:bg-white/5 rounded-xl transition-all duration-200"
                                >
                                    {t('common.login')}
                                </button>
                            )}

                            {/* Admissions / Apply Now CTA */}
                            <Link
                                href="/admission"
                                className="px-5 py-2.5 text-sm font-bold text-[#132348] bg-gradient-to-r from-[#f5a623] to-[#fdb94e] hover:from-[#e6961a] hover:to-[#f5a623] rounded-full shadow-[0_4px_14px_rgba(245,166,35,0.3)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.4)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {t('nav.applyNow')}
                            </Link>
                        </div>

                        {/* ── MOBILE ACTIONS (Hamburger & Apply) ── */}
                        <div className="flex lg:hidden items-center gap-3">
                            <Link
                                href="/admission"
                                className="px-3.5 py-1.5 text-xs font-bold text-[#132348] bg-gradient-to-r from-[#f5a623] to-[#fdb94e] rounded-full shadow-md"
                            >
                                {t('nav.applyNow')}
                            </Link>

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* ── MOBILE MENU DRAWER ── */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            variants={mobileMenuVariant}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="lg:hidden overflow-hidden border-t border-white/10 bg-[#132348] shadow-inner"
                        >
                            <motion.div
                                variants={{
                                    show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
                                }}
                                className="px-4 pt-3 pb-6 space-y-1"
                            >
                                {/* Nav Links */}
                                {userNavLinks.map((link) => (
                                    <motion.div key={link.href} variants={mobileItemVariant}>
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200 font-semibold text-sm"
                                        >
                                            {link.icon && <span className="text-[#fdb94e]">{link.icon}</span>}
                                            <span>{link.name}</span>
                                        </Link>
                                    </motion.div>
                                ))}

                                <div className="h-px bg-white/10 my-2" />

                                {/* Language Toggle */}
                                <motion.div variants={mobileItemVariant}>
                                    <button
                                        onClick={() => { toggleLanguage(); setIsMenuOpen(false); }}
                                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-all duration-200"
                                        aria-label={language === 'en' ? 'Switch to Bangla' : 'Switch to English'}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Globe size={15} className="text-white/60" />
                                            <span className="font-semibold text-sm">
                                                {language === 'en' ? 'Switch to Bangla' : 'ইংরেজিতে পরিবর্তন করুন'}
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 text-[11px] font-bold border border-white/20 text-[#fdb94e] bg-white/5 rounded-full tracking-wide">
                                            {language === 'en' ? 'বাং' : 'EN'}
                                        </span>
                                    </button>
                                </motion.div>

                                {/* Auth Section */}
                                <motion.div variants={mobileItemVariant} className="pt-2">
                                    {user ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/5 p-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f5a623] to-[#fdb94e] text-[#1a2e5a] flex items-center justify-center font-bold text-sm shrink-0">
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                                    <p className="text-[11px] text-[#fdb94e] capitalize font-medium">{user.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl font-semibold text-sm transition-all duration-200 border border-red-500/25"
                                            >
                                                <LogOut size={15} />
                                                {t('common.logout')}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { onOpenLogin(); setIsMenuOpen(false); }}
                                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm"
                                        >
                                            <User size={15} />
                                            {t('common.login')}
                                        </button>
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    );
};

export default Navbar;