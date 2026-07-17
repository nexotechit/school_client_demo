'use client';
import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import Swal from 'sweetalert2';
import { useLanguage } from '../../src/contexts/LanguageContext';

const LoginModal = ({ isOpen, onClose, onOpenSignup }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        email: '',
        id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSelectDemo = (email, id) => {
        setFormData({ email, id });
        setError('');
    };


    // Automatically detect role based on ID format
    const detectRoleFromId = (id) => {
        if (!id) return null;

        // Admin format: 0001-26 (4 digits - 2 digits)
        if (/^\d{4}-\d{2}$/.test(id)) {
            return 'admin';
        }
        // Teacher format: 26-0001-1 (2 digits - 4 digits - 1 digit)
        else if (/^\d{2}-\d{4}-\d{1}$/.test(id)) {
            return 'teacher';
        }
        // Student format: 26-0001 (2 digits - 4 digits)
        else if (/^\d{2}-\d{4}$/.test(id)) {
            return 'student';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Detect role from ID format
            const role = detectRoleFromId(formData.id);

            if (!role) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Invalid ID Format',
                    html: `
                        <div class="text-left font-sans">
                            <p class="mb-2 font-semibold text-[#1F2937]">Please enter ID in correct format:</p>
                            <ul class="list-disc list-inside space-y-1 text-sm text-[#374151]">
                                <li><strong>Admin:</strong> 0001-26</li>
                                <li><strong>Student:</strong> 26-0001</li>
                                <li><strong>Teacher:</strong> 26-0001-1</li>
                            </ul>
                        </div>
                    `,
                    confirmButtonColor: '#1a2e5a',
                    customClass: {
                        container: 'swal-high-z-index'
                    }
                });
                setLoading(false);
                return;
            }

            // Build login data based on detected role
            const loginData = {
                email: formData.email,
                role: role,
                ...(role === 'teacher' ? { teacherId: formData.id } :
                    role === 'admin' ? { adminId: formData.id } :
                        { studentId: formData.id })
            };

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data.data));

                await Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: `Welcome back, ${data.data.name}!`,
                    confirmButtonColor: '#1a2e5a',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        container: 'swal-high-z-index'
                    }
                });

                onClose();

                // Redirect based on user role
                if (data.data.role === 'admin') {
                    window.location.href = '/dashboard';
                } else if (data.data.role === 'teacher') {
                    window.location.href = '/teacherboard';
                } else if (data.data.role === 'student') {
                    window.location.href = '/portal';
                } else {
                    window.location.reload();
                }
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message || 'Invalid credentials',
                    confirmButtonColor: '#1a2e5a',
                    customClass: {
                        container: 'swal-high-z-index'
                    }
                });
                setError(data.message || 'Login failed');
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: 'Please make sure the server is running on port 5000',
                confirmButtonColor: '#1a2e5a',
                customClass: {
                    container: 'swal-high-z-index'
                }
            });
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fadeIn font-[Inter,sans-serif]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-[#f5a623] text-2xl transition-colors cursor-pointer"
                >
                    ×
                </button>

                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1a2e5a] to-[#132348] border-2 border-[#f5a623]/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <span className="text-2xl sm:text-3xl">👤</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight mb-2">{t('auth.loginTitle')}</h2>
                    <p className="text-[#6B7280] text-xs sm:text-sm">{t('auth.loginTitle')}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-xs sm:text-sm font-semibold">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-2">
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/30 focus:border-[#f5a623] transition-all duration-300 text-xs sm:text-sm"
                            placeholder={t('auth.email')}
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-2">
                            ID Number
                        </label>
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 sm:py-3 border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/30 focus:border-[#f5a623] transition-all duration-300 text-xs sm:text-sm"
                            placeholder="Enter your ID (e.g., 26-0001)"
                        />
                        <div className="mt-3 p-3 sm:p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs">
                            <p className="font-bold text-[#1a2e5a] mb-2.5 border-b border-[#E5E7EB] pb-1.5 flex items-center justify-between">
                                <span>Demo Credentials</span>
                                <span className="text-[10px] text-[#f5a623] font-semibold animate-pulse">(Click to autofill)</span>
                            </p>
                            <div className="space-y-2 text-[#374151]">
                                <div 
                                    onClick={() => handleSelectDemo('admin@gmail.com', '0001-26')}
                                    className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#f5a623] hover:bg-[#f5a623]/5 transition-all duration-200 cursor-pointer group/item flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm"
                                >
                                    <span className="font-bold text-[#1a2e5a] flex items-center gap-1 group-hover/item:text-[#f5a623] transition-colors">👨‍💼 Admin</span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] sm:text-xs">
                                        <p><span className="text-[#6B7280]">Email:</span> <span className="font-mono text-[#1a2e5a] font-semibold">admin@gmail.com</span></p>
                                        <p><span className="text-[#6B7280]">ID:</span> <span className="font-mono text-[#f5a623] font-bold">0001-26</span></p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => handleSelectDemo('student@gmail.com', '26-0012')}
                                    className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#f5a623] hover:bg-[#f5a623]/5 transition-all duration-200 cursor-pointer group/item flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm"
                                >
                                    <span className="font-bold text-[#1a2e5a] flex items-center gap-1 group-hover/item:text-[#f5a623] transition-colors">📚 Student</span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] sm:text-xs">
                                        <p><span className="text-[#6B7280]">Email:</span> <span className="font-mono text-[#1a2e5a] font-semibold">student@gmail.com</span></p>
                                        <p><span className="text-[#6B7280]">ID:</span> <span className="font-mono text-[#f5a623] font-bold">26-0012</span></p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => handleSelectDemo('teacher@gmail.com', '26-0006-6')}
                                    className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#f5a623] hover:bg-[#f5a623]/5 transition-all duration-200 cursor-pointer group/item flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-sm"
                                >
                                    <span className="font-bold text-[#1a2e5a] flex items-center gap-1 group-hover/item:text-[#f5a623] transition-colors">👨‍🏫 Teacher</span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] sm:text-xs">
                                        <p><span className="text-[#6B7280]">Email:</span> <span className="font-mono text-[#1a2e5a] font-semibold">teacher@gmail.com</span></p>
                                        <p><span className="text-[#6B7280]">ID:</span> <span className="font-mono text-[#f5a623] font-bold">26-0006-6</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#f5a623] to-[#fdb94e] text-[#132348] font-bold py-3 sm:py-3.5 rounded-full shadow-[0_4px_14px_rgba(245,166,35,0.25)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer text-sm"
                    >
                        {loading ? `${t('common.loading')}` : t('auth.loginButton')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
