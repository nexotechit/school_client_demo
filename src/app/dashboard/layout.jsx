'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { name: 'Dashboard Overview', path: '/dashboard', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { name: 'Class Management', path: '/dashboard/class-section', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { name: 'Teacher Management', path: '/dashboard/teachers', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
        { name: 'Student Management', path: '/dashboard/students', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { name: 'Admin Management', path: '/dashboard/AdminManagement', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { name: 'Exam Management', path: '/dashboard/exams', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { name: 'Fees Management', path: '/dashboard/fees', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { name: 'Expense Management', path: '/dashboard/expenses', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
        { name: 'Salary Management', path: '/dashboard/salary', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { name: 'Admit & Id Gen:', path: '/dashboard/admin-id-generate', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg> },
        { name: 'Certificate Generator', path: '/dashboard/certificates', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
        { name: 'Reports & Analytics', path: '/dashboard/reports', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    ];

    const otherItems = [
        // { name: 'Profile', path: '/dashboard/profile', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { name: 'Settings', path: '/dashboard/settings', icon: <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/');
            return;
        }
        setUser(JSON.parse(userData));
    }, [router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const currentMenuItem = menuItems.find(item => item.path === pathname);

    // Check if we're in the settings section
    const isSettings = pathname?.startsWith('/dashboard/settings');

    return (
        <div className="min-h-screen bg-white">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar - Left Side - Only show if NOT in settings */}
                {!isSettings && (
                    <aside className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-white border-r border-[#E5E7EB] transform transition-transform duration-200 ease-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col will-change-transform`}>
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-[#F3F4F6]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#CFC8FF] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                                    <span className="text-[#374151] font-bold text-base">S</span>
                                </div>
                                <div>
                                    <h2 className="text-[#1F2937] font-semibold text-[15px] leading-tight">Admin Panel</h2>
                                    <p className="text-[#9CA3AF] text-[11px] font-medium mt-0.5">Sunlight School</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden text-[#6B7280] hover:text-[#374151] transition-colors duration-150"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Menu Items */}
                        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5 custom-scrollbar will-change-contents">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${isActive
                                                ? 'bg-[#EEF2FF] text-[#1F2937]'
                                                : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]'
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 ${isActive ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`text-[13.5px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6366F1] flex-shrink-0"></div>}
                                    </Link>
                                );
                            })}

                            {/* OTHER section */}
                            <div className="mt-4 mb-1 px-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-[#F3F4F6]"></div>
                                    <h3 className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Other</h3>
                                    <div className="h-px flex-1 bg-[#F3F4F6]"></div>
                                </div>
                            </div>

                            {otherItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${isActive
                                                ? 'bg-[#EEF2FF] text-[#1F2937]'
                                                : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]'
                                            }`}
                                    >
                                        <div className={`flex-shrink-0 ${isActive ? 'text-[#6366F1]' : 'text-[#9CA3AF]'}`}>
                                            {item.icon}
                                        </div>
                                        <span className={`text-[13.5px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                                    </Link>
                                );
                            })}

                            {/* Logout */}
                            <div className="mt-3 pt-3 border-t border-[#F3F4F6]">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        router.push('/');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 text-[#6B7280] hover:bg-red-50 hover:text-red-600 group"
                                >
                                    <div className="flex-shrink-0 text-[#9CA3AF] group-hover:text-red-500">
                                        <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    </div>
                                    <span className="text-[13.5px] font-medium leading-none">Logout</span>
                                </button>
                            </div>
                        </nav>
                    </aside>
                )}

                {/* Mobile Sidebar Overlay */}
                {!isSettings && isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 will-change-opacity transition-opacity duration-200"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content - Right Side */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar - Only show if NOT in settings */}
                    {!isSettings && (
                        <header className="bg-white border-b border-[#E5E7EB] z-10">
                            <div className="flex items-center justify-between px-6 py-3.5">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="lg:hidden text-[#6B7280] hover:text-[#374151] p-1 rounded-md hover:bg-[#F3F4F6] transition-colors duration-150"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h1 className="text-[15px] font-semibold text-[#1F2937] leading-tight">
                                            {currentMenuItem ? currentMenuItem.name : 'Dashboard'}
                                        </h1>
                                        <p className="text-[11px] text-[#9CA3AF] mt-0.5 hidden sm:block">Welcome back, {user?.name || 'Admin'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="relative p-2 text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors duration-150">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#6366F1] rounded-full"></span>
                                    </button>
                                    <div className="w-8 h-8 bg-[#CFC8FF] rounded-full flex items-center justify-center ml-1">
                                        <span className="text-[#374151] font-semibold text-sm">{user?.name?.charAt(0) || 'A'}</span>
                                    </div>
                                </div>
                            </div>
                        </header>
                    )}

                    {/* Content Area */}
                    <main className="flex-1 overflow-y-auto bg-white">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
