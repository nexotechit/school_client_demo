'use client';
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '../../../../config/api';

const CertificateManagementPage = () => {
    // State management
    const [certificates, setCertificates] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [certificateTemplates, setCertificateTemplates] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        studentId: '',
        teacherId: '',
        issueDate: '',
        search: ''
    });

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        studentName: '',
        studentClass: '',
        studentRoll: '',
        teacherId: '',
        teacherName: '',
        certificateType: 'Achievement',
        title: '',
        description: '',
        achievement: '',
        event: '',
        grade: '',
        score: '',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        templateId: '',
        signature1: 'Principal',
        signature2: 'Teacher',
        notes: '',
        isActive: true,
        studentEntryMethod: 'select' // 'select' or 'manual'
    });

    // UI states
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', 'templates'
    const [selectedCertificates, setSelectedCertificates] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Certificate types
    const certificateTypes = [
        'Achievement',
        'Participation',
        'Merit',
        'Sports',
        'Cultural',
        'Academic Excellence',
        'Behavior',
        'Leadership',
        'Special Recognition',
        'Completion',
        'Appreciation'
    ];

    // Grades
    const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'Pass', 'Fail'];

    // Certificate templates
    const templates = [
        {
            id: 'classic',
            name: 'Classic Certificate',
            preview: '🎓',
            description: 'Traditional certificate design with elegant borders'
        },
        {
            id: 'modern',
            name: 'Modern Certificate',
            preview: '🏆',
            description: 'Contemporary design with clean lines and modern typography'
        },
        {
            id: 'achievement',
            name: 'Achievement Certificate',
            preview: '⭐',
            description: 'Special design for achievements and recognitions'
        },
        {
            id: 'sports',
            name: 'Sports Certificate',
            preview: '⚽',
            description: 'Dynamic design perfect for sports achievements'
        },
        {
            id: 'cultural',
            name: 'Cultural Certificate',
            preview: '🎭',
            description: 'Artistic design for cultural and performing arts'
        }
    ];

    // Load initial data
    useEffect(() => {
        fetchCertificates();
        fetchStudents();
        fetchTeachers();
        setCertificateTemplates(templates);
    }, []);

    // Fetch certificates
    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${API_BASE_URL}/certificates?${queryParams}`);

            if (!response.ok) {
                throw new Error('Failed to fetch certificates');
            }

            const data = await response.json();
            setCertificates(data.success ? data.data : []);
        } catch (error) {
            console.error('Error fetching certificates:', error);
            // Fallback data for demo
            setCertificates([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch students
    const fetchStudents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/students`);
            const data = await response.json();
            setStudents(data.success ? data.data : []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
        }
    };

    // Fetch teachers
    const fetchTeachers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/teachers`);
            const data = await response.json();
            setTeachers(data.success ? data.data : []);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setTeachers([]);
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        fetchCertificates();
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            type: '',
            status: '',
            studentId: '',
            teacherId: '',
            issueDate: '',
            search: ''
        });
        fetchCertificates();
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.studentName || !formData.title || !formData.certificateType) {
            Swal.fire('Error', 'Please fill all required fields (Student Name, Certificate Type, and Title)', 'error');
            return;
        }

        // For database selection, studentId is also required
        if (formData.studentEntryMethod === 'select' && !formData.studentId) {
            Swal.fire('Error', 'Please select a student from the database', 'error');
            return;
        }

        // Ensure template is selected
        if (!formData.templateId) {
            setFormData(prev => ({ ...prev, templateId: 'classic' }));
        }

        try {
            setLoading(true);
            const url = editingCertificate
                ? `${API_BASE_URL}/certificates/${editingCertificate._id}`
                : `${API_BASE_URL}/certificates`;

            const method = editingCertificate ? 'PUT' : 'POST';

            // Prepare data for submission - remove empty optional fields
            const submitData = { ...formData };
            if (!submitData.teacherId || submitData.teacherId === '') {
                delete submitData.teacherId;
                delete submitData.teacherName;
            }
            if (!submitData.studentId || submitData.studentId === '') {
                delete submitData.studentId;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Success',
                    editingCertificate ? 'Certificate updated successfully' : 'Certificate created successfully',
                    'success'
                );

                setShowForm(false);
                setEditingCertificate(null);
                resetForm();
                
                if (!editingCertificate) {
                    // Add new certificate to the list immediately
                    setCertificates(prev => [data.data, ...prev]);
                } else {
                    // Update existing certificate in the list
                    setCertificates(prev => prev.map(c => c._id === data.data._id ? data.data : c));
                }
            } else {
                throw new Error(data.message || 'Failed to save certificate');
            }
        } catch (error) {
            console.error('Error saving certificate:', error);
            Swal.fire('Error', error.message || 'Failed to save certificate', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            studentId: '',
            studentName: '',
            studentClass: '',
            studentRoll: '',
            teacherId: '',
            teacherName: '',
            certificateType: 'Achievement',
            title: '',
            description: '',
            achievement: '',
            event: '',
            grade: '',
            score: '',
            issueDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            templateId: 'classic',
            signature1: 'Principal',
            signature2: 'Teacher',
            notes: '',
            isActive: true,
            studentEntryMethod: 'select'
        });
        setSelectedTemplate(null);
    };

    // Edit certificate
    const editCertificate = (certificate) => {
        setEditingCertificate(certificate);
        setFormData({
            studentId: certificate.studentId || '',
            studentName: certificate.studentName || '',
            studentClass: certificate.studentClass || '',
            studentRoll: certificate.studentRoll || '',
            teacherId: certificate.teacherId || '',
            teacherName: certificate.teacherName || '',
            certificateType: certificate.certificateType || 'Achievement',
            title: certificate.title || '',
            description: certificate.description || '',
            achievement: certificate.achievement || '',
            event: certificate.event || '',
            grade: certificate.grade || '',
            score: certificate.score || '',
            issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : '',
            expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate).toISOString().split('T')[0] : '',
            templateId: certificate.templateId || 'classic',
            signature1: certificate.signature1 || 'Principal',
            signature2: certificate.signature2 || 'Teacher',
            notes: certificate.notes || '',
            isActive: certificate.isActive !== false,
            studentEntryMethod: certificate.studentId ? 'select' : 'manual'
        });
        setShowForm(true);
    };

    // Delete certificate
    const deleteCertificate = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`${API_BASE_URL}/certificates/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Deleted!', 'Certificate has been deleted.', 'success');
                fetchCertificates();
            } else {
                throw new Error(data.message || 'Failed to delete certificate');
            }
        } catch (error) {
            console.error('Error deleting certificate:', error);
            Swal.fire('Error', error.message || 'Failed to delete certificate', 'error');
        }
    };

    // Handle student selection
    const handleStudentChange = (studentId) => {
        const student = students.find(s => s._id === studentId);
        if (student) {
            setFormData(prev => ({
                ...prev,
                studentId,
                studentName: student.name || '',
                studentClass: student.class || '',
                studentRoll: student.rollNumber || ''
            }));
        }
    };

    // Handle teacher selection
    const handleTeacherChange = (teacherId) => {
        const teacher = teachers.find(t => t._id === teacherId);
        if (teacher) {
            setFormData(prev => ({
                ...prev,
                teacherId,
                teacherName: teacher.name || ''
            }));
        }
    };

    // Generate Professional PDF
    const generatePDF = async (certificate) => {
        try {
            setLoading(true);
            
            // Get the certificate element
            const certificateElement = document.getElementById(`certificate-${certificate._id}`);
            if (!certificateElement) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Please view the certificate card first before downloading PDF',
                    confirmButtonColor: '#3085d6'
                });
                setLoading(false);
                return;
            }

            // Create a temporary container for PDF generation
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.width = '1200px';
            tempContainer.style.height = '850px';
            tempContainer.style.background = 'white';
            document.body.appendChild(tempContainer);

            // Create professional certificate layout
            const certificateStyle = getCertificateStyle(certificate.templateId || 'classic');
            tempContainer.innerHTML = `
                <div style="
                    width: 1200px;
                    height: 850px;
                    padding: 60px;
                    background: ${certificateStyle.background};
                    border: ${certificateStyle.border};
                    box-sizing: border-box;
                    position: relative;
                    font-family: ${certificateStyle.fontFamily};
                ">
                    <!-- Corner Decorations -->
                    <div style="position: absolute; top: 20px; left: 20px; width: 50px; height: 50px; border-top: 5px solid #3b82f6; border-left: 5px solid #3b82f6; opacity: 0.3; border-top-left-radius: 10px;"></div>
                    <div style="position: absolute; top: 20px; right: 20px; width: 50px; height: 50px; border-top: 5px solid #3b82f6; border-right: 5px solid #3b82f6; opacity: 0.3; border-top-right-radius: 10px;"></div>
                    <div style="position: absolute; bottom: 20px; left: 20px; width: 50px; height: 50px; border-bottom: 5px solid #3b82f6; border-left: 5px solid #3b82f6; opacity: 0.3; border-bottom-left-radius: 10px;"></div>
                    <div style="position: absolute; bottom: 20px; right: 20px; width: 50px; height: 50px; border-bottom: 5px solid #3b82f6; border-right: 5px solid #3b82f6; opacity: 0.3; border-bottom-right-radius: 10px;"></div>
                    
                    <!-- School Logo -->
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px; text-align: center; line-height: 80px;">🎓</div>
                    
                    <!-- School Name -->
                    <div style="font-size: 36px; font-weight: bold; color: #1e293b; text-align: center; margin-bottom: 5px;">Sunlight School</div>
                    <div style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 40px;">Excellence in Education</div>
                    
                    <!-- Certificate Title -->
                    <div style="font-size: 48px; font-weight: bold; color: #2563eb; text-align: center; margin-bottom: 15px;">Certificate of ${certificate.certificateType}</div>
                    <div style="width: 120px; height: 6px; background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%); margin: 0 auto 30px; border-radius: 3px;"></div>
                    
                    <!-- Certificate ID -->
                    <div style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 0 auto 30px; text-align: center; width: 100%; font-family: 'Courier New', monospace;">Certificate ID: ${certificate._id?.substring(0, 8).toUpperCase()}</div>
                    
                    <!-- Presented To -->
                    <div style="font-size: 20px; color: #64748b; text-align: center; margin-bottom: 20px;">This is proudly presented to</div>
                    
                    <!-- Student Name -->
                    <div style="font-size: 40px; font-weight: bold; color: #1e293b; border-bottom: 3px solid #3b82f6; padding: 0 40px 10px; text-align: center; margin: 0 auto 20px; max-width: 600px;">${certificate.studentName}</div>
                    
                    <!-- Student Info -->
                    <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 40px;">
                        <div style="background: #dbeafe; color: #1e40af; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">Class: ${certificate.studentClass}</div>
                        <div style="background: #dbeafe; color: #1e40af; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">Roll: ${certificate.studentRoll}</div>
                    </div>
                    
                    <!-- Certificate Body -->
                    <div style="max-width: 800px; margin: 0 auto 40px; text-align: center;">
                        <div style="font-size: 24px; color: #334155; font-weight: 600; margin-bottom: 15px;">${certificate.title}</div>
                        ${certificate.description ? `<div style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 20px;">${certificate.description}</div>` : ''}
                        ${certificate.achievement ? `<div style="background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); border-left: 5px solid #2563eb; padding: 20px; border-radius: 10px; margin: 20px 0;"><div style="font-size: 20px; color: #1e40af; font-weight: bold;">${certificate.achievement}</div></div>` : ''}
                        ${certificate.grade ? `<div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; border-radius: 25px; font-size: 20px; font-weight: bold; margin-top: 20px;">Grade: ${certificate.grade}</div>` : ''}
                    </div>
                    
                    <!-- Signatures -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; padding-top: 40px; border-top: 2px solid #e2e8f0;">
                        <div style="flex: 1; text-align: center;">
                            <div style="width: 150px; height: 60px; border-bottom: 2px solid #64748b; margin: 0 auto 10px;"></div>
                            <div style="font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 3px;">${certificate.signature1}</div>
                            <div style="font-size: 11px; color: #64748b;">Authorized Signatory</div>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <div style="font-size: 13px; color: #64748b; margin-bottom: 5px;">Issue Date</div>
                            <div style="font-size: 15px; font-weight: bold; color: #334155;">${new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <div style="width: 150px; height: 60px; border-bottom: 2px solid #64748b; margin: 0 auto 10px;"></div>
                            <div style="font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 3px;">${certificate.signature2}</div>
                            <div style="font-size: 11px; color: #64748b;">Class Teacher</div>
                        </div>
                    </div>
                </div>
            `;

            // Generate canvas from the temporary container
            const canvas = await html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: false,
                width: 1200,
                height: 850
            });

            // Remove temporary container
            document.body.removeChild(tempContainer);

            // Create PDF - A4 landscape (297mm x 210mm)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/png');
            
            // Add image to fill entire page
            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            
            // Generate filename
            const filename = `Certificate_${certificate.studentName.replace(/\s+/g, '_')}_${certificate.certificateType.replace(/\s+/g, '_')}.pdf`;
            
            // Save PDF
            pdf.save(filename);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Certificate PDF downloaded successfully!',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Download Failed',
                text: 'Failed to generate PDF. Please try again.',
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setLoading(false);
        }
    };

    // Professional Print Certificate
    const printCertificate = (certificate) => {
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank', 'width=1200,height=850');
            
            if (!printWindow) {
                Swal.fire('Error', 'Please allow pop-ups to print certificates', 'error');
                return;
            }

            // Get the certificate styles
            const certificateStyle = getCertificateStyle(certificate.templateId || 'classic');
            
            // Write professional print stylesheet with exact same design as PDF
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Certificate - ${certificate.studentName} - ${certificate.certificateType}</title>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            @page {
                                size: A4 landscape;
                                margin: 0;
                            }
                            
                            body {
                                margin: 0;
                                padding: 0;
                                background: white;
                                font-family: ${certificateStyle.fontFamily};
                            }
                            
                            .certificate-container {
                                width: 297mm;
                                height: 210mm;
                                margin: 0;
                                padding: 0;
                                page-break-after: always;
                            }
                            
                            .certificate {
                                width: 100%;
                                height: 100%;
                                padding: 60px;
                                background: ${certificateStyle.background};
                                border: ${certificateStyle.border};
                                box-sizing: border-box;
                                position: relative;
                                font-family: ${certificateStyle.fontFamily};
                            }
                            
                            .corner-decoration {
                                position: absolute;
                                width: 50px;
                                height: 50px;
                                border-color: #3b82f6;
                                opacity: 0.3;
                            }
                            
                            .corner-tl {
                                top: 20px;
                                left: 20px;
                                border-top: 5px solid;
                                border-left: 5px solid;
                                border-top-left-radius: 10px;
                            }
                            
                            .corner-tr {
                                top: 20px;
                                right: 20px;
                                border-top: 5px solid;
                                border-right: 5px solid;
                                border-top-right-radius: 10px;
                            }
                            
                            .corner-bl {
                                bottom: 20px;
                                left: 20px;
                                border-bottom: 5px solid;
                                border-left: 5px solid;
                                border-bottom-left-radius: 10px;
                            }
                            
                            .corner-br {
                                bottom: 20px;
                                right: 20px;
                                border-bottom: 5px solid;
                                border-right: 5px solid;
                                border-bottom-right-radius: 10px;
                            }
                            
                            .school-logo {
                                width: 80px;
                                height: 80px;
                                background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                                border-radius: 50%;
                                margin: 0 auto 20px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 40px;
                            }
                            
                            .school-name {
                                font-size: 36px;
                                font-weight: bold;
                                color: #1e293b;
                                text-align: center;
                                margin-bottom: 5px;
                            }
                            
                            .school-tagline {
                                font-size: 14px;
                                color: #64748b;
                                text-align: center;
                                margin-bottom: 40px;
                            }
                            
                            .certificate-title {
                                font-size: 48px;
                                font-weight: bold;
                                color: #2563eb;
                                text-align: center;
                                margin-bottom: 15px;
                            }
                            
                            .title-underline {
                                width: 120px;
                                height: 6px;
                                background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
                                margin: 0 auto 30px;
                                border-radius: 3px;
                            }
                            
                            .certificate-id {
                                font-size: 11px;
                                color: #64748b;
                                background: #f1f5f9;
                                padding: 5px 15px;
                                border-radius: 20px;
                                text-align: center;
                                margin-bottom: 30px;
                                font-family: 'Courier New', monospace;
                            }
                            
                            .presented-to {
                                font-size: 20px;
                                color: #64748b;
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            
                            .student-name {
                                font-size: 40px;
                                font-weight: bold;
                                color: #1e293b;
                                border-bottom: 3px solid #3b82f6;
                                padding: 0 40px 10px;
                                text-align: center;
                                margin: 0 auto 20px;
                                max-width: 600px;
                            }
                            
                            .student-info {
                                display: flex;
                                justify-content: center;
                                gap: 40px;
                                margin-bottom: 40px;
                            }
                            
                            .info-badge {
                                background: #dbeafe;
                                color: #1e40af;
                                padding: 8px 20px;
                                border-radius: 20px;
                                font-size: 14px;
                                font-weight: 600;
                            }
                            
                            .certificate-body {
                                max-width: 800px;
                                margin: 0 auto 40px;
                                text-align: center;
                            }
                            
                            .certificate-main-title {
                                font-size: 24px;
                                color: #334155;
                                font-weight: 600;
                                margin-bottom: 15px;
                            }
                            
                            .certificate-description {
                                font-size: 14px;
                                color: #64748b;
                                line-height: 1.6;
                                margin-bottom: 20px;
                            }
                            
                            .achievement-box {
                                background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
                                border-left: 5px solid #2563eb;
                                padding: 20px;
                                border-radius: 10px;
                                margin: 20px 0;
                            }
                            
                            .achievement-text {
                                font-size: 20px;
                                color: #1e40af;
                                font-weight: bold;
                            }
                            
                            .grade-badge {
                                display: inline-block;
                                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                color: white;
                                padding: 12px 30px;
                                border-radius: 25px;
                                font-size: 20px;
                                font-weight: bold;
                                margin-top: 20px;
                            }
                            
                            .signatures {
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-end;
                                margin-top: 60px;
                                padding-top: 40px;
                                border-top: 2px solid #e2e8f0;
                            }
                            
                            .signature-block {
                                flex: 1;
                                text-align: center;
                            }
                            
                            .signature-line {
                                width: 150px;
                                height: 60px;
                                border-bottom: 2px solid #64748b;
                                margin: 0 auto 10px;
                            }
                            
                            .signature-name {
                                font-size: 14px;
                                font-weight: 600;
                                color: #334155;
                                margin-bottom: 3px;
                            }
                            
                            .signature-title {
                                font-size: 11px;
                                color: #64748b;
                            }
                            
                            .issue-date-block {
                                flex: 1;
                                text-align: center;
                            }
                            
                            .date-label {
                                font-size: 13px;
                                color: #64748b;
                                margin-bottom: 5px;
                            }
                            
                            .date-value {
                                font-size: 15px;
                                font-weight: bold;
                                color: #334155;
                            }
                            
                            @media print {
                                body {
                                    margin: 0;
                                    padding: 0;
                                }
                                
                                .certificate-container {
                                    page-break-after: always;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="certificate-container">
                            <div class="certificate">
                                <div class="corner-decoration corner-tl"></div>
                                <div class="corner-decoration corner-tr"></div>
                                <div class="corner-decoration corner-bl"></div>
                                <div class="corner-decoration corner-br"></div>
                                
                                <div class="school-logo">🎓</div>
                                <div class="school-name">Sunlight School</div>
                                <div class="school-tagline">Excellence in Education</div>
                                
                                <div class="certificate-title">Certificate of ${certificate.certificateType}</div>
                                <div class="title-underline"></div>
                                
                                <div class="certificate-id">Certificate ID: ${certificate._id?.substring(0, 8).toUpperCase()}</div>
                                
                                <div class="presented-to">This is proudly presented to</div>
                                <div class="student-name">${certificate.studentName}</div>
                                
                                <div class="student-info">
                                    <div class="info-badge">Class: ${certificate.studentClass}</div>
                                    <div class="info-badge">Roll: ${certificate.studentRoll}</div>
                                </div>
                                
                                <div class="certificate-body">
                                    <div class="certificate-main-title">${certificate.title}</div>
                                    ${certificate.description ? `<div class="certificate-description">${certificate.description}</div>` : ''}
                                    ${certificate.achievement ? `
                                        <div class="achievement-box">
                                            <div class="achievement-text">${certificate.achievement}</div>
                                        </div>
                                    ` : ''}
                                    ${certificate.grade ? `
                                        <div class="grade-badge">Grade: ${certificate.grade}</div>
                                    ` : ''}
                                </div>
                                
                                <div class="signatures">
                                    <div class="signature-block">
                                        <div class="signature-line"></div>
                                        <div class="signature-name">${certificate.signature1}</div>
                                        <div class="signature-title">Authorized Signatory</div>
                                    </div>
                                    
                                    <div class="issue-date-block">
                                        <div class="date-label">Issue Date</div>
                                        <div class="date-value">${new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    </div>
                                    
                                    <div class="signature-block">
                                        <div class="signature-line"></div>
                                        <div class="signature-name">${certificate.signature2}</div>
                                        <div class="signature-title">Class Teacher</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // Wait for content to load before printing
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
            
        } catch (error) {
            console.error('Error printing certificate:', error);
            Swal.fire('Error', 'Failed to print certificate. Please try again.', 'error');
        }
    };


// Get professional certificate template style
    const getCertificateStyle = (templateId) => {
        const styles = {
            classic: {
                border: '10px double #8B4513',
                background: 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)',
                fontFamily: "Tiro Bangla, Tiro Bangla Static, serif",
                boxShadow: 'inset 0 0 50px rgba(139, 69, 19, 0.1)'
            },
            modern: {
                border: '6px solid #2563eb',
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                fontFamily: "Tiro Bangla, Tiro Bangla Static, serif",
                boxShadow: 'inset 0 0 50px rgba(37, 99, 235, 0.1)'
            },
            achievement: {
                border: '8px solid #f59e0b',
                background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
                fontFamily: "Tiro Bangla, Tiro Bangla Static, serif",
                boxShadow: 'inset 0 0 50px rgba(245, 158, 11, 0.15)'
            },
            sports: {
                border: '8px solid #dc2626',
                background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                fontFamily: "Tiro Bangla, Tiro Bangla Static, serif",
                boxShadow: 'inset 0 0 50px rgba(220, 38, 38, 0.15)'
            },
            cultural: {
                border: '8px solid #7c3aed',
                background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
                fontFamily: "Tiro Bangla, Tiro Bangla Static, serif",
                boxShadow: 'inset 0 0 50px rgba(124, 58, 237, 0.15)'
            }
        };
        return styles[templateId] || styles.classic;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-3 sm:mb-4 lg:mb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c] mb-2">Certificate Management</h1>
                    <p className="text-gray-600 text-xs sm:text-sm">Create and manage professional certificates for students</p>
                </div>
                {/* View Mode Buttons */}
                <div className="mb-3 sm:mb-4 lg:mb-6">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={() => setViewMode('templates')}
                            className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                                viewMode === 'templates'
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Templates
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                                viewMode === 'cards'
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Cards View
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                                viewMode === 'list'
                                    ? 'bg-blue-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-900 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors text-xs sm:text-sm"
                        >
                            + New Certificate
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#1a202c] mb-3 sm:mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                        >
                            <option value="">All Types</option>
                            {certificateTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        <select
                            value={filters.studentId}
                            onChange={(e) => handleFilterChange('studentId', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                        >
                            <option value="">All Students</option>
                            {students.map(student => (
                                <option key={student._id} value={student._id}>{student.name}</option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={filters.issueDate}
                            onChange={(e) => handleFilterChange('issueDate', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                            placeholder="Issue Date"
                        />

                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                            placeholder="Search certificates..."
                        />
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={applyFilters}
                            className="bg-blue-900 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="bg-gray-500 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Templates View */}
                {viewMode === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-3 sm:mb-4 lg:mb-6">
                        {certificateTemplates.map(template => (
                            <div
                                key={template.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#1a202c]"
                                onClick={() => {
                                    setSelectedTemplate(template);
                                    setFormData(prev => ({ ...prev, templateId: template.id }));
                                    setShowForm(true);
                                }}
                            >
                                <div className="text-center">
                                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">{template.preview}</div>
                                    <h3 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-2">{template.name}</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm">{template.description}</p>
                                    <button className="mt-3 sm:mt-4 bg-blue-900 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-800 transition-colors text-sm">
                                        Use Template
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                {/* Certificates Display */}
                {viewMode === 'cards' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {certificates.length === 0 ? (
                            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-12 text-center">
                                <div className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-gray-100 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                                    <span className="text-3xl sm:text-4xl lg:text-5xl">🎓</span>
                                </div>
                                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c] mb-3">No Certificates Found</h3>
                                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Start by creating your first professional certificate for students</p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-blue-900 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-lg font-bold hover:bg-blue-800 transition-all duration-300 text-sm sm:text-base"
                                >
                                    + Create First Certificate
                                </button>
                            </div>
                        ) : (
                            certificates.map(certificate => (
                            <div key={certificate._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Compact Certificate Preview */}
                                <div
                                    id={`certificate-${certificate._id}`}
                                    className="p-3 sm:p-4 lg:p-6 text-center relative"
                                    style={{
                                        ...getCertificateStyle(certificate.templateId),
                                        minHeight: '280px'
                                    }}
                                >
                                    {/* School Header */}
                                    <div className="mb-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center shadow-sm">
                                            <span className="text-white text-xl">🎓</span>
                                        </div>
                                        <h1 className="text-lg font-bold text-gray-900 mb-1">Sunlight School</h1>
                                        <p className="text-xs text-gray-600">Excellence in Education</p>
                                    </div>

                                    {/* Certificate Title */}
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-blue-900 mb-2">
                                            Certificate of {certificate.certificateType}
                                        </h2>
                                        <div className="w-16 h-1 bg-blue-900 mx-auto rounded-full"></div>
                                    </div>

                                    {/* Certificate ID */}
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-full inline-block">
                                            ID: {certificate._id?.substring(0, 6).toUpperCase()}
                                        </p>
                                    </div>

                                    {/* Recipient Information */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Presented to</p>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-blue-200 pb-1 inline-block px-4">
                                            {certificate.studentName}
                                        </h3>
                                        <div className="flex items-center justify-center gap-3 mt-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-medium">
                                                Class: {certificate.studentClass}
                                            </span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-900 rounded-full text-xs font-medium">
                                                Roll: {certificate.studentRoll}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Achievement Details */}
                                    <div className="mb-4 max-w-full mx-auto">
                                        <p className="text-sm text-gray-700 font-semibold mb-2">{certificate.title}</p>
                                        {certificate.achievement && (
                                            <div className="bg-blue-50 border-l-2 border-blue-900 p-2 rounded mt-2">
                                                <p className="text-blue-900 font-bold text-sm">{certificate.achievement}</p>
                                            </div>
                                        )}
                                        {certificate.grade && (
                                            <div className="mt-2">
                                                <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-bold">
                                                    {certificate.grade}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Signatures Section */}
                                    <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-200">
                                        <div className="text-center flex-1">
                                            <div className="w-16 h-8 border-b border-slate-400 mb-1"></div>
                                            <p className="text-xs font-semibold text-slate-700">{certificate.signature1}</p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-xs text-slate-500 mb-1">Date</p>
                                            <p className="font-bold text-slate-700 text-xs">{new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <div className="w-16 h-8 border-b border-slate-400 mb-1"></div>
                                            <p className="text-xs font-semibold text-slate-700">{certificate.signature2}</p>
                                        </div>
                                    </div>

                                    {/* Decorative Corner Elements */}
                                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl opacity-30"></div>
                                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr opacity-30"></div>
                                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl opacity-30"></div>
                                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br opacity-30"></div>
                                </div>

                                {/* Actions */}
                                <div className="p-3 bg-gray-50 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => editCertificate(certificate)}
                                                className="text-blue-900 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => generatePDF(certificate)}
                                                className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                                                title="Download PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => printCertificate(certificate)}
                                                className="text-purple-600 hover:text-purple-800 p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                                                title="Print"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => deleteCertificate(certificate._id)}
                                            className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                        )}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                                        <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {certificates.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-2 sm:px-3 lg:px-6 py-6 sm:py-8 lg:py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 bg-gray-100 rounded-full mb-3 sm:mb-4 flex items-center justify-center">
                                                        <span className="text-2xl sm:text-3xl lg:text-4xl">🎓</span>
                                                    </div>
                                                    <h3 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-2">No Certificates Found</h3>
                                                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm">Create your first certificate to get started</p>
                                                    <button
                                                        onClick={() => setShowForm(true)}
                                                        className="bg-blue-900 text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-800 transition-colors text-sm"
                                                    >
                                                        + Create Certificate
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        certificates.map(certificate => (
                                        <tr key={certificate._id} className="hover:bg-gray-50">
                                            <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-[#1a202c]">{certificate.studentName}</div>
                                                    <div className="text-xs sm:text-sm text-gray-500">Class {certificate.studentClass}</div>
                                                </div>
                                            </td>
                                            <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-900">
                                                    {certificate.certificateType}
                                                </span>
                                            </td>
                                            <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-sm text-[#1a202c]">{certificate.title}</td>
                                            <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                                {new Date(certificate.issueDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                                                <div className="flex gap-1 sm:gap-2">
                                                    <button
                                                        onClick={() => editCertificate(certificate)}
                                                        className="text-blue-900 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => generatePDF(certificate)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCertificate(certificate._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Certificate Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
                        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">
                                        {editingCertificate ? 'Edit Certificate' : 'Create New Certificate'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingCertificate(null);
                                            resetForm();
                                        }}
                                        className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                                    >
                                        <svg className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                                {/* Template Selection */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">Certificate Template</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                                        {certificateTemplates.map(template => (
                                            <div
                                                key={template.id}
                                                onClick={() => {
                                                    setSelectedTemplate(template);
                                                    setFormData(prev => ({ ...prev, templateId: template.id }));
                                                }}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    formData.templateId === template.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="text-center">
                                                    <div className="text-2xl mb-2">{template.preview}</div>
                                                    <div className="text-sm font-medium">{template.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Student Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Student Information</h3>

                                        {/* Student Entry Method */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Student Entry Method</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="studentEntryMethod"
                                                        value="select"
                                                        checked={formData.studentEntryMethod === 'select'}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            studentEntryMethod: e.target.value,
                                                            studentId: '',
                                                            studentName: '',
                                                            studentClass: '',
                                                            studentRoll: ''
                                                        }))}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm">Select from Database</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="studentEntryMethod"
                                                        value="manual"
                                                        checked={formData.studentEntryMethod === 'manual'}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            studentEntryMethod: e.target.value,
                                                            studentId: '',
                                                            studentName: '',
                                                            studentClass: '',
                                                            studentRoll: ''
                                                        }))}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm">Manual Entry</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Student Selection - Only show if select method is chosen */}
                                        {formData.studentEntryMethod === 'select' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                                                <select
                                                    value={formData.studentId}
                                                    onChange={(e) => handleStudentChange(e.target.value)}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                    required
                                                >
                                                    <option value="">Select Student</option>
                                                    {students.map(student => (
                                                        <option key={student._id} value={student._id}>
                                                            {student.name} - Class {student.class}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Student Name - Always show */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Student Name * {formData.studentEntryMethod === 'select' && <span className="text-xs text-gray-500">(auto-filled when selected)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.studentName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                placeholder={formData.studentEntryMethod === 'manual' ? "Type student name here" : "Student name will be auto-filled"}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                                <input
                                                    type="text"
                                                    value={formData.studentClass}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, studentClass: e.target.value }))}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                    placeholder="Class"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                                <input
                                                    type="text"
                                                    value={formData.studentRoll}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, studentRoll: e.target.value }))}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                    placeholder="Roll"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Certificate Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Certificate Details</h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type *</label>
                                            <select
                                                value={formData.certificateType}
                                                onChange={(e) => setFormData(prev => ({ ...prev, certificateType: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                required
                                            >
                                                {certificateTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                placeholder="Certificate title"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                rows={3}
                                                placeholder="Certificate description"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Achievement/Special Recognition</label>
                                            <input
                                                type="text"
                                                value={formData.achievement}
                                                onChange={(e) => setFormData(prev => ({ ...prev, achievement: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                placeholder="Special achievement or recognition"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                                                <select
                                                    value={formData.grade}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                >
                                                    <option value="">Select Grade</option>
                                                    {grades.map(grade => (
                                                        <option key={grade} value={grade}>{grade}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                                                <input
                                                    type="text"
                                                    value={formData.score}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                    placeholder="Score/Percentage"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                            <input
                                                type="date"
                                                value={formData.issueDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input
                                                type="date"
                                                value={formData.expiryDate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher/Supervisor</label>
                                            <select
                                                value={formData.teacherId}
                                                onChange={(e) => handleTeacherChange(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                            >
                                                <option value="">Select Teacher</option>
                                                {teachers.map(teacher => (
                                                    <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Signature 1</label>
                                            <input
                                                type="text"
                                                value={formData.signature1}
                                                onChange={(e) => setFormData(prev => ({ ...prev, signature1: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                placeholder="Principal/Director"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Signature 2</label>
                                            <input
                                                type="text"
                                                value={formData.signature2}
                                                onChange={(e) => setFormData(prev => ({ ...prev, signature2: e.target.value }))}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                                placeholder="Teacher/Supervisor"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Event/Program (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.event}
                                            onChange={(e) => setFormData(prev => ({ ...prev, event: e.target.value }))}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                            placeholder="Sports event, cultural program, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent text-sm"
                                            rows={3}
                                            placeholder="Additional notes or remarks"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingCertificate(null);
                                            resetForm();
                                        }}
                                        className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 sm:px-6 py-2 sm:py-3 bg-[#1a202c] text-white rounded-lg hover:bg-[#2d3748] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        {loading ? 'Saving...' : (editingCertificate ? 'Update Certificate' : 'Create Certificate')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

             
            </div>
        </div>
    );
};

export default CertificateManagementPage;