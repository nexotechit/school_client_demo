'use client';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useAchievements } from '../../src/hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    Trophy,
    Users,
    GraduationCap,
    Award,
    Cpu,
    School,
    UserCheck,
    Globe,
    Calendar,
    TrendingUp,
    Star,
    ChevronRight,
    Sparkles,
    Check,
    Briefcase
} from 'lucide-react';

const iconMap = {
    Users,
    GraduationCap,
    Trophy,
    Award,
    Cpu,
    School,
    UserCheck,
    Globe,
    Calendar,
    TrendingUp,
    Star,
    ChevronRight
};

const renderLucideIcon = (name, className) => {
    const IconComp = iconMap[name];
    if (IconComp) {
        return <IconComp className={className} />;
    }
    return <Trophy className={className} />;
};

const chartData = [
    { year: '2021', successRate: 91.2, awards: 22, placement: 88.0 },
    { year: '2022', successRate: 93.5, awards: 28, placement: 90.5 },
    { year: '2023', successRate: 95.8, awards: 34, placement: 92.0 },
    { year: '2024', successRate: 97.4, awards: 39, placement: 93.1 },
    { year: '2025', successRate: 98.6, awards: 42, placement: 94.2 }
];

const statsList = [
    {
        key: 'totalStudents',
        val: '1,200+',
        iconName: 'Users',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        trend: '+8% YoY',
        defaultLabel: 'Total Students',
        defaultDesc: 'Enrolled students active in learning'
    },
    {
        key: 'gpaRate',
        val: '98.6%',
        iconName: 'GraduationCap',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        trend: '+2% YoY',
        defaultLabel: 'Board Exam Success',
        defaultDesc: 'Average GPA 5.0 in national exams'
    },
    {
        key: 'awardsCount',
        val: '42',
        iconName: 'Trophy',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        trend: '+5 this year',
        defaultLabel: 'National Awards',
        defaultDesc: 'Championships & trophies won'
    },
    {
        key: 'scholarships',
        val: '150+',
        iconName: 'Award',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        trend: 'Total $2M+',
        defaultLabel: 'Scholarship Achievements',
        defaultDesc: 'Secured government & private funds'
    },
    {
        key: 'olympiad',
        val: '15',
        iconName: 'Cpu',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        trend: '+3 National',
        defaultLabel: 'Olympiad Winners',
        defaultDesc: 'Winners in STEM & Math Olympiads'
    },
    {
        key: 'admissions',
        val: '94.2%',
        iconName: 'School',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        trend: 'Placement Rate',
        defaultLabel: 'University Placements',
        defaultDesc: 'Admission rate to top tier universities'
    },
    {
        key: 'teachers',
        val: '85+',
        iconName: 'UserCheck',
        iconBg: 'bg-[#1a2e5a]/10',
        iconColor: 'text-[#1a2e5a]',
        trend: '100% Certified',
        defaultLabel: 'Experienced Faculty',
        defaultDesc: 'Highly certified teachers & researchers'
    },
    {
        key: 'international',
        val: '8',
        iconName: 'Globe',
        iconBg: 'bg-[#f5a623]/10',
        iconColor: 'text-[#e6961a]',
        trend: '4 countries',
        defaultLabel: 'Global Competitions',
        defaultDesc: 'Honors achieved across nations'
    }
];

const AnimatedCounter = ({ value, duration = 1200 }) => {
    const [count, setCount] = useState('0');

    useEffect(() => {
        const isPercent = value.includes('%');
        const cleanValue = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (isNaN(cleanValue)) {
            setCount(value);
            return;
        }

        let start = 0;
        const end = cleanValue;
        const startTime = performance.now();

        const updateCount = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress * (2 - progress); // Ease out quad
            const current = start + ease * (end - start);

            if (isPercent) {
                setCount(current.toFixed(1) + '%');
            } else {
                const formatted = Math.floor(current).toLocaleString();
                const suffix = value.replace(/[0-9.,]/g, '');
                setCount(formatted + suffix);
            }

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }, [value, duration]);

    return <span>{count}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md border border-[#E5E7EB] p-4 rounded-2xl shadow-xl z-50">
                <p className="text-xs font-bold text-[#1F2937] mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: entry.stroke || '#1a2e5a' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke || '#1a2e5a' }} />
                        <span>{entry.name}:</span>
                        <span className="font-bold text-[#1F2937]">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Achievements = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const { t, language } = useLanguage();
    const { data: achievementsData, isLoading: loading } = useAchievements();

    const dbAchievements = achievementsData?.data || [];
    const activeDbAchievements = dbAchievements.filter(item => item.isActive !== false) || [];

    const getStatData = (stat) => {
        const labelKey = `achievements.stats.${stat.key}`;
        const descKey = `achievements.stats.${stat.key}Desc`;
        
        const label = t(labelKey);
        const desc = t(descKey);

        return {
            label: label !== labelKey ? label : stat.defaultLabel,
            desc: desc !== descKey ? desc : stat.defaultDesc
        };
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const locale = language === 'en' ? 'en-US' : 'bn-BD';
        return dateString ? new Date(dateString).toLocaleDateString(locale, options) : '';
    };

    const getCategoryLabel = (category) => {
        const key = `achievements.categories.${category}`;
        const label = t(key);
        return label === key ? category : label;
    };

    const categoryConfig = {
        'Academic': { icon: '🎓', bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]' },
        'Sports': { icon: '⚽', bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/25', text: 'text-[#e6961a]' },
        'Cultural': { icon: '🎭', bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/25', text: 'text-[#e6961a]' },
        'Science': { icon: '🔬', bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]' },
        'Arts': { icon: '🎨', bg: 'bg-[#f5a623]/10', border: 'border-[#f5a623]/25', text: 'text-[#e6961a]' },
        'Technology': { icon: '💻', bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]' }
    };

    const fallbackAchievements = [
        {
            _id: 'fb1',
            title: language === 'bn' ? 'গণিত অলিম্পিয়াড চ্যাম্পিয়ন' : 'Mathematics Olympiad Champions',
            description: language === 'bn' ? 'আন্তর্জাতিক গণিত অলিম্পিয়াডে অসাধারণ পারফরম্যান্স এবং উন্নত সমস্যা সমাধানে চমৎকার ফলাফল।' : 'Outstanding performance in the International Mathematics Olympiad with perfect scores.',
            date: '2024-08-25',
            category: 'Academic',
            achievements: language === 'bn' ? ['সম্পূর্ণ নম্বর', 'স্বর্ণ পদক', 'বিশেষ সম্মাননা'] : ['Perfect Score', 'Gold Medal', 'Special Recognition'],
            isActive: true
        },
        {
            _id: 'fb2',
            title: language === 'bn' ? 'জাতীয় স্কুল ক্রিকেট চ্যাম্পিয়নশিপ' : 'National School Cricket Cup',
            description: language === 'bn' ? 'আমাদের ক্রীড়া দল তীব্র প্রতিযোগিতার মাধ্যমে জাতীয় কাপ জিতেছে।' : 'Our sports team secured first place in the all-state school cricket tournament.',
            date: '2024-05-12',
            category: 'Sports',
            achievements: language === 'bn' ? ['বিজয়ী ট্রফি', 'সেরা অলরাউন্ডার', 'অপরাজিত রান'] : ['Championship Trophy', 'Best All-Rounder Award', 'Undefeated Run'],
            isActive: true
        },
        {
            _id: 'fb3',
            title: language === 'bn' ? 'আন্তঃস্কুল বিতর্ক চ্যাম্পিয়নশিপ' : 'Inter-School Debate Championship',
            description: language === 'bn' ? 'আমাদের বিতর্ক টিম শ্রেষ্ঠত্ব প্রদর্শন করে রানার্স আপ এবং সেরা বক্তার সম্মান পেয়েছে।' : 'Our senior debating society won the prestigious regional debate cup this semester.',
            date: '2024-09-15',
            category: 'Cultural',
            achievements: language === 'bn' ? ['চ্যাম্পিয়ন ট্রফি', 'সেরা বিতার্কিক অ্যাওয়ার্ড'] : ['Championship Trophy', 'Best Debater Award'],
            isActive: true
        },
        {
            _id: 'fb4',
            title: language === 'bn' ? 'বিজ্ঞান মেলায় প্রথম স্থান' : 'Science Fair Innovation Award',
            description: language === 'bn' ? 'পরিবেশবান্ধব সৌর প্রজেক্ট উপস্থাপন করে প্রথম পুরস্কার অর্জন।' : 'Grade 10 students won the top innovation award for their renewable energy project.',
            date: '2024-10-30',
            category: 'Science',
            achievements: language === 'bn' ? ['প্রথম স্থান', 'সেরা উদ্ভাবন প্রজেক্ট'] : ['1st Place', 'Outstanding Innovation Badge'],
            isActive: true
        }
    ];

    const displayAchievements = activeDbAchievements.length > 0 ? activeDbAchievements : fallbackAchievements;
    
    // Unique categories
    const categories = ['all', ...new Set(displayAchievements.map(item => item.category))];

    // Filter achievements
    const filteredAchievements = activeCategory === 'all'
        ? displayAchievements
        : displayAchievements.filter(item => item.category === activeCategory);

    const visibleAchievements = showAll ? filteredAchievements : filteredAchievements.slice(0, 4);
    const hasMoreAchievements = filteredAchievements.length > 4;

    const successHighlights = [
        {
            title: language === 'bn' ? 'হার্ভার্ড বিশ্ববিদ্যালয়ে পূর্ণ বৃত্তি' : 'Harvard University Admission',
            desc: language === 'bn' ? 'আমাদের শিক্ষার্থী পূর্ণ অর্থায়নে হার্ভার্ডে ভর্তি হওয়ার গৌরব অর্জন করেছে।' : 'Alumnus secures full scholarship to Harvard University for Computer Science.',
            badge: 'Ivy Placement',
            year: '2025'
        },
        {
            title: language === 'bn' ? 'জাতীয় রোবোটিক্স অলিম্পিয়াডে প্রথম স্থান' : 'National Robotics Champions',
            desc: language === 'bn' ? 'কিশোর অলিম্পিয়াডে আমাদের রোবোটিক্স টিম সেরা স্থান অর্জন করেছে।' : 'Sunlight school robotics team won the gold medal in the annual National Robotics contest.',
            badge: 'STEM Gold',
            year: '2024'
        },
        {
            title: language === 'bn' ? 'আন্তর্জাতিক গণিত অলিম্পিয়াড রৌপ্য' : 'International Math Olympiad',
            desc: language === 'bn' ? 'আন্তর্জাতিক ম্যাথ অলিম্পিয়াডে আমাদের শিক্ষার্থী রৌপ্য পদক পেয়েছে।' : 'Grade 12 student wins the prestigious Silver Medal in the International Olympiad.',
            badge: 'World Honors',
            year: '2024'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    };

    /* ─── SKELETON STATE ─── */
    if (loading) {
        return (
            <section className="py-20 lg:py-28 bg-[#F9FAFB]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded-2xl w-80 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded-xl w-3/4 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-8 animate-pulse shadow-sm h-64">
                                <div className="w-12 h-12 bg-gray-200 rounded-2xl mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded-xl mb-3 w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-20 lg:py-28 bg-[#F9FAFB] overflow-hidden font-[Inter,sans-serif]">
            {/* Ambient decorative blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#1a2e5a]/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#f5a623]/5 blur-[150px] pointer-events-none" />
            <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-[#132348]/5 blur-[100px] pointer-events-none" />
            
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#E5E7EB_1px,transparent_1px),linear-gradient(to_bottom,#E5E7EB_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Heading */}
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
                    <motion.span 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/25 uppercase mb-4 animate-pulse"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'আমাদের মাইলফলক' : 'Our Milestones'}
                    </motion.span>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] mb-4"
                    >
                        {t('achievements.ourAchievements')}
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#6B7280] text-lg sm:text-xl font-semibold leading-relaxed"
                    >
                        {t('achievements.subtitle')}
                    </motion.p>
                </div>

                {/* Grid 1: Achievement Statistics */}
                <div className="mb-20 lg:mb-28">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {statsList.map((stat, i) => {
                            const statData = getStatData(stat);
                            return (
                                <motion.div
                                    key={stat.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                    className="group relative bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                                >
                                    {/* Accent strip */}
                                    <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-[#f5a623]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                                                {renderLucideIcon(stat.iconName, `w-6 h-6 ${stat.iconColor}`)}
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1a2e5a]/5 text-[#1a2e5a]/80 border border-[#1a2e5a]/10">
                                                {stat.trend}
                                            </span>
                                        </div>

                                        {/* Stat highlight gold */}
                                        <div className="text-3xl sm:text-4xl font-extrabold text-[#f5a623] tracking-tight mb-2">
                                            <AnimatedCounter value={stat.val} />
                                        </div>

                                        <h4 className="text-base font-bold text-[#1F2937] mb-1 group-hover:text-[#1a2e5a] transition-colors duration-300">
                                            {statData.label}
                                        </h4>
                                    </div>
                                    <p className="text-[#6B7280] text-xs font-semibold leading-relaxed mt-2">
                                        {statData.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Grid 2: Analytics & Success Highlights Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 lg:mb-28">
                    {/* Recharts Analytics Panel (2/3 width) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="p-1.5 bg-[#1a2e5a]/10 rounded-lg text-[#1a2e5a]">
                                    <TrendingUp className="w-4 h-4" />
                                </span>
                                <h3 className="text-lg font-bold text-[#1F2937]">
                                    {t('achievements.analytics.title') || 'Performance Analytics'}
                                </h3>
                            </div>
                            <p className="text-sm font-semibold text-[#6B7280] mb-8 max-w-xl">
                                {t('achievements.analytics.subtitle') || 'Visual representation of our academic & co-curricular excellence over the years'}
                            </p>
                        </div>

                        {/* Chart Area utilizing Navy and Gold gradients */}
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1a2e5a" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#1a2e5a" stopOpacity={0.0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPlacement" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f5a623" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f5a623" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="year" stroke="#A0AEC0" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }} />
                                    <YAxis stroke="#A0AEC0" tickLine={false} axisLine={false} style={{ fontSize: '11px', fontWeight: 'bold' }} domain={[70, 100]} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '15px' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="successRate" 
                                        name={t('achievements.analytics.chartGpa') || 'Board Exam Success (%)'} 
                                        stroke="#1a2e5a" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorGpa)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="placement" 
                                        name={t('achievements.analytics.chartAdmissions') || 'University Admission (%)'} 
                                        stroke="#f5a623" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorPlacement)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Success Highlights Sidebar (1/3 width) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            {/* Gold stars pill */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/25 uppercase mb-3">
                                <Star className="w-3 h-3 fill-current" />
                                {t('achievements.successHighlights.badge') || 'Student Success Stories'}
                            </span>
                            <h3 className="text-lg font-bold text-[#1F2937] mb-2">
                                {t('achievements.successHighlights.title') || 'Success Highlights'}
                            </h3>
                            <p className="text-sm font-semibold text-[#6B7280] mb-6">
                                {t('achievements.successHighlights.subtitle') || 'Prominent placements and notable accomplishments from our alumni network'}
                            </p>

                            <div className="space-y-4">
                                {successHighlights.map((story, idx) => (
                                    <div key={idx} className="group/story flex gap-3 p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:shadow-md transition-all duration-300">
                                        <div className="w-10 h-10 bg-[#f5a623]/10 text-[#e6961a] rounded-xl flex items-center justify-center shrink-0">
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] font-bold text-[#6B7280]">{story.badge}</span>
                                                <span className="text-[10px] font-bold text-[#A0AEC0]">·</span>
                                                <span className="text-[10px] font-bold text-[#A0AEC0]">{story.year}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-[#1F2937] truncate group-hover/story:text-[#1a2e5a] transition-colors duration-200">{story.title}</h4>
                                            <p className="text-xs font-semibold text-[#6B7280] line-clamp-1">{story.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA button with gold glow shadow */}
                        <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
                            <button className="w-full inline-flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r from-[#f5a623] to-[#fdb94e] text-[#132348] font-bold text-xs shadow-[0_4px_14px_rgba(245,166,35,0.25)] hover:shadow-[0_6px_18px_rgba(245,166,35,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer">
                                <span>{language === 'bn' ? 'সব অ্যালামনাই দেখুন' : 'Explore Alumni Portal'}</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Awards Showcase section */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-black text-[#1F2937] mb-2">
                                {t('achievements.ourAchievements') || 'Awards Showcase'}
                            </h3>
                            <p className="text-[#6B7280] text-sm sm:text-base font-semibold">
                                {language === 'bn' ? 'ক্যাটাগরি অনুযায়ী আমাদের সকল গৌরবময় পুরস্কারের তালিকা' : 'Browse our records of excellence and awards by category'}
                            </p>
                        </div>

                        {/* Category filter tabs using Navy styles */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-1 shadow-sm flex flex-wrap gap-1 max-w-full">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5 ${
                                        activeCategory === category
                                            ? 'bg-[#1a2e5a] text-white shadow-md'
                                            : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6]'
                                    }`}
                                >
                                    {category !== 'all' && (
                                        <span>{categoryConfig[category]?.icon || '🏆'}</span>
                                    )}
                                    <span>{category === 'all' ? t('achievements.filters.all') : getCategoryLabel(category)}</span>
                                </button>
                            ))} 
                        </div>
                    </div>

                    {/* Showcase Cards Grid */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode="wait">
                            {visibleAchievements.map((achievement, idx) => {
                                const config = categoryConfig[achievement.category] || { icon: '🏆', bg: 'bg-[#1a2e5a]/10', border: 'border-[#1a2e5a]/15', text: 'text-[#1a2e5a]' };
                                return (
                                    <motion.div
                                        key={achievement._id || idx}
                                        variants={itemVariants}
                                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                        className="group bg-white border border-[#E5E7EB] hover:border-[#1a2e5a]/25 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-[4px] bg-[#E5E7EB] group-hover:bg-gradient-to-r group-hover:from-[#1a2e5a] group-hover:to-[#fdb94e] transition-all duration-300" />

                                        <div>
                                            {/* Category Tag */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${config.bg} ${config.text} border ${config.border}`}>
                                                    {config.icon}
                                                </div>
                                                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                                                    {getCategoryLabel(achievement.category)}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h4 className="text-lg font-bold text-[#1F2937] mb-2 leading-tight group-hover:text-[#1a2e5a] transition-colors duration-300">
                                                {achievement.title}
                                            </h4>

                                            {/* Date */}
                                            <div className="text-[10px] font-bold text-[#A0AEC0] mb-3">
                                                {formatDate(achievement.date)}
                                            </div>

                                            {/* Description */}
                                            <p className="text-[#6B7280] text-xs font-semibold leading-relaxed mb-5 line-clamp-3">
                                                {achievement.description}
                                            </p>
                                        </div>

                                        {/* Sub-achievements / highlights */}
                                        {achievement.achievements && achievement.achievements.length > 0 && (
                                            <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
                                                <h5 className="text-[9px] font-black text-[#1F2937] uppercase tracking-widest">{t('achievements.highlights')}</h5>
                                                <ul className="space-y-1.5">
                                                    {achievement.achievements.slice(0, 2).map((item, id) => (
                                                        <li key={id} className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                                                            <span className={`w-4 h-4 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                                                                <Check className={`w-2.5 h-2.5 ${config.text}`} strokeWidth={3} />
                                                            </span>
                                                            <span className="truncate">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {achievement.achievements.length > 2 && (
                                                    <p className="text-[10px] font-bold text-[#1a2e5a]">
                                                        +{achievement.achievements.length - 2} {t('achievements.more')}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {/* Show More / Less Trigger */}
                    {hasMoreAchievements && (
                        <div className="text-center mt-12">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="px-6 py-3 bg-white border border-[#1a2e5a]/20 hover:bg-[#1a2e5a]/5 text-[#1a2e5a] font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                            >
                                {showAll ? t('achievements.buttons.seeLess') : t('achievements.buttons.seeMore')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Achievements;