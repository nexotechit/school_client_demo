'use client';
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../../config/api';

/* ─────────────────── helpers ─────────────────── */
const SCHOOL_NAME = 'Greenfield Academy';
const SCHOOL_ADDRESS = '123 School Road, Dhaka-1200';
const SCHOOL_PHONE = '+880-1700-000000';

const ID_TEMPLATES = [
    { id: 'id_blue', label: 'Blue Classic', color: '#1e40af', accent: '#3b82f6', bg: '#eff6ff' },
    { id: 'id_green', label: 'Green Modern', color: '#065f46', accent: '#10b981', bg: '#ecfdf5' },
    { id: 'id_red', label: 'Red Premium', color: '#991b1b', accent: '#ef4444', bg: '#fef2f2' },
];

const ADMIT_TEMPLATES = [
    { id: 'admit_navy', label: 'Navy Official', color: '#1e3a5f', accent: '#2563eb', bg: '#f0f7ff' },
    { id: 'admit_maroon', label: 'Maroon Classic', color: '#7c2d12', accent: '#dc2626', bg: '#fff5f5' },
    { id: 'admit_teal', label: 'Teal Modern', color: '#134e4a', accent: '#0d9488', bg: '#f0fdfa' },
];

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─────────────────── ID Card HTML ─────────────────── */
function buildIdCardHtml(student, tpl) {
    const avatarUrl = student.imageUrl || '';
    const avatarBlock = avatarUrl
        ? `<img src="${avatarUrl}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);" />`
        : `<div style="width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;font-size:34px;color:#fff;font-weight:800;letter-spacing:-1px;">${(student.name||'S')[0].toUpperCase()}</div>`;

    return `
<div style="width:360px;font-family:'Tiro Bangla','Tiro Bangla Static',serif;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.18);border:1px solid #e2e8f0;background:#fff;">

  <!-- top gradient header -->
  <div style="background:linear-gradient(135deg,${tpl.color} 0%,${tpl.accent} 100%);padding:22px 20px 56px;position:relative;text-align:center;">
    <!-- school seal circle -->
    <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px;">
      <div style="font-size:20px;">🎓</div>
    </div>
    <div style="font-size:12px;font-weight:800;color:#fff;letter-spacing:.12em;text-transform:uppercase;line-height:1.3;">${SCHOOL_NAME}</div>
    <div style="font-size:9px;color:rgba(255,255,255,.8);margin-top:3px;letter-spacing:.04em;">${SCHOOL_ADDRESS}</div>
    <!-- badge -->
    <div style="position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);background:#fff;color:${tpl.color};font-size:9px;font-weight:800;padding:4px 18px;border-radius:20px;letter-spacing:.1em;text-transform:uppercase;box-shadow:0 2px 8px rgba(0,0,0,.12);white-space:nowrap;">STUDENT IDENTITY CARD</div>
  </div>

  <!-- photo + info -->
  <div style="padding:28px 20px 16px;display:flex;gap:16px;align-items:flex-start;">
    <!-- avatar -->
    <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px;">
      <div style="background:linear-gradient(135deg,${tpl.color},${tpl.accent});padding:3px;border-radius:50%;display:inline-flex;">
        ${avatarBlock}
      </div>
      <!-- roll badge -->
      <div style="background:${tpl.bg};border:1px solid ${tpl.accent};color:${tpl.color};font-size:9px;font-weight:700;padding:2px 10px;border-radius:6px;letter-spacing:.04em;">Roll: ${student.rollNumber||'—'}</div>
    </div>
    <!-- details -->
    <div style="flex:1;">
      <div style="font-size:15px;font-weight:800;color:#1a202c;line-height:1.2;margin-bottom:2px;">${student.name||'—'}</div>
      <div style="font-size:10px;color:${tpl.accent};font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Student</div>
      <table style="border-collapse:collapse;width:100%;">
        ${[
          ['Class',`${student.class||'—'} / ${student.section||'—'}`],
          ['Date of Birth', fmtDate(student.dateOfBirth)],
          ['Parent', student.parentName||'—'],
          ['Contact', student.parentPhone||'—'],
        ].map(([k,v])=>`
        <tr>
          <td style="font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;padding:2px 8px 2px 0;white-space:nowrap;">${k}</td>
          <td style="font-size:10px;color:#374151;padding:2px 0;font-weight:500;">${v}</td>
        </tr>`).join('')}
      </table>
    </div>
  </div>

  <!-- divider -->
  <div style="margin:0 20px;height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);"></div>

  <!-- footer strip -->
  <div style="background:${tpl.bg};padding:10px 20px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:8px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;">Student ID</div>
      <div style="font-size:10px;font-weight:700;color:${tpl.color};font-family:monospace;">${student.studentId||String(student._id||'').slice(-8).toUpperCase()||'—'}</div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:8px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;">Session</div>
      <div style="font-size:10px;font-weight:700;color:${tpl.color};">${new Date().getFullYear()}–${new Date().getFullYear()+1}</div>
    </div>
    <div style="text-align:right;">
      <div style="border-top:1px solid #9ca3af;width:64px;margin-bottom:3px;"></div>
      <div style="font-size:8px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;">Principal</div>
    </div>
  </div>

  <!-- bottom color bar -->
  <div style="height:6px;background:linear-gradient(90deg,${tpl.color},${tpl.accent},${tpl.color});"></div>
</div>`;
}

/* ─────────────────── Admit Card HTML ─────────────────── */
function buildAdmitCardHtml(student, exam, tpl) {
    const avatarUrl = student.imageUrl || '';
    const avatarBlock = avatarUrl
        ? `<img src="${avatarUrl}" style="width:90px;height:110px;border-radius:8px;object-fit:cover;border:2px solid ${tpl.accent};box-shadow:0 2px 8px rgba(0,0,0,.15);" />`
        : `<div style="width:90px;height:110px;border-radius:8px;background:linear-gradient(135deg,${tpl.color},${tpl.accent});display:flex;align-items:center;justify-content:center;font-size:36px;color:#fff;font-weight:800;">${(student.name||'S')[0].toUpperCase()}</div>`;

    const subjectRows = (exam?.subjects||[]).map((s,i)=>`
    <tr style="background:${i%2?tpl.bg:'#fff'};">
      <td style="padding:7px 12px;font-size:11px;color:#1a202c;font-weight:600;border-bottom:1px solid #e5e7eb;">${s.subjectName}</td>
      <td style="padding:7px 12px;font-size:11px;color:#374151;text-align:center;border-bottom:1px solid #e5e7eb;">${fmtDate(s.examDate)}</td>
      <td style="padding:7px 12px;font-size:11px;color:#374151;text-align:center;border-bottom:1px solid #e5e7eb;">${s.startTime||'—'} – ${s.endTime||'—'}</td>
      <td style="padding:7px 12px;font-size:11px;color:#374151;text-align:center;border-bottom:1px solid #e5e7eb;">${s.room||'—'}</td>
    </tr>`).join('');

    return `
<div style="width:700px;font-family:'Tiro Bangla','Tiro Bangla Static',serif;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.16);border:2px solid ${tpl.color};background:#fff;">

  <!-- top bar -->
  <div style="height:6px;background:linear-gradient(90deg,${tpl.color},${tpl.accent},${tpl.color});"></div>

  <!-- header -->
  <div style="background:linear-gradient(135deg,${tpl.color} 0%,${tpl.accent} 100%);padding:18px 28px;display:flex;align-items:center;gap:18px;">
    <div style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">🎓</div>
    <div style="flex:1;">
      <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:.06em;text-transform:uppercase;line-height:1.1;">${SCHOOL_NAME}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.8);margin-top:4px;letter-spacing:.03em;">${SCHOOL_ADDRESS} &nbsp;|&nbsp; ${SCHOOL_PHONE}</div>
    </div>
    <div style="text-align:center;flex-shrink:0;">
      <div style="background:#fff;color:${tpl.color};font-size:11px;font-weight:900;padding:6px 20px;border-radius:6px;letter-spacing:.12em;text-transform:uppercase;box-shadow:0 2px 8px rgba(0,0,0,.12);">ADMIT CARD</div>
      <div style="font-size:9px;color:rgba(255,255,255,.8);margin-top:5px;">${exam?.academicYear||'—'}</div>
    </div>
  </div>

  <!-- exam info band -->
  <div style="background:${tpl.bg};padding:10px 28px;display:flex;gap:0;border-bottom:2px solid ${tpl.accent};">
    ${[
      ['Examination',exam?.examName||'—'],
      ['Type',exam?.examType||'—'],
      ['Class',`${exam?.class||'—'} / ${exam?.section||'—'}`],
      ['Start Date',fmtDate(exam?.startDate)],
      ['End Date',fmtDate(exam?.endDate)],
    ].map(([k,v],i,arr)=>`
    <div style="flex:1;${i<arr.length-1?'border-right:1px dashed #cbd5e1;':''}padding:0 16px ${i===0?'0 0':'0 16px'};">
      <div style="font-size:8px;font-weight:800;color:${tpl.color};text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px;">${k}</div>
      <div style="font-size:11px;font-weight:700;color:#1a202c;">${v}</div>
    </div>`).join('')}
  </div>

  <!-- student info -->
  <div style="padding:20px 28px;display:flex;gap:20px;align-items:flex-start;border-bottom:1px solid #e5e7eb;">
    <div style="flex-shrink:0;">${avatarBlock}</div>
    <div style="flex:1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px 24px;">
      ${[
        ['Student Name',student.name||'—'],
        ['Roll Number',student.rollNumber||'—'],
        ['Student ID',student.studentId||'—'],
        ['Class & Section',`${student.class||'—'} / ${student.section||'—'}`],
        ['Date of Birth',fmtDate(student.dateOfBirth)],
        ['Parent Name',student.parentName||'—'],
      ].map(([k,v])=>`
      <div style="background:${tpl.bg};border-radius:8px;padding:8px 12px;border-left:3px solid ${tpl.accent};">
        <div style="font-size:8px;font-weight:800;color:${tpl.color};text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;">${k}</div>
        <div style="font-size:11px;font-weight:600;color:#1a202c;">${v}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- subject schedule -->
  ${(exam?.subjects||[]).length>0?`
  <div style="padding:16px 28px 20px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <div style="width:4px;height:16px;background:linear-gradient(${tpl.color},${tpl.accent});border-radius:2px;"></div>
      <div style="font-size:11px;font-weight:800;color:${tpl.color};text-transform:uppercase;letter-spacing:.08em;">Examination Schedule</div>
    </div>
    <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
      <thead>
        <tr style="background:linear-gradient(90deg,${tpl.color},${tpl.accent});">
          <th style="padding:9px 12px;font-size:10px;color:#fff;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Subject</th>
          <th style="padding:9px 12px;font-size:10px;color:#fff;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Date</th>
          <th style="padding:9px 12px;font-size:10px;color:#fff;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Time</th>
          <th style="padding:9px 12px;font-size:10px;color:#fff;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Room</th>
        </tr>
      </thead>
      <tbody>${subjectRows}</tbody>
    </table>
  </div>` : '<div style="padding:16px 28px;font-size:12px;color:#9ca3af;text-align:center;">No subject schedule available</div>'}

  <!-- footer -->
  <div style="background:${tpl.bg};padding:12px 28px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid ${tpl.color};">
    <div>
      <div style="font-size:9px;color:#6b7280;margin-bottom:2px;">⚠️ This card must be presented at the examination hall.</div>
      <div style="font-size:9px;color:#9ca3af;">Generated: ${new Date().toLocaleDateString('en-GB')}</div>
    </div>
    <div style="display:flex;gap:32px;">
      <div style="text-align:center;">
        <div style="border-top:1px solid ${tpl.color};width:90px;margin-bottom:4px;"></div>
        <div style="font-size:8px;font-weight:700;color:${tpl.color};text-transform:uppercase;letter-spacing:.06em;">Student Signature</div>
      </div>
      <div style="text-align:center;">
        <div style="border-top:1px solid ${tpl.color};width:90px;margin-bottom:4px;"></div>
        <div style="font-size:8px;font-weight:700;color:${tpl.color};text-transform:uppercase;letter-spacing:.06em;">Controller of Examination</div>
      </div>
    </div>
  </div>

  <!-- bottom bar -->
  <div style="height:6px;background:linear-gradient(90deg,${tpl.color},${tpl.accent},${tpl.color});"></div>
</div>`;
}

/* ─────────────────── PDF download ─────────────────── */
async function downloadCard(htmlContent, filename) {
    Swal.fire({ title: 'Generating PDF…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
    el.innerHTML = htmlContent;
    document.body.appendChild(el);
    try {
        const canvas = await html2canvas(el.firstElementChild, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff' });
        const imgW = canvas.width / 2.5;
        const imgH = canvas.height / 2.5;
        const pdf = new jsPDF({ orientation: imgW > imgH ? 'l' : 'p', unit: 'px', format: [imgW, imgH] });
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
        pdf.save(filename);
        Swal.fire({ icon: 'success', title: 'Downloaded!', text: filename, timer: 2000, showConfirmButton: false });
    } finally {
        document.body.removeChild(el);
    }
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function AdminIdGenerate() {
    const [mode, setMode] = useState('id'); // 'id' | 'admit'
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);

    // cascading selection
    const [selClass, setSelClass] = useState('');
    const [selSection, setSelSection] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [nameSearch, setNameSearch] = useState('');

    const [idTpl, setIdTpl] = useState(ID_TEMPLATES[0]);
    const [admitTpl, setAdmitTpl] = useState(ADMIT_TEMPLATES[0]);

    const [studentsInSection, setStudentsInSection] = useState([]);
    const [loadingSectionStudents, setLoadingSectionStudents] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    /* fetch exams in admit mode */
    useEffect(() => {
        if (mode !== 'admit') return;
        setLoadingExams(true);
        fetch(`${API_BASE_URL}/exams`)
            .then(r => r.json())
            .then(d => setExams(Array.isArray(d) ? d : d.exams || []))
            .catch(() => setExams([]))
            .finally(() => setLoadingExams(false));
    }, [mode]);

    /* When class+section selected, fetch students from server for that section */
    useEffect(() => {
        if (!selClass || !selSection) {
            setStudentsInSection([]);
            return;
        }
        setLoadingSectionStudents(true);
        fetch(`${API_BASE_URL}/students?class=${encodeURIComponent(selClass)}&section=${encodeURIComponent(selSection)}`)
            .then(r => r.json())
            .then(d => setStudentsInSection(Array.isArray(d) ? d : d.data || []))
            .catch(() => setStudentsInSection([]))
            .finally(() => setLoadingSectionStudents(false));
    }, [selClass, selSection]);

    // keep selectedStudent valid after studentsInSection updates
    useEffect(() => {
        if (!selectedStudent) return;
        const stillHere = studentsInSection.some(s => s._id === selectedStudent._id);
        if (!stillHere) setSelectedStudent(null);
    }, [studentsInSection, selectedStudent]);

    const filteredByName = studentsInSection.filter(s =>
        !nameSearch || s.name?.toLowerCase().includes(nameSearch.toLowerCase()) ||
        s.rollNumber?.toString().includes(nameSearch)
    );

    /* exams filtered to selected class+section */
    const filteredExams = selClass && selSection
        ? exams.filter(ex => ex.class === selClass && ex.section === selSection)
        : exams;

    /* reset downstream when class changes */
    function handleClassChange(cls) {
        setSelClass(cls);
        setSelSection('');
        setSelectedStudent(null);
        setNameSearch('');
        setSelectedExam(null);
    }
    /* reset downstream when section changes */
    function handleSectionChange(sec) {
        setSelSection(sec);
        setSelectedStudent(null);
        setNameSearch('');
        setSelectedExam(null);
    }

    const tpl = mode === 'id' ? idTpl : admitTpl;
    const previewHtml = selectedStudent
        ? mode === 'id'
            ? buildIdCardHtml(selectedStudent, idTpl)
            : buildAdmitCardHtml(selectedStudent, selectedExam, admitTpl)
        : null;

    async function handleDownload() {
        if (!selectedStudent) return Swal.fire('Select a student first', '', 'warning');
        // exam selection is optional for admit card — allow download even when no exam is selected
        const name = mode === 'id'
            ? `ID_Card_${selectedStudent.name?.replace(/\s+/g, '_')}.pdf`
            : `Admit_Card_${selectedStudent.name?.replace(/\s+/g, '_')}${selectedExam ? `_${selectedExam.examName?.replace(/\s+/g, '_')}` : ''}.pdf`;
        setGeneratingPdf(true);
        try {
            await downloadCard(previewHtml, name);
        } finally {
            setGeneratingPdf(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-1 sm:px-2 py-2 sm:py-3">

                {/* Page title */}
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">ID & Admit Card Generator</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Select class → section → student, pick a template and download.</p>
                </div>

                {/* Mode toggle */}
                <div className="grid grid-cols-2 gap-2 mb-4 sm:mb-6 sm:flex sm:w-auto">
                    {[['id', '🪪 Student ID Card'], ['admit', '📋 Exam Admit Card']].map(([m, label]) => (
                        <button key={m} onClick={() => { setMode(m); setSelectedExam(null); }}
                            className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition text-center ${mode === m ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 active:bg-gray-100'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 sm:gap-6">

                    {/* ── LEFT PANEL ── */}
                    <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4">

                        {/* Template selector */}
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
                            <div className="text-sm font-bold text-gray-700 mb-2 sm:mb-3">Choose Template</div>
                            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-col sm:gap-2">
                                {(mode === 'id' ? ID_TEMPLATES : ADMIT_TEMPLATES).map(t => (
                                    <button key={t.id} onClick={() => mode === 'id' ? setIdTpl(t) : setAdmitTpl(t)}
                                        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border-2 transition text-center sm:text-left ${tpl.id === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0" style={{ background: t.color }}></span>
                                        <span className="text-[11px] sm:text-sm font-medium text-gray-700 leading-tight">{t.label}</span>
                                        {tpl.id === t.id && <span className="hidden sm:inline ml-auto text-blue-600 text-xs font-bold">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Class + Section dropdowns ── */}
                        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
                            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-col sm:gap-3">
                                {/* Class */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-1.5">
                                        <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs font-bold mr-1 sm:mr-2">1</span>
                                        Class
                                    </label>
                                    <select
                                        value={selClass}
                                        onChange={e => handleClassChange(e.target.value)}
                                        className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 bg-white transition"
                                    >
                                        <option value="">— Class —</option>
                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                                            <option key={n} value={`Class ${n}`}>Class {n}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Section */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-1.5">
                                        <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-600 text-white text-[10px] sm:text-xs font-bold mr-1 sm:mr-2">2</span>
                                        Section
                                    </label>
                                    <select
                                        value={selSection}
                                        onChange={e => handleSectionChange(e.target.value)}
                                        disabled={!selClass}
                                        className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 bg-white transition disabled:opacity-50"
                                    >
                                        <option value="">— Section —</option>
                                        {['A','B','C','D'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Summary badge */}
                            {selClass && selSection && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 mt-3">
                                    <span className="text-blue-600 text-xs font-bold">📚 {selClass} — Sec {selSection}</span>
                                    {loadingSectionStudents
                                        ? <span className="ml-auto text-xs text-gray-400 animate-pulse">Loading…</span>
                                        : <span className="ml-auto text-xs text-blue-500 font-semibold">{studentsInSection.length} students</span>
                                    }
                                </div>
                            )}
                        </div>

                        {/* ── Step 3: Student grid ── */}
                        {selClass && selSection && (
                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
                                <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                                    <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs font-bold mr-1 sm:mr-2">3</span>
                                    Select Student
                                    <span className="ml-2 text-[10px] sm:text-xs font-normal text-gray-400">({studentsInSection.length})</span>
                                </div>

                                <input
                                    type="text"
                                    placeholder="🔍 Filter by name or roll…"
                                    value={nameSearch}
                                    onChange={e => { setNameSearch(e.target.value); if (!e.target.value) setSelectedStudent(null); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 mb-2 sm:mb-3"
                                />

                                {loadingSectionStudents ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="animate-pulse flex items-center gap-2 p-2 rounded-lg bg-gray-100">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-2.5 bg-gray-300 rounded w-3/4"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredByName.length === 0 ? (
                                    <div className="text-center py-5 text-gray-400 text-sm">No students found</div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 max-h-60 sm:max-h-72 overflow-y-auto pr-0.5">
                                        {filteredByName.map(s => (
                                            <button key={s._id}
                                                onClick={() => setSelectedStudent(selectedStudent?._id === s._id ? null : s)}
                                                className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg border-2 text-left transition w-full ${selectedStudent?._id === s._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 active:bg-gray-50'}`}>
                                                {s.imageUrl
                                                    ? <img src={s.imageUrl} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow" />
                                                    : <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow"
                                                        style={{ background: selectedStudent?._id === s._id ? '#2563eb' : '#64748b' }}>
                                                        {(s.name || 'S')[0].toUpperCase()}
                                                      </div>
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-[11px] sm:text-xs font-bold truncate ${selectedStudent?._id === s._id ? 'text-blue-700' : 'text-gray-800'}`}>{s.name}</div>
                                                    <div className="text-[9px] sm:text-[10px] text-gray-500">Roll: {s.rollNumber}</div>
                                                </div>
                                                {selectedStudent?._id === s._id && (
                                                    <span className="text-blue-600 text-[10px] sm:text-xs font-bold flex-shrink-0">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Selected student info card */}
                                {selectedStudent && (
                                    <div className="mt-2 sm:mt-3 rounded-lg border border-blue-200 overflow-hidden">
                                        <div className="bg-blue-600 px-3 py-1.5 flex items-center justify-between">
                                            <span className="text-[11px] sm:text-xs font-bold text-white truncate pr-2">{selectedStudent.name}</span>
                                            <button onClick={() => { setSelectedStudent(null); setNameSearch(''); }} className="text-blue-200 text-sm leading-none flex-shrink-0">✕</button>
                                        </div>
                                        <div className="bg-blue-50 p-2 sm:p-3 flex gap-2 sm:gap-3 items-start">
                                            {selectedStudent.imageUrl
                                                ? <img src={selectedStudent.imageUrl} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0 border-2 border-blue-300" />
                                                : <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">{(selectedStudent.name || 'S')[0].toUpperCase()}</div>
                                            }
                                            <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-0.5 sm:gap-x-4 sm:gap-y-1">
                                                {[
                                                    ['Name', selectedStudent.name],
                                                    ['Roll', selectedStudent.rollNumber],
                                                    ['Class', `${selectedStudent.class} – ${selectedStudent.section}`],
                                                    ['DOB', fmtDate(selectedStudent.dateOfBirth)],
                                                    ['Parent', selectedStudent.parentName],
                                                    ['Phone', selectedStudent.parentPhone],
                                                ].map(([k, v]) => (
                                                    <div key={k}>
                                                        <div className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase">{k}</div>
                                                        <div className="text-[10px] sm:text-xs text-gray-800 truncate">{v || '—'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Step 4: Exam (admit mode) ── */}
                        {mode === 'admit' && selClass && selSection && (
                            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm">
                                <div className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                                    <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs font-bold mr-1 sm:mr-2">4</span>
                                    Select Exam <span className="text-[10px] text-gray-400 font-medium">(optional)</span>
                                </div>
                                {loadingExams ? (
                                    <div className="animate-pulse h-9 bg-gray-200 rounded-lg"></div>
                                ) : filteredExams.length === 0 ? (
                                    <div className="text-xs text-gray-400 py-2">No exams found for {selClass}-{selSection}</div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {filteredExams.map(ex => (
                                            <button key={ex._id}
                                                onClick={() => setSelectedExam(selectedExam?._id === ex._id ? null : ex)}
                                                className={`flex items-start gap-3 px-3 py-2 sm:py-2.5 rounded-lg border-2 text-left transition ${selectedExam?._id === ex._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{ex.examName}</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{ex.examType} · {ex.academicYear} · {ex.subjects?.length || 0} subjects</div>
                                                    <div className="text-[10px] sm:text-xs text-gray-400">{fmtDate(ex.startDate)} – {fmtDate(ex.endDate)}</div>
                                                </div>
                                                {selectedExam?._id === ex._id && <span className="text-indigo-600 font-bold text-sm flex-shrink-0">✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Download button */}
                        <button
                            onClick={handleDownload}
                            disabled={!selectedStudent || generatingPdf}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {generatingPdf ? '⏳ Generating…' : '📥 Download PDF'}
                        </button>
                    </div>

                    {/* ── RIGHT PANEL — PREVIEW ── */}
                    <div className="lg:col-span-3 order-first lg:order-none">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 flex flex-col lg:sticky lg:top-6">
                            <div className="text-xs sm:text-sm font-bold text-gray-700 mb-3 sm:mb-4">Live Preview</div>
                            {previewHtml ? (
                                <div className="flex items-start justify-center overflow-x-auto">
                                    <div
                                        className="mx-auto origin-top"
                                        style={{
                                            transform: mode === 'admit'
                                                ? 'scale(0.5)'
                                                : 'scale(0.78)',
                                            transformOrigin: 'top center',
                                            marginBottom: mode === 'admit' ? '-180px' : '-56px',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400 gap-3">
                                    <div className="text-4xl sm:text-5xl">🪪</div>
                                    <div className="text-xs sm:text-sm text-center px-4">
                                        {!selClass ? 'Select a class to get started' :
                                         !selSection ? 'Now select a section' :
                                         !selectedStudent ? 'Now select a student' :
                                         mode === 'admit' && !selectedExam ? 'Exam optional — you may download without selecting one' : ''}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}