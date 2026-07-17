'use client';
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const AboutPage = () => {
    const { t } = useLanguage();

    const stats = [
        { number: '1000+', label: t('about.stats.students') },
        { number: '50+', label: t('about.stats.teachers') },
        { number: '30+', label: t('about.stats.years') },
        { number: '95%', label: t('about.stats.graduation') }
    ];

    const achievements = [
        { title: t('about.achievements.academicTitle'), year: '2024', description: t('about.achievements.academicDesc') },
        { title: t('about.achievements.stemTitle'), year: '2023', description: t('about.achievements.stemDesc') },
        { title: t('about.achievements.communityTitle'), year: '2022', description: t('about.achievements.communityDesc') },
        { title: t('about.achievements.sportsTitle'), year: '2024', description: t('about.achievements.sportsDesc') }
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-[Inter,sans-serif] text-[#374151]">
            {/* Hero Section */}
            <div className="relative bg-[#132348] overflow-hidden py-16 md:py-24 border-b border-white/10">
                {/* Background Blobs */}
                <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#1a2e5a]/50 blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#f5a623]/10 blur-[120px] pointer-events-none"></div>
                
                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/30 uppercase tracking-wider mb-4 animate-pulse">
                        ⭐ {t('about.pageTitle')}
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-none">
                        {t('about.pageTitle')}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                        {t('about.heroDescription')}
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-12 md:py-20 bg-white border-b border-[#E5E7EB]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="w-14 h-14 sm:w-16 md:w-20 bg-[#1a2e5a] border-2 border-[#f5a623]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                                    <span className="text-base sm:text-lg md:text-xl font-black text-[#f5a623]">{stat.number}</span>
                                </div>
                                <h3 className="text-xs sm:text-sm font-extrabold text-[#1F2937] uppercase tracking-wider">{stat.label}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="py-12 md:py-20 bg-[#F9FAFB]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
                        <div className="space-y-6 flex flex-col justify-between">
                            <div className="bg-white border border-[#E5E7EB] p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex-1 flex flex-col justify-center">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-[#1a2e5a]/10 border border-[#f5a623]/25 rounded-xl flex items-center justify-center mr-4 text-[#f5a623]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1F2937] tracking-tight">{t('about.mission')}</h2>
                                </div>
                                <p className="text-sm sm:text-base text-[#374151] leading-relaxed">
                                    {t('about.missionText')}
                                </p>
                            </div>

                            <div className="bg-white border border-[#E5E7EB] p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex-1 flex flex-col justify-center mt-6 lg:mt-0">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-[#1a2e5a]/10 border border-[#f5a623]/25 rounded-xl flex items-center justify-center mr-4 text-[#f5a623]">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1F2937] tracking-tight">{t('about.vision')}</h2>
                                </div>
                                <p className="text-sm sm:text-base text-[#374151] leading-relaxed">
                                    {t('about.visionText')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-center">
                            <h3 className="text-2xl font-extrabold text-[#1F2937] tracking-tight mb-6">{t('about.whyTitle')}</h3>
                            <ul className="space-y-4">
                                {[
                                    t('about.why.personalized'),
                                    t('about.why.facilities'),
                                    t('about.why.experienced'),
                                    t('about.why.extracurricular'),
                                    t('about.why.community')
                                ].map((whyText, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="w-2 h-2 bg-[#f5a623] rounded-full mr-3 mt-2 shrink-0"></div>
                                        <span className="text-[#374151] text-sm sm:text-base font-medium leading-relaxed">{whyText}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="py-12 md:py-20 bg-white border-y border-[#E5E7EB]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-4">{t('about.legacy.title')}</h2>
                            <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-3xl mx-auto">{t('about.legacy.subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                            <div className="space-y-6 flex flex-col justify-between">
                                {[
                                    { yearKey: '1995', title: t('about.history.1995.title'), text: t('about.history.1995.text') },
                                    { yearKey: '2010', title: t('about.history.2010.title'), text: t('about.history.2010.text') },
                                    { yearKey: '2024', title: t('about.history.2024.title'), text: t('about.history.2024.text') }
                                ].map((item, index) => (
                                    <div key={index} className="bg-[#F9FAFB] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300 flex-1 flex flex-col justify-center">
                                        <h3 className="text-lg font-extrabold text-[#1a2e5a] mb-2 flex items-center gap-2">
                                            <span className="bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 px-2 py-0.5 rounded-lg text-xs font-bold">{item.yearKey}</span>
                                            <span>{item.title}</span>
                                        </h3>
                                        <p className="text-sm text-[#374151] leading-relaxed">{item.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[#132348] border border-[#f5a623]/15 p-6 sm:p-8 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
                                {/* Gradient Blobs */}
                                <div className="absolute top-[-30%] right-[-20%] w-60 h-60 rounded-full bg-[#f5a623]/10 blur-[80px] pointer-events-none"></div>
                                <div className="absolute bottom-[-30%] left-[-20%] w-60 h-60 rounded-full bg-[#1a2e5a]/40 blur-[80px] pointer-events-none"></div>

                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-2xl font-extrabold tracking-tight text-[#f5a623]">{t('about.journey.title')}</h3>
                                    <p className="text-sm sm:text-base leading-relaxed text-white/80">{t('about.journey.text')}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10 relative z-10 mt-8">
                                    <div className="text-center">
                                        <div className="text-3xl sm:text-4xl font-extrabold text-[#f5a623]">30+</div>
                                        <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">{t('about.journey.years')}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl sm:text-4xl font-extrabold text-[#f5a623]">20x</div>
                                        <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">{t('about.journey.growth')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Programs */}
            <div className="py-12 md:py-20 bg-[#F9FAFB]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-4">{t('about.programs.title')}</h2>
                        <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-3xl mx-auto">{t('about.programs.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-8 h-8 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                ),
                                title: t('about.programs.primary.title'),
                                desc: t('about.programs.primary.desc'),
                                features: [t('about.programs.primary.features.0'), t('about.programs.primary.features.1'), t('about.programs.primary.features.2'), t('about.programs.primary.features.3')]
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                ),
                                title: t('about.programs.middle.title'),
                                desc: t('about.programs.middle.desc'),
                                features: [t('about.programs.middle.features.0'), t('about.programs.middle.features.1'), t('about.programs.middle.features.2'), t('about.programs.middle.features.3')]
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                ),
                                title: t('about.programs.high.title'),
                                desc: t('about.programs.high.desc'),
                                features: [t('about.programs.high.features.0'), t('about.programs.high.features.1'), t('about.programs.high.features.2'), t('about.programs.high.features.3')]
                            }
                        ].map((prog, index) => (
                            <div key={index} className="bg-white border border-[#E5E7EB] p-6 sm:p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="w-14 h-14 bg-[#1a2e5a] border border-[#f5a623]/25 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {prog.icon}
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1F2937] tracking-tight mb-3">{prog.title}</h3>
                                <p className="text-sm text-[#374151] mb-4 leading-relaxed">{prog.desc}</p>
                                <ul className="space-y-2 text-xs text-[#6B7280] font-semibold border-t border-[#E5E7EB] pt-4">
                                    {prog.features.map((feat, fIdx) => (
                                        <li key={fIdx}>{feat}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-4">{t('achievements.title')}</h2>
                        <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-3xl mx-auto">{t('achievements.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                        {achievements.map((achievement, index) => (
                            <div key={index} className="bg-[#F9FAFB] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <h3 className="text-lg font-extrabold text-[#1F2937] leading-snug tracking-tight">{achievement.title}</h3>
                                    <span className="bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 px-3 py-1 rounded-full text-xs font-bold shrink-0">{achievement.year}</span>
                                </div>
                                <p className="text-sm text-[#374151] leading-relaxed">{achievement.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Facilities */}
            <div className="py-12 md:py-20 bg-[#F9FAFB] border-t border-[#E5E7EB]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-4">{t('facilities.title')}</h2>
                        <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-3xl mx-auto">{t('facilities.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: t('facilities.smartClassrooms'), desc: t('facilities.smartClassroomsDesc') },
                            { icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: t('facilities.scienceLabs'), desc: t('facilities.scienceLabsDesc') },
                            { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: t('facilities.sportsComplex'), desc: t('facilities.sportsComplexDesc') },
                            { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: t('facilities.digitalLibrary'), desc: t('facilities.digitalLibraryDesc') }
                        ].map((item, index) => (
                            <div key={index} className="bg-white border border-[#E5E7EB] p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="w-14 h-14 bg-[#1a2e5a] border border-[#f5a623]/25 rounded-full flex items-center justify-center mx-auto mb-4 text-[#f5a623]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-base sm:text-lg font-extrabold text-[#1F2937] tracking-tight mb-2">{item.label}</h3>
                                <p className="text-xs sm:text-sm text-[#374151] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="py-12 md:py-20 bg-white border-b border-[#E5E7EB]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-4">{t('about.coreValues.title')}</h2>
                        <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-3xl mx-auto">{t('about.coreValues.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: t('about.coreValues.excellence.title'), text: t('about.coreValues.excellence.text') },
                            { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', title: t('about.coreValues.compassion.title'), text: t('about.coreValues.compassion.text') },
                            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: t('about.coreValues.community.title'), text: t('about.coreValues.community.text') }
                        ].map((val, index) => (
                            <div key={index} className="text-center bg-[#F9FAFB] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1a2e5a] border border-[#f5a623]/25 rounded-full flex items-center justify-center mx-auto mb-6 text-[#f5a623]">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={val.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1F2937] tracking-tight mb-3">{val.title}</h3>
                                <p className="text-sm text-[#374151] leading-relaxed">{val.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="py-12 md:py-20 bg-[#F9FAFB]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight mb-4">{t('contact.title')}</h2>
                        <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-3xl mx-auto">{t('about.contactSubtitle')}</p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-[#1a2e5a] text-[#f5a623] border border-[#f5a623]/20 rounded-xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-[#1F2937] tracking-tight">{t('about.contact.visitTitle')}</h3>
                                </div>
                                <div className="space-y-2 text-sm text-[#374151] font-medium border-t border-[#E5E7EB] pt-4">
                                    <p>{t('about.contact.addressLine1')}</p>
                                    <p>{t('about.contact.addressLine2')}</p>
                                    <p className="text-[#f5a623] font-bold">{t('about.contact.country')}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-[#1a2e5a] text-[#f5a623] border border-[#f5a623]/20 rounded-xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-[#1F2937] tracking-tight">{t('about.contact.getInTouchTitle')}</h3>
                                </div>
                                <div className="space-y-2 text-sm text-[#374151] border-t border-[#E5E7EB] pt-4">
                                    <p><strong className="text-[#1a2e5a]">{t('contact.phone')}:</strong> <span className="font-semibold">{t('footer.phone')}</span></p>
                                    <p><strong className="text-[#1a2e5a]">{t('contact.email')}:</strong> <span className="font-semibold">{t('footer.email')}</span></p>
                                    <p><strong className="text-[#1a2e5a]">{t('about.contact.admissionsLabel')}:</strong> <span className="text-[#f5a623] font-bold">admissions@sunlightschool.edu</span></p>
                                </div>
                            </div>

                            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-[#1a2e5a] text-[#f5a623] border border-[#f5a623]/20 rounded-xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-[#1F2937] tracking-tight">{t('about.contact.hoursTitle')}</h3>
                                </div>
                                <div className="space-y-3 border-t border-[#E5E7EB] pt-4">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-[#6B7280] font-semibold">{t('about.contact.weekdays')}</span>
                                        <span className="text-[#1a2e5a] font-bold">8:00 AM - 3:00 PM</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-[#6B7280] font-semibold">{t('about.contact.saturday')}</span>
                                        <span className="text-[#1a2e5a] font-bold">9:00 AM - 12:00 PM</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-[#6B7280] font-semibold">{t('about.contact.sunday')}</span>
                                        <span className="text-red-500 font-bold uppercase">{t('about.contact.closed')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-xs">
                                    <p className="text-[#6B7280] leading-relaxed">
                                        <strong className="text-[#1a2e5a]">{t('about.contact.admissionsOfficeLabel')}:</strong><br />
                                        {t('about.contact.admissionsOfficeHours')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;