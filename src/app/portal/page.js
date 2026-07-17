'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../../config/api';

export default function PortalHome() {
    const [stats, setStats] = useState({
        subjects: null,
        attendance: null,
        assignments: null,
        notices: null,
    });
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [recentNotices, setRecentNotices] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [assignmentsRes, noticesRes, academicsRes, attendanceRes] = await Promise.allSettled([
                    fetch(`${API_BASE_URL}/assignments`),
                    fetch(`${API_BASE_URL}/notices`),
                    fetch(`${API_BASE_URL}/academics`),
                    fetch(`${API_BASE_URL}/attendance`),
                ]);

                // Assignments
                if (assignmentsRes.status === 'fulfilled' && assignmentsRes.value.ok) {
                    const d = await assignmentsRes.value.json();
                    const arr = d.data || d.assignments || (Array.isArray(d) ? d : []);
                    setStats(prev => ({ ...prev, assignments: arr.length }));
                    const sorted = [...arr].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    setRecentAssignments(sorted.slice(0, 3));
                }

                // Notices
                if (noticesRes.status === 'fulfilled' && noticesRes.value.ok) {
                    const d = await noticesRes.value.json();
                    const arr = d.data || d.notices || (Array.isArray(d) ? d : []);
                    const sorted = [...arr].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    setStats(prev => ({ ...prev, notices: arr.length }));
                    setRecentNotices(sorted.slice(0, 3));
                }

                // Academics → subjects count
                if (academicsRes.status === 'fulfilled' && academicsRes.value.ok) {
                    const d = await academicsRes.value.json();
                    const arr = d.data || (Array.isArray(d) ? d : []);
                    setStats(prev => ({ ...prev, subjects: arr.length }));
                }

                // Attendance → calculate overall present %
                if (attendanceRes.status === 'fulfilled' && attendanceRes.value.ok) {
                    const d = await attendanceRes.value.json();
                    const arr = d.data || (Array.isArray(d) ? d : []);
                    let totalStudents = 0, presentStudents = 0;
                    arr.forEach(record => {
                        const records = record.attendanceRecords || [];
                        totalStudents += records.length;
                        presentStudents += records.filter(r => r.status === 'present').length;
                    });
                    const pct = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : null;
                    setStats(prev => ({ ...prev, attendance: pct }));
                }
            } catch (e) {
                console.error('Portal dashboard fetch error:', e);
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
        { name: 'My Profile', path: '/portal/profile', icon: '👤' },
        { name: 'Academic Records', path: '/portal/academics', icon: '📚' },
        { name: 'Attendance', path: '/portal/attendance', icon: '📅' },
        { name: 'Assignments', path: '/portal/assignments', icon: '📝' },
        { name: 'Exam Schedule', path: '/portal/exams', icon: '📊' },
        { name: 'Results', path: '/portal/results', icon: '📈' },
        { name: 'Notices', path: '/portal/notices', icon: '📢' },
        { name: 'Library', path: '/portal/library', icon: '📖' },
        { name: 'Fees', path: '/portal/fees', icon: '💰' },
    ];

    return (
        <div className="p-1 sm:p-2 lg:p-3 xl:p-4">
            {/* Welcome Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-2">Welcome to Your Portal</h1>
                <p className="text-gray-600 text-sm sm:text-base">Access all your academic resources in one place</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {[
                    { icon: '📚', label: 'Subjects', sub: 'In academics', value: stats.subjects, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { icon: '📅', label: 'Attendance', sub: 'Overall present rate', value: stats.attendance !== null ? `${stats.attendance}%` : null, color: stats.attendance >= 75 ? 'text-green-700' : stats.attendance !== null ? 'text-red-600' : 'text-gray-700', bg: stats.attendance >= 75 ? 'bg-green-50' : stats.attendance !== null ? 'bg-red-50' : 'bg-gray-50' },
                    { icon: '📝', label: 'Assignments', sub: 'Total posted', value: stats.assignments, color: 'text-orange-700', bg: 'bg-orange-50' },
                    { icon: '📢', label: 'Notices', sub: 'Total notices', value: stats.notices, color: 'text-purple-700', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-lg flex items-center justify-center text-xl sm:text-2xl`}>
                                {stat.icon}
                            </div>
                            <span className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                                {loadingStats ? (
                                    <span className="inline-block w-10 h-7 bg-gray-200 rounded animate-pulse"></span>
                                ) : (
                                    stat.value ?? '—'
                                )}
                            </span>
                        </div>
                        <h3 className="text-gray-900 font-semibold text-sm sm:text-base">{stat.label}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-4 sm:mb-6">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.path}
                            className="group bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform flex-shrink-0">
                                    <span className="text-xl sm:text-2xl">{link.icon}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors truncate">
                                        {link.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">Access now →</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Assignments */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-blue-900">📝 Recent Assignments</h2>
                        <Link href="/portal/assignments" className="text-xs text-blue-700 font-semibold hover:underline">View All →</Link>
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
                            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                                <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm">📝</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{a.title || 'Assignment'}</p>
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
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-blue-900">📢 Recent Notices</h2>
                        <Link href="/portal/notices" className="text-xs text-blue-700 font-semibold hover:underline">View All →</Link>
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
                            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                                <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm">📢</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate">{n.title || 'Notice'}</p>
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
