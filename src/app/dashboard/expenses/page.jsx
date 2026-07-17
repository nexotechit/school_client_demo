'use client';

import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../../config/api';
import jsPDF from 'jspdf';

const ExpensesManagementPage = () => {
    // State management
    const [expenses, setExpenses] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [vendors, setVendors] = useState([]);
    
    // Filters
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        department: '',
        academicYear: new Date().getFullYear().toString(),
        month: '',
        startDate: '',
        endDate: '',
        vendor: '',
        priority: '',
        search: ''
    });
    
    // Form states
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        subCategory: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        vendor: '',
        vendorContact: '',
        invoiceNumber: '',
        department: 'General',
        priority: 'Normal',
        tags: [],
        isRecurring: false,
        recurringFrequency: ''
    });
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'cards', 'analytics'
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    
    // Expense categories
    const expenseCategories = [
        'Salary',
        'Utilities',
        'Maintenance',
        'Supplies',
        'Transportation',
        'Rent',
        'Insurance',
        'Marketing',
        'Technology',
        'Professional Services',
        'Training',
        'Events',
        'Miscellaneous'
    ];

    // Departments
    const departmentOptions = [
        'General',
        'Academic',
        'Administration',
        'Maintenance',
        'IT',
        'Finance',
        'HR',
        'Security'
    ];

    // Payment methods
    const paymentMethods = [
        'Cash',
        'Bank Transfer',
        'Cheque',
        'Card',
        'Online',
        'Petty Cash'
    ];

    // Priority levels
    const priorityLevels = [
        { value: 'Low', color: 'green' },
        { value: 'Normal', color: 'blue' },
        { value: 'High', color: 'orange' },
        { value: 'Urgent', color: 'red' }
    ];

    // Load initial data
    useEffect(() => {
        fetchExpenses();
        fetchStatistics();
        fetchCategories();
        fetchDepartments();
        fetchVendors();
    }, []);

    // Fetch expenses with filters
    const fetchExpenses = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${API_BASE_URL}/expenses?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                setExpenses(data.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            Swal.fire('Error', 'Failed to load expenses', 'error');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        try {
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value && key !== 'search') queryParams.append(key, value);
            });

            const response = await fetch(`${API_BASE_URL}/expenses/statistics?${queryParams}`);
            const data = await response.json();
            
            if (data.success) {
                setStatistics(data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    // Fetch helper data
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/helpers/categories`);
            const data = await response.json();
            if (data.success) setCategories(data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/helpers/departments`);
            const data = await response.json();
            if (data.success) setDepartments(data.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/helpers/vendors`);
            const data = await response.json();
            if (data.success) setVendors(data.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        fetchExpenses();
        fetchStatistics();
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            category: '',
            status: '',
            department: '',
            academicYear: new Date().getFullYear().toString(),
            month: '',
            startDate: '',
            endDate: '',
            vendor: '',
            priority: '',
            search: ''
        });
        setTimeout(() => {
            fetchExpenses();
            fetchStatistics();
        }, 100);
    };

    // Handle form submission with optimistic updates
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.category || !formData.amount) {
            Swal.fire('Error', 'Please fill all required fields', 'error');
            return;
        }

        const isEditing = !!editingExpense;
        const originalExpenses = [...expenses];
        const originalStatistics = { ...statistics };

        try {
            setLoading(true);
            
            // Optimistic update for better UX
            if (isEditing) {
                // Update existing expense in state
                const updatedExpense = { 
                    ...editingExpense, 
                    ...formData,
                    amount: Number(formData.amount) || 0
                };
                setExpenses(prev => prev.map(exp => 
                    exp._id === editingExpense._id ? updatedExpense : exp
                ));
            } else {
                // Add new expense to state (temporary ID)
                const tempExpense = { 
                    ...formData,
                    amount: Number(formData.amount) || 0,
                    _id: `temp-${Date.now()}`,
                    expenseId: `EXP-${Date.now()}`,
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                };
                setExpenses(prev => [tempExpense, ...prev]);
            }

            const url = isEditing 
                ? `${API_BASE_URL}/expenses/${editingExpense._id}`
                : `${API_BASE_URL}/expenses`;
            
            const method = isEditing ? 'PUT' : 'POST';
            
            // Prepare data with amount as number
            const submitData = {
                ...formData,
                amount: Number(formData.amount) || 0
            };
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Success', 
                    isEditing ? 'Expense updated successfully' : 'Expense created successfully', 
                    'success'
                );
                
                setShowForm(false);
                setEditingExpense(null);
                resetForm();
                
                // Fetch fresh data in background to sync
                fetchExpenses(false);
                fetchStatistics();
            } else {
                // Revert optimistic update on error
                setExpenses(originalExpenses);
                setStatistics(originalStatistics);
                Swal.fire('Error', data.message || 'Failed to save expense', 'error');
            }
        } catch (error) {
            // Revert optimistic update on error
            setExpenses(originalExpenses);
            setStatistics(originalStatistics);
            console.error('Error saving expense:', error);
            Swal.fire('Error', error.message || 'Failed to save expense', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            subCategory: '',
            amount: '',
            expenseDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'Cash',
            vendor: '',
            vendorContact: '',
            invoiceNumber: '',
            department: 'General',
            priority: 'Normal',
            tags: [],
            isRecurring: false,
            recurringFrequency: ''
        });
    };

    // Edit expense
    const editExpense = (expense) => {
        setEditingExpense(expense);
        setFormData({
            title: expense.title,
            description: expense.description || '',
            category: expense.category,
            subCategory: expense.subCategory || '',
            amount: expense.amount.toString(),
            expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
            paymentMethod: expense.paymentMethod,
            vendor: expense.vendor || '',
            vendorContact: expense.vendorContact || '',
            invoiceNumber: expense.invoiceNumber || '',
            department: expense.department,
            priority: expense.priority,
            tags: expense.tags || [],
            isRecurring: expense.isRecurring || false,
            recurringFrequency: expense.recurringFrequency || ''
        });
        setShowForm(true);
    };

    // Delete expense with optimistic updates
    const deleteExpense = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Expense?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete'
        });

        if (result.isConfirmed) {
            const originalExpenses = [...expenses];
            const originalStatistics = { ...statistics };

            try {
                // Optimistic update - remove from UI immediately
                setExpenses(prev => prev.filter(exp => exp._id !== id));

                const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire('Deleted!', 'Expense deleted successfully', 'success');
                    // Fetch fresh data in background to sync
                    fetchExpenses(false);
                    fetchStatistics();
                } else {
                    // Revert optimistic update on error
                    setExpenses(originalExpenses);
                    setStatistics(originalStatistics);
                    Swal.fire('Error', data.message || 'Failed to delete expense', 'error');
                    return; // Don't throw, just return
                }
            } catch (error) {
                // Revert optimistic update on error
                setExpenses(originalExpenses);
                setStatistics(originalStatistics);
                console.error('Network error deleting expense:', error);
                Swal.fire('Error', 'Network error: Failed to delete expense', 'error');
            }
        }
    };

    // Approve expense with optimistic updates
    const approveExpense = async (id) => {
        const originalExpenses = [...expenses];
        const originalStatistics = { ...statistics };

        try {
            // Optimistic update - change status to Approved immediately
            setExpenses(prev => prev.map(exp => 
                exp._id === id ? { ...exp, status: 'Approved' } : exp
            ));
            
            const response = await fetch(`${API_BASE_URL}/expenses/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: 'Admin' })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Approved!', 'Expense approved successfully', 'success');
                // Fetch fresh data in background to sync
                fetchExpenses(false);
                fetchStatistics();
            } else {
                // Revert optimistic update on error
                setExpenses(originalExpenses);
                setStatistics(originalStatistics);
                Swal.fire('Error', data.message || 'Failed to approve expense', 'error');
                return; // Don't throw, just return
            }
        } catch (error) {
            // Revert optimistic update on error
            setExpenses(originalExpenses);
            setStatistics(originalStatistics);
            console.error('Error approving expense:', error);
            Swal.fire('Error', 'Failed to approve expense', 'error');
        }
    };

    // Reject expense with optimistic updates
    const rejectExpense = async (id) => {
        const { value: reason } = await Swal.fire({
            title: 'Reject Expense',
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
            const originalExpenses = [...expenses];
            const originalStatistics = { ...statistics };

            try {
                // Optimistic update - change status to Rejected immediately
                setExpenses(prev => prev.map(exp => 
                    exp._id === id ? { ...exp, status: 'Rejected' } : exp
                ));
                
                const response = await fetch(`${API_BASE_URL}/expenses/${id}/reject`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rejectionReason: reason, rejectedBy: 'Admin' })
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire('Rejected!', 'Expense rejected successfully', 'success');
                    // Fetch fresh data in background to sync
                    fetchExpenses(false);
                    fetchStatistics();
                } else {
                    // Revert optimistic update on error
                    setExpenses(originalExpenses);
                    setStatistics(originalStatistics);
                    Swal.fire('Error', data.message || 'Failed to reject expense', 'error');
                    return; // Don't throw, just return
                }
            } catch (error) {
                // Revert optimistic update on error
                setExpenses(originalExpenses);
                setStatistics(originalStatistics);
                console.error('Error rejecting expense:', error);
                Swal.fire('Error', 'Failed to reject expense', 'error');
            }
        }
    };

    // Mark as paid with optimistic updates
    const markAsPaid = async (id) => {
        const originalExpenses = [...expenses];
        const originalStatistics = { ...statistics };

        try {
            // Optimistic update - change status to Paid immediately
            setExpenses(prev => prev.map(exp => 
                exp._id === id ? { ...exp, status: 'Paid' } : exp
            ));
            
            const response = await fetch(`${API_BASE_URL}/expenses/${id}/mark-paid`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentDate: new Date() })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Paid!', 'Expense marked as paid successfully', 'success');
                // Fetch fresh data in background to sync
                fetchExpenses(false);
                fetchStatistics();
            } else {
                // Revert optimistic update on error
                setExpenses(originalExpenses);
                setStatistics(originalStatistics);
                Swal.fire('Error', data.message || 'Failed to mark expense as paid', 'error');
            }
        } catch (error) {
            // Revert optimistic update on error
            setExpenses(originalExpenses);
            setStatistics(originalStatistics);
            console.error('Error marking as paid:', error);
            Swal.fire('Error', 'Failed to mark expense as paid', 'error');
        }
    };

    // Bulk approve with optimistic updates
    const bulkApprove = async () => {
        if (selectedExpenses.length === 0) {
            Swal.fire('Error', 'Please select expenses to approve', 'error');
            return;
        }

        const originalExpenses = [...expenses];
        const originalStatistics = { ...statistics };

        try {
            // Optimistic update - change status to Approved for selected expenses
            setExpenses(prev => prev.map(exp => 
                selectedExpenses.includes(exp._id) ? { ...exp, status: 'Approved' } : exp
            ));
            
            const response = await fetch(`${API_BASE_URL}/expenses/bulk/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    expenseIds: selectedExpenses,
                    approvedBy: 'Admin'
                })
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Success!', `${data.count} expenses approved successfully`, 'success');
                setSelectedExpenses([]);
                setShowBulkActions(false);
                // Fetch fresh data in background to sync
                fetchExpenses(false);
                fetchStatistics();
            } else {
                // Revert optimistic update on error
                setExpenses(originalExpenses);
                setStatistics(originalStatistics);
                Swal.fire('Error', data.message || 'Failed to bulk approve expenses', 'error');
            }
        } catch (error) {
            // Revert optimistic update on error
            setExpenses(originalExpenses);
            setStatistics(originalStatistics);
            console.error('Error bulk approving:', error);
            Swal.fire('Error', 'Failed to bulk approve expenses', 'error');
        }
    };

    // Bulk delete with optimistic updates
    const bulkDelete = async () => {
        if (selectedExpenses.length === 0) {
            Swal.fire('Error', 'Please select expenses to delete', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Selected Expenses?',
            text: `This will delete ${selectedExpenses.length} expenses. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Delete All'
        });

        if (result.isConfirmed) {
            const originalExpenses = [...expenses];
            const originalStatistics = { ...statistics };

            try {
                // Optimistic update - remove selected expenses from UI immediately
                setExpenses(prev => prev.filter(exp => !selectedExpenses.includes(exp._id)));
                
                const response = await fetch(`${API_BASE_URL}/expenses/bulk/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ expenseIds: selectedExpenses })
                });

                const data = await response.json();

                if (data.success) {
                    Swal.fire('Deleted!', `${data.count} expenses deleted successfully`, 'success');
                    setSelectedExpenses([]);
                    setShowBulkActions(false);
                    // Fetch fresh data in background to sync
                    fetchExpenses(false);
                    fetchStatistics();
                } else {
                    // Revert optimistic update on error
                    setExpenses(originalExpenses);
                    setStatistics(originalStatistics);
                    Swal.fire('Error', data.message || 'Failed to bulk delete expenses', 'error');
                }
            } catch (error) {
                // Revert optimistic update on error
                setExpenses(originalExpenses);
                setStatistics(originalStatistics);
                console.error('Error bulk deleting:', error);
                Swal.fire('Error', 'Failed to bulk delete expenses', 'error');
            }
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        if (expenses.length === 0) {
            Swal.fire('Error', 'No expenses to export', 'error');
            return;
        }

        // Create CSV content
        let csvContent = `Expenses Report\n`;
        csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;

        // Headers
        const headers = [
            'Expense ID', 'Title', 'Category', 'Amount', 'Date', 'Vendor', 
            'Department', 'Status', 'Payment Method', 'Priority'
        ];
        csvContent += headers.join(',') + '\n';

        // Data rows
        expenses.forEach(expense => {
            const row = [
                expense.expenseId,
                `"${expense.title}"`,
                expense.category,
                expense.amount,
                new Date(expense.expenseDate).toLocaleDateString(),
                `"${expense.vendor || ''}"`,
                expense.department,
                expense.status,
                expense.paymentMethod,
                expense.priority
            ];
            csvContent += row.join(',') + '\n';
        });

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Expenses_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        Swal.fire('Success', 'Expenses exported to Excel', 'success');
    };

    // Export to PDF
    const exportToPDF = () => {
        if (expenses.length === 0) {
            Swal.fire('Error', 'No expenses to export', 'error');
            return;
        }

        try {
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;

            // Header background
            pdf.setFillColor(26, 32, 44);
            pdf.rect(0, 0, pageWidth, 18, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Expense Management Report', margin, 12);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 12, { align: 'right' });

            // Table header
            const headers = ['#', 'Expense ID', 'Title', 'Category', 'Vendor', 'Amount (BDT)', 'Date', 'Department', 'Status', 'Priority'];
            const colWidths = [8, 28, 52, 26, 30, 28, 24, 28, 22, 22];
            let y = 26;

            pdf.setFillColor(26, 32, 44);
            pdf.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            let x = margin;
            headers.forEach((header, i) => {
                pdf.text(header, x + 1, y);
                x += colWidths[i];
            });
            y += 5;

            // Table rows
            pdf.setFont('helvetica', 'normal');
            expenses.forEach((expense, index) => {
                if (y > pageHeight - 15) {
                    pdf.addPage();
                    y = 15;
                    // Re-draw header on new page
                    pdf.setFillColor(26, 32, 44);
                    pdf.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
                    pdf.setTextColor(255, 255, 255);
                    pdf.setFont('helvetica', 'bold');
                    x = margin;
                    headers.forEach((header, i) => {
                        pdf.text(header, x + 1, y);
                        x += colWidths[i];
                    });
                    y += 5;
                    pdf.setFont('helvetica', 'normal');
                }

                const rowColor = index % 2 === 0 ? [248, 249, 250] : [255, 255, 255];
                pdf.setFillColor(...rowColor);
                pdf.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(7.5);

                const row = [
                    String(index + 1),
                    expense.expenseId || '-',
                    (expense.title || '').substring(0, 30),
                    expense.category || '-',
                    (expense.vendor || '-').substring(0, 18),
                    `${Number(expense.amount || 0).toFixed(2)}`,
                    expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : '-',
                    expense.department || '-',
                    expense.status || '-',
                    expense.priority || '-',
                ];

                x = margin;
                row.forEach((cell, i) => {
                    pdf.text(String(cell), x + 1, y);
                    x += colWidths[i];
                });
                y += 7;
            });

            // Footer
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Total Expenses: ${expenses.length}`, margin, pageHeight - 5);

            pdf.save(`Expenses_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            Swal.fire('Success', 'PDF exported successfully', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            Swal.fire('Error', 'Failed to generate PDF', 'error');
        }
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-[#1a202c] text-white';
            case 'Approved': return 'bg-[#1a202c] text-white';
            case 'Pending': return 'bg-gray-400 text-white';
            case 'Rejected': return 'bg-red-600 text-white';
            default: return 'bg-gray-300 text-black';
        }
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low': return 'bg-[#1a202c] text-white';
            case 'Normal': return 'bg-[#1a202c] text-white';
            case 'High': return 'bg-gray-600 text-white';
            case 'Urgent': return 'bg-red-600 text-white';
            default: return 'bg-gray-300 text-black';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="container mx-auto pt-2">
                {/* Professional Header */}
                <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-base sm:text-lg lg:text-xl">💰</span>
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#1a202c]">
                                        Expense Management
                                    </h1>
                                    <p className="text-black text-sm sm:text-base">Professional expense tracking & approval system</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded font-semibold transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                📋 List View
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded font-semibold transition-all ${
                                    viewMode === 'cards'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                🎴 Cards View
                            </button>
                            <button
                                onClick={() => setViewMode('analytics')}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded font-semibold transition-all ${
                                    viewMode === 'analytics'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                📊 Analytics
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area with Loading Overlay */}
                <div className="relative">
                    {/* Enhanced Statistics Cards */}
                    {statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
                            <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-black text-xs sm:text-sm font-semibold uppercase">Total Expenses</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">৳{statistics.totalAmount.toLocaleString()}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                            <span className="text-xs text-black">All time</span>
                                        </div>
                                    </div>
                                    <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg sm:text-xl lg:text-2xl">💵</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-black text-xs sm:text-sm font-semibold uppercase">Paid Amount</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">৳{statistics.paidAmount.toLocaleString()}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                            <span className="text-xs text-black">Completed</span>
                                        </div>
                                    </div>
                                    <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg sm:text-xl lg:text-2xl">✅</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-black text-xs sm:text-sm font-semibold uppercase">Pending Amount</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">৳{statistics.pendingAmount.toLocaleString()}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                            <span className="text-xs text-black">Awaiting approval</span>
                                        </div>
                                    </div>
                                    <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg sm:text-xl lg:text-2xl">⏳</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-black text-xs sm:text-sm font-semibold uppercase">Total Records</p>
                                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">{statistics.totalRecords}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#1a202c] rounded-full"></div>
                                            <span className="text-xs text-black">All entries</span>
                                        </div>
                                    </div>
                                    <div className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                        <span className="text-white text-lg sm:text-xl lg:text-2xl">📊</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Professional Filters Section */}
                    <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-base sm:text-lg">🔍</span>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Advanced Filters</h2>
                                    <p className="text-black text-xs sm:text-sm">Filter and search expenses with precision</p>
                                </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={applyFilters}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all"
                                >
                                    🔍 Apply Filters
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-black border border-gray-300 rounded font-semibold hover:border-[#1a202c] transition-all"
                                >
                                    🗑️ Clear All
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {/* Search */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Search</label>
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Search expenses..."
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Category</label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                >
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Department</label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((dept, index) => (
                                        <option key={index} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Academic Year */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Academic Year</label>
                                <input
                                    type="text"
                                    value={filters.academicYear}
                                    onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                                    placeholder="2026"
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                />
                            </div>

                            {/* Month */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Month</label>
                                <select
                                    value={filters.month}
                                    onChange={(e) => handleFilterChange('month', e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                >
                                    <option value="">All Months</option>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Action Buttons */}
                    <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
                        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 justify-between items-start lg:items-center">
                            <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all flex items-center gap-2"
                                >
                                    <span>➕</span>
                                    <span>Add Expense</span>
                                </button>
                                
                                {selectedExpenses.length > 0 && (
                                    <>
                                        <button
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all flex items-center gap-2"
                                        >
                                            <span>⚡</span>
                                            <span>Bulk Actions ({selectedExpenses.length})</span>
                                        </button>
                                        
                                        {showBulkActions && (
                                            <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded">
                                                <button
                                                    onClick={bulkApprove}
                                                    className="px-3 sm:px-4 py-2 bg-blue-900 text-white rounded text-sm font-semibold hover:bg-blue-800 transition-all flex items-center gap-1"
                                                >
                                                    <span>✅</span>
                                                    <span>Approve All</span>
                                                </button>
                                                <button
                                                    onClick={bulkDelete}
                                                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 transition-all flex items-center gap-1"
                                                >
                                                    <span>🗑️</span>
                                                    <span>Delete All</span>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={exportToExcel}
                                    className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all flex items-center gap-2"
                                >
                                    <span>📊</span>
                                    <span>Export Excel</span>
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all flex items-center gap-2"
                                >
                                    <span>📄</span>
                                    <span>Export PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Professional Add/Edit Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
                            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                                <div className="p-4 sm:p-6 lg:p-8">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                                <span className="text-white text-lg sm:text-xl">
                                                    {editingExpense ? '✏️' : '➕'}
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">
                                                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                                                </h2>
                                                <p className="text-black text-sm sm:text-base mt-1">
                                                    {editingExpense ? 'Update expense details' : 'Create a new expense entry'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowForm(false);
                                                setEditingExpense(null);
                                                resetForm();
                                            }}
                                            className="w-8 sm:w-10 h-8 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
                                        >
                                            <span className="text-lg sm:text-xl">×</span>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Title */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                    placeholder="Expense title"
                                                    required
                                                />
                                            </div>

                                            {/* Category */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Category *
                                                </label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                    required
                                                >
                                                    <option value="">Select Category</option>
                                                    {expenseCategories.map((category, index) => (
                                                        <option key={index} value={category}>{category}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Amount */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Amount (৳) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                            </div>

                                            {/* Expense Date */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Expense Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.expenseDate}
                                                    onChange={(e) => setFormData({...formData, expenseDate: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                />
                                            </div>

                                            {/* Payment Method */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Payment Method
                                                </label>
                                                <select
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                >
                                                    {paymentMethods.map((method, index) => (
                                                        <option key={index} value={method}>{method}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Vendor */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Vendor/Supplier
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.vendor}
                                                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                    placeholder="Vendor name"
                                                />
                                            </div>

                                            {/* Department */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Department
                                                </label>
                                                <select
                                                    value={formData.department}
                                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                >
                                                    {departmentOptions.map((dept, index) => (
                                                        <option key={index} value={dept}>{dept}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Priority */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Priority
                                                </label>
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                >
                                                    {priorityLevels.map((priority, index) => (
                                                        <option key={index} value={priority.value}>{priority.value}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Invoice Number */}
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Invoice/Bill Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.invoiceNumber}
                                                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                    placeholder="Invoice number"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="md:col-span-2">
                                                <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                    className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                    rows="3"
                                                    placeholder="Expense description..."
                                                ></textarea>
                                            </div>
                                        </div>

                                        {/* Professional Submit Buttons */}
                                        <div className="flex gap-3 sm:gap-4 justify-end pt-6 sm:pt-8 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setEditingExpense(null);
                                                    resetForm();
                                                }}
                                                className="px-6 sm:px-8 py-2 sm:py-3 bg-gray-100 text-black rounded font-semibold hover:bg-gray-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {loading && (
                                                    <div className="w-3 sm:w-4 h-3 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                )}
                                                <span>{loading ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Professional Expenses List View */}
                    {viewMode === 'list' && (
                        <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6 lg:p-8">
                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                                <div className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm sm:text-base lg:text-lg">📋</span>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Expenses List</h2>
                                    <p className="text-black text-xs sm:text-sm">{expenses.length} total expenses</p>
                                </div>
                            </div>
                            
                            {expenses.length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table id="expenses-table" className="w-full">
                                        <thead className="bg-[#1a202c] text-white">
                                            <tr>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left text-xs sm:text-sm">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedExpenses(expenses.map(exp => exp._id));
                                                            } else {
                                                                setSelectedExpenses([]);
                                                            }
                                                        }}
                                                        checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                                                        className="w-3 sm:w-4 h-3 sm:h-4 border-white rounded focus:ring-white"
                                                    />
                                                </th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-xs sm:text-sm">Expense ID</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-xs sm:text-sm">Title</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-xs sm:text-sm">Category</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-left font-semibold text-xs sm:text-sm">Vendor</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-right font-semibold text-xs sm:text-sm">Amount (৳)</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-xs sm:text-sm">Date</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-xs sm:text-sm">Status</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-xs sm:text-sm">Priority</th>
                                                <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center font-semibold text-xs sm:text-sm">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((expense, index) => (
                                                <tr key={expense._id} className={`border-b border-gray-200 hover:bg-gray-50 transition-all ${
                                                    selectedExpenses.includes(expense._id) ? 'bg-gray-100' : ''
                                                }`}>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedExpenses.includes(expense._id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedExpenses([...selectedExpenses, expense._id]);
                                                                } else {
                                                                    setSelectedExpenses(selectedExpenses.filter(id => id !== expense._id));
                                                                }
                                                            }}
                                                            className="w-3 sm:w-4 h-3 sm:h-4 border-gray-300 rounded focus:ring-[#1a202c]"
                                                        />
                                                    </td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 font-mono text-xs sm:text-sm text-black font-medium">{expense.expenseId}</td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                                        <div className="font-semibold text-black text-sm sm:text-base">{expense.title}</div>
                                                        {expense.description && (
                                                            <div className="text-xs text-black mt-1 line-clamp-1">{expense.description}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4">
                                                        <span className="px-2 sm:px-3 py-1 bg-gray-100 text-black rounded-full text-xs sm:text-sm font-medium">
                                                            {expense.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-black text-sm sm:text-base">{expense.vendor || '-'}</td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-right">
                                                        <span className="font-bold text-sm sm:text-lg text-black">৳{Number(expense.amount || 0).toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center text-xs sm:text-sm text-black">
                                                        {new Date(expense.expenseDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getStatusColor(expense.status)}`}>
                                                            {expense.status}
                                                        </span>
                   
                                                    </td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getPriorityColor(expense.priority)}`}>
                                                            {expense.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-center">
                                                        <div className="flex gap-1 justify-center">
                                                            <button
                                                                onClick={() => editExpense(expense)}
                                                                className="p-1 sm:p-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all text-sm"
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            
                                                            {expense.status === 'Pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => approveExpense(expense._id)}
                                                                        className="p-1 sm:p-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all text-sm"
                                                                        title="Approve"
                                                                    >
                                                                        ✅
                                                                    </button>
                                                                    <button
                                                                        onClick={() => rejectExpense(expense._id)}
                                                                        className="p-1 sm:p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-sm"
                                                                        title="Reject"
                                                                    >
                                                                        ❌
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {expense.status === 'Approved' && (
                                                                <button
                                                                    onClick={() => markAsPaid(expense._id)}
                                                                    className="p-1 sm:p-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all text-sm"
                                                                    title="Mark as Paid"
                                                                >
                                                                    💰
                                                                </button>
                                                            )}
                                                            
                                                            <button
                                                                onClick={() => deleteExpense(expense._id)}
                                                                className="p-1 sm:p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-sm"
                                                                title="Delete"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📋</div>
                                    <p className="text-gray-600">No expenses found matching your filters</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Professional Cards View */}
                    {viewMode === 'cards' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-base sm:text-lg">🎴</span>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Expense Cards</h2>
                                    <p className="text-black text-xs sm:text-sm">{expenses.length} expenses in card view</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {expenses.map((expense) => (
                                    <div key={expense._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="p-4 sm:p-6">
                                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                                <div className="space-y-2">
                                                    <h3 className="font-bold text-base sm:text-lg text-[#1a202c] line-clamp-1">{expense.title}</h3>
                                                    <p className="text-xs sm:text-sm text-black font-mono">{expense.expenseId}</p>
                                                </div>
                                                <div className="flex gap-1 sm:gap-2">
                                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getStatusColor(expense.status)}`}>
                                                        {expense.status}
                                                    </span>
                                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getPriorityColor(expense.priority)}`}>
                                                        {expense.priority}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-black text-sm font-medium">Category:</span>
                                                    <span className="px-2 sm:px-3 py-1 bg-gray-100 text-black rounded-full text-xs sm:text-sm font-medium">{expense.category}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-black text-sm font-medium">Amount:</span>
                                                    <span className="font-bold text-lg sm:text-xl text-[#1a202c]">৳{Number(expense.amount || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-black text-sm font-medium">Date:</span>
                                                    <span className="text-xs sm:text-sm text-black">{new Date(expense.expenseDate).toLocaleDateString()}</span>
                                                </div>
                                                {expense.vendor && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-black text-sm font-medium">Vendor:</span>
                                                        <span className="text-xs sm:text-sm text-black">{expense.vendor}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-black text-sm font-medium">Department:</span>
                                                    <span className="px-2 py-1 bg-[#1a202c] text-white rounded-lg text-xs font-medium">{expense.department}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => editExpense(expense)}
                                                    className="flex-1 px-3 sm:px-4 py-2 bg-blue-900 text-white rounded text-sm font-semibold hover:bg-blue-800 transition-all"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                
                                                {expense.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => approveExpense(expense._id)}
                                                            className="flex-1 px-3 sm:px-4 py-2 bg-blue-900 text-white rounded text-sm font-semibold hover:bg-blue-800 transition-all"
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => rejectExpense(expense._id)}
                                                            className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 transition-all"
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {expense.status === 'Approved' && (
                                                    <button
                                                        onClick={() => markAsPaid(expense._id)}
                                                        className="flex-1 px-3 sm:px-4 py-2 bg-blue-900 text-white rounded text-sm font-semibold hover:bg-blue-800 transition-all"
                                                    >
                                                        💰 Mark Paid
                                                </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            
                                {expenses.length === 0 && (
                                    <div className="col-span-full text-center py-12 sm:py-16">
                                        <div className="w-16 sm:w-24 h-16 sm:h-24 bg-[#1a202c] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                            <span className="text-2xl sm:text-4xl text-white">🎴</span>
                                        </div>
                                        <h3 className="text-lg sm:text-2xl font-bold text-[#1a202c] mb-2">No Expenses Found</h3>
                                        <p className="text-black text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
                                            {filters?.search || filters?.category || filters?.status || filters?.priority || filters?.department
                                                ? "No expenses match your current filters. Try adjusting your search criteria."
                                                : "Start by adding your first expense to track your organization's spending."}
                                        </p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-900 text-white rounded font-bold text-base sm:text-lg hover:bg-blue-800 transition-all"
                                        >
                                            ➕ Add First Expense
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Professional Analytics View */}
                    {viewMode === 'analytics' && statistics && (
                        <div className="space-y-6 sm:space-y-8">
                            {/* Analytics Header */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-base sm:text-lg">📊</span>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1a202c]">Expense Analytics</h2>
                                    <p className="text-black text-xs sm:text-sm">Comprehensive insights into your expense data</p>
                                </div>
                            </div>

                            {/* Status Breakdown */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="p-4 sm:p-8">
                                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                        <div className="w-6 sm:w-8 h-6 sm:h-8 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs sm:text-sm">📈</span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-[#1a202c]">Status Breakdown</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                        <div className="text-center p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="text-2xl sm:text-3xl font-bold text-[#1a202c] mb-2">{statistics.statusCounts.pending}</div>
                                            <div className="text-black text-sm sm:text-base font-medium">Pending</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                <div className="bg-[#1a202c] h-2 rounded-full" style={{width: `${(statistics.statusCounts.pending / Math.max(expenses.length, 1)) * 100}%`}}></div>
                                            </div>
                                        </div>
                                        <div className="text-center p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="text-2xl sm:text-3xl font-bold text-[#1a202c] mb-2">{statistics.statusCounts.approved}</div>
                                            <div className="text-black text-sm sm:text-base font-medium">Approved</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                <div className="bg-[#1a202c] h-2 rounded-full" style={{width: `${(statistics.statusCounts.approved / Math.max(expenses.length, 1)) * 100}%`}}></div>
                                            </div>
                                        </div>
                                        <div className="text-center p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="text-2xl sm:text-3xl font-bold text-[#1a202c] mb-2">{statistics.statusCounts.rejected}</div>
                                            <div className="text-black text-sm sm:text-base font-medium">Rejected</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                <div className="bg-red-600 h-2 rounded-full" style={{width: `${(statistics.statusCounts.rejected / Math.max(expenses.length, 1)) * 100}%`}}></div>
                                            </div>
                                        </div>
                                        <div className="text-center p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="text-2xl sm:text-3xl font-bold text-[#1a202c] mb-2">{statistics.statusCounts.paid}</div>
                                            <div className="text-black text-sm sm:text-base font-medium">Paid</div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                                <div className="bg-[#1a202c] h-2 rounded-full" style={{width: `${(statistics.statusCounts.paid / Math.max(expenses.length, 1)) * 100}%`}}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            {statistics.categoryBreakdown && Object.keys(statistics.categoryBreakdown).length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="p-4 sm:p-8">
                                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                            <div className="w-6 sm:w-8 h-6 sm:h-8 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                                <span className="text-white text-xs sm:text-sm">📊</span>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold text-[#1a202c]">Category Breakdown</h3>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            {Object.entries(statistics.categoryBreakdown).map(([category, amount]) => (
                                                <div key={category} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 bg-[#1a202c] rounded-full"></div>
                                                        <span className="font-semibold text-black text-sm sm:text-base">{category}</span>
                                                    </div>
                                                    <span className="font-bold text-lg sm:text-xl text-[#1a202c]">৳{Number(amount || 0).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Monthly Trends */}
                            {statistics.monthlyTrends && Object.keys(statistics.monthlyTrends).length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="p-4 sm:p-8">
                                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                            <div className="w-6 sm:w-8 h-6 sm:h-8 bg-[#1a202c] rounded-lg flex items-center justify-center">
                                                <span className="text-white text-xs sm:text-sm">📅</span>
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-bold text-[#1a202c]">Monthly Trends</h3>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            {Object.entries(statistics.monthlyTrends).map(([month, amount]) => (
                                                <div key={month} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 bg-[#1a202c] rounded-full"></div>
                                                        <span className="font-semibold text-black text-sm sm:text-base">{month}</span>
                                                    </div>
                                                    <span className="font-bold text-lg sm:text-xl text-[#1a202c]">৳{Number(amount || 0).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Professional Loading State */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10 rounded-lg">
                            <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 text-center border border-gray-200">
                                <div className="relative mb-4 sm:mb-6">
                                    <div className="w-12 sm:w-16 h-12 sm:h-16 border-4 border-gray-200 rounded-full animate-spin mx-auto"></div>
                                    <div className="absolute inset-0 w-12 sm:w-16 h-12 sm:h-16 border-4 border-transparent border-t-[#1a202c] rounded-full animate-spin mx-auto"></div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-2">Loading Expenses</h3>
                                <p className="text-black text-sm sm:text-base">Please wait while we fetch your data...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpensesManagementPage;