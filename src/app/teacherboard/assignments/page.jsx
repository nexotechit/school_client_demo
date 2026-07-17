'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { API_URL } from '../../../../config/api';
import Swal from 'sweetalert2';
import ImgBBUpload from '../../../../components/ImgBBUpload';

export default function AssignmentManagement() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [filterClass, setFilterClass] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [currentTeacher, setCurrentTeacher] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        className: '',
        section: '',
        deadline: '',
        imageUrl: '',
        teacherId: '',
        teacherName: '',
        totalMarks: '',
        status: 'active'
    });

    useEffect(() => {
        // Get current teacher from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentTeacher(user);
        }
        fetchAssignments();
    }, []);

    // Fetch all assignments
    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/assignments`);
            const data = await response.json();
            
            if (data.success) {
                setAssignments(data.data);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch assignments',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle image upload
    const handleImageUpload = (url) => {
        setUploadedImageUrl(url);
        setFormData({
            ...formData,
            imageUrl: url
        });
    };

    // Open modal for adding
    const handleAddAssignment = () => {
        setIsEditMode(false);
        setCurrentAssignment(null);
        setUploadedImageUrl('');
        setFormData({
            title: '',
            description: '',
            subject: '',
            className: '',
            section: '',
            deadline: '',
            imageUrl: '',
            teacherId: currentTeacher?.teacherId || '',
            teacherName: currentTeacher?.name || '',
            totalMarks: '',
            status: 'active'
        });
        setIsModalOpen(true);
    };

    // Open modal for editing
    const handleEditAssignment = (assignment) => {
        setIsEditMode(true);
        setCurrentAssignment(assignment);
        setUploadedImageUrl(assignment.imageUrl || '');
        setFormData({
            title: assignment.title,
            description: assignment.description,
            subject: assignment.subject,
            className: assignment.className,
            section: assignment.section,
            deadline: assignment.deadline,
            imageUrl: assignment.imageUrl || '',
            teacherId: assignment.teacherId,
            teacherName: assignment.teacherName,
            totalMarks: assignment.totalMarks || '',
            status: assignment.status
        });
        setIsModalOpen(true);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let url, method;
            
            if (isEditMode) {
                url = `${API_URL}/api/assignments/${currentAssignment._id}`;
                method = 'PUT';
            } else {
                url = `${API_URL}/api/assignments`;
                method = 'POST';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated!' : 'Created!',
                    text: isEditMode ? 'Assignment updated successfully' : 'Assignment created successfully',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                setIsModalOpen(false);
                await fetchAssignments();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Operation failed',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong!',
                customClass: { container: 'swal-high-z-index' }
            });
        }
    };

    // Delete assignment
    const handleDeleteAssignment = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            customClass: { container: 'swal-high-z-index' }
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/api/assignments/${id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Assignment has been deleted.',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: { container: 'swal-high-z-index' }
                    });
                    fetchAssignments();
                }
            } catch (error) {
                console.error('Error deleting assignment:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete assignment',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        }
    };

    // Filter assignments
    const filteredAssignments = assignments.filter(assignment => {
        const matchesClass = filterClass === '' || assignment.className === filterClass;
        const matchesSubject = filterSubject === '' || assignment.subject.toLowerCase().includes(filterSubject.toLowerCase());
        return matchesClass && matchesSubject;
    });

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Check if deadline is approaching or passed
    const getDeadlineStatus = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { status: 'overdue', color: 'red', text: 'Overdue' };
        if (diffDays <= 2) return { status: 'urgent', color: 'orange', text: `${diffDays} days left` };
        return { status: 'active', color: 'green', text: `${diffDays} days left` };
    };

    return (
        <div className="min-h-screen bg-white p-1">
            <div className="container mx-auto">
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">
                                📝 Assignment Management
                            </h2>
                            <p className="text-black">Create and manage assignments for your classes</p>
                        </div>
                        <button
                            onClick={handleAddAssignment}
                            className="mt-4 lg:mt-0 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-medium"
                        >
                            + Create Assignment
                        </button>
                    </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Filter by Class</label>
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Classes</option>
                            <option value="Class 1">Class 1</option>
                            <option value="Class 2">Class 2</option>
                            <option value="Class 3">Class 3</option>
                            <option value="Class 4">Class 4</option>
                            <option value="Class 5">Class 5</option>
                            <option value="Class 6">Class 6</option>
                            <option value="Class 7">Class 7</option>
                            <option value="Class 8">Class 8</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 10">Class 10</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Filter by Subject</label>
                        <input
                            type="text"
                            value={filterSubject}
                            onChange={(e) => setFilterSubject(e.target.value)}
                            placeholder="Search subject..."
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilterClass('');
                                setFilterSubject('');
                            }}
                            className="w-full px-3 py-2 bg-gray-100 text-black rounded hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 p-6 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-black mb-1">Total Assignments</p>
                                <p className="text-3xl font-bold text-black">{assignments.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📚</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-black mb-1">Active</p>
                                <p className="text-3xl font-bold text-black">{assignments.filter(a => a.status === 'active').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-black mb-1">Due Soon</p>
                                <p className="text-3xl font-bold text-black">
                                    {assignments.filter(a => {
                                        const status = getDeadlineStatus(a.deadline);
                                        return status.status === 'urgent';
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⏰</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-black mb-1">Overdue</p>
                                <p className="text-3xl font-bold text-black">
                                    {assignments.filter(a => {
                                        const status = getDeadlineStatus(a.deadline);
                                        return status.status === 'overdue';
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⚠️</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignment Cards - 4 per row */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-900 mx-auto"></div>
                        <p className="mt-4 text-black">Loading assignments...</p>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-8 text-black">
                        <svg className="w-16 h-16 mx-auto mb-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-base font-medium">No assignments found</p>
                        <p className="text-sm text-black mt-2">Create your first assignment to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAssignments.map((assignment) => {
                            const deadlineInfo = getDeadlineStatus(assignment.deadline);
                            return (
                                <div key={assignment._id} className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    {/* Assignment Image */}
                                    <div className="relative h-32 bg-gray-50 overflow-hidden">
                                        {assignment.imageUrl ? (
                                            <img
                                                src={assignment.imageUrl}
                                                alt={assignment.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                                                deadlineInfo.status === 'overdue' ? 'bg-gray-600' :
                                                deadlineInfo.status === 'urgent' ? 'bg-blue-900' : 'bg-blue-900'
                                            }`}>
                                                {deadlineInfo.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Assignment Content */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-base font-bold text-black line-clamp-2 flex-1">
                                                {assignment.title}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-black mb-3 line-clamp-2">
                                            {assignment.description}
                                        </p>

                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center text-sm text-black">
                                                <svg className="w-4 h-4 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                                <span className="font-medium">{assignment.subject}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-black">
                                                <svg className="w-4 h-4 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span>{assignment.className} - {assignment.section}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-black">
                                                <svg className="w-4 h-4 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>Due: {formatDate(assignment.deadline)}</span>
                                            </div>
                                            {assignment.totalMarks && (
                                                <div className="flex items-center text-sm text-black">
                                                    <svg className="w-4 h-4 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                    <span>Total Marks: {assignment.totalMarks}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-sm text-black">
                                                <svg className="w-4 h-4 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="truncate">{assignment.teacherName}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center space-x-2 pt-2 border-t">
                                            <button
                                                onClick={() => handleEditAssignment(assignment)}
                                                className="flex-1 bg-blue-900 text-white px-3 py-2 rounded hover:bg-blue-800 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAssignment(assignment._id)}
                                                className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1 text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-blue-900 text-white p-6 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">
                                    📝 {isEditMode ? 'Edit Assignment' : 'Create New Assignment'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:text-gray-200 transition-colors p-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-black mb-2">Assignment Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Math Chapter 5 Exercise"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-black mb-2">Description *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Detailed description of the assignment..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Subject *</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Mathematics, Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Class *</label>
                                    <select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Class</option>
                                        <option value="Class 1">Class 1</option>
                                        <option value="Class 2">Class 2</option>
                                        <option value="Class 3">Class 3</option>
                                        <option value="Class 4">Class 4</option>
                                        <option value="Class 5">Class 5</option>
                                        <option value="Class 6">Class 6</option>
                                        <option value="Class 7">Class 7</option>
                                        <option value="Class 8">Class 8</option>
                                        <option value="Class 9">Class 9</option>
                                        <option value="Class 10">Class 10</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Section *</label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Section</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Deadline *</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Total Marks</label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={formData.totalMarks}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-black mb-2">Assignment Image</label>
                                    <ImgBBUpload onUploadSuccess={handleImageUpload} />
                                    {uploadedImageUrl && (
                                        <div className="mt-3">
                                            <img
                                                src={uploadedImageUrl}
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded border border-gray-300"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-black rounded hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors"
                                >
                                    {isEditMode ? 'Update Assignment' : 'Create Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}