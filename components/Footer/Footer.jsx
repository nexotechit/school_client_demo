'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { motion } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Heart,
    ArrowRight,
    GraduationCap,
    ChevronRight,
    ShieldAlert,
    Send,
    Sparkles
} from 'lucide-react';

const FacebookIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const TwitterIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
);

const InstagramIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const LinkedinIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const YoutubeIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
);

const Footer = () => {
    const { t, language } = useLanguage();
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: t('nav.home'), href: '/' },
        { name: t('nav.aboutUs'), href: '/about' },
        { name: t('nav.admissions'), href: '/admissions' },
        { name: language === 'bn' ? 'শিক্ষক মণ্ডলী' : 'Our Teachers', href: '#' },
        { name: t('nav.notices'), href: '/notices' },
        { name: language === 'bn' ? 'গ্যালারি' : 'School Gallery', href: '#' },
        { name: t('nav.contact'), href: '/contact' },
    ];

    const academicLinks = [
        { name: language === 'bn' ? 'শিক্ষাক্রম' : 'Curriculum', href: '#' },
        { name: language === 'bn' ? 'অনলাইন ক্লাস' : 'Online Classes', href: '#' },
        { name: language === 'bn' ? 'পরীক্ষাসমূহ' : 'Exams', href: '#' },
        { name: language === 'bn' ? 'ফলাফল' : 'Results', href: '#' },
        { name: language === 'bn' ? 'গ্রন্থাগার' : 'Library', href: '#' },
        { name: language === 'bn' ? 'স্মার্ট ক্লাস' : 'Smart Classes', href: '#' },
        { name: language === 'bn' ? 'বৃত্তি সমূহ' : 'Scholarships', href: '#' },
        { name: language === 'bn' ? 'স্টুডেন্ট পোর্টাল' : 'Student Portal', href: '#' },
    ];

    const socialLinks = [
        { name: 'Facebook', href: '#', icon: FacebookIcon, bg: 'hover:bg-[#3B5998]/15 hover:text-[#3B5998]', iconBg: 'bg-[#3B5998]/10' },
        { name: 'Twitter', href: '#', icon: TwitterIcon, bg: 'hover:bg-[#1DA1F2]/15 hover:text-[#1DA1F2]', iconBg: 'bg-[#1DA1F2]/10' },
        { name: 'Instagram', href: '#', icon: InstagramIcon, bg: 'hover:bg-[#E1306C]/15 hover:text-[#E1306C]', iconBg: 'bg-[#E1306C]/10' },
        { name: 'LinkedIn', href: '#', icon: LinkedinIcon, bg: 'hover:bg-[#0077B5]/15 hover:text-[#0077B5]', iconBg: 'bg-[#0077B5]/10' },
        { name: 'YouTube', href: '#', icon: YoutubeIcon, bg: 'hover:bg-[#FF0000]/15 hover:text-[#FF0000]', iconBg: 'bg-[#FF0000]/10' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 }
        }
    };

    return (
        <footer className="relative bg-[#132348] border-t border-white/10 overflow-hidden pt-16 pb-8 text-white font-[Inter,sans-serif]">
            {/* Soft decorative background elements */}
            <div className="absolute top-0 right-[15%] w-[350px] h-[350px] rounded-full bg-[#f5a623]/10 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full bg-[#1a2e5a]/30 blur-[120px] pointer-events-none"></div>

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">



                {/* 2. Middle Grid Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
                >
                    {/* Branding Section */}
                    <div className="space-y-6">
                        {/* Glassmorphic Branding Card */}
                        <div className="inline-flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#f5a623] to-[#fdb94e] rounded-xl flex items-center justify-center shadow-inner">
                                <GraduationCap className="w-6 h-6 text-[#132348]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white leading-none tracking-tight">
                                    {t('common.schoolName')}
                                </h3>
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5 block">
                                    {t('common.tagline')}
                                </span>
                            </div>
                        </div>

                        <p className="text-sm font-semibold text-white/70 leading-relaxed">
                            {t('footer.description')}
                        </p>

                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/30 uppercase tracking-wide">
                            🛡️ {language === 'bn' ? 'বিশ্বস্ত গ্লোবাল এডটেক স্কুল' : 'Global Accredited EdTech School'}
                        </div>

                        {/* Social Media Links */}
                        <div className="space-y-2.5">
                            <h5 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                                {t('footer.followUs') || 'Follow Us'}
                            </h5>
                            <div className="flex flex-wrap gap-2.5">
                                {socialLinks.map((social) => {
                                    const IconComponent = social.icon;
                                    return (
                                        <a
                                            key={social.name}
                                            href={social.href}
                                            className="w-9 h-9 bg-white/5 text-white/80 border border-white/10 hover:bg-[#f5a623] hover:text-[#132348] hover:border-[#f5a623] rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110"
                                            aria-label={social.name}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Menu */}
                    <div>
                        <h4 className="text-base font-extrabold text-white mb-6 flex items-center gap-2 tracking-tight">
                            <span className="w-1.5 h-5 bg-[#f5a623] rounded-full inline-block"></span>
                            {t('footer.quickLinks')}
                        </h4>
                        <ul className="grid grid-cols-1 gap-3">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-[#f5a623] transition-colors duration-200 text-sm font-semibold flex items-center gap-1.5 group"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-[#f5a623] transition-transform duration-200 group-hover:translate-x-0.5" />
                                        <span className="relative">
                                            {link.name}
                                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#f5a623] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Academics links */}
                    <div>
                        <h4 className="text-base font-extrabold text-white mb-6 flex items-center gap-2 tracking-tight">
                            <span className="w-1.5 h-5 bg-[#f5a623] rounded-full inline-block"></span>
                            {language === 'bn' ? 'একাডেমিক নির্দেশিকা' : 'Academics'}
                        </h4>
                        <ul className="grid grid-cols-1 gap-3">
                            {academicLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-white/70 hover:text-[#f5a623] transition-colors duration-200 text-sm font-semibold flex items-center gap-1.5 group"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-[#f5a623] transition-transform duration-200 group-hover:translate-x-0.5" />
                                        <span className="relative">
                                            {link.name}
                                            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#f5a623] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Contact */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-base font-extrabold text-white mb-6 flex items-center gap-2 tracking-tight">
                                <span className="w-1.5 h-5 bg-[#f5a623] rounded-full inline-block"></span>
                                {t('footer.contactInfo')}
                            </h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-white/5 text-[#f5a623] border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <MapPin className="w-4.5 h-4.5" />
                                    </div>
                                    <span className="text-white/70 text-xs font-semibold leading-relaxed">
                                        {t('footer.address')}
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-white/5 text-[#f5a623] border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Phone className="w-4.5 h-4.5" />
                                    </div>
                                    <span className="text-white/70 text-xs font-semibold">
                                        {t('footer.phone')}
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-white/5 text-[#f5a623] border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail className="w-4.5 h-4.5" />
                                    </div>
                                    <span className="text-white/70 text-xs font-semibold truncate select-all" title={t('footer.email')}>
                                        {t('footer.email')}
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-white/5 text-white/50 border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Clock className="w-4.5 h-4.5" />
                                    </div>
                                    <span className="text-white/70 text-xs font-semibold leading-relaxed">
                                        {language === 'bn' ? 'সোম - শুক্র: সকাল ৮টা - বিকাল ৪টা' : 'Mon - Fri: 8:00 AM - 4:00 PM'}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Emergency support link */}
                        <div className="pt-4 border-t border-white/10">
                            <Link
                                href="#"
                                className="inline-flex items-center gap-2 text-xs font-bold text-[#f5a623] hover:text-[#fdb94e] transition-colors"
                            >
                                <ShieldAlert className="w-4 h-4 text-[#f5a623] animate-pulse" />
                                <span>{language === 'bn' ? 'জরুরি সহায়তা ডেস্ক' : 'Emergency Support Desk'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Bottom Footer Bar */}
                <div className="mt-16 pt-8 border-t border-white/10">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

                        {/* Copyright */}
                        <div className="text-white/60 text-xs font-semibold text-center lg:text-left leading-relaxed">
                            © {currentYear} <span className="font-extrabold text-white">{t('common.schoolName')}</span>. {t('footer.allRightsReserved')}.
                        </div>

                        {/* Legal links */}
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-semibold">
                            <Link href="/privacy" className="text-white/60 hover:text-[#f5a623] transition-colors duration-200">
                                {t('footer.privacyPolicy')}
                            </Link>
                            <Link href="/terms" className="text-white/60 hover:text-[#f5a623] transition-colors duration-200">
                                {t('footer.termsOfService') || 'Terms of Service'}
                            </Link>
                            <Link href="/accessibility" className="text-white/60 hover:text-[#f5a623] transition-colors duration-200">
                                {t('footer.accessibility')}
                            </Link>
                        </div>

                        {/* Designed By */}
                        <div className="text-[11px] font-bold text-white/40 flex items-center gap-1.5">
                            <span>{language === 'bn' ? 'ডিজাইন ও ডেভেলপমেন্টে' : 'Designed with'}</span>
                            <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-ping" />
                            <span>{language === 'bn' ? 'সানলাইট টিম' : 'by Sunlight DevTeam'}</span>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;