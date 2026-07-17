'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useNotices } from '../../src/hooks/useApi';

/* ─── animation variants ─── */
const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay } }
});

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } }
};

const cardVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.3 } }
};

/* ─── type config: Tailwind styling classes + icons + fallback labels ─── */
const typeConfig = {
    exam: { 
        icon: '📝', 
        bg: 'bg-[#f5a623]/10', 
        bar: 'bg-[#f5a623]', 
        text: 'text-[#e6961a]', 
        border: 'border-[#f5a623]/20', 
        label: 'Exam' 
    },
    holiday: { 
        icon: '🏖️', 
        bg: 'bg-[#1a2e5a]/10', 
        bar: 'bg-[#1a2e5a]', 
        text: 'text-[#1a2e5a]', 
        border: 'border-[#1a2e5a]/20', 
        label: 'Holiday' 
    },
    general: { 
        icon: '📢', 
        bg: 'bg-[#132348]/10', 
        bar: 'bg-[#132348]', 
        text: 'text-[#132348]', 
        border: 'border-[#132348]/20', 
        label: 'General' 
    },
    event: { 
        icon: '🎉', 
        bg: 'bg-[#f5a623]/10', 
        bar: 'bg-[#f5a623]', 
        text: 'text-[#e6961a]', 
        border: 'border-[#f5a623]/20', 
        label: 'Event' 
    },
    academic: { 
        icon: '🎓', 
        bg: 'bg-[#1a2e5a]/10', 
        bar: 'bg-[#1a2e5a]', 
        text: 'text-[#1a2e5a]', 
        border: 'border-[#1a2e5a]/20', 
        label: 'Academic' 
    },
};

const defaultConfig = { 
    icon: '📌', 
    bg: 'bg-gray-100', 
    bar: 'bg-gray-400', 
    text: 'text-gray-700', 
    border: 'border-gray-200', 
    label: 'Notice' 
};

const tabs = [
    { id: 'all', icon: '📋', labelKey: 'notices.tabs.all' },
    { id: 'exam', icon: '📝', labelKey: 'notices.tabs.exams' },
    { id: 'holiday', icon: '🏖️', labelKey: 'notices.tabs.holidays' },
    { id: 'general', icon: '📢', labelKey: 'notices.tabs.general' },
    { id: 'event', icon: '🎉', labelKey: 'notices.tabs.events' },
    { id: 'academic', icon: '🎓', labelKey: 'notices.tabs.academic' },
];

/* ═══════════════════════════════════════════════════════ */
const Notice = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { t, language } = useLanguage();

    const { data: noticesData, isLoading: loading, error: fetchError } = useNotices();
    const notices = noticesData?.data || [];
    const error = fetchError?.message || null;

    const filteredNotices = activeTab === 'all' ? notices : notices.filter(n => n.type === activeTab);
    const displayedNotices = showAll ? filteredNotices : filteredNotices.slice(0, 4);
    const importantCount = notices.filter(n => n.important).length;

    const formatDate = (ds) => {
        if (!ds) return '';
        const locale = language === 'en' ? 'en-US' : 'bn-BD';
        try { return new Date(ds).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }); }
        catch { return ds; }
    };

    const getTypeLabel = (type) => {
        const key = `notices.types.${type}`;
        const label = t(key);
        return label === key ? (typeConfig[type]?.label || type) : label;
    };

    const openModal = (n) => { setSelectedNotice(n); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setSelectedNotice(null); };

    /* ─── SKELETON LOADING STATE ─── */
    if (loading) return (
        <section className="py-12 lg:py-20 bg-[#F9FAFB]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                {/* header skeleton */}
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-8 w-56 bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                    <div className="h-10 w-28 bg-[#1a2e5a]/10 rounded-full animate-pulse" />
                </div>
                {/* tab skeleton */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-9 w-20 bg-gray-200 rounded-full animate-pulse" />
                    ))}
                </div>
                {/* card skeletons */}
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-3 w-1/4 bg-gray-200 rounded-full" />
                                    <div className="h-5 w-3/4 bg-gray-200 rounded-lg" />
                                    <div className="h-3 w-full bg-gray-200 rounded" />
                                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    /* ─── ERROR STATE ─── */
    if (error) return (
        <section className="py-12 bg-[#F9FAFB]">
            <div className="container mx-auto px-4 text-center max-w-xl">
                <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-lg font-bold text-[#1F2937] mb-2">{t('notices.errorTitle')}</h2>
                    <p className="text-[#6B7280] text-sm">{error}</p>
                </div>
            </div>
        </section>
    );

    /* ─── EMPTY STATE ─── */
    if (!loading && notices.length === 0) return (
        <section className="py-12 bg-[#F9FAFB]">
            <div className="container mx-auto px-4 text-center max-w-xl">
                <div className="bg-white rounded-2xl p-10 border border-[#E5E7EB] shadow-sm">
                    <div className="w-16 h-16 bg-[#1a2e5a]/10 text-[#1a2e5a] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📭</div>
                    <h2 className="text-lg font-bold text-[#1F2937] mb-2">{t('notices.emptyTitle')}</h2>
                    <p className="text-[#6B7280] text-sm">{t('notices.emptyMessage')}</p>
                </div>
            </div>
        </section>
    );

    /* ══════════════════════ MAIN RENDER ══════════════════════ */
    return (
        <>
            <section className="relative py-12 lg:py-20 bg-[#F9FAFB] overflow-hidden font-[Inter,sans-serif]">

                {/* decorative ambient blobs */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#1a2e5a]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -left-16 w-60 h-60 bg-[#f5a623]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

                    {/* ─── SECTION HEADER ─── */}
                    <motion.div
                        variants={fadeUp(0)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
                    >
                        <div>
                            {/* subtitle badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/20 mb-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
                                <span className="text-[11px] text-[#f5a623] font-bold uppercase tracking-widest">
                                    {t('notices.subtitle') || 'Stay Updated'}
                                </span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] tracking-tight leading-tight">
                                {t('notices.noticeboard') || 'School Notices'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {importantCount > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs font-bold text-red-600">{importantCount} Urgent</span>
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowAll(true)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-[#132348] bg-gradient-to-r from-[#f5a623] to-[#fdb94e] shadow-[0_4px_14px_rgba(245,166,35,0.3)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.45)] transition-all duration-200"
                            >
                                View All
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* ─── FILTER TABS ─── */}
                    <motion.div
                        variants={fadeUp(0.1)}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="flex flex-wrap gap-2 mb-8"
                    >
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setActiveTab(tab.id); setShowAll(false); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                                        isActive
                                            ? 'bg-[#1a2e5a] text-white border-[#1a2e5a] shadow-md'
                                            : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50 hover:text-[#1F2937]'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{t(tab.labelKey)}</span>
                                    {tab.id !== 'all' && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                            isActive ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {notices.filter(n => n.type === tab.id).length}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>

                    {/* ─── NOTICE LIST ─── */}
                    {displayedNotices.length === 0 ? (
                        <motion.div
                            variants={fadeUp(0.15)}
                            initial="hidden"
                            animate="show"
                            className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm"
                        >
                            <div className="text-5xl mb-4">📭</div>
                            <h3 className="text-lg font-bold text-[#1F2937] mb-2">{t('notices.noNoticesFound')}</h3>
                            <p className="text-[#6B7280] text-sm">{t('notices.emptyAll')}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            className="space-y-3"
                        >
                            <AnimatePresence mode="popLayout">
                                {displayedNotices.map((notice, index) => {
                                    const cfg = typeConfig[notice.type] || defaultConfig;
                                    const isFirst = index === 0;

                                    return (
                                        <motion.div
                                            key={notice._id || notice.id}
                                            variants={cardVariant}
                                            layout
                                            whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(26,46,90,0.08)' }}
                                            className={`relative bg-white border rounded-2xl overflow-hidden transition-all duration-300 group ${
                                                notice.important
                                                    ? 'border-red-200 hover:border-red-300 shadow-[0_4px_14px_rgba(239,68,68,0.03)]'
                                                    : 'border-[#E5E7EB] hover:border-[#1a2e5a]/25'
                                            } ${isFirst && notice.important ? 'ring-2 ring-red-500/15' : 'shadow-sm'}`}
                                        >
                                            {/* left accent bar using Tailwind class config */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${cfg.bar}`} />

                                            <div className="pl-5 pr-5 py-5 sm:py-5">
                                                <div className="flex gap-4 items-start">

                                                    {/* icon bubble using Tailwind classes */}
                                                    <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                                        {cfg.icon}
                                                    </div>

                                                    {/* content */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* top row: badges + date */}
                                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                                                {getTypeLabel(notice.type)}
                                                            </span>
                                                            {notice.important && (
                                                                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                                    {t('notices.important') || 'Important'}
                                                                </span>
                                                            )}
                                                            <span className="ml-auto text-[11px] text-[#9CA3AF] font-semibold shrink-0">
                                                                {formatDate(notice.createdAt || notice.date)}
                                                            </span>
                                                        </div>

                                                        {/* title */}
                                                        <h3 className="text-base sm:text-lg font-bold text-[#1F2937] leading-snug mb-1.5 group-hover:text-[#1a2e5a] transition-colors duration-200 line-clamp-1">
                                                            {notice.title}
                                                        </h3>

                                                        {/* description */}
                                                        <p className="text-[#6B7280] text-sm leading-relaxed line-clamp-2 mb-3">
                                                            {notice.content}
                                                        </p>

                                                        {/* footer row */}
                                                        <div className="flex items-center justify-between">
                                                            <motion.button
                                                                whileHover={{ x: 3 }}
                                                                onClick={() => openModal(notice)}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2e5a] hover:text-[#f5a623] transition-colors duration-200"
                                                            >
                                                                {t('notices.readMore') || 'Read more'}
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                </svg>
                                                            </motion.button>

                                                            {/* attachment hint */}
                                                            {notice.attachment && (
                                                                <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF] font-medium">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                    </svg>
                                                                    Attachment
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* ─── SHOW MORE / LESS ─── */}
                    {filteredNotices.length > 4 && (
                        <motion.div
                            variants={fadeUp(0.2)}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="text-center mt-8"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowAll(!showAll)}
                                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-bold text-[#1a2e5a] border border-[#1a2e5a]/20 bg-white hover:bg-[#1a2e5a]/5 transition-all duration-200 shadow-sm"
                            >
                                {showAll ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                        {t('notices.showLess') || 'Show Less'}
                                    </>
                                ) : (
                                    <>
                                        {t('notices.viewAll') || 'View All'} ({filteredNotices.length})
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ══════════════ NOTICE DETAIL MODAL ══════════════ */}
            <AnimatePresence>
                {showModal && selectedNotice && (() => {
                    const cfg = typeConfig[selectedNotice.type] || defaultConfig;
                    return (
                        <motion.div
                            key="modal-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-[#0f111a]/45"
                            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                        >
                            <motion.div
                                key="modal-panel"
                                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.93, y: 16 }}
                                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-hidden flex flex-col border border-gray-150"
                            >
                                {/* modal header */}
                                <div className="relative px-6 pt-6 pb-5 border-b border-gray-100">
                                    {/* colored top accent bar using config bar class */}
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl ${cfg.bar}`} />

                                    <div className="flex items-start justify-between gap-4 mt-1">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0 ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                                {cfg.icon}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                                        {getTypeLabel(selectedNotice.type)}
                                                    </span>
                                                    {selectedNotice.important && (
                                                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                            {t('notices.important') || 'Important'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-[#9CA3AF] mt-1 font-semibold">
                                                    {t('notices.publishedOn') || 'Published'} {formatDate(selectedNotice.createdAt || selectedNotice.date)}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={closeModal}
                                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 shrink-0"
                                        >
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </div>

                                {/* modal body */}
                                <div className="px-6 py-6 overflow-y-auto flex-1">
                                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight mb-5 leading-tight">
                                        {selectedNotice.title}
                                    </h2>
                                    <div className="prose max-w-none text-[#374151] text-sm sm:text-base leading-relaxed">
                                        <p className="whitespace-pre-line">{selectedNotice.content}</p>
                                    </div>
                                </div>

                                {/* modal footer */}
                                <div className="px-6 py-4 border-t border-gray-100 bg-[#F9FAFB] rounded-b-3xl flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={closeModal}
                                        className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all duration-200"
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </>
    );
};

export default Notice;