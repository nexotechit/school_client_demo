'use client';
import React, { useState, useEffect, memo } from 'react';
import { API_URL } from '../../../../config/api';
import ImgBBUpload from '../../../../components/ImgBBUpload';
import Swal from 'sweetalert2';

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-black truncate">{value || 'Not provided'}</p>
            </div>
        </div>
    );
}

export default memo(function PortalProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [editMode, setEditMode] = useState({
        address: false,
        parentPhone: false,
        image: false
    });
    const [formData, setFormData] = useState({
        address: '',
        parentPhone: '',
        imageUrl: ''
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
                address: parsedUser.address || '',
                parentPhone: parsedUser.parentPhone || '',
                imageUrl: parsedUser.imageUrl || ''
            });
        }
        setLoading(false);
    };

    const handleImageUpload = async (imageUrlValue) => {
        setFormData(prev => ({ ...prev, imageUrl: imageUrlValue }));
        await updateProfile({ imageUrl: imageUrlValue });
        setEditMode(prev => ({ ...prev, image: false }));
        const updatedUser = { ...user, imageUrl: imageUrlValue };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setImgError(false);
    };

    const handleFieldUpdate = async (field, value) => {
        try {
            setUpdating(true);
            await updateProfile({ [field]: value });
            setEditMode(prev => ({ ...prev, [field]: false }));
            const updatedUser = { ...user, [field]: value };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Failed to update profile. Please try again.' });
        } finally {
            setUpdating(false);
        }
    };

    const updateProfile = async (updateData) => {
        const response = await fetch(`${API_URL}/api/auth/user/${user._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    };

    const handleCancel = (field) => {
        setFormData(prev => ({ ...prev, [field]: user[field] || '' }));
        setEditMode(prev => ({ ...prev, [field]: false }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100 border-t-blue-700"></div>
                <p className="text-sm text-black font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-blue-900 mb-1">Profile Not Found</h2>
                    <p className="text-black text-sm">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-48 translate-x-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-32 -translate-x-32"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 py-10 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl ring-4 ring-white/30 overflow-hidden bg-white/20 flex items-center justify-center shadow-2xl">
                                {user.imageUrl && !imgError ? (
                                    <img
                                        src={user.imageUrl}
                                        alt={user.name}
                                        onError={() => setImgError(true)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl md:text-6xl font-extrabold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-blue-900 shadow ${user.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
                            <button
                                onClick={() => setEditMode(prev => ({ ...prev, image: !prev.image }))}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 transition-colors border border-gray-100"
                                title="Change photo"
                            >
                                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>

                        {/* Name & Meta */}
                        <div className="text-center md:text-left pb-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                    {user.name}
                                </h1>
                                <span className={`self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1 text-blue-200 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" /></svg>
                                    ID: {user.studentId}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    Class {user.class} — Section {user.section}
                                </span>
                                {user.email && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {user.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                        {[
                            { label: 'Student ID', value: user.studentId, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg> },
                            { label: 'Roll Number', value: user.rollNumber || '—', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
                            { label: 'Class', value: user.class, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
                            { label: 'Section', value: user.section, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                                <div className="text-white/70 flex justify-center mb-1">{stat.icon}</div>
                                <p className="text-lg font-extrabold text-white truncate">{stat.value}</p>
                                <p className="text-xs text-blue-200 font-medium mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Upload Modal */}
            {editMode.image && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-blue-900">Update Profile Picture</h3>
                            <button
                                onClick={() => setEditMode(prev => ({ ...prev, image: false }))}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <ImgBBUpload
                            onUploadSuccess={(urls) => handleImageUpload(Array.isArray(urls) ? urls[0] : urls)}
                            onUploadError={(error) => Swal.fire('Error', error, 'error')}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                            <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-blue-900">Personal Information</h2>
                        </div>
                        <div className="px-6 py-2">
                            <InfoRow
                                label="Full Name"
                                value={user.name}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                            />
                            <InfoRow
                                label="Email Address"
                                value={user.email}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            />
                            <InfoRow
                                label="Date of Birth"
                                value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            />

                            {/* Editable Address */}
                            <div className="flex items-start gap-4 py-3 border-b border-gray-100">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</p>
                                    {editMode.address ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                rows="3"
                                                placeholder="Enter your address"
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleFieldUpdate('address', formData.address)} disabled={updating} className="px-4 py-1.5 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 font-medium">
                                                    {updating ? 'Saving…' : 'Save'}
                                                </button>
                                                <button onClick={() => handleCancel('address')} className="px-4 py-1.5 bg-gray-100 text-black text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-black">{user.address || 'Not provided'}</p>
                                            <button onClick={() => setEditMode(prev => ({ ...prev, address: true }))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        {/* Academic Information */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                <div className="w-9 h-9 bg-indigo-700 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h2 className="text-base font-bold text-blue-900">Academic Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Student ID', value: user.studentId },
                                        { label: 'Roll Number', value: user.rollNumber || 'N/A' },
                                        { label: 'Class', value: user.class },
                                        { label: 'Section', value: user.section },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-100">
                                            <p className="text-2xl font-extrabold text-blue-700">{item.value}</p>
                                            <p className="text-xs text-black font-medium mt-1">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Parent / Guardian Information */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                                <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-base font-bold text-blue-900">Parent / Guardian</h2>
                            </div>
                            <div className="px-6 py-2">
                                <InfoRow
                                    label="Parent Name"
                                    value={user.parentName}
                                    icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                />

                                {/* Editable Parent Phone */}
                                <div className="flex items-start gap-4 py-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Parent Phone</p>
                                        {editMode.parentPhone ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="tel"
                                                    value={formData.parentPhone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter parent phone number"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleFieldUpdate('parentPhone', formData.parentPhone)} disabled={updating} className="px-4 py-1.5 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 font-medium">
                                                        {updating ? 'Saving…' : 'Save'}
                                                    </button>
                                                    <button onClick={() => handleCancel('parentPhone')} className="px-4 py-1.5 bg-gray-100 text-black text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-semibold text-black">{user.parentPhone || 'Not provided'}</p>
                                                <button onClick={() => setEditMode(prev => ({ ...prev, parentPhone: true }))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors shrink-0">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
