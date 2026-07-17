'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config/api';
import Swal from 'sweetalert2';

export default function ExamManagement() {
    const [activeTab, setActiveTab] = useState('setup'); // setup, schedule, marks, list
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [scheduleViewMode, setScheduleViewMode] = useState('edit'); // 'edit' or 'view'

    // Exam Setup State
    const [examSetup, setExamSetup] = useState({
        examName: '',
        examType: 'Mid Term',
        academicYear: new Date().getFullYear().toString(),
        class: '',
        section: '',
        examCategory: 'Written',
        totalMarks: '',
        passMarks: '',
        startDate: '',
        endDate: '',
        status: 'Draft'
    });

    // Subject Schedule State
    const [subjects, setSubjects] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);

    // Mark Distribution State
    const [markDistribution, setMarkDistribution] = useState({
        examId: '',
        subject: '',
        written: '',
        mcq: '',
        practical: '',
        viva: '',
        isOptional: false
    });

    const [gradeSystem, setGradeSystem] = useState([
        { grade: 'A+', minMarks: 80, maxMarks: 100 },
        { grade: 'A', minMarks: 70, maxMarks: 79 },
        { grade: 'A-', minMarks: 60, maxMarks: 69 },
        { grade: 'B', minMarks: 50, maxMarks: 59 },
        { grade: 'C', minMarks: 40, maxMarks: 49 },
        { grade: 'D', minMarks: 33, maxMarks: 39 },
        { grade: 'F', minMarks: 0, maxMarks: 32 }
    ]);

    useEffect(() => {
        fetchExams();
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (selectedExam) {
            fetchExamDetails(selectedExam);
        } else {
            setSubjects([]); // Clear subjects when no exam selected
        }
    }, [selectedExam]);

    const fetchExams = async () => {
        try {
            const response = await fetch(`${API_URL}/api/exams`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setExams(data.data);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
            // Don't show error on initial load, just log it
            if (error.message !== 'Failed to fetch') {
                Swal.fire({
                    icon: 'error',
                    title: 'Connection Error',
                    text: 'Unable to connect to server. Please make sure the server is running.',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/teachers`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setTeachers(data.data);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            // Silently fail - teachers are optional for initial setup
        }
    };

    const fetchExamDetails = async (examId) => {
        try {
            const response = await fetch(`${API_URL}/api/exams/${examId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                // Add id to each subject for local management
                const subjectsWithIds = data.data.subjects.map((subject, index) => ({
                    ...subject,
                    id: subject._id || `existing-${index}-${Date.now()}`, // Use _id if available, else generate
                    examDate: subject.examDate ? new Date(subject.examDate).toISOString().split('T')[0] : '' // Format date for input
                }));
                setSubjects(subjectsWithIds);
            }
        } catch (error) {
            console.error('Error fetching exam details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load exam schedule details.',
                customClass: { container: 'swal-high-z-index' }
            });
        }
    };

    const handleExamSetupSubmit = async (e) => {
        e.preventDefault();
        
        // Check all required fields
        if (!examSetup.examName || !examSetup.class || !examSetup.section || 
            !examSetup.academicYear || !examSetup.examCategory || 
            !examSetup.totalMarks || !examSetup.passMarks || 
            !examSetup.startDate || !examSetup.endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please fill all required fields',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        // Validate pass marks
        if (parseInt(examSetup.passMarks) > parseInt(examSetup.totalMarks)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Marks',
                text: 'Pass marks cannot be greater than total marks',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        // Validate dates
        if (new Date(examSetup.startDate) > new Date(examSetup.endDate)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Dates',
                text: 'End date must be after start date',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        try {
            setLoading(true);
            const examData = {
                ...examSetup,
                totalMarks: parseInt(examSetup.totalMarks),
                passMarks: parseInt(examSetup.passMarks)
            };
            
            const response = await fetch(`${API_URL}/api/exams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examData)
            });

            const data = await response.json();

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Exam created successfully',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                fetchExams();
                setExamSetup({
                    examName: '',
                    examType: 'Mid Term',
                    academicYear: new Date().getFullYear().toString(),
                    class: '',
                    section: '',
                    examCategory: 'Written',
                    totalMarks: '',
                    passMarks: '',
                    startDate: '',
                    endDate: '',
                    status: 'Draft'
                });
                setActiveTab('list');
            } else {
                throw new Error(data.message || 'Failed to create exam');
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to create exam',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, {
            id: Date.now(),
            subjectName: '',
            examDate: '',
            startTime: '',
            endTime: '',
            duration: '',
            room: '',
            invigilator: ''
        }]);
    };

    const handleSubjectChange = (id, field, value) => {
        setSubjects(subjects.map(subject =>
            subject.id === id ? { ...subject, [field]: value } : subject
        ));
    };

    const handleRemoveSubject = (id) => {
        setSubjects(subjects.filter(subject => subject.id !== id));
    };

    const handleScheduleSubmit = async () => {
        if (!selectedExam) {
            Swal.fire({
                icon: 'warning',
                title: 'No Exam Selected',
                text: 'Please select an exam first',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        // Validate subjects
        const validSubjects = subjects.filter(subject => 
            subject.subjectName && subject.examDate && subject.startTime && subject.endTime && subject.duration
        );

        if (validSubjects.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Subjects',
                text: 'Please fill all required fields (Subject Name, Exam Date, Start Time, End Time, Duration) for at least one subject before saving.',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        // Process subjects data for API
        const processedSubjects = validSubjects.map(subject => ({
            subjectName: subject.subjectName,
            examDate: new Date(subject.examDate),
            startTime: subject.startTime,
            endTime: subject.endTime,
            duration: parseInt(subject.duration),
            room: subject.room || '',
            invigilator: subject.invigilator || undefined
        }));

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/exams/${selectedExam}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects: processedSubjects })
            });

            const data = await response.json();
            
            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Exam schedule saved successfully',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                setSubjects([]);
                fetchExams(); // Refresh exam list to show updated data
            } else {
                throw new Error(data.message || 'Failed to save schedule');
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to save exam schedule',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDistributionSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/exams/marks-distribution`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(markDistribution)
            });

            const data = await response.json();
            
            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Mark distribution saved successfully',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                // Refresh exams list to show updated mark distributions
                await fetchExams();
                setMarkDistribution({
                    examId: '',
                    subject: '',
                    written: '',
                    mcq: '',
                    practical: '',
                    viva: '',
                    isOptional: false
                });
            }
        } catch (error) {
            console.error('Error saving mark distribution:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save mark distribution',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    const updateExamStatus = async (examId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/exams/${examId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            
            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Exam status changed to ${newStatus}`,
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                fetchExams();
            }
        } catch (error) {
            console.error('Error updating exam status:', error);
        }
    };

    const getTeacherName = (id) => {
        if (!id) return 'Not assigned';
        const t = teachers.find(t => t._id === id || t._id?.toString() === id?.toString());
        return t ? t.name : 'Unknown';
    };

    const formatDatePdf = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTimePdf = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const downloadExamPDF = (exam) => {
        import('jspdf').then(({ default: jsPDF }) => {
            import('html2canvas').then(({ default: html2canvas }) => {
                const el = document.getElementById(`admin-exam-pdf-${exam._id}`);
                if (!el) return;
                html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`${exam.examName.replace(/\s+/g, '_')}_${exam.class}_${exam.section}.pdf`);
                });
            });
        });
    };

    const downloadAllExamsPDF = () => {
        import('jspdf').then(({ default: jsPDF }) => {
            import('html2canvas').then(({ default: html2canvas }) => {
                const el = document.getElementById('admin-all-exams-pdf');
                if (!el) return;
                html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    let heightLeft = pdfHeight;
                    let position = 0;
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pdf.internal.pageSize.getHeight();
                    while (heightLeft > 0) {
                        position = heightLeft - pdfHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                        heightLeft -= pdf.internal.pageSize.getHeight();
                    }
                    pdf.save(`All_Exams_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`);
                });
            });
        });
    };

    const deleteExam = async (examId) => {
        const result = await Swal.fire({
            text: 'This will delete the exam permanently!',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            customClass: { container: 'swal-high-z-index' }
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/api/exams/${examId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                
                if (data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Exam has been deleted',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: { container: 'swal-high-z-index' }
                    });
                    fetchExams();
                }
            } catch (error) {
                console.error('Error deleting exam:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <style jsx global>{`
                .swal-high-z-index {
                    z-index: 10000 !important;
                }
            `}</style>
            <div className="container mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Header */}
                <div className="border-b border-gray-200 p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c] mb-1 sm:mb-2">
                        Exam Management System
                    </h2>
                    <p className="text-sm sm:text-base text-black">Professional exam setup, scheduling & mark distribution</p>
                </div>


                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-300 p-3 sm:p-4 lg:p-6">
                    <button
                        onClick={() => setActiveTab('setup')}
                        className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                            activeTab === 'setup'
                                ? 'bg-blue-900 text-white border-b-2 border-blue-900'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Exam Setup
                    </button>
                    <button
                        onClick={() => setActiveTab('schedule')}
                        className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                            activeTab === 'schedule'
                                ? 'bg-blue-900 text-white border-b-2 border-blue-900'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Subject Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('marks')}
                        className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                            activeTab === 'marks'
                                ? 'bg-blue-900 text-white border-b-2 border-blue-900'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Mark Distribution
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                            activeTab === 'list'
                                ? 'bg-blue-900 text-white border-b-2 border-blue-900'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Exam List
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-4 sm:p-6">
                    {/* Exam Setup Tab */}
                    {activeTab === 'setup' && (
                        <div className="bg-white border border-gray-200 rounded p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-4 sm:mb-6">
                                Create New Exam
                            </h3>
                            
                            <form onSubmit={handleExamSetupSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Exam Name *</label>
                                        <input
                                            type="text"
                                            value={examSetup.examName}
                                            onChange={(e) => setExamSetup({...examSetup, examName: e.target.value})}
                                            placeholder="e.g., Mid Term Exam 2024"
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Exam Type *</label>
                                        <select
                                            value={examSetup.examType}
                                            onChange={(e) => setExamSetup({...examSetup, examType: e.target.value})}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                        >
                                            <option value="Mid Term">Mid Term</option>
                                            <option value="Final">Final</option>
                                            <option value="Class Test">Class Test</option>
                                            <option value="Monthly Test">Monthly Test</option>
                                            <option value="Half Yearly">Half Yearly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Academic Year *</label>
                                        <input
                                            type="text"
                                            value={examSetup.academicYear}
                                            onChange={(e) => setExamSetup({...examSetup, academicYear: e.target.value})}
                                            placeholder="2024-2025"
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Class *</label>
                                        <select
                                            value={examSetup.class}
                                            onChange={(e) => setExamSetup({...examSetup, class: e.target.value})}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
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
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Section *</label>
                                        <select
                                            value={examSetup.section}
                                            onChange={(e) => setExamSetup({...examSetup, section: e.target.value})}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
                                        >
                                            <option value="">Select Section</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Exam Category *</label>
                                        <select
                                            value={examSetup.examCategory}
                                            onChange={(e) => setExamSetup({...examSetup, examCategory: e.target.value})}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                        >
                                            <option value="Written">Written</option>
                                            <option value="MCQ">MCQ</option>
                                            <option value="Practical">Practical</option>
                                            <option value="Viva">Viva</option>
                                            <option value="Mixed">Mixed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Total Marks *</label>
                                        <input
                                            type="number"
                                            value={examSetup.totalMarks}
                                            onChange={(e) => setExamSetup({...examSetup, totalMarks: e.target.value})}
                                            placeholder="100"
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Pass Marks *</label>
                                        <input
                                            type="number"
                                            value={examSetup.passMarks}
                                            onChange={(e) => setExamSetup({...examSetup, passMarks: e.target.value})}
                                            placeholder="33"
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Start Date *</label>
                                        <input
                                            type="date"
                                            value={examSetup.startDate}
                                            onChange={(e) => setExamSetup({...examSetup, startDate: e.target.value})}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">End Date *</label>
                                        <input
                                            type="date"
                                            value={examSetup.endDate}
                                            onChange={(e) => setExamSetup({...examSetup, endDate: e.target.value})}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Exam Status *</label>
                                        <select
                                            value={examSetup.status}
                                            onChange={(e) => setExamSetup({...examSetup, status: e.target.value})}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Published">Published</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        {loading ? 'Creating...' : 'Create Exam'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setExamSetup({
                                            examName: '',
                                            examType: 'Mid Term',
                                            academicYear: new Date().getFullYear().toString(),
                                            class: '',
                                            section: '',
                                            examCategory: 'Written',
                                            totalMarks: '',
                                            passMarks: '',
                                            startDate: '',
                                            endDate: '',
                                            status: 'Draft'
                                        })}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-black rounded hover:bg-gray-50 transition-all font-semibold text-sm sm:text-base"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Subject Schedule Tab - Will be implemented in next message */}
                    {activeTab === 'schedule' && (
                        <div className="bg-white border border-gray-200 rounded p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                                <h3 className="text-lg sm:text-xl font-bold text-[#1a202c]">
                                    Subject-wise Exam Scheduling
                                </h3>
                                <button
                                    onClick={() => setScheduleViewMode(scheduleViewMode === 'edit' ? 'view' : 'edit')}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold text-sm sm:text-base"
                                >
                                    {scheduleViewMode === 'edit' ? 'View Schedules' : 'Edit Schedules'}
                                </button>
                            </div>

                            {scheduleViewMode === 'edit' ? (
                                <>
                                    <div className="bg-gray-50 border border-gray-200 rounded p-3 sm:p-4 mb-4 sm:mb-6">
                                        <p className="text-xs sm:text-sm text-black">
                                            <span className="font-semibold">Required Fields:</span> Fields marked with <span className="text-red-600">*</span> are required: Subject Name, Exam Date, Start Time, End Time, and Duration.
                                        </p>
                                    </div>
                                    
                                    <div className="mb-4 sm:mb-6">
                                        <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Select Exam *</label>
                                        <select
                                            value={selectedExam || ''}
                                            onChange={(e) => setSelectedExam(e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                        >
                                            <option value="">Choose an exam</option>
                                            {exams.map(exam => (
                                                <option key={exam._id} value={exam._id}>
                                                    {exam.examName} - {exam.class} ({exam.section})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedExam && (
                                        <>
                                            <div className="space-y-3 sm:space-y-4">
                                                {subjects.map((subject, index) => (
                                                    <div key={subject.id} className="bg-white border border-gray-300 rounded p-3 sm:p-5">
                                                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                            <h4 className="text-base sm:text-lg font-semibold text-[#1a202c]">Subject #{index + 1}</h4>
                                                            <button
                                                                onClick={() => handleRemoveSubject(subject.id)}
                                                                className="text-red-600 hover:text-red-800 font-semibold text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                            <div>
                                                                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Subject Name <span className="text-red-600">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    value={subject.subjectName}
                                                                    onChange={(e) => handleSubjectChange(subject.id, 'subjectName', e.target.value)}
                                                                    placeholder="Mathematics"
                                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Exam Date <span className="text-red-600">*</span></label>
                                                                <input
                                                                    type="date"
                                                                    value={subject.examDate}
                                                                    onChange={(e) => handleSubjectChange(subject.id, 'examDate', e.target.value)}
                                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Start Time <span className="text-red-600">*</span></label>
                                                                <input
                                                                    type="time"
                                                                    value={subject.startTime}
                                                                    onChange={(e) => handleSubjectChange(subject.id, 'startTime', e.target.value)}
                                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">End Time <span className="text-red-600">*</span></label>
                                                                <input
                                                                    type="time"
                                                                    value={subject.endTime}
                                                                    onChange={(e) => handleSubjectChange(subject.id, 'endTime', e.target.value)}
                                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Duration (minutes) <span className="text-red-600">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    value={subject.duration}
                                                                    onChange={(e) => handleSubjectChange(subject.id, 'duration', e.target.value)}
                                                                    placeholder="120"
                                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                                    required
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Room / Hall</label>
                                                                <input
                                                                    type="text"
                                                                    value={subject.room}
                                                                    onChange={(e) => handleSubjectChange(subject.id, 'room', e.target.value)}
                                                                    placeholder="Room 101"
                                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                                />
                                                            </div>

                                                            <div className="sm:col-span-2">
                                                                <label className="block text-xs sm:text-sm font-medium text-black mb-1 sm:mb-2">Invigilator (Teacher)</label>
                                                                <select
                                                                    value={subject.invigilator}
                                                                    onChange={(e) => handleSubjectChange(subject.id, 'invigilator', e.target.value)}
                                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                                >
                                                                    <option value="">Select Teacher</option>
                                                                    {teachers.map(teacher => (
                                                                        <option key={teacher._id} value={teacher._id}>
                                                                            {teacher.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                <button
                                                    onClick={handleAddSubject}
                                                    className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold text-sm sm:text-base"
                                                >
                                                    + Add Subject
                                                </button>
                                                {subjects.length > 0 && (
                                                    <button
                                                        onClick={handleScheduleSubmit}
                                                        disabled={loading}
                                                        className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold disabled:opacity-50 text-sm sm:text-base"
                                                    >
                                                        {loading ? 'Saving...' : 'Save Schedule'}
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                // View Mode
                                <div className="bg-white border border-gray-200 rounded p-4 sm:p-6">
                                    <h4 className="text-base sm:text-lg font-bold text-[#1a202c] mb-4 sm:mb-6">
                                        All Subject Schedules Overview
                                    </h4>

                                    {exams.length === 0 ? (
                                        <div className="text-center py-12 sm:py-16">
                                            <h3 className="text-lg sm:text-2xl font-bold text-[#1a202c] mb-2">No Exams Found</h3>
                                            <p className="text-black mb-4 sm:mb-6 text-sm sm:text-base">Create exams first to view their schedules</p>
                                            <button
                                                onClick={() => setActiveTab('setup')}
                                                className="px-5 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold text-sm sm:text-base"
                                            >
                                                Create New Exam
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 sm:space-y-6">
                                            {exams.map((exam) => (
                                                <div key={exam._id} className="bg-white border border-gray-300 rounded overflow-hidden">
                                                    <div className="bg-[#1a202c] text-white px-4 sm:px-6 py-3 sm:py-4">
                                                        <h5 className="text-base sm:text-lg font-bold">{exam.examName}</h5>
                                                        <p className="text-xs sm:text-sm mt-1">
                                                            {exam.class} - Section {exam.section} | {exam.examType} | {exam.academicYear}
                                                        </p>
                                                    </div>

                                                    {exam.subjects && exam.subjects.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-xs sm:text-sm">
                                                                <thead className="bg-gray-100">
                                                                    <tr>
                                                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Subject</th>
                                                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Date</th>
                                                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Time</th>
                                                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Duration</th>
                                                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Room</th>
                                                                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Invigilator</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {exam.subjects.map((subject, index) => (
                                                                        <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-black">
                                                                                {subject.subjectName}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {subject.examDate ? new Date(subject.examDate).toLocaleDateString() : 'N/A'}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {subject.startTime} - {subject.endTime}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {subject.duration} min
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {subject.room || 'Not assigned'}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {subject.invigilator ? 
                                                                                    teachers.find(t => t._id === subject.invigilator)?.name || 'Unknown' 
                                                                                    : 'Not assigned'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                                                            <p className="text-black font-medium text-sm sm:text-base">No subjects scheduled for this exam</p>
                                                            <button
                                                                onClick={() => setScheduleViewMode('edit')}
                                                                className="mt-3 px-4 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all text-sm sm:text-base font-semibold"
                                                            >
                                                                Schedule Subjects
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}



                    {/* Mark Distribution Tab - Continuing in next section */}
                    {activeTab === 'marks' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-white border border-gray-200 rounded p-4 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-4 sm:mb-6">Subject Mark Distribution</h3>
                                
                                <form onSubmit={handleMarkDistributionSubmit}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Select Exam *</label>
                                            <select
                                                value={markDistribution.examId}
                                                onChange={(e) => setMarkDistribution({...markDistribution, examId: e.target.value})}
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                required
                                            >
                                                <option value="">Choose an exam</option>
                                                {exams.map(exam => (
                                                    <option key={exam._id} value={exam._id}>
                                                        {exam.examName} - {exam.class} ({exam.section})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Subject Name *</label>
                                            <input
                                                type="text"
                                                value={markDistribution.subject}
                                                onChange={(e) => setMarkDistribution({...markDistribution, subject: e.target.value})}
                                                placeholder="Mathematics"
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Written Marks</label>
                                            <input
                                                type="number"
                                                value={markDistribution.written}
                                                onChange={(e) => setMarkDistribution({...markDistribution, written: e.target.value})}
                                                placeholder="50"
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">MCQ Marks</label>
                                            <input
                                                type="number"
                                                value={markDistribution.mcq}
                                                onChange={(e) => setMarkDistribution({...markDistribution, mcq: e.target.value})}
                                                placeholder="30"
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Practical Marks</label>
                                            <input
                                                type="number"
                                                value={markDistribution.practical}
                                                onChange={(e) => setMarkDistribution({...markDistribution, practical: e.target.value})}
                                                placeholder="10"
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Viva Marks</label>
                                            <input
                                                type="number"
                                                value={markDistribution.viva}
                                                onChange={(e) => setMarkDistribution({...markDistribution, viva: e.target.value})}
                                                placeholder="10"
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4 sm:mb-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={markDistribution.isOptional}
                                                onChange={(e) => setMarkDistribution({...markDistribution, isOptional: e.target.checked})}
                                                className="w-4 h-4 border-gray-300 rounded focus:ring-[#1a202c]"
                                            />
                                            <span className="ml-3 text-xs sm:text-sm font-semibold text-black">Optional Subject</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        {loading ? 'Saving...' : 'Save Mark Distribution'}
                                    </button>
                                </form>
                            </div>

                            {/* Existing Mark Distributions Display */}
                            <div className="bg-white border border-gray-200 rounded p-4 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-4 sm:mb-6">
                                    Existing Mark Distributions
                                </h3>

                                {exams.length === 0 ? (
                                    <div className="text-center py-12 sm:py-16">
                                        <h3 className="text-lg sm:text-2xl font-bold text-[#1a202c] mb-2">No Exams Found</h3>
                                        <p className="text-black mb-4 sm:mb-6 text-sm sm:text-base">Create exams first to view mark distributions</p>
                                        <button
                                            onClick={() => setActiveTab('setup')}
                                            className="px-5 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold text-sm sm:text-base"
                                        >
                                            Create New Exam
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 sm:space-y-6">
                                        {exams.map((exam) => (
                                            <div key={exam._id} className="bg-white border border-gray-300 rounded overflow-hidden">
                                                <div className="bg-[#1a202c] text-white px-4 sm:px-6 py-3 sm:py-4">
                                                    <h4 className="text-base sm:text-lg font-bold">{exam.examName}</h4>
                                                    <p className="text-xs sm:text-sm mt-1">
                                                        {exam.class} - Section {exam.section} | {exam.examType} | Total: {exam.totalMarks} marks
                                                    </p>
                                                </div>

                                                {exam.markDistribution && exam.markDistribution.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs sm:text-sm">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Subject</th>
                                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Written</th>
                                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">MCQ</th>
                                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Practical</th>
                                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Viva</th>
                                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Total</th>
                                                                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-[#1a202c]">Type</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {exam.markDistribution.map((mark, index) => {
                                                                    const total = (mark.written || 0) + (mark.mcq || 0) + (mark.practical || 0) + (mark.viva || 0);
                                                                    return (
                                                                        <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-black">
                                                                                {mark.subject}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {mark.written || 0}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {mark.mcq || 0}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {mark.practical || 0}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                {mark.viva || 0}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold text-[#1a202c]">
                                                                                {total}
                                                                            </td>
                                                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-black">
                                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                                    mark.isOptional 
                                                                                        ? 'bg-gray-200 text-black' 
                                                                                        : 'bg-[#1a202c] text-white'
                                                                                }`}>
                                                                                    {mark.isOptional ? 'Optional' : 'Compulsory'}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                                                        <p className="text-black font-medium text-sm sm:text-base">No mark distributions set for this exam</p>
                                                        <button
                                                            onClick={() => {
                                                                setMarkDistribution({...markDistribution, examId: exam._id});
                                                                // Scroll to form
                                                                document.querySelector('.bg-white.border.border-gray-200.rounded')?.scrollIntoView({ behavior: 'smooth' });
                                                            }}
                                                            className="mt-3 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all text-xs sm:text-sm font-semibold"
                                                        >
                                                            Add Mark Distribution
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Grade System */}
                            <div className="bg-white border border-gray-200 rounded p-4 sm:p-6">
                                <h3 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-4 sm:mb-6">Grading System</h3>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-xs sm:text-sm">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#1a202c]">Grade</th>
                                                <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#1a202c]">Min Marks</th>
                                                <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#1a202c]">Max Marks</th>
                                                <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#1a202c]">Grade Point</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {gradeSystem.map((grade, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">
                                                        <span className="font-bold text-base sm:text-lg text-[#1a202c]">{grade.grade}</span>
                                                    </td>
                                                    <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-black">{grade.minMarks}</td>
                                                    <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-black">{grade.maxMarks}</td>
                                                    <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">
                                                        <span className="font-semibold text-black">
                                                            {grade.grade === 'A+' ? '5.00' : 
                                                             grade.grade === 'A' ? '4.00' : 
                                                             grade.grade === 'A-' ? '3.50' : 
                                                             grade.grade === 'B' ? '3.00' : 
                                                             grade.grade === 'C' ? '2.00' : 
                                                             grade.grade === 'D' ? '1.00' : '0.00'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Exam List Tab */}
                    {activeTab === 'list' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                                <h3 className="text-xl sm:text-2xl font-bold text-[#1a202c]">All Exams</h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs sm:text-sm text-black bg-gray-100 px-4 py-2 rounded font-semibold">
                                        {exams.length} Exam{exams.length !== 1 ? 's' : ''} Found
                                    </span>
                                    {exams.length > 0 && (
                                        <button
                                            onClick={downloadAllExamsPDF}
                                            className="px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-all text-xs sm:text-sm font-semibold flex items-center gap-1"
                                        >
                                            📥 Download All PDF
                                        </button>
                                    )}
                                </div>
                            </div>

                            {exams.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <h3 className="text-lg sm:text-2xl font-bold text-[#1a202c] mb-2">No Exams Created Yet</h3>
                                    <p className="text-black mb-4 sm:mb-6 text-sm sm:text-base">Start by creating your first exam in the Exam Setup tab</p>
                                    <button
                                        onClick={() => setActiveTab('setup')}
                                        className="px-5 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold text-sm sm:text-base"
                                    >
                                        Create New Exam
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                                    {exams.map((exam) => (
                                        <div key={exam._id} className="bg-white border border-gray-300 rounded p-4 sm:p-6 hover:shadow-lg transition-all">
                                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                                <div className="flex-1">
                                                    <h4 className="text-base sm:text-xl font-bold text-[#1a202c] mb-2">{exam.examName}</h4>
                                                    <div className="space-y-1 text-xs sm:text-sm text-black">
                                                        <p>{exam.class} - Section {exam.section}</p>
                                                        <p>{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</p>
                                                        <p>Total: {exam.totalMarks} | Pass: {exam.passMarks}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2 sm:px-3 py-1 rounded text-xs font-bold ${
                                                    exam.status === 'Published' ? 'bg-[#1a202c] text-white' :
                                                    exam.status === 'Ongoing' ? 'bg-[#1a202c] text-white' :
                                                    exam.status === 'Completed' ? 'bg-gray-800 text-white' :
                                                    'bg-gray-200 text-black'
                                                }`}>
                                                    {exam.status}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-gray-200">
                                                <select
                                                    onChange={(e) => updateExamStatus(exam._id, e.target.value)}
                                                    className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c]"
                                                    defaultValue={exam.status}
                                                >
                                                    <option value="Draft">Draft</option>
                                                    <option value="Published">Published</option>
                                                    <option value="Ongoing">Ongoing</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                                <button
                                                    onClick={() => downloadExamPDF(exam)}
                                                    className="px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-all text-xs sm:text-sm font-semibold"
                                                >
                                                    📥 PDF
                                                </button>
                                                <button
                                                    onClick={() => deleteExam(exam._id)}
                                                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-xs sm:text-sm font-semibold"
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                            {/* Hidden PDF template for this exam */}
                                            <div id={`admin-exam-pdf-${exam._id}`} style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', padding: '40px', background: '#fff', fontFamily: 'Arial, sans-serif', color: '#000' }}>
                                                {/* Header */}
                                                <div style={{ textAlign: 'center', borderBottom: '3px solid #1a202c', paddingBottom: '16px', marginBottom: '24px' }}>
                                                    <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>EXAM SCHEDULE</h1>
                                                    <p style={{ fontSize: '13px', color: '#555', margin: '4px 0 0' }}>Academic Year {exam.academicYear}</p>
                                                </div>
                                                {/* Exam Info Grid */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px', background: '#f8f9fa', padding: '16px', borderRadius: '6px' }}>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Exam Name:</span> <span>{exam.examName}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Type:</span> <span>{exam.examType}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Class:</span> <span>{exam.class} — Section {exam.section}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Category:</span> <span>{exam.examCategory}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Start Date:</span> <span>{formatDatePdf(exam.startDate)}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>End Date:</span> <span>{formatDatePdf(exam.endDate)}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Total Marks:</span> <span>{exam.totalMarks}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Pass Marks:</span> <span>{exam.passMarks}</span></div>
                                                    <div><span style={{ fontWeight: 'bold', color: '#333' }}>Status:</span> <span style={{ fontWeight: 'bold', color: exam.status === 'Published' ? '#065f46' : exam.status === 'Ongoing' ? '#1e40af' : '#374151' }}>{exam.status}</span></div>
                                                </div>
                                                {/* Subjects Table */}
                                                {exam.subjects && exam.subjects.length > 0 && (
                                                    <div>
                                                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a202c', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '6px' }}>Subject Schedule</h3>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                            <thead>
                                                                <tr style={{ background: '#1a202c', color: '#fff' }}>
                                                                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #333' }}>Subject</th>
                                                                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #333' }}>Date</th>
                                                                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #333' }}>Time</th>
                                                                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #333' }}>Duration</th>
                                                                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #333' }}>Room</th>
                                                                    <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #333' }}>Invigilator</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {exam.subjects.map((sub, idx) => (
                                                                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                                                        <td style={{ padding: '7px 10px', border: '1px solid #ddd', fontWeight: '600' }}>{sub.subjectName}</td>
                                                                        <td style={{ padding: '7px 10px', border: '1px solid #ddd' }}>{formatDatePdf(sub.examDate)}</td>
                                                                        <td style={{ padding: '7px 10px', border: '1px solid #ddd' }}>{formatTimePdf(sub.startTime)}{sub.endTime ? ` – ${formatTimePdf(sub.endTime)}` : ''}</td>
                                                                        <td style={{ padding: '7px 10px', border: '1px solid #ddd' }}>{sub.duration ? `${sub.duration} min` : '—'}</td>
                                                                        <td style={{ padding: '7px 10px', border: '1px solid #ddd' }}>{sub.roomNumber || '—'}</td>
                                                                        <td style={{ padding: '7px 10px', border: '1px solid #ddd' }}>{getTeacherName(sub.invigilator)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                                {/* Footer */}
                                                <div style={{ marginTop: '32px', borderTop: '1px solid #ccc', paddingTop: '12px', fontSize: '11px', color: '#777', textAlign: 'center' }}>
                                                    Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} | School Management System
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Hidden PDF element for Download All */}
                            <div id="admin-all-exams-pdf" style={{ position: 'fixed', left: '-9999px', top: 0, width: '1050px', padding: '40px', background: '#fff', fontFamily: 'Arial, sans-serif', color: '#000' }}>
                                <div style={{ textAlign: 'center', borderBottom: '3px solid #1a202c', paddingBottom: '16px', marginBottom: '28px' }}>
                                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a202c', margin: 0 }}>ALL EXAM SCHEDULES</h1>
                                    <p style={{ fontSize: '13px', color: '#555', margin: '4px 0 0' }}>Generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                                {exams.map((exam, examIdx) => (
                                    <div key={exam._id} style={{ marginBottom: '36px', pageBreakInside: 'avoid' }}>
                                        <div style={{ background: '#1a202c', color: '#fff', padding: '10px 16px', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{examIdx + 1}. {exam.examName}</span>
                                            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>{exam.status}</span>
                                        </div>
                                        <div style={{ border: '1px solid #ddd', borderTop: 'none', padding: '12px 16px', background: '#f9fafb', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '12px' }}>
                                            <div><b>Class:</b> {exam.class} — Sec {exam.section}</div>
                                            <div><b>Type:</b> {exam.examType}</div>
                                            <div><b>Year:</b> {exam.academicYear}</div>
                                            <div><b>Start:</b> {formatDatePdf(exam.startDate)}</div>
                                            <div><b>End:</b> {formatDatePdf(exam.endDate)}</div>
                                            <div><b>Total / Pass:</b> {exam.totalMarks} / {exam.passMarks}</div>
                                        </div>
                                        {exam.subjects && exam.subjects.length > 0 && (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                <thead>
                                                    <tr style={{ background: '#374151', color: '#fff' }}>
                                                        <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #555' }}>Subject</th>
                                                        <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #555' }}>Date</th>
                                                        <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #555' }}>Time</th>
                                                        <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #555' }}>Duration</th>
                                                        <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #555' }}>Room</th>
                                                        <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #555' }}>Invigilator</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {exam.subjects.map((sub, idx) => (
                                                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f3f4f6' }}>
                                                            <td style={{ padding: '6px 10px', border: '1px solid #ddd', fontWeight: '600' }}>{sub.subjectName}</td>
                                                            <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>{formatDatePdf(sub.examDate)}</td>
                                                            <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>{formatTimePdf(sub.startTime)}{sub.endTime ? ` – ${formatTimePdf(sub.endTime)}` : ''}</td>
                                                            <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>{sub.duration ? `${sub.duration} min` : '—'}</td>
                                                            <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>{sub.roomNumber || '—'}</td>
                                                            <td style={{ padding: '6px 10px', border: '1px solid #ddd' }}>{getTeacherName(sub.invigilator)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid #ccc', paddingTop: '12px', fontSize: '11px', color: '#777', textAlign: 'center' }}>
                                    School Management System — Confidential
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
