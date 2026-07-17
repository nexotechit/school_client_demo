'use client';
import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { API_URL } from '../../../../config/api';

export default memo(function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStudent, setCurrentStudent] = useState(null);

    useEffect(() => {
        // Get current student from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentStudent(user);
            fetchStudentAssignments(user.class, user.section);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchStudentAssignments = async (studentClass, studentSection) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/assignments`);
            const data = await response.json();

            if (data.success) {
                // Filter assignments for current student's class and section
                const filteredAssignments = data.data.filter(assignment =>
                    assignment.className === studentClass &&
                    assignment.section === studentSection &&
                    assignment.status === 'active'
                );
                setAssignments(filteredAssignments);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysUntilDeadline = (deadline) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
        if (diffDays === 0) return { text: 'Due Today', color: 'text-orange-600' };
        if (diffDays === 1) return { text: 'Due Tomorrow', color: 'text-orange-600' };
        return { text: `${diffDays} days left`, color: 'text-gray-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="container mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading assignments...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3">
            <div className="container mx-auto">
                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">
                        My Assignments
                    </h1>
                    <p className="text-gray-600">
                        View and manage your assignments for {currentStudent?.class} - {currentStudent?.section}
                    </p>
                </div>

                {/* Assignments List */}
                {assignments.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
                        <p className="text-gray-600">
                            Your teachers have not assigned any assignments for your class yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {assignments.map((assignment) => {
                            const deadlineInfo = getDaysUntilDeadline(assignment.deadline);
                            return (
                                <div key={assignment._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                        {assignment.title}
                                                    </h3>
                                                    <p className="text-blue-900 font-medium mb-2">
                                                        {assignment.subject}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${deadlineInfo.color} bg-gray-100`}>
                                                    {deadlineInfo.text}
                                                </span>
                                            </div>

                                            <p className="text-gray-700 mb-4 leading-relaxed">
                                                {assignment.description}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-900">Teacher:</span>
                                                    <p className="text-gray-600">{assignment.teacherName}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900">Class:</span>
                                                    <p className="text-gray-600">{assignment.className} - {assignment.section}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900">Deadline:</span>
                                                    <p className="text-gray-600">{formatDate(assignment.deadline)}</p>
                                                </div>
                                                {assignment.totalMarks && (
                                                    <div>
                                                        <span className="font-medium text-gray-900">Total Marks:</span>
                                                        <p className="text-gray-600">{assignment.totalMarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {assignment.imageUrl && (
                                            <div className="mt-4 lg:mt-0 lg:ml-6">
                                                <img
                                                    src={assignment.imageUrl}
                                                    alt="Assignment"
                                                    width={192}
                                                    height={128}
                                                    className="w-full lg:w-48 h-32 object-cover rounded-lg border border-gray-200"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Card */}
                {assignments.length > 0 && (
                    <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Summary</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-900">{assignments.length}</div>
                                <div className="text-gray-600">Total Assignments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {assignments.filter(a => new Date(a.deadline) > new Date()).length}
                                </div>
                                <div className="text-gray-600">Pending</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {assignments.filter(a => new Date(a.deadline) < new Date()).length}
                                </div>
                                <div className="text-gray-600">Overdue</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});