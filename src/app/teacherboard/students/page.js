'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { API_URL } from '../../../../config/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ImgBBUpload from '../../../../components/ImgBBUpload';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        email: '',
        class: '',
        section: '',
        rollNumber: '',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        address: '',
        imageUrl: '',
        status: 'active'
    });

    // Fetch all students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            console.log('Fetching students from:', `${API_URL}/api/students`);
            const response = await fetch(`${API_URL}/api/students`, { cache: 'no-store' });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                // Filter only users with role 'student'
                const studentUsers = data.data.filter(user => user.role === 'student');
                setStudents(studentUsers);
                console.log('Students loaded:', studentUsers.length);
            } else {
                console.error('API returned success=false:', data.message);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch students. Make sure server is running on port 5000.',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Generate unique student ID
    const generateStudentId = () => {
        const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
        const existingIds = students
            .map(student => student.studentId)
            .filter(id => id && id.startsWith(`${currentYear}-`))
            .map(id => parseInt(id.split('-')[1]))
            .filter(num => !isNaN(num));

        const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        return `${currentYear}-${nextNumber.toString().padStart(4, '0')}`;
    };

    // Handle form input change
    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Open modal for adding
    const handleAddStudent = () => {
        setIsEditMode(false);
        setCurrentStudent(null);
        const newStudentId = generateStudentId();
        setFormData({
            studentId: newStudentId,
            name: '',
            email: '',
            class: '',
            section: '',
            rollNumber: '',
            dateOfBirth: '',
            parentName: '',
            parentPhone: '',
            address: '',
            imageUrl: '',
            status: 'active'
        });
        setIsModalOpen(true);
    };

    // Open modal for editing
    const handleEditStudent = (student) => {
        setIsEditMode(true);
        setCurrentStudent(student);
        setFormData({
            studentId: student.studentId || '',
            name: student.name,
            email: student.email,
            class: student.class,
            section: student.section,
            rollNumber: student.rollNumber,
            dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
            parentName: student.parentName || '',
            parentPhone: student.parentPhone || '',
            address: student.address || '',
            imageUrl: student.imageUrl || '',
            status: student.status || 'active'
        });
        setIsModalOpen(true);
    };

    // Submit form (Add or Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let url, method, body;
            
            if (isEditMode) {
                // Update existing student
                url = `${API_URL}/api/auth/user/${currentStudent._id}`;
                method = 'PUT';
                body = JSON.stringify(formData);
            } else {
                // Add new student (register)
                url = `${API_URL}/api/auth/register`;
                method = 'POST';
                body = JSON.stringify({
                    studentId: formData.studentId,
                    name: formData.name,
                    rollNumber: formData.rollNumber,
                    class: formData.class,
                    section: formData.section,
                    password: formData.rollNumber,
                    role: 'student',
                    email: formData.email,
                    dateOfBirth: formData.dateOfBirth,
                    parentName: formData.parentName,
                    parentPhone: formData.parentPhone,
                    address: formData.address,
                    imageUrl: formData.imageUrl,
                    status: formData.status
                });
            }
            
            console.log('Submitting to:', url);
            console.log('Request body:', body);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const data = await response.json();
            console.log('Submit response:', data);

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated!' : 'Added!',
                    text: isEditMode ? 'Student updated successfully' : 'Student added successfully. Default password is the roll number.',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                setIsModalOpen(false);
                setIsEditMode(false);
                setCurrentStudent(null);
                // Reset form data
                setFormData({
                    studentId: '',
                    name: '',
                    email: '',
                    class: '',
                    section: '',
                    rollNumber: '',
                    dateOfBirth: '',
                    parentName: '',
                    parentPhone: '',
                    address: '',
                    imageUrl: '',
                    status: 'active'
                });
                // Fetch updated list
                await fetchStudents();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Operation failed',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Something went wrong!',
                customClass: { container: 'swal-high-z-index' }
            });
        }
    };

    // Delete student
    const handleDeleteStudent = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            customClass: { container: 'swal-high-z-index' }
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/api/auth/user/${id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Student has been deleted.',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: { container: 'swal-high-z-index' }
                    });
                    fetchStudents();
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete student',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        }
    };

    // Print student details as PDF
    const handlePrintStudent = async (student) => {
        try {
            // Create a temporary div for PDF content
            const printDiv = document.createElement('div');
            printDiv.style.position = 'absolute';
            printDiv.style.left = '-9999px';
            printDiv.style.top = '-9999px';
            printDiv.style.width = '800px';
            printDiv.style.backgroundColor = 'white';
            printDiv.style.fontFamily = 'Arial, sans-serif';
            printDiv.innerHTML = `
                <div style="padding: 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Sunlight School</h1>
                    <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Student Information Card</p>
                </div>

                <div style="padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    <!-- Highlighted Student ID and Email -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                        <div style="display: flex; justify-content: center; gap: 40px; align-items: center;">
                            <div>
                                <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Student ID</p>
                                <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #1f2937;">${student.studentId || 'N/A'}</p>
                            </div>
                            <div style="width: 1px; height: 40px; background: #f59e0b;"></div>
                            <div>
                                <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email Address</p>
                                <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1f2937;">${student.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Student Profile Section -->
                    <div style="display: flex; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin-right: 20px; overflow: hidden; border: 3px solid #e5e7eb;">
                            ${student.imageUrl ? `<img src="${student.imageUrl}" alt="${student.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />` : ''}<span style="${student.imageUrl ? 'display: none;' : ''}">👤</span>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${student.name}</h2>
                            <p style="margin: 3px 0; color: #6b7280; font-size: 14px;">Roll Number: ${student.rollNumber}</p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">Class ${student.class} - Section ${student.section}</p>
                        </div>
                    </div>

                    <!-- Information Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6;">
                            <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Academic Details</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Class:</span>
                                <span style="color: #6b7280; font-size: 13px;">${student.class}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Section:</span>
                                <span style="color: #6b7280; font-size: 13px;">${student.section}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Status:</span>
                                <span style="color: ${student.status === 'active' ? '#059669' : '#6b7280'}; font-weight: 600; font-size: 13px;">${student.status.charAt(0).toUpperCase() + student.status.slice(1)}</span>
                            </div>
                        </div>

                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #059669;">
                            <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Personal Details</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Date of Birth:</span>
                                <span style="color: #6b7280; font-size: 13px;">${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Parent Phone:</span>
                                <span style="color: #6b7280; font-size: 13px;">${student.parentPhone || 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Parent Name:</span>
                                <span style="color: #6b7280; font-size: 13px;">${student.parentName || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Address Section -->
                    <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Address</h3>
                        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.4;">${student.address || 'N/A'}</p>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px;">
                        <p style="margin: 0;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                        <p style="margin: 3px 0;">Sunlight School Management System</p>
                    </div>
                </div>
            `;
            document.body.appendChild(printDiv);

            // Generate PDF
            const canvas = await html2canvas(printDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Download PDF
            pdf.save(`${student.name}_Student_Card.pdf`);

            // Remove temporary div
            document.body.removeChild(printDiv);

            Swal.fire({
                icon: 'success',
                title: 'PDF Generated!',
                text: 'Student information PDF has been downloaded successfully.',
                timer: 2000,
                showConfirmButton: false,
                customClass: { container: 'swal-high-z-index' }
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate PDF. Please try again.',
                customClass: { container: 'swal-high-z-index' }
            });
        }
    };

    // Filter students based on search term and filters
    const filteredStudents = students.filter(student => {
        const matchesSearch = searchTerm === '' || 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.rollNumber && student.rollNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.class && student.class.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesClass = filterClass === '' || student.class === filterClass;
        const matchesSection = filterSection === '' || student.section === filterSection;
        
        return matchesSearch && matchesClass && matchesSection;
    });

    return (
        <div className="p-2 sm:p-4 lg:p-8 min-h-screen bg-gray-50">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 container mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Student Management</h2>
                        <p className="text-gray-600 text-sm sm:text-base">Manage all student records and information</p>
                    </div>
                    <button
                        onClick={handleAddStudent}
                        className="w-full sm:w-auto mt-2 sm:mt-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Student</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, roll number or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 pl-10 sm:pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 sm:left-4 top-2.5 sm:top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Filter by Class</label>
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="">All Classes</option>
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
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Filter by Section</label>
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="">All Sections</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterClass('');
                                setFilterSection('');
                            }}
                            className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                        <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">{students.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100">
                        <p className="text-xs sm:text-sm text-gray-600">Active Students</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900 mt-1">{students.filter(s => s.status === 'active').length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                        <p className="text-xs sm:text-sm text-gray-600">Inactive Students</p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{students.filter(s => s.status === 'inactive').length}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                        <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-base sm:text-lg">No students found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Serial</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Photo</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Student ID</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Roll No</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Email</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Class</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Section</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Parent Phone</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Print</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((student, index) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">{index + 1}</td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                                            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                                                {student.imageUrl ? (
                                                    <img
                                                        src={student.imageUrl}
                                                        alt={student.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0QzE0IDUuMSAxMy4xIDYgMTIgNkMxMC45IDYgMTAgNS4xIDEwIDRDMTAgMi45IDEwLjkgMiAxMiAyWk0yMSAxOVYyMEgzVjE5QzMgMTYuMzMgNS4zMyAxNCA4IDE0SDE2QzE4LjY3IDE0IDIxIDE2LjMzIDIxIDE5WiIgZmlsbD0iIzk3OTdhNyIvPgo8L3N2Zz4K';
                                                        }}
                                                    />
                                                ) : (
                                                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">{student.studentId || 'N/A'}</td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">{student.rollNumber}</td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{student.name}</td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                                            {student.email && student.email.trim() !== '' ? student.email : 'N/A'}
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{student.class}</td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{student.section}</td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                                            {student.parentPhone && student.parentPhone.trim() !== '' ? student.parentPhone : 'N/A'}
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                                student.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                                            <button
                                                onClick={() => handlePrintStudent(student)}
                                                className="text-purple-600 hover:text-purple-800 p-1 sm:p-2 hover:bg-purple-50 rounded-lg transition-all"
                                                title="Print Student Details"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4">
                                            <div className="flex space-x-1 sm:space-x-2">
                                                <button
                                                    onClick={() => handleEditStudent(student)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 sm:p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student._id)}
                                                    className="text-red-600 hover:text-red-800 p-1 sm:p-2 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                    )}
                </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg sm:text-xl font-bold">
                                    {isEditMode ? 'Edit Student' : 'Add New Student'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-white hover:text-gray-200 transition-colors p-1"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="Enter student name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="student@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                                    <select
                                        name="class"
                                        value={formData.class}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                                        <option value="Class 11">Class 11</option>
                                        <option value="Class 12">Class 12</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                                    <select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="">Select Section</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                                    <input
                                        type="text"
                                        name="rollNumber"
                                        value={formData.rollNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="e.g., 2024001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID *</label>
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                        required
                                        readOnly={!isEditMode}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                                        placeholder="Auto-generated"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent/Guardian Name *</label>
                                    <input
                                        type="text"
                                        name="parentName"
                                        value={formData.parentName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="Parent name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone *</label>
                                    <input
                                        type="tel"
                                        name="parentPhone"
                                        value={formData.parentPhone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        rows="2"
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="Enter full address"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
                                    <div className="space-y-3">
                                        {formData.imageUrl && (
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <img
                                                    src={formData.imageUrl}
                                                    alt="Student preview"
                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-700 font-medium">Current Photo</p>
                                                    <p className="text-xs text-gray-500">Click upload below to replace</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                    className="text-red-500 hover:text-red-700 p-1 self-start sm:self-center"
                                                    title="Remove photo"
                                                >
                                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        <ImgBBUpload
                                            onUploadSuccess={(urls) => {
                                                setFormData({ ...formData, imageUrl: urls[0] });
                                                Swal.fire({
                                                    icon: 'success',
                                                    title: 'Upload Successful!',
                                                    text: 'Student photo uploaded successfully.',
                                                    timer: 2000,
                                                    showConfirmButton: false,
                                                    customClass: { container: 'swal-high-z-index' }
                                                });
                                            }}
                                            onUploadError={(error) => {
                                                Swal.fire({
                                                    icon: 'error',
                                                    title: 'Upload Failed',
                                                    text: error,
                                                    customClass: { container: 'swal-high-z-index' }
                                                });
                                            }}
                                            multiple={false}
                                            maxFiles={1}
                                        />
                                        <p className="text-xs text-gray-500">Upload a clear photo of the student (JPG, PNG, GIF). Max 32MB.</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm sm:text-base font-medium"
                                >
                                    {isEditMode ? 'Update Student' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
