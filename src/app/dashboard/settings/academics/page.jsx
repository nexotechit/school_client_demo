'use client';
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../../config/api';

const AcademicsPage = () => {
    const queryClient = useQueryClient();
    const [academics, setAcademics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'class',
        level: '',
        grades: [],
        icon: '🎓',
        ageGroup: '',
        details: [],
        medium: 'english',
        order: 0,
        isActive: true
    });
    const [editingAcademic, setEditingAcademic] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentGrade, setCurrentGrade] = useState('');
    const [currentDetail, setCurrentDetail] = useState('');

    // Academic types with enhanced styling
    const academicTypes = [
        { value: 'class', label: 'Class Level', icon: '🏫', color: 'bg-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
        { value: 'subject', label: 'Subject', icon: '📚', color: 'bg-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
        { value: 'activity', label: 'Activity', icon: '🎨', color: 'bg-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' }
    ];

    // Medium options
    const mediumOptions = [
        { value: 'english', label: 'English Medium', icon: '🇺🇸' },
        { value: 'bangla', label: 'Bangla Medium', icon: '🇧🇩' }
    ];

    // Icon options by type
    const iconOptions = {
        class: ['🏫', '🎨', '📚', '🎓', '🏆', '⭐', '🌟', '🎯'],
        subject: ['📖', '🔢', '🔬', '🌍', '💻', '⚽', '🎵', '🎨', '📝', '🧮'],
        activity: ['🎵', '🎨', '⚽', '🎭', '🗣️', '🔬', '🎪', '🏃', '🎯']
    };

    // Fetch academics
    const fetchAcademics = async () => {
        try {
            const response = await fetch(`${API_URL}/api/academics`, { cache: 'no-store' });
            const data = await response.json();
            if (data.success) {
                setAcademics(data.data);
            }
        } catch (error) {
            console.error('Error fetching academics:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Failed to load academics. Please check your connection.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAcademics();
    }, []);

    // Handle form submission (Create/Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingAcademic
                ? `${API_URL}/api/academics/${editingAcademic._id}`
                : `${API_URL}/api/academics`;

            const method = editingAcademic ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    createdBy: 'Admin'
                }),
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: editingAcademic ? 'Academic Updated!' : 'Academic Created!',
                    text: `The academic entry has been ${editingAcademic ? 'updated' : 'created'} successfully.`,
                    timer: 2000,
                    showConfirmButton: false
                });

                // Reset form
                resetForm();
                fetchAcademics();
                queryClient.invalidateQueries({ queryKey: ['academics'] });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || `Failed to ${editingAcademic ? 'update' : 'create'} academic entry`,
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

    // Add grade
    const addGrade = () => {
        if (currentGrade.trim() && !formData.grades.includes(currentGrade.trim())) {
            setFormData(prev => ({
                ...prev,
                grades: [...prev.grades, currentGrade.trim()]
            }));
            setCurrentGrade('');
        }
    };

    // Remove grade
    const removeGrade = (gradeToRemove) => {
        setFormData(prev => ({
            ...prev,
            grades: prev.grades.filter(grade => grade !== gradeToRemove)
        }));
    };

    // Add detail
    const addDetail = () => {
        if (currentDetail.trim() && !formData.details.includes(currentDetail.trim())) {
            setFormData(prev => ({
                ...prev,
                details: [...prev.details, currentDetail.trim()]
            }));
            setCurrentDetail('');
        }
    };

    // Remove detail
    const removeDetail = (detailToRemove) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter(detail => detail !== detailToRemove)
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'class',
            level: '',
            grades: [],
            icon: '🎓',
            ageGroup: '',
            details: [],
            medium: 'english',
            order: 0,
            isActive: true
        });
        setEditingAcademic(null);
        setShowModal(false);
        setCurrentGrade('');
        setCurrentDetail('');
    };

    // Open create modal
    const openCreateModal = () => {
        setEditingAcademic(null);
        setFormData({
            title: '',
            description: '',
            type: 'class',
            level: '',
            grades: [],
            icon: '🎓',
            ageGroup: '',
            details: [],
            medium: 'english',
            order: 0,
            isActive: true
        });
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingAcademic(null);
    };

    // Start editing academic
    const startEdit = (academic) => {
        setFormData({
            title: academic.title,
            description: academic.description,
            type: academic.type,
            level: academic.level || '',
            grades: academic.grades || [],
            icon: academic.icon || '🎓',
            ageGroup: academic.ageGroup || '',
            details: academic.details || [],
            medium: academic.medium || 'english',
            order: academic.order || 0,
            isActive: academic.isActive !== undefined ? academic.isActive : true
        });
        setEditingAcademic(academic);
        setShowModal(true);
    };

    // Delete academic with enhanced confirmation
    const handleDelete = async (academic) => {
        const result = await Swal.fire({
            title: 'Delete Academic Entry?',
            html: `
                <div class="text-left">
                    <p class="text-gray-600 mb-4">Are you sure you want to delete this academic entry?</p>
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
                        <h3 class="font-bold text-gray-800 mb-2">${academic.title}</h3>
                        <p class="text-sm text-gray-600">${academic.description.substring(0, 100)}${academic.description.length > 100 ? '...' : ''}</p>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
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
                const response = await fetch(`${API_URL}/api/academics/${academic._id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Academic entry has been deleted successfully.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchAcademics();
                    queryClient.invalidateQueries({ queryKey: ['academics'] });
                } else {
                    throw new Error('Failed to delete academic entry');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete academic entry. Please try again.'
                });
            }
        }
    };

    // Filter academics based on search and type
    const filteredAcademics = academics.filter(academic => {
        const matchesSearch = academic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            academic.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || academic.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                <div className="container mx-auto">
                    <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-900 text-sm sm:text-base lg:text-lg">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-3 py-4 sm:px-4 sm:py-5 md:p-6">
            <div className="container mx-auto">
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-1 sm:mb-2">Academics Management</h1>
                            <p className="text-sm sm:text-base text-gray-600">Manage academic programs, subjects, and activities</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-900 hover:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">Add Academic Entry</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                    {/* Search and Filter */}
                    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search academics..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48 md:w-56 lg:w-64">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                >
                                    <option value="all">All Types</option>
                                    {academicTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                {/* Academics List */}
                <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg overflow-hidden">
                    {filteredAcademics.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Academic Entries Found</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                {searchTerm || filterType !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by adding your first academic entry.'
                                }
                            </p>
                            {(!searchTerm && filterType === 'all') && (
                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create First Entry
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredAcademics.map((academic) => {
                                const typeInfo = academicTypes.find(t => t.value === academic.type) || academicTypes[0];
                                return (
                                    <div
                                        key={academic._id}
                                        className={`group p-3 sm:p-4 md:p-6 hover:bg-gray-50 transition-all duration-300`}
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {/* Academic Icon */}
                                            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl md:rounded-2xl bg-blue-900 flex items-center justify-center text-xl sm:text-2xl md:text-3xl text-white shadow-lg">
                                                {academic.icon}
                                            </div>

                                            {/* Academic Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                                {academic.title}
                                                            </h3>
                                                            {!academic.isActive && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-100 text-red-700 text-[10px] sm:text-xs font-bold rounded-full">
                                                                    INACTIVE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 line-clamp-2">{academic.description}</p>

                                                        {/* Grades or Details */}
                                                        {academic.type === 'class' && academic.grades && academic.grades.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                                                {academic.grades.slice(0, 3).map((grade, idx) => (
                                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-900 text-[10px] sm:text-xs font-medium rounded-full">
                                                                        {grade}
                                                                    </span>
                                                                ))}
                                                                {academic.grades.length > 3 && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium rounded-full">
                                                                        +{academic.grades.length - 3} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {academic.type === 'activity' && academic.details && academic.details.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                                                {academic.details.slice(0, 2).map((detail, idx) => (
                                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-900 text-[10px] sm:text-xs font-medium rounded-full">
                                                                        {detail}
                                                                    </span>
                                                                ))}
                                                                {academic.details.length > 2 && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium rounded-full">
                                                                        +{academic.details.length - 2} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Meta Information */}
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-500">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${typeInfo.color} text-white`}>
                                                                <span className="text-sm sm:text-base">{typeInfo.icon}</span> 
                                                                <span className="hidden sm:inline">{typeInfo.label}</span>
                                                            </span>
                                                            {academic.medium && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="text-base sm:text-lg">{academic.medium === 'english' ? '🇺🇸' : '🇧🇩'}</span>
                                                                    <span className="hidden sm:inline">{academic.medium === 'english' ? 'English' : 'Bangla'}</span>
                                                                </span>
                                                            )}
                                                            {academic.ageGroup && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="text-sm sm:text-base">👶</span> 
                                                                    {academic.ageGroup}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <button
                                                            onClick={() => startEdit(academic)}
                                                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Academic"
                                                        >
                                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(academic)}
                                                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Academic"
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
                        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-4 sm:p-6 md:p-8">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                                        {editingAcademic ? 'Edit Academic Entry' : 'Add New Academic Entry'}
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                                placeholder="e.g., Pre-Primary, Mathematics, Music & Dance"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="lg:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Description *
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                                rows={3}
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                                                placeholder="Describe the academic entry..."
                                            />
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Type
                                            </label>
                                            <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                                                {academicTypes.map((type) => (
                                                    <label
                                                        key={type.value}
                                                        className={`flex items-center p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                                            formData.type === type.value
                                                                ? 'border-blue-900 bg-blue-50 shadow-lg'
                                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="type"
                                                            value={type.value}
                                                            checked={formData.type === type.value}
                                                            onChange={handleChange}
                                                            className="sr-only"
                                                        />
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-900 flex items-center justify-center text-white text-base sm:text-lg mr-2 sm:mr-3">
                                                            {type.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm sm:text-base font-semibold text-gray-900">{type.label}</div>
                                                        </div>
                                                        {formData.type === type.value && (
                                                            <div className="ml-2 sm:ml-3">
                                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Medium (for subjects) */}
                                        {formData.type === 'subject' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                    Medium
                                                </label>
                                                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                                                    {mediumOptions.map((medium) => (
                                                        <label
                                                            key={medium.value}
                                                            className={`flex items-center p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                                                formData.medium === medium.value
                                                                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                                                                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="medium"
                                                                value={medium.value}
                                                                checked={formData.medium === medium.value}
                                                                onChange={handleChange}
                                                                className="sr-only"
                                                            />
                                                            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{medium.icon}</span>
                                                            <div className="flex-1">
                                                                <div className="text-sm sm:text-base font-semibold text-gray-800">{medium.label}</div>
                                                            </div>
                                                            {formData.medium === medium.value && (
                                                                <div className="ml-2 sm:ml-3">
                                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Level (for classes) */}
                                        {formData.type === 'class' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                    Level
                                                </label>
                                                <input
                                                    type="text"
                                                    name="level"
                                                    value={formData.level}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                                    placeholder="e.g., Pre-Primary, Secondary"
                                                />
                                            </div>
                                        )}

                                        {/* Age Group (for classes) */}
                                        {formData.type === 'class' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                    Age Group
                                                </label>
                                                <input
                                                    type="text"
                                                    name="ageGroup"
                                                    value={formData.ageGroup}
                                                    onChange={handleChange}
                                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                                    placeholder="e.g., Ages 6-10"
                                                />
                                            </div>
                                        )}

                                        {/* Icon Selection */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Icon
                                            </label>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 max-h-32 overflow-y-auto">
                                                {(iconOptions[formData.type] || iconOptions.class).map((icon) => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 flex items-center justify-center text-lg sm:text-2xl transition-all hover:scale-110 ${
                                                            formData.icon === icon
                                                                ? 'border-blue-900 bg-blue-50 shadow-lg'
                                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                        }`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Grades (for classes) */}
                                        {formData.type === 'class' && (
                                            <div className="lg:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                    Grades
                                                </label>
                                                <div className="space-y-2 sm:space-y-3">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={currentGrade}
                                                            onChange={(e) => setCurrentGrade(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGrade())}
                                                            className="flex-1 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            placeholder="Add a grade..."
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={addGrade}
                                                            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                    {formData.grades.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                            {formData.grades.map((grade, idx) => (
                                                                <span key={idx} className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-900 text-xs sm:text-sm font-medium rounded-full">
                                                                    {grade}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeGrade(grade)}
                                                                        className="hover:bg-gray-200 rounded-full p-0.5 sm:p-1"
                                                                    >
                                                                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Details (for activities) */}
                                        {formData.type === 'activity' && (
                                            <div className="lg:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                    Activity Details
                                                </label>
                                                <div className="space-y-2 sm:space-y-3">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={currentDetail}
                                                            onChange={(e) => setCurrentDetail(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDetail())}
                                                            className="flex-1 px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            placeholder="Add activity detail..."
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={addDetail}
                                                            className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                    {formData.details.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                            {formData.details.map((detail, idx) => (
                                                                <span key={idx} className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-900 text-xs sm:text-sm font-medium rounded-full">
                                                                    {detail}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeDetail(detail)}
                                                                        className="hover:bg-gray-200 rounded-full p-0.5 sm:p-1"
                                                                    >
                                                                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Order */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                                Display Order
                                            </label>
                                            <input
                                                type="number"
                                                name="order"
                                                value={formData.order}
                                                onChange={handleChange}
                                                min="0"
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Active Status */}
                                        <div className="lg:col-span-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="isActive"
                                                    checked={formData.isActive}
                                                    onChange={handleChange}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">Active (visible on website)</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 text-gray-700 font-medium rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-sm sm:text-base">{editingAcademic ? 'Updating...' : 'Creating...'}</span>
                                                </div>
                                            ) : (
                                                editingAcademic ? 'Update Entry' : 'Create Entry'
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
        </div>
    );
};

export default AcademicsPage;