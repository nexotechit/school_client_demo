
'use client';

import React, { useState } from 'react';
import ImgBBUpload from '../../../components/ImgBBUpload';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';

// Function to generate PDF invoice
const generateInvoicePDF = (studentData, applicationId) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header with school name - Navy Theme (#1a2e5a)
    doc.setFillColor(26, 46, 90); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Sunlight School', pageWidth / 2, yPosition + 8, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Admission Application Receipt', pageWidth / 2, yPosition + 18, { align: 'center' });

    yPosition = 50;

    // Application Info Box
    doc.setDrawColor(26, 46, 90);
    doc.setLineWidth(1);
    doc.rect(15, yPosition - 5, pageWidth - 30, 25);
    
    doc.setTextColor(26, 46, 90);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Application Details', 20, yPosition + 3);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Application ID: ${applicationId}`, 20, yPosition + 10);
    doc.text(`Status: Pending Review`, 20, yPosition + 16);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, yPosition + 22);

    yPosition = 85;

    // Student Information Section
    doc.setTextColor(26, 46, 90);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Student Information', 20, yPosition);

    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const studentInfo = [
        { label: 'Full Name:', value: studentData.name },
        { label: 'Email:', value: studentData.email },
        { label: 'Date of Birth:', value: studentData.dateOfBirth },
        { label: 'Applying for Class:', value: studentData.class },
        { label: 'Preferred Section:', value: studentData.section || 'Any' },
    ];

    studentInfo.forEach((info) => {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(info.label, 20, yPosition);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(info.value, 80, yPosition);
        yPosition += 7;
    });

    yPosition += 5;

    // Parent Information Section
    doc.setTextColor(26, 46, 90);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Parent/Guardian Information', 20, yPosition);

    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const parentInfo = [
        { label: 'Parent/Guardian Name:', value: studentData.parentName },
        { label: 'Phone Number:', value: studentData.parentPhone },
    ];

    parentInfo.forEach((info) => {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(info.label, 20, yPosition);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(info.value, 80, yPosition);
        yPosition += 7;
    });

    yPosition += 5;

    // Address Section
    doc.setTextColor(26, 46, 90);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Address', 20, yPosition);

    yPosition += 6;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    const addressLines = doc.splitTextToSize(studentData.address, 170);
    doc.text(addressLines, 20, yPosition);

    yPosition = pageHeight - 40;

    // Important Note
    doc.setFillColor(254, 243, 199); // Amber-100 bg
    doc.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
    
    doc.setDrawColor(245, 166, 35); // Gold border
    doc.setLineWidth(1);
    doc.rect(15, yPosition - 5, pageWidth - 30, 25);
    
    doc.setTextColor(120, 53, 4); // Amber-900 text
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Important Notice', 20, yPosition + 2);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    const noteLines = doc.splitTextToSize(
        'Your Student ID and Roll Number will be assigned after admin approval. You will receive a confirmation email once your application is processed.',
        160
    );
    doc.text(noteLines, 20, yPosition + 8);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This is an automated receipt for your admission application submission.', pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Download the PDF
    const fileName = `Admission_Application_${applicationId}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
};

const Admision = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        class: '',
        section: '',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        address: '',
        imageUrl: '',
        status: 'pending'
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get API URL
            const apiUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? 'http://localhost:5000'
                : 'https://schoolserver-nine.vercel.app';

            console.log('📝 Submitting admission application...');
            console.log('   Status: pending (no studentId/rollNumber yet)');

            const response = await fetch(`${apiUrl}/api/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                const applicationId = result.data?._id;
                console.log('✅ Admission application submitted successfully');
                console.log('   Application ID:', applicationId);
                console.log('   Will receive studentId and rollNumber after admin approval');

                Swal.fire({
                    icon: 'success',
                    title: 'Application Submitted!',
                    html: `
                        <div style="text-align: left; font-size: 14px; line-height: 1.8; font-family: sans-serif;">
                            <p style="margin-bottom: 15px; color: #374151;">Your admission application has been submitted successfully!</p>
                            <div style="background: rgba(245, 166, 35, 0.1); padding: 14px; border-radius: 12px; border-left: 4px solid #f5a623; margin-bottom: 12px;">
                                <p style="margin: 0; color: #132348; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Status</p>
                                <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #1a2e5a;">Pending Review</p>
                            </div>
                            <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 13px;">Your Student ID and Roll Number will be assigned after admin approval.</p>
                        </div>
                    `,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#1a2e5a',
                    showDenyButton: true,
                    denyButtonText: '📥 Download Invoice',
                    denyButtonColor: '#f5a623',
                    customClass: {
                        denyButton: 'swal-download-btn',
                    },
                }).then((result) => {
                    if (result.isDenied) {
                        generateInvoicePDF(formData, applicationId);
                    }
                });

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    class: '',
                    section: '',
                    dateOfBirth: '',
                    parentName: '',
                    parentPhone: '',
                    address: '',
                    imageUrl: '',
                    status: 'pending'
                });
            } else {
                const error = await response.json();
                console.error('❌ Submission failed:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: error.message || 'Please try again.',
                    confirmButtonColor: '#1a2e5a',
                });
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Network error. Please try again.',
                confirmButtonColor: '#1a2e5a',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-[#F9FAFB] py-16 md:py-24 font-[Inter,sans-serif] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] rounded-full bg-[#f5a623]/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] rounded-full bg-[#fdb94e]/5 blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] mb-4">
                            Admission Session 2026-2027
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1F2937] tracking-tight mb-4">
                            Student Admission Application
                        </h1>
                        <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
                            Apply for admission to Sunlight School. Fill out the form below with accurate information.
                        </p>
                        <div className="mt-5 w-24 h-1 bg-gradient-to-r from-[#f5a623] to-[#fdb94e] mx-auto rounded-full" />
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                        <div className="relative overflow-hidden bg-gradient-to-r from-[#1a2e5a] to-[#132348] text-white p-6 sm:p-8 border-b border-white/10">
                            {/* Inner glowing circle */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5a623]/10 rounded-full blur-2xl pointer-events-none" />
                            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-3">
                                <span className="inline-block w-2.5 h-6 bg-[#f5a623] rounded-full" />
                                Application Form
                            </h2>
                            <p className="text-xs sm:text-sm text-white/70 mt-1.5">Please fill in all required fields marked with *</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                                        Full Name <span className="text-[#f5a623] font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                        placeholder="Enter student's full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                                        Email <span className="text-[#f5a623] font-bold">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                                        Applying for Class <span className="text-[#f5a623] font-bold">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="class"
                                            value={formData.class}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all appearance-none cursor-pointer pr-10"
                                        >
                                            <option value="" className="text-gray-400">Select Class</option>
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
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#6B7280]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">Preferred Section</label>
                                    <div className="relative">
                                        <select
                                            name="section"
                                            value={formData.section}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all appearance-none cursor-pointer pr-10"
                                        >
                                            <option value="">Any Section</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#6B7280]">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                                        Date of Birth <span className="text-[#f5a623] font-bold">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                                        Parent/Guardian Name <span className="text-[#f5a623] font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="parentName"
                                        value={formData.parentName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                        placeholder="Parent or guardian full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                                        Parent Phone Number <span className="text-[#f5a623] font-bold">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="parentPhone"
                                        value={formData.parentPhone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                                        Address <span className="text-[#f5a623] font-bold">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        className="w-full px-4 py-3 text-sm border border-[#E5E7EB] bg-[#F9FAFB] text-[#1F2937] placeholder-[#6B7280]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f5a623]/20 focus:border-[#f5a623] transition-all resize-none"
                                        placeholder="Enter your complete current address"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#374151] mb-2">Student Photo</label>
                                    <div className="space-y-4">
                                        {formData.imageUrl && (
                                            <div className="flex items-center space-x-4 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl transition-all duration-300">
                                                <img
                                                    src={formData.imageUrl}
                                                    alt="Student preview"
                                                    className="w-16 h-16 object-cover rounded-xl border border-[#E5E7EB] shadow-sm"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm text-[#1F2937] font-bold">Photo Uploaded Successfully</p>
                                                    <p className="text-xs text-[#6B7280]">Click upload below to replace current photo</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Remove photo"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4">
                                            <ImgBBUpload
                                                onUploadSuccess={(urls) => {
                                                    setFormData({ ...formData, imageUrl: urls[0] });
                                                    Swal.fire({
                                                        icon: 'success',
                                                        title: 'Upload Successful!',
                                                        text: 'Photo uploaded successfully.',
                                                        timer: 2000,
                                                        showConfirmButton: false,
                                                        confirmButtonColor: '#1a2e5a',
                                                    });
                                                }}
                                                onUploadError={(error) => {
                                                    Swal.fire({
                                                        icon: 'error',
                                                        title: 'Upload Failed',
                                                        text: error,
                                                        confirmButtonColor: '#1a2e5a',
                                                    });
                                                }}
                                                multiple={false}
                                                maxFiles={1}
                                            />
                                        </div>
                                        <p className="text-xs text-[#6B7280] ml-1">Upload a clear passport-sized photo (JPG, PNG, GIF). Max 32MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t border-[#E5E7EB]">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-3.5 bg-gradient-to-r from-[#f5a623] to-[#fdb94e] text-[#132348] font-bold rounded-full shadow-[0_4px_14px_rgba(245,166,35,0.25)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Admision;
