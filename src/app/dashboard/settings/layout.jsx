'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SettingsLayout({ children }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const settingsMenuItems = [
        { name: 'Settings Overview', path: '/dashboard/settings', icon: '⚙️' },
        { name: 'Banner Management', path: '/dashboard/settings/banner', icon: '📢' },
        { name: 'Facilities Management', path: '/dashboard/settings/facilities', icon: '🏢' },
        { name: 'Academics Management', path: '/dashboard/settings/academics', icon: '🎓' },
        { name: 'Achievements Management', path: '/dashboard/settings/achievements', icon: '🏆' },
        { name: 'Gallery Management', path: '/dashboard/settings/gallery', icon: '🖼️' },
        { name: 'Notice Board', path: '/dashboard/settings/notices', icon: '📢' },
    ];

    const currentMenuItem = settingsMenuItems.find(item => item.path === pathname);

    return (
        <div className="flex h-full">
            {/* Settings Sidebar - Left Side */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-blue-900 font-bold text-lg">System Settings</h2>
                        <p className="text-gray-600 text-xs">Manage system components</p>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-600 hover:text-blue-900"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Settings Menu Items */}
                <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
                    {/* Back to Dashboard Button */}
                    <Link
                        href="/dashboard"
                        className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-3 rounded transition-colors duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-900 mb-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                    {settingsMenuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-3 rounded transition-colors duration-200 ${
                                pathname === item.path
                                    ? 'bg-blue-900 text-white'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-900'
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm font-medium">{item.name}</span>
                            {pathname === item.path && (
                                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                            )}
                        </Link>
                    ))}
                </nav>
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
                {/* Top Bar for Mobile */}
                <div className="lg:hidden bg-white border-b border-gray-200 px-3 py-4 sm:px-4 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-600 hover:text-blue-900"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h2 className="text-lg font-bold text-blue-900">
                        {currentMenuItem ? currentMenuItem.name : 'System Settings'}
                    </h2>
                </div>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
