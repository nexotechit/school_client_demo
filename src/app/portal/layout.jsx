'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function PortalLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { name: 'Portal Home', path: '/portal', icon: '🏠' },
        { name: 'My Profile', path: '/portal/profile', icon: '👤' },
        { name: 'Academic Records', path: '/portal/academics', icon: '📚' },
        { name: 'Messages', path: '/portal/messages', icon: '📅' },
       
        { name: 'Assignments', path: '/portal/assignments', icon: '📝' },
        // { name: 'Exam Schedule', path: '/portal/exams', icon: '📊' },
        // { name: 'Results', path: '/portal/results', icon: '📈' },
        // { name: 'Notices', path: '/portal/notices', icon: '📢' },
        // { name: 'Library', path: '/portal/library', icon: '📖' },
        { name: 'Fees', path: '/portal/fees', icon: '💰' },
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        const parsedUser = JSON.parse(userData);
        
        // Only allow students to access portal
        if (parsedUser.role !== 'student') {
            router.push('/');
            return;
        }
        
        setUser(parsedUser);
    }, [router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    const currentMenuItem = menuItems.find(item => item.path === pathname);

    return (
        <div className="min-h-screen bg-white">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar - Left Side */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-900 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm sm:text-lg">🎓</span>
                            </div>
                            <div>
                                <h2 className="text-blue-900 font-bold text-sm sm:text-lg">Student Portal</h2>
                                <p className="text-gray-600 text-xs">Sunlight School</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-600 hover:text-blue-900 p-1"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white border border-gray-200 rounded">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-900 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm sm:text-lg">{user.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 font-semibold text-xs sm:text-sm truncate">{user.name}</p>
                                <p className="text-blue-900 text-xs">Student ID: {user.studentId}</p>
                                <p className="text-gray-600 text-xs">Class {user.class} - {user.section}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 h-[calc(100vh-280px)]">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded transition-colors duration-200 ${
                                    pathname === item.path
                                        ? 'bg-blue-900 text-white'
                                        : 'text-gray-900 hover:bg-blue-900 hover:text-white'
                                }`}
                            >
                                <span className="text-lg sm:text-xl">{item.icon}</span>
                                <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                                {pathname === item.path && (
                                    <div className="ml-auto w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Back to Home Button */}
                    <div className="p-3 sm:p-4 border-t border-gray-200">
                        <Link
                            href="/"
                            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded text-gray-900 hover:bg-blue-900 hover:text-white transition-colors duration-200 border border-gray-200"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">Back to Home</span>
                        </Link>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content - Right Side */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <header className="bg-white border-b border-gray-200 z-10">
                        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden text-gray-600 hover:text-blue-900 p-1"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <h1 className="text-lg sm:text-xl font-bold text-blue-900 truncate">
                                {currentMenuItem ? currentMenuItem.name : 'Student Portal'}
                            </h1>
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <button className="relative text-gray-600 hover:text-blue-900 p-1">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <span className="absolute top-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-900 rounded-full"></span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto bg-white p-3 sm:p-4 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
