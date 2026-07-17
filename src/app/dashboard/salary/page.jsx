'use client';

import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../../config/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  useSalaries,
  useSalaryStatistics,
  useCreateSalary,
  useUpdateSalary,
  useDeleteSalary,
  useApproveSalary,
  useRejectSalary,
  useMarkSalaryAsPaid,
  useBulkApproveSalaries,
  useBulkDeleteSalaries,
  prefetchSalaries,
  prefetchTeachers
} from '../../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

const SalaryManagementPage = () => {
    // State management
    const [salaries, setSalaries] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [employees, setEmployees] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        employeeType: '',
        department: '',
        status: '',
        salaryMonth: '',
        salaryYear: '',
        academicYear: '',
        startDate: '',
        endDate: '',
        search: ''
    });

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        employeeType: 'Teacher',
        department: 'Academic',
        designation: '',
        academicYear: new Date().getFullYear().toString(),
        salaryMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
        salaryYear: new Date().getFullYear(),

        // Salary Structure
        basicSalary: '',
        houseRentAllowance: '',
        conveyanceAllowance: '',
        medicalAllowance: '',
        specialAllowance: '',

        // Deductions
        providentFund: '',
        professionalTax: '',
        incomeTax: '',
        loanDeduction: '',

        // Additional
        workingDays: 30,
        presentDays: 30,
        leaveDays: 0,
        overtimeHours: 0,
        overtimeRate: 0,
        performanceBonus: '',
        annualBonus: '',

        // Payment
        paymentMethod: 'Bank Transfer',
        bankAccount: {
            accountNumber: '',
            bankName: '',
            ifscCode: ''
        },

        // Notes
        notes: ''
    });

    // UI states
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'cards', 'analytics', 'slips'
    const [selectedSalaries, setSelectedSalaries] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);

    // Employee types
    const employeeTypeOptions = [
        'Teacher',
        'Staff',
        'Admin',
        'Principal',
        'Librarian',
        'Accountant',
        'Security Guard',
        'Maintenance Staff'
    ];

    // Departments
    const departmentOptions = [
        'Academic',
        'Administration',
        'Maintenance',
        'IT',
        'Finance',
        'HR',
        'Security',
        'Library'
    ];

    // Payment methods
    const paymentMethods = [
        'Bank Transfer',
        'Cash',
        'Cheque',
        'Online'
    ];

    // React Query hooks
    const queryClient = useQueryClient();
    const { data: salariesData, isLoading: salariesLoading, error: salariesError } = useSalaries(filters);
    const { data: statisticsData, isLoading: statisticsLoading } = useSalaryStatistics(filters);
    const createSalaryMutation = useCreateSalary();
    const updateSalaryMutation = useUpdateSalary();
    const deleteSalaryMutation = useDeleteSalary();
    const approveSalaryMutation = useApproveSalary();
    const rejectSalaryMutation = useRejectSalary();
    const markAsPaidMutation = useMarkSalaryAsPaid();
    const bulkApproveMutation = useBulkApproveSalaries();
    const bulkDeleteMutation = useBulkDeleteSalaries();

    // Update local state when data changes
    useEffect(() => {
        if (salariesData?.data) {
            setSalaries(salariesData.data);
        }
    }, [salariesData]);

    useEffect(() => {
        if (statisticsData?.data) {
            setStatistics(statisticsData.data);
        }
    }, [statisticsData]);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchHelperData(),
                    fetchEmployees()
                ]);
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Update loading state based on queries
    useEffect(() => {
        setLoading(salariesLoading || statisticsLoading);
    }, [salariesLoading, statisticsLoading]);

    // Handle errors
    useEffect(() => {
        if (salariesError) {
            console.error('Error fetching salaries:', salariesError);
            Swal.fire('Error', 'Failed to load salaries', 'error');
        }
    }, [salariesError]);

    // Prefetch data on hover (for better UX)
    const handlePrefetchOnHover = () => {
        prefetchTeachers(queryClient);
    };

    // Fetch salaries with filters (legacy function for compatibility)
    const fetchSalaries = async () => {
        // This is now handled by React Query
        // Keeping for backward compatibility
    };

    // Fetch statistics (legacy function for compatibility)
    const fetchStatistics = async () => {
        // This is now handled by React Query
        // Keeping for backward compatibility
    };

    // Fetch helper data
    const fetchHelperData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/salaries/helpers`);
            const data = await response.json();
            if (data.success) {
                setDepartments(data.data.departments);
                setEmployeeTypes(data.data.employeeTypes);
                setDesignations(data.data.designations);
            }
        } catch (error) {
            console.error('Error fetching helper data:', error);
        }
    };

    // Fetch employees
    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/teachers`);
            const data = await response.json();
            if (data.success) {
                setEmployees(data.data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Apply filters
    const applyFilters = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchSalaries(),
                fetchStatistics()
            ]);
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setLoading(false);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            employeeType: '',
            department: '',
            status: '',
            salaryMonth: '',
            salaryYear: '',
            academicYear: '',
            startDate: '',
            endDate: '',
            search: ''
        });
        setTimeout(() => {
            fetchSalaries();
            fetchStatistics();
        }, 100);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading || createSalaryMutation.isPending || updateSalaryMutation.isPending) return;

        if (!formData.employeeId || !formData.basicSalary) {
            Swal.fire('Error', 'Please fill the required fields: Employee and Basic Salary', 'error');
            return;
        }

        // Additional validation for salary year and month
        if (!formData.salaryYear || !formData.salaryMonth) {
            Swal.fire('Error', 'Please select both salary month and year', 'error');
            return;
        }

        // Check for duplicate salary record (only for new records)
        if (!editingSalary) {
            try {
                console.log('Checking for duplicate salary:', {
                    employeeId: formData.employeeId,
                    salaryMonth: formData.salaryMonth,
                    salaryYear: formData.salaryYear
                });

                const checkResponse = await fetch(`${API_BASE_URL}/salaries?employeeId=${formData.employeeId}&salaryMonth=${formData.salaryMonth}&salaryYear=${formData.salaryYear}&limit=1`);
                const checkData = await checkResponse.json();

                console.log('Duplicate check response:', checkData);

                if (checkData.success && checkData.data && checkData.data.length > 0) {
                    Swal.fire('Error', 'A salary record already exists for this employee for the selected month and year. Please edit the existing record instead.', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error checking for duplicate salary:', error);
                // Continue with submission if check fails, but log the error
                Swal.fire('Warning', 'Could not verify if salary record already exists. Proceeding with submission.', 'warning');
            }
        }

        // Convert string values to numbers for proper calculation
        const processedData = {
            ...formData,
            basicSalary: parseFloat(formData.basicSalary) || 0,
            houseRentAllowance: parseFloat(formData.houseRentAllowance) || 0,
            conveyanceAllowance: parseFloat(formData.conveyanceAllowance) || 0,
            medicalAllowance: parseFloat(formData.medicalAllowance) || 0,
            specialAllowance: parseFloat(formData.specialAllowance) || 0,
            performanceBonus: parseFloat(formData.performanceBonus) || 0,
            annualBonus: parseFloat(formData.annualBonus) || 0,
            providentFund: parseFloat(formData.providentFund) || 0,
            professionalTax: parseFloat(formData.professionalTax) || 0,
            incomeTax: parseFloat(formData.incomeTax) || 0,
            loanDeduction: parseFloat(formData.loanDeduction) || 0,
            workingDays: parseInt(formData.workingDays) || 30,
            presentDays: parseInt(formData.presentDays) || 30,
            leaveDays: parseInt(formData.leaveDays) || 0,
            overtimeHours: parseFloat(formData.overtimeHours) || 0,
            overtimeRate: parseFloat(formData.overtimeRate) || 0,
            salaryYear: parseInt(formData.salaryYear) || new Date().getFullYear()
        };

        try {
            if (editingSalary) {
                await updateSalaryMutation.mutateAsync({ id: editingSalary._id, ...processedData });
                Swal.fire('Success', 'Salary updated successfully', 'success');
            } else {
                await createSalaryMutation.mutateAsync(processedData);
                Swal.fire('Success', 'Salary created successfully', 'success');
            }

            setShowForm(false);
            setEditingSalary(null);
            resetForm();
        } catch (error) {
            console.error('Error saving salary:', error);
            Swal.fire('Error', error.message || 'Failed to save salary', 'error');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            employeeId: '',
            employeeName: '',
            employeeType: 'Teacher',
            department: 'Academic',
            designation: '',
            academicYear: new Date().getFullYear().toString(),
            salaryMonth: new Date().toISOString().slice(0, 7),
            salaryYear: new Date().getFullYear(),

            basicSalary: '',
            houseRentAllowance: '',
            conveyanceAllowance: '',
            medicalAllowance: '',
            specialAllowance: '',

            providentFund: '',
            professionalTax: '',
            incomeTax: '',
            loanDeduction: '',

            workingDays: 30,
            presentDays: 30,
            leaveDays: 0,
            overtimeHours: 0,
            overtimeRate: 0,
            performanceBonus: '',
            annualBonus: '',

            paymentMethod: 'Bank Transfer',
            bankAccount: {
                accountNumber: '',
                bankName: '',
                ifscCode: ''
            },

            notes: ''
        });
    };

    // Edit salary
    const editSalary = (salary) => {
        setEditingSalary(salary);
        setFormData({
            employeeId: salary.employeeId._id || salary.employeeId,
            employeeName: salary.employeeName,
            employeeType: salary.employeeType,
            department: salary.department,
            designation: salary.designation,
            academicYear: salary.academicYear,
            salaryMonth: salary.salaryMonth,
            salaryYear: salary.salaryYear,

            basicSalary: salary.basicSalary.toString(),
            houseRentAllowance: salary.houseRentAllowance.toString(),
            conveyanceAllowance: salary.conveyanceAllowance.toString(),
            medicalAllowance: salary.medicalAllowance.toString(),
            specialAllowance: salary.specialAllowance.toString(),

            providentFund: salary.providentFund.toString(),
            professionalTax: salary.professionalTax.toString(),
            incomeTax: salary.incomeTax.toString(),
            loanDeduction: salary.loanDeduction.toString(),

            workingDays: salary.workingDays,
            presentDays: salary.presentDays,
            leaveDays: salary.leaveDays,
            overtimeHours: salary.overtimeHours,
            overtimeRate: salary.overtimeRate,
            performanceBonus: salary.performanceBonus.toString(),
            annualBonus: salary.annualBonus.toString(),

            paymentMethod: salary.paymentMethod,
            bankAccount: salary.bankAccount || {
                accountNumber: '',
                bankName: '',
                ifscCode: ''
            },

            notes: salary.notes || ''
        });
        setShowForm(true);
    };

    // Delete salary
    const deleteSalary = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Salary Record?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        });

        if (result.isConfirmed) {
            try {
                await deleteSalaryMutation.mutateAsync(id);
                Swal.fire('Deleted!', 'Salary record deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting salary:', error);
                Swal.fire('Error', error.message || 'Failed to delete salary record', 'error');
            }
        }
    };

    // Approve salary
    const approveSalary = async (id) => {
        try {
            await approveSalaryMutation.mutateAsync(id);
            Swal.fire('Approved!', 'Salary approved successfully', 'success');
        } catch (error) {
            console.error('Error approving salary:', error);
            Swal.fire('Error', error.message || 'Failed to approve salary', 'error');
        }
    };

    // Reject salary
    const rejectSalary = async (id) => {
        const { value: reason } = await Swal.fire({
            title: 'Reject Salary',
            input: 'textarea',
            inputLabel: 'Rejection Reason',
            inputPlaceholder: 'Enter reason for rejection...',
            inputValidator: (value) => {
                if (!value) {
                    return 'Rejection reason is required!';
                }
            },
            showCancelButton: true,
            confirmButtonColor: '#ef4444'
        });

        if (reason) {
            try {
                await rejectSalaryMutation.mutateAsync({ id, reason });
                Swal.fire('Rejected!', 'Salary rejected successfully', 'success');
            } catch (error) {
                console.error('Error rejecting salary:', error);
                Swal.fire('Error', error.message || 'Failed to reject salary', 'error');
            }
        }
    };

    // Mark as paid
    const markAsPaid = async (id) => {
        try {
            await markAsPaidMutation.mutateAsync(id);
            Swal.fire('Paid!', 'Salary marked as paid successfully', 'success');
        } catch (error) {
            console.error('Error marking as paid:', error);
            Swal.fire('Error', error.message || 'Failed to mark salary as paid', 'error');
        }
    };

    // Bulk approve
    const bulkApprove = async () => {
        if (selectedSalaries.length === 0) {
            Swal.fire('Error', 'Please select salaries to approve', 'error');
            return;
        }

        try {
            await bulkApproveMutation.mutateAsync(selectedSalaries);
            Swal.fire('Success!', 'Salaries approved successfully', 'success');
            setSelectedSalaries([]);
            setShowBulkActions(false);
        } catch (error) {
            console.error('Error bulk approving:', error);
            Swal.fire('Error', error.message || 'Failed to bulk approve salaries', 'error');
        }
    };

    // Bulk delete
    const bulkDelete = async () => {
        if (selectedSalaries.length === 0) {
            Swal.fire('Error', 'Please select salaries to delete', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Selected Salaries?',
            text: `This will delete ${selectedSalaries.length} salary records. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete All'
        });

        if (result.isConfirmed) {
            try {
                await bulkDeleteMutation.mutateAsync(selectedSalaries);
                Swal.fire('Deleted!', 'Salaries deleted successfully', 'success');
                setSelectedSalaries([]);
                setShowBulkActions(false);
            } catch (error) {
                console.error('Error bulk deleting:', error);
                Swal.fire('Error', error.message || 'Failed to bulk delete salaries', 'error');
            }
        }
    };

    // Generate salary slip
    const generateSalarySlip = async (salaryId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/salaries/${salaryId}/slip`);
            const data = await response.json();

            if (data.success) {
                setSelectedSlip(data.data);
                setViewMode('slips');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error generating salary slip:', error);
            Swal.fire('Error', 'Failed to generate salary slip', 'error');
        }
    };

    // Export salary slips to PDF
    const exportSalarySlipToPDF = () => {
        if (!selectedSlip) {
            Swal.fire('Error', 'No salary slip selected', 'error');
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

        const element = document.getElementById('salary-slip');
        if (!element) {
            Swal.fire('Error', 'Salary slip element not found', 'error');
            return;
        }

        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Salary_Slip_${selectedSlip.salaryId}_${new Date().toISOString().split('T')[0]}.pdf`);

            Swal.close();
            Swal.fire('Success', 'Salary slip exported successfully', 'success');
        }).catch(error => {
            console.error('PDF generation error:', error);
            Swal.fire('Error', 'Failed to generate PDF', 'error');
        });
    };

    // Export to Excel
    const exportToExcel = () => {
        if (salaries.length === 0) {
            Swal.fire('Error', 'No salaries to export', 'error');
            return;
        }

        // Create CSV content
        let csvContent = `Salary Report\n`;
        csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

        // Headers
        const headers = [
            'Salary ID', 'Employee Name', 'Employee Type', 'Department', 'Designation',
            'Basic Salary', 'Gross Salary', 'Net Salary', 'Month', 'Year', 'Status'
        ];
        csvContent += headers.join(',') + '\n';

        // Data rows
        salaries.forEach(salary => {
            const row = [
                salary.salaryId,
                `"${salary.employeeName}"`,
                salary.employeeType,
                salary.department,
                `"${salary.designation}"`,
                salary.basicSalary,
                salary.grossSalary,
                salary.netSalary,
                salary.salaryMonth,
                salary.salaryYear,
                salary.status
            ];
            csvContent += row.join(',') + '\n';
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Salaries_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        Swal.fire('Success', 'Salaries exported to Excel', 'success');
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-gray-100 text-gray-800';
            case 'Approved': return 'bg-gray-100 text-gray-800';
            case 'Pending': return 'bg-gray-100 text-gray-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Hold': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Handle employee selection
    const handleEmployeeChange = (employeeId) => {
        const selectedEmployee = employees.find(emp => emp._id === employeeId);
        if (selectedEmployee) {
            setFormData(prev => ({
                ...prev,
                employeeId,
                employeeName: selectedEmployee.name,
                designation: selectedEmployee.designation || '',
                department: selectedEmployee.department || prev.department
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="container mx-auto">
                {/* Professional Header */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg sm:text-xl">💰</span>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">
                                    Salary Management System
                                </h1>
                                <p className="text-gray-600 mt-1 text-xs sm:text-sm">Professional payroll processing and employee compensation management</p>
                            </div>
                        </div>

                        {/* Professional View Mode Buttons */}
                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                                    viewMode === 'list'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                📋 List View
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                                    viewMode === 'cards'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                🎴 Cards View
                            </button>
                            <button
                                onClick={() => setViewMode('analytics')}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                                    viewMode === 'analytics'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                📊 Analytics
                            </button>
                            <button
                                onClick={() => setViewMode('slips')}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                                    viewMode === 'slips'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                📄 Salary Slips
                            </button>
                        </div>
                    </div>
                </div>

                {/* Professional Statistics Cards */}
                {statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wide">Total Salaries</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">{statistics.totalRecords || 0}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                        <span className="text-xs text-gray-500 font-medium">Active Records</span>
                                    </div>
                                </div>
                                <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-lg sm:text-xl lg:text-2xl">👥</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wide">Total Gross Salary</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">৳{(statistics.totalGrossSalary || 0).toLocaleString()}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                        <span className="text-xs text-gray-500 font-medium">Before Deductions</span>
                                    </div>
                                </div>
                                <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-lg sm:text-xl lg:text-2xl">💰</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wide">Total Net Salary</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">৳{(statistics.totalNetSalary || 0).toLocaleString()}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                        <span className="text-xs text-gray-500 font-medium">After Deductions</span>
                                    </div>
                                </div>
                                <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-lg sm:text-xl lg:text-2xl">💵</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wide">Total Deductions</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">৳{(statistics.totalDeductions || 0).toLocaleString()}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                        <span className="text-xs text-gray-500 font-medium">Tax & Contributions</span>
                                    </div>
                                </div>
                                <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-lg sm:text-xl lg:text-2xl">📉</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Professional Filters Section */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm sm:text-lg">🔍</span>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Advanced Filters</h2>
                                <p className="text-gray-600 text-xs sm:text-sm">Filter and search salary records efficiently</p>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={applyFilters}
                                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 flex items-center gap-2"
                            >
                                <span>🔍</span>
                                <span className="hidden sm:inline">Apply Filters</span>
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
                            >
                                <span>🗑️</span>
                                <span className="hidden sm:inline">Clear All</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {/* Professional Search Input */}
                        <div className="space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">🔍 Search Employees</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search by name, ID, or designation..."
                                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent transition-all duration-200 bg-white text-gray-700 placeholder-gray-400"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <span className="text-sm">🔍</span>
                                </div>
                            </div>
                        </div>

                        {/* Employee Type */}
                        <div className="space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">👤 Employee Type</label>
                            <select
                                value={filters.employeeType}
                                onChange={(e) => handleFilterChange('employeeType', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                            >
                                <option value="">All Employee Types</option>
                                {employeeTypes.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">🏢 Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">📊 Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                            >
                                <option value="">All Status</option>
                                <option value="Draft">📝 Draft</option>
                                <option value="Pending">⏳ Pending</option>
                                <option value="Approved">✅ Approved</option>
                                <option value="Rejected">❌ Rejected</option>
                                <option value="Paid">💰 Paid</option>
                                <option value="Hold">⏸️ Hold</option>
                            </select>
                        </div>

                        {/* Salary Month */}
                        <div className="space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">📅 Salary Month</label>
                            <input
                                type="month"
                                value={filters.salaryMonth}
                                onChange={(e) => handleFilterChange('salaryMonth', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                            />
                        </div>

                        {/* Salary Year */}
                        <div className="space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">📆 Salary Year</label>
                            <input
                                type="number"
                                value={filters.salaryYear}
                                onChange={(e) => handleFilterChange('salaryYear', e.target.value)}
                                placeholder="2026"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                            />
                        </div>

                        {/* Academic Year */}
                        <div className="space-y-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700">🎓 Academic Year</label>
                            <input
                                type="text"
                                value={filters.academicYear}
                                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                                placeholder="2025-2026"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a202c] focus:border-transparent transition-all duration-200 bg-white text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Action Buttons */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                    <div className="flex flex-wrap gap-3 sm:gap-4 justify-between items-center">
                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 flex items-center gap-2"
                            >
                                <span>➕</span>
                                <span>Add Salary</span>
                            </button>

                            {selectedSalaries.length > 0 && (
                                <>
                                    <button
                                        onClick={() => setShowBulkActions(!showBulkActions)}
                                        className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <span>⚡</span>
                                        <span>Bulk Actions ({selectedSalaries.length})</span>
                                    </button>

                                    {showBulkActions && (
                                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                                            <button
                                                onClick={bulkApprove}
                                                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <span>✅</span>
                                                <span>Approve All</span>
                                            </button>
                                            <button
                                                onClick={bulkDelete}
                                                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <span>🗑️</span>
                                                <span>Delete All</span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                            <button
                                onClick={exportToExcel}
                                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 flex items-center gap-2"
                            >
                                <span>📊</span>
                                <span>Export Excel</span>
                            </button>
                            {selectedSlip && (
                                <button
                                    onClick={exportSalarySlipToPDF}
                                    className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 flex items-center gap-2"
                                >
                                    <span>📄</span>
                                    <span>Export Salary Slip PDF</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Professional Add/Edit Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/20">
                        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                            <div className="p-3 sm:p-4 lg:p-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                            <span className="text-white text-lg sm:text-xl">
                                                {editingSalary ? '✏️' : '➕'}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">
                                                {editingSalary ? 'Edit Salary Record' : 'Add New Salary'}
                                            </h2>
                                            <p className="text-gray-600 mt-1 text-xs sm:text-sm">
                                                {editingSalary ? 'Update employee salary details' : 'Create a new salary entry for an employee'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingSalary(null);
                                            resetForm();
                                        }}
                                        className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200"
                                    >
                                        <span className="text-lg sm:text-xl">×</span>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Employee Selection */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Employee *
                                            </label>
                                            <select
                                                value={formData.employeeId}
                                                onChange={(e) => handleEmployeeChange(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all bg-white text-gray-700"
                                                required
                                            >
                                                <option value="">Select Employee</option>
                                                {employees.map((employee) => (
                                                    <option key={employee._id} value={employee._id}>
                                                        {employee.name} - {employee.designation}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Employee Type */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Employee Type
                                            </label>
                                            <select
                                                value={formData.employeeType}
                                                onChange={(e) => setFormData({...formData, employeeType: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all bg-white text-gray-700"
                                            >
                                                {employeeTypeOptions.map((type, index) => (
                                                    <option key={index} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Department */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Department
                                            </label>
                                            <select
                                                value={formData.department}
                                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                            >
                                                {departmentOptions.map((dept, index) => (
                                                    <option key={index} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Designation */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Designation
                                            </label>
                                            <select
                                                value={formData.designation}
                                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                            >
                                                <option value="">Select Designation</option>
                                                {designations.map((desig, index) => (
                                                    <option key={index} value={desig}>{desig}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Salary Month */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Salary Month
                                            </label>
                                            <input
                                                type="month"
                                                value={formData.salaryMonth}
                                                onChange={(e) => setFormData({...formData, salaryMonth: e.target.value})}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        {/* Academic Year */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Academic Year
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.academicYear}
                                                onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                placeholder="2025-2026"
                                            />
                                        </div>
                                    </div>

                                    {/* Salary Structure */}
                                    <div className="bg-blue-50 rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Salary Structure</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Basic Salary */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Basic Salary (৳) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.basicSalary || ''}
                                                    onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            {/* House Rent Allowance */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    House Rent Allowance (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.houseRentAllowance || ''}
                                                    onChange={(e) => setFormData({...formData, houseRentAllowance: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Conveyance Allowance */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Conveyance Allowance (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.conveyanceAllowance || ''}
                                                    onChange={(e) => setFormData({...formData, conveyanceAllowance: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Medical Allowance */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Medical Allowance (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.medicalAllowance || ''}
                                                    onChange={(e) => setFormData({...formData, medicalAllowance: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Special Allowance */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Special Allowance (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.specialAllowance || ''}
                                                    onChange={(e) => setFormData({...formData, specialAllowance: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Performance Bonus */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Performance Bonus (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.performanceBonus || ''}
                                                    onChange={(e) => setFormData({...formData, performanceBonus: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div className="bg-red-50 rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">📉 Deductions</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Provident Fund */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Provident Fund (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.providentFund || ''}
                                                    onChange={(e) => setFormData({...formData, providentFund: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Professional Tax */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Professional Tax (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.professionalTax || ''}
                                                    onChange={(e) => setFormData({...formData, professionalTax: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Income Tax */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Income Tax (৳)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.incomeTax || ''}
                                                    onChange={(e) => setFormData({...formData, incomeTax: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance & Overtime */}
                                    <div className="bg-green-50 rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Attendance & Overtime</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* Working Days */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Working Days
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.workingDays || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setFormData({...formData, workingDays: value === '' ? 30 : parseInt(value) || 30});
                                                    }}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    min="1"
                                                    max="31"
                                                />
                                            </div>

                                            {/* Present Days */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Present Days
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.presentDays || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setFormData({...formData, presentDays: value === '' ? 30 : parseInt(value) || 30});
                                                    }}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    min="0"
                                                    max={formData.workingDays}
                                                />
                                            </div>

                                            {/* Overtime Hours */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Overtime Hours
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.overtimeHours || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setFormData({...formData, overtimeHours: value === '' ? 0 : parseFloat(value) || 0});
                                                    }}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    step="0.5"
                                                    min="0"
                                                />
                                            </div>

                                            {/* Overtime Rate */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Overtime Rate (৳/hour)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.overtimeRate || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setFormData({...formData, overtimeRate: value === '' ? 0 : parseFloat(value) || 0});
                                                    }}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information */}
                                    <div className="bg-purple-50 rounded-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">💳 Payment Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Payment Method */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Payment Method
                                                </label>
                                                <select
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                >
                                                    {paymentMethods.map((method, index) => (
                                                        <option key={index} value={method}>{method}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Bank Account Number */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Account Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.bankAccount.accountNumber}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        bankAccount: {...formData.bankAccount, accountNumber: e.target.value}
                                                    })}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="Bank account number"
                                                />
                                            </div>

                                            {/* Bank Name */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Bank Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.bankAccount.bankName}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        bankAccount: {...formData.bankAccount, bankName: e.target.value}
                                                    })}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                                    placeholder="Bank name"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                            rows="3"
                                            placeholder="Additional notes..."
                                        ></textarea>
                                    </div>

                                    {/* Professional Submit Buttons */}
                                    <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingSalary(null);
                                                resetForm();
                                            }}
                                            className="px-6 py-2 sm:px-8 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading && (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                            <span>{loading ? 'Saving...' : (editingSalary ? 'Update Salary' : 'Create Salary')}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Professional Salaries List View */}
                {viewMode === 'list' && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm sm:text-lg">📋</span>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Salary Records</h2>
                                    <p className="text-gray-600 text-xs sm:text-sm">{salaries.length} total salary entries</p>
                                </div>
                            </div>
                        </div>

                        {salaries.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedSalaries(salaries.map(salary => salary._id));
                                                        } else {
                                                            setSelectedSalaries([]);
                                                        }
                                                    }}
                                                    checked={selectedSalaries.length === salaries.length && salaries.length > 0}
                                                    className="w-3 sm:w-4 h-3 sm:h-4 rounded border-gray-300 text-[#1a202c] focus:ring-[#1a202c]"
                                                />
                                            </th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Salary ID</th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Employee</th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Department</th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Month/Year</th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-semibold text-gray-700 text-xs sm:text-sm">Basic Salary</th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-semibold text-gray-700 text-xs sm:text-sm">Net Salary</th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                                            <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaries.map((salary, index) => (
                                            <tr key={salary._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200">
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSalaries.includes(salary._id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedSalaries([...selectedSalaries, salary._id]);
                                                            } else {
                                                                setSelectedSalaries(selectedSalaries.filter(id => id !== salary._id));
                                                            }
                                                        }}
                                                        className="w-3 sm:w-4 h-3 sm:h-4 rounded border-gray-300 text-[#1a202c] focus:ring-[#1a202c]"
                                                    />
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                                    <span className="font-mono text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{salary.salaryId}</span>
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                                    <div className="space-y-1">
                                                        <div className="font-semibold text-[#1a202c] text-sm sm:text-base">{salary.employeeName}</div>
                                                        <div className="text-xs sm:text-sm text-gray-500">{salary.designation}</div>
                                                    </div>
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">{salary.department}</span>
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                                                    <span className="font-medium text-[#1a202c] text-xs sm:text-sm">{salary.salaryMonth}/{salary.salaryYear}</span>
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-right">
                                                    <span className="font-semibold text-[#1a202c] text-sm sm:text-base">৳{(salary.basicSalary || 0).toFixed(2)}</span>
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-right">
                                                    <span className="font-semibold text-[#1a202c] text-sm sm:text-base">৳{(salary.netSalary || 0).toFixed(2)}</span>
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(salary.status)}`}>
                                                        {salary.status}
                                                    </span>
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                                                    <div className="flex gap-1 sm:gap-2 justify-center">
                                                        <button
                                                            onClick={() => editSalary(salary)}
                                                            className="p-1 sm:p-2 bg-blue-900 text-white rounded text-sm hover:bg-blue-800 transition-all duration-200"
                                                            title="Edit Salary"
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            onClick={() => generateSalarySlip(salary._id)}
                                                            className="p-1 sm:p-2 bg-blue-900 text-white rounded text-sm hover:bg-blue-800 transition-all duration-200"
                                                            title="Generate Salary Slip"
                                                        >
                                                            📄
                                                        </button>

                                                        {salary.status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => approveSalary(salary._id)}
                                                                    disabled={approveSalaryMutation.isPending}
                                                                    className="p-1 sm:p-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                                    title="Approve Salary"
                                                                >
                                                                    {approveSalaryMutation.isPending ? '⏳' : '✅'}
                                                                </button>
                                                                <button
                                                                    onClick={() => rejectSalary(salary._id)}
                                                                    disabled={rejectSalaryMutation.isPending}
                                                                    className="p-1 sm:p-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                                    title="Reject Salary"
                                                                >
                                                                    {rejectSalaryMutation.isPending ? '⏳' : '❌'}
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            onClick={() => deleteSalary(salary._id)}
                                                            disabled={deleteSalaryMutation.isPending}
                                                            className="p-1 sm:p-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                            title="Delete Salary"
                                                        >
                                                            {deleteSalaryMutation.isPending ? '⏳' : '🗑️'}
                                                        </button>

                                                        {salary.status === 'Approved' && (
                                                            <button
                                                                onClick={() => markAsPaid(salary._id)}
                                                                disabled={markAsPaidMutation.isPending}
                                                                className="p-1 sm:p-2 bg-blue-900 text-white rounded text-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                                title="Mark as Paid"
                                                            >
                                                                {markAsPaidMutation.isPending ? '⏳' : '💰'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 sm:py-16">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl sm:text-4xl">📋</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No Salary Records Found</h3>
                                <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                                    {Object.values(filters).some(filter => filter !== '' && filter !== new Date().getFullYear().toString())
                                        ? "No salary records match your current filters. Try adjusting your search criteria."
                                        : "Start by adding your first salary record to track employee compensation."}
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200"
                                >
                                    ➕ Add First Salary
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Professional Cards View */}
                {viewMode === 'cards' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm sm:text-lg">🎴</span>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Salary Cards</h2>
                                <p className="text-gray-600 text-xs sm:text-sm">{salaries.length} salary records in card view</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {salaries.map((salary) => (
                                <div key={salary._id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-1">{salary.employeeName}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500">{salary.designation}</p>
                                                <p className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded inline-block">{salary.salaryId}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(salary.status)}`}>
                                                    {salary.status}
                                                </span>
                                                <span className="text-xs sm:text-sm text-gray-600 font-medium">{salary.salaryMonth}/{salary.salaryYear}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4 sm:mb-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium text-sm">Department:</span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">{salary.department}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium text-sm">Basic Salary:</span>
                                                <span className="font-semibold text-gray-800 text-sm">৳{(salary.basicSalary || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium text-sm">Gross Salary:</span>
                                                <span className="font-semibold text-gray-800 text-sm">৳{(salary.grossSalary || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium text-sm">Net Salary:</span>
                                                <span className="font-semibold text-gray-800 text-sm">৳{(salary.netSalary || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 font-medium text-sm">Deductions:</span>
                                                <span className="font-semibold text-gray-800 text-sm">৳{(salary.totalDeductions || 0).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => editSalary(salary)}
                                                className="flex-1 px-3 py-2 bg-blue-900 text-white rounded text-xs sm:text-sm font-semibold hover:bg-blue-800 transition-all duration-200"
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                onClick={() => generateSalarySlip(salary._id)}
                                                className="flex-1 px-3 py-2 bg-blue-900 text-white rounded text-xs sm:text-sm font-semibold hover:bg-blue-800 transition-all duration-200"
                                            >
                                                📄 Slip
                                            </button>

                                            {salary.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => approveSalary(salary._id)}
                                                        disabled={approveSalaryMutation.isPending}
                                                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-xs sm:text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                    >
                                                        {approveSalaryMutation.isPending ? '⏳ Approving...' : '✅ Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => rejectSalary(salary._id)}
                                                        disabled={rejectSalaryMutation.isPending}
                                                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs sm:text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                    >
                                                        {rejectSalaryMutation.isPending ? '⏳ Rejecting...' : '❌ Reject'}
                                                    </button>
                                                </>
                                            )}

                                            {salary.status === 'Approved' && (
                                                <button
                                                    onClick={() => markAsPaid(salary._id)}
                                                    disabled={markAsPaidMutation.isPending}
                                                    className="flex-1 px-3 py-2 bg-blue-900 text-white rounded text-xs sm:text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                                >
                                                    {markAsPaidMutation.isPending ? '⏳ Marking Paid...' : '💰 Mark Paid'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {salaries.length === 0 && (
                            <div className="col-span-full text-center py-12 sm:py-16">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-3xl sm:text-4xl">🎴</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">No Salary Records Found</h3>
                                <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                                    {Object.values(filters).some(filter => filter !== '' && filter !== new Date().getFullYear().toString())
                                        ? "No salary records match your current filters. Try adjusting your search criteria."
                                        : "Start by adding your first salary record to track employee compensation."}
                                </p>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-2 sm:px-8 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-200"
                                >
                                    ➕ Add First Salary
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                )}

                {/* Professional Analytics View */}
                {viewMode === 'analytics' && statistics && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Analytics Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm sm:text-lg">📊</span>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Salary Analytics</h2>
                                <p className="text-gray-600 text-xs sm:text-sm">Comprehensive insights into salary distribution and trends</p>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            <div className="p-3 sm:p-4 lg:p-6">
                                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                    <div className="w-6 sm:w-8 h-6 sm:h-8 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                        <span className="text-white text-xs sm:text-sm">📈</span>
                                    </div>
                                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#1a202c]">Status Breakdown</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                    <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
                                        <div className="text-3xl font-bold text-slate-600 mb-2">{statistics.statusCounts?.Draft || 0}</div>
                                        <div className="text-slate-600 font-medium">Draft</div>
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                                            <div className="bg-slate-500 h-2 rounded-full" style={{width: `${(statistics.statusCounts?.Draft || 0) / Math.max(Object.values(statistics.statusCounts || {}).reduce((a, b) => a + b, 0), 1) * 100}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 hover:shadow-lg transition-all duration-300">
                                        <div className="text-3xl font-bold text-amber-600 mb-2">{statistics.statusCounts?.Pending || 0}</div>
                                        <div className="text-slate-600 font-medium">Pending</div>
                                        <div className="w-full bg-amber-200 rounded-full h-2 mt-3">
                                            <div className="bg-amber-500 h-2 rounded-full" style={{width: `${(statistics.statusCounts?.Pending || 0) / Math.max(Object.values(statistics.statusCounts || {}).reduce((a, b) => a + b, 0), 1) * 100}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.statusCounts?.Approved || 0}</div>
                                        <div className="text-slate-600 font-medium">Approved</div>
                                        <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(statistics.statusCounts?.Approved || 0) / Math.max(Object.values(statistics.statusCounts || {}).reduce((a, b) => a + b, 0), 1) * 100}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300">
                                        <div className="text-3xl font-bold text-emerald-600 mb-2">{statistics.statusCounts?.Paid || 0}</div>
                                        <div className="text-slate-600 font-medium">Paid</div>
                                        <div className="w-full bg-emerald-200 rounded-full h-2 mt-3">
                                            <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${(statistics.statusCounts?.Paid || 0) / Math.max(Object.values(statistics.statusCounts || {}).reduce((a, b) => a + b, 0), 1) * 100}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Department Breakdown */}
                        {statistics.departmentBreakdown && Object.keys(statistics.departmentBreakdown).length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                            <span className="text-white text-sm">🏢</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">Department-wise Distribution</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(statistics.departmentBreakdown).map(([department, amount]) => (
                                            <div key={department} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                                                    <span className="font-semibold text-slate-700">{department}</span>
                                                </div>
                                                <span className="font-bold text-xl text-blue-600">৳{(amount || 0).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Employee Type Breakdown */}
                        {statistics.employeeTypeBreakdown && Object.keys(statistics.employeeTypeBreakdown).length > 0 && (
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                            <span className="text-white text-sm">👥</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">Employee Type Distribution</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(statistics.employeeTypeBreakdown).map(([type, amount]) => (
                                            <div key={type} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                                                    <span className="font-semibold text-slate-700">{type}</span>
                                                </div>
                                                <span className="font-bold text-xl text-purple-600">৳{(amount || 0).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Salary Slip View */}
                {viewMode === 'slips' && selectedSlip && (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 sm:p-4 lg:p-8">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">📄 Salary Slip</h2>
                            <button
                                onClick={exportSalarySlipToPDF}
                                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all"
                            >
                                📄 Export PDF
                            </button>
                        </div>

                        <div id="salary-slip" className="bg-gray-50 rounded-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-300">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Sunlight School</h1>
                                <p className="text-gray-600">Salary Slip for {selectedSlip.salaryDetails.month}/{selectedSlip.salaryDetails.year}</p>
                                <p className="text-sm text-gray-500">Salary ID: {selectedSlip.salaryId}</p>
                            </div>

                            {/* Employee Information */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Employee Details</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-semibold">{selectedSlip.employee.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Employee ID:</span>
                                            <span className="font-semibold">{selectedSlip.employee.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Designation:</span>
                                            <span className="font-semibold">{selectedSlip.employee.designation}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Department:</span>
                                            <span className="font-semibold">{selectedSlip.employee.department}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Employee Type:</span>
                                            <span className="font-semibold">{selectedSlip.employee.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Salary Period</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Month/Year:</span>
                                            <span className="font-semibold">{selectedSlip.salaryDetails.month}/{selectedSlip.salaryDetails.year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Working Days:</span>
                                            <span className="font-semibold">{selectedSlip.salaryDetails.workingDays}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Present Days:</span>
                                            <span className="font-semibold">{selectedSlip.salaryDetails.presentDays}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Date:</span>
                                            <span className="font-semibold">
                                                {selectedSlip.payment.paymentDate
                                                    ? new Date(selectedSlip.payment.paymentDate).toLocaleDateString()
                                                    : 'Not Paid'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`font-semibold px-2 py-1 rounded ${getStatusColor(selectedSlip.payment.status)}`}>
                                                {selectedSlip.payment.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Earnings */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-green-800 mb-4 bg-green-100 p-3 rounded">💰 Earnings</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-green-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                                                <th className="border border-gray-300 px-4 py-2 text-right">Amount (৳)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Basic Salary</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                                                    {(selectedSlip.earnings.basicSalary || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">House Rent Allowance</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.earnings.houseRentAllowance || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Conveyance Allowance</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.earnings.conveyanceAllowance || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Medical Allowance</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.earnings.medicalAllowance || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Special Allowance</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.earnings.specialAllowance || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Performance Bonus</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.earnings.performanceBonus || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Overtime Amount</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.earnings.overtimeAmount || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="bg-green-50 font-bold">
                                                <td className="border border-gray-300 px-4 py-2">Gross Salary</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.totals.grossSalary || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-red-800 mb-4 bg-red-100 p-3 rounded">📉 Deductions</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-red-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                                                <th className="border border-gray-300 px-4 py-2 text-right">Amount (৳)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Provident Fund</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.deductions.providentFund || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Professional Tax</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.deductions.professionalTax || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Income Tax</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.deductions.incomeTax || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="border border-gray-300 px-4 py-2">Loan Deduction</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.deductions.loanDeduction || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="bg-red-50 font-bold">
                                                <td className="border border-gray-300 px-4 py-2">Total Deductions</td>
                                                <td className="border border-gray-300 px-4 py-2 text-right">
                                                    {(selectedSlip.totals.totalDeductions || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Net Salary */}
                            <div className="bg-blue-100 p-6 rounded-lg text-center">
                                <h3 className="text-2xl font-bold text-blue-800 mb-2">Net Salary</h3>
                                <p className="text-4xl font-bold text-green-600">৳{(selectedSlip.totals.netSalary || 0).toFixed(2)}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Amount in Words: {numberToWords(selectedSlip.totals.netSalary || 0)} Taka Only
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 text-center text-sm text-gray-600">
                                <p>This is a computer-generated salary slip and does not require signature.</p>
                                <p>Generated on: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}

               
              
            </div>
        </div>
    );
};

// Helper function to convert numbers to words
function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    function convertLessThanOneThousand(n) {
        if (n === 0) return '';
        let result = '';

        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }

        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            result += teens[n - 10] + ' ';
            return result.trim();
        }

        if (n > 0) {
            result += ones[n] + ' ';
        }

        return result.trim();
    }

    if (num === 0) return 'Zero';

    let result = '';
    let crore = Math.floor(num / 10000000);
    let lakh = Math.floor((num % 10000000) / 100000);
    let thousand = Math.floor((num % 100000) / 1000);
    let remainder = num % 1000;

    if (crore > 0) result += convertLessThanOneThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanOneThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanOneThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanOneThousand(remainder);

    return result.trim();
}

export default SalaryManagementPage;