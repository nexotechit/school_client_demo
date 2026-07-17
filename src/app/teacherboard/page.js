'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../../config/api';

export default function TeacherboardHome() {
    const [stats, setStats] = useState({
        students: null,
        subjects: null,
        assignments: null,
        classes: null,
    });
    const [recentNotices, setRecentNotices] = useState([]);
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [studentsRes, assignmentsRes, routinesRes, noticesRes, academicsRes] = await Promise.allSettled([
                    fetch(`${API_BASE_URL}/students`),
                    fetch(`${API_BASE_URL}/assignments`),
                    fetch(`${API_BASE_URL}/routines`),
                    fetch(`${API_BASE_URL}/notices`),
                    fetch(`${API_BASE_URL}/academics`),
                ]);

                // Students
                if (studentsRes.status === 'fulfilled' && studentsRes.value.ok) {
                    const d = await studentsRes.value.json();
                    const arr = d.data || d.students || (Array.isArray(d) ? d : []);
                    setStats(prev => ({ ...prev, students: arr.length }));
                }

                // Assignments
                if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value.ok) {
                    const d = await assignmentsRes.value.json();
                    const arr = d.data || d.assignments || (Array.isArray(d) ? d : []);
                    setStats(prev => ({ ...prev, assignments: arr.length }));
                    // 3 most recent
                    const sorted = [...arr].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    setRecentAssignments(sorted.slice(0, 3));
                }

                // Class routines → unique classes
                if (routinesRes.status === 'fulfilled' && routinesRes.value.ok) {
                    const d = await routinesRes.value.json();
                    const arr = d.data || d.routines || (Array.isArray(d) ? d : []);
                    const uniqueClasses = new Set(arr.map(r => `${r.class}-${r.section}`));
                    setStats(prev => ({ ...prev, classes: uniqueClasses.size }));
                }

                // Academics → unique subjects
                if (academicsRes.status === 'fulfilled' && academicsRes.value.ok) {
                    const d = await academicsRes.value.json();
                    const arr = d.data || (Array.isArray(d) ? d : []);
                    setStats(prev => ({ ...prev, subjects: arr.length }));
                }

                // Notices for recent activities
                if (noticesRes.status === 'fulfilled' && noticesRes.value.ok) {
                    const d = await noticesRes.value.json();
                    const arr = d.data || d.notices || (Array.isArray(d) ? d : []);
                    const sorted = [...arr].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    setRecentNotices(sorted.slice(0, 3));
                }
            } catch (e) {
                console.error('Dashboard fetch error:', e);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchAll();
    }, []);

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins || 1} min${mins !== 1 ? 's' : ''} ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    const quickLinks = [
        { name: 'My Profile', path: '/teacherboard/TeacherProfile', icon: '👨‍🏫', color: 'bg-[#1a202c]' },
        { name: 'Assignments', path: '/teacherboard/assignments', icon: '📝', color: 'bg-[#1a202c]' },
        { name: 'Messages', path: '/teacherboard/Message', icon: '💬', color: 'bg-[#1a202c]' },
        { name: 'Attendance', path: '/teacherboard/attendance', icon: '✅', color: 'bg-[#1a202c]' },
        { name: 'Marks & Results', path: '/teacherboard/marks-results', icon: '📊', color: 'bg-[#1a202c]' },
        { name: 'Class Schedule', path: '/teacherboard/schedule', icon: '📅', color: 'bg-[#1a202c]' },
        { name: 'Students', path: '/teacherboard/students', icon: '👥', color: 'bg-[#1a202c]' },
        { name: 'Notices', path: '/teacherboard/notices', icon: '📢', color: 'bg-[#1a202c]' },
        { name: 'Salary', path: '/teacherboard/salary', icon: '💰', color: 'bg-[#1a202c]' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="bg-blue-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">Welcome to Teacherboard</h1>
                <p className="text-gray-100 text-sm sm:text-base">Manage your teaching activities and access resources</p>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {[
                    { icon: '👥', label: 'Students', sub: 'Total enrolled', value: stats.students, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { icon: '📚', label: 'Subjects', sub: 'In academics', value: stats.subjects, color: 'text-green-700', bg: 'bg-green-50' },
                    { icon: '📝', label: 'Assignments', sub: 'Total created', value: stats.assignments, color: 'text-orange-700', bg: 'bg-orange-50' },
                    { icon: '📅', label: 'Class Groups', sub: 'Unique class-sections', value: stats.classes, color: 'text-purple-700', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-lg flex items-center justify-center text-xl sm:text-2xl`}>
                                {stat.icon}
                            </div>
                            <span className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                                {loadingStats ? (
                                    <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse"></span>
                                ) : (
                                    stat.value ?? '—'
                                )}
                            </span>
                        </div>
                        <h3 className="text-black font-semibold text-sm sm:text-base">{stat.label}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{stat.sub}</p>
                    </div>
                ))}
            </div> */}

            {/* Quick Links */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {quickLinks.map((link, index) => (
                        <Link
                            key={index}
                            href={link.path}
                            className="bg-blue-900 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white hover:bg-blue-800 transition-all duration-200 transform hover:-translate-y-1 shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <span className="text-2xl sm:text-3xl">{link.icon}</span>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg text-white">{link.name}</h3>
                                    <p className="text-gray-100 text-xs sm:text-sm">Access {link.name.toLowerCase()}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activities */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Assignments */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-black">📝 Recent Assignments</h2>
                        <Link href="/teacherboard/assignments" className="text-xs text-blue-700 font-semibold hover:underline">View All →</Link>
                    </div>
                    <div className="space-y-3">
                        {loadingStats ? (
                            [1,2,3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                                    <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1"><div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-2 bg-gray-100 rounded w-1/2"></div></div>
                                </div>
                            ))
                        ) : recentAssignments.length > 0 ? recentAssignments.map((a, i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm">📝</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-black text-sm truncate">{a.title || 'Assignment'}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {[a.class, a.section].filter(Boolean).join(' - ')}
                                        {a.createdAt ? ` • ${formatTimeAgo(a.createdAt)}` : ''}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                                    a.status === 'active' ? 'bg-green-100 text-green-700' :
                                    a.status === 'closed' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>{a.status || 'open'}</span>
                            </div>
                        )) : (
                            <div className="text-center py-6 text-gray-400 text-sm">No assignments yet</div>
                        )}
                    </div>
                </div>

                {/* Recent Notices */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-black">📢 Recent Notices</h2>
                        <Link href="/teacherboard/notices" className="text-xs text-blue-700 font-semibold hover:underline">View All →</Link>
                    </div>
                    <div className="space-y-3">
                        {loadingStats ? (
                            [1,2,3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                                    <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1"><div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-2 bg-gray-100 rounded w-1/2"></div></div>
                                </div>
                            ))
                        ) : recentNotices.length > 0 ? recentNotices.map((n, i) => (
                            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm">📢</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-black text-sm truncate">{n.title || 'Notice'}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {n.category ? `${n.category} • ` : ''}{n.createdAt ? formatTimeAgo(n.createdAt) : ''}
                                    </p>
                                </div>
                                {n.isImportant && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 flex-shrink-0">Important</span>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-6 text-gray-400 text-sm">No notices yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}