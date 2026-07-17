'use client';
import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../../config/api';

const dayColors = {
    Monday:    'bg-blue-100 text-blue-800',
    Tuesday:   'bg-purple-100 text-purple-800',
    Wednesday: 'bg-emerald-100 text-emerald-800',
    Thursday:  'bg-amber-100 text-amber-800',
    Friday:    'bg-rose-100 text-rose-800',
    Saturday:  'bg-indigo-100 text-indigo-800',
    Sunday:    'bg-gray-100 text-gray-700',
};

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-black truncate">{value || 'Not provided'}</p>
            </div>
        </div>
    );
}

export default function TeacherProfile() {
    const [teacher, setTeacher] = useState(null);
    const [classRoutines, setClassRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        loadTeacherProfile();
    }, []);

    const loadTeacherProfile = async () => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                alert('Please log in to view your profile');
                return;
            }
            const user = JSON.parse(userData);
            if (user.role !== 'teacher') {
                setLoading(false);
                return;
            }
            const response = await fetch(`${API_URL}/api/teachers/email/${user.email}`);
            const teacherData = await response.json();
            if (teacherData.success && teacherData.data) {
                setTeacher(teacherData.data);
                await fetchClassRoutines(teacherData.data);
                return;
            } else {
                setTeacher(user);
                await fetchClassRoutines(user);
            }
        } catch (error) {
            console.error('Error loading teacher profile:', error);
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    if (user.role === 'teacher') {
                        setTeacher(user);
                        await fetchClassRoutines(user);
                    }
                }
            } catch (fallbackError) {
                console.error('Final fallback error:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchClassRoutines = async (teacherData) => {
        try {
            const response = await fetch(`${API_URL}/api/class/routines`);
            const data = await response.json();
            let routines = [];
            if (data && data.data && Array.isArray(data.data)) routines = data.data;
            else if (Array.isArray(data)) routines = data;
            const teacherRoutines = routines.filter(routine =>
                routine.teacherId === teacherData.teacherId ||
                routine.teacherName === teacherData.name
            );
            setClassRoutines(teacherRoutines);
        } catch (error) {
            console.error('Error fetching class routines:', error);
            setClassRoutines([]);
        }
    };

    const getDayOrder = (day) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days.indexOf(day);
    };

    const sortedRoutines = [...classRoutines].sort((a, b) => {
        const dayDiff = getDayOrder(a.day) - getDayOrder(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
    });

    const totalStudents = classRoutines.reduce((sum, r) => sum + (r.numberOfStudents || 0), 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100 border-t-blue-700"></div>
                <p className="text-sm text-black font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!teacher) {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.role !== 'teacher') {
                return (
                    <div className="flex items-center justify-center min-h-screen bg-white">
                        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm text-center border border-gray-100">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-blue-900 mb-2">Access Restricted</h2>
                            <p className="text-black text-sm mb-1">This page is only accessible to teachers.</p>
                            <p className="text-xs text-black mb-6">
                                Logged in as: <span className="font-semibold capitalize text-black">{user.role}</span>
                            </p>
                            <button
                                onClick={() => window.history.back()}
                                className="px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all font-semibold text-sm"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                );
            }
        }
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
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
            <div className="bg-white relative overflow-hidden border-b border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 py-10 relative">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl ring-4 ring-white/30 overflow-hidden bg-white/20 flex items-center justify-center shadow-2xl">
                                {teacher.imageUrl && !imgError ? (
                                    <img
                                        src={teacher.imageUrl}
                                        alt={teacher.name}
                                        onError={() => setImgError(true)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl md:text-6xl font-extrabold text-blue-900">
                                        {teacher.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow ${teacher.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
                        </div>

                        {/* Name & Meta */}
                        <div className="text-center md:text-left pb-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight leading-tight">
                                    {teacher.name}
                                </h1>
                                <span className={`self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${teacher.status === 'active' ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-gray-400/20 text-gray-300 border border-gray-400/30'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                                    {teacher.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1 text-black text-sm">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>
                                    ID: {teacher.teacherId}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    {teacher.subject}
                                </span>
                                {teacher.email && (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {teacher.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-8">
                        {[
                            { label: 'Classes', value: classRoutines.length, icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10a2 2 0 002 2h4a2 2 0 002-2V11M9 11h6" /></svg>
                            )},
                            { label: 'Students', value: totalStudents, icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            )},
                            { label: 'Experience', value: teacher.experience ? `${teacher.experience} yrs` : '—', icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                            )},
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                                <div className="text-blue-700 flex justify-center mb-1">{stat.icon}</div>
                                <p className="text-2xl font-extrabold text-black">{stat.value}</p>
                                <p className="text-xs text-blue-900 font-medium mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
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
                                value={teacher.name}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                            />
                            <InfoRow
                                label="Email Address"
                                value={teacher.email}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            />
                            <InfoRow
                                label="Phone Number"
                                value={teacher.phone}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                            />
                            <InfoRow
                                label="Qualification"
                                value={teacher.qualification}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                            />
                            <InfoRow
                                label="Date of Joining"
                                value={teacher.dateOfJoining ? new Date(teacher.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            />
                            <InfoRow
                                label="Address"
                                value={teacher.address}
                                icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            />
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
                            <div className="w-9 h-9 bg-indigo-700 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-blue-900">Professional Information</h2>
                        </div>
                        <div className="px-6 py-5 space-y-5">
                            {/* Subject highlight */}
                            <div className="bg-white border border-blue-50 rounded-xl p-5 text-center">
                                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-2">Subject Specialization</p>
                                <p className="text-3xl font-extrabold text-blue-800">{teacher.subject}</p>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                                    <p className="text-3xl font-extrabold text-blue-700">{classRoutines.length}</p>
                                    <p className="text-xs text-black font-medium mt-1">Classes Assigned</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                                    <p className="text-3xl font-extrabold text-indigo-700">{totalStudents}</p>
                                    <p className="text-xs text-black font-medium mt-1">Total Students</p>
                                </div>
                            </div>

                            {/* Experience bar */}
                            {teacher.experience && (
                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-semibold text-black uppercase tracking-wide">Experience</p>
                                        <span className="text-sm font-bold text-blue-700">{teacher.experience} years</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min((teacher.experience / 30) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <InfoRow
                                label="Teacher ID"
                                value={teacher.teacherId}
                                icon={<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>}
                            />
                        </div>
                    </div>
                </div>

                {/* Class Schedule Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold text-blue-900">Class Schedule</h2>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-100">
                            {classRoutines.length} {classRoutines.length === 1 ? 'class' : 'classes'}
                        </span>
                    </div>

                    <div className="p-6">
                        {sortedRoutines.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedRoutines.map((routine, index) => (
                                    <div key={index} className="group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-800 transition-colors">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-black leading-tight">{routine.subject}</h3>
                                                    <p className="text-xs text-black mt-0.5">Class {routine.className} — Section {routine.section}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dayColors[routine.day] || 'bg-gray-100 text-gray-700'}`}>
                                                {routine.day?.slice(0, 3)}
                                            </span>
                                        </div>

                                        {/* Time */}
                                        <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-4">
                                            <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-semibold text-black">{routine.startTime} – {routine.endTime}</span>
                                            {routine.duration && <span className="text-xs text-blue-400 ml-auto">{routine.duration}</span>}
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                    Room
                                                </span>
                                                <span className="font-medium text-black">{routine.room || 'TBA'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400 flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    Students
                                                </span>
                                                <span className="font-medium text-black">{routine.numberOfStudents || 0}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${routine.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${routine.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                                {routine.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold text-black mb-1">No Classes Assigned</h3>
                                <p className="text-sm text-gray-400">You don&apos;t have any classes scheduled at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}