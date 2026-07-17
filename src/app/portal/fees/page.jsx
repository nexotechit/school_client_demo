'use client';
import React, { useState, useEffect, memo, useCallback } from 'react';
import { API_URL } from '../../../../config/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default memo(function StudentFees() {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [error, setError] = useState(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [summary, setSummary] = useState({
        totalPaid: 0,
        totalDue: 0,
        totalAmount: 0
    });

    const fetchStudentFees = useCallback(async (studentId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/fees/student/${studentId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setFees(data.data);
                calculateSummary(data.data);
            } else {
                setError(data.message || 'Failed to fetch fee records');
                setFees([]);
            }
        } catch (error) {
            setError(error.message || 'Failed to connect to server');
            setFees([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Get current student from localStorage
        const userData = localStorage.getItem('user');

        if (userData) {
            const user = JSON.parse(userData);
            setCurrentStudent(user);

            if (user._id) {
                fetchStudentFees(user._id);
            } else {
                setError('User ID not found. Please contact administrator.');
                setLoading(false);
            }
        } else {
            setError('User not logged in. Please login first.');
            setLoading(false);
        }
    }, [fetchStudentFees]);

    const calculateSummary = (feeData) => {
        const summary = feeData.reduce((acc, fee) => {
            acc.totalAmount += parseFloat(fee.totalAmount) || 0;
            acc.totalPaid += parseFloat(fee.paidAmount) || 0;
            acc.totalDue += parseFloat(fee.dueAmount) || 0;
            return acc;
        }, { totalAmount: 0, totalPaid: 0, totalDue: 0 });

        setSummary(summary);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'text-green-600 bg-green-50 border-green-200';
            case 'Partial': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Pending': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Paid': return '✅';
            case 'Partial': return '⏳';
            case 'Pending': return '❌';
            default: return '❓';
        }
    };

    const generatePDF = async (fee) => {
        try {
            setGeneratingPDF(true);
            
            // Create a new jsPDF instance
            const pdf = new jsPDF();
            
            // Set font
            pdf.setFont('helvetica');
            
            // Add border/frame
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.5);
            pdf.rect(10, 10, 190, 277);
            
            // Add inner border for content
            pdf.setLineWidth(0.2);
            pdf.rect(15, 15, 180, 267);
            
            // School Header with professional styling
            pdf.setFontSize(22);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text('SCHOOL MANAGEMENT SYSTEM', 105, 30, { align: 'center' });
            
            // Add underline for header
            pdf.setLineWidth(0.5);
            pdf.line(50, 35, 160, 35);
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PAYMENT RECEIPT', 105, 50, { align: 'center' });
            
            // Receipt details box
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.2);
            pdf.rect(20, 60, 170, 15);
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Receipt No: ${fee.receiptNumber}`, 25, 70);
            pdf.text(`Date: ${formatDate(fee.paymentDate)}`, 140, 70);
            
            // Student Information Section
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('STUDENT INFORMATION', 20, 90);
            
            // Student info box
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.2);
            pdf.rect(20, 95, 170, 25);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Student Name: ${fee.studentName}`, 25, 105);
            pdf.text(`Roll Number: ${fee.rollNumber}`, 25, 115);
            pdf.text(`Class & Section: ${fee.class} - ${fee.section}`, 120, 105);
            pdf.text(`Academic Year: ${fee.academicYear}`, 120, 115);
            
            // Payment Information Section
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PAYMENT DETAILS', 20, 135);
            
            // Payment info box
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.2);
            pdf.rect(20, 140, 170, 20);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Payment Method: ${fee.paymentMethod}`, 25, 150);
            pdf.text(`Payment Status: ${fee.status}`, 120, 150);
            
            if (fee.transactionId) {
                pdf.text(`Transaction ID: ${fee.transactionId}`, 25, 160);
            }
            
            // Fee Breakdown Section
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('FEE BREAKDOWN', 20, 175);
            
            // Fee breakdown table
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.2);
            pdf.rect(20, 180, 170, 40);
            
            // Table headers
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Fee Category', 25, 190);
            pdf.text('Amount', 150, 190);
            
            // Table line
            pdf.line(20, 195, 190, 195);
            
            // Fee items
            let yPosition = 205;
            pdf.setFont('helvetica', 'normal');
            
            if (fee.fees && fee.fees.length > 0) {
                fee.fees.forEach((feeItem, index) => {
                    pdf.text(`${feeItem.feeCategory}`, 25, yPosition);
                    pdf.text(`৳${formatAmount(feeItem.amount)}`, 150, yPosition);
                    yPosition += 8;
                    
                    // Add line between items if not last
                    if (index < fee.fees.length - 1) {
                        pdf.line(20, yPosition - 3, 190, yPosition - 3);
                    }
                });
            }
            
            // Payment Summary Section
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('PAYMENT SUMMARY', 20, 235);
            
            // Summary box
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.2);
            pdf.rect(20, 240, 170, 25);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Total Amount: ৳${formatAmount(fee.totalAmount)}`, 25, 250);
            pdf.text(`Paid Amount: ৳${formatAmount(fee.paidAmount)}`, 25, 258);
            pdf.text(`Due Amount: ৳${formatAmount(fee.dueAmount)}`, 25, 266);
            
            // Remarks Section (if any)
            let remarksY = 275;
            if (fee.remarks) {
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text('REMARKS:', 20, remarksY);
                
                pdf.setFont('helvetica', 'normal');
                const splitRemarks = pdf.splitTextToSize(fee.remarks, 160);
                pdf.text(splitRemarks, 20, remarksY + 8);
                
                remarksY += 20 + (splitRemarks.length * 5);
            }
            
            // Professional Footer
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(100, 100, 100);
            
            const footerY = remarksY + 10;
            pdf.text('This is a computer generated receipt and does not require signature.', 105, footerY, { align: 'center' });
            pdf.text('Generated by School Management System on ' + new Date().toLocaleDateString(), 105, footerY + 5, { align: 'center' });
            
            // Add school contact info
            pdf.setFontSize(7);
            pdf.text('For any queries, please contact school administration.', 105, footerY + 12, { align: 'center' });
            
            // Save the PDF
            pdf.save(`receipt_${fee.receiptNumber}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined || amount === '') return '0';

        // Handle string amounts that might be stored in DB
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : parseFloat(amount);

        if (isNaN(num)) return '0';

        return num.toLocaleString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading fee records...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-3">
            <div className="container mx-auto">
                {/* Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">
                        💰 My Fee Records
                    </h1>
                    <p className="text-gray-600">
                        View your fee payment history and outstanding amounts
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">💵</span>
                            <span className="text-2xl font-bold text-gray-900">৳{formatAmount(summary.totalAmount)}</span>
                        </div>
                        <h3 className="text-gray-900 font-semibold">Total Amount</h3>
                        <p className="text-gray-600 text-sm">All time fees</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">✅</span>
                            <span className="text-2xl font-bold text-green-600">৳{formatAmount(summary.totalPaid)}</span>
                        </div>
                        <h3 className="text-gray-900 font-semibold">Total Paid</h3>
                        <p className="text-gray-600 text-sm">Amount paid</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl">⏳</span>
                            <span className="text-2xl font-bold text-red-600">৳{formatAmount(summary.totalDue)}</span>
                        </div>
                        <h3 className="text-gray-900 font-semibold">Total Due</h3>
                        <p className="text-gray-600 text-sm">Outstanding amount</p>
                    </div>
                </div>

                {/* Fee Records */}
                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Fee Records</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button
                            onClick={() => currentStudent && fetchStudentFees(currentStudent._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : fees.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Fee Records Found</h3>
                        <p className="text-gray-600 mb-4">
                            Your fee records will appear here once payments are processed by the school administration.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                            <h4 className="font-semibold text-blue-900 mb-2">💡 Note for Testing:</h4>
                            <p className="text-sm text-blue-800">
                                If you are testing this feature, fee records need to be created by an administrator through the admin panel or by using the fee management system.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {fees.map((fee) => (
                            <div key={fee._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                    Receipt #{fee.receiptNumber}
                                                </h3>
                                                <p className="text-blue-900 font-medium mb-2">
                                                    {fee.academicYear} - {fee.feeMonth || 'Full Year'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(fee.status)}`}>
                                                    {getStatusIcon(fee.status)} {fee.status}
                                                </span>
                                                <button
                                                    onClick={() => generatePDF(fee)}
                                                    disabled={generatingPDF}
                                                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                                                    title="Download Professional PDF Receipt"
                                                >
                                                    {generatingPDF ? (
                                                        <>
                                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Download PDF
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fee Breakdown */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    ৳{formatAmount(fee.totalAmount)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm text-gray-600 font-medium">Paid Amount</p>
                                                <p className="text-lg font-bold text-green-600">
                                                    ৳{formatAmount(fee.paidAmount)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm text-gray-600 font-medium">Due Amount</p>
                                                <p className="text-lg font-bold text-red-600">
                                                    ৳{formatAmount(fee.dueAmount)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm text-gray-600 font-medium">Payment Date</p>
                                                <p className="text-lg font-bold text-gray-900">{formatDate(fee.paymentDate)}</p>
                                            </div>
                                        </div>

                                        {/* Fee Categories */}
                                        {fee.fees && fee.fees.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Fee Breakdown:</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {fee.fees.map((feeItem, index) => (
                                                        <div key={index} className="flex justify-between items-center bg-gray-50 rounded p-2">
                                                            <span className="text-sm text-gray-700">{feeItem.feeCategory}</span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                ৳{formatAmount(feeItem.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-900">Class:</span>
                                                <p className="text-gray-600">{fee.class} - {fee.section}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">Roll Number:</span>
                                                <p className="text-gray-600">{fee.rollNumber}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900">Payment Method:</span>
                                                <p className="text-gray-600">{fee.paymentMethod}</p>
                                            </div>
                                            {fee.transactionId && (
                                                <div>
                                                    <span className="font-medium text-gray-900">Transaction ID:</span>
                                                    <p className="text-gray-600">{fee.transactionId}</p>
                                                </div>
                                            )}
                                        </div>

                                        {fee.remarks && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-900">
                                                    <strong>Note:</strong> {fee.remarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});