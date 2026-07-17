'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../../config/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ReportsPage = () => {
    // State management
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'yearly'
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    
    // Data states
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [fees, setFees] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [salaries, setSalaries] = useState([]);

    // KPI stats
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        attendanceRate: 0,
        passRate: 0,
        certificatesIssued: 0,
        pendingFees: 0
    });

    // Fetch all data
    useEffect(() => {
        fetchAllData();
    }, [selectedYear, selectedMonth, timeFilter]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Fetch all collections in parallel
            const [
                studentsRes,
                teachersRes,
                attendanceRes,
                feesRes,
                certificatesRes,
                examsRes,
                resultsRes,
                assignmentsRes,
                expensesRes,
                salariesRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/students`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/teachers`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/attendance`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/fees`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/certificates`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/exams`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/results`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/assignments`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/expenses`).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
                fetch(`${API_BASE_URL}/salaries`).catch(() => ({ json: async () => ({ success: false, data: [] }) }))
            ]);

            const studentsData = await studentsRes.json();
            const teachersData = await teachersRes.json();
            const attendanceData = await attendanceRes.json();
            const feesData = await feesRes.json();
            const certificatesData = await certificatesRes.json();
            const examsData = await examsRes.json();
            const resultsData = await resultsRes.json();
            const assignmentsData = await assignmentsRes.json();
            const expensesData = await expensesRes.json();
            const salariesData = await salariesRes.json();

            setStudents(studentsData.success ? studentsData.data : []);
            setTeachers(teachersData.success ? teachersData.data : []);
            setAttendance(attendanceData.success ? attendanceData.data : []);
            setFees(feesData.success ? feesData.data : []);
            setCertificates(certificatesData.success ? certificatesData.data : []);
            setExams(examsData.success ? examsData.data : []);
            setResults(resultsData.success ? resultsData.data : []);
            setAssignments(assignmentsData.success ? assignmentsData.data : []);
            setExpenses(expensesData.success ? expensesData.data : []);
            setSalaries(salariesData.success ? salariesData.data : []);

            // Calculate KPIs
            calculateStats(
                studentsData.success ? studentsData.data : [],
                teachersData.success ? teachersData.data : [],
                attendanceData.success ? attendanceData.data : [],
                feesData.success ? feesData.data : [],
                certificatesData.success ? certificatesData.data : [],
                resultsData.success ? resultsData.data : [],
                expensesData.success ? expensesData.data : []
            );

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (students, teachers, attendance, fees, certificates, results, expenses) => {
        // Total students and teachers
        const totalStudents = students.length;
        const totalTeachers = teachers.length;

        // Total revenue from fees
        const totalRevenue = fees.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);

        // Total expenses
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        // Attendance rate
        const presentCount = attendance.filter(att => att.status === 'present').length;
        const attendanceRate = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : 0;

        // Pass rate
        const passCount = results.filter(result => result.status === 'Pass' || result.grade !== 'Fail').length;
        const passRate = results.length > 0 ? ((passCount / results.length) * 100).toFixed(1) : 0;

        // Certificates issued
        const certificatesIssued = certificates.length;

        // Pending fees
        const pendingFees = fees.reduce((sum, fee) => {
            const pending = (fee.totalAmount || 0) - (fee.amountPaid || 0);
            return sum + (pending > 0 ? pending : 0);
        }, 0);

        setStats({
            totalStudents,
            totalTeachers,
            totalRevenue,
            totalExpenses,
            attendanceRate,
            passRate,
            certificatesIssued,
            pendingFees
        });
    };

    // Student enrollment chart data
    const getStudentEnrollmentData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const enrollmentByMonth = new Array(12).fill(0);

        students.forEach(student => {
            if (student.admissionDate) {
                const date = new Date(student.admissionDate);
                if (date.getFullYear() === selectedYear) {
                    enrollmentByMonth[date.getMonth()]++;
                }
            }
        });

        return {
            labels: months,
            datasets: [{
                label: 'Student Enrollments',
                data: enrollmentByMonth,
                borderColor: 'rgb(30, 58, 138)', // Dark blue
                backgroundColor: 'rgba(30, 58, 138, 0.1)', // Light blue
                fill: true,
                tension: 0.4
            }]
        };
    };

    // Attendance chart data
    const getAttendanceData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const presentByMonth = new Array(12).fill(0);
        const absentByMonth = new Array(12).fill(0);

        attendance.forEach(att => {
            if (att.date) {
                const date = new Date(att.date);
                if (date.getFullYear() === selectedYear) {
                    const monthIndex = date.getMonth();
                    if (att.status === 'present') {
                        presentByMonth[monthIndex]++;
                    } else if (att.status === 'absent') {
                        absentByMonth[monthIndex]++;
                    }
                }
            }
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Present',
                    data: presentByMonth,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)', // Keep green for positive
                },
                {
                    label: 'Absent',
                    data: absentByMonth,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)', // Keep red for negative
                }
            ]
        };
    };

    // Fee collection chart data
    const getFeeCollectionData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const collectionByMonth = new Array(12).fill(0);

        fees.forEach(fee => {
            if (fee.paymentDate) {
                const date = new Date(fee.paymentDate);
                if (date.getFullYear() === selectedYear) {
                    collectionByMonth[date.getMonth()] += fee.amountPaid || 0;
                }
            }
        });

        return {
            labels: months,
            datasets: [{
                label: 'Fee Collection (৳)',
                data: collectionByMonth,
                backgroundColor: 'rgba(30, 58, 138, 0.8)', // Dark blue
                borderColor: 'rgb(30, 58, 138)',
                borderWidth: 1
            }]
        };
    };

    // Students by class pie chart
    const getStudentsByClassData = () => {
        const classCounts = {};
        
        students.forEach(student => {
            const className = student.class || 'Unknown';
            classCounts[className] = (classCounts[className] || 0) + 1;
        });

        const labels = Object.keys(classCounts);
        const data = Object.values(classCounts);

        return {
            labels,
            datasets: [{
                label: 'Students',
                data,
                backgroundColor: [
                    'rgba(30, 58, 138, 0.8)', // Dark blue
                    'rgba(75, 85, 99, 0.8)', // Gray
                    'rgba(55, 65, 81, 0.8)', // Darker gray
                    'rgba(31, 41, 55, 0.8)', // Even darker gray
                    'rgba(17, 24, 39, 0.8)', // Darkest gray
                    'rgba(107, 114, 128, 0.8)', // Light gray
                    'rgba(156, 163, 175, 0.8)', // Lighter gray
                    'rgba(209, 213, 219, 0.8)', // Very light gray
                    'rgba(229, 231, 235, 0.8)', // Lightest gray
                    'rgba(243, 244, 246, 0.8)', // Almost white gray
                    'rgba(249, 250, 251, 0.8)', // Very light gray
                    'rgba(30, 58, 138, 0.6)' // Lighter blue
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };
    };

    // Exam results distribution
    const getExamResultsData = () => {
        const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'Fail'];
        const gradeCounts = new Array(8).fill(0);

        results.forEach(result => {
            const gradeIndex = grades.indexOf(result.grade);
            if (gradeIndex !== -1) {
                gradeCounts[gradeIndex]++;
            }
        });

        return {
            labels: grades,
            datasets: [{
                label: 'Number of Students',
                data: gradeCounts,
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)', // Green for A+
                    'rgba(59, 130, 246, 0.8)', // Blue for A
                    'rgba(139, 92, 246, 0.8)', // Purple for B+
                    'rgba(236, 72, 153, 0.8)', // Pink for B
                    'rgba(251, 146, 60, 0.8)', // Orange for C+
                    'rgba(251, 191, 36, 0.8)', // Yellow for C
                    'rgba(156, 163, 175, 0.8)', // Gray for D
                    'rgba(239, 68, 68, 0.8)' // Red for Fail
                ]
            }]
        };
    };

    // Certificate types distribution
    const getCertificateTypesData = () => {
        const typeCounts = {};
        
        certificates.forEach(cert => {
            const type = cert.certificateType || 'Other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        return {
            labels: Object.keys(typeCounts),
            datasets: [{
                label: 'Certificates',
                data: Object.values(typeCounts),
                backgroundColor: [
                    'rgba(30, 58, 138, 0.8)', // Dark blue
                    'rgba(75, 85, 99, 0.8)', // Gray
                    'rgba(236, 72, 153, 0.8)', // Pink
                    'rgba(251, 146, 60, 0.8)', // Orange
                    'rgba(34, 197, 94, 0.8)', // Green
                    'rgba(139, 92, 246, 0.8)' // Purple
                ]
            }]
        };
    };

    // Revenue vs Expenses
    const getRevenueExpenseData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueByMonth = new Array(12).fill(0);
        const expensesByMonth = new Array(12).fill(0);

        fees.forEach(fee => {
            if (fee.paymentDate) {
                const date = new Date(fee.paymentDate);
                if (date.getFullYear() === selectedYear) {
                    revenueByMonth[date.getMonth()] += fee.amountPaid || 0;
                }
            }
        });

        expenses.forEach(expense => {
            if (expense.date) {
                const date = new Date(expense.date);
                if (date.getFullYear() === selectedYear) {
                    expensesByMonth[date.getMonth()] += expense.amount || 0;
                }
            }
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Revenue (৳)',
                    data: revenueByMonth,
                    borderColor: 'rgb(34, 197, 94)', // Green for revenue
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses (৳)',
                    data: expensesByMonth,
                    borderColor: 'rgb(239, 68, 68)', // Red for expenses
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 border-4 border-[#1a202c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm sm:text-lg text-gray-600">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto p-2 sm:p-4 lg:p-6">
                {/* Header */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Analytics Dashboard</h1>
                            <p className="text-sm sm:text-base text-gray-600">Comprehensive school performance analytics and insights</p>
                        </div>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent bg-white text-sm"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent bg-white text-sm"
                        >
                            {[2024, 2025, 2026, 2027].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <button
                            onClick={fetchAllData}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-[#1a202c] text-white rounded-lg hover:bg-[#2d3748] transition-colors text-sm"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                    </div>
                </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">👨‍🎓</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Total</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalStudents}</h3>
                    <p className="text-sm sm:text-base text-gray-600">Total Students</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">👨‍🏫</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Staff</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalTeachers}</h3>
                    <p className="text-sm sm:text-base text-gray-600">Total Teachers</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">💰</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Revenue</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">৳{stats.totalRevenue.toLocaleString()}</h3>
                    <p className="text-sm sm:text-base text-gray-600">Total Collection</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">📊</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Rate</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.attendanceRate}%</h3>
                    <p className="text-sm sm:text-base text-gray-600">Attendance Rate</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">🎓</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Achievement</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.certificatesIssued}</h3>
                    <p className="text-sm sm:text-base text-gray-600">Certificates Issued</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">✅</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Academic</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.passRate}%</h3>
                    <p className="text-sm sm:text-base text-gray-600">Pass Rate</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">💳</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Pending</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">৳{stats.pendingFees.toLocaleString()}</h3>
                    <p className="text-sm sm:text-base text-gray-600">Pending Fees</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">💸</span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 rounded-full">Expenses</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">৳{stats.totalExpenses.toLocaleString()}</h3>
                    <p className="text-sm sm:text-base text-gray-600">Total Expenses</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Student Enrollment Trend */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">📈 Student Enrollment Trend</h2>
                        <span className="text-xs sm:text-sm text-gray-500">{selectedYear}</span>
                    </div>
                    <div style={{ height: '250px' }} className="sm:h-[300px]">
                        <Line data={getStudentEnrollmentData()} options={chartOptions} />
                    </div>
                </div>

                {/* Attendance Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">📊 Attendance Overview</h2>
                        <span className="text-xs sm:text-sm text-gray-500">{selectedYear}</span>
                    </div>
                    <div style={{ height: '250px' }} className="sm:h-[300px]">
                        <Bar data={getAttendanceData()} options={chartOptions} />
                    </div>
                </div>

                {/* Fee Collection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">💰 Fee Collection Trend</h2>
                        <span className="text-xs sm:text-sm text-gray-500">{selectedYear}</span>
                    </div>
                    <div style={{ height: '250px' }} className="sm:h-[300px]">
                        <Bar data={getFeeCollectionData()} options={chartOptions} />
                    </div>
                </div>

                {/* Revenue vs Expenses */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">📉 Revenue vs Expenses</h2>
                        <span className="text-xs sm:text-sm text-gray-500">{selectedYear}</span>
                    </div>
                    <div style={{ height: '250px' }} className="sm:h-[300px]">
                        <Line data={getRevenueExpenseData()} options={chartOptions} />
                    </div>
                </div>

                {/* Students by Class */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">🎯 Students by Class</h2>
                        <span className="text-xs sm:text-sm text-gray-500">Distribution</span>
                    </div>
                    <div style={{ height: '250px' }} className="sm:h-[300px]">
                        <Pie data={getStudentsByClassData()} options={pieChartOptions} />
                    </div>
                </div>

                {/* Exam Results Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">🏆 Exam Results Distribution</h2>
                        <span className="text-xs sm:text-sm text-gray-500">Grades</span>
                    </div>
                    <div style={{ height: '250px' }} className="sm:h-[300px]">
                        <Doughnut data={getExamResultsData()} options={pieChartOptions} />
                    </div>
                </div>

                {/* Certificate Types */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">🎓 Certificate Types</h2>
                        <span className="text-xs sm:text-sm text-gray-500">Issued</span>
                    </div>
                    <div style={{ height: '250px' }} className="sm:h-[300px]">
                        <Doughnut data={getCertificateTypesData()} options={pieChartOptions} />
                    </div>
                </div>

                {/* Summary Statistics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">📋 Quick Statistics</h2>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700">Total Exams Conducted</span>
                            <span className="font-bold text-base sm:text-lg text-gray-900">{exams.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700">Total Assignments</span>
                            <span className="font-bold text-base sm:text-lg text-gray-900">{assignments.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700">Attendance Records</span>
                            <span className="font-bold text-base sm:text-lg text-gray-900">{attendance.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700">Fee Transactions</span>
                            <span className="font-bold text-base sm:text-lg text-gray-900">{fees.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs sm:text-sm text-gray-700">Net Profit</span>
                            <span className={`font-bold text-base sm:text-lg ${(stats.totalRevenue - stats.totalExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ৳{(stats.totalRevenue - stats.totalExpenses).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center">
                <p className="text-sm sm:text-base text-gray-600">
                    <span className="font-semibold text-gray-900">Last Updated:</span> {new Date().toLocaleString()} |
                    <span className="ml-1 sm:ml-2 font-semibold text-gray-900">Data Period:</span> {selectedYear} |
                    <span className="ml-1 sm:ml-2 font-semibold text-gray-900">View:</span> {timeFilter}
                </p>
            </div>
        </div>
    </div>
    );
};

export default ReportsPage;