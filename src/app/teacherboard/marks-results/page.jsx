'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../../config/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MarksResultsPage = () => {
    // State management
    const [classes, setClasses] = useState(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']);
    const [sections, setSections] = useState(['A', 'B', 'C', 'D']);
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState([]);
    const [classSectionCards, setClassSectionCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null); // {class, section, examName, academicYear}
    const [editedResults, setEditedResults] = useState({}); // {resultId: {subjectName, marks, totalMarks}}
    
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [examName, setExamName] = useState('');
    const [examType, setExamType] = useState('');
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
    
    const [marksData, setMarksData] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [savingIndex, setSavingIndex] = useState(null); // index of student being saved individually
    const [viewMode, setViewMode] = useState('entry'); // 'entry' or 'view'


    // Load classes on mount
    useEffect(() => {
        // Classes are now static
    }, []);

    // Load sections when class changes
    useEffect(() => {
        if (selectedClass) {
            // Sections are now static
        } else {
            setSelectedSection('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClass]);

    // Load students when both class and section are selected
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchStudents();
        } else {
            setStudents([]);
            setMarksData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClass, selectedSection]);

    // Fetch students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/results/helpers/students?class=${selectedClass}&section=${selectedSection}`);
            const data = await response.json();
            
            if (data.success) {
                setStudents(data.data);
                // Initialize marks data
                const initialMarksData = data.data.map(student => ({
                    studentId: student._id,
                    studentName: student.name,
                    rollNumber: student.rollNumber,
                    subjects: [{ subjectName: '', marks: '', totalMarks: 100 }]
                }));
                setMarksData(initialMarksData);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            Swal.fire('Error', 'Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Get safe subjects array for a student entry
    const getSafeSubjects = (student) =>
        Array.isArray(student.subjects) && student.subjects.length
            ? student.subjects
            : [{ subjectName: '', marks: '', totalMarks: 100 }];

    // Add a subject row to a student
    const addSubject = (studentIndex) => {
        const updatedMarksData = [...marksData];
        const existing = getSafeSubjects(updatedMarksData[studentIndex]);
        updatedMarksData[studentIndex] = {
            ...updatedMarksData[studentIndex],
            subjects: [...existing, { subjectName: '', marks: '', totalMarks: 100 }]
        };
        setMarksData(updatedMarksData);
    };

    // Remove a subject row from a student (min 1)
    const removeSubject = (studentIndex, subjectIndex) => {
        const updatedMarksData = [...marksData];
        const subs = [...getSafeSubjects(updatedMarksData[studentIndex])];
        if (subs.length === 1) {
            subs[0] = { subjectName: '', marks: '', totalMarks: 100 };
        } else {
            subs.splice(subjectIndex, 1);
        }
        updatedMarksData[studentIndex] = { ...updatedMarksData[studentIndex], subjects: subs };
        setMarksData(updatedMarksData);
    };

    // Update subject name
    const updateSubjectName = (studentIndex, subjectIndex, value) => {
        const updatedMarksData = [...marksData];
        const subs = [...getSafeSubjects(updatedMarksData[studentIndex])];
        subs[subjectIndex] = { ...subs[subjectIndex], subjectName: value };
        updatedMarksData[studentIndex] = { ...updatedMarksData[studentIndex], subjects: subs };
        setMarksData(updatedMarksData);
    };

    // Update marks
    const updateMarks = (studentIndex, subjectIndex, value) => {
        const updatedMarksData = [...marksData];
        const subs = [...getSafeSubjects(updatedMarksData[studentIndex])];
        subs[subjectIndex] = { ...subs[subjectIndex], marks: value };
        updatedMarksData[studentIndex] = { ...updatedMarksData[studentIndex], subjects: subs };
        setMarksData(updatedMarksData);
    };

    // Update total marks
    const updateTotalMarks = (studentIndex, subjectIndex, value) => {
        const updatedMarksData = [...marksData];
        const subs = [...getSafeSubjects(updatedMarksData[studentIndex])];
        subs[subjectIndex] = { ...subs[subjectIndex], totalMarks: parseInt(value) || 100 };
        updatedMarksData[studentIndex] = { ...updatedMarksData[studentIndex], subjects: subs };
        setMarksData(updatedMarksData);
    };

    // Update individual result
    const updateResult = async (resultId, updatedData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/results/${resultId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Success', 'Result updated successfully!', 'success');
                // Refresh the results
                if (selectedCard) {
                    fetchFilteredResults(selectedCard);
                }
            } else {
                throw new Error(data.message || 'Failed to update result');
            }
        } catch (error) {
            console.error('Update result error:', error);
            Swal.fire('Error', error.message || 'Failed to update result', 'error');
        }
    };

    // Calculate grade
    const calculateGrade = (percentage) => {
        if (percentage >= 80) return 'A+';
        if (percentage >= 70) return 'A';
        if (percentage >= 60) return 'A-';
        if (percentage >= 50) return 'B';
        if (percentage >= 40) return 'C';
        if (percentage >= 33) return 'D';
        return 'F';
    };

    // Calculate student totals across all subjects
    const calculateStudentTotal = (studentMarks) => {
        const subjects = Array.isArray(studentMarks.subjects) ? studentMarks.subjects : [];
        const totalObtained = subjects.reduce((sum, s) => sum + (parseFloat(s.marks) || 0), 0);
        const totalMarks = subjects.reduce((sum, s) => sum + (parseInt(s.totalMarks) || 0), 0);
        const percentage = totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;
        const grade = calculateGrade(percentage);
        const status = percentage >= 33 ? 'Pass' : 'Fail';
        return {
            totalObtained: totalObtained.toFixed(2),
            totalMarks,
            percentage: percentage.toFixed(2),
            grade,
            status
        };
    };

    // Save a single student's result
    const saveStudentResult = async (studentIndex) => {
        const student = marksData[studentIndex];
        const subs = getSafeSubjects(student);

        if (subs.some(s => s.subjectName === '' || s.marks === '' || s.marks === null)) {
            Swal.fire('Error', 'Please enter subject name and marks for this student', 'error');
            return;
        }
        if (!examName) {
            Swal.fire('Error', 'Please enter Exam Name before saving', 'error');
            return;
        }

        try {
            setSavingIndex(studentIndex);
            const payload = [{
                studentId: student.studentId,
                studentName: student.studentName,
                rollNumber: student.rollNumber,
                class: selectedClass,
                section: selectedSection,
                examName,
                examType,
                academicYear,
                subjects: subs
            }];

            const response = await fetch(`${API_BASE_URL}/results/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results: payload })
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Saved!', text: `${student.studentName}'s results saved.`, timer: 1500, showConfirmButton: false });
            } else {
                throw new Error(data.message || 'Failed to save');
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to save result', 'error');
        } finally {
            setSavingIndex(null);
        }
    };

    // Save results
    const saveResults = async () => {
        // Validate all fields are entered
        const invalidEntries = marksData.some(student =>
            !Array.isArray(student.subjects) ||
            student.subjects.some(s => s.subjectName === '' || s.marks === '' || s.marks === null)
        );

        if (invalidEntries) {
            Swal.fire('Error', 'Please enter subject name and marks for all students', 'error');
            return;
        }

        try {
            setLoading(true);
            
            const resultsPayload = marksData.map(student => ({
                studentId: student.studentId,
                studentName: student.studentName,
                rollNumber: student.rollNumber,
                class: selectedClass,
                section: selectedSection,
                examName,
                examType,
                academicYear,
                subjects: getSafeSubjects(student)
            }));

            const response = await fetch(`${API_BASE_URL}/results/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ results: resultsPayload })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Success', 'All results saved successfully!', 'success');
                fetchResults();
            } else {
                throw new Error(data.message || 'Failed to save results');
            }
        } catch (error) {
            console.error('Error saving results:', error);
            Swal.fire('Error', error.message || 'Failed to save results', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch saved results
    const fetchResults = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/results`;
            const params = new URLSearchParams();
            
            if (selectedClass) params.append('class', selectedClass);
            if (selectedSection) params.append('section', selectedSection);
            if (examName) params.append('examName', examName);
            if (academicYear) params.append('academicYear', academicYear);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setResults(data.data);
                setViewMode('view');
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            Swal.fire('Error', 'Failed to load results', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch class/section cards for overview
    const fetchClassSectionCards = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/results`);
            const data = await response.json();

            if (data.success) {
                // Step 1: Group by class+section+examName+academicYear (full exam groups)
                const examGrouped = data.data.reduce((acc, result) => {
                    const key = `${result.class}-${result.section}-${result.examName}-${result.academicYear}`;
                    if (!acc[key]) {
                        acc[key] = {
                            class: result.class,
                            section: result.section,
                            examName: result.examName,
                            academicYear: result.academicYear,
                            totalStudents: 0,
                            passed: 0,
                            failed: 0,
                            averagePercentage: 0,
                            // track latest createdAt in this exam group
                            _latestCreatedAt: result.createdAt || ''
                        };
                    }
                    acc[key].totalStudents += 1;
                    if (result.status === 'Pass') acc[key].passed += 1;
                    else acc[key].failed += 1;
                    acc[key].averagePercentage += result.percentage;
                    // keep the most recent createdAt for tie-breaking
                    if ((result.createdAt || '') > acc[key]._latestCreatedAt) {
                        acc[key]._latestCreatedAt = result.createdAt || '';
                    }
                    return acc;
                }, {});

                const allCards = Object.values(examGrouped).map(card => ({
                    ...card,
                    averagePercentage: (card.averagePercentage / card.totalStudents).toFixed(2)
                }));

                // Step 2: For each class+section keep only the LATEST exam card
                // Latest = highest academicYear; if tied, highest _latestCreatedAt
                const latestPerClassSection = allCards.reduce((acc, card) => {
                    const key = `${card.class}-${card.section}`;
                    if (!acc[key]) {
                        acc[key] = card;
                    } else {
                        const existing = acc[key];
                        const newYear = parseInt(card.academicYear) || 0;
                        const exYear  = parseInt(existing.academicYear) || 0;
                        if (
                            newYear > exYear ||
                            (newYear === exYear && (card._latestCreatedAt || '') > (existing._latestCreatedAt || ''))
                        ) {
                            acc[key] = card;
                        }
                    }
                    return acc;
                }, {});

                const cards = Object.values(latestPerClassSection).map(({ _latestCreatedAt, ...rest }) => rest);

                setClassSectionCards(cards);
            }
        } catch (error) {
            console.error('Error fetching class section cards:', error);
        }
    };

    // Handle card click
    const handleCardClick = (card) => {
        setSelectedCard(card);
        // Set filters and fetch results
        setSelectedClass(card.class);
        setSelectedSection(card.section);
        setExamName(card.examName);
        setAcademicYear(card.academicYear);
        setEditedResults({}); // Reset edited results
        fetchFilteredResults(card);
    };

    // Fetch filtered results for selected card
    const fetchFilteredResults = async (card) => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/results?class=${card.class}&section=${card.section}&examName=${card.examName}&academicYear=${card.academicYear}`
            );
            const data = await response.json();

            if (data.success) {
                setResults(data.data);
                setEditedResults({}); // Reset edited results
            }
        } catch (error) {
            console.error('Error fetching filtered results:', error);
            Swal.fire('Error', 'Failed to load results', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Export to Excel (CSV)
    const exportToExcel = () => {
        if (results.length === 0) {
            Swal.fire('Error', 'No results to export', 'error');
            return;
        }

        // Create CSV content
        const title = selectedCard 
            ? `Results - ${selectedCard.class} ${selectedCard.section} (${selectedCard.examName})`
            : 'All Results Export';
        let csvContent = `${title}\n\n`;
        
        // Headers
        const headers = selectedCard 
            ? ['Roll', 'Student Name', 'Subject Name', 'Marks', 'Total Marks', 'Percentage', 'Grade', 'Status', 'Merit Position']
            : ['Class', 'Section', 'Exam Name', 'Exam Type', 'Academic Year', 'Roll', 'Student Name', 'Subject Name', 'Marks', 'Total Marks', 'Percentage', 'Grade', 'Status', 'Merit Position'];
        csvContent += headers.join(',') + '\n';

        // Data rows — one row per subject per student
        results.forEach(result => {
            const subs = Array.isArray(result.subjects) && result.subjects.length ? result.subjects : [{ subjectName: 'N/A', marks: 'N/A', totalMarks: 'N/A' }];
            subs.forEach((sub, si) => {
                const row = selectedCard
                    ? [
                        si === 0 ? result.rollNumber : '',
                        si === 0 ? `"${result.studentName}"` : '',
                        sub.subjectName,
                        sub.marks,
                        sub.totalMarks,
                        si === 0 ? result.percentage + '%' : '',
                        si === 0 ? result.grade : '',
                        si === 0 ? result.status : '',
                        si === 0 ? (result.meritPosition || 'N/A') : ''
                    ]
                    : [
                        si === 0 ? result.class : '',
                        si === 0 ? result.section : '',
                        si === 0 ? result.examName : '',
                        si === 0 ? result.examType : '',
                        si === 0 ? result.academicYear : '',
                        si === 0 ? result.rollNumber : '',
                        si === 0 ? `"${result.studentName}"` : '',
                        sub.subjectName,
                        sub.marks,
                        sub.totalMarks,
                        si === 0 ? result.percentage + '%' : '',
                        si === 0 ? result.grade : '',
                        si === 0 ? result.status : '',
                        si === 0 ? (result.meritPosition || 'N/A') : ''
                    ];
                csvContent += row.join(',') + '\n';
            });
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = selectedCard 
            ? `Results_${selectedCard.class}_${selectedCard.section}_${selectedCard.examName}.csv`
            : `All_Results_Export.csv`;
        link.click();

        Swal.fire('Success', 'Results exported to Excel', 'success');
    };

    // Print results
    const printResults = () => {
        if (results.length === 0) {
            Swal.fire('Error', 'No results to print', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        const printContent = document.getElementById('print-pdf-content').innerHTML;
        
        printWindow.document.write(`
            <html>
            <head>
                <title>${selectedCard ? `Results - ${selectedCard.class} ${selectedCard.section}` : 'All Results Report'}</title>
                <style>
                    body { 
                        font-family: 'Tiro Bangla','Tiro Bangla Static',serif; 
                        margin: 0; 
                        padding: 20px; 
                        background-color: white;
                        color: #1f2937;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                        font-size: 12px;
                    }
                    th, td { 
                        border: 1px solid #374151; 
                        padding: 8px; 
                        text-align: center; 
                    }
                    th { 
                        background-color: #3b82f6; 
                        color: white; 
                        font-weight: bold;
                        padding: 12px 8px;
                    }
                    tr:nth-child(even) { 
                        background-color: #f9fafb; 
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #374151; 
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 28px;
                        font-weight: bold;
                        color: #1f2937;
                        margin: 0;
                    }
                    .header h2 {
                        font-size: 20px;
                        color: #6b7280;
                        margin: 10px 0;
                    }
                    .header p {
                        font-size: 14px;
                        color: #9ca3af;
                    }
                    .stats {
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-around;
                        background-color: #f3f4f6;
                        padding: 15px;
                        border-radius: 8px;
                    }
                    .stat-item {
                        text-align: center;
                    }
                    .stat-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1f2937;
                    }
                    .stat-label {
                        font-size: 12px;
                        color: #6b7280;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 10px;
                        color: #9ca3af;
                    }
                    .pass { 
                        background-color: #d1fae5; 
                        color: #065f46; 
                        padding: 4px 8px; 
                        border-radius: 12px; 
                        font-weight: bold; 
                    }
                    .fail { 
                        background-color: #fee2e2; 
                        color: #991b1b; 
                        padding: 4px 8px; 
                        border-radius: 12px; 
                        font-weight: bold; 
                    }
                    .grade-a-plus { background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
                    .grade-a { background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
                    .grade-f { background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
                    .grade-other { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
                    @media print {
                        body { margin: 0; }
                        button { display: none; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.onload = function() {
            printWindow.print();
        };
    };

    // Download individual student result card as PDF
    const downloadStudentCard = (result) => {
        const resSubs = Array.isArray(result.subjects) && result.subjects.length
            ? result.subjects
            : [{ subjectName: 'N/A', marks: 0, totalMarks: 100 }];
        const totalObtained = resSubs.reduce((s, sub) => s + (parseFloat(sub.marks) || 0), 0);
        const totalMarks   = resSubs.reduce((s, sub) => s + (parseInt(sub.totalMarks) || 0), 0);
        const percentage   = totalMarks > 0 ? (totalObtained / totalMarks * 100).toFixed(2) : '0.00';
        const grade        = calculateGrade(parseFloat(percentage));
        const status       = parseFloat(percentage) >= 33 ? 'Pass' : 'Fail';
        const meritPos     = result.meritPosition ? `#${result.meritPosition}` : '-';
        const statusColor  = status === 'Pass' ? '#16a34a' : '#dc2626';
        const gradeColor   = grade === 'A+' ? '#16a34a' : grade === 'A' ? '#1d4ed8' : grade === 'F' ? '#dc2626' : '#b45309';
        const pctNum       = parseFloat(percentage);
        const barColor     = pctNum >= 80 ? '#16a34a' : pctNum >= 60 ? '#2563eb' : pctNum >= 33 ? '#d97706' : '#dc2626';
        const classInfo    = selectedCard ? `${selectedCard.class} - Section ${selectedCard.section}` : '';
        const examInfo     = selectedCard ? `${selectedCard.examName}` : result.examName || '';
        const yearInfo     = selectedCard ? selectedCard.academicYear : result.academicYear || '';

        // Build rows HTML
        const rows = resSubs.map((sub, i) => {
            const pct = sub.totalMarks > 0 ? ((parseFloat(sub.marks) || 0) / parseInt(sub.totalMarks) * 100).toFixed(1) : '0.0';
            const bg  = i % 2 === 0 ? '#f8fafc' : '#fff';
            return `
                <tr style="background:${bg};">
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-weight:600;font-size:13px;">${i + 1}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#1e293b;font-weight:500;font-size:13px;">${sub.subjectName}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;color:#1e40af;font-size:13px;">${sub.marks}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:13px;">${sub.totalMarks}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:13px;">${pct}%</td>
                </tr>`;
        }).join('');

        const cardHTML = `
            <div id="student-result-card" style="
                width:720px;
                background:#fff;
                font-family:'Segoe UI',Arial,sans-serif;
                border-radius:16px;
                overflow:hidden;
                box-shadow:0 4px 32px rgba(0,0,0,0.13);
                border:1px solid #e2e8f0;
            ">
                <!-- Header gradient banner -->
                <div style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%);padding:32px 36px 28px;position:relative;overflow:hidden;">
                    <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:rgba(255,255,255,0.06);border-radius:50%;"></div>
                    <div style="position:absolute;bottom:-60px;left:-30px;width:220px;height:220px;background:rgba(255,255,255,0.04);border-radius:50%;"></div>
                    <div style="position:relative;z-index:1;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                            <div>
                                <div style="font-size:11px;font-weight:600;letter-spacing:2px;color:rgba(255,255,255,0.65);text-transform:uppercase;margin-bottom:4px;">Official Result Card</div>
                                <div style="font-size:24px;font-weight:800;color:#fff;line-height:1.2;">School Management System</div>
                            </div>
                            <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;border:2px solid rgba(255,255,255,0.25);">🎓</div>
                        </div>
                        <div style="display:flex;gap:16px;flex-wrap:wrap;">
                            ${classInfo ? `<span style="background:rgba(255,255,255,0.15);color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.25);">🏫 ${classInfo}</span>` : ''}
                            ${examInfo  ? `<span style="background:rgba(255,255,255,0.15);color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.25);">📋 ${examInfo}</span>`  : ''}
                            ${yearInfo  ? `<span style="background:rgba(255,255,255,0.15);color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.25);">📅 ${yearInfo}</span>`  : ''}
                        </div>
                    </div>
                </div>

                <!-- Student identity strip -->
                <div style="background:#f1f5f9;padding:20px 36px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:16px;">
                    <div style="display:flex;align-items:center;gap:16px;">
                        <div style="width:52px;height:52px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:800;flex-shrink:0;">
                            ${(result.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-size:19px;font-weight:800;color:#1e293b;">${result.studentName}</div>
                            <div style="font-size:12px;color:#64748b;font-weight:500;margin-top:2px;">Roll No: <strong style="color:#1e3a8a;">${result.rollNumber}</strong></div>
                        </div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Merit Position</div>
                        <div style="font-size:22px;font-weight:800;color:#1e3a8a;">${meritPos}</div>
                    </div>
                </div>

                <!-- Subject table -->
                <div style="padding:24px 36px 0;">
                    <div style="font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Subject-wise Performance</div>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:linear-gradient(90deg,#1e3a8a,#2563eb);">
                                <th style="padding:11px 14px;text-align:left;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;">#</th>
                                <th style="padding:11px 14px;text-align:left;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;">Subject</th>
                                <th style="padding:11px 14px;text-align:center;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;">Obtained</th>
                                <th style="padding:11px 14px;text-align:center;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;">Total</th>
                                <th style="padding:11px 14px;text-align:center;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;">%</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>

                <!-- Summary row -->
                <div style="margin:20px 36px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
                    <div style="text-align:center;flex:1;">
                        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Total Marks</div>
                        <div style="font-size:20px;font-weight:800;color:#1e293b;">${totalObtained} <span style="font-size:14px;color:#64748b;font-weight:500;">/ ${totalMarks}</span></div>
                    </div>
                    <div style="width:1px;height:40px;background:#e2e8f0;"></div>
                    <div style="text-align:center;flex:1;">
                        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Percentage</div>
                        <div style="font-size:20px;font-weight:800;color:${barColor};">${percentage}%</div>
                    </div>
                    <div style="width:1px;height:40px;background:#e2e8f0;"></div>
                    <div style="text-align:center;flex:1;">
                        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Grade</div>
                        <div style="font-size:20px;font-weight:800;color:${gradeColor};">${grade}</div>
                    </div>
                    <div style="width:1px;height:40px;background:#e2e8f0;"></div>
                    <div style="text-align:center;flex:1;">
                        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Result</div>
                        <div style="font-size:20px;font-weight:800;color:${statusColor};">${status}</div>
                    </div>
                </div>

                <!-- Percentage bar -->
                <div style="margin:16px 36px 0;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span style="font-size:11px;font-weight:600;color:#64748b;">Score Progress</span>
                        <span style="font-size:11px;font-weight:700;color:${barColor};">${percentage}%</span>
                    </div>
                    <div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${Math.min(parseFloat(percentage), 100)}%;background:linear-gradient(90deg,${barColor},${barColor}cc);border-radius:999px;"></div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="margin:20px 36px 0;padding:16px 0 24px;border-top:1px dashed #e2e8f0;display:flex;align-items:center;justify-content:space-between;">
                    <div style="font-size:11px;color:#94a3b8;">Generated: ${new Date().toLocaleDateString('en-BD', { year:'numeric', month:'long', day:'numeric' })}</div>
                    <div style="font-size:11px;color:#94a3b8;">School Management System &copy; ${new Date().getFullYear()}</div>
                </div>
            </div>`;

        // Inject hidden container, capture, then remove
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
        wrapper.innerHTML = cardHTML;
        document.body.appendChild(wrapper);

        const cardEl = wrapper.querySelector('#student-result-card');

        Swal.fire({ title: 'Generating Result Card...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        html2canvas(cardEl, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff', logging: false }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const imgW = pageW - 20;
            const imgH = (canvas.height * imgW) / canvas.width;
            pdf.addImage(imgData, 'PNG', 10, 15, imgW, imgH);
            pdf.save(`Result_Card_${result.studentName}_${result.rollNumber}.pdf`);
            document.body.removeChild(wrapper);
            Swal.fire({ icon: 'success', title: 'Downloaded!', text: `Result card for ${result.studentName} saved.`, timer: 2000, showConfirmButton: false });
        }).catch(() => {
            document.body.removeChild(wrapper);
            Swal.fire('Error', 'Could not generate result card.', 'error');
        });
    };

    // Download as PDF
    const downloadPDF = () => {
        if (results.length === 0) {
            Swal.fire('Error', 'No results to download', 'error');
            return;
        }

        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const element = document.getElementById('print-pdf-content');
        
        if (!element) {
            Swal.close();
            Swal.fire('Error', 'Print content not found', 'error');
            return;
        }

        // Temporarily show the element for capture
        const originalDisplay = element.style.display;
        element.style.display = 'block';

        html2canvas(element, { 
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // Restore original display
            element.style.display = originalDisplay;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            
            const imgWidth = 280;
            const pageHeight = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            // Add first page
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(selectedCard 
                ? `Results_${selectedCard.class}_${selectedCard.section}_${selectedCard.examName}.pdf`
                : `All_Results_Report.pdf`
            );
            
            Swal.close();
            Swal.fire('Success', 'PDF downloaded successfully', 'success');
        }).catch(error => {
            // Restore original display
            element.style.display = originalDisplay;
            console.error('PDF generation error:', error);
            Swal.close();
            Swal.fire('Error', 'Failed to generate PDF. Please try again.', 'error');
        });
    };

    return (
        <div className="min-h-screen bg-white p-2 sm:p-4 lg:p-6">
            <div className="container mx-auto container">
                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-blue-900">
                                📊 Marks & Results Management
                            </h1>
                            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Professional examination results management system</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => setViewMode('entry')}
                                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                                    viewMode === 'entry'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                📝 Entry Mode
                            </button>
                            <button
                                onClick={() => {
                                    fetchClassSectionCards();
                                    setViewMode('view');
                                    setSelectedCard(null);
                                }}
                                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                                    viewMode === 'view'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                👁️ View Results
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-4 sm:mb-6">🎯 Selection Criteria</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                        {/* Class Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            >
                                <option value="">Select Class</option>
                                {classes.map((cls, index) => (
                                    <option key={index} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>

                        {/* Section Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Section</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                                disabled={!selectedClass}
                            >
                                <option value="">Select Section</option>
                                {sections.map((section, index) => (
                                    <option key={index} value={section}>{section}</option>
                                ))}
                            </select>
                        </div>

                        {/* Exam Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Exam Name</label>
                            <input
                                type="text"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                                placeholder="e.g., First Terminal"
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>

                        {/* Exam Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Exam Type</label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            >
                                <option value="">Select Type</option>
                                <option value="Terminal">Terminal</option>
                                <option value="Mid-Term">Mid-Term</option>
                                <option value="Final">Final</option>
                                <option value="Class Test">Class Test</option>
                                <option value="Unit Test">Unit Test</option>
                            </select>
                        </div>

                        {/* Academic Year */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Academic Year</label>
                            <input
                                type="text"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                placeholder="2026"
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            />
                        </div>
                    </div>
                </div>

                {/* Entry Mode */}
                {viewMode === 'entry' && (
                    <>


                        {/* Marks Entry Table */}
                        {students.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                                    <h2 className="text-lg sm:text-xl font-bold text-blue-900">✍️ Marks Entry</h2>
                                    <button
                                        onClick={saveResults}
                                        disabled={loading}
                                        className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        {loading ? 'Saving...' : '💾 Save Results'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {marksData.map((student, studentIndex) => {
                                        const subjects = getSafeSubjects(student);
                                        const totals = calculateStudentTotal(student);
                                        return (
                                            <div key={student.studentId} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                                {/* Student Header */}
                                                <div className="bg-blue-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-gray-500 bg-white border border-gray-300 rounded px-2 py-0.5">Roll: {student.rollNumber}</span>
                                                        <span className="text-sm font-bold text-blue-900">{student.studentName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs text-gray-600 font-medium">{totals.totalObtained}/{totals.totalMarks}</span>
                                                        <span className="text-xs font-bold text-blue-800">{totals.percentage}%</span>
                                                        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                                            totals.grade === 'A+' ? 'bg-green-100 text-green-800' :
                                                            totals.grade === 'A' ? 'bg-blue-100 text-blue-800' :
                                                            totals.grade === 'F' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>{totals.grade}</span>
                                                        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${totals.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {totals.status}
                                                        </span>
                                                        <button
                                                            onClick={() => saveStudentResult(studentIndex)}
                                                            disabled={savingIndex === studentIndex}
                                                            className="px-3 py-1 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors text-xs disabled:opacity-50"
                                                        >
                                                            {savingIndex === studentIndex ? 'Saving...' : '💾 Save'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Subjects Table */}
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse text-xs sm:text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-100 text-gray-600">
                                                                <th className="px-3 py-2 text-left font-semibold">#</th>
                                                                <th className="px-3 py-2 text-left font-semibold">Subject Name</th>
                                                                <th className="px-3 py-2 text-center font-semibold">Marks Obtained</th>
                                                                <th className="px-3 py-2 text-center font-semibold">Total Marks</th>
                                                                <th className="px-3 py-2 text-center font-semibold">Remove</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {subjects.map((sub, subIndex) => (
                                                                <tr key={subIndex} className={subIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                    <td className="px-3 py-2 text-gray-400 font-bold">{subIndex + 1}</td>
                                                                    <td className="px-3 py-2">
                                                                        <input
                                                                            type="text"
                                                                            value={sub.subjectName}
                                                                            onChange={(e) => updateSubjectName(studentIndex, subIndex, e.target.value)}
                                                                            className="w-full px-2 py-1.5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                                                                            placeholder="e.g. Bangla, English, Math"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center">
                                                                        <input
                                                                            type="number"
                                                                            value={sub.marks}
                                                                            onChange={(e) => updateMarks(studentIndex, subIndex, e.target.value)}
                                                                            className="w-20 px-2 py-1.5 border-2 border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                                                                            min="0"
                                                                            max={sub.totalMarks}
                                                                            placeholder="0"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center">
                                                                        <input
                                                                            type="number"
                                                                            value={sub.totalMarks}
                                                                            onChange={(e) => updateTotalMarks(studentIndex, subIndex, e.target.value)}
                                                                            className="w-20 px-2 py-1.5 border-2 border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                                                                            min="1"
                                                                            placeholder="100"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center">
                                                                        <button
                                                                            onClick={() => removeSubject(studentIndex, subIndex)}
                                                                            disabled={subjects.length === 1}
                                                                            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed transition-colors mx-auto"
                                                                            title="Remove subject"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Add Subject Button */}
                                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                                                    <button
                                                        onClick={() => addSubject(studentIndex)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                                                    >
                                                        <span className="text-base leading-none">+</span> Add Subject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* View Mode - Results Cards and Table */}
                {viewMode === 'view' && (
                    <>
                        {!selectedCard ? (
                            // Class/Section Cards View
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                                    <h2 className="text-lg sm:text-xl font-bold text-blue-900">📚 Class & Section Results</h2>
                                    <button
                                        onClick={() => fetchResults()}
                                        className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        🔍 View All Results
                                    </button>
                                </div>

                                {classSectionCards.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {classSectionCards.map((card, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleCardClick(card)}
                                                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all hover:border-blue-400"
                                            >
                                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                    <h3 className="text-lg sm:text-xl font-bold text-blue-900">
                                                        {card.class} - {card.section}
                                                    </h3>
                                                    <div className="text-xl sm:text-2xl">📊</div>
                                                </div>
                                                
                                                <div className="space-y-1 sm:space-y-2">
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        <span className="font-semibold">Exam:</span> {card.examName}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        <span className="font-semibold">Year:</span> {card.academicYear}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        <span className="font-semibold">Students:</span> {card.totalStudents}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        <span className="font-semibold">Passed:</span> {card.passed} | 
                                                        <span className="font-semibold"> Failed:</span> {card.failed}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        <span className="font-semibold">Avg %:</span> {card.averagePercentage}%
                                                    </p>
                                                </div>
                                                
                                                <div className="mt-3 sm:mt-4 text-center">
                                                    <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors text-xs sm:text-sm">
                                                        View Details →
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="text-4xl sm:text-6xl mb-4">📊</div>
                                        <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2">No Results Found</h3>
                                        <p className="text-gray-600 text-sm sm:text-base">No results have been saved in the system yet</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Detailed Results View with Edit Capability
                            <>
                                {/* Back Button */}
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                                    <button
                                        onClick={() => setSelectedCard(null)}
                                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all text-sm sm:text-base"
                                    >
                                        ← Back to Overview
                                    </button>
                                    <h2 className="text-lg sm:text-xl font-bold text-blue-900 mt-2 sm:mt-4">
                                        📋 Results for {selectedCard.class} - {selectedCard.section} ({selectedCard.examName})
                                    </h2>
                                </div>

                                {/* Action Buttons */}
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
                                        <button
                                            onClick={exportToExcel}
                                            className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-sm sm:text-base w-full sm:w-auto"
                                        >
                                            📊 Export to Excel
                                        </button>
                                        <button
                                            onClick={downloadPDF}
                                            className="px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all text-sm sm:text-base w-full sm:w-auto"
                                        >
                                            📄 Download PDF
                                        </button>
                                        <button
                                            onClick={printResults}
                                            className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all text-sm sm:text-base w-full sm:w-auto"
                                        >
                                            🖨️ Print Results
                                        </button>
                                    </div>
                                </div>

                                {/* Statistics Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-xs sm:text-sm">Total Students</p>
                                                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{results.length}</p>
                                            </div>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center">
                                                <span className="text-blue-900 text-lg sm:text-xl">👥</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-xs sm:text-sm">Passed</p>
                                                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                                                    {results.filter(r => r.status === 'Pass').length}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center">
                                                <span className="text-blue-900 text-lg sm:text-xl">✅</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-xs sm:text-sm">Failed</p>
                                                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                                                    {results.filter(r => r.status === 'Fail').length}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center">
                                                <span className="text-blue-900 text-lg sm:text-xl">❌</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-xs sm:text-sm">Average %</p>
                                                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
                                                    {(results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2)}%
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center">
                                                <span className="text-blue-900 text-lg sm:text-xl">📈</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results — card-based view + inline edit per student */}
                                <div id="results-table-print" className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
                                    <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-4 sm:mb-6">📋 Student Results</h2>
                                    <div className="space-y-4">
                                        {results.map((result, index) => {
                                            const resSubs = Array.isArray(result.subjects) && result.subjects.length
                                                ? result.subjects
                                                : [{ subjectName: 'N/A', marks: 0, totalMarks: 100 }];
                                            const isEditing = !!editedResults[result._id];
                                            const editedSubs = editedResults[result._id]?.subjects ?? resSubs.map(s => ({ ...s }));

                                            // Live totals (updates as user edits)
                                            const liveSubs = isEditing ? editedSubs : resSubs;
                                            const liveTotalObtained = liveSubs.reduce((s, sub) => s + (parseFloat(sub.marks) || 0), 0);
                                            const liveTotalMarks = liveSubs.reduce((s, sub) => s + (parseInt(sub.totalMarks) || 0), 0);
                                            const livePercentage = liveTotalMarks > 0 ? (liveTotalObtained / liveTotalMarks * 100).toFixed(2) : '0.00';
                                            const liveGrade = calculateGrade(parseFloat(livePercentage));
                                            const liveStatus = parseFloat(livePercentage) >= 33 ? 'Pass' : 'Fail';

                                            return (
                                                <div key={result._id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                                    {/* Student header */}
                                                    <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 ${isEditing ? 'bg-blue-100' : 'bg-blue-50'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-300 rounded px-2 py-0.5">#{index + 1}</span>
                                                            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-300 rounded px-2 py-0.5">Roll: {result.rollNumber}</span>
                                                            <span className="text-sm font-bold text-blue-900">{result.studentName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs text-gray-600 font-medium">{liveTotalObtained}/{liveTotalMarks}</span>
                                                            <span className="text-xs font-bold text-blue-800">{livePercentage}%</span>
                                                            <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                                                                liveGrade === 'A+' ? 'bg-green-100 text-green-800' :
                                                                liveGrade === 'A' ? 'bg-blue-100 text-blue-800' :
                                                                liveGrade === 'F' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>{liveGrade}</span>
                                                            <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${liveStatus === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {liveStatus}
                                                            </span>
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            updateResult(result._id, { ...result, subjects: editedSubs });
                                                                            setEditedResults(prev => { const c = { ...prev }; delete c[result._id]; return c; });
                                                                        }}
                                                                        className="px-3 py-1 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors text-xs"
                                                                    >
                                                                        ✓ Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditedResults(prev => { const c = { ...prev }; delete c[result._id]; return c; })}
                                                                        className="px-3 py-1 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500 transition-colors text-xs"
                                                                    >
                                                                        ✕ Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => downloadStudentCard(result)}
                                                                        className="px-3 py-1 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition-colors text-xs"
                                                                        title="Download Result Card PDF"
                                                                    >
                                                                        📥 Card
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditedResults(prev => ({
                                                                            ...prev,
                                                                            [result._id]: { subjects: resSubs.map(s => ({ ...s })) }
                                                                        }))}
                                                                        className="px-3 py-1 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-colors text-xs"
                                                                    >
                                                                        ✏️ Edit
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Subjects table */}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse text-xs sm:text-sm">
                                                            <thead>
                                                                <tr className="bg-gray-100 text-gray-600">
                                                                    <th className="px-3 py-2 text-left font-semibold">#</th>
                                                                    <th className="px-3 py-2 text-left font-semibold">Subject Name</th>
                                                                    <th className="px-3 py-2 text-center font-semibold">Marks</th>
                                                                    <th className="px-3 py-2 text-center font-semibold">Total</th>
                                                                    {isEditing && <th className="px-3 py-2 text-center font-semibold">Remove</th>}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(isEditing ? editedSubs : resSubs).map((sub, si) => (
                                                                    <tr key={si} className={si % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className="px-3 py-2 text-gray-400 font-bold">{si + 1}</td>
                                                                        <td className="px-3 py-2">
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="text"
                                                                                    value={sub.subjectName}
                                                                                    onChange={(e) => {
                                                                                        const n = editedSubs.map((s, i) => i === si ? { ...s, subjectName: e.target.value } : s);
                                                                                        setEditedResults(prev => ({ ...prev, [result._id]: { subjects: n } }));
                                                                                    }}
                                                                                    className="w-full px-2 py-1.5 border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                                                                                    placeholder="Subject Name"
                                                                                />
                                                                            ) : (
                                                                                <span className="font-medium">{sub.subjectName}</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center">
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={sub.marks}
                                                                                    onChange={(e) => {
                                                                                        const n = editedSubs.map((s, i) => i === si ? { ...s, marks: e.target.value } : s);
                                                                                        setEditedResults(prev => ({ ...prev, [result._id]: { subjects: n } }));
                                                                                    }}
                                                                                    className="w-20 px-2 py-1.5 border-2 border-blue-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                                                                                    min="0"
                                                                                />
                                                                            ) : (
                                                                                <span className="font-semibold text-blue-800">{sub.marks}</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center">
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="number"
                                                                                    value={sub.totalMarks}
                                                                                    onChange={(e) => {
                                                                                        const n = editedSubs.map((s, i) => i === si ? { ...s, totalMarks: parseInt(e.target.value) || 100 } : s);
                                                                                        setEditedResults(prev => ({ ...prev, [result._id]: { subjects: n } }));
                                                                                    }}
                                                                                    className="w-20 px-2 py-1.5 border-2 border-blue-300 rounded text-center focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                                                                                    min="1"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-gray-600">{sub.totalMarks}</span>
                                                                            )}
                                                                        </td>
                                                                        {isEditing && (
                                                                            <td className="px-3 py-2 text-center">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (editedSubs.length === 1) return;
                                                                                        const n = editedSubs.filter((_, i) => i !== si);
                                                                                        setEditedResults(prev => ({ ...prev, [result._id]: { subjects: n } }));
                                                                                    }}
                                                                                    disabled={editedSubs.length === 1}
                                                                                    className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed transition-colors mx-auto"
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                            </td>
                                                                        )}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Add subject — only in edit mode */}
                                                    {isEditing && (
                                                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                                                            <button
                                                                onClick={() => {
                                                                    const n = [...editedSubs, { subjectName: '', marks: '', totalMarks: 100 }];
                                                                    setEditedResults(prev => ({ ...prev, [result._id]: { subjects: n } }));
                                                                }}
                                                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                                                            >
                                                                <span className="text-base leading-none">+</span> Add Subject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Hidden Print/PDF Content */}
                                <div id="print-pdf-content" style={{ display: 'none' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>School Management System</h1>
                                        <h2 style={{ fontSize: '20px', color: '#6b7280', margin: '10px 0' }}>
                                            {selectedCard ? `Results for ${selectedCard.class} - ${selectedCard.section} (${selectedCard.examName})` : 'All Results Report'}
                                        </h2>
                                        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Academic Year: {selectedCard ? selectedCard.academicYear : academicYear} | Generated on: {new Date().toLocaleDateString()}</p>
                                    </div>
                                    
                                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-around', backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{results.length}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Students</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{results.filter(r => r.status === 'Pass').length}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Passed</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{results.filter(r => r.status === 'Fail').length}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Failed</div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                                                {results.length > 0 ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(2) : '0.00'}%
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Average %</div>
                                        </div>
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '20px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#3b82f6', color: 'white' }}>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Roll</th>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Student Name</th>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Subject Name</th>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Marks</th>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Total Marks</th>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>%</th>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Grade</th>
                                                <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Status</th>
                                                {selectedCard && <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Merit Position</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((result, index) => {
                                                const pSubs = Array.isArray(result.subjects) && result.subjects.length ? result.subjects : [{ subjectName: 'N/A', marks: 'N/A', totalMarks: 'N/A' }];
                                                return pSubs.map((sub, si) => (
                                                    <tr key={`${index}-${si}`} style={{ backgroundColor: si > 0 ? '#f0f9ff' : (index % 2 === 0 ? '#f9fafb' : 'white') }}>
                                                        {si === 0 && (
                                                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }} rowSpan={pSubs.length}>{result.rollNumber}</td>
                                                        )}
                                                        {si === 0 && (
                                                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={pSubs.length}>{result.studentName}</td>
                                                        )}
                                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sub.subjectName}</td>
                                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sub.marks}</td>
                                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{sub.totalMarks}</td>
                                                        {si === 0 && (
                                                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }} rowSpan={pSubs.length}>
                                                                {result.percentage}%
                                                                <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 'normal' }}>
                                                                    {result.totalObtained || ''}/{result.totalMarks || ''}
                                                                </div>
                                                            </td>
                                                        )}
                                                        {si === 0 && (
                                                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={pSubs.length}>
                                                                <span style={{
                                                                    padding: '4px 8px',
                                                                    borderRadius: '12px',
                                                                    fontWeight: 'bold',
                                                                    backgroundColor: result.grade === 'A+' ? '#d1fae5' : result.grade === 'A' ? '#dbeafe' : result.grade === 'F' ? '#fee2e2' : '#fef3c7',
                                                                    color: result.grade === 'A+' ? '#065f46' : result.grade === 'A' ? '#1e40af' : result.grade === 'F' ? '#991b1b' : '#92400e'
                                                                }}>
                                                                    {result.grade}
                                                                </span>
                                                            </td>
                                                        )}
                                                        {si === 0 && (
                                                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={pSubs.length}>
                                                                <span style={{
                                                                    padding: '4px 8px',
                                                                    borderRadius: '12px',
                                                                    fontWeight: 'bold',
                                                                    backgroundColor: result.status === 'Pass' ? '#d1fae5' : '#fee2e2',
                                                                    color: result.status === 'Pass' ? '#065f46' : '#991b1b'
                                                                }}>
                                                                    {result.status}
                                                                </span>
                                                            </td>
                                                        )}
                                                        {selectedCard && si === 0 && <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={pSubs.length}>{result.meritPosition || 'N/A'}</td>}
                                                    </tr>
                                                ));
                                            })}
                                        </tbody>
                                    </table>
                                    
                                    <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
                                        <p>This report is generated by School Management System. For any queries, contact the administration.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Empty State */}
                {viewMode === 'view' && !selectedCard && classSectionCards.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 sm:p-12 text-center">
                        <div className="text-4xl sm:text-6xl mb-4">📊</div>
                        <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">No Results Found</h3>
                        <p className="text-gray-600 text-sm sm:text-base">No results have been saved in the system yet</p>
                    </div>
                )}

                {viewMode === 'entry' && students.length === 0 && selectedClass && selectedSection && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 sm:p-12 text-center">
                        <div className="text-4xl sm:text-6xl mb-4">👥</div>
                        <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">No Students Found</h3>
                        <p className="text-gray-600 text-sm sm:text-base">No active students in selected class and section</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarksResultsPage;
