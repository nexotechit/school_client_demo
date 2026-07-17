'use client';
import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../../../config/api';

export default function TeacherExams() {
    const [exams, setExams] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all'); // all | mine | published
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const printRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setCurrentTeacher(parsed);
        }
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            setLoading(true);
            const [examsRes, teachersRes] = await Promise.all([
                fetch(`${API_URL}/api/exams`),
                fetch(`${API_URL}/api/teachers`)
            ]);
            const examsData = await examsRes.json();
            const teachersData = await teachersRes.json();
            if (examsData.success) setExams(examsData.data);
            if (teachersData.success) setTeachers(teachersData.data);
        } catch (err) {
            console.error('Failed to load exam data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTeacherName = (id) => {
        if (!id) return '—';
        const t = teachers.find(t => t._id === id || t._id?.toString() === id?.toString());
        return t ? t.name : id;
    };

    const getTeacherById = (id) => {
        if (!id) return null;
        return teachers.find(t => t._id === id || t._id?.toString() === id?.toString()) || null;
    };

    // Find which exams/subjects the current teacher is assigned as invigilator
    const getMyInvigilatorDuties = () => {
        if (!currentTeacher) return [];
        const duties = [];
        exams.forEach(exam => {
            if (!exam.subjects || exam.status !== 'Published') return;
            exam.subjects.forEach(subject => {
                if (!subject.invigilator) return;
                const t = getTeacherById(subject.invigilator);
                if (!t) return;
                // match by name or _id
                const matchById = t._id?.toString() === currentTeacher._id?.toString();
                const matchByName = t.name?.toLowerCase() === currentTeacher.name?.toLowerCase();
                if (matchById || matchByName) {
                    duties.push({ exam, subject });
                }
            });
        });
        return duties.sort((a, b) => new Date(a.subject.examDate) - new Date(b.subject.examDate));
    };

    const filteredExams = exams.filter(exam => {
        const matchSearch = exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.class?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchSearch) return false;
        if (activeFilter === 'published') return exam.status === 'Published' || exam.status === 'Ongoing';
        if (activeFilter === 'mine') {
            if (!currentTeacher) return false;
            return exam.subjects?.some(s => {
                const t = getTeacherById(s.invigilator);
                if (!t) return false;
                return t._id?.toString() === currentTeacher._id?.toString() ||
                    t.name?.toLowerCase() === currentTeacher.name?.toLowerCase();
            });
        }
        return true;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (t) => {
        if (!t) return '—';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const statusColor = (status) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800 border-green-200';
            case 'Ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    // --- PDF Download for a single exam ---
    const downloadExamPDF = (exam) => {
        const jsPDFModule = import('jspdf').then(({ default: jsPDF }) => {
            import('html2canvas').then(({ default: html2canvas }) => {
                const el = document.getElementById(`exam-pdf-${exam._id}`);
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

    // --- PDF Download for invigilator duty card ---
    const downloadDutyCardPDF = () => {
        import('jspdf').then(({ default: jsPDF }) => {
            import('html2canvas').then(({ default: html2canvas }) => {
                const el = document.getElementById('duty-card-pdf');
                if (!el) return;
                html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Invigilator_Duty_Card_${currentTeacher?.name?.replace(/\s+/g, '_') || 'Teacher'}.pdf`);
                });
            });
        });
    };

    const myDuties = getMyInvigilatorDuties();

    if (loading) {
        return (
            <div className="p-6 sm:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">📋 Exam Schedule</h1>
                    <p className="text-gray-500 text-sm mt-1">View all published exams and your invigilator duties</p>
                </div>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* ====== MY INVIGILATOR DUTY CARD ====== */}
            {myDuties.length > 0 && (
                <div className="bg-linear-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">👮</div>
                            <div>
                                <h2 className="text-xl font-bold">My Invigilator Duties</h2>
                                <p className="text-gray-300 text-sm">{myDuties.length} duty assignment{myDuties.length > 1 ? 's' : ''} found</p>
                            </div>
                        </div>
                        <button
                            onClick={downloadDutyCardPDF}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-md"
                        >
                            📥 Download Duty Card PDF
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {myDuties.map(({ exam, subject }, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-all">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-bold bg-white/20 rounded-full px-2 py-0.5">{exam.examType}</span>
                                    <span className="text-xs text-green-300 font-semibold">● ACTIVE</span>
                                </div>
                                <h3 className="font-bold text-base mb-1">{subject.subjectName}</h3>
                                <p className="text-gray-300 text-xs mb-3">{exam.examName} — {exam.class} {exam.section}</p>
                                <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1.5"><span>📅</span><span className="text-gray-200 font-medium">{formatDate(subject.examDate)}</span></div>
                                    <div className="flex items-center gap-1.5"><span>⏰</span><span className="text-gray-200 font-medium">{formatTime(subject.startTime)} — {formatTime(subject.endTime)}</span></div>
                                    <div className="flex items-center gap-1.5"><span>🏛️</span><span className="text-gray-200 font-medium">{subject.room || 'Room TBD'}</span></div>
                                    <div className="flex items-center gap-1.5"><span>⏱️</span><span className="text-gray-200 font-medium">{subject.duration} minutes</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hidden PDF render for Duty Card */}
            <div id="duty-card-pdf" style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', padding: '40px', fontFamily: 'Arial, sans-serif', background: '#fff' }}>
                <div style={{ borderBottom: '3px solid #1e40af', paddingBottom: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 4px 0' }}>INVIGILATOR DUTY CARD</h1>
                            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>Sunlight School — Official Assignment</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>Printed: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '14px', color: '#555', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Assigned Invigilator</h2>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 4px 0' }}>{currentTeacher?.name || '—'}</p>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{currentTeacher?.email || ''}</p>
                </div>

                <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Duty Schedule</h2>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#1e40af', color: '#fff' }}>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>#</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Exam</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Class</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Subject</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Time</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Room</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myDuties.map(({ exam, subject }, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{idx + 1}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>{exam.examName}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{exam.class} — {exam.section}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>{subject.subjectName}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{formatDate(subject.examDate)}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{formatTime(subject.startTime)} – {formatTime(subject.endTime)}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{subject.room || 'TBD'}</td>
                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{subject.duration} min</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '160px', borderTop: '2px solid #1e40af', paddingTop: '6px', fontSize: '12px', color: '#555' }}>Invigilator Signature</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '160px', borderTop: '2px solid #1e40af', paddingTop: '6px', fontSize: '12px', color: '#555' }}>Principal Signature</div>
                    </div>
                </div>
            </div>

            {/* ====== FILTER BAR ====== */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search exams or class..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'published', 'mine'].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeFilter === f ? 'bg-blue-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {f === 'mine' ? '👮 My Duties' : f === 'published' ? '✅ Published' : '📋 All Exams'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ====== EXAM CARDS ====== */}
            {filteredExams.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Exams Found</h3>
                    <p className="text-gray-400 text-sm">
                        {activeFilter === 'mine' ? 'You are not assigned as invigilator in any published exam.' : 'No exams match your search.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredExams.map(exam => (
                        <div key={exam._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                            {/* Exam Header */}
                            <div className="bg-blue-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg font-bold text-white">{exam.examName}</h3>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusColor(exam.status)}`}>
                                            {exam.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1">
                                        {exam.examType} • {exam.class} — Section {exam.section} • {exam.academicYear}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setSelectedExam(exam); setShowModal(true); }}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-all border border-white/20"
                                    >
                                        👁 View Detail
                                    </button>
                                    <button
                                        onClick={() => downloadExamPDF(exam)}
                                        className="px-4 py-2 bg-white text-blue-900 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all shadow"
                                    >
                                        📥 PDF
                                    </button>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <span className="text-gray-500">Total Marks</span>
                                    <p className="font-bold text-blue-900 text-sm mt-0.5">{exam.totalMarks}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Pass Marks</span>
                                    <p className="font-bold text-blue-900 text-sm mt-0.5">{exam.passMarks}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Start Date</span>
                                    <p className="font-bold text-blue-900 text-sm mt-0.5">{formatDate(exam.startDate)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">End Date</span>
                                    <p className="font-bold text-blue-900 text-sm mt-0.5">{formatDate(exam.endDate)}</p>
                                </div>
                            </div>

                            {/* Subject Schedule Table */}
                            {exam.subjects && exam.subjects.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invigilator</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {exam.subjects.map((subject, idx) => {
                                                const invTeacher = getTeacherById(subject.invigilator);
                                                const isMe = invTeacher && currentTeacher && (
                                                    invTeacher._id?.toString() === currentTeacher._id?.toString() ||
                                                    invTeacher.name?.toLowerCase() === currentTeacher.name?.toLowerCase()
                                                );
                                                return (
                                                    <tr key={idx} className={`hover:bg-gray-50 transition-colors ${isMe ? 'bg-amber-50 border-l-4 border-amber-400' : ''}`}>
                                                        <td className="px-4 sm:px-6 py-3.5 font-semibold text-blue-900">
                                                            {subject.subjectName}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3.5 text-gray-700">
                                                            {formatDate(subject.examDate)}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3.5 text-gray-700">
                                                            {formatTime(subject.startTime)} — {formatTime(subject.endTime)}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3.5 text-gray-700">
                                                            {subject.duration} min
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3.5 text-gray-700">
                                                            {subject.room || <span className="text-gray-400 text-xs">TBD</span>}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3.5">
                                                            {invTeacher ? (
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isMe ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'}`}>
                                                                    {isMe && '👮 '}{invTeacher.name}
                                                                    {isMe && <span className="text-amber-600 font-bold">(You)</span>}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">Not assigned</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-400 text-sm">
                                    No subjects scheduled yet for this exam
                                </div>
                            )}

                            {/* Hidden PDF canvas for this exam */}
                            <div id={`exam-pdf-${exam._id}`} style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', padding: '36px', fontFamily: 'Arial, sans-serif', background: '#fff' }}>
                                <div style={{ borderBottom: '3px solid #1e40af', paddingBottom: '16px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        <div>
                                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 4px 0' }}>EXAM SCHEDULE</h1>
                                            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Sunlight School — Official Exam Timetable</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Printed: {new Date().toLocaleDateString('en-GB')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Exam info box */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    {[
                                        ['Exam Name', exam.examName],
                                        ['Exam Type', exam.examType],
                                        ['Class & Section', `${exam.class} — Section ${exam.section}`],
                                        ['Academic Year', exam.academicYear],
                                        ['Total Marks', exam.totalMarks],
                                        ['Pass Marks', exam.passMarks],
                                        ['Start Date', formatDate(exam.startDate)],
                                        ['End Date', formatDate(exam.endDate)],
                                        ['Status', exam.status],
                                        ['Category', exam.examCategory],
                                    ].map(([label, value], i) => (
                                        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px' }}>
                                            <p style={{ fontSize: '10px', color: '#888', margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                                            <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>{value || '—'}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Subjects table */}
                                {exam.subjects && exam.subjects.length > 0 && (
                                    <>
                                        <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject Schedule</h2>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead>
                                                <tr style={{ background: '#1e40af', color: '#fff' }}>
                                                    {['#', 'Subject', 'Date', 'Time', 'Duration', 'Room', 'Invigilator'].map(h => (
                                                        <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontWeight: '600' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exam.subjects.map((s, i) => (
                                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>{i + 1}</td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>{s.subjectName}</td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>{formatDate(s.examDate)}</td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>{formatTime(s.startTime)} – {formatTime(s.endTime)}</td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>{s.duration} min</td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>{s.room || 'TBD'}</td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>{getTeacherName(s.invigilator)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ====== DETAIL MODAL ====== */}
            {showModal && selectedExam && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="bg-blue-900 text-white px-6 py-5 rounded-t-2xl flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{selectedExam.examName}</h2>
                                <p className="text-gray-300 text-sm mt-1">
                                    {selectedExam.examType} • {selectedExam.class} — Section {selectedExam.section} • {selectedExam.academicYear}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => downloadExamPDF(selectedExam)}
                                    className="px-4 py-2 bg-white text-blue-900 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all"
                                >
                                    📥 Download PDF
                                </button>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Exam Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Status', value: selectedExam.status },
                                    { label: 'Category', value: selectedExam.examCategory },
                                    { label: 'Total Marks', value: selectedExam.totalMarks },
                                    { label: 'Pass Marks', value: selectedExam.passMarks },
                                    { label: 'Start Date', value: formatDate(selectedExam.startDate) },
                                    { label: 'End Date', value: formatDate(selectedExam.endDate) },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                                        <p className="text-sm font-bold text-blue-900">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Subjects in modal */}
                            {selectedExam.subjects?.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold text-blue-900 mb-3">Subject Schedule</h3>
                                    <div className="space-y-3">
                                        {selectedExam.subjects.map((s, i) => {
                                            const inv = getTeacherById(s.invigilator);
                                            const isMe = inv && currentTeacher && (
                                                inv._id?.toString() === currentTeacher._id?.toString() ||
                                                inv.name?.toLowerCase() === currentTeacher.name?.toLowerCase()
                                            );
                                            return (
                                                <div key={i} className={`rounded-xl border p-4 ${isMe ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
                                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                                        <h4 className="font-bold text-blue-900 text-base">{s.subjectName}</h4>
                                                        {inv && (
                                                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isMe ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'}`}>
                                                                👮 {inv.name}{isMe && ' (You)'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                                        <div><span className="text-gray-500">Date</span><p className="font-semibold mt-0.5">{formatDate(s.examDate)}</p></div>
                                                        <div><span className="text-gray-500">Time</span><p className="font-semibold mt-0.5">{formatTime(s.startTime)} – {formatTime(s.endTime)}</p></div>
                                                        <div><span className="text-gray-500">Duration</span><p className="font-semibold mt-0.5">{s.duration} min</p></div>
                                                        <div><span className="text-gray-500">Room</span><p className="font-semibold mt-0.5">{s.room || 'TBD'}</p></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
