'use client';
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../config/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ImgBBUpload from '../../../../components/ImgBBUpload';
import EmailEditor from '../../../../components/EmailEditor';
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  prefetchStudents
} from '../../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';


export default function StudentManagement() {
    const queryClient = useQueryClient();

    // React Query hooks for data management
    const { data: studentsData, isLoading: loading, error: studentsError } = useStudents();
    const createStudentMutation = useCreateStudent();
    const updateStudentMutation = useUpdateStudent();
    const deleteStudentMutation = useDeleteStudent();

    // API returns only students from the students collection (no role filter needed)
    const students = studentsData?.data || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
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

    const [emailFormData, setEmailFormData] = useState({
        recipientType: 'all', // all, class, section, individual
        class: '',
        section: '',
        subject: '',
        message: '',
        selectedStudents: [],
        individualSearch: '',
        individualFilterClass: '',
        individualFilterSection: '',
        toRecipients: [] // Array of {id, name, email} objects
    });

    // Handle errors from React Query
    useEffect(() => {
        if (studentsError) {
            console.error('Error fetching students:', studentsError);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch students. Please check your connection.',
                customClass: { container: 'swal-high-z-index' }
            });
        }
    }, [studentsError]);

    // Prefetch data on hover (for better UX)
    const handlePrefetchOnHover = () => {
        prefetchStudents(queryClient);
    };

    // Generate unique student ID
    const generateStudentId = () => {
        const currentYear = new Date().getFullYear().toString().slice(-2);
        // Find the max sequence number across ALL existing student IDs (any year)
        const existingNumbers = students
            .map(s => s.studentId)
            .filter(id => id && /^\d{2}-\d+$/.test(id))
            .map(id => parseInt(id.split('-')[1]))
            .filter(num => !isNaN(num));
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
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
            name: student.name || '',
            email: student.email || '',
            class: student.class || '',
            section: student.section || '',
            rollNumber: student.rollNumber || '',
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
            const wasEditMode = isEditMode;

            if (isEditMode) {
                // Update existing student
                await updateStudentMutation.mutateAsync({
                    id: currentStudent._id,
                    ...formData
                });
            } else {
                // Add new student (register)
                await createStudentMutation.mutateAsync({
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

            // Close modal — cache is updated immediately by onSuccess in the hook
            setIsModalOpen(false);
            setIsEditMode(false);
            setCurrentStudent(null);
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

            Swal.fire({
                icon: 'success',
                title: wasEditMode ? 'Updated!' : 'Added!',
                text: wasEditMode ? 'Student updated successfully' : 'Student added successfully. Default password is the roll number.',
                timer: 2000,
                showConfirmButton: false,
                customClass: { container: 'swal-high-z-index' }
            });
            // Auto reload after 500ms to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error?.message || 'Something went wrong!',
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
                await deleteStudentMutation.mutateAsync(id);

                // Cache is updated immediately by onSuccess in the hook
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Student has been deleted.',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
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

    const handleApproveStudent = async (id) => {
        const result = await Swal.fire({
            title: 'Approve Student?',
            text: "This will activate the student's account and they will be able to login.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, approve!',
            customClass: { container: 'swal-high-z-index' }
        });

        if (result.isConfirmed) {
            try {
                // Calculate the next advisory studentId to assign to this pending student
                const nextStudentId = generateStudentId();
                console.log('🔄 Approving student:', id);
                console.log(`🆔 Next Student ID to assign: ${nextStudentId}`);
                console.log('📍 API URL:', `${API_URL}/api/students/${id}/approve`);

                const response = await fetch(`${API_URL}/api/students/${id}/approve`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentId: nextStudentId  // Send the advisory ID for assignment
                    })
                });

                console.log('✅ Response status:', response.status);
                console.log('✅ Response ok:', response.ok);

                const data = await response.json();
                console.log('📦 Response data:', data);

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to approve student');
                }

                // Refetch students to update the list and recalculate next advisory ID
                await queryClient.invalidateQueries({ queryKey: ['students'] });
                console.log('🔄 Students cache invalidated');
                console.log(`✅ Student ID ${nextStudentId} assigned and approved`);

                Swal.fire({
                    icon: 'success',
                    title: 'Approved!',
                    html: `
                        <div style="text-align: left; font-size: 14px;">
                            <p style="margin-bottom: 10px;">Student has been approved and activated.</p>
                            <div style="background: #f0fdf4; padding: 10px; border-radius: 6px; border-left: 3px solid #059669;">
                                <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">Assigned Student ID</p>
                                <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #1f2937;">${nextStudentId}</p>
                            </div>
                        </div>
                    `,
                    timer: 2500,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
            } catch (error) {
                console.error('❌ Error approving student:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to approve student',
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
            printDiv.style.fontFamily = "'Tiro Bangla','Tiro Bangla Static',serif";
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

    // Handle email form input change
    const handleEmailInputChange = (e) => {
        const { name, value } = e.target;
        
        // If switching away from individual mode, clear individual filters and selections
        if (name === 'recipientType' && value !== 'individual' && emailFormData.recipientType === 'individual') {
            setEmailFormData(prev => ({
                ...prev,
                [name]: value,
                selectedStudents: [],
                individualSearch: '',
                individualFilterClass: '',
                individualFilterSection: ''
            }));
        }
        // If switching to individual mode, clear class/section filters
        else if (name === 'recipientType' && value === 'individual') {
            setEmailFormData(prev => ({
                ...prev,
                [name]: value,
                class: '',
                section: ''
            }));
        }
        else {
            setEmailFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Toggle student selection for individual email and add to To field
    const toggleStudentSelection = (studentId) => {
        const student = students.find(s => s._id === studentId);
        const isSelected = emailFormData.selectedStudents.includes(studentId);
        
        setEmailFormData(prev => {
            let newToRecipients = [...prev.toRecipients];
            
            if (isSelected) {
                // Remove from To field
                newToRecipients = newToRecipients.filter(r => r.id !== studentId);
            } else if (student) {
                // Add to To field
                newToRecipients.push({
                    id: studentId,
                    name: student.name,
                    email: student.email
                });
            }
            
            return {
                ...prev,
                selectedStudents: prev.selectedStudents.includes(studentId)
                    ? prev.selectedStudents.filter(id => id !== studentId)
                    : [...prev.selectedStudents, studentId],
                toRecipients: newToRecipients
            };
        });
    };

    // Remove recipient from To field
    const removeFromToField = (studentId) => {
        setEmailFormData(prev => ({
            ...prev,
            selectedStudents: prev.selectedStudents.filter(id => id !== studentId),
            toRecipients: prev.toRecipients.filter(r => r.id !== studentId)
        }));
    };

    // Send email to students
    const handleSendEmail = async (e) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (emailLoading) {
            console.warn('Email is already being sent, please wait...');
            return;
        }

        if (!emailFormData.subject || !emailFormData.subject.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Subject Required',
                text: 'Please enter an email subject',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        // Extract plain text from HTML to validate message is not empty
        const plainText = emailFormData.message.replace(/<[^>]*>/g, '').trim();
        if (!emailFormData.message || !plainText) {
            Swal.fire({
                icon: 'warning',
                title: 'Message Required',
                text: 'Please enter an email message',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        if (emailFormData.recipientType === 'class' && !emailFormData.class) {
            Swal.fire({
                icon: 'warning',
                title: 'Class Required',
                text: 'Please select a class',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        if (emailFormData.recipientType === 'section' && (!emailFormData.class || !emailFormData.section)) {
            Swal.fire({
                icon: 'warning',
                title: 'Class and Section Required',
                text: 'Please select both class and section',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        if (emailFormData.recipientType === 'individual' && emailFormData.toRecipients.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Recipients Required',
                text: 'Please add at least one student to the To field',
                customClass: { container: 'swal-high-z-index' }
            });
            return;
        }

        // Determine recipient count
        let recipientCount = 0;
        if (emailFormData.recipientType === 'individual') {
            recipientCount = emailFormData.toRecipients.length;
        }

        // Show confirmation dialog for individual emails
        if (emailFormData.recipientType === 'individual' && recipientCount > 0) {
            const confirmResult = await Swal.fire({
                icon: 'info',
                title: 'Confirm Email Send',
                html: `
                    <div style="text-align: left;">
                        <p style="margin-bottom: 15px; font-size: 14px;">You are about to send this email to:</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
                            <div style="font-size: 13px; line-height: 1.8;">
                                ${emailFormData.toRecipients.map(r => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                        <span style="font-weight: 500; color: #1f2937;">${r.name}</span>
                                        <span style="color: #6b7280; font-size: 12px;">${r.email}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div style="background: #ede9fe; padding: 12px; border-radius: 6px; border-left: 3px solid #7c3aed;">
                            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #5b21b6;">
                                📧 Total: ${recipientCount} Student${recipientCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#7c3aed',
                confirmButtonText: 'Yes, Send Email',
                cancelButtonText: 'Cancel',
                customClass: { container: 'swal-high-z-index' }
            });

            if (!confirmResult.isConfirmed) {
                console.log('Email send cancelled by user');
                return;
            }
        }

        // All validations passed, set loading state
        setEmailLoading(true);

        try {
            const emailPayload = {
                recipientType: emailFormData.recipientType,
                subject: emailFormData.subject.trim(),
                message: emailFormData.message.trim()
            };

            if (emailFormData.recipientType === 'class' || emailFormData.recipientType === 'section') {
                emailPayload.class = emailFormData.class;
                if (emailFormData.recipientType === 'section') {
                    emailPayload.section = emailFormData.section;
                }
            }

            if (emailFormData.recipientType === 'individual') {
                emailPayload.toEmails = emailFormData.toRecipients.map(r => r.email);
            }

            console.log('📧 Sending email with payload:', emailPayload);

            const response = await fetch(`${API_URL}/api/email/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailPayload)
            });

            const data = await response.json();

            if (response.ok) {
                console.log('✅ Email sent successfully to', data.recipientCount, 'recipient(s)');
                Swal.fire({
                    icon: 'success',
                    title: 'Email Sent Successfully!',
                    html: `
                        <div style="text-align: left; font-size: 14px;">
                            <p style="margin-bottom: 15px; color: #059669; font-weight: bold;">✓ Email successfully delivered to all recipients</p>
                            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
                                <div style="margin-bottom: 10px;">
                                    <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 600;">Recipients: ${emailFormData.recipientType.toUpperCase()}</p>
                                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #1f2937;">${data.recipientCount} Student${data.recipientCount !== 1 ? 's' : ''}</p>
                                </div>
                                <div style="border-top: 1px solid #dcfce7; padding-top: 10px; margin-top: 10px;">
                                    <p style="margin: 0; font-size: 12px; color: #059669;">
                                        <strong>Subject:</strong> ${emailFormData.subject}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `,
                    showConfirmButton: true,
                    confirmButtonColor: '#059669',
                    customClass: { container: 'swal-high-z-index' }
                });

                // Reset form and close modal
                setEmailFormData({
                    recipientType: 'all',
                    class: '',
                    section: '',
                    subject: '',
                    message: '',
                    selectedStudents: [],
                    toRecipients: []
                });
                setIsEmailModalOpen(false);
            } else {
                console.error('❌ Email send failed:', data);
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to Send Email',
                    text: data.message || 'There was an error sending the email. Please check the details and try again.',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        } catch (error) {
            console.error('❌ Error sending email:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Network error occurred. Please check your connection and try again.',
                customClass: { container: 'swal-high-z-index' }
            });
        } finally {
            setEmailLoading(false);
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
        const matchesStatus = filterStatus === '' || student.status === filterStatus;
        
        return matchesSearch && matchesClass && matchesSection && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Student Management</h2>
                        <p className="text-sm sm:text-base text-gray-600">Manage all student records and information</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 lg:mt-0">
                         <button onClick={() => window.location.reload()} className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={handleAddStudent}
                            className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Student</span>
                        </button>
                        <button
                            onClick={() => setIsEmailModalOpen(true)}
                            className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Students Email</span>
                        </button>
                       
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, roll number or class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Section</label>
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="">All Sections</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base font-medium"
                        >
                            Pending Students
                        </button>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterClass('');
                                setFilterSection('');
                                setFilterStatus('');
                            }}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                        <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-900">{students.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100">
                        <p className="text-xs sm:text-sm text-gray-600">Active Students</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900">{students.filter(s => s.status === 'active').length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 sm:p-4 rounded-xl border border-yellow-100">
                        <p className="text-xs sm:text-sm text-gray-600">Pending Approvals</p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-900">{students.filter(s => s.status === 'pending').length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-100">
                        <p className="text-xs sm:text-sm text-gray-600">Inactive Students</p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-900">{students.filter(s => s.status === 'inactive').length}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                        <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-base sm:text-lg">No students found</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View - Single Line Format */}
                        <div className="block md:hidden space-y-2">
                            {filteredStudents.map((student, index) => (
                                <div key={student._id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between gap-2">
                                        {/* Student Info - Compact */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
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
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-semibold text-gray-900 truncate">{student.name}</h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                                            student.status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : student.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {student.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600">ID: {student.studentId || 'N/A'} | {student.class} {student.section} | Roll: {student.rollNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-1 flex-shrink-0">
                                            {student.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApproveStudent(student._id)}
                                                    className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded transition-all"
                                                    title="Approve"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handlePrintStudent(student)}
                                                className="text-purple-600 hover:text-purple-800 p-1.5 hover:bg-purple-50 rounded transition-all"
                                                title="Print"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition-all"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
                                                className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-all"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Serial</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Photo</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Section</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parent Phone</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Print</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.map((student, index) => (
                                        <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                                            <td className="px-4 py-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
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
                                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">{student.studentId || 'N/A'}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">{student.rollNumber}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{student.name}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {student.email && student.email.trim() !== '' ? student.email : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{student.class}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{student.section}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {student.parentPhone && student.parentPhone.trim() !== '' ? student.parentPhone : 'N/A'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    student.status === 'active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : student.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => handlePrintStudent(student)}
                                                    className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-all"
                                                    title="Print Student Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex space-x-2">
                                                {student.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleApproveStudent(student._id)}
                                                        className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Approve Student"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditStudent(student)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student._id)}
                                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </>
                )}
            </div>


            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 sm:p-6 rounded-t-2xl">
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
                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <img
                                                    src={formData.imageUrl}
                                                    alt="Student preview"
                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700 font-medium">Current Photo</p>
                                                    <p className="text-xs text-gray-500">Click upload below to replace</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                    className="text-red-500 hover:text-red-700 p-1"
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
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
                                >
                                    {isEditMode ? 'Update Student' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white p-4 sm:p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Send Email to Students
                                </h3>
                                <button
                                    onClick={() => setIsEmailModalOpen(false)}
                                    className="text-white hover:text-gray-200 transition-colors p-1"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSendEmail} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Recipient Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Recipient Type *</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {[
                                        { value: 'all', label: 'All Students', icon: '👥' },
                                        { value: 'class', label: 'By Class', icon: '📚' },
                                        { value: 'section', label: 'By Section', icon: '📋' },
                                        { value: 'individual', label: 'Individual', icon: '👤' }
                                    ].map(option => (
                                        <label key={option.value} className="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all"
                                            style={{
                                                borderColor: emailFormData.recipientType === option.value ? '#8b5cf6' : '#e5e7eb',
                                                backgroundColor: emailFormData.recipientType === option.value ? '#faf5ff' : '#ffffff'
                                            }}>
                                            <input
                                                type="radio"
                                                name="recipientType"
                                                value={option.value}
                                                checked={emailFormData.recipientType === option.value}
                                                onChange={handleEmailInputChange}
                                                className="w-4 h-4 text-purple-600"
                                            />
                                            <span className="ml-3 text-sm font-medium text-gray-700">{option.icon} {option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Class Selection (for class/section mode) */}
                            {(emailFormData.recipientType === 'class' || emailFormData.recipientType === 'section') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Class *</label>
                                    <select
                                        name="class"
                                        value={emailFormData.class}
                                        onChange={handleEmailInputChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
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
                            )}

                            {/* Section Selection (for section mode) */}
                            {emailFormData.recipientType === 'section' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Section *</label>
                                    <select
                                        name="section"
                                        value={emailFormData.section}
                                        onChange={handleEmailInputChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                                    >
                                        <option value="">Select Section</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                            )}

                            {/* Individual Student Selection */}
                            {emailFormData.recipientType === 'individual' && (
                                <div>
                                    {/* To Field - Show selected recipients */}
                                    {emailFormData.toRecipients.length > 0 && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-sm font-bold text-blue-900 flex items-center gap-2">
                                                    <span className="text-lg">📧</span>
                                                    <span>Recipients ({emailFormData.toRecipients.length})</span>
                                                </label>
                                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                                    {emailFormData.toRecipients.length} will receive
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {emailFormData.toRecipients.map(recipient => (
                                                    <div
                                                        key={recipient.id}
                                                        className="bg-white border-2 border-blue-400 rounded-full px-3 py-2 flex items-center gap-2 shadow-md hover:shadow-lg transition hover:border-blue-500"
                                                    >
                                                        <span className="text-sm">
                                                            <span className="font-bold text-gray-900">{recipient.name}</span>
                                                            <span className="text-gray-600 ml-2 text-xs font-medium">{recipient.email}</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromToField(recipient.id)}
                                                            className="text-red-500 hover:text-red-700 font-bold ml-1 px-2 py-1 hover:bg-red-100 rounded-full transition"
                                                            title="Remove recipient"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex gap-2 text-xs">
                                                <div className="flex-1 bg-white p-2 rounded border border-blue-200">
                                                    <p className="text-blue-700 font-bold">📊 Ready to send</p>
                                                    <p className="text-gray-600">All recipients configured</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <label className="block text-sm font-medium text-gray-700 mb-3">👥 Add Students to Email List</label>
                                    
                                    {/* Search and Filter Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Search by name or roll no..."
                                                value={emailFormData.individualSearch}
                                                onChange={(e) => setEmailFormData({...emailFormData, individualSearch: e.target.value})}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={emailFormData.individualFilterClass}
                                                onChange={(e) => setEmailFormData({...emailFormData, individualFilterClass: e.target.value})}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
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
                                        <div className="sm:col-span-2">
                                            <select
                                                value={emailFormData.individualFilterSection}
                                                onChange={(e) => setEmailFormData({...emailFormData, individualFilterSection: e.target.value})}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                            >
                                                <option value="">All Sections</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Student List */}
                                    <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                                        {students
                                            .filter(s => s.status === 'active' && s.email)
                                            .filter(s => {
                                                const searchLower = (emailFormData.individualSearch || '').toLowerCase();
                                                return (
                                                    s.name.toLowerCase().includes(searchLower) ||
                                                    (s.rollNumber && s.rollNumber.toLowerCase().includes(searchLower))
                                                );
                                            })
                                            .filter(s => emailFormData.individualFilterClass === '' || s.class === emailFormData.individualFilterClass)
                                            .filter(s => emailFormData.individualFilterSection === '' || s.section === emailFormData.individualFilterSection)
                                            .length === 0 ? (
                                            <p className="text-gray-500 text-sm">No students found with selected filters</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {students
                                                    .filter(s => s.status === 'active' && s.email)
                                                    .filter(s => {
                                                        const searchLower = (emailFormData.individualSearch || '').toLowerCase();
                                                        return (
                                                            s.name.toLowerCase().includes(searchLower) ||
                                                            (s.rollNumber && s.rollNumber.toLowerCase().includes(searchLower))
                                                        );
                                                    })
                                                    .filter(s => emailFormData.individualFilterClass === '' || s.class === emailFormData.individualFilterClass)
                                                    .filter(s => emailFormData.individualFilterSection === '' || s.section === emailFormData.individualFilterSection)
                                                    .map(student => (
                                                        <label key={student._id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition">
                                                            <input
                                                                type="checkbox"
                                                                checked={emailFormData.selectedStudents.includes(student._id)}
                                                                onChange={() => toggleStudentSelection(student._id)}
                                                                className="w-4 h-4 text-purple-600 rounded accent-purple-600"
                                                            />
                                                            <span className="ml-3 text-sm flex-1">
                                                                <span className="font-medium text-gray-900">{student.name}</span>
                                                                <span className="text-gray-600 ml-1 text-xs">({student.class} - {student.section}, Roll: {student.rollNumber})</span>
                                                            </span>
                                                            {emailFormData.selectedStudents.includes(student._id) && (
                                                                <span className="text-green-600 font-bold">✓</span>
                                                            )}
                                                        </label>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Select All / Clear All Buttons */}
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const filteredStudents = students
                                                    .filter(s => s.status === 'active' && s.email)
                                                    .filter(s => {
                                                        const searchLower = (emailFormData.individualSearch || '').toLowerCase();
                                                        return (
                                                            s.name.toLowerCase().includes(searchLower) ||
                                                            (s.rollNumber && s.rollNumber.toLowerCase().includes(searchLower))
                                                        );
                                                    })
                                                    .filter(s => emailFormData.individualFilterClass === '' || s.class === emailFormData.individualFilterClass)
                                                    .filter(s => emailFormData.individualFilterSection === '' || s.section === emailFormData.individualFilterSection);
                                                
                                                const newToRecipients = filteredStudents.map(s => ({
                                                    id: s._id,
                                                    name: s.name,
                                                    email: s.email
                                                }));
                                                
                                                setEmailFormData({
                                                    ...emailFormData, 
                                                    selectedStudents: filteredStudents.map(s => s._id),
                                                    toRecipients: newToRecipients
                                                });
                                            }}
                                            className="flex-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 font-medium rounded-lg hover:bg-purple-200 transition"
                                        >
                                            ✓ Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEmailFormData({...emailFormData, selectedStudents: [], toRecipients: []})}
                                            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                                        >
                                            ✕ Clear All
                                        </button>
                                    </div>

                                    {emailFormData.selectedStudents.length > 0 && (
                                        <div className="mt-3 p-3 bg-purple-100 border border-purple-300 rounded-lg">
                                            <p className="text-sm text-purple-700 font-bold">
                                                ✓ {emailFormData.selectedStudents.length} student(s) selected and will receive this email
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Email Subject */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject *</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={emailFormData.subject}
                                    onChange={handleEmailInputChange}
                                    placeholder="e.g., Important Notice - Grade Report"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>

                            {/* Email Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Message *</label>
                                <EmailEditor
                                    value={emailFormData.message}
                                    onChange={(content) => setEmailFormData({...emailFormData, message: content})}
                                    placeholder="Enter your email message here..."
                                />
                                <p className="text-xs text-gray-500 mt-2">Use the formatting tools to create professional emails with bold, italic, lists, links, and more.</p>
                            </div>

                            {/* Message Preview */}
                            {emailFormData.message && emailFormData.message !== '<p><br></p>' && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-purple-700 mb-2">📧 Preview:</p>
                                    <div 
                                        className="bg-white p-3 rounded text-sm text-gray-600 max-h-32 overflow-y-auto prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: emailFormData.message }}
                                    />
                                </div>
                            )}

                            {/* Recipient Count Summary */}
                            {emailFormData.recipientType === 'individual' && emailFormData.toRecipients.length > 0 && (
                                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-green-900">✓ Email Ready to Send</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            This email will be sent to {emailFormData.toRecipients.length} student{emailFormData.toRecipients.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <span className="bg-green-600 text-white font-bold px-4 py-2 rounded-full text-lg">
                                        {emailFormData.toRecipients.length}
                                    </span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsEmailModalOpen(false)}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={emailLoading}
                                    onClick={(e) => {
                                        // Extra safety check to prevent multiple submissions
                                        if (emailLoading) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>
                                        {emailLoading ? (
                                            <>Sending to {emailFormData.toRecipients.length} student{emailFormData.toRecipients.length !== 1 ? 's' : ''}...</>
                                        ) : (
                                            <>Send Email to {emailFormData.toRecipients.length} student{emailFormData.toRecipients.length !== 1 ? 's' : ''}</>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
