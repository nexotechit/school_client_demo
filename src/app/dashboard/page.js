'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../../../config/api';
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
import { Doughnut, Bar, Line } from 'react-chartjs-2';

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

export default function DashboardOverview() {
    const router = useRouter();
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        notices: 0,
        classes: 12
    });
    const [recentStudents, setRecentStudents] = useState([]);
    const [recentTeachers, setRecentTeachers] = useState([]);
    const [recentNotices, setRecentNotices] = useState([]);
    const [chartData, setChartData] = useState({
        students: { boys: 45, girls: 55 },
        attendance: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            present: [60, 70, 85, 65, 60],
            absent: [50, 60, 75, 70, 55]
        },
        finance: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            income: [1800, 2200, 1900, 2700, 2300, 3500, 2500, 3000, 2200, 3200],
            expense: [2500, 1900, 2200, 1800, 3200, 2900, 2000, 1800, 2400, 1800]
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch students
            const studentsRes = await fetch(`${API_URL}/api/students`, { cache: 'no-store' });
            const studentsResponse = await studentsRes.json();

            // Fetch teachers
            const teachersRes = await fetch(`${API_URL}/api/teachers`, { cache: 'no-store' });
            const teachersResponse = await teachersRes.json();

            // Fetch notices
            const noticesRes = await fetch(`${API_URL}/api/notices`, { cache: 'no-store' });
            const noticesResponse = await noticesRes.json();

            // Extract data and counts from API responses
            const students = studentsResponse.data || [];
            const teachers = teachersResponse.data || [];
            const notices = noticesResponse.data || [];

            // Update stats using count from server
            const totalStudents = studentsResponse.count || 0;
            setStats({
                students: totalStudents,
                teachers: teachersResponse.count || 0,
                notices: noticesResponse.count || 0,
                classes: 12
            });

            // Calculate dynamic chart data
            const boys = Math.floor(totalStudents * 0.45) || 45;
            const girls = totalStudents - boys || 55;
            
            let attendanceChart = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                present: [60, 70, 85, 65, 60],
                absent: [50, 60, 75, 70, 55]
            };
            
            try {
                const attRes = await fetch(`${API_URL}/api/attendance`, { cache: 'no-store' });
                const attData = await attRes.json();
                if (attData.success && attData.data && attData.data.length > 0) {
                    const grouped = {};
                    attData.data.forEach(record => {
                        const dateStr = record.date;
                        if (!grouped[dateStr]) grouped[dateStr] = { present: 0, absent: 0 };
                        if (record.status === 'Present') grouped[dateStr].present++;
                        else if (record.status === 'Absent') grouped[dateStr].absent++;
                        else {
                           grouped[dateStr].present += record.totalPresent || 0;
                           grouped[dateStr].absent += record.totalAbsent || 0;
                        }
                    });
                    
                    const sortedDates = Object.keys(grouped).sort().slice(-5);
                    if (sortedDates.length > 0) {
                        attendanceChart.labels = sortedDates.map(d => new Date(d).toLocaleDateString('en-US', {weekday: 'short'}));
                        attendanceChart.present = sortedDates.map(d => grouped[d].present);
                        attendanceChart.absent = sortedDates.map(d => grouped[d].absent);
                    }
                }
            } catch (e) {
                console.error("Error fetching attendance for charts", e);
            }
            
            let financeChart = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                income: [1800, 2200, 1900, 2700, 2300, 3500, 2500, 3000, 2200, 3200],
                expense: [2500, 1900, 2200, 1800, 3200, 2900, 2000, 1800, 2400, 1800]
            };
            
            try {
                const [feesRes, expRes] = await Promise.all([
                    fetch(`${API_URL}/api/fees`, { cache: 'no-store' }),
                    fetch(`${API_URL}/api/expenses`, { cache: 'no-store' })
                ]);
                const feesData = await feesRes.json();
                const expData = await expRes.json();
                
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthlyData = {};
                for(let i = 0; i < 12; i++) monthlyData[i] = { inc: 0, exp: 0 };
                
                if (feesData.success && feesData.data) {
                    feesData.data.forEach(f => {
                        const date = new Date(f.paymentDate || f.createdAt);
                        if (date.getFullYear() === new Date().getFullYear()) {
                            monthlyData[date.getMonth()].inc += Number(f.amount) || 0;
                        }
                    });
                }
                
                if (expData.success && expData.data) {
                    expData.data.forEach(e => {
                        const date = new Date(e.date || e.createdAt);
                        if (date.getFullYear() === new Date().getFullYear()) {
                            monthlyData[date.getMonth()].exp += Number(e.amount) || 0;
                        }
                    });
                }
                
                const currentMonth = new Date().getMonth();
                const labels = [];
                const income = [];
                const expense = [];
                
                const startMonth = Math.max(0, currentMonth - 9); // Show up to 10 months
                for (let i = startMonth; i <= currentMonth; i++) {
                    labels.push(monthNames[i]);
                    income.push(monthlyData[i].inc);
                    expense.push(monthlyData[i].exp);
                }
                
                if (labels.length > 0) {
                    financeChart = { labels, income, expense };
                }
            } catch (e) {
                console.error("Error fetching finance data for charts", e);
            }
            
            setChartData({
                students: { boys, girls },
                attendance: attendanceChart,
                finance: financeChart
            });

            // Set recent students (last 5)
            setRecentStudents(students.slice(-5).reverse());

            // Set recent teachers (last 5)
            setRecentTeachers(teachers.slice(-5).reverse());

            // Set recent notices (last 5)
            setRecentNotices(notices.slice(-5).reverse());

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };


    const quickActions = [
        {
            title: 'Add Student',
            description: 'Register new student',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            action: () => router.push('/dashboard/students')
        },
        {
            title: 'Add Teacher',
            description: 'Register new teacher',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            action: () => router.push('/dashboard/teachers')
        },
        {
            title: 'Post Notice',
            description: 'Create announcement',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
            action: () => router.push('/dashboard/settings/notices')
        },
        {
            title: 'Attendance',
            description: 'Mark attendance',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            action: () => router.push('/dashboard/attendance')
        },
        {
            title: 'Exams',
            description: 'Manage examinations',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            action: () => router.push('/dashboard/exams')
        },
        {
            title: 'Reports',
            description: 'View analytics',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            action: () => router.push('/dashboard/reports')
        },
        {
            title: 'Fees',
            description: 'Manage payments',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            action: () => router.push('/dashboard/fees')
        },
        {
            title: 'Certificates',
            description: 'Generate certificates',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            ),
            action: () => router.push('/dashboard/certificates')
        },
        {
            title: 'Settings',
            description: 'System configuration',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            action: () => router.push('/dashboard/settings')
        }
    ];

    // Chart Data
    const studentChartData = {
        labels: ['Boys', 'Girls'],
        datasets: [{
            data: [chartData.students.boys, chartData.students.girls],
            backgroundColor: ['#BEE3F8', '#FDE68A'],
            borderWidth: 0,
            cutout: '75%',
        }]
    };
    const studentChartOptions = {
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: false,
    };

    const attendanceChartData = {
        labels: chartData.attendance.labels,
        datasets: [
            {
                label: 'Present',
                data: chartData.attendance.present,
                backgroundColor: '#CFC8FF',
                borderRadius: 4,
                barThickness: 12,
            },
            {
                label: 'Absent',
                data: chartData.attendance.absent,
                backgroundColor: '#FDE68A',
                borderRadius: 4,
                barThickness: 12,
            }
        ]
    };
    const attendanceChartOptions = {
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, max: 100, border: { dash: [4, 4], display: false }, grid: { color: '#F3F4F6', drawBorder: false } },
            x: { grid: { display: false }, border: { display: false } }
        },
        maintainAspectRatio: false,
    };

    const financeChartData = {
        labels: chartData.finance.labels,
        datasets: [
            {
                label: 'Income',
                data: chartData.finance.income,
                borderColor: '#BEE3F8',
                backgroundColor: 'rgba(190, 227, 248, 0.2)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
            },
            {
                label: 'Expense',
                data: chartData.finance.expense,
                borderColor: '#CFC8FF',
                backgroundColor: 'rgba(207, 200, 255, 0.2)',
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                fill: false,
            }
        ]
    };
    const financeChartOptions = {
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, border: { dash: [4, 4], display: false }, grid: { color: '#F3F4F6' } },
            x: { grid: { display: false }, border: { display: false }, ticks: { display: false } }
        },
        maintainAspectRatio: false,
    };

    const renderCalendar = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDate = today.getDate();
        
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const dates = [];
        let week = [];
        
        // previous month days
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = 0; i < firstDay; i++) {
            week.push({ day: prevMonthDays - firstDay + i + 1, isCurrentMonth: false });
        }
        
        // current month days
        for (let i = 1; i <= daysInMonth; i++) {
            week.push({ day: i, isCurrentMonth: true, isToday: i === currentDate });
            if (week.length === 7) {
                dates.push(week);
                week = [];
            }
        }
        
        // next month days
        if (week.length > 0) {
            let nextMonthDay = 1;
            while (week.length < 7) {
                week.push({ day: nextMonthDay++, isCurrentMonth: false });
            }
            dates.push(week);
        }
        
        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-4 px-2">
                    <button className="text-gray-400 hover:text-gray-600">«</button>
                    <button className="text-gray-400 hover:text-gray-600">‹</button>
                    <h3 className="font-semibold text-[#374151]">{monthNames[currentMonth]} {currentYear}</h3>
                    <button className="text-gray-400 hover:text-gray-600">›</button>
                    <button className="text-gray-400 hover:text-gray-600">»</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {days.map(d => (
                        <div key={d} className="text-[10px] font-bold text-[#374151]">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {dates.map((week, i) => week.map((dateObj, j) => {
                        const isWeekend = j === 0 || j === 6; // SUN or SAT
                        return (
                            <div key={`${i}-${j}`}
                                className={`py-1.5 text-xs sm:text-sm rounded-lg ${dateObj.isToday ? 'bg-[#BEE3F8] text-[#374151] font-bold'
                                        : !dateObj.isCurrentMonth ? 'text-gray-300'
                                            : isWeekend ? 'text-red-400'
                                                : 'text-gray-600 hover:bg-gray-50 cursor-pointer'
                                    }`}>
                                {dateObj.day}
                            </div>
                        );
                    }))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] p-4 sm:p-6 lg:p-8">
            {/* Welcome Header */}
            <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#374151] mb-2">
                    Welcome to Dashboard! 👋
                </h2>
                <p className="text-[#6B7280] text-sm sm:text-base">Here's what's happening in your school today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Total Students */}
                <div className="bg-[#CFC8FF] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#374151] text-xs font-medium bg-white/40 px-2 py-1 rounded-full">2024/25</span>
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#374151] mb-1">
                                {loading ? '...' : stats.students}
                            </h3>
                            <p className="text-[#374151]/80 text-sm font-medium">Students</p>
                        </div>
                    </div>
                </div>

                {/* Total Teachers */}
                <div className="bg-[#FDE68A] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#374151] text-xs font-medium bg-white/40 px-2 py-1 rounded-full">2024/25</span>
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#374151] mb-1">
                                {loading ? '...' : stats.teachers}
                            </h3>
                            <p className="text-[#374151]/80 text-sm font-medium">Teachers</p>
                        </div>
                    </div>
                </div>

                {/* Active Notices */}
                <div className="bg-[#BEE3F8] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#374151] text-xs font-medium bg-white/40 px-2 py-1 rounded-full">2024/25</span>
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#374151] mb-1">
                                {loading ? '...' : stats.notices}
                            </h3>
                            <p className="text-[#374151]/80 text-sm font-medium">Notices</p>
                        </div>
                    </div>
                </div>

                {/* Total Classes */}
                <div className="bg-[#DFF4FF] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#374151] text-xs font-medium bg-white/40 px-2 py-1 rounded-full">2024/25</span>
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#374151] mb-1">
                                {stats.classes}
                            </h3>
                            <p className="text-[#374151]/80 text-sm font-medium">Classes</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {/* Left side column (Charts & Quick Actions) */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Quick Actions */}
                    <div className="hidden bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#374151]">Quick Actions</h2>
                            <div className="h-1 flex-1 bg-gradient-to-r from-[#CFC8FF] to-transparent sm:ml-4 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className="group flex items-center gap-3 p-3 sm:p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:bg-[#F3F4F6] hover:border-[#CFC8FF] transition-all duration-300 text-left shadow-sm hover:shadow"
                                >
                                    <div className="bg-[#F5F5F7] group-hover:bg-[#CFC8FF] rounded-xl p-2 sm:p-3 transition-colors duration-300 flex-shrink-0">
                                        <div className="text-[#6B7280] group-hover:text-[#374151] transition-colors duration-300">
                                            {action.icon}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-[#374151] text-sm sm:text-base">
                                            {action.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-[#6B7280]">
                                            {action.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {/* Students Chart */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-[#374151]">Students</h3>
                                <button className="text-gray-400 hover:text-gray-600">•••</button>
                            </div>
                            <div className="relative flex-1 min-h-[200px] flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <div className="flex gap-2 text-xl text-[#BEE3F8]">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        <span className="text-[#FDE68A]">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-full relative z-10">
                                    <Doughnut data={studentChartData} options={studentChartOptions} />
                                </div>
                            </div>
                            <div className="flex justify-center gap-8 mt-4">
                                <div className="text-center">
                                    <p className="font-bold text-[#374151]">{chartData.students.boys}</p>
                                    <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                                        <div className="w-2 h-2 rounded-full bg-[#BEE3F8]"></div>
                                        Boys ({Math.round(chartData.students.boys / (chartData.students.boys + chartData.students.girls) * 100) || 0}%)
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-[#374151]">{chartData.students.girls}</p>
                                    <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                                        <div className="w-2 h-2 rounded-full bg-[#FDE68A]"></div>
                                        Girls ({Math.round(chartData.students.girls / (chartData.students.boys + chartData.students.girls) * 100) || 0}%)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Chart */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-[#374151]">Attendance</h3>
                                <button className="text-gray-400 hover:text-gray-600">•••</button>
                            </div>
                            <div className="flex items-center gap-4 mb-4 text-xs font-medium text-[#6B7280]">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#CFC8FF]"></div>present</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FDE68A]"></div>absent</div>
                            </div>
                            <div className="flex-1 min-h-[200px]">
                                <Bar data={attendanceChartData} options={attendanceChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Finance Chart */}
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[#374151]">Finance</h3>
                            <button className="text-gray-400 hover:text-gray-600">•••</button>
                        </div>
                        <div className="flex justify-center gap-6 mb-4 text-xs font-medium text-[#6B7280]">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border-2 border-[#BEE3F8]"></div>income</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full border-2 border-[#CFC8FF]"></div>expense</div>
                        </div>
                        <div className="w-full h-[250px]">
                            <Line data={financeChartData} options={financeChartOptions} />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {/* Recent Students */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-[#374151]">Recent Students</h2>
                                <button
                                    onClick={() => router.push('/dashboard/students')}
                                    className="text-xs sm:text-sm text-[#6B7280] hover:text-[#374151] font-medium whitespace-nowrap transition-colors"
                                >
                                    View All →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-6 sm:py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#CFC8FF] mx-auto"></div>
                                    </div>
                                ) : recentStudents.length > 0 ? (
                                    recentStudents.map((student, index) => (
                                        <div
                                            key={student._id || index}
                                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F5F5F7] rounded-2xl hover:bg-[#F3F4F6] transition-colors duration-200 border border-[#E5E7EB]"
                                        >
                                            <div className="relative flex-shrink-0">
                                                {student.imageUrl ? (
                                                    <img
                                                        src={student.imageUrl}
                                                        alt={student.name}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#BEE3F8] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                        <span className="text-[#374151] font-bold text-sm sm:text-lg">
                                                            {student.name?.charAt(0).toUpperCase() || 'S'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-[#374151] text-sm sm:text-base truncate">{student.name}</h3>
                                                <p className="text-xs sm:text-sm text-[#6B7280] truncate">
                                                    Class {student.class} • Roll: {student.rollNumber}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#DFF4FF] text-[#374151]">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-[#6B7280] py-8 sm:py-12">
                                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#E5E7EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <p className="font-medium text-sm sm:text-base">No students registered yet</p>
                                        <p className="text-xs sm:text-sm mt-1">Add your first student to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Teachers */}
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-[#374151]">Recent Teachers</h2>
                                <button
                                    onClick={() => router.push('/dashboard/teachers')}
                                    className="text-xs sm:text-sm text-[#6B7280] hover:text-[#374151] font-medium whitespace-nowrap transition-colors"
                                >
                                    View All →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-6 sm:py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#FDE68A] mx-auto"></div>
                                    </div>
                                ) : recentTeachers.length > 0 ? (
                                    recentTeachers.map((teacher, index) => (
                                        <div
                                            key={teacher._id || index}
                                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F5F5F7] rounded-2xl hover:bg-[#F3F4F6] transition-colors duration-200 border border-[#E5E7EB]"
                                        >
                                            <div className="relative flex-shrink-0">
                                                {teacher.imageUrl ? (
                                                    <img
                                                        src={teacher.imageUrl}
                                                        alt={teacher.name}
                                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FDE68A] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                        <span className="text-[#374151] font-bold text-sm sm:text-lg">
                                                            {teacher.name?.charAt(0).toUpperCase() || 'T'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-[#374151] text-sm sm:text-base truncate">{teacher.name}</h3>
                                                <p className="text-xs sm:text-sm text-[#6B7280] truncate">
                                                    {teacher.subject} • {teacher.qualification}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#CFC8FF] text-[#374151]">
                                                    {teacher.employeeId}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-[#6B7280] py-8 sm:py-12">
                                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#E5E7EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p className="font-medium text-sm sm:text-base">No teachers registered yet</p>
                                        <p className="text-xs sm:text-sm mt-1">Add your first teacher to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side column (Calendar & Events) */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Calendar */}
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm">
                        {renderCalendar()}
                    </div>

                    {/* Notices */}
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[#374151]">Notices</h3>
                            <button
                                onClick={() => router.push('/dashboard/settings/notices')}
                                className="text-xs text-[#6B7280] hover:text-[#374151]"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#BEE3F8] mx-auto"></div>
                                </div>
                            ) : recentNotices.length > 0 ? (
                                recentNotices.map((notice, index) => {
                                    const colors = ['#FDE68A', '#CFC8FF', '#BEE3F8'];
                                    const borderColor = colors[index % colors.length];
                                    return (
                                        <div key={notice._id || index} className="border-t border-[#E5E7EB] pt-4 border-l-2 pl-3 -ml-3" style={{ borderLeftColor: borderColor }}>
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-semibold text-[#374151] text-sm">{notice.title}</h4>
                                                <span className="text-xs text-[#6B7280]">{new Date(notice.createdAt || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-[#6B7280] line-clamp-2">{notice.description || notice.content}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-[#6B7280] py-4">
                                    <p className="text-xs">No notices available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[#374151]">Announcements</h3>
                            <button className="text-xs text-[#6B7280] hover:text-[#374151]">View All</button>
                        </div>
                        <div className="bg-[#DFF4FF] rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-semibold text-[#374151] text-sm">Picture Day Reminder</h4>
                                <span className="text-xs text-[#6B7280]">16/09/2024</span>
                            </div>
                            <p className="text-xs text-[#374151]/80 leading-relaxed">School Picture Day is tomorrow! Don't forget to wear your full uniform and bring your best smile.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
