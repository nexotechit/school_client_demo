'use client';
import React, { useState, useEffect, memo } from 'react';
import { API_BASE_URL } from '../../../../config/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default memo(function PortalAcademics() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentStudent(user);
            if (user._id) {
                fetchStudentResults(user._id);
            } else {
                setError('User ID not found. Please contact administrator.');
                setLoading(false);
            }
        } else {
            setError('User not logged in. Please login first.');
            setLoading(false);
        }
    }, []);

    const fetchStudentResults = async (studentId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/results/student/${studentId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.success) {
                // Sort by academicYear desc, then createdAt desc
                const sorted = [...(data.data || [])].sort((a, b) => {
                    const yearDiff = parseInt(b.academicYear || 0) - parseInt(a.academicYear || 0);
                    if (yearDiff !== 0) return yearDiff;
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                });
                setResults(sorted);
            } else {
                setError(data.message || 'Failed to fetch results');
                setResults([]);
            }
        } catch (err) {
            setError(err.message || 'Failed to connect to server');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const gradeStyle = (grade) => {
        switch (grade) {
            case 'A+': return { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-800 border-green-300' };
            case 'A':  return { bar: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-800 border-blue-300' };
            case 'A-': return { bar: 'bg-cyan-500',   badge: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
            case 'B':  return { bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
            case 'C':  return { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-800 border-orange-300' };
            case 'D':  return { bar: 'bg-red-400',    badge: 'bg-red-100 text-red-700 border-red-300' };
            case 'F':  return { bar: 'bg-red-600',    badge: 'bg-red-100 text-red-800 border-red-400' };
            default:   return { bar: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-700 border-gray-300' };
        }
    };

    const pctBarColor = (pct) => {
        if (pct >= 80) return 'bg-green-500';
        if (pct >= 60) return 'bg-blue-500';
        if (pct >= 40) return 'bg-yellow-500';
        if (pct >= 33) return 'bg-orange-400';
        return 'bg-red-500';
    };

    // Generate professional PDF result card for a single result
    const downloadResultCard = (result) => {
        const studentName = currentStudent?.name || result.studentName || 'Student';
        const rollNumber = currentStudent?.rollNumber || result.rollNumber || '---';
        const resSubs = Array.isArray(result.subjects) && result.subjects.length ? result.subjects : [{ subjectName: 'N/A', marks: 0, totalMarks: 100 }];
        const totalObtained = resSubs.reduce((s, sub) => s + (parseFloat(sub.marks) || 0), 0);
        const totalMarks = resSubs.reduce((s, sub) => s + (parseInt(sub.totalMarks) || 0), 0);
        const percentage = totalMarks > 0 ? (totalObtained / totalMarks * 100).toFixed(2) : '0.00';
        const grade = result.grade || '—';
        const status = result.status || (parseFloat(percentage) >= 33 ? 'Pass' : 'Fail');
        const meritPos = result.meritPosition ? `#${result.meritPosition}` : '-';
        const pctNum = parseFloat(percentage);
        const barColor = pctNum >= 80 ? '#16a34a' : pctNum >= 60 ? '#2563eb' : pctNum >= 33 ? '#d97706' : '#dc2626';

        const rows = resSubs.map((sub, i) => {
            const pct = sub.totalMarks > 0 ? ((parseFloat(sub.marks) || 0) / parseInt(sub.totalMarks) * 100).toFixed(1) : '0.0';
            const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
            return `
                <tr style="background:${bg};">
                    <td style="padding:10px 12px;border-bottom:1px solid #e6edf3;color:#6b7280;font-weight:700;font-size:13px;">${i + 1}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e6edf3;color:#111827;font-weight:600;font-size:13px;">${sub.subjectName}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e6edf3;text-align:center;font-weight:700;color:#1f2937;font-size:13px;">${sub.marks}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e6edf3;text-align:center;color:#6b7280;font-size:13px;">${sub.totalMarks}</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e6edf3;text-align:center;color:#6b7280;font-size:13px;">${pct}%</td>
                </tr>`;
        }).join('');

        const cardHTML = `
            <div id="portal-result-card" style="width:720px;background:#fff;font-family:'Tiro Bangla','Tiro Bangla Static',serif;border-radius:14px;overflow:hidden;border:1px solid #e6edf3;box-shadow:0 8px 40px rgba(2,6,23,0.08);">
                <div style="background:linear-gradient(135deg,#0b5ed7 0%,#2563eb 100%);padding:28px 32px;color:#fff;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="font-size:11px;font-weight:700;opacity:0.9;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Official Result Card</div>
                            <div style="font-size:20px;font-weight:800;">School Management System</div>
                        </div>
                        <div style="width:64px;height:64px;background:rgba(255,255,255,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;border:1px solid rgba(255,255,255,0.18);">🎓</div>
                    </div>
                    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;color:#e6f0ff;font-size:12px;">
                        <div style="background:rgba(255,255,255,0.06);padding:6px 12px;border-radius:16px;">🏫 Class {result.class} - {result.section}</div>
                        <div style="background:rgba(255,255,255,0.06);padding:6px 12px;border-radius:16px;">📋 {result.examName}</div>
                        <div style="background:rgba(255,255,255,0.06);padding:6px 12px;border-radius:16px;">📅 {result.academicYear}</div>
                    </div>
                </div>
                <div style="padding:20px 32px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;gap:12px;background:#f8fafc;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#0b5ed7,#60a5fa);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:20px;">${(studentName || 'S').charAt(0).toUpperCase()}</div>
                        <div>
                            <div style="font-size:16px;font-weight:800;color:#0f172a;">${studentName}</div>
                            <div style="font-size:12px;color:#6b7280;margin-top:2px;">Roll: <strong style="color:#0b5ed7;">${rollNumber}</strong></div>
                        </div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:11px;color:#6b7280;margin-bottom:4px;">Merit Position</div>
                        <div style="font-size:20px;font-weight:800;color:#0b5ed7;">${meritPos}</div>
                    </div>
                </div>
                <div style="padding:20px 32px;">
                    <div style="font-size:13px;font-weight:700;color:#374151;margin-bottom:10px;">Subject-wise Performance</div>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
                        <thead>
                            <tr style="background:#0b5ed7;color:#fff;font-weight:700;font-size:12px;">
                                <th style="padding:10px 12px;text-align:left;">#</th>
                                <th style="padding:10px 12px;text-align:left;">Subject</th>
                                <th style="padding:10px 12px;text-align:center;">Obtained</th>
                                <th style="padding:10px 12px;text-align:center;">Total</th>
                                <th style="padding:10px 12px;text-align:center;">%</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div style="display:flex;gap:16px;align-items:center;justify-content:space-between;background:#f8fafc;padding:12px;border-radius:10px;border:1px solid #eef2ff;">
                        <div style="text-align:center;flex:1;">
                            <div style="font-size:11px;color:#6b7280;">Total Marks</div>
                            <div style="font-size:18px;font-weight:800;color:#0f172a;">${totalObtained} / ${totalMarks}</div>
                        </div>
                        <div style="text-align:center;flex:1;">
                            <div style="font-size:11px;color:#6b7280;">Percentage</div>
                            <div style="font-size:18px;font-weight:800;color:${barColor};">${percentage}%</div>
                        </div>
                        <div style="text-align:center;flex:1;">
                            <div style="font-size:11px;color:#6b7280;">Grade</div>
                            <div style="font-size:18px;font-weight:800;color:#111827;">${grade}</div>
                        </div>
                        <div style="text-align:center;flex:1;">
                            <div style="font-size:11px;color:#6b7280;">Result</div>
                            <div style="font-size:18px;font-weight:800;color:${status === 'Pass' ? '#16a34a' : '#dc2626'};">${status}</div>
                        </div>
                    </div>
                    <div style="margin-top:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#6b7280;margin-top:8px;">
                            <div>Generated: ${new Date().toLocaleDateString()}</div>
                            <div>School Management System</div>
                        </div>
                    </div>
                </div>
            </div>`;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
        wrapper.innerHTML = cardHTML;
        document.body.appendChild(wrapper);

        const cardEl = wrapper.querySelector('#portal-result-card');

        Swal.fire({ title: 'Generating PDF...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        html2canvas(cardEl, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageW = pdf.internal.pageSize.getWidth();
            const imgW = pageW - 20;
            const imgH = (canvas.height * imgW) / canvas.width;
            pdf.addImage(imgData, 'PNG', 10, 15, imgW, imgH);
            pdf.save(`Result_Card_${studentName.replace(/\s+/g,'_')}_${rollNumber}.pdf`);
            document.body.removeChild(wrapper);
            Swal.close();
            Swal.fire({ icon: 'success', title: 'Downloaded', text: `Result card saved for ${studentName}`, timer: 1800, showConfirmButton: false });
        }).catch(err => {
            document.body.removeChild(wrapper);
            Swal.close();
            Swal.fire('Error', 'Could not generate result card.', 'error');
            console.error(err);
        });
    };

    // Loading skeleton
    if (loading) return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="container mx-auto max-w-5xl space-y-6">
                <div className="bg-white rounded-xl p-6 animate-pulse h-24"></div>
                {[1,2].map(i => (
                    <div key={i} className="bg-white rounded-xl p-6 space-y-4 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {[1,2,3,4].map(j => <div key={j} className="h-16 bg-gray-100 rounded-lg"></div>)}
                        </div>
                        <div className="space-y-3 mt-4">
                            {[1,2,3].map(j => <div key={j} className="h-10 bg-gray-50 rounded"></div>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3">
            <div className="container mx-auto">

                {/* Page Header */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 mb-6 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold mb-1">📚 Academic Results</h1>
                            <p className="text-blue-200 text-sm">Subject-wise marks, grades & performance overview</p>
                        </div>
                        {currentStudent && (
                            <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-right">
                                <p className="text-white font-bold">{currentStudent.name || currentStudent.studentName || '—'}</p>
                                <p className="text-blue-200 text-xs">Roll: {currentStudent.rollNumber || '—'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-center">
                        <div className="text-4xl mb-3">⚠️</div>
                        <p className="text-red-700 font-semibold mb-1">Failed to load results</p>
                        <p className="text-gray-500 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => currentStudent && fetchStudentResults(currentStudent._id)}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                            🔄 Try Again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!error && results.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Results Found</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Your examination results will appear here once they are published by the school administration.
                        </p>
                    </div>
                )}

                {/* Results List */}
                {!error && results.length > 0 && (
                    <div className="space-y-6">
                        {results.map((result) => {
                            const subjects = Array.isArray(result.subjects) ? result.subjects : [];
                            const pct = parseFloat(result.percentage) || 0;
                            const gs = gradeStyle(result.grade);

                            return (
                                <div key={result._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                                    {/* Exam Banner */}
                                    <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-lg font-bold text-white">
                                                {result.examName}
                                                {result.examType ? ` — ${result.examType}` : ''}
                                            </h2>
                                            <p className="text-blue-200 text-xs mt-0.5">
                                                Class {result.class} - {result.section} &nbsp;|&nbsp; Academic Year: {result.academicYear}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {result.meritPosition && (
                                                <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                                                    🏆 Position #{result.meritPosition}
                                                </span>
                                            )}

                                            <button
                                                onClick={() => downloadResultCard(result)}
                                                className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold hover:bg-purple-700 transition"
                                                title="Download result card PDF"
                                            >
                                                📥 Download
                                            </button>

                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                result.status === 'Pass'
                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                    : 'bg-red-100 text-red-800 border-red-300'
                                            }`}>
                                                {result.status === 'Pass' ? '✅ Pass' : '❌ Fail'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${gs.badge}`}>
                                                Grade {result.grade}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 border-b border-gray-100">
                                        {[
                                            { label: 'Subjects', value: subjects.length, icon: '📚' },
                                            { label: 'Marks Obtained', value: `${result.totalObtained}/${result.totalMarks}`, icon: '📝' },
                                            { label: 'Percentage', value: `${pct.toFixed(2)}%`, icon: '📊', highlight: true },
                                            { label: 'GPA / CGPA', value: `${result.gpa ?? '—'} / ${result.cgpa ? parseFloat(result.cgpa).toFixed(2) : '—'}`, icon: '⭐' },
                                        ].map((s, i) => (
                                            <div key={i} className="px-4 py-4 text-center">
                                                <span className="text-xl">{s.icon}</span>
                                                <p className={`text-lg font-bold mt-1 ${s.highlight ? 'text-blue-700' : 'text-gray-900'}`}>{s.value}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Overall progress bar */}
                                    <div className="px-6 pt-4 pb-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span className="font-semibold text-gray-700">Overall Performance</span>
                                            <span className="font-bold text-blue-700">{pct.toFixed(2)}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${pctBarColor(pct)}`}
                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Subject-wise table */}
                                    <div className="px-6 pt-4 pb-6">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Subject-wise Results</h3>
                                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wide">
                                                        <th className="px-4 py-3 text-left">#</th>
                                                        <th className="px-4 py-3 text-left">Subject</th>
                                                        <th className="px-4 py-3 text-center">Obtained</th>
                                                        <th className="px-4 py-3 text-center">Total</th>
                                                        <th className="px-4 py-3 text-center">%</th>
                                                        <th className="px-4 py-3 text-center">Grade</th>
                                                        <th className="px-4 py-3 text-center">GPA</th>
                                                        <th className="px-4 py-3 min-w-[120px]">Progress</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {subjects.map((sub, si) => {
                                                        const subPct = sub.totalMarks > 0 ? (parseFloat(sub.marks) / parseInt(sub.totalMarks)) * 100 : 0;
                                                        const sg = gradeStyle(sub.grade);
                                                        return (
                                                            <tr key={si} className={si % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                                <td className="px-4 py-3 text-gray-400 font-semibold">{si + 1}</td>
                                                                <td className="px-4 py-3 font-semibold text-gray-900">{sub.subjectName}</td>
                                                                <td className="px-4 py-3 text-center font-bold text-blue-700">{sub.marks}</td>
                                                                <td className="px-4 py-3 text-center text-gray-500">{sub.totalMarks}</td>
                                                                <td className="px-4 py-3 text-center font-semibold text-gray-700">{subPct.toFixed(1)}%</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${sg.badge}`}>
                                                                        {sub.grade || '—'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-gray-600 font-medium">
                                                                    {sub.gpa !== undefined ? sub.gpa : '—'}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className={`h-2 rounded-full ${sg.bar}`}
                                                                            style={{ width: `${Math.min(subPct, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                {/* Footer row — totals */}
                                                <tfoot>
                                                    <tr className="bg-blue-50 font-bold text-blue-900 border-t-2 border-blue-100">
                                                        <td className="px-4 py-3" colSpan={2}>Total</td>
                                                        <td className="px-4 py-3 text-center">{result.totalObtained}</td>
                                                        <td className="px-4 py-3 text-center">{result.totalMarks}</td>
                                                        <td className="px-4 py-3 text-center">{pct.toFixed(2)}%</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${gs.badge}`}>
                                                                {result.grade}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{result.cgpa ? parseFloat(result.cgpa).toFixed(2) : '—'}</td>
                                                        <td className="px-4 py-3"></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* Footer info */}
                                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                                            <span>📅 Published: <strong className="text-gray-700">{result.publishStatus || '—'}</strong></span>
                                            <span>🗓️ Date: <strong className="text-gray-700">{formatDate(result.createdAt)}</strong></span>
                                            {result.remarks && (
                                                <span className="w-full mt-1 p-2 bg-blue-50 rounded text-blue-800">
                                                    💬 <strong>Remarks:</strong> {result.remarks}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});

