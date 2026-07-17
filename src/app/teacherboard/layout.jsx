'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function TeacherboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard Home', path: '/teacherboard', icon: '🏠' },
        { name: 'My Profile', path: '/teacherboard/TeacherProfile', icon: '👨‍🏫' },
        { name: 'Exam Schedule', path: '/teacherboard/exams', icon: '📋' },
        { name: 'Assignments', path: '/teacherboard/assignments', icon: '📝' },
        { name: 'Messages', path: '/teacherboard/Message', icon: '💬' },
       
        { name: 'Attendance', path: '/teacherboard/attendance', icon: '✅' },
        { name: 'Marks & Results', path: '/teacherboard/marks-results', icon: '📊' },
        { name: 'Students', path: '/teacherboard/students', icon: '👥' },
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'teacher') {
            router.push('/');
            return;
        }
        setUser(parsedUser);
    }, [router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    const currentMenuItem = menuItems.find(item => item.path === pathname);

    return (
        <div className="min-h-screen bg-white">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar - Left Side */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-900 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm sm:text-lg">👨‍🏫</span>
                            </div>
                            <div>
                                <h2 className="text-blue-900 font-bold text-sm sm:text-lg">Teacherboard</h2>
                                <p className="text-gray-600 text-xs">Sunlight School</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-white border border-gray-200 rounded">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm sm:text-lg">{user.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 font-semibold text-xs sm:text-sm truncate">{user.name}</p>
                                <p className="text-blue-900 text-xs capitalize">{user.role}</p>
                                <p className="text-gray-600 text-xs truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded transition-all duration-200 ${
                                    pathname === item.path
                                        ? 'bg-blue-900 text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-900'
                                }`}
                            >
                                <span className="text-lg sm:text-xl">{item.icon}</span>
                                <span className="text-xs sm:text-sm font-medium truncate">{item.name}</span>
                                {pathname === item.path && (
                                    <div className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Quick Actions */}
                    <div className="p-3 sm:p-4 border-t border-gray-200">
                        <div className="space-y-1 sm:space-y-2">
                            <Link
                                href="/"
                                className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded text-gray-700 hover:bg-gray-100 hover:text-blue-900 transition-all duration-200"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="text-xs sm:text-sm font-medium">Back to Home</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content - Right Side */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <header className="bg-white border-b border-gray-200 shadow-sm z-10">
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden text-gray-600 hover:text-blue-900 p-1"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <h1 className="text-lg sm:text-xl font-bold text-blue-900 truncate">
                                {currentMenuItem ? currentMenuItem.name : 'Teacherboard'}
                            </h1>
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                                    Welcome, {user.name}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}