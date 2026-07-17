'use client';
import React, { useState } from 'react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useAcademics } from '../../src/hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    BookOpen,
    Award,
    Atom,
    Briefcase,
    Globe,
    Laptop,
    Cpu,
    Video,
    Sparkles,
    Check,
    ArrowRight,
    School
} from 'lucide-react';

const iconMap = {
    GraduationCap,
    BookOpen,
    Award,
    Atom,
    Briefcase,
    Globe,
    Laptop,
    Cpu,
    Video,
    Sparkles
};

const CORE_PROGRAMS = [
    {
        id: 'primary-edu',
        key: 'primaryEducation',
        iconName: 'GraduationCap',
        gradient: 'from-[#f5a623] to-[#fdb94e]',
        category: 'school',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        defaultTitle: 'Primary Education',
        defaultDesc: 'Nurturing young minds with a holistic foundation focusing on cognitive, emotional, and social development through interactive learning.',
        defaultFeatures: ['Play-based learning', 'Expert Child Educators', 'Creative Arts & Crafts', 'Foundation Literacy'],
        defaultStat: '100% Foundation Rate'
    },
    {
        id: 'secondary-edu',
        key: 'secondaryEducation',
        iconName: 'BookOpen',
        gradient: 'from-[#1a2e5a] to-[#132348]',
        category: 'school',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        defaultTitle: 'Secondary Education',
        defaultDesc: 'Empowering middle and high school students with critical thinking, scientific inquiry, and structured academic preparation.',
        defaultFeatures: ['Smart Classrooms', 'Structured Curriculum', 'Analytical Skills', 'Extracurricular Focus'],
        defaultStat: '1:15 Teacher-Student Ratio'
    },
    {
        id: 'higher-secondary',
        key: 'higherSecondary',
        iconName: 'Award',
        gradient: 'from-[#f5a623] to-[#fdb94e]',
        category: 'school',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        defaultTitle: 'Higher Secondary',
        defaultDesc: 'Pre-university curriculum tailored to prepare students for top-tier universities through intensive academics and career path modeling.',
        defaultFeatures: ['College Preparation', 'Board Exam Prep', 'Career Counseling', 'Advanced Seminars'],
        defaultStat: '99.4% Board Pass Rate'
    },
    {
        id: 'science-dept',
        key: 'scienceDepartment',
        iconName: 'Atom',
        gradient: 'from-[#1a2e5a] to-[#132348]',
        category: 'departments',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        defaultTitle: 'Science Department',
        defaultDesc: 'Delving deep into empirical inquiry, scientific methods, and research projects to explore physics, chemistry, and biology.',
        defaultFeatures: ['Practical Lab Work', 'Research Projects', 'Olympiad Coaching', 'Physics/Chemistry/Bio Labs'],
        defaultStat: '100% Practical Success'
    },
    {
        id: 'business-studies',
        key: 'businessStudies',
        iconName: 'Briefcase',
        gradient: 'from-[#1a2e5a] to-[#132348]',
        category: 'departments',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        defaultTitle: 'Business Studies',
        defaultDesc: 'Introducing students to microeconomics, business models, accounting, and marketing strategies for modern commerce.',
        defaultFeatures: ['Entrepreneurship Lab', 'Financial Literacy', 'Case Studies', 'Market Analysis'],
        defaultStat: '15+ Annual Projects'
    },
    {
        id: 'humanities',
        key: 'humanities',
        iconName: 'Globe',
        gradient: 'from-[#f5a623] to-[#fdb94e]',
        category: 'departments',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        defaultTitle: 'Humanities',
        defaultDesc: 'Fostering cultural empathy, philosophical depth, historical perspective, and strong communications skills.',
        defaultFeatures: ['Literature Forums', 'Civic Studies', 'Creative Writing', 'Cultural Heritage'],
        defaultStat: '12+ National Debates'
    },
    {
        id: 'comp-science',
        key: 'computerScience',
        iconName: 'Laptop',
        gradient: 'from-[#1a2e5a] to-[#132348]',
        category: 'tech',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        defaultTitle: 'Computer Science',
        defaultDesc: 'Equipping students with algorithmic thinking, code architecture, and hands-on app development for the digital age.',
        defaultFeatures: ['Python & JS Coding', 'Web Development', 'AI/ML Basics', 'Smart Tech Lab'],
        defaultStat: '85% Coding Proficiency'
    },
    {
        id: 'stem-edu',
        key: 'stemEducation',
        iconName: 'Cpu',
        gradient: 'from-[#f5a623] to-[#fdb94e]',
        category: 'tech',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        defaultTitle: 'STEM Education',
        defaultDesc: 'Integrating Science, Technology, Engineering, and Math in collaborative projects to tackle real-world global challenges.',
        defaultFeatures: ['Robotics Workshops', '3D Printing & Design', 'Engineering Challenges', 'Problem-Solving Seminars'],
        defaultStat: '20+ STEM Exhibitions'
    },
    {
        id: 'skill-dev',
        key: 'skillDevelopment',
        iconName: 'Sparkles',
        gradient: 'from-[#f5a623] to-[#fdb94e]',
        category: 'tech',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        defaultTitle: 'Skill Development Courses',
        defaultDesc: 'Equipping students with essential professional life skills, soft skills, and vocational training to excel in the workplace.',
        defaultFeatures: ['Public Speaking', 'Graphic Design', 'Leadership Training', 'Financial Management'],
        defaultStat: '1500+ Graduated Alumni'
    }
];

const renderIcon = (iconName, colorClass) => {
    if (!iconName) return <School className={`w-7 h-7 ${colorClass}`} />;

    const IconComponent = iconMap[iconName];
    if (IconComponent) {
        return <IconComponent className={`w-7 h-7 ${colorClass}`} />;
    }

    if (iconName.length <= 2) {
        return <span className="text-2xl">{iconName}</span>;
    }

    return <School className={`w-7 h-7 ${colorClass}`} />;
};

const Academics = () => {
    const [activeTab, setActiveTab] = useState('all');
    const { t, language } = useLanguage();
    const { data: academicsData, isLoading: loading } = useAcademics();

    const dbAcademics = academicsData?.data || [];
    const activeDbAcademics = dbAcademics.filter(item => item.isActive !== false) || [];

    const getProgramData = (prog) => {
        const titleKey = `academics.programsList.${prog.key}.title`;
        const descKey = `academics.programsList.${prog.key}.description`;
        const featuresKey = `academics.programsList.${prog.key}.features`;
        const statKey = `academics.programsList.${prog.key}.stat`;

        const title = t(titleKey);
        const desc = t(descKey);
        const features = t(featuresKey);
        const stat = t(statKey);

        return {
            title: title !== titleKey ? title : prog.defaultTitle,
            description: desc !== descKey ? desc : prog.defaultDesc,
            features: Array.isArray(features) ? features : prog.defaultFeatures,
            stat: stat !== statKey ? stat : prog.defaultStat
        };
    };

    const baseTabs = [
        { id: 'all', label: language === 'bn' ? 'সব প্রোগ্রাম' : 'All Programs', icon: '✨' },
        { id: 'school', label: language === 'bn' ? 'কোর স্কুলিং' : 'Core Schooling', icon: '🏫' },
        { id: 'departments', label: language === 'bn' ? 'একাডেমিক বিভাগ' : 'Academic Streams', icon: '📚' },
        { id: 'tech', label: language === 'bn' ? 'বিশেষায়িত ও টেক' : 'Specialized & Tech', icon: '💻' }
    ];

    const tabs = activeDbAcademics.length > 0
        ? [...baseTabs, { id: 'electives', label: language === 'bn' ? 'ক্যাম্পাস সিলেবাস ও ক্লাব' : 'Campus Curriculum', icon: '🎨' }]
        : baseTabs;

    const filteredPrograms = activeTab === 'all'
        ? CORE_PROGRAMS
        : CORE_PROGRAMS.filter(p => p.category === activeTab);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        },
        exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
    };

    /* ─── SKELETON LOADING ─── */
    if (loading) {
        return (
            <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1a2e5a]/10 blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#f5a623]/5 blur-[150px] pointer-events-none"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded-2xl w-80 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded-xl w-full mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded-xl w-3/4 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6 animate-pulse">
                                <div className="flex justify-between items-center">
                                    <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                                    <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                                <div className="h-7 bg-gray-200 rounded-xl w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                                <div className="space-y-2.5 pt-4">
                                    {[...Array(3)].map((_, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-12 bg-gray-200 rounded-xl w-full pt-4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden font-[Inter,sans-serif]">
            {/* Animated Gradient Blur Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#1a2e5a]/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#f5a623]/5 blur-[150px] pointer-events-none" />
            <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#132348]/5 blur-[100px] pointer-events-none" />

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5E7EB_1px,transparent_1px),linear-gradient(to_bottom,#E5E7EB_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Centered Section Heading */}
                <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/25 uppercase mb-4 animate-pulse"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'একাডেমিক পাথওয়েস' : 'Academic Pathways'}
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mb-4"
                    >
                        {t('academics.pageTitle')}
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#6B7280] text-lg sm:text-xl max-w-3xl mx-auto font-semibold leading-relaxed px-4"
                    >
                        {t('academics.subtitle')}
                    </motion.p>
                </div>

                {/* Tabs Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex justify-center mb-12 lg:mb-16 px-4"
                >
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1 justify-center max-w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 relative z-10 ${activeTab === tab.id
                                    ? 'bg-[#1a2e5a] text-white shadow-sm'
                                    : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-50'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabOutline"
                                        className="absolute inset-0 border border-[#f5a623]/30 rounded-xl pointer-events-none -z-10"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Academic Cards Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="wait">
                        {activeTab !== 'electives' ? (
                            filteredPrograms.map((prog) => {
                                const data = getProgramData(prog);
                                const IconComponent = iconMap[prog.iconName] || BookOpen;

                                return (
                                    <motion.div
                                        key={prog.id}
                                        variants={cardVariants}
                                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                        className="group relative bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#1a2e5a]/25 flex flex-col justify-between overflow-hidden"
                                    >
                                        {/* Accent top border */}
                                        <div className={`absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r ${prog.gradient}`} />

                                        {/* Soft glow highlight */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                        <div>
                                            {/* Icon and statistics indicator */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`w-14 h-14 ${prog.iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                                                    <IconComponent className={`w-7 h-7 ${prog.iconColor}`} />
                                                </div>
                                                <span className="px-3 py-1 bg-gray-50 border border-gray-200 text-[#6B7280] text-xs font-bold rounded-full">
                                                    {data.stat}
                                                </span>
                                            </div>

                                            {/* Program Title */}
                                            <h3 className="text-2xl font-bold text-[#1F2937] mb-3 group-hover:text-[#1a2e5a] transition-colors duration-300">
                                                {data.title}
                                            </h3>

                                            {/* Program Description */}
                                            <p className="text-[#6B7280] text-sm leading-relaxed mb-6 font-semibold">
                                                {data.description}
                                            </p>

                                            {/* Mini feature list */}
                                            <ul className="space-y-2.5 mb-8">
                                                {data.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-[#1F2937] font-bold">
                                                        <span className={`flex-shrink-0 w-5 h-5 ${prog.iconBg} rounded-full flex items-center justify-center`}>
                                                            <Check className={`w-3 h-3 ${prog.iconColor}`} strokeWidth={3} />
                                                        </span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Learn More Button */}
                                        <div className="pt-4 border-t border-[#E5E7EB]">
                                            <button className="w-full inline-flex items-center justify-between px-5 py-3 rounded-xl bg-gray-50 group-hover:bg-[#1a2e5a] text-[#1F2937] group-hover:text-white font-bold text-sm transition-all duration-300 shadow-sm border border-[#E5E7EB]/80 cursor-pointer">
                                                <span>{language === 'bn' ? 'আরও জানুন' : 'Learn More'}</span>
                                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            activeDbAcademics.map((item, index) => {
                                const colorStyles = [
                                    { gradient: 'from-[#1a2e5a] to-[#132348]', iconBg: 'bg-[#1a2e5a]/10', iconColor: 'text-[#1a2e5a]' },
                                    { gradient: 'from-[#f5a623] to-[#fdb94e]', iconBg: 'bg-[#f5a623]/10', iconColor: 'text-[#e6961a]' }
                                ];
                                const style = colorStyles[index % colorStyles.length];

                                const features = item.grades && item.grades.length > 0
                                    ? item.grades
                                    : (item.details && item.details.length > 0 ? item.details : ['Expert Curated', 'Interactive learning', 'Modern facilities']);

                                const statText = item.ageGroup || (item.stats ? Object.entries(item.stats).map(([k, v]) => `${v} ${k}`).join(', ') : 'Active Program');

                                return (
                                    <motion.div
                                        key={item._id || index}
                                        variants={cardVariants}
                                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                        className="group relative bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#1a2e5a]/25 flex flex-col justify-between overflow-hidden"
                                    >
                                        {/* Top Border */}
                                        <div className={`absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r ${style.gradient}`} />

                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                        <div>
                                            {/* Icon and stat */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`w-14 h-14 ${style.iconBg} rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110`}>
                                                    {renderIcon(item.icon, style.iconColor)}
                                                </div>
                                                <span className="px-3 py-1 bg-gray-50 border border-gray-200 text-[#6B7280] text-xs font-bold rounded-full max-w-[150px] truncate" title={statText}>
                                                    {statText}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-2xl font-bold text-[#1F2937] mb-2 group-hover:text-[#1a2e5a] transition-colors duration-300">
                                                {item.title || item.level || item.name}
                                            </h3>

                                            {/* Medium tag */}
                                            {item.medium && (
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-3 capitalize border ${
                                                    item.medium === 'english'
                                                        ? 'bg-[#1a2e5a]/10 text-[#1a2e5a] border-[#1a2e5a]/15'
                                                        : 'bg-[#f5a623]/10 text-[#e6961a] border-[#f5a623]/25'
                                                }`}>
                                                    {item.medium === 'english' ? '🇺🇸 English Medium' : '🇧🇩 Bangla Medium'}
                                                </span>
                                            )}

                                            {/* Description */}
                                            <p className="text-[#6B7280] text-sm leading-relaxed mb-6 font-semibold line-clamp-3">
                                                {item.description}
                                            </p>

                                            {/* Features list */}
                                            <ul className="space-y-2.5 mb-8">
                                                {features.slice(0, 4).map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-[#1F2937] font-bold">
                                                        <span className={`flex-shrink-0 w-5 h-5 ${style.iconBg} rounded-full flex items-center justify-center`}>
                                                            <Check className={`w-3 h-3 ${style.iconColor}`} strokeWidth={3} />
                                                        </span>
                                                        <span className="truncate">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Learn More Button */}
                                        <div className="pt-4 border-t border-[#E5E7EB]">
                                            <button className="w-full inline-flex items-center justify-between px-5 py-3 rounded-xl bg-gray-50 group-hover:bg-[#1a2e5a] text-[#1F2937] group-hover:text-white font-bold text-sm transition-all duration-300 shadow-sm border border-[#E5E7EB]/80 cursor-pointer">
                                                <span>{language === 'bn' ? 'আরও জানুন' : 'Learn More'}</span>
                                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
};

export default Academics;
