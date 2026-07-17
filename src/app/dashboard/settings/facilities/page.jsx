'use client';
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../../config/api';

const FacilitiesPage = () => {
    const queryClient = useQueryClient();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '🏫',
        gradient: 'bg-blue-900',
        features: [],
        category: 'general',
        capacity: '',
        location: '',
        isFeatured: false
    });
    const [editingFacility, setEditingFacility] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [currentFeature, setCurrentFeature] = useState('');

    // Facility categories with professional styling
    const facilityCategories = [
        { value: 'classroom', label: 'Classroom', icon: '🏫', color: 'bg-blue-900', bgColor: 'bg-white', borderColor: 'border-gray-200', textColor: 'text-gray-900' },
        { value: 'lab', label: 'Laboratory', icon: '🔬', color: 'bg-blue-900', bgColor: 'bg-white', borderColor: 'border-gray-200', textColor: 'text-gray-900' },
        { value: 'sports', label: 'Sports', icon: '⚽', color: 'bg-blue-900', bgColor: 'bg-white', borderColor: 'border-gray-200', textColor: 'text-gray-900' },
        { value: 'library', label: 'Library', icon: '📚', color: 'bg-blue-900', bgColor: 'bg-white', borderColor: 'border-gray-200', textColor: 'text-gray-900' },
        { value: 'transport', label: 'Transportation', icon: '🚌', color: 'bg-blue-900', bgColor: 'bg-white', borderColor: 'border-gray-200', textColor: 'text-gray-900' },
        { value: 'general', label: 'General', icon: '🏢', color: 'bg-blue-900', bgColor: 'bg-white', borderColor: 'border-gray-200', textColor: 'text-gray-900' }
    ];

    // Icon options
    const iconOptions = [
        '🏫', '🔬', '💻', '📚', '⚽', '🚌', '🏢', '🎨', '🎵', '🍽️',
        '🏥', '🛏️', '🚪', '🚿', '🪑', '📺', '🎭', '⚡', '🌿', '🏆'
    ];

    // Fetch facilities
    const fetchFacilities = async () => {
        try {
            const response = await fetch(`${API_URL}/api/facilities`, { cache: 'no-store' });
            const data = await response.json();
            if (data.success) {
                console.log('Fetched facilities:', data.data);
                console.log('First facility ID:', data.data[0]?._id);
                setFacilities(data.data);
            }
        } catch (error) {
            console.error('Error fetching facilities:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Failed to load facilities. Please check your connection.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    // Handle form submission (Create/Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);


        try {
            const url = editingFacility
                ? `${API_URL}/api/facilities/${editingFacility._id}`
                : `${API_URL}/api/facilities`;

            const method = editingFacility ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    createdBy: 'Admin',
                    status: 'active'
                }),
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: editingFacility ? 'Facility Updated!' : 'Facility Created!',
                    text: `The facility has been ${editingFacility ? 'updated' : 'created'} successfully.`,
                    timer: 2000,
                    showConfirmButton: false
                });

                // Reset form
                resetForm();
                fetchFacilities();
                queryClient.invalidateQueries({ queryKey: ['facilities'] });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || `Failed to ${editingFacility ? 'update' : 'create'} facility`,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Add feature
    const addFeature = () => {
        if (currentFeature.trim() && !formData.features.includes(currentFeature.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, currentFeature.trim()]
            }));
            setCurrentFeature('');
        }
    };

    // Remove feature
    const removeFeature = (featureToRemove) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter(feature => feature !== featureToRemove)
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            icon: '🏫',
            gradient: 'bg-blue-900',
            features: [],
            category: 'general',
            capacity: '',
            location: '',
            isFeatured: false
        });
        setEditingFacility(null);
        setShowModal(false);
        setCurrentFeature('');
    };

    // Open create modal
    const openCreateModal = () => {
        setEditingFacility(null);
        setFormData({
            title: '',
            description: '',
            icon: '🏫',
            gradient: 'bg-blue-900',
            features: [],
            category: 'general',
            capacity: '',
            location: '',
            isFeatured: false
        });
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingFacility(null);
    };

    // Start editing facility
    const startEdit = (facility) => {
        setFormData({
            title: facility.title,
            description: facility.description,
            icon: facility.icon || '🏫',
            gradient: facility.gradient || 'bg-blue-900',
            features: facility.features || [],
            category: facility.category || 'general',
            capacity: facility.capacity || '',
            location: facility.location || '',
            isFeatured: facility.isFeatured || false
        });
        setEditingFacility(facility);
        setShowModal(true);
    };

    // Delete facility with enhanced confirmation
    const handleDelete = async (facility) => {
        // Validate facility and ID
        if (!facility || !facility._id) {
            console.error('Invalid facility object or missing ID:', facility);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Invalid facility data. Please refresh the page and try again.'
            });
            return;
        }

        if (typeof facility._id !== 'string' || facility._id.length !== 24) {
            console.error('Invalid facility ID format:', facility._id, 'Type:', typeof facility._id, 'Length:', facility._id.length);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Invalid facility ID format. Please refresh the page and try again.'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Facility?',
            html: `
                <div class="text-left">
                    <p class="text-gray-600 mb-4">Are you sure you want to delete this facility?</p>
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                        <h3 class="font-bold text-gray-800 mb-2">${facility.title}</h3>
                        <p class="text-sm text-gray-600">${facility.description.substring(0, 100)}${facility.description.length > 100 ? '...' : ''}</p>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-lg px-6 py-2',
                cancelButton: 'rounded-lg px-6 py-2'
            }
        });

        if (result.isConfirmed) {
            try {
                console.log('Attempting to delete facility:', facility);
                console.log('Facility ID:', facility._id);
                console.log('Facility ID type:', typeof facility._id);
                console.log('API_URL:', API_URL);
                console.log('Full delete URL:', `${API_URL}/api/facilities/${facility._id}`);
                const response = await fetch(`${API_URL}/api/facilities/${facility._id}`, {
                    method: 'DELETE',
                    cache: 'no-store'
                });

                console.log('Delete response status:', response.status);
                console.log('Delete response ok:', response.ok);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Delete response data:', data);

                    // Remove the facility from local state only after successful deletion
                    setFacilities(prevFacilities => {
                        console.log('Current facilities before filter:', prevFacilities.length);
                        const filtered = prevFacilities.filter(f => f._id !== facility._id);
                        console.log('Facilities after filter:', filtered.length);
                        return filtered;
                    });
                    queryClient.invalidateQueries({ queryKey: ['facilities'] });

                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Facility has been deleted successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Delete failed with status:', response.status, errorData);
                    throw new Error(`Failed to delete facility: ${response.status}`);
                }
            } catch (error) {
                console.error('Delete error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete facility. Please try again.'
                });
            }
        }
    };

    // Filter facilities based on search and category
    const filteredFacilities = facilities.filter(facility => {
        const matchesSearch = facility.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            facility.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || facility.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-6">
                <div className="container mx-auto">
                    <div className="animate-pulse space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="h-10 bg-gray-300 rounded-lg w-80"></div>
                            <div className="h-12 bg-gray-300 rounded-xl w-32"></div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-1">
                                <div className="h-96 bg-gray-300 rounded-2xl"></div>
                            </div>
                            <div className="xl:col-span-2">
                                <div className="h-96 bg-gray-300 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    
    return (
        <div className="min-h-screen bg-white px-3 py-4 sm:px-4 sm:py-5 md:p-6">
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-1 sm:mb-2">Facilities Management</h1>
                        <p className="text-sm sm:text-base text-gray-600">Manage and showcase your school's facilities</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-900 hover:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Add New Facility</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search facilities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48 md:w-56 lg:w-64">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                            >
                                <option value="all">All Categories</option>
                                {facilityCategories.map(category => (
                                    <option key={category.value} value={category.value}>{category.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Facilities List */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    {filteredFacilities.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Facilities Found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || filterCategory !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by adding your first facility.'
                                }
                            </p>
                            {(!searchTerm && filterCategory === 'all') && (
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create First Facility
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredFacilities.map((facility, index) => {
                                const categoryInfo = facilityCategories.find(c => c.value === facility.category) || facilityCategories[5];
                                return (
                                    <div
                                        key={`${facility._id}-${index}`}
                                        className={`group p-3 sm:p-4 md:p-6 hover:bg-gray-50 transition-all duration-300`}
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {/* Facility Icon */}
                                            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-blue-900 flex items-center justify-center text-2xl sm:text-3xl shadow-lg text-white">
                                                {facility.icon}
                                            </div>

                                            {/* Facility Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                                {facility.title}
                                                            </h3>
                                                            {facility.isFeatured && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-900 text-[10px] sm:text-xs font-bold rounded-full">
                                                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                    FEATURED
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 line-clamp-2">{facility.description}</p>

                                                        {/* Features */}
                                                        {facility.features && facility.features.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                                                {facility.features.slice(0, 3).map((feature, idx) => (
                                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-900 text-[10px] sm:text-xs font-medium rounded-full">
                                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                        {feature}
                                                                    </span>
                                                                ))}
                                                                {facility.features.length > 3 && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium rounded-full">
                                                                        +{facility.features.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Meta Information */}
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-500">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${categoryInfo.color} text-white`}>
                                                                <span className="text-xs sm:text-sm">{categoryInfo.icon}</span> 
                                                                <span className="hidden sm:inline">{categoryInfo.label}</span>
                                                            </span>
                                                            {facility.capacity && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                    </svg>
                                                                    Capacity: {facility.capacity}
                                                                </span>
                                                            )}
                                                            {facility.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    {facility.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <button
                                                            onClick={() => startEdit(facility)}
                                                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Facility"
                                                        >
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(facility)}
                                                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Facility"
                                                        >
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                                        {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        {/* Title */}
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Facility Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                                placeholder="e.g., Smart Classrooms"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Description *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                                rows={4}
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                                                placeholder="Describe the facility and its benefits..."
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Category
                                            </label>
                                            <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                                                {facilityCategories.map((category) => (
                                                    <label
                                                        key={category.value}
                                                        className={`flex items-center p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                                            formData.category === category.value
                                                                ? `${category.borderColor} ${category.bgColor} shadow-lg ring-2 ring-opacity-50 ring-blue-300`
                                                                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            value={category.value}
                                                            checked={formData.category === category.value}
                                                            onChange={handleChange}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${category.color} flex items-center justify-center text-white text-base sm:text-lg mr-2 sm:mr-3 shadow-md`}>
                                                            {category.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm sm:text-base font-semibold text-gray-800">{category.label}</div>
                                                        </div>
                                                        {formData.category === category.value && (
                                                            <div className="ml-3">
                                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Icon Selection */}
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Icon
                                            </label>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 max-h-40 overflow-y-auto">
                                                {iconOptions.map((icon) => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center text-xl sm:text-2xl transition-all hover:scale-110 ${
                                                            formData.icon === icon
                                                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                                        }`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Capacity and Location */}
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Capacity (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="capacity"
                                                value={formData.capacity}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                                placeholder="e.g., 50 students"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Location (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                                placeholder="e.g., Ground Floor, Block A"
                                            />
                                        </div>

                                        {/* Features */}
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Features
                                            </label>
                                            <div className="space-y-2 sm:space-y-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={currentFeature}
                                                        onChange={(e) => setCurrentFeature(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                                        className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                        placeholder="Add a feature..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={addFeature}
                                                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                {formData.features.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                        {formData.features.map((feature, idx) => (
                                                            <span key={idx} className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                                                                {feature}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFeature(feature)}
                                                                    className="hover:bg-blue-200 rounded-full p-1"
                                                                >
                                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Featured */}
                                        <div className="lg:col-span-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="isFeatured"
                                                    checked={formData.isFeatured}
                                                    onChange={handleChange}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">Feature this facility on the home page</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex items-center justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-700 font-medium rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    {editingFacility ? 'Updating...' : 'Creating...'}
                                                </div>
                                            ) : (
                                                editingFacility ? 'Update Facility' : 'Create Facility'
                                            )}
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

export default FacilitiesPage;