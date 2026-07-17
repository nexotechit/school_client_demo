'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import LoginModal from './Auth/LoginModal';
import swManager from '../src/swRegister';


const LayoutClient = ({ children }) => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const pathname = usePathname();
    
    useEffect(() => {
        const onUpdate = () => setUpdateAvailable(true);
        swManager.onUpdate(onUpdate);
        return () => swManager.offUpdate(onUpdate);
    }, []);

    // Hide Navbar and Footer for dashboard, portal, and teacherboard routes
    const isDashboard = pathname?.startsWith('/dashboard');
    const isPortal = pathname?.startsWith('/portal');
    const isTeacherboard = pathname?.startsWith('/teacherboard');

    return (
        <>
            {!isDashboard && !isPortal && !isTeacherboard && (
                <Navbar 
                    onOpenLogin={() => setIsLoginOpen(true)}
                />
            )}
            {children}
            {!isDashboard && !isPortal && !isTeacherboard && <Footer />}
            
            {/* Modals at root level */}
            <LoginModal 
                isOpen={isLoginOpen} 
                onClose={() => setIsLoginOpen(false)}
                onOpenSignup={() => {
                    setIsLoginOpen(false);
                    setIsSignupOpen(true);
                }}
            />
            {/* <SignupModal 
                isOpen={isSignupOpen} 
                onClose={() => setIsSignupOpen(false)}
                onOpenLogin={() => {
                    setIsSignupOpen(false);
                    setIsLoginOpen(true);
                }}
            /> */}

            {/* Service Worker Update Notification */}
            {updateAvailable && (
                <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Update Available</p>
                            <p className="text-sm opacity-90">A new version is ready to install.</p>
                        </div>
                        <div className="ml-4 flex space-x-2">
                            <button
                                onClick={() => {
                                    swManager.skipWaiting();
                                    setUpdateAvailable(false);
                                }}
                                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setUpdateAvailable(false)}
                                className="text-white opacity-70 hover:opacity-100 text-sm"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LayoutClient;
