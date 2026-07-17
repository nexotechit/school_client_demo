'use client';
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../../config/api';

const AchievementsPage = () => {
    const queryClient = useQueryClient();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        category: 'Academic',
        image: '',
        achievements: [],
        isActive: true
    });
    const [editingAchievement, setEditingAchievement] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [currentSubAchievement, setCurrentSubAchievement] = useState('');

    // Achievement categories with enhanced styling
    const categories = [
        { value: 'Academic', label: 'Academic Excellence', icon: '🎓', color: 'bg-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
        { value: 'Sports', label: 'Sports Achievements', icon: '⚽', color: 'bg-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
        { value: 'Cultural', label: 'Cultural Events', icon: '🎭', color: 'bg-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-700' },
        { value: 'Science', label: 'Science & Research', icon: '🔬', color: 'bg-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-700' },
        { value: 'Arts', label: 'Arts & Creativity', icon: '🎨', color: 'bg-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', textColor: 'text-pink-700' },
        { value: 'Technology', label: 'Technology & Innovation', icon: '💻', color: 'bg-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', textColor: 'text-indigo-700' }
    ];

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const response = await fetch(`${API_URL}/api/achievements`, { cache: 'no-store' });
            const data = await response.json();
            if (data.success) {
                setAchievements(data.data);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
            Swal.fire('Error', 'Failed to fetch achievements', 'error');
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingAchievement
                ? `${API_URL}/api/achievements/${editingAchievement._id}`
                : `${API_URL}/api/achievements`;

            const method = editingAchievement ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: editingAchievement ? 'Updated!' : 'Created!',
                    text: `Achievement ${editingAchievement ? 'updated' : 'created'} successfully`,
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchAchievements();
                queryClient.invalidateQueries({ queryKey: ['achievements'] });
                resetForm();
                setShowModal(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error saving achievement:', error);
            Swal.fire('Error', error.message || 'Failed to save achievement', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (achievement) => {
        setEditingAchievement(achievement);
        setFormData({
            title: achievement.title,
            description: achievement.description,
            date: new Date(achievement.date).toISOString().split('T')[0],
            category: achievement.category,
            image: achievement.image || '',
            achievements: achievement.achievements || [],
            isActive: achievement.isActive
        });
        setShowModal(true);
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
                const response = await fetch(`${API_URL}/api/achievements/${id}`, {
                    method: 'DELETE',
                    cache: 'no-store'
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire('Deleted!', 'Achievement has been deleted.', 'success');
                    fetchAchievements();
                    queryClient.invalidateQueries({ queryKey: ['achievements'] });
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Error deleting achievement:', error);
                Swal.fire('Error', 'Failed to delete achievement', 'error');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            date: '',
            category: 'Academic',
            image: '',
            achievements: [],
            isActive: true
        });
        setEditingAchievement(null);
        setCurrentSubAchievement('');
    };

    const addSubAchievement = () => {
        if (currentSubAchievement.trim()) {
            setFormData(prev => ({
                ...prev,
                achievements: [...prev.achievements, currentSubAchievement.trim()]
            }));
            setCurrentSubAchievement('');
        }
    };

    const removeSubAchievement = (index) => {
        setFormData(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index)
        }));
    };

    const filteredAchievements = achievements.filter(achievement => {
        const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
                <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-900 text-base sm:text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-5 md:p-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 mb-2">Achievements Management</h1>
                            <p className="text-gray-900 text-sm sm:text-base">Manage school achievements and recognitions</p>
                        </div>

                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                        >
                            Add Achievement
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search achievements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base"
                            />
                        </div>
                        <div className="lg:w-64">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.value} value={category.value}>{category.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {filteredAchievements.map((achievement) => {
                        const category = categories.find(cat => cat.value === achievement.category);
                        return (
                            <div key={achievement._id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-900 flex items-center justify-center text-lg sm:text-2xl text-white">
                                        {category?.icon}
                                    </div>
                                    <div className="flex gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handleEdit(achievement)}
                                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(achievement._id)}
                                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
                                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{achievement.description}</p>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                    <span className="px-2 py-1 sm:px-3 rounded-full text-xs font-bold bg-gray-100 text-gray-900 w-fit">
                                        {achievement.category}
                                    </span>
                                    <span className="text-xs text-gray-900">
                                        {new Date(achievement.date).toLocaleDateString()}
                                    </span>
                                </div>

                                {achievement.achievements && achievement.achievements.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">Highlights:</h4>
                                        <ul className="space-y-1">
                                            {achievement.achievements.slice(0, 2).map((item, idx) => (
                                                <li key={idx} className="text-xs text-gray-900 flex items-center gap-2">
                                                    <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                                                    {item}
                                                </li>
                                            ))}
                                            {achievement.achievements.length > 2 && (
                                                <li className="text-xs text-gray-500">+{achievement.achievements.length - 2} more</li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-900">
                                        {achievement.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredAchievements.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                        <div className="text-4xl sm:text-6xl mb-4">🏆</div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No achievements found</h3>
                        <p className="text-gray-600 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-4 sm:p-6 lg:p-8">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-blue-900">
                                        {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base"
                                                placeholder="Achievement title"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
                                            <select
                                                required
                                                value={formData.category}
                                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base"
                                            >
                                                {categories.map(category => (
                                                    <option key={category.value} value={category.value}>
                                                        {category.icon} {category.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 resize-none text-sm sm:text-base"
                                            placeholder="Describe the achievement"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Image URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={formData.image}
                                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Sub-Achievements</label>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={currentSubAchievement}
                                                onChange={(e) => setCurrentSubAchievement(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubAchievement())}
                                                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-sm sm:text-base"
                                                placeholder="Add a highlight or sub-achievement"
                                            />
                                            <button
                                                type="button"
                                                onClick={addSubAchievement}
                                                className="px-3 py-2 sm:px-4 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm sm:text-base"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {formData.achievements.map((item, index) => (
                                                <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                    <span className="flex-1 text-xs sm:text-sm">{item}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSubAchievement(index)}
                                                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">Active</label>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                        >
                                            {submitting ? 'Saving...' : (editingAchievement ? 'Update' : 'Create')}
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

export default AchievementsPage;