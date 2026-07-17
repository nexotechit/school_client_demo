'use client';
import Link from 'next/link';

export default function SystemSettings() {
    const settingsCards = [
        {
            name: 'Banner Management',
            path: '/dashboard/settings/banner',
            icon: '📢',
            description: 'Manage website banners and hero sections',
            color: 'from-blue-500 to-indigo-500'
        },
        {
            name: 'Facilities Management',
            path: '/dashboard/settings/facilities',
            icon: '🏢',
            description: 'Manage school facilities and infrastructure',
            color: 'from-green-500 to-emerald-500'
        },
        {
            name: 'Academics Management',
            path: '/dashboard/settings/academics',
            icon: '🎓',
            description: 'Manage academic programs and curriculum',
            color: 'from-purple-500 to-pink-500'
        },
        {
            name: 'Achievements Management',
            path: '/dashboard/settings/achievements',
            icon: '🏆',
            description: 'Showcase school achievements and awards',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            name: 'Gallery Management',
            path: '/dashboard/settings/gallery',
            icon: '🖼️',
            description: 'Manage photo gallery and events',
            color: 'from-red-500 to-pink-500'
        },
        {
            name: 'Notice Board',
            path: '/dashboard/settings/notices',
            icon: '📢',
            description: 'Manage notices and announcements',
            color: 'from-cyan-500 to-blue-500'
        }
    ];

    return (
        <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
                <p className="text-gray-600">Manage website content, facilities, and system configurations</p>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📊</span>
                        <span className="text-2xl font-bold text-blue-600">6</span>
                    </div>
                    <h3 className="text-gray-800 font-semibold">Total Modules</h3>
                    <p className="text-gray-500 text-sm">Active system components</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">⚙️</span>
                        <span className="text-2xl font-bold text-green-600">Active</span>
                    </div>
                    <h3 className="text-gray-800 font-semibold">System Status</h3>
                    <p className="text-gray-500 text-sm">All systems operational</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">🔄</span>
                        <span className="text-2xl font-bold text-purple-600">Latest</span>
                    </div>
                    <h3 className="text-gray-800 font-semibold">Version</h3>
                    <p className="text-gray-500 text-sm">System up to date</p>
                </div>
            </div>

            {/* Settings Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsCards.map((card) => (
                    <Link
                        key={card.name}
                        href={card.path}
                        className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
                    >
                        <div className="flex items-start space-x-4">
                            <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                    {card.name}
                                </h3>
                                <p className="text-sm text-gray-600">{card.description}</p>
                                <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                                    <span>Manage</span>
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Add New Content</span>
                    </button>
                    
                    <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Upload Media</span>
                    </button>
                    
                    <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">System Configuration</span>
                    </button>
                    
                    <button className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">View Reports</span>
                    </button>
                </div>
            </div>

            {/* System Information */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">System Information</h3>
                        <p className="text-gray-700 text-sm mb-2">
                            Use the navigation menu on the right to access different system settings and management modules.
                        </p>
                        <p className="text-gray-600 text-xs">
                            Each module allows you to manage specific aspects of the school management system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
