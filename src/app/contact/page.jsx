'use client';
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ContactPage = () => {
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
        alert('Thank you for your message! We will get back to you soon.');
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-[Inter,sans-serif]">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2e5a] to-[#132348] text-white py-16 md:py-28 border-b border-white/10">
                {/* Background decorative elements */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] rounded-full bg-[#f5a623]/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-[#fdb94e]/5 blur-[120px] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative container mx-auto px-4 text-center">
                    {/* Badge */}
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] mb-6">
                        {t('contact.cards.visitTitle')} &middot; {t('contact.cards.callTitle')} &middot; {t('contact.cards.emailTitle')}
                    </span>

                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                        {t('contact.pageTitle')}
                    </h1>
                    <p className="text-sm sm:text-base md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                        {t('contact.heroSubtitle')}
                    </p>
                </div>
            </div>

            {/* Contact Information Cards */}
            <div className="py-12 md:py-20 bg-[#F9FAFB]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F2937] tracking-tight mb-4">
                            {t('contact.multipleWaysTitle')}
                        </h2>
                        <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto">
                            {t('contact.multipleWaysSubtitle')}
                        </p>
                        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-[#f5a623] to-[#fdb94e] mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Visit Card */}
                        <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E5E7EB] text-center hover:shadow-md hover:border-[#f5a623]/30 transition-all duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1a2e5a] to-[#132348] border border-[#f5a623]/25 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.cards.visitTitle')}</h3>
                            <p className="text-[#374151] text-xs sm:text-sm leading-relaxed">
                                {t('contact.cards.addressLine1')}<br />
                                {t('contact.cards.addressLine2')}<br />
                                <span className="text-[#f5a623] font-semibold">{t('contact.cards.country')}</span>
                            </p>
                        </div>

                        {/* Call Card */}
                        <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E5E7EB] text-center hover:shadow-md hover:border-[#f5a623]/30 transition-all duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1a2e5a] to-[#132348] border border-[#f5a623]/25 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.cards.callTitle')}</h3>
                            <div className="text-[#374151] text-xs sm:text-sm leading-relaxed space-y-1">
                                <p><strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.mainLabel')}:</strong> (555) 123-4567</p>
                                <p><strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.admissionsLabel')}:</strong> (555) 123-4568</p>
                                <p><strong className="text-[#f5a623] font-bold">{t('contact.cards.emergencyLabel')}:</strong> (555) 123-4569</p>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E5E7EB] text-center hover:shadow-md hover:border-[#f5a623]/30 transition-all duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1a2e5a] to-[#132348] border border-[#f5a623]/25 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.cards.emailTitle')}</h3>
                            <div className="text-[#374151] text-xs sm:text-sm leading-relaxed space-y-2">
                                <p>
                                    <strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.emailGeneralLabel')}:</strong>
                                    <br />info@sunlightschool.edu
                                </p>
                                <p>
                                    <strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.emailAdmissionsLabel')}:</strong>
                                    <br />admissions@sunlightschool.edu
                                </p>
                                <p>
                                    <strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.emailSupportLabel')}:</strong>
                                    <br />support@sunlightschool.edu
                                </p>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E5E7EB] text-center hover:shadow-md hover:border-[#f5a623]/30 transition-all duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#1a2e5a] to-[#132348] border border-[#f5a623]/25 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.cards.hoursTitle')}</h3>
                            <div className="text-[#374151] text-xs sm:text-sm leading-relaxed space-y-1">
                                <p><strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.hoursWeekdaysLabel')}:</strong> 8:00 AM - 3:00 PM</p>
                                <p><strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.hoursSaturdayLabel')}:</strong> 9:00 AM - 12:00 PM</p>
                                <p><strong className="text-[#1a2e5a] font-semibold">{t('contact.cards.hoursSundayLabel')}:</strong> <span className="text-red-500 font-bold">{t('contact.cards.closedLabel')}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form and Map */}
            <div className="py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                        {/* Contact Form */}
                        <div className="bg-white p-6 sm:p-10 border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight mb-3">
                                    {t('contact.form.title')}
                                </h2>
                                <p className="text-sm text-[#6B7280]">
                                    {t('contact.form.subtitle')}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-2">{t('contact.form.nameLabel')}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                            placeholder={t('contact.form.placeholders.name')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-2">{t('contact.form.emailLabel')}</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                            placeholder={t('contact.form.placeholders.email')}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-2">{t('contact.form.phoneLabel')}</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                            placeholder={t('contact.form.placeholders.phone')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#374151] mb-2">{t('contact.form.subjectLabel')}</label>
                                        <div className="relative">
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all appearance-none cursor-pointer pr-10"
                                            >
                                                <option value="" className="text-gray-400">{t('contact.form.selectSubject')}</option>
                                                <option value="admissions">{t('contact.form.subjects.admissions')}</option>
                                                <option value="academic">{t('contact.form.subjects.academic')}</option>
                                                <option value="facilities">{t('contact.form.subjects.facilities')}</option>
                                                <option value="events">{t('contact.form.subjects.events')}</option>
                                                <option value="support">{t('contact.form.subjects.support')}</option>
                                                <option value="other">{t('contact.form.subjects.other')}</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#6B7280]">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">{t('contact.form.messageLabel')}</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all resize-none"
                                        placeholder={t('contact.form.placeholders.message')}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[#f5a623] to-[#fdb94e] text-[#132348] font-bold py-3.5 px-6 rounded-full shadow-[0_4px_14px_rgba(245,166,35,0.25)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 text-sm tracking-wide"
                                >
                                    {t('contact.form.sendButton')}
                                </button>
                            </form>
                        </div>

                        {/* Map and Additional Info */}
                        <div className="space-y-8">
                            {/* Map Card */}
                            <div className="bg-white p-6 sm:p-8 border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h3 className="text-xl font-bold text-[#1F2937] tracking-tight mb-4">{t('contact.map.title')}</h3>

                                {/* Embedded responsive map (latitude/longitude provided) */}
                                <div className="w-full overflow-hidden border border-[#E5E7EB] rounded-xl mb-5 shadow-inner">
                                    <iframe
                                        title="Sunlight School — Map"
                                        src="https://www.google.com/maps?q=25.6333,88.6333&z=16&hl=en&output=embed"
                                        className="w-full h-56 sm:h-64 border-0"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-[#374151]">
                                    <div>
                                        <div className="font-bold text-[#1a2e5a] text-base">Sunlight School</div>
                                        <div className="text-xs text-[#6B7280]">Latitude: 25.6333° N &middot; Longitude: 88.6333° E</div>
                                        <div className="text-xs font-medium text-[#374151]/80 mt-0.5">123 Education Street, Knowledge City</div>
                                    </div>

                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=25.6333,88.6333"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center bg-[#1a2e5a] text-[#f5a623] hover:bg-[#132348] border border-[#f5a623]/25 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        {t('contact.map.openInMaps')}
                                    </a>
                                </div>
                            </div>

                            {/* Quick Contact Options */}
                            <div className="bg-white p-6 sm:p-8 border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                                <h3 className="text-xl font-bold text-[#1F2937] tracking-tight mb-5">{t('contact.quick.title')}</h3>
                                <div className="space-y-4">
                                    {/* Option 1 */}
                                    <div className="group flex items-center p-4 bg-[#F9FAFB] hover:bg-white rounded-xl border border-[#E5E7EB] hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm cursor-pointer">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#1a2e5a] to-[#132348] border border-[#f5a623]/25 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-300">
                                            <svg className="w-6 h-6 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1F2937] text-sm group-hover:text-[#f5a623] transition-colors duration-200">{t('contact.quick.liveChat.title')}</h4>
                                            <p className="text-[#6B7280] text-xs sm:text-sm mt-0.5">{t('contact.quick.liveChat.subtitle')}</p>
                                        </div>
                                    </div>

                                    {/* Option 2 */}
                                    <div className="group flex items-center p-4 bg-[#F9FAFB] hover:bg-white rounded-xl border border-[#E5E7EB] hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm cursor-pointer">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#1a2e5a] to-[#132348] border border-[#f5a623]/25 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-300">
                                            <svg className="w-6 h-6 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1F2937] text-sm group-hover:text-[#f5a623] transition-colors duration-200">{t('contact.quick.tour.title')}</h4>
                                            <p className="text-[#6B7280] text-xs sm:text-sm mt-0.5">{t('contact.quick.tour.subtitle')}</p>
                                        </div>
                                    </div>

                                    {/* Option 3 */}
                                    <div className="group flex items-center p-4 bg-[#F9FAFB] hover:bg-white rounded-xl border border-[#E5E7EB] hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm cursor-pointer">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#1a2e5a] to-[#132348] border border-[#f5a623]/25 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-300">
                                            <svg className="w-6 h-6 text-[#f5a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1F2937] text-sm group-hover:text-[#f5a623] transition-colors duration-200">{t('contact.quick.request.title')}</h4>
                                            <p className="text-[#6B7280] text-xs sm:text-sm mt-0.5">{t('contact.quick.request.subtitle')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-16 md:py-24 bg-[#F9FAFB]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F2937] tracking-tight mb-4">
                            {t('contact.faq.title')}
                        </h2>
                        <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto">
                            {t('contact.faq.subtitle')}
                        </p>
                        <div className="mt-4 w-24 h-1 bg-gradient-to-r from-[#f5a623] to-[#fdb94e] mx-auto rounded-full" />
                    </div>

                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                        {/* FAQ Q1 */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border-l-4 border-l-[#f5a623] border border-[#E5E7EB] hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.faq.q1.question')}</h3>
                            <p className="text-[#374151] text-sm leading-relaxed">{t('contact.faq.q1.answer')}</p>
                        </div>

                        {/* FAQ Q2 */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border-l-4 border-l-[#f5a623] border border-[#E5E7EB] hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.faq.q2.question')}</h3>
                            <p className="text-[#374151] text-sm leading-relaxed">{t('contact.faq.q2.answer')}</p>
                        </div>

                        {/* FAQ Q3 */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border-l-4 border-l-[#f5a623] border border-[#E5E7EB] hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.faq.q3.question')}</h3>
                            <p className="text-[#374151] text-sm leading-relaxed">{t('contact.faq.q3.answer')}</p>
                        </div>

                        {/* FAQ Q4 */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border-l-4 border-l-[#f5a623] border border-[#E5E7EB] hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-[#1F2937] mb-3 tracking-tight">{t('contact.faq.q4.question')}</h3>
                            <p className="text-[#374151] text-sm leading-relaxed">{t('contact.faq.q4.answer')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;