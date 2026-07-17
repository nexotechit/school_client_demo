'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../config/api';
import ImgBBUpload from '../../../../components/ImgBBUpload';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [formData, setFormData] = useState({
        adminId: '',
        name: '',
        email: '',
        phone: '',
        designation: '',
        qualification: '',
        experience: '',
        dateOfJoining: '',
        address: '',
        imageUrl: '',
        status: 'active'
    });

    // Generate admin ID with format "0001-26"
    const generateAdminId = () => {
        const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
        const year = parseInt(currentYear);

        // Find the highest existing admin ID for this year
        const currentYearAdmins = admins.filter(admin =>
            admin.adminId && admin.adminId.endsWith(`-${year}`)
        );

        let nextNumber = 1;
        if (currentYearAdmins.length > 0) {
            const maxNumber = Math.max(...currentYearAdmins.map(admin => {
                const idParts = admin.adminId.split('-');
                return parseInt(idParts[0]) || 0;
            }));
            nextNumber = maxNumber + 1;
        }

        return `${nextNumber.toString().padStart(4, '0')}-${year}`;
    };

    // Fetch all admins
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/admins`);
            const data = await response.json();

            if (data.success) {
                setAdmins(data.data);
            } else {
                console.error('Failed to fetch admins:', data.message);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Open modal for adding new admin
    const handleAddAdmin = () => {
        setIsEditMode(false);
        setCurrentAdmin(null);
        setFormData({
            adminId: generateAdminId(),
            name: '',
            email: '',
            phone: '',
            designation: '',
            qualification: '',
            experience: '',
            dateOfJoining: '',
            address: '',
            imageUrl: '',
            status: 'active'
        });
        setIsModalOpen(true);
    };

    // Open modal for editing
    const handleEditAdmin = (admin) => {
        setIsEditMode(true);
        setCurrentAdmin(admin);
        setFormData({
            adminId: admin.adminId || '',
            name: admin.name,
            email: admin.email || '',
            phone: admin.phone || '',
            designation: admin.designation || '',
            qualification: admin.qualification || '',
            experience: admin.experience || '',
            dateOfJoining: admin.dateOfJoining ? admin.dateOfJoining.split('T')[0] : '',
            address: admin.address || '',
            imageUrl: admin.imageUrl || '',
            status: admin.status || 'active'
        });
        setIsModalOpen(true);
    };

    // Submit form (Add or Edit)
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let url, method, body;

            if (isEditMode) {
                // Update existing admin
                url = `${API_URL}/api/admins/${currentAdmin._id}`;
                method = 'PUT';
                body = JSON.stringify(formData);
            } else {
                // Add new admin
                url = `${API_URL}/api/admins`;
                method = 'POST';
                body = JSON.stringify({
                    adminId: formData.adminId,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    designation: formData.designation,
                    qualification: formData.qualification,
                    experience: formData.experience,
                    dateOfJoining: formData.dateOfJoining,
                    address: formData.address,
                    imageUrl: formData.imageUrl,
                    password: formData.email.split('@')[0], // Default password is email prefix
                    status: formData.status
                });
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const data = await response.json();

            if (data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated!' : 'Added!',
                    text: isEditMode ? 'Admin updated successfully' : 'Admin added successfully. Default password is the email prefix.',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { container: 'swal-high-z-index' }
                });
                setIsModalOpen(false);
                setIsEditMode(false);
                setCurrentAdmin(null);
                // Reset form data
                setFormData({
                    adminId: '',
                    name: '',
                    email: '',
                    phone: '',
                    designation: '',
                    qualification: '',
                    experience: '',
                    dateOfJoining: '',
                    address: '',
                    imageUrl: '',
                    status: 'active'
                });
                // Fetch updated list
                await fetchAdmins();
                // Auto reload after 500ms to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 500);
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

    // Delete admin
    const handleDeleteAdmin = async (id) => {
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
            const response = await fetch(`${API_URL}/api/admins/${id}`, {
                method: 'DELETE',
            });

                const data = await response.json();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Admin has been deleted.',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: { container: 'swal-high-z-index' }
                    });
                    await fetchAdmins();
                }
            } catch (error) {
                console.error('Error deleting admin:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to delete admin',
                    customClass: { container: 'swal-high-z-index' }
                });
            }
        }
    };

    // Print admin details as PDF
    const handlePrintAdmin = async (admin) => {
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
                    <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">Admin Information Card</p>
                </div>

                <div style="padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    <!-- Highlighted Admin ID and Email -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
                        <div style="display: flex; justify-content: center; gap: 40px; align-items: center;">
                            <div>
                                <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Admin ID</p>
                                <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #1f2937;">${admin.adminId || 'N/A'}</p>
                            </div>
                            <div style="width: 1px; height: 40px; background: #f59e0b;"></div>
                            <div>
                                <p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email Address</p>
                                <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1f2937;">${admin.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Admin Profile Section -->
                    <div style="display: flex; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin-right: 20px; overflow: hidden; border: 3px solid #e5e7eb;">
                            ${admin.imageUrl ? `<img src="${admin.imageUrl}" alt="${admin.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />` : ''}<span style="${admin.imageUrl ? 'display: none;' : ''}">👨‍💼</span>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${admin.name}</h2>
                            <p style="margin: 3px 0; color: #6b7280; font-size: 14px;">${admin.designation || 'N/A'}</p>
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">Joined: ${admin.dateOfJoining ? new Date(admin.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <!-- Information Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #3b82f6;">
                            <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Professional Details</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Qualification:</span>
                                <span style="color: #6b7280; font-size: 13px;">${admin.qualification || 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Experience:</span>
                                <span style="color: #6b7280; font-size: 13px;">${admin.experience || 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Status:</span>
                                <span style="color: ${admin.status === 'active' ? '#059669' : '#6b7280'}; font-weight: 600; font-size: 13px;">${admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}</span>
                            </div>
                        </div>

                        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #059669;">
                            <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Contact Details</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Phone:</span>
                                <span style="color: #6b7280; font-size: 13px;">${admin.phone || 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Email:</span>
                                <span style="color: #6b7280; font-size: 13px;">${admin.email || 'N/A'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 600; color: #374151; font-size: 13px;">Date of Joining:</span>
                                <span style="color: #6b7280; font-size: 13px;">${admin.dateOfJoining ? new Date(admin.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Address Section -->
                    <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">Address</h3>
                        <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.4;">${admin.address || 'N/A'}</p>
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
            pdf.save(`${admin.name}_Admin_Card.pdf`);

            // Remove temporary div
            document.body.removeChild(printDiv);

            Swal.fire({
                icon: 'success',
                title: 'PDF Generated!',
                text: 'Admin information PDF has been downloaded successfully.',
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

    // Filter admins based on search
    const filteredAdmins = admins.filter(admin => {
        return admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (admin.designation && admin.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (admin.adminId && admin.adminId.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6">
                    <div className="mb-4 lg:mb-0">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Admin Management</h2>
                        <p className="text-sm sm:text-base text-gray-600">Manage admin profiles and system access</p>
                    </div>
                    <div className="mt-3 sm:mt-4 lg:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button onClick={() => window.location.reload()} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={handleAddAdmin}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Admin</span>
                        </button>
                      
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4 sm:mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, designation, or admin ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl border border-purple-100">
                        <p className="text-xs sm:text-sm text-gray-600">Total Admins</p>
                        <p className="text-xl sm:text-2xl font-bold text-purple-900">{admins.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-100">
                        <p className="text-xs sm:text-sm text-gray-600">Active Admins</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-900">{admins.filter(a => a.status === 'active').length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-100 sm:col-span-2 lg:col-span-1">
                        <p className="text-xs sm:text-sm text-gray-600">Inactive Admins</p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-900">{admins.filter(a => a.status === 'inactive').length}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600">Loading admins...</p>
                    </div>
                ) : filteredAdmins.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-500">
                        <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-base sm:text-lg">No admins found</p>
                    </div>
                ) : (
                    <div className="block lg:hidden space-y-3">
                        {/* Mobile Card View */}
                        {filteredAdmins.map((admin, index) => (
                            <div key={admin._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start space-x-3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        {admin.imageUrl ? (
                                            <img
                                                src={admin.imageUrl}
                                                alt={admin.name}
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
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{admin.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                admin.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {admin.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <p><span className="font-medium">ID:</span> {admin.adminId || 'N/A'}</p>
                                            <p><span className="font-medium">Email:</span> {admin.email && admin.email.trim() !== '' ? admin.email : 'N/A'}</p>
                                            <p><span className="font-medium">Phone:</span> {admin.phone && admin.phone.trim() !== '' ? admin.phone : 'N/A'}</p>
                                            <p><span className="font-medium">Designation:</span> {admin.designation && admin.designation.trim() !== '' ? admin.designation : 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <button
                                                onClick={() => handlePrintAdmin(admin)}
                                                className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-all"
                                                title="Print Admin Details"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => handleEditAdmin(admin)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin._id)}
                                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Serial</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Photo</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Admin ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Designation</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qualification</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Experience</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Print</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAdmins.map((admin, index) => (
                                    <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                                        <td className="px-4 py-4">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                                                {admin.imageUrl ? (
                                                    <img
                                                        src={admin.imageUrl}
                                                        alt={admin.name}
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
                                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{admin.adminId || 'N/A'}</td>
                                        <td className="px-4 py-4 text-sm text-gray-900">{admin.name}</td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {admin.email && admin.email.trim() !== '' ? admin.email : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {admin.phone && admin.phone.trim() !== '' ? admin.phone : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            {admin.designation && admin.designation.trim() !== '' ? admin.designation : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {admin.qualification && admin.qualification.trim() !== '' ? admin.qualification : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {admin.experience && admin.experience.trim() !== '' ? admin.experience : 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                admin.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handlePrintAdmin(admin)}
                                                className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-all"
                                                title="Print Admin Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditAdmin(admin)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin._id)}
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
                </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 sm:p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg sm:text-xl font-bold">
                                    {isEditMode ? 'Edit Admin' : 'Add New Admin'}
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
                                        placeholder="Enter admin name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin ID *</label>
                                    <input
                                        type="text"
                                        name="adminId"
                                        value={formData.adminId}
                                        onChange={handleInputChange}
                                        required
                                        readOnly={!isEditMode}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm sm:text-base"
                                        placeholder="Auto-generated"
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
                                        placeholder="admin@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="01XXXXXXXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="e.g., System Administrator, Principal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualification *</label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="e.g., M.A., B.Ed, MBA"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
                                    <input
                                        type="text"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                        placeholder="e.g., 5 Years"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Joining *</label>
                                    <input
                                        type="date"
                                        name="dateOfJoining"
                                        value={formData.dateOfJoining}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                                    />
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Photo</label>
                                    <div className="space-y-3">
                                        {formData.imageUrl && (
                                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <img
                                                    src={formData.imageUrl}
                                                    alt="Admin preview"
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
                                                    text: 'Admin photo uploaded successfully.',
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
                                        <p className="text-xs text-gray-500">Upload a clear photo of the admin (JPG, PNG, GIF). Max 32MB.</p>
                                    </div>
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
                                    {isEditMode ? 'Update Admin' : 'Add Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}