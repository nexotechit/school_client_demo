'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config/api';
import Swal from 'sweetalert2';

export default function ClassRoutineManagement() {
    const [routines, setRoutines] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentRoutine, setCurrentRoutine] = useState(null);
    const [filterClass, setFilterClass] = useState('');
    const [filterDay, setFilterDay] = useState('');
    const [formData, setFormData] = useState({
        className: '',
        section: '',
        subject: '',
        teacherId: '',
        teacherName: '',
        day: '',
        startTime: '',
        endTime: '',
        duration: '',
        room: '',
        numberOfStudents: '',
        status: 'active'
    });

    // Fetch all routines
    const fetchRoutines = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/class/routines`);
            const data = await response.json();
            
            if (data.success) {
                setRoutines(data.data);
            }
        } catch (error) {
            console.error('Error fetching routines:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch class routines',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch all teachers
    const fetchTeachers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/teachers`);
            const data = await response.json();
            
            if (data.success) {
                setTeachers(data.data);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    useEffect(() => {
        fetchRoutines();
        fetchTeachers();
    }, []);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'teacherId') {
            // When teacher ID is selected, auto-fill the name
            const selectedTeacher = teachers.find(t => t._id === value);
            setFormData({
                ...formData,
                teacherId: value,
                teacherName: selectedTeacher ? selectedTeacher.name : ''
            });
        } else if (name === 'teacherName') {
            // When teacher name is selected, check if it's unique and auto-fill ID
            const matchingTeachers = teachers.filter(t => t.name === value);
            if (matchingTeachers.length === 1) {
                // If name is unique, auto-select the ID
                setFormData({
                    ...formData,
                    teacherName: value,
                    teacherId: matchingTeachers[0]._id
                });
            } else {
                // If name is not unique or empty, just update the name
                setFormData({
                    ...formData,
                    teacherName: value,
                    // Clear teacherId if name is not unique
                    teacherId: matchingTeachers.length === 1 ? matchingTeachers[0]._id : ''
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Calculate duration when times change
    useEffect(() => {
        if (formData.startTime && formData.endTime) {
            const start = new Date(`2000-01-01 ${formData.startTime}`);
            const end = new Date(`2000-01-01 ${formData.endTime}`);
            const diff = (end - start) / (1000 * 60); // minutes
            setFormData(prev => ({ ...prev, duration: `${diff} mins` }));
        }
    }, [formData.startTime, formData.endTime]);

    // Open modal for adding
    const handleAddRoutine = () => {
        setIsEditMode(false);
        setCurrentRoutine(null);
        setFormData({
            className: '',
            section: '',
            subject: '',
            teacherId: '',
            teacherName: '',
            day: '',
            startTime: '',
            endTime: '',
            duration: '',
            room: '',
            numberOfStudents: '',
            status: 'active'
        });
        setIsModalOpen(true);
    };

    // Open modal for editing
    const handleEditRoutine = (routine) => {
        setIsEditMode(true);
        setCurrentRoutine(routine);
        setFormData({
            className: routine.className,
            section: routine.section,
            subject: routine.subject,
            teacherId: routine.teacherId,
            teacherName: routine.teacherName,
            day: routine.day,
            startTime: routine.startTime,
            endTime: routine.endTime,
            duration: routine.duration,
            room: routine.room || '',
            numberOfStudents: routine.numberOfStudents || '',
            status: routine.status
        });
        setIsModalOpen(true);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let url, method;
            
            if (isEditMode) {
                url = `${API_URL}/api/class/routines/${currentRoutine._id}`;
                method = 'PUT';
            } else {
                url = `${API_URL}/api/class/routines`;
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
                    title: isEditMode ? 'Updated!' : 'Added!',
                    text: isEditMode ? 'Routine updated successfully' : 'Routine added successfully',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                setIsModalOpen(false);
                await fetchRoutines();
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

    // Delete routine
    const handleDeleteRoutine = async (id) => {
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
                const response = await fetch(`${API_URL}/api/class/routines/${id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Routine has been deleted.',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: { container: 'swal-high-z-index' }
                    });
                    fetchRoutines();
                }
            } catch (error) {
                console.error('Error deleting routine:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete routine',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        }
    };

    // Filter routines
    const filteredRoutines = routines.filter(routine => {
        const matchesClass = filterClass === '' || routine.className === filterClass;
        const matchesDay = filterDay === '' || routine.day === filterDay;
        return matchesClass && matchesDay;
    });

    // Group routines by class and day
    const groupedRoutines = filteredRoutines.reduce((acc, routine) => {
        const key = `${routine.className} - ${routine.section}`;
        if (!acc[key]) {
            acc[key] = {};
        }
        if (!acc[key][routine.day]) {
            acc[key][routine.day] = [];
        }
        acc[key][routine.day].push(routine);
        return acc;
    }, {});

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const hours = [
        { label: '8:00 AM', value: 8 },
        { label: '9:00 AM', value: 9 },
        { label: '10:00 AM', value: 10 },
        { label: '11:00 AM', value: 11 },
        { label: '12:00 PM', value: 12 },
        { label: '1:00 PM', value: 13 },
        { label: '2:00 PM', value: 14 },
        { label: '3:00 PM', value: 15 },
        { label: '4:00 PM', value: 16 }
    ];

    const colors = ['bg-[#E0F2FE]', 'bg-[#FEF9C3]', 'bg-[#F3E8FF]', 'bg-[#FCE7F3]', 'bg-[#DCFCE7]'];

    return (
        <div className="min-h-screen bg-gray-50 p-1 sm:p-6 lg:p-3">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Class Routine Management</h2>
                        <p className="text-gray-600 text-sm sm:text-base">Manage class schedules and timetables</p>
                    </div>
                    <button
                        onClick={handleAddRoutine}
                        className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Routing</span>
                    </button>
                </div>


                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="">All Classes</option>
                            <option value="Play">Play</option>
                            <option value="Nursery">Nursery</option>
                            <option value="KG">KG</option>
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
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day</label>
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="">All Days</option>
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilterClass('');
                                setFilterDay('');
                            }}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                        <p className="text-xs sm:text-sm text-gray-600">Total Routines</p>
                        <p className="text-xl sm:text-2xl font-bold text-indigo-900">{routines.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                        <p className="text-xs sm:text-sm text-gray-600">Total Classes</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">{Object.keys(groupedRoutines).length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100">
                        <p className="text-xs sm:text-sm text-gray-600">Active Routines</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900">{routines.filter(r => r.status === 'active').length}</p>
                    </div>
                </div>

                {/* Routine Display */}
                {loading ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading routines...</p>
                    </div>
                ) : Object.keys(groupedRoutines).length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                        <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-base sm:text-lg">No class routines found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                        <div className="min-w-[1000px]">
                            {/* Header row (Days) */}
                            <div className="grid grid-cols-8 border-b border-gray-200">
                                <div className="p-4 border-r border-gray-200 bg-gray-50/50">
                                </div>
                                {days.map(day => (
                                    <div key={day} className="p-4 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Time rows */}
                            {hours.map(hour => (
                                <div key={hour.value} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 min-h-[140px]">
                                    {/* Time label */}
                                    <div className="p-4 border-r border-gray-200 text-sm text-gray-500 font-medium text-center pt-6">
                                        {hour.label}
                                    </div>
                                    
                                    {/* Day columns for this hour */}
                                    {days.map((day, dayIndex) => {
                                        const cellRoutines = filteredRoutines.filter(r => {
                                            const routineHour = parseInt(r.startTime.split(':')[0], 10);
                                            return r.day === day && routineHour === hour.value;
                                        });
                                        
                                        return (
                                            <div key={day} className="p-2 border-r border-gray-200 last:border-r-0 relative border-l border-l-transparent">
                                                {cellRoutines.map((routine, idx) => {
                                                    const colorClass = colors[(hour.value + dayIndex + idx) % colors.length];
                                                    return (
                                                        <div key={routine._id} className={`${colorClass} p-3 rounded-lg mb-2 cursor-pointer hover:shadow-md transition-shadow group relative border border-transparent hover:border-gray-300`}>
                                                            <div className="text-[11px] text-gray-500 mb-1 font-medium">
                                                                {formatTime(routine.startTime)} - {formatTime(routine.endTime)}
                                                            </div>
                                                            <div className="text-sm font-semibold text-gray-800 leading-tight mb-1">
                                                                {routine.className} {routine.section} - {routine.subject}
                                                            </div>
                                                            <div className="text-[11px] text-gray-600 space-y-0.5">
                                                                <div>{routine.teacherName}</div>
                                                                <div>Room: {routine.room || 'N/A'}</div>
                                                            </div>
                                                            
                                                            {/* Action buttons on hover */}
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                                                <button onClick={() => handleEditRoutine(routine)} className="p-1.5 bg-white/70 hover:bg-white rounded-md text-blue-600 shadow-sm transition-colors">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                                <button onClick={() => handleDeleteRoutine(routine._id)} className="p-1.5 bg-white/70 hover:bg-white rounded-md text-red-600 shadow-sm transition-colors">
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 sm:p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg sm:text-xl font-bold">
                                    {isEditMode ? 'Edit Class Routine' : 'Add New Class Routine'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:text-gray-200 transition-colors p-1"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                                    <select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="">Select Class</option>
                                        <option value="Play">Play</option>
                                        <option value="Nursery">Nursery</option>
                                        <option value="KG">KG</option>
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
                                        <option value="Class 11">Class 11</option>
                                        <option value="Class 12">Class 12</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="">Select Section</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="e.g., Mathematics, English"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Teacher ID *</label>
                                    <select
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="">Select Teacher ID</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher._id} value={teacher._id}>
                                                {teacher.teacherId} - {teacher.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name *</label>
                                    <select
                                        name="teacherName"
                                        value={formData.teacherName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="">Select Teacher Name</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher._id} value={teacher.name}>
                                                {teacher.name} {teacher.subject ? `(${teacher.subject})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Day *</label>
                                    <select
                                        name="day"
                                        value={formData.day}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="">Select Day</option>
                                        {days.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Auto)</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        readOnly
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm sm:text-base"
                                        placeholder="Auto-calculated"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                                    <input
                                        type="text"
                                        name="room"
                                        value={formData.room}
                                        onChange={handleInputChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="e.g., 101, Lab 1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students</label>
                                    <input
                                        type="number"
                                        name="numberOfStudents"
                                        value={formData.numberOfStudents}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="e.g., 30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                                >
                                    {isEditMode ? 'Update Routine' : 'Add Routine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}