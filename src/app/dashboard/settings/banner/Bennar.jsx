'use client';
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../../config/api';

const Bennar = () => {
    const queryClient = useQueryClient();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        images: [],
        headline: '',
        subheadline: '',
        stats: [
            { number: '', label: '' }
        ],
        status: 'active'
    });

    // Fetch all banners
    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_URL}/api/banners`, { cache: 'no-store' });
            const data = await response.json();
            if (data.success) {
                setBanners(data.data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            Swal.fire('Error', 'Failed to fetch banners', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const resetForm = () => {
        setFormData({
            images: [],
            headline: '',
            subheadline: '',
            stats: [
                { number: '', label: '' }
            ],
            status: 'active'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.map((stat, i) => 
                i === index ? { ...stat, [field]: value } : stat
            )
        }));
    };

    const addStat = () => {
        setFormData(prev => ({
            ...prev,
            stats: [...prev.stats, { number: '', label: '' }]
        }));
    };

    const removeStat = (index) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
                method: 'POST',
                body: formDataUpload
            });
            const data = await response.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, data.data.url]
                }));
                Swal.fire('Success', 'Image uploaded successfully!', 'success');
            } else {
                Swal.fire('Error', 'Failed to upload image', 'error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Swal.fire('Error', 'Error uploading image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const method = editingBanner ? 'PUT' : 'POST';
            const url = editingBanner ? `${API_URL}/api/banners/${editingBanner._id}` : `${API_URL}/api/banners`;
            
            const response = await fetch(url, {
                method,
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchBanners();
                queryClient.invalidateQueries({ queryKey: ['banners'] });
                setIsModalOpen(false);
                resetForm();
                setEditingBanner(null);
                Swal.fire('Success', `Banner ${editingBanner ? 'updated' : 'created'} successfully!`, 'success');
            } else {
                Swal.fire('Error', 'Failed to save banner', 'error');
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            Swal.fire('Error', 'Error saving banner', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            images: banner.images || [],
            headline: banner.headline || '',
            subheadline: banner.subheadline || '',
            stats: banner.stats || [{ number: '', label: '' }],
            status: banner.status || 'active'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/api/banners/${id}`, {
                    method: 'DELETE',
                    cache: 'no-store'
                });
                const data = await response.json();
                if (data.success) {
                    await fetchBanners();
                    queryClient.invalidateQueries({ queryKey: ['banners'] });
                    Swal.fire('Deleted!', 'Banner has been deleted.', 'success');
                } else {
                    Swal.fire('Error', 'Failed to delete banner', 'error');
                }
            } catch (error) {
                console.error('Error deleting banner:', error);
                Swal.fire('Error', 'Error deleting banner', 'error');
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        const action = newStatus === 'active' ? 'activate' : 'suspend';
        
        try {
            const response = await fetch(`${API_URL}/api/banners/${id}`, {
                method: 'PUT',
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchBanners();
                queryClient.invalidateQueries({ queryKey: ['banners'] });
                Swal.fire('Success', `Banner ${action}d successfully!`, 'success');
            } else {
                Swal.fire('Error', `Failed to ${action} banner`, 'error');
            }
        } catch (error) {
            console.error(`Error ${action}ing banner:`, error);
            Swal.fire('Error', `Error ${action}ing banner`, 'error');
        }
    };

    const openAddModal = () => {
        resetForm();
        setEditingBanner(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                <div className="container mx-auto">
                    <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-900 text-base sm:text-lg">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-1 py-4 sm:px-4 sm:py-5 md:p-3">
            <div className="container mx-auto">
                <div className="space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900">Banner Management</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all website banners ({banners.length} total)</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-900 hover:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">Add Banner</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-3 bg-blue-900 rounded-lg">
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-2 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Banners</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{banners.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-3 bg-blue-900 rounded-lg">
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-2 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{banners.filter(b => b.status === 'active').length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-3 bg-blue-900 rounded-lg">
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-2 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Suspended</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{banners.filter(b => b.status === 'suspended').length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 sm:p-3 bg-blue-900 rounded-lg">
                                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="ml-2 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Draft</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{banners.filter(b => b.status === 'draft').length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

            {/* Banners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Banner Image */}
                        <div className="relative h-32 sm:h-40 md:h-48 bg-gray-200">
                            {banner.images && banner.images.length > 0 ? (
                                <img
                                    src={banner.images[0]}
                                    alt={banner.headline}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <span className="inline-flex px-2 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-900">
                                    {banner.status}
                                </span>
                            </div>
                        </div>

                        {/* Banner Content */}
                        <div className="p-3 sm:p-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
                                {banner.headline || 'No Headline'}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                                {banner.subheadline || 'No Subheadline'}
                            </p>
                            
                            {/* Stats Preview */}
                            {banner.stats && banner.stats.length > 0 && (
                                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                                    {banner.stats.slice(0, 3).map((stat, index) => (
                                        <div key={index} className="bg-gray-100 px-2 py-0.5 sm:px-2 sm:py-1 rounded text-xs">
                                            <span className="font-bold text-gray-900">{stat.number}</span>
                                            <span className="text-gray-700 ml-1">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex space-x-1 sm:space-x-2">
                                    <button
                                        onClick={() => handleEdit(banner)}
                                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Edit"
                                    >
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(banner._id, banner.status)}
                                        className="p-1.5 sm:p-2 text-blue-900 hover:bg-gray-100 rounded-lg"
                                        title={banner.status === 'active' ? 'Suspend' : 'Activate'}
                                    >
                                        {banner.status === 'active' ? (
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    title="Delete"
                                >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
                </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md">
                    <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6 md:p-8">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
                                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Banner Images</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mb-4">
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image}
                                                    alt={`Banner ${index + 1}`}
                                                    className="w-full h-20 sm:h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                                                uploading
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-900 hover:bg-blue-800 text-white shadow-lg hover:shadow-xl'
                                            }`}
                                        >
                                            {uploading ? (
                                                <>
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    <span className="text-sm sm:text-base">Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span className="text-sm sm:text-base">Add Image</span>
                                                </>
                                            )}
                                        </label>
                                        <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Upload to imgbb automatically</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Headline */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Headline</label>
                                    <input
                                        type="text"
                                        name="headline"
                                        value={formData.headline}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>

                                {/* Subheadline */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Subheadline</label>
                                    <input
                                        type="text"
                                        name="subheadline"
                                        value={formData.subheadline}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>

                                {/* Stats */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2 sm:mb-0">Statistics</label>
                                        <button
                                            type="button"
                                            onClick={addStat}
                                            className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 sm:px-3 sm:py-1 rounded text-sm transition-colors whitespace-nowrap"
                                        >
                                            Add Stat
                                        </button>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        {formData.stats.map((stat, index) => (
                                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                                <input
                                                    type="text"
                                                    placeholder="Number"
                                                    value={stat.number}
                                                    onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                                                    className="flex-1 w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Label"
                                                    value={stat.label}
                                                    onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                                                    className="flex-1 w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeStat(index)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-3 sm:py-2 rounded-lg transition-colors whitespace-nowrap"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-900 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Saving...' : (editingBanner ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default Bennar;