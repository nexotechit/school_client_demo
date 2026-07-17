'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config/api';
import Swal from 'sweetalert2';

export default function AttendanceManagement() {
    const [students, setStudents] = useState([]);
    const [attendanceSheet, setAttendanceSheet] = useState({}); // {studentId: {date: status}}
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [loading, setLoading] = useState(false);
    const [showSheet, setShowSheet] = useState(false);
    const [takenBy, setTakenBy] = useState('');
    const [dates, setDates] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [savedSheets, setSavedSheets] = useState([]);
    const [showHistory, setShowHistory] = useState(true);
    const [viewMode, setViewMode] = useState('table');

    // Generate dates for the selected month
    const generateDates = (yearMonth) => {
        const [year, month] = yearMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const dateArray = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dateArray.push(date);
        }
        
        return dateArray;
    };

    // Fetch students based on class and section
    const fetchStudents = async () => {
        if (!selectedClass || !selectedSection) {
            Swal.fire({
                icon: 'warning',
                title: 'Selection Required',
                text: 'Please select both class and section',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/students`, { cache: 'no-store' });
            const data = await response.json();
            
            if (data.success) {
                const filteredStudents = data.data.filter(
                    user => user.role === 'student' && 
                    user.class === selectedClass && 
                    user.section === selectedSection
                ).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
                
                setStudents(filteredStudents);
                
                // Generate dates for the month
                const monthDates = generateDates(selectedMonth);
                setDates(monthDates);
                
                // Initialize attendance sheet
                const initialSheet = {};
                filteredStudents.forEach(student => {
                    initialSheet[student._id] = {};
                    monthDates.forEach(date => {
                        initialSheet[student._id][date] = null; // null = not marked
                    });
                });
                
                // Try to fetch existing attendance records for this class and month
                await fetchExistingAttendance(filteredStudents, monthDates, initialSheet);
                
                setShowSheet(true);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch students',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch existing attendance records
    const fetchExistingAttendance = async (studentList, monthDates, initialSheet) => {
        try {
            const response = await fetch(`${API_URL}/api/attendance/sheet?class=${selectedClass}&section=${selectedSection}&month=${selectedMonth}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                // Populate existing attendance data
                studentList.forEach(student => {
                    monthDates.forEach(date => {
                        const record = data.data.find(r => r.studentId === student._id && r.date === date);
                        if (record) {
                            initialSheet[student._id][date] = record.status;
                        }
                    });
                });
            }
            
            setAttendanceSheet(initialSheet);
        } catch (error) {
            console.error('Error fetching existing attendance:', error);
            setAttendanceSheet(initialSheet);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setTakenBy(user.name || 'Admin');
        fetchSavedSheets();
    }, []);

    // Set default view mode to table for full sheet view
    useEffect(() => {
        setViewMode('table');
    }, []);

    // Fetch saved attendance sheets
    const fetchSavedSheets = async () => {
        try {
            const response = await fetch(`${API_URL}/api/attendance`);
            const data = await response.json();
            
            if (data.success) {
                // Group by class, section, month
                const grouped = data.data.reduce((acc, record) => {
                    const month = record.date.substring(0, 7); // YYYY-MM
                    const key = `${record.className}-${record.section}-${month}`;
                    
                    if (!acc[key]) {
                        acc[key] = {
                            className: record.className,
                            section: record.section,
                            month: month,
                            records: [],
                            lastUpdated: record.updatedAt || record.createdAt
                        };
                    }
                    acc[key].records.push(record);
                    return acc;
                }, {});
                
                setSavedSheets(Object.values(grouped).sort((a, b) => 
                    new Date(b.lastUpdated) - new Date(a.lastUpdated)
                ));
            }
        } catch (error) {
            console.error('Error fetching saved sheets:', error);
        }
    };

    // Mark attendance for a specific student on a specific date
    const markAttendance = (studentId, date, status) => {
        setAttendanceSheet(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [date]: status
            }
        }));
    };

    // Mark all students present for a specific date
    const markAllPresentForDate = (date) => {
        setAttendanceSheet(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(studentId => {
                updated[studentId][date] = 'present';
            });
            return updated;
        });
    };

    // Mark all students absent for a specific date
    const markAllAbsentForDate = (date) => {
        setAttendanceSheet(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(studentId => {
                updated[studentId][date] = 'absent';
            });
            return updated;
        });
    };

    // Calculate statistics
    const getStats = () => {
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalNotMarked = 0;

        Object.values(attendanceSheet).forEach(studentAttendance => {
            Object.values(studentAttendance).forEach(status => {
                if (status === 'present') totalPresent++;
                else if (status === 'absent') totalAbsent++;
                else totalNotMarked++;
            });
        });

        return { totalPresent, totalAbsent, totalNotMarked };
    };

    // Submit attendance
    const submitAttendance = async () => {
        const attendanceData = [];
        
        students.forEach(student => {
            dates.forEach(date => {
                const status = attendanceSheet[student._id][date];
                if (status) { // Only submit marked attendance
                    attendanceData.push({
                        studentId: student._id,
                        studentName: student.name,
                        rollNumber: student.rollNumber,
                        className: selectedClass,
                        section: selectedSection,
                        date: date,
                        status: status,
                        takenBy: takenBy
                    });
                }
            });
        });

        if (attendanceData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Attendance Marked',
                text: 'Please mark attendance for at least one student',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/attendance/sheet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attendanceData }),
            });

            const data = await response.json();

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Attendance submitted successfully',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                fetchSavedSheets(); // Refresh history
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to submit attendance',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong!',
                customClass: { container: 'swal-high-z-index' }
            });
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
        };
    };

    const stats = showSheet ? getStats() : { totalPresent: 0, totalAbsent: 0, totalNotMarked: 0 };
// Filter students by search query
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get individual student statistics
    const getStudentStats = (studentId) => {
        const studentAttendance = attendanceSheet[studentId] || {};
        const present = Object.values(studentAttendance).filter(s => s === 'present').length;
        const absent = Object.values(studentAttendance).filter(s => s === 'absent').length;
        const total = dates.length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
        return { present, absent, total, percentage };
    };

    // Print attendance sheet
    const printSheet = () => {
        window.print();
    };

    // Download as CSV
    const downloadCSV = () => {
        let csv = `Attendance Sheet - ${selectedClass} Section ${selectedSection} - ${new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\n`;
        
        // Header row
        csv += 'S.No,Roll No,Student Name,' + dates.map(d => {
            const { day, weekday } = formatDate(d);
            return `${day} ${weekday}`;
        }).join(',') + ',Total Present,Total Absent,Percentage\n';
        
        // Data rows
        students.forEach((student, index) => {
            const studentStats = getStudentStats(student._id);
            csv += `${index + 1},${student.rollNumber},"${student.name}",`;
            csv += dates.map(date => {
                const status = attendanceSheet[student._id]?.[date];
                return status === 'present' ? 'P' : status === 'absent' ? 'A' : '-';
            }).join(',');
            csv += `,${studentStats.present},${studentStats.absent},${studentStats.percentage}%\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_${selectedClass}_${selectedSection}_${selectedMonth}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Load a saved sheet for editing
    const loadSavedSheet = async (sheet) => {
        setSelectedClass(sheet.className);
        setSelectedSection(sheet.section);
        setSelectedMonth(sheet.month);
        
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/students`, { cache: 'no-store' });
            const data = await response.json();
            
            if (data.success) {
                const filteredStudents = data.data.filter(
                    user => user.role === 'student' && 
                    user.class === sheet.className && 
                    user.section === sheet.section
                ).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
                
                setStudents(filteredStudents);
                
                const monthDates = generateDates(sheet.month);
                setDates(monthDates);
                
                const initialSheet = {};
                filteredStudents.forEach(student => {
                    initialSheet[student._id] = {};
                    monthDates.forEach(date => {
                        const record = sheet.records.find(r => r.studentId === student._id && r.date === date);
                        initialSheet[student._id][date] = record ? record.status : null;
                    });
                });
                
                setAttendanceSheet(initialSheet);
                setShowSheet(true);
                setShowHistory(false);
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Error loading saved sheet:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load saved sheet',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0.5cm;
                    }
                    
                    body * {
                        visibility: hidden;
                    }
                    
                    #attendance-print-area,
                    #attendance-print-area * {
                        visibility: visible;
                    }
                    
                    #attendance-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 10px;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                    
                    .print\\:block {
                        display: block !important;
                    }
                    
                    .print\\:inline-block {
                        display: inline-block !important;
                    }
                    
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    table {
                        page-break-inside: auto;
                        border-collapse: collapse !important;
                        width: 100% !important;
                        font-size: 9px !important;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    
                    thead {
                        display: table-header-group;
                    }
                    
                    th, td {
                        border: 1px solid #333 !important;
                        padding: 3px 2px !important;
                        position: static !important;
                        left: auto !important;
                    }
                    
                    th {
                        background-color: #e5e7eb !important;
                        font-weight: bold !important;
                        font-size: 8px !important;
                    }
                    
                    td {
                        font-size: 9px !important;
                    }
                }
            `}</style>
            <div className="container mx-auto p-0">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-0">
                {/* Header */}
                <div className="mb-6 no-print">
                    <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Attendance Management System
                    </h2>
                    <p className="text-black">Professional Excel-style attendance tracking</p>
                </div>

                {/* Selection Form */}
                <div className="bg-white border border-gray-200 p-2 rounded-lg mb-6 no-print">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Select Class Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Class *</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Section *</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
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
                            <label className="block text-sm font-medium text-black mb-2">Month *</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={fetchStudents}
                                disabled={loading}
                                className="w-full bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors disabled:opacity-50 font-medium"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </span>
                                ) : (
                                    'Load Attendance Sheet'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Attendance Sheet */}
                {showSheet && students.length > 0 && (
                    <div className="space-y-6" id="attendance-print-area">
                        
                        {/* Print Header - Only visible when printing */}
                        <div className="hidden print:block mb-6 text-center">
                            <h1 className="text-3xl font-bold text-black mb-2">Attendance Sheet</h1>
                            <p className="text-xl font-semibold text-black">
                                {selectedClass} - Section {selectedSection}
                            </p>
                            <p className="text-lg text-black">
                                {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-base text-black mt-2">
                                Total Students: {students.length} | Total Days: {dates.length}
                            </p>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-white border border-gray-200 p-4 rounded no-print">
                            <div className="flex-1 min-w-[250px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by name or roll number..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <svg className="absolute left-3 top-3 w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-black">View:</label>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-sm' : 'text-black hover:bg-gray-200'}`}
                                        >
                                            Table
                                        </button>
                                        <button
                                            onClick={() => setViewMode('card')}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'card' ? 'bg-white text-blue-900 shadow-sm' : 'text-black hover:bg-gray-200'}`}
                                        >
                                            Card
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={printSheet}
                                        className="px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Print
                                    </button>
                                    <button
                                        onClick={downloadCSV}
                                        className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download CSV
                                    </button>
                                </div>
                            </div>
                            {/* <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-black">Total Absent</p>
                                        <p className="text-2xl font-bold text-black">{stats.totalAbsent}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </div>
                            </div> */}
                            {/* <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-black">Not Marked</p>
                                        <p className="text-2xl font-bold text-black">{stats.totalNotMarked}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div> */}
                        </div>


                        {/* Attendance Sheet */}
                        <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden shadow-xl">
                            <div className="bg-blue-900 text-white p-4 no-print">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold">
                                        {selectedClass} - Section {selectedSection} | {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    {/* Responsive counters: compact on mobile, full pills on sm+ */}
                                    <div className="flex items-center gap-2 text-sm">
                                        {/* Desktop / tablet: descriptive pills */}
                                        <div className="hidden sm:flex items-center gap-2">
                                            <span className="bg-white text-black bg-opacity-20 px-3 py-1 rounded-full min-w-[88px] text-center">
                                                {students.length} Students
                                            </span>
                                            <span className="bg-white text-black bg-opacity-20 px-3 py-1 rounded-full min-w-[68px] text-center">
                                                {dates.length} Days
                                            </span>
                                        </div>

                                        {/* Mobile: compact icon + number */}
                                        <div className="flex sm:hidden items-center gap-2">
                                            <span className="inline-flex items-center bg-white text-black bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                <svg className="w-4 h-4 mr-1 text-black opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                </svg>
                                                <span>{students.length}</span>
                                                <span className="sr-only"> students</span>
                                            </span>

                                            <span className="inline-flex items-center bg-white text-black bg-opacity-20 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                <svg className="w-4 h-4 mr-1 text-black opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                </svg>
                                                <span>{dates.length}</span>
                                                <span className="sr-only"> days</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {viewMode === 'table' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                <th className="hidden print:table-cell bg-gray-100 px-4 py-3 text-left text-xs font-bold text-black border-r-2 border-gray-300 min-w-[60px]">
                                                    S.No
                                                </th>
                                                <th className="hidden md:table-cell md:sticky md:left-0 md:z-10 bg-gray-100 pl-2 pr-1 py-3 text-left text-xs font-bold text-black border-r-2 border-gray-300 min-w-[100px] print:table-cell">
                                                    Roll No
                                                </th>
                                                <th className="sticky left-0 md:left-[100px] bg-gray-100 pl-2 pr-1 py-3 text-left text-xs font-bold text-black border-r-2 border-gray-300 z-20 min-w-[200px]">
                                                    Student Name
                                                </th>
                                                {dates.map((date) => {
                                                    const { day, weekday } = formatDate(date);
                                                    return (
                                                        <th key={date} className="px-2 py-2 text-center border-r border-gray-200 min-w-[80px] bg-gray-50">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-xs font-semibold text-black">{day}</span>
                                                                <span className="text-[10px] text-black">{weekday}</span>
                                                                <div className="flex gap-1 mt-1 no-print">
                                                                    <button
                                                                        onClick={() => markAllPresentForDate(date)}
                                                                        className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                                        title="Mark all present"
                                                                    >
                                                                        All ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={() => markAllAbsentForDate(date)}
                                                                        className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                                        title="Mark all absent"
                                                                    >
                                                                        All ✗
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredStudents.map((student, index) => {
                                                const studentStats = getStudentStats(student._id);
                                                return (
                                                <tr key={student._id} className="hover:bg-blue-50 transition-colors">
                                                    <td className="hidden print:table-cell bg-white px-4 py-3 text-sm text-black border-r-2 border-gray-300 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td className="hidden md:table-cell md:sticky md:left-0 md:z-10 bg-white pl-2 pr-1 py-3 text-sm font-semibold text-black border-r-2 border-gray-300 print:table-cell">
                                                        {student.rollNumber}
                                                    </td>
                                                    <td className="sticky left-0 md:left-[100px] bg-white pl-2 pr-1 py-3 border-r-2 border-gray-300 z-20 print:table-cell">
                                                        <div>
                                                            <div className="text-sm font-medium text-black">{student.name}</div>
                                                            <div className="hidden md:flex items-center gap-3 mt-1 text-xs no-print">
                                                                <span className="text-green-700 font-semibold">P: {studentStats.present}</span>
                                                                <span className="text-red-700 font-semibold">A: {studentStats.absent}</span>
                                                                <span className={`px-2 py-0.5 rounded-full font-bold ${
                                                                    parseFloat(studentStats.percentage) >= 75 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : parseFloat(studentStats.percentage) >= 50
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {studentStats.percentage}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {dates.map((date) => {
                                                        const status = attendanceSheet[student._id]?.[date];
                                                        return (
                                                            <td key={date} className="px-2 py-2 text-center border-r border-gray-200">
                                                                {/* Print-friendly status */}
                                                                <span className="hidden print:inline-block font-bold text-sm">
                                                                    {status === 'present' ? '✓' : status === 'absent' ? '✗' : '-'}
                                                                </span>
                                                                {/* Interactive buttons for screen */}
                                                                <div className="flex justify-center gap-1 print:hidden">
                                                                    <button
                                                                        onClick={() => markAttendance(student._id, date, 'present')}
                                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 ${
                                                                            status === 'present'
                                                                                ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-300'
                                                                                : 'bg-gray-100 text-black hover:bg-green-100 hover:text-green-600'
                                                                        }`}
                                                                        title="Mark present"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => markAttendance(student._id, date, 'absent')}
                                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 ${
                                                                            status === 'absent'
                                                                                ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-300'
                                                                                : 'bg-gray-100 text-black hover:bg-red-100 hover:text-red-600'
                                                                        }`}
                                                                        title="Mark absent"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )})}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-4 space-y-4">
                                    {filteredStudents.map((student, index) => {
                                        const studentStats = getStudentStats(student._id);
                                        return (
                                            <div key={student._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-bold text-blue-900">{index + 1}</span>
                                                        <div>
                                                            <h4 className="font-semibold text-black">{student.name}</h4>
                                                            <p className="text-sm text-black">Roll: {student.rollNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex gap-2 text-sm">
                                                            <span className="text-green-700 font-semibold">P: {studentStats.present}</span>
                                                            <span className="text-red-700 font-semibold">A: {studentStats.absent}</span>
                                                            <span className={`px-2 py-1 rounded-full font-bold text-xs ${
                                                                parseFloat(studentStats.percentage) >= 75 ? 'bg-green-100 text-green-800' : parseFloat(studentStats.percentage) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {studentStats.percentage}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto pb-2">
                                                    <div className="flex gap-3 min-w-max">
                                                        {dates.map((date) => {
                                                            const status = attendanceSheet[student._id]?.[date];
                                                            const { day, weekday } = formatDate(date);
                                                            return (
                                                                <div key={date} className="flex flex-col items-center min-w-[70px]">
                                                                    <div className="text-center mb-2">
                                                                        <span className="text-sm font-semibold text-black">{day}</span>
                                                                        <span className="text-xs text-black block">{weekday}</span>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => markAttendance(student._id, date, 'present')}
                                                                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 ${
                                                                                status === 'present' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 text-black hover:bg-green-100'
                                                                            }`}
                                                                            title="Present"
                                                                        >
                                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => markAttendance(student._id, date, 'absent')}
                                                                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all transform hover:scale-105 ${
                                                                                status === 'absent' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-black hover:bg-red-100'
                                                                            }`}
                                                                            title="Absent"
                                                                        >
                                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4 border-t-2 no-print">
                            <button
                                onClick={() => {
                                    setShowSheet(false);
                                    setShowHistory(true);
                                }}
                                className="px-6 py-3 bg-white border-2 border-gray-300 text-black rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to History
                            </button>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => {
                                        setShowSheet(false);
                                        setSelectedClass('');
                                        setSelectedSection('');
                                        setSearchQuery('');
                                    }}
                                    className="px-8 py-3 border-2 border-gray-300 text-black rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitAttendance}
                                    className="px-8 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 w-full sm:w-auto"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    <span>Save Attendance Sheet</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Saved Attendance History */}
                {!showSheet && showHistory && savedSheets.length > 0 && (
                    <div className="mt-8 no-print">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-black flex items-center gap-3">
                                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Attendance History
                            </h3>
                            <span className="text-sm text-black bg-blue-50 px-4 py-2 rounded-lg font-semibold">
                                {savedSheets.length} Sheet{savedSheets.length !== 1 ? 's' : ''} Found
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {savedSheets.map((sheet, idx) => {
                                const totalRecords = sheet.records.length;
                                const presentCount = sheet.records.filter(r => r.status === 'present').length;
                                const absentCount = sheet.records.filter(r => r.status === 'absent').length;
                                const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;
                                
                                return (
                                    <div 
                                        key={idx}
                                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                        onClick={() => loadSavedSheet(sheet)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-xl font-bold text-black mb-1 group-hover:text-blue-600 transition-colors">
                                                    {sheet.className} - Section {sheet.section}
                                                </h4>
                                                <p className="text-sm text-black font-medium">
                                                    {new Date(sheet.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <svg className="w-7 h-7 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-xs text-black font-medium mb-1">Present</p>
                                                <p className="text-2xl font-bold text-black">{presentCount}</p>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-xs text-black font-medium mb-1">Absent</p>
                                                <p className="text-2xl font-bold text-black">{absentCount}</p>
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                                <p className="text-xs text-black font-medium mb-1">Rate</p>
                                                <p className="text-2xl font-bold text-black">{attendanceRate}%</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t-2 border-blue-100">
                                            <span className="text-xs text-black">
                                                {new Date(sheet.lastUpdated).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <button className="text-sm font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                                                View & Edit
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {showSheet && students.length === 0 && (
                    <div className="text-center py-16 text-black no-print">
                        <svg className="w-32 h-32 mx-auto mb-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-xl font-semibold">No students found</p>
                        <p className="text-sm text-black mt-2">for {selectedClass} - Section {selectedSection}</p>
                    </div>
                )}

                {!showSheet && !showHistory && (
                    <div className="text-center py-16 no-print">
                        <svg className="w-32 h-32 mx-auto mb-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-2xl font-bold text-black mb-2">Select Class to Begin</h3>
                        <p className="text-black">Choose class, section, and month to load the attendance sheet</p>
                    </div>
                )}

                {!showSheet && showHistory && savedSheets.length === 0 && (
                    <div className="text-center py-16 no-print">
                        <svg className="w-32 h-32 mx-auto mb-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-black mb-2">No Attendance History Found</h3>
                        <p className="text-black mb-6">Start by creating your first attendance sheet above</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}