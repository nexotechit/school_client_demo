'use client';

import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../../config/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FeesManagementPage = () => {
    // State management
    const [classes, setClasses] = useState(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']);
    const [sections, setSections] = useState(['A', 'B', 'C', 'D']);
    const [students, setStudents] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);
    const [statistics, setStatistics] = useState(null);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

    const [viewMode, setViewMode] = useState('collection'); // 'collection' or 'records'
    const [collectionMode, setCollectionMode] = useState('bulk'); // 'bulk' or 'individual'
    const [selectedStudents, setSelectedStudents] = useState([]); // For individual mode
    const [selectedFees, setSelectedFees] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [remarks, setRemarks] = useState('');

    const [loading, setLoading] = useState(false);
    const receiptRef = useRef(null);
    const [currentReceipt, setCurrentReceipt] = useState(null);
    const [recordFilter, setRecordFilter] = useState('unpaid'); // 'all', 'paid', 'unpaid'
    const [selectedRecords, setSelectedRecords] = useState([]); // For bulk delete
    const [partialEdit, setPartialEdit] = useState({ recordId: null, amount: '' }); // For partial payment input
    const [reportType, setReportType] = useState('monthly'); // 'daily', 'monthly', 'yearly'
    const [reportStatusFilter, setReportStatusFilter] = useState('all'); // 'all', 'Paid', 'Partial', 'Pending'

    // Fee categories
    const feeCategories = [
        { name: 'Admission Fee', defaultAmount: 5000 },
        { name: 'Monthly Tuition Fee', defaultAmount: 2000 },
        { name: 'Exam Fee', defaultAmount: 500 },
        { name: 'Registration Fee', defaultAmount: 1000 },
        { name: 'Library Fee', defaultAmount: 300 },
        { name: 'Transport Fee', defaultAmount: 1500 },
        { name: 'Sports Fee', defaultAmount: 400 },
        { name: 'Computer Lab Fee', defaultAmount: 600 },
        { name: 'Development Fee', defaultAmount: 800 },
        { name: 'Late Fine', defaultAmount: 100 }
    ];


    // Load classes on mount
    useEffect(() => {
        // Classes are now static
    }, []);

    // Load sections when class changes
    useEffect(() => {
        if (selectedClass) {
            // Sections are now static
        } else {
            setSelectedSection('');
        }
    }, [selectedClass]);

    // Load students when both class and section are selected
    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchStudents();
            fetchFeeRecords();
            fetchStatistics();
        } else {
            setStudents([]);
            setFeeRecords([]);
        }
    }, [selectedClass, selectedSection, academicYear, recordFilter]);

    // Fetch students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/fees/helpers/students?class=${selectedClass}&section=${selectedSection}`);
            const data = await response.json();

            if (data.success) {
                setStudents(data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            Swal.fire('Error', 'Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch fee records
    const fetchFeeRecords = async () => {
        try {
            let statusParam = '';
            if (recordFilter === 'paid') {
                statusParam = 'status=Paid';
            } else if (recordFilter === 'unpaid') {
                statusParam = 'status=Pending,Partial';
            } else if (recordFilter === 'all') {
                statusParam = 'status=Paid,Pending,Partial';
            }

            const response = await fetch(
                `${API_BASE_URL}/fees/class-section?class=${selectedClass}&section=${selectedSection}&academicYear=${academicYear}&${statusParam}`
            );
            const data = await response.json();

            if (data.success) {
                // Sort records by roll number in ascending order
                const sortedRecords = data.data.sort((a, b) => {
                    const rollA = parseInt(a.rollNumber) || 0;
                    const rollB = parseInt(b.rollNumber) || 0;
                    return rollA - rollB;
                });
                setFeeRecords(sortedRecords);
                // Clear selected records when data changes
                setSelectedRecords([]);
            }
        } catch (error) {
            console.error('Error fetching fee records:', error);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/fees/statistics?class=${selectedClass}&section=${selectedSection}&academicYear=${academicYear}`
            );
            const data = await response.json();

            if (data.success) {
                setStatistics(data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    // Select/deselect student for individual collection
    const toggleStudentSelection = (student) => {
        setSelectedStudents(prev => {
            const isSelected = prev.some(s => s._id === student._id);
            if (isSelected) {
                return prev.filter(s => s._id !== student._id);
            } else {
                return [...prev, student];
            }
        });
    };

    // Select all students
    const selectAllStudents = () => {
        setSelectedStudents(students);
    };

    // Deselect all students
    const deselectAllStudents = () => {
        setSelectedStudents([]);
    };

    // Add fee to collection
    const addFee = (category) => {
        Swal.fire({
            title: `Add ${category.name}`,
            html: `
                <input id="fee-amount" class="swal2-input" type="number" placeholder="Amount" value="${category.defaultAmount}" />
                <textarea id="fee-description" class="swal2-textarea" placeholder="Description (optional)"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Add',
            confirmButtonColor: '#3b82f6',
            preConfirm: () => {
                const amount = document.getElementById('fee-amount').value;
                const description = document.getElementById('fee-description').value;

                if (!amount || parseFloat(amount) <= 0) {
                    Swal.showValidationMessage('Please enter a valid amount');
                    return false;
                }

                return {
                    feeCategory: category.name,
                    amount: parseFloat(amount),
                    description: description || ''
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setSelectedFees([...selectedFees, result.value]);
                // Auto-set paid amount to total
                const newTotal = [...selectedFees, result.value].reduce((sum, f) => sum + f.amount, 0);
                setPaidAmount(newTotal.toString());
            }
        });
    };

    // Remove fee from collection
    const removeFee = (index) => {
        const updatedFees = selectedFees.filter((_, i) => i !== index);
        setSelectedFees(updatedFees);
        // Update paid amount
        const newTotal = updatedFees.reduce((sum, f) => sum + f.amount, 0);
        setPaidAmount(newTotal.toString());
    };

    // Calculate totals
    const calculateTotals = () => {
        const total = selectedFees.reduce((sum, fee) => sum + fee.amount, 0);
        const paid = parseFloat(paidAmount) || 0;
        const due = total - paid;

        return {
            total: total.toFixed(2),
            paid: paid.toFixed(2),
            due: due.toFixed(2)
        };
    };

    // Collect fee for selected students (bulk or individual)
    const collectFee = async () => {
        if (selectedFees.length === 0) {
            Swal.fire('Error', 'Please add at least one fee', 'error');
            return;
        }

        const studentsToProcess = collectionMode === 'bulk' ? students : selectedStudents;

        if (studentsToProcess.length === 0) {
            Swal.fire('Error', 'Please select at least one student', 'error');
            return;
        }

        const totals = calculateTotals();

        try {
            setLoading(true);

            // Create fee records for selected students
            const promises = studentsToProcess.map(student => {
                const feeData = {
                    studentId: student._id,
                    studentName: student.name,
                    rollNumber: student.rollNumber,
                    class: selectedClass,
                    section: selectedSection,
                    academicYear,
                    fees: selectedFees,
                    paidAmount: parseFloat(totals.paid),
                    paymentMethod,
                    remarks,
                    collectedBy: 'Admin',
                    status: 'Pending' // Default status
                };

                return fetch(`${API_BASE_URL}/fees`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(feeData)
                });
            });

            const responses = await Promise.all(promises);

            // Check if all succeeded
            const results = await Promise.all(responses.map(r => r.json()));
            const allSuccess = results.every(result => result.success);

            if (allSuccess) {
                Swal.fire('Success!', `Fees collected for ${studentsToProcess.length} student${studentsToProcess.length > 1 ? 's' : ''}!`, 'success');

                // Reset form
                setSelectedFees([]);
                setPaidAmount('');
                setRemarks('');
                setSelectedStudents([]);

                // Refresh data and switch to records view
                fetchFeeRecords();
                fetchStatistics();
                setViewMode('records');
            } else {
                const failedCount = results.filter(r => !r.success).length;
                throw new Error(`${failedCount} fee collections failed`);
            }
        } catch (error) {
            console.error('Error collecting fees:', error);
            Swal.fire('Error', error.message || 'Failed to collect fees', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Show receipt options
    const showReceiptOptions = (receipt) => {
        Swal.fire({
            title: 'Fee Collected!',
            html: `
                <p class="text-lg mb-4">Receipt Number: <strong>${receipt.receiptNumber}</strong></p>
                <p class="text-gray-600">What would you like to do?</p>
            `,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: '🖨️ Print Receipt',
            denyButtonText: '📄 Download PDF',
            cancelButtonText: 'Close',
            confirmButtonColor: '#3b82f6',
            denyButtonColor: '#8b5cf6'
        }).then((result) => {
            if (result.isConfirmed) {
                printReceipt(receipt);
            } else if (result.isDenied) {
                downloadReceiptPDF(receipt);
            }
        });
    };

    // Print receipt
    const printReceipt = (receipt) => {
        const receiptHTML = generateReceiptHTML(receipt);
        const printWindow = window.open('', '_blank');

        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    // Download receipt as PDF
    const downloadReceiptPDF = async (receipt) => {
        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Create temporary receipt element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = generateReceiptContentHTML(receipt);
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '800px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.padding = '40px';
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Receipt_${receipt.receiptNumber}.pdf`);

            Swal.close();
            Swal.fire('Success', 'PDF downloaded successfully', 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            Swal.fire('Error', 'Failed to generate PDF', 'error');
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    // Generate receipt content HTML
    const generateReceiptContentHTML = (receipt) => {
        const totals = {
            total: receipt.totalAmount.toFixed(2),
            paid: receipt.paidAmount.toFixed(2),
            due: receipt.dueAmount.toFixed(2)
        };

        return `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #111;">
                <!-- Header -->
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #111; margin: 0; font-size: 28px;">School Management System</h1>
                    <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">Fee Payment Receipt</p>
                </div>

                <!-- Receipt Info -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                    <div>
                        <p style="margin: 5px 0;"><strong>Receipt No:</strong> ${receipt.receiptNumber}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(receipt.paymentDate).toLocaleDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Academic Year:</strong> ${receipt.academicYear}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${receipt.paymentMethod}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> 
                            <span style="background: #f3f4f6; color: #111; padding: 4px 8px; border-radius: 6px; font-size: 12px; border:1px solid #ddd;">${receipt.status}</span>
                        </p>
                    </div>
                </div>

                <!-- Student Info -->
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Student Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <p style="margin: 5px 0;"><strong>Name:</strong> ${receipt.studentName}</p>
                        <p style="margin: 5px 0;"><strong>Roll Number:</strong> ${receipt.rollNumber}</p>
                        <p style="margin: 5px 0;"><strong>Class:</strong> ${receipt.class}</p>
                        <p style="margin: 5px 0;"><strong>Section:</strong> ${receipt.section}</p>
                    </div>
                </div>

                <!-- Fee Details -->
                <div style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Fee Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom:1px solid #ddd; color: #111; font-weight:700;">
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Fee Category</th>
                                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
                                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount (৳)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receipt.fees.map((fee, index) => `<tr style="background: ${index % 2 === 0 ? '#f9fafb' : 'white'};"><td style="padding: 12px; border: 1px solid #ddd;">${fee.feeCategory}</td><td style="padding: 12px; border: 1px solid #ddd;">${fee.description || '-'}</td><td style="padding: 12px; text-align: right; border: 1px solid #ddd;">${fee.amount.toFixed(2)}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Summary -->
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px;">Total Amount:</span>
                        <span style="font-size: 16px; font-weight: bold;">৳ ${totals.total}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 16px; color: #111;">Paid Amount:</span>
                        <span style="font-size: 16px; font-weight: bold; color: #111;">৳ ${totals.paid}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #d1d5db;">
                        <span style="font-size: 18px; font-weight: bold; color: #111;">Due Amount:</span>
                        <span style="font-size: 18px; font-weight: bold; color: #111;">৳ ${totals.due}</span>
                    </div>
                </div>

                ${receipt.remarks ? `
                    <div style="margin-bottom: 30px;">
                        <p style="margin: 5px 0;"><strong>Remarks:</strong> ${receipt.remarks}</p>
                    </div>
                ` : ''}

                <!-- Footer -->
                <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Collected By: ${receipt.collectedBy || 'Admin'}</p>
                            <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">This is a computer-generated receipt</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="border-top: 1px solid #000; padding-top: 5px; width: 200px;">
                                <p style="margin: 0; font-size: 12px;">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // Generate full receipt HTML for printing
    const generateReceiptHTML = (receipt) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fee Receipt - ${receipt.receiptNumber}</title>
                <style>
                    body { margin: 0; padding: 20px; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                ${generateReceiptContentHTML(receipt)}
            </body>
            </html>
        `;
    };

    // View existing receipt
    const viewReceipt = (receipt) => {
        setCurrentReceipt(receipt);
        showReceiptOptions(receipt);
    };

    // Select/deselect fee record for bulk delete
    const toggleRecordSelection = (record) => {
        setSelectedRecords(prev => {
            const isSelected = prev.some(r => r._id === record._id);
            if (isSelected) {
                return prev.filter(r => r._id !== record._id);
            } else {
                return [...prev, record];
            }
        });
    };

    // Select all records
    const selectAllRecords = () => {
        setSelectedRecords(feeRecords);
    };

    // Deselect all records
    const deselectAllRecords = () => {
        setSelectedRecords([]);
    };

    // Download comprehensive fee report as PDF
    const downloadReport = async () => {
        if (feeRecords.length === 0) {
            Swal.fire('Error', 'No records to generate report', 'error');
            return;
        }

        Swal.fire({ title: 'Generating Report...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        // --- Filter records by status ---
        const filteredRecords = reportStatusFilter === 'all'
            ? feeRecords
            : feeRecords.filter(r => r.status === reportStatusFilter);

        if (filteredRecords.length === 0) {
            Swal.close();
            Swal.fire('No Data', `No ${reportStatusFilter} records found.`, 'warning');
            return;
        }

        const reportTypeLabel = reportType === 'daily' ? 'Daily' : reportType === 'monthly' ? 'Monthly' : 'Yearly';
        const statusLabel = reportStatusFilter === 'all' ? 'All' : reportStatusFilter;

        // --- Compute stats ---
        const totalExpected = filteredRecords.reduce((s, r) => s + (r.totalAmount || 0), 0);
        const totalCollectedAmt = filteredRecords.reduce((s, r) => s + (r.status === 'Pending' ? 0 : (r.paidAmount || 0)), 0);
        const totalDueAmt = filteredRecords.reduce((s, r) => s + (r.status === 'Pending' ? (r.totalAmount || 0) : Math.max(0, (r.totalAmount || 0) - (r.paidAmount || 0))), 0);
        const paidCount = filteredRecords.filter(r => r.status === 'Paid').length;
        const partialCount = filteredRecords.filter(r => r.status === 'Partial').length;
        const pendingCount = filteredRecords.filter(r => r.status === 'Pending').length;
        const uniqueStudents = [...new Set(filteredRecords.map(r => r.studentName))].length;

        // --- Group by year ---
        const byYear = {};
        filteredRecords.forEach(r => {
            const y = new Date(r.paymentDate).getFullYear();
            if (!byYear[y]) byYear[y] = { total: 0, collected: 0, due: 0, paid: 0, partial: 0, pending: 0, count: 0 };
            byYear[y].count++;
            byYear[y].total += r.totalAmount || 0;
            byYear[y].collected += r.status === 'Pending' ? 0 : (r.paidAmount || 0);
            byYear[y].due += r.status === 'Pending' ? (r.totalAmount || 0) : Math.max(0, (r.totalAmount || 0) - (r.paidAmount || 0));
            if (r.status === 'Paid') byYear[y].paid++;
            else if (r.status === 'Partial') byYear[y].partial++;
            else byYear[y].pending++;
        });

        // --- Group by month ---
        const byMonth = {};
        filteredRecords.forEach(r => {
            const d = new Date(r.paymentDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!byMonth[key]) byMonth[key] = { label, total: 0, collected: 0, due: 0, paid: 0, partial: 0, pending: 0, count: 0 };
            byMonth[key].count++;
            byMonth[key].total += r.totalAmount || 0;
            byMonth[key].collected += r.status === 'Pending' ? 0 : (r.paidAmount || 0);
            byMonth[key].due += r.status === 'Pending' ? (r.totalAmount || 0) : Math.max(0, (r.totalAmount || 0) - (r.paidAmount || 0));
            if (r.status === 'Paid') byMonth[key].paid++;
            else if (r.status === 'Partial') byMonth[key].partial++;
            else byMonth[key].pending++;
        });
        const sortedMonths = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));

        // --- Group by day (last 30 days only) ---
        const byDay = {};
        filteredRecords.forEach(r => {
            const d = new Date(r.paymentDate);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            if (!byDay[key]) byDay[key] = { label, total: 0, collected: 0, due: 0, paid: 0, partial: 0, pending: 0, count: 0 };
            byDay[key].count++;
            byDay[key].total += r.totalAmount || 0;
            byDay[key].collected += r.status === 'Pending' ? 0 : (r.paidAmount || 0);
            byDay[key].due += r.status === 'Pending' ? (r.totalAmount || 0) : Math.max(0, (r.totalAmount || 0) - (r.paidAmount || 0));
            if (r.status === 'Paid') byDay[key].paid++;
            else if (r.status === 'Partial') byDay[key].partial++;
            else byDay[key].pending++;
        });
        const sortedDays = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 30);

        const tableRowStyle = (i) => `background:${i % 2 === 0 ? '#f9fafb' : '#fff'};`;
        const statusBadge = (paid, partial, pending) =>
            '<span style="background:#166534;color:#fff;padding:2px 7px;border-radius:10px;font-size:11px;margin-right:3px">' + paid + ' Paid</span>' +
            '<span style="background:#92400e;color:#fff;padding:2px 7px;border-radius:10px;font-size:11px;margin-right:3px">' + partial + ' Partial</span>' +
            '<span style="background:#6b7280;color:#fff;padding:2px 7px;border-radius:10px;font-size:11px">' + pending + ' Pending</span>';

        const breakdownCols = '<thead><tr style="background:#1a202c;color:#fff">' +
            '<th style="padding:10px 12px;text-align:left">Period</th>' +
            '<th style="padding:10px 12px;text-align:center">Records</th>' +
            '<th style="padding:10px 12px;text-align:center">Status</th>' +
            '<th style="padding:10px 12px;text-align:right">Expected (&#2547;)</th>' +
            '<th style="padding:10px 12px;text-align:right">Collected (&#2547;)</th>' +
            '<th style="padding:10px 12px;text-align:right">Due (&#2547;)</th>' +
            '</tr></thead>';

        const buildBreakdownRows = (entries) => entries.map(([, d], i) =>
            '<tr style="' + tableRowStyle(i) + '">' +
            '<td style="padding:9px 12px;font-weight:600">' + d.label + '</td>' +
            '<td style="padding:9px 12px;text-align:center">' + d.count + '</td>' +
            '<td style="padding:9px 12px;text-align:center">' + statusBadge(d.paid, d.partial, d.pending) + '</td>' +
            '<td style="padding:9px 12px;text-align:right">&#2547;' + d.total.toFixed(2) + '</td>' +
            '<td style="padding:9px 12px;text-align:right;color:#15803d;font-weight:600">&#2547;' + d.collected.toFixed(2) + '</td>' +
            '<td style="padding:9px 12px;text-align:right;color:#dc2626;font-weight:600">&#2547;' + d.due.toFixed(2) + '</td>' +
            '</tr>'
        ).join('');

        const yearlySection = reportType === 'yearly'
            ? '<h3 style="margin:0 0 10px;font-size:16px;color:#111">Yearly Breakdown</h3>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:13px">' +
            breakdownCols + '<tbody>' +
            buildBreakdownRows(Object.entries(byYear).sort((a, b) => b[0] - a[0]).map(([yr, d]) => [yr, { ...d, label: yr }])) +
            '</tbody></table>'
            : '';

        const monthlySection = reportType === 'monthly'
            ? '<h3 style="margin:0 0 10px;font-size:16px;color:#111">Monthly Breakdown</h3>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:13px">' +
            breakdownCols + '<tbody>' +
            buildBreakdownRows(sortedMonths) +
            '</tbody></table>'
            : '';

        const dailySection = reportType === 'daily'
            ? '<h3 style="margin:0 0 10px;font-size:16px;color:#111">Daily Breakdown (Recent ' + sortedDays.length + ' Days)</h3>' +
            '<table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:13px">' +
            breakdownCols + '<tbody>' +
            buildBreakdownRows(sortedDays) +
            '</tbody></table>'
            : '';

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:30px;background:#fff;color:#1a202c">

          <!-- Header -->
          <div style="text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:18px;margin-bottom:24px">
            <h1 style="margin:0;font-size:28px;color:#111">School Management System</h1>
            <h2 style="margin:6px 0 0;font-size:18px;color:#111;font-weight:500">Fee Collection Report — ${reportTypeLabel} | Status: ${statusLabel}</h2>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Class: ${selectedClass} &nbsp;|&nbsp; Section: ${selectedSection} &nbsp;|&nbsp; Year: ${academicYear}</p>
          </div>

          <!-- Summary Cards -->
          <h3 style="margin:0 0 12px;font-size:16px;color:#111">Overall Summary</h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px">
            <div style="background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;padding:14px;text-align:center">
              <p style="margin:0;font-size:12px;color:#6b7280">Total Students</p>
              <p style="margin:4px 0 0;font-size:26px;font-weight:700;color:#1a202c">${uniqueStudents}</p>
            </div>
            <div style="background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;padding:14px;text-align:center">
              <p style="margin:0;font-size:12px;color:#6b7280">Total Records</p>
              <p style="margin:4px 0 0;font-size:26px;font-weight:700;color:#1a202c">${filteredRecords.length}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#6b7280">${statusBadge(paidCount, partialCount, pendingCount)}</p>
            </div>
            <div style="background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;padding:14px;text-align:center">
              <p style="margin:0;font-size:12px;color:#6b7280">Total Expected (&#2547;)</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#1a202c">&#2547;${totalExpected.toFixed(2)}</p>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center">
              <p style="margin:0;font-size:12px;color:#111">&#2547; Total Collected</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#111">&#2547;${totalCollectedAmt.toFixed(2)}</p>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center">
              <p style="margin:0;font-size:12px;color:#111">&#2547; Total Due</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#111">&#2547;${totalDueAmt.toFixed(2)}</p>
            </div>
            <div style="background:#f3f4f6;border:1px solid #d1d5db;border-radius:8px;padding:14px;text-align:center">
              <p style="margin:0;font-size:12px;color:#6b7280">Collection Rate</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#1a202c">${totalExpected > 0 ? ((totalCollectedAmt / totalExpected) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>

          <!-- Breakdown Section -->
          ${yearlySection}${monthlySection}${dailySection}

          <!-- Student-wise Detail -->
          <h3 style="margin:0 0 10px;font-size:16px;color:#1a202c">&#128101; Student-wise Fee Detail</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="border-bottom:1px solid #ddd;color:#111;font-weight:700">
                <th style="padding:9px 10px;text-align:left">#</th>
                <th style="padding:9px 10px;text-align:left">Student</th>
                <th style="padding:9px 10px;text-align:left">Roll</th>
                <th style="padding:9px 10px;text-align:left">Receipt No</th>
                <th style="padding:9px 10px;text-align:left">Date</th>
                <th style="padding:9px 10px;text-align:right">Total (&#2547;)</th>
                <th style="padding:9px 10px;text-align:right">Paid (&#2547;)</th>
                <th style="padding:9px 10px;text-align:right">Due (&#2547;)</th>
                <th style="padding:9px 10px;text-align:center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map((r, i) => {
            const due = r.status === 'Pending' ? r.totalAmount : Math.max(0, r.totalAmount - r.paidAmount);
            const paid = r.status === 'Pending' ? 0 : r.paidAmount;
            const color = '#111';
            const bg = r.status === 'Paid' ? '#e6e6e6' : r.status === 'Partial' ? '#f5f5f5' : '#f8f8f8';
            return `<tr style="${tableRowStyle(i)}">
                  <td style="padding:8px 10px">${i + 1}</td>
                  <td style="padding:8px 10px;font-weight:600">${r.studentName}</td>
                  <td style="padding:8px 10px">${r.rollNumber}</td>
                  <td style="padding:8px 10px;font-family:monospace">${r.receiptNumber}</td>
                  <td style="padding:8px 10px">${new Date(r.paymentDate).toLocaleDateString()}</td>
                  <td style="padding:8px 10px;text-align:right">&#2547;${r.totalAmount.toFixed(2)}</td>
                  <td style="padding:8px 10px;text-align:right;color:#15803d;font-weight:600">&#2547;${paid.toFixed(2)}</td>
                  <td style="padding:8px 10px;text-align:right;color:#dc2626;font-weight:600">&#2547;${due.toFixed(2)}</td>
                  <td style="padding:8px 10px;text-align:center"><span style="background:${bg};color:${color};padding:2px 9px;border-radius:10px;font-size:11px;font-weight:600">${r.status}</span></td>
                </tr>`;
        }).join('')}
            </tbody>
          </table>

          <!-- Footer -->
          <div style="margin-top:30px;padding-top:14px;border-top:2px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af">
            <span>School Management System &mdash; Confidential</span>
            <span>Generated on ${new Date().toLocaleString()}</span>
          </div>
        </div>`;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = '950px';
        tempDiv.style.backgroundColor = 'white';
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv, { scale: 1.5, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let y = 0;
            let remaining = imgHeight;
            let first = true;
            while (remaining > 0) {
                if (!first) pdf.addPage();
                const sliceHeight = Math.min(pageHeight, remaining);
                pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight);
                y += pageHeight;
                remaining -= pageHeight;
                first = false;
            }
            pdf.save(`FeeReport_${selectedClass}_${selectedSection}_${academicYear}_${Date.now()}.pdf`);
            Swal.close();
            Swal.fire('Success', 'Report downloaded successfully!', 'success');
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Failed to generate report', 'error');
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    // Handle status dropdown change
    const handleStatusChange = (record, newStatus) => {
        if (newStatus === 'Partial') {
            setPartialEdit({ recordId: record._id, amount: record.paidAmount?.toString() || '' });
        } else {
            setPartialEdit({ recordId: null, amount: '' });
            updateFeeStatus(record._id, newStatus, null);
        }
    };

    // Update fee status
    const updateFeeStatus = async (id, newStatus, newPaidAmount) => {
        try {
            const body = { status: newStatus };
            if (newStatus === 'Partial' && newPaidAmount !== null && newPaidAmount !== '') {
                const paid = parseFloat(newPaidAmount);
                if (isNaN(paid) || paid <= 0) {
                    Swal.fire('Error', 'Please enter a valid paid amount', 'error');
                    return;
                }
                body.paidAmount = paid;
            }
            const response = await fetch(`${API_BASE_URL}/fees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (data.success) {
                setFeeRecords(prev =>
                    prev.map(r => r._id === id ? { ...r, status: newStatus, ...(body.paidAmount !== undefined ? { paidAmount: body.paidAmount, dueAmount: r.totalAmount - body.paidAmount } : {}) } : r)
                );
                setPartialEdit({ recordId: null, amount: '' });
                fetchStatistics();
            } else {
                Swal.fire('Error', data.message || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error updating fee status:', error);
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    // Delete selected records
    const deleteSelectedRecords = async () => {
        if (selectedRecords.length === 0) {
            Swal.fire('Error', 'Please select at least one record to delete', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selectedRecords.length} fee record${selectedRecords.length > 1 ? 's' : ''}. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setLoading(true);

            // Delete selected records
            const promises = selectedRecords.map(record =>
                fetch(`${API_BASE_URL}/fees/${record._id}`, {
                    method: 'DELETE'
                })
            );

            const responses = await Promise.all(promises);

            // Check if all succeeded
            const results = await Promise.all(responses.map(r => r.json()));
            const allSuccess = results.every(result => result.success);

            if (allSuccess) {
                Swal.fire('Success!', `${selectedRecords.length} record${selectedRecords.length > 1 ? 's' : ''} deleted successfully!`, 'success');

                // Reset selection and refresh data
                setSelectedRecords([]);
                fetchFeeRecords();
                fetchStatistics();
            } else {
                const failedCount = results.filter(r => !r.success).length;
                throw new Error(`${failedCount} deletions failed`);
            }
        } catch (error) {
            console.error('Error deleting records:', error);
            Swal.fire('Error', error.message || 'Failed to delete records', 'error');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
            <div className="container mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Header */}
                <div className="border-b border-gray-200 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c]">
                                Fees Management System
                            </h1>
                            <p className="text-black text-sm sm:text-base mt-1">Professional fee collection and receipt management</p>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            <button
                                onClick={() => setViewMode('collection')}
                                className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${viewMode === 'collection'
                                        ? 'bg-blue-900 text-white border-b-2 border-blue-900'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Fee Collection
                            </button>
                            <button
                                onClick={() => setViewMode('records')}
                                className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all ${viewMode === 'records'
                                        ? 'bg-blue-900 text-white border-b-2 border-blue-900'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Fee Records
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-4 sm:mb-6">Selection Criteria</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {/* Class Selection */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                            >
                                <option value="">Select Class</option>
                                {classes.map((cls, index) => (
                                    <option key={index} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>

                        {/* Section Selection */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Section</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                disabled={!selectedClass}
                            >
                                <option value="">Select Section</option>
                                {sections.map((section, index) => (
                                    <option key={index} value={section}>{section}</option>
                                ))}
                            </select>
                        </div>

                        {/* Academic Year */}
                        <div>
                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Academic Year</label>
                            <input
                                type="text"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                placeholder="2026"
                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
                        <div className="bg-white border border-gray-300 rounded p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-black text-xs sm:text-sm">Total Collected</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c] mt-2">৳{statistics.totalCollected.toLocaleString()}</p>
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-5xl opacity-20">💵</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-black text-xs sm:text-sm">মোট প্রাপ্য (Expected)</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c] mt-2">৳{(statistics.totalAmount ?? (statistics.totalCollected + statistics.totalDue)).toLocaleString()}</p>
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-5xl opacity-20">📋</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-black text-xs sm:text-sm">Total Due</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c] mt-2">৳{feeRecords.reduce((sum, r) => sum + (r.status === 'Pending' ? (r.totalAmount || 0) : Math.max(0, (r.totalAmount || 0) - (r.paidAmount || 0))), 0).toLocaleString()}</p>
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-5xl opacity-20">⚠️</div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 rounded p-3 sm:p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-black text-xs sm:text-sm">Total Records</p>
                                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a202c] mt-2">{statistics.totalRecords}</p>
                                </div>
                                <div className="text-2xl sm:text-3xl lg:text-5xl opacity-20">📊</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Fee Collection Mode */}
                {viewMode === 'collection' && selectedClass && selectedSection && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 lg:p-6">
                        {/* Students Info */}
                        <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                                <h2 className="text-lg sm:text-xl font-bold text-[#1a202c]">Students ({students.length})</h2>
                                {collectionMode === 'individual' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAllStudents}
                                            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold text-sm"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={deselectAllStudents}
                                            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-all font-semibold text-sm"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                                <div className="space-y-2 sm:space-y-3">
                                    {students.map((student) => (
                                        <div
                                            key={student._id}
                                            className={`p-3 sm:p-4 rounded border cursor-pointer transition-all ${collectionMode === 'bulk'
                                                    ? 'border-gray-300 bg-gray-50'
                                                    : selectedStudents.some(s => s._id === student._id)
                                                        ? 'border-[#1a202c] bg-gray-100'
                                                        : 'border-gray-300 hover:border-[#1a202c] hover:bg-gray-50'
                                                }`}
                                            onClick={() => collectionMode === 'individual' && toggleStudentSelection(student)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-black text-sm sm:text-base">{student.name}</p>
                                                    <p className="text-xs sm:text-sm text-black">Roll: {student.rollNumber}</p>
                                                </div>
                                                {collectionMode === 'bulk' ? (
                                                    <div className="text-[#1a202c] text-xl sm:text-2xl">✓</div>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStudents.some(s => s._id === student._id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            toggleStudentSelection(student);
                                                        }}
                                                        className="w-4 h-4 border-gray-300 rounded focus:ring-[#1a202c]"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Fee Collection Form */}
                        <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                            <h2 className="text-lg sm:text-xl font-bold text-[#1a202c] mb-4 sm:mb-6">Fee Collection</h2>

                            <div className="space-y-4 sm:space-y-6">
                                {/* Collection Mode Selection */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-black mb-2 sm:mb-3">Collection Mode</label>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="bulk"
                                                checked={collectionMode === 'bulk'}
                                                onChange={(e) => {
                                                    setCollectionMode(e.target.value);
                                                    setSelectedStudents([]);
                                                }}
                                                className="mr-2 border-gray-300 focus:ring-[#1a202c]"
                                            />
                                            <span className="text-xs sm:text-sm font-medium text-black">Bulk Collection (All Students)</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="individual"
                                                checked={collectionMode === 'individual'}
                                                onChange={(e) => {
                                                    setCollectionMode(e.target.value);
                                                    setSelectedStudents([]);
                                                }}
                                                className="mr-2 border-gray-300 focus:ring-[#1a202c]"
                                            />
                                            <span className="text-xs sm:text-sm font-medium text-black">Individual Selection</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Class/Section Info */}
                                <div className="bg-gray-50 border border-gray-300 p-3 sm:p-4 rounded">
                                    <p className="font-semibold text-[#1a202c] text-sm sm:text-base">
                                        {collectionMode === 'bulk' ? 'Bulk Fee Collection' : 'Individual Fee Collection'}
                                    </p>
                                    <p className="text-xs sm:text-sm text-black mt-1">
                                        Class: {selectedClass} | Section: {selectedSection} |
                                        {collectionMode === 'bulk'
                                            ? ` Students: ${students.length}`
                                            : ` Selected: ${selectedStudents.length}/${students.length}`
                                        }
                                    </p>
                                </div>

                                {/* Fee Categories */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-black mb-2 sm:mb-3">Add Fees</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {feeCategories.map((category, index) => (
                                            <button
                                                key={index}
                                                onClick={() => addFee(category)}
                                                className="px-3 sm:px-4 py-2 bg-blue-900 text-white rounded text-sm font-semibold hover:bg-blue-800 transition-all"
                                            >
                                                + {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedFees.length > 0 ? (
                                    <>
                                        {/* Selected Fees */}
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-2 sm:mb-3">Selected Fees</label>
                                            <div className="space-y-2">
                                                {selectedFees.map((fee, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                                                        <div>
                                                            <p className="font-semibold text-sm text-black">{fee.feeCategory}</p>
                                                            {fee.description && (
                                                                <p className="text-xs text-black">{fee.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-black">৳{fee.amount}</span>
                                                            <button
                                                                onClick={() => removeFee(index)}
                                                                className="text-red-600 hover:text-red-800 font-bold"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Payment Method</label>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Card">Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Online">Online</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Paid Amount (৳)</label>
                                            <input
                                                type="number"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                placeholder="Enter amount"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-black mb-1 sm:mb-2">Remarks (Optional)</label>
                                            <textarea
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                                rows="2"
                                                placeholder="Add any remarks..."
                                            ></textarea>
                                        </div>

                                        {/* Summary */}
                                        <div className="bg-gray-50 border border-gray-300 p-3 sm:p-4 rounded">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-semibold text-sm text-black">Total Amount:</span>
                                                <span className="font-bold text-sm text-black">৳{calculateTotals().total}</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="font-semibold text-sm text-black">Paid Amount:</span>
                                                <span className="font-bold text-sm text-black">৳{calculateTotals().paid}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-gray-300">
                                                <span className="font-semibold text-sm text-black">Due Amount:</span>
                                                <span className="font-bold text-sm text-black">৳{calculateTotals().due}</span>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={collectFee}
                                            disabled={loading}
                                            className="w-full px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-4 bg-blue-900 text-white rounded font-semibold text-sm sm:text-base lg:text-lg hover:bg-blue-800 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : `Collect Fees for ${collectionMode === 'bulk'
                                                    ? `${students.length} Students`
                                                    : `${selectedStudents.length} Selected Student${selectedStudents.length !== 1 ? 's' : ''}`
                                                }`}
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-6 sm:py-8 lg:py-12">
                                        <div className="text-3xl sm:text-4xl lg:text-5xl mb-4">💰</div>
                                        <p className="text-black text-sm sm:text-base lg:text-lg">
                                            {collectionMode === 'bulk'
                                                ? 'Add fees to collect for all students'
                                                : 'Add fees and select students to collect fees'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Fee Records Mode */}
                {viewMode === 'records' && selectedClass && selectedSection && (
                    <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-[#1a202c]">Fee Records ({feeRecords.length})</h2>
                                {statistics && (
                                    <p className="text-xs sm:text-sm text-black mt-1">
                                        Total: {statistics.totalRecords} | Paid: {statistics.paidCount} | Unpaid: {statistics.totalRecords - statistics.paidCount}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <select
                                    value={reportStatusFilter}
                                    onChange={(e) => setReportStatusFilter(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Pending">Pending</option>
                                </select>
                                <button
                                    onClick={downloadReport}
                                    disabled={loading || feeRecords.length === 0}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-700 text-white rounded text-sm font-semibold hover:bg-green-800 transition-all disabled:opacity-50"
                                >
                                    📊 Download Report
                                </button>
                                {selectedRecords.length > 0 && (
                                    <button
                                        onClick={deleteSelectedRecords}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                                    >
                                        🗑️ Delete ({selectedRecords.length})
                                    </button>
                                )}
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-black mb-1">Filter Records</label>
                                    <select
                                        value={recordFilter}
                                        onChange={(e) => setRecordFilter(e.target.value)}
                                        className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] focus:border-[#1a202c]"
                                    >
                                        <option value="all">All Records</option>
                                        <option value="paid">Paid Only</option>
                                        <option value="unpaid">Unpaid Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {feeRecords.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectAllRecords}
                                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-900 text-white rounded text-sm font-semibold hover:bg-blue-800 transition-all"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={deselectAllRecords}
                                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-900 text-white rounded text-sm font-semibold hover:bg-blue-800 transition-all"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                                <span className="text-xs sm:text-sm text-black">
                                    {selectedRecords.length} of {feeRecords.length} selected
                                </span>
                            </div>
                        )}

                        {feeRecords.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                                <div className="bg-gray-50 border border-gray-200 rounded p-3 sm:p-4">
                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">মোট প্রাপ্য (Expected)</p>
                                    <p className="text-lg sm:text-xl font-bold text-[#1a202c] mt-1">
                                        ৳{feeRecords.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{feeRecords.length} records</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-3 sm:p-4">
                                    <p className="text-xs sm:text-sm text-green-600 font-medium">মোট পরিশোধিত (Collected)</p>
                                    <p className="text-lg sm:text-xl font-bold text-green-700 mt-1">
                                        ৳{feeRecords.reduce((sum, r) => sum + (r.status === 'Pending' ? 0 : (r.paidAmount || 0)), 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-green-500 mt-1">{feeRecords.filter(r => r.status === 'Paid').length} paid</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded p-3 sm:p-4">
                                    <p className="text-xs sm:text-sm text-red-500 font-medium">মোট বকেয়া (Due)</p>
                                    <p className="text-lg sm:text-xl font-bold text-red-600 mt-1">
                                        ৳{feeRecords.reduce((sum, r) => sum + (r.status === 'Pending' ? (r.totalAmount || 0) : Math.max(0, (r.totalAmount || 0) - (r.paidAmount || 0))), 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-red-400 mt-1">{feeRecords.filter(r => r.status !== 'Paid').length} unpaid</p>
                                </div>
                            </div>
                        )}

                        {feeRecords.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs sm:text-sm">
                                    <thead>
                                        <tr className="bg-[#1a202c] text-white">
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRecords.length === feeRecords.length && feeRecords.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            selectAllRecords();
                                                        } else {
                                                            deselectAllRecords();
                                                        }
                                                    }}
                                                    className="w-3 h-3 sm:w-4 sm:h-4 border-gray-300 rounded focus:ring-white"
                                                />
                                            </th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left">Receipt No</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left">Date</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left">Student</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-left">Roll</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right">Total (৳)</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right">Paid (৳)</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right">Due (৳)</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center">Status</th>
                                            <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {feeRecords.map((record, index) => (
                                            <tr key={index} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${selectedRecords.some(r => r._id === record._id) ? 'bg-gray-100' : ''
                                                }`}>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRecords.some(r => r._id === record._id)}
                                                        onChange={() => toggleRecordSelection(record)}
                                                        className="w-3 h-3 sm:w-4 sm:h-4 border-gray-300 rounded focus:ring-[#1a202c]"
                                                    />
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm text-black">{record.receiptNumber}</td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm text-black">{new Date(record.paymentDate).toLocaleDateString()}</td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-black">{record.studentName}</td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-black">{record.rollNumber}</td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right font-semibold text-black">{record.totalAmount.toFixed(2)}</td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right font-semibold text-black">{record.status === 'Pending' ? (0).toFixed(2) : record.paidAmount.toFixed(2)}</td>
                                                <td className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right font-semibold ${record.status === 'Pending' ? 'text-red-600' : (record.totalAmount - record.paidAmount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {record.status === 'Pending' ? record.totalAmount.toFixed(2) : Math.max(0, record.totalAmount - record.paidAmount).toFixed(2)}
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center">
                                                    <select
                                                        value={record.status}
                                                        onChange={(e) => handleStatusChange(record, e.target.value)}
                                                        className={`px-2 sm:px-3 py-1 rounded text-xs font-bold border-0 ${record.status === 'Paid' ? 'bg-[#1a202c] text-white' :
                                                                record.status === 'Partial' ? 'bg-gray-600 text-white' :
                                                                    record.status === 'Pending' ? 'bg-gray-400 text-white' :
                                                                        'bg-gray-300 text-black'
                                                            }`}
                                                    >
                                                        <option value="Paid">Paid</option>
                                                        <option value="Partial">Partial</option>
                                                        <option value="Pending">Pending</option>
                                                    </select>
                                                    {partialEdit.recordId === record._id && (
                                                        <div className="mt-2 flex flex-col gap-1 items-center">
                                                            <input
                                                                type="number"
                                                                value={partialEdit.amount}
                                                                onChange={(e) => setPartialEdit(prev => ({ ...prev, amount: e.target.value }))}
                                                                placeholder="Paid amount"
                                                                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#1a202c] text-black"
                                                                min="0"
                                                                step="0.01"
                                                                autoFocus
                                                            />
                                                            {partialEdit.amount !== '' && (
                                                                <div className="text-xs font-semibold text-red-600">
                                                                    Due: ৳{Math.max(0, record.totalAmount - parseFloat(partialEdit.amount || 0)).toFixed(2)}
                                                                </div>
                                                            )}
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => updateFeeStatus(record._id, 'Partial', partialEdit.amount)}
                                                                    className="px-2 py-1 bg-blue-900 text-white rounded text-xs font-semibold hover:bg-blue-800 transition-all"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setPartialEdit({ recordId: null, amount: '' })}
                                                                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs font-semibold hover:bg-gray-500 transition-all"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center">
                                                    <button
                                                        onClick={() => viewReceipt(record)}
                                                        className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-900 text-white rounded text-xs sm:text-sm font-semibold hover:bg-blue-800 transition-all"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 sm:py-12 lg:py-16">
                                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">📋</div>
                                <p className="text-black text-sm sm:text-base lg:text-lg">No fee records found for this class and section</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {(!selectedClass || !selectedSection) && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 text-center">
                        <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🎯</div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Get Started</h3>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Select class and section to manage fees</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeesManagementPage;