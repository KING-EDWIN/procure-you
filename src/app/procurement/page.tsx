"use client";

import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useWorkflow } from "../workflow-context";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Add interfaces for forms and history
interface FormHistoryEntry {
  role: string;
  date: string;
  action: string;
  signature?: string;
}
interface WorkflowForm {
  id: number;
  title: string;
  type: string;
  status: string;
  currentRole: string;
  created: string;
  data: {
    department?: string;
    requestor?: string;
    lineItems?: PaymentLineItem[];
    [key: string]: any;
  };
  history: FormHistoryEntry[];
}

// --- DEMO DATA ---
const demoPayments = [
  {
    id: 1,
    title: "Membership Cards Payment",
    status: "Pending General Manager Approval",
    created: "2025-06-13",
    requestor: "Nwesige Joann",
    department: "Maintenance/IT",
    needBy: "2025-06-20",
    subject: "Membership Cards",
    comments: "",
    signature: null as File | null,
    lineItems: [
      { quantity: "15", unit: "Cards", particulars: "Membership Cards for delivery Note 2025-18 of 7th June 2025", unitPrice: "25000", total: "375000" },
      { quantity: "1", unit: "VAT", particulars: "18% V.A.T", unitPrice: "67500", total: "67500" },
    ],
    detailsUnderItems: "Card Names attached",
    approvals: {
      claimant: { name: "Nwesige Joann", date: "2025-06-13", signed: true },
      procurement: { name: "Donna", date: "2025-06-13", signed: true },
      gm: { name: "", date: "", signed: false },
      secretary: { name: "", date: "", signed: false },
      treasurer: { name: "", date: "", signed: false },
    },
  },
];
const demoLPOs = [
  { id: 1, orderNo: 'LPO-001', orderDate: '2025-06-20', supplierName: 'Tech Innovators Inc.', grandTotal: '5500000', items: [{ particulars: 'Laptop', quantity: '2', unitPrice: '2750000', amount: '5500000' }], modeOfPayment: 'Cheque', preparedBy: 'P. Officer', verifiedBy: 'S. Visor', verifiedDate: '2025-06-21', approvedBy: 'G. Manager', authorisedBy: 'H. Secretary' },
  { id: 2, orderNo: 'LPO-002', orderDate: '2025-06-22', supplierName: 'Office Essentials Ltd.', grandTotal: '450000', items: [{ particulars: 'A4 Paper Ream', quantity: '10', unitPrice: '20000', amount: '200000' }, { particulars: 'Box of Pens', quantity: '5', unitPrice: '50000', amount: '250000' }], modeOfPayment: 'Bank Transfer', preparedBy: 'P. Officer', verifiedBy: 'S. Visor', verifiedDate: '2025-06-23', approvedBy: 'G. Manager', authorisedBy: 'H. Secretary' },
  { id: 3, orderNo: 'LPO-003', orderDate: '2025-06-25', supplierName: 'Tech Innovators Inc.', grandTotal: '1200000', items: [{ particulars: '24" Monitor', quantity: '1', unitPrice: '1200000', amount: '1200000' }], modeOfPayment: 'Cheque', preparedBy: 'P. Officer', verifiedBy: 'S. Visor', verifiedDate: '2025-06-26', approvedBy: 'G. Manager', authorisedBy: 'H. Secretary' },
];
const demoVouchers = [
  {
    id: 1,
    voucherNo: "15467",
    date: "2025-06-10",
    payee: "UEDCL",
    chequeNo: "2,372,262",
    bank: "ABSA",
    particulars: "Being payment of electricity bills for the 2,372,262 period from 7/05/25 to 7/06/25 on PDN 1242877494324",
    amount: "2,372,262",
    amountWords: "Two million, three hundred seventy two thousand, two hundred sixty two shillings only",
    preparedBy: "Deyong",
    checkedBy: "Cornel",
    approvedBy: "",
    receivedBy: "",
    honTreasurer: "",
    honSecretary: "",
  },
];

// --- DEFAULTS ---
type PaymentLineItem = { [key: string]: string; quantity: string; unit: string; particulars: string; unitPrice: string; total: string };
type LPOItem = { particulars: string; quantity: string; unitPrice: string; amount: string; };
const defaultLineItem: PaymentLineItem = { quantity: '', unit: '', particulars: '', unitPrice: '', total: '' };
const defaultLPOItem: LPOItem = { particulars: '', quantity: '', unitPrice: '', amount: '' };
const defaultApprovals = {
  claimant: { name: '', date: '', signed: false },
  procurement: { name: '', date: '', signed: false },
  gm: { name: '', date: '', signed: false },
  secretary: { name: '', date: '', signed: false },
  treasurer: { name: '', date: '', signed: false },
};

const roleIcon = (
  <span className="inline-block bg-purple-100 text-purple-600 rounded-full p-2 mr-2">
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2"/></svg>
  </span>
);

// Utility to convert forms to CSV
function formsToCSV(forms: WorkflowForm[]) {
  const headers = [
    'ID', 'Title', 'Type', 'Status', 'Current Handler', 'Created', 'Department', 'Requestor', 'Approval Trail'
  ];
  const rows = forms.map(f => {
    const approvalTrail = (f.history || []).map((h: FormHistoryEntry) => {
      const sig = h.signature ? JSON.parse(h.signature) : {};
      return `${h.role} (${sig.name || ''}) [${h.date}: ${h.action}]`;
    }).join(' | ');
    return [
      f.id,
      f.title,
      f.type,
      f.status,
      f.currentRole,
      f.created,
      f.data?.department || '',
      f.data?.requestor || '',
      approvalTrail
    ];
  });
  const csvContent = [headers, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
  return csvContent;
}

function downloadCSV(forms: WorkflowForm[], filename = 'forms_export.csv') {
  const csv = formsToCSV(forms);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ProcurementDashboard() {
  const { forms } = useWorkflow();
  const [tab, setTab] = useState<'inbox' | 'outbox' | 'all' | 'create' | 'Suppliers'>('inbox');
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  // Payment Requisition
  const [payments, setPayments] = useState(demoPayments);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    requestor: "",
    department: "",
    needBy: "",
    subject: "",
    comments: "",
    signature: null as File | null,
    lineItems: [ { ...defaultLineItem } as PaymentLineItem ],
    detailsUnderItems: "",
    approvals: { ...defaultApprovals },
  });
  // LPO
  const [lpos, setLpos] = useState(demoLPOs);
  const [showLPOForm, setShowLPOForm] = useState(false);
  const [lpoForm, setLpoForm] = useState({
    orderNo: '',
    supplierName: '',
    orderDate: '',
    modeOfPayment: '',
    deliveryDate: '',
    items: [ { ...defaultLPOItem } ],
    grandTotal: '',
    preparedBy: '',
    verifiedBy: '',
    verifiedDate: '',
    approvedBy: '',
    authorisedBy: '',
  });
  // Voucher
  const [vouchers, setVouchers] = useState(demoVouchers);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [voucherForm, setVoucherForm] = useState<any>({ /* ... */ });

  // PDF refs
  const paymentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lpoRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const voucherRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Inbox: forms awaiting procurement officer action
  const inboxForms = forms.filter(f => f.currentRole === 'procurement');
  // Outbox: forms created by procurement officer but currently with other roles
  const outboxForms = forms.filter(f => f.history.some(h => h.role === 'procurement') && f.currentRole !== 'procurement');
  // All forms: all forms in the system with filtering
  const filteredForms = forms.filter(form => {
    const matchesSearch = searchTerm === '' || 
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.currentRole.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || form.status.includes(statusFilter);
    const matchesType = typeFilter === '' || form.type === typeFilter;
    const matchesRole = roleFilter === '' || form.currentRole === roleFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesRole;
  });
  
  // Get unique values for filter options
  const uniqueStatuses = [...new Set(forms.map(f => f.status))];
  const uniqueTypes = [...new Set(forms.map(f => f.type))];
  const uniqueRoles = [...new Set(forms.map(f => f.currentRole))];

  // Compute enhanced stats for procurement officer
  const handledForms = forms.filter(f => f.history.some((h: FormHistoryEntry) => h.role === 'procurement'));
  const approvedForms = handledForms.filter(f => f.status.toLowerCase().includes('approved'));
  const rejectedForms = handledForms.filter(f => f.status.toLowerCase().includes('rejected'));
  const totalApprovedValue = approvedForms.reduce((sum, f) => {
    if (!f.data.lineItems) return sum;
    return sum + f.data.lineItems.reduce((itemSum: number, item: PaymentLineItem) => itemSum + (Number(item.total) || 0), 0);
  }, 0);
  const avgApprovalTime = (() => {
    const times = handledForms.map(f => {
      const procurementEntry = f.history.find((h: FormHistoryEntry) => h.role === 'procurement');
      if (!procurementEntry) return null;
      const created = new Date(f.created).getTime();
      const approvedDate = new Date(procurementEntry.date).getTime();
      return (approvedDate - created) / (1000 * 60 * 60 * 24); // days
    }).filter((v): v is number => v !== null);
    if (!times.length) return null;
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
  })();

  // --- ANALYTICS DATA ---
  const departmentCounts: Record<string, number> = {};
  const monthCounts: Record<string, number> = {};
  const itemCounts: Record<string, number> = {};
  forms.forEach((f: WorkflowForm) => {
    // Pie: Requests by Department
    if (f.data && f.data.department) {
      departmentCounts[f.data.department] = (departmentCounts[f.data.department] || 0) + 1;
    }
    // Bar: Requests per Month
    if (f.created) {
      const month = f.created.slice(0, 7); // YYYY-MM
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
    // Top 5 Items
    if (f.data && f.data.lineItems) {
      f.data.lineItems.forEach((item: PaymentLineItem) => {
        if (item.particulars) {
          itemCounts[item.particulars] = (itemCounts[item.particulars] || 0) + Number(item.quantity || 1);
        }
      });
    }
  });
  const pieData = {
    labels: Object.keys(departmentCounts),
    datasets: [
      {
        label: 'Requests by Department',
        data: Object.values(departmentCounts),
        backgroundColor: [
          '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#60a5fa', '#f472b6', '#facc15', '#4ade80', '#fca5a5', '#818cf8',
        ],
      },
    ],
  };
  const barMonthData = {
    labels: Object.keys(monthCounts),
    datasets: [
      {
        label: 'Requests per Month',
        data: Object.values(monthCounts),
        backgroundColor: '#a78bfa',
      },
    ],
  };
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const barItemsData = {
    labels: topItems.map(([item]) => item),
    datasets: [
      {
        label: 'Top 5 Most Requested Items',
        data: topItems.map(([, count]) => count),
        backgroundColor: '#fbbf24',
      },
    ],
  };

  // --- APPROVAL TRAIL COMPONENT ---
  const ApprovalTrail = ({ form }: { form: WorkflowForm }) => {
    const workflowSteps = [
      { role: 'claimant', label: 'Claimant', color: 'bg-blue-500' },
      { role: 'supervisor', label: 'Supervisor', color: 'bg-yellow-500' },
      { role: 'procurement', label: 'Procurement', color: 'bg-purple-500' },
      { role: 'gm', label: 'General Manager', color: 'bg-green-500' },
      { role: 'secretary', label: 'Hon. Secretary', color: 'bg-indigo-500' },
      { role: 'treasurer', label: 'Hon. Treasurer', color: 'bg-orange-500' },
    ];

    const getStepStatus = (stepRole: string) => {
      const historyEntry = form.history.find((h: FormHistoryEntry) => h.role === stepRole);
      const isCurrent = form.currentRole === stepRole;
      const isCompleted = !!historyEntry;
      
      if (isCompleted) return 'completed';
      if (isCurrent) return 'current';
      return 'pending';
    };

    return (
      <div className="mt-3">
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Workflow Progress</span>
            <span>{form.history.length} of {workflowSteps.length} steps completed</span>
          </div>
          <div className="flex space-x-1">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(step.role);
              return (
                <div key={step.role} className="flex-1 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${
                    status === 'completed' ? step.color :
                    status === 'current' ? 'bg-gray-400' :
                    'bg-gray-200'
                  }`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Approval Trail */}
        <div className="text-xs">
          <div className="font-semibold text-gray-700 mb-1">Approval Trail:</div>
          {form.history.length === 0 ? (
            <div className="text-gray-500 italic">No approvals yet</div>
          ) : (
            <div className="space-y-1">
              {form.history.map((entry: FormHistoryEntry, index: number) => {
                const signatureData = entry.signature ? JSON.parse(entry.signature) : null;
                return (
                  <div key={index} className="flex items-center justify-between bg-white rounded px-2 py-1 border">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        entry.role === 'claimant' ? 'bg-blue-500' :
                        entry.role === 'supervisor' ? 'bg-yellow-500' :
                        entry.role === 'procurement' ? 'bg-purple-500' :
                        entry.role === 'gm' ? 'bg-green-500' :
                        entry.role === 'secretary' ? 'bg-indigo-500' :
                        'bg-orange-500'
                      }`} />
                      <span className="font-medium capitalize">{entry.role}</span>
                      {signatureData && (
                        <span className="text-gray-600">- {signatureData.name}</span>
                      )}
                    </div>
                    <div className="text-gray-500">
                      {entry.date} • {entry.action}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- HANDLERS ---
  // Payment Requisition
  const handlePaymentLineItemChange = (idx: number, field: string, value: string) => {
    const updated = [...paymentForm.lineItems];
    updated[idx][field] = value;
    if ((field === 'quantity' || field === 'unitPrice') && updated[idx].quantity && updated[idx].unitPrice) {
      updated[idx].total = String(Number(updated[idx].quantity) * Number(updated[idx].unitPrice));
    }
    setPaymentForm({ ...paymentForm, lineItems: updated });
  };
  const addPaymentLineItem = () => setPaymentForm({ ...paymentForm, lineItems: [...paymentForm.lineItems, { ...defaultLineItem } as PaymentLineItem] });
  const removePaymentLineItem = (idx: number) => setPaymentForm({ ...paymentForm, lineItems: paymentForm.lineItems.filter((_, i) => i !== idx) });
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayments([{ ...paymentForm, id: Date.now(), title: paymentForm.subject || "Untitled", status: "Draft (Not Submitted)", created: new Date().toISOString().slice(0, 10) }, ...payments]);
    setShowPaymentForm(false);
  };
  // LPO
  const handleLPOItemChange = (idx: number, field: keyof LPOItem, value: string) => {
    const updated = [...lpoForm.items];
    updated[idx] = { ...updated[idx], [field]: value };

    // Recalculate amount if quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = Number(updated[idx].quantity);
      const unitPrice = Number(updated[idx].unitPrice.replace(/,/g, ''));
      updated[idx].amount = String(quantity * unitPrice);
    }
    setLpoForm({ ...lpoForm, items: updated });
  };
  const addLPOItem = () => setLpoForm({ ...lpoForm, items: [...lpoForm.items, { ...defaultLPOItem }] });
  const removeLPOItem = (idx: number) => setLpoForm({ ...lpoForm, items: lpoForm.items.filter((_, i) => i !== idx) });
  const handleLPOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...lpoForm.items];
    const grandTotal = updated.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    setLpos([{ ...lpoForm, id: Date.now(), items: updated, grandTotal: String(grandTotal) }, ...lpos]);
    setShowLPOForm(false);
  };
  // Voucher
  const handleVoucherChange = (field: string, value: string) => setVoucherForm({ ...voucherForm, [field]: value });
  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVouchers([{ ...voucherForm, id: Date.now() }, ...vouchers]);
    setShowVoucherForm(false);
  };

  // --- PDF DOWNLOADS ---
  const handleDownloadPDF = async (
    refObj: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>,
    id: number,
    filename: string
  ) => {
    const ref = refObj.current[id];
    if (!ref) return;
    const canvas = await html2canvas(ref, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 40;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 20, 20, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  // --- SUPPLIER DATA AGGREGATION ---
  const supplierStats = lpos.reduce((acc, lpo) => {
    const supplierName = lpo.supplierName;
    if (!supplierName) return acc;

    if (!acc[supplierName]) {
      acc[supplierName] = {
        name: supplierName,
        orderCount: 0,
        totalSpend: 0,
      };
    }
    acc[supplierName].orderCount += 1;
    acc[supplierName].totalSpend += Number(lpo.grandTotal) || 0;
    return acc;
  }, {} as Record<string, { name: string; orderCount: number; totalSpend: number }>);

  const supplierData = Object.values(supplierStats).sort((a, b) => b.totalSpend - a.totalSpend);

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8 border border-purple-100 mt-8">
        <div className="flex items-center mb-4">
          {roleIcon}
          <div>
            <h1 className="text-2xl font-bold text-purple-900">Procurement Officer Dashboard</h1>
            <div className="text-gray-600 text-sm">Welcome! You control and monitor all procurement forms and workflow in the system.</div>
          </div>
        </div>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-700">{inboxForms.length}</div>
            <div className="text-xs text-purple-700">Inbox</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-500">{outboxForms.length}</div>
            <div className="text-xs text-purple-500">Outbox</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-500">{forms.length}</div>
            <div className="text-xs text-purple-500">All Forms</div>
          </div>
          <div className="bg-green-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700">{approvedForms.length}</div>
            <div className="text-xs text-green-700">Approved</div>
          </div>
          <div className="bg-red-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-700">{rejectedForms.length}</div>
            <div className="text-xs text-red-700">Rejected</div>
          </div>
          <div className="bg-purple-200 rounded-xl p-4 flex flex-col items-center col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-purple-800">UGX {totalApprovedValue.toLocaleString()}</div>
            <div className="text-xs text-purple-800">Total Approved Value</div>
          </div>
          <div className="bg-yellow-100 rounded-xl p-4 flex flex-col items-center col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-yellow-700">{avgApprovalTime ? `${avgApprovalTime} days` : '--'}</div>
            <div className="text-xs text-yellow-700">Avg. Approval Time</div>
          </div>
        </div>
        <div className="flex gap-4 mb-8">
          <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'inbox' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setTab('inbox')}>Inbox</button>
          <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'outbox' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setTab('outbox')}>Outbox</button>
          <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'all' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setTab('all')}>All Forms</button>
          <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'Suppliers' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setTab('Suppliers')}>Suppliers</button>
          <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'create' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setTab('create')}>Create New</button>
        </div>

        {/* Inbox Tab */}
        {tab === 'inbox' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Inbox: Forms Awaiting Your Action</h2>
            <div className="space-y-3 mb-8">
              {inboxForms.length === 0 && <div className="text-gray-500">No forms awaiting your action.</div>}
              {inboxForms.map(form => (
                <div key={form.id} className="p-4 rounded-lg border border-purple-200 bg-purple-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-900">{form.title}</div>
                    <div className="text-xs text-gray-500">Type: {form.type}</div>
                    <div className="text-xs text-gray-500">Created: {form.created}</div>
                    <div className="text-xs text-gray-500">Status: {form.status}</div>
                    <ApprovalTrail form={form} />
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col sm:items-end gap-2">
                    {/* Add sign/send/view actions here as before */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outbox Tab */}
        {tab === 'outbox' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Outbox: Forms Sent to Others</h2>
            <div className="space-y-3 mb-8">
              {outboxForms.length === 0 && <div className="text-gray-500">No forms in outbox.</div>}
              {outboxForms.map(form => (
                <div key={form.id} className="p-4 rounded-lg border border-purple-200 bg-purple-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-900">{form.title}</div>
                    <div className="text-xs text-gray-500">Type: {form.type}</div>
                    <div className="text-xs text-gray-500">Current Handler: {form.currentRole}</div>
                    <div className="text-xs text-gray-500">Status: {form.status}</div>
                    <ApprovalTrail form={form} />
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col sm:items-end gap-2">
                    {/* Add view/download actions here as before */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Forms Tab */}
        {tab === 'all' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">All Forms</h2>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">Showing {filteredForms.length} of {forms.length} forms</div>
              <button
                className="bg-green-700 text-white px-4 py-2 rounded font-semibold hover:bg-green-800 shadow"
                onClick={() => downloadCSV(filteredForms)}
              >
                Export as CSV
              </button>
            </div>
            {/* Search and Filter Controls */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search forms..."
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Handler</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setTypeFilter('');
                      setRoleFilter('');
                    }}
                    className="w-full bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              {filteredForms.length === 0 && <div className="text-gray-500">No forms in the system.</div>}
              {filteredForms.map(form => (
                <div key={form.id} className="p-4 rounded-lg border border-purple-200 bg-purple-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-900">{form.title}</div>
                    <div className="text-xs text-gray-500">Type: {form.type}</div>
                    <div className="text-xs text-gray-500">Current Handler: {form.currentRole}</div>
                    <div className="text-xs text-gray-500">Status: {form.status}</div>
                    <ApprovalTrail form={form} />
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col sm:items-end gap-2">
                    {/* Add view/download actions here as before */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {tab === 'Suppliers' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-purple-900">Supplier Directory</h2>
            <div className="bg-white rounded-xl shadow p-4">
              <table className="w-full text-left">
                <thead className="border-b-2 border-purple-200">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-purple-800">Supplier Name</th>
                    <th className="p-3 text-sm font-semibold text-purple-800">Number of Orders</th>
                    <th className="p-3 text-sm font-semibold text-purple-800">Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500 italic">No supplier data found. Create some LPOs first.</td>
                    </tr>
                  )}
                  {supplierData.map((supplier) => (
                    <tr key={supplier.name} className="border-b border-purple-100 hover:bg-purple-50">
                      <td className="p-3 font-medium text-gray-800">{supplier.name}</td>
                      <td className="p-3 text-gray-600">{supplier.orderCount}</td>
                      <td className="p-3 text-gray-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(supplier.totalSpend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create New Tab */}
        {tab === 'create' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Create New Form</h2>
            <div className="flex gap-4 mb-8">
              <button className={`px-4 py-2 rounded-lg font-semibold ${showPaymentForm ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setShowPaymentForm(true)}>Payment Requisition</button>
              <button className={`px-4 py-2 rounded-lg font-semibold ${showLPOForm ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setShowLPOForm(true)}>Local Purchase Order</button>
              <button className={`px-4 py-2 rounded-lg font-semibold ${showVoucherForm ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`} onClick={() => setShowVoucherForm(true)}>Payment Voucher</button>
            </div>
            
            {/* Payment Requisition Form */}
            {showPaymentForm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                  <button className="sticky top-3 right-3 float-right text-gray-400 hover:text-gray-700 z-10" onClick={() => setShowPaymentForm(false)}>&times;</button>
                  <h2 className="text-xl font-bold mb-4 text-purple-900">Payment Requisition Form</h2>
                  <form className="space-y-4" onSubmit={handlePaymentSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Requestor</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={paymentForm.requestor} onChange={e => setPaymentForm({ ...paymentForm, requestor: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department/Section</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={paymentForm.department} onChange={e => setPaymentForm({ ...paymentForm, department: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Need-By Date</label>
                        <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={paymentForm.needBy} onChange={e => setPaymentForm({ ...paymentForm, needBy: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subject/Purpose</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={paymentForm.subject} onChange={e => setPaymentForm({ ...paymentForm, subject: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                      <table className="w-full border text-xs mb-2">
                        <thead>
                          <tr className="bg-purple-200">
                            <th className="border px-2 py-1 text-purple-900 font-bold">No.</th>
                            <th className="border px-2 py-1 text-purple-900 font-bold">Quantity</th>
                            <th className="border px-2 py-1 text-purple-900 font-bold">Unit</th>
                            <th className="border px-2 py-1 text-purple-900 font-bold">Particulars</th>
                            <th className="border px-2 py-1 text-purple-900 font-bold">Unit Price</th>
                            <th className="border px-2 py-1 text-purple-900 font-bold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentForm.lineItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="border px-2 py-1 text-center">{idx + 1}</td>
                              <td className="border px-2 py-1"><input type="number" className="w-16 border rounded px-1" value={item.quantity} onChange={e => handlePaymentLineItemChange(idx, 'quantity', e.target.value)} /></td>
                              <td className="border px-2 py-1"><input className="w-16 border rounded px-1" value={item.unit} onChange={e => handlePaymentLineItemChange(idx, 'unit', e.target.value)} /></td>
                              <td className="border px-2 py-1"><input className="w-32 border rounded px-1" value={item.particulars} onChange={e => handlePaymentLineItemChange(idx, 'particulars', e.target.value)} /></td>
                              <td className="border px-2 py-1"><input type="number" className="w-20 border rounded px-1" value={item.unitPrice} onChange={e => handlePaymentLineItemChange(idx, 'unitPrice', e.target.value)} /></td>
                              <td className="border px-2 py-1"><input type="number" className="w-24 border rounded px-1" value={item.total} readOnly /></td>
                              <td className="border px-2 py-1">
                                {paymentForm.lineItems.length > 1 && (
                                  <button type="button" className="text-red-500 text-xs" onClick={() => removePaymentLineItem(idx)}>-</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button type="button" className="text-purple-600 text-xs font-semibold" onClick={addPaymentLineItem}>+ Add Line Item</button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Details/Notes under items (e.g. Card Names attached, VAT, etc.)</label>
                      <textarea
                        className="mt-1 w-full border rounded px-3 py-2 text-xs"
                        value={paymentForm.detailsUnderItems}
                        onChange={e => setPaymentForm({ ...paymentForm, detailsUnderItems: e.target.value })}
                        placeholder="e.g. Card Names attached, 18% VAT, etc."
                      />
                      {paymentForm.detailsUnderItems && (
                        <div className="mt-2 text-xs italic text-gray-700 border-t pt-2 whitespace-pre-line">{paymentForm.detailsUnderItems}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Comments</label>
                      <textarea className="mt-1 w-full border rounded px-3 py-2" value={paymentForm.comments} onChange={e => setPaymentForm({ ...paymentForm, comments: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Upload Digital Signature</label>
                      <input type="file" accept="image/*" className="mt-1" onChange={e => setPaymentForm({ ...paymentForm, signature: e.target.files?.[0] || null })} />
                    </div>
                    <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 mt-4">Submit & Send to Claimant</button>
                  </form>
                </div>
              </div>
            )}
            
            {/* LPO Form */}
            {showLPOForm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
                  <button className="sticky top-3 right-3 float-right text-gray-400 hover:text-gray-700 z-10" onClick={() => setShowLPOForm(false)}>&times;</button>
                  <h2 className="text-xl font-bold mb-4 text-purple-900">Local Purchase Order</h2>
                  <form onSubmit={handleLPOSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Purchase Order No.</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.orderNo} onChange={e => setLpoForm({ ...lpoForm, orderNo: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Order Date</label>
                        <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.orderDate} onChange={e => setLpoForm({ ...lpoForm, orderDate: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">To (Supplier)</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.supplierName} onChange={e => setLpoForm({ ...lpoForm, supplierName: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mode of Payment</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.modeOfPayment} onChange={e => setLpoForm({ ...lpoForm, modeOfPayment: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                        <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.deliveryDate} onChange={e => setLpoForm({ ...lpoForm, deliveryDate: e.target.value })} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Particulars</th>
                            <th className="py-2 text-left">Quantity</th>
                            <th className="py-2 text-left">Unit Price</th>
                            <th className="py-2 text-left">Amount</th>
                            <th className="py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lpoForm.items.map((item, idx) => (
                            <tr key={idx}>
                              <td><input className="w-full border-b p-2" value={item.particulars} onChange={e => handleLPOItemChange(idx, 'particulars', e.target.value)} /></td>
                              <td><input className="w-full border-b p-2" type="number" value={item.quantity} onChange={e => handleLPOItemChange(idx, 'quantity', e.target.value)} /></td>
                              <td><input className="w-full border-b p-2" type="number" value={item.unitPrice} onChange={e => handleLPOItemChange(idx, 'unitPrice', e.target.value)} /></td>
                              <td><input className="w-full border-b p-2 bg-gray-100" readOnly value={item.amount} /></td>
                              <td>
                                {lpoForm.items.length > 1 && (
                                  <button type="button" onClick={() => removeLPOItem(idx)} className="text-red-500 font-bold">X</button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button type="button" onClick={addLPOItem} className="mt-2 text-purple-600 font-semibold">+ Add Item</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Grand Total</label>
                        <input type="number" className="mt-1 w-full border rounded px-3 py-2 bg-gray-100" readOnly value={lpoForm.grandTotal} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prepared By (Procurement Officer)</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.preparedBy} onChange={e => setLpoForm({ ...lpoForm, preparedBy: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Verified By</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.verifiedBy} onChange={e => setLpoForm({ ...lpoForm, verifiedBy: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Verified Date</label>
                        <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.verifiedDate} onChange={e => setLpoForm({ ...lpoForm, verifiedDate: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Approved By</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.approvedBy} onChange={e => setLpoForm({ ...lpoForm, approvedBy: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Authorised By</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={lpoForm.authorisedBy} onChange={e => setLpoForm({ ...lpoForm, authorisedBy: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 w-full mt-4">Submit LPO</button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Voucher Form */}
            {showVoucherForm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                  <button className="sticky top-3 right-3 float-right text-gray-400 hover:text-gray-700 z-10" onClick={() => setShowVoucherForm(false)}>&times;</button>
                  <h2 className="text-xl font-bold mb-4 text-purple-900">Payment Voucher</h2>
                  <form className="space-y-4" onSubmit={handleVoucherSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Voucher No.</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.voucherNo} onChange={e => handleVoucherChange('voucherNo', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.date} onChange={e => handleVoucherChange('date', e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Payee</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.payee} onChange={e => handleVoucherChange('payee', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cheque No.</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.chequeNo} onChange={e => handleVoucherChange('chequeNo', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bank</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.bank} onChange={e => handleVoucherChange('bank', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Particulars</label>
                      <textarea className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.particulars} onChange={e => handleVoucherChange('particulars', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.amount} onChange={e => handleVoucherChange('amount', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount in Words</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.amountWords} onChange={e => handleVoucherChange('amountWords', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prepared By (Accountant)</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.preparedBy} onChange={e => handleVoucherChange('preparedBy', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Checked By (Manager)</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.checkedBy} onChange={e => handleVoucherChange('checkedBy', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Approved By</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.approvedBy} onChange={e => handleVoucherChange('approvedBy', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Received By</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.receivedBy} onChange={e => handleVoucherChange('receivedBy', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hon. Treasurer</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.honTreasurer} onChange={e => handleVoucherChange('honTreasurer', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hon. Secretary</label>
                        <input className="mt-1 w-full border rounded px-3 py-2" value={voucherForm.honSecretary} onChange={e => handleVoucherChange('honSecretary', e.target.value)} />
                      </div>
                    </div>
                    <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 mt-4">Submit & Send to Accounts</button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Show created forms */}
            <div className="space-y-4">
              {payments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment Requisitions</h3>
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-3 rounded-lg border border-purple-200 bg-purple-50 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-purple-900">{payment.title}</div>
                          <div className="text-xs text-gray-500">Created: {payment.created}</div>
                        </div>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700" onClick={() => handleDownloadPDF(paymentRefs, payment.id, `Payment_Requisition_${payment.id}.pdf`)}>Download PDF</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {lpos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Local Purchase Orders</h3>
                  <div className="space-y-2">
                    {lpos.map((lpo) => (
                      <div key={lpo.id} className="p-3 rounded-lg border border-purple-200 bg-purple-50 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-purple-900">LPO #{lpo.orderNo} ({lpo.supplierName})</div>
                          <div className="text-xs text-gray-500">Order Date: {lpo.orderDate}</div>
                        </div>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700" onClick={() => handleDownloadPDF(lpoRefs, lpo.id, `LPO_${lpo.orderNo}.pdf`)}>Download PDF</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {vouchers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment Vouchers</h3>
                  <div className="space-y-2">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="p-3 rounded-lg border border-purple-200 bg-purple-50 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-purple-900">Voucher #{voucher.voucherNo}</div>
                          <div className="text-xs text-gray-500">Date: {voucher.date}</div>
                        </div>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700" onClick={() => handleDownloadPDF(voucherRefs, voucher.id, `Voucher_${voucher.voucherNo}.pdf`)}>Download PDF</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Hidden PDF elements */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
              {payments.map((payment) => (
                <div key={payment.id} ref={el => { paymentRefs.current[payment.id] = el; }} className="bg-white border rounded-xl p-6 shadow max-w-2xl mx-auto text-sm">
                  <div className="flex justify-between mb-2">
                    <div><span className="font-bold">Requestor:</span> {payment.requestor}</div>
                    <div><span className="font-bold">Department:</span> {payment.department}</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div><span className="font-bold">Need-By Date:</span> {payment.needBy}</div>
                    <div><span className="font-bold">Subject:</span> {payment.subject}</div>
                  </div>
                  <table className="w-full border text-xs mb-2">
                    <thead>
                      <tr className="bg-purple-200">
                        <th className="border px-2 py-1 text-purple-900 font-bold">No.</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Quantity</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Unit</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Particulars</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Unit Price</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payment.lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1 text-center">{idx + 1}</td>
                          <td className="border px-2 py-1">{item.quantity}</td>
                          <td className="border px-2 py-1">{item.unit}</td>
                          <td className="border px-2 py-1">{item.particulars}</td>
                          <td className="border px-2 py-1">{item.unitPrice}</td>
                          <td className="border px-2 py-1">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {payment.detailsUnderItems && (
                    <div className="mt-2 text-xs italic text-gray-700 border-t pt-2 whitespace-pre-line">{payment.detailsUnderItems}</div>
                  )}
                  <div className="mt-4"><span className="font-bold">Comments:</span> {payment.comments}</div>
                  <div className="mt-4 flex flex-col gap-1">
                    <span className="font-bold">Approvals:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="font-semibold">Claimant:</span> {payment.approvals.claimant.name} {payment.approvals.claimant.signed && '✔'} {payment.approvals.claimant.date}</div>
                      <div><span className="font-semibold">Procurement Officer:</span> {payment.approvals.procurement?.name} {payment.approvals.procurement?.signed && '✔'} {payment.approvals.procurement?.date}</div>
                      <div><span className="font-semibold">General Manager:</span> {payment.approvals.gm.name} {payment.approvals.gm.signed && '✔'} {payment.approvals.gm.date}</div>
                      <div><span className="font-semibold">Hon. Secretary:</span> {payment.approvals.secretary.name} {payment.approvals.secretary.signed && '✔'} {payment.approvals.secretary.date}</div>
                      <div><span className="font-semibold">Hon. Treasurer:</span> {payment.approvals.treasurer.name} {payment.approvals.treasurer.signed && '✔'} {payment.approvals.treasurer.date}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {lpos.map((lpo) => (
                <div key={lpo.id} ref={el => { lpoRefs.current[lpo.id] = el; }} className="bg-white border rounded-xl p-6 shadow max-w-2xl mx-auto text-sm">
                  <div className="flex justify-between mb-2">
                    <div><span className="font-bold">To:</span> {lpo.supplierName}</div>
                    <div><span className="font-bold">Order Date:</span> {lpo.orderDate}</div>
                  </div>
                  <div className="mb-2"><span className="font-bold">Mode of Payment:</span> {lpo.modeOfPayment || ''}</div>
                  <table className="w-full border text-xs mb-2">
                    <thead>
                      <tr className="bg-purple-200">
                        <th className="border px-2 py-1 text-purple-900 font-bold">Quantity</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Description</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Unit Price</th>
                        <th className="border px-2 py-1 text-purple-900 font-bold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lpo.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1">{item.quantity}</td>
                          <td className="border px-2 py-1">{item.particulars}</td>
                          <td className="border px-2 py-1">{item.unitPrice}</td>
                          <td className="border px-2 py-1">{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-right font-bold mb-4">Grand Total: {lpo.grandTotal}</p>
                  <div className="grid grid-cols-2 gap-8 mt-8 text-xs">
                    <div>
                      <p className="mb-2"><span className="font-bold">Prepared By:</span> {lpo.preparedBy || ''}</p>
                      <p>Signature: ___________________ Date: ____________</p>
                    </div>
                    <div>
                      <p className="mb-2"><span className="font-bold">Verified By:</span> {lpo.verifiedBy || ''} <span className="font-bold ml-4">Date:</span> {lpo.verifiedDate || ''}</p>
                      <p>Signature: ___________________</p>
                    </div>
                    <div>
                      <p className="mb-2"><span className="font-bold">Approved By:</span> {lpo.approvedBy || ''}</p>
                      <p>Signature: ___________________ Date: ____________</p>
                    </div>
                    <div>
                      <p className="mb-2"><span className="font-bold">Authorised By:</span> {lpo.authorisedBy || ''}</p>
                      <p>Signature: ___________________ Date: ____________</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {vouchers.map((voucher) => (
                <div key={voucher.id} ref={el => { voucherRefs.current[voucher.id] = el; }} className="bg-white border rounded-xl p-6 shadow max-w-2xl mx-auto text-sm">
                  <div className="flex justify-between mb-2">
                    <div><span className="font-bold">Payee:</span> {voucher.payee}</div>
                    <div><span className="font-bold">Date:</span> {voucher.date}</div>
                  </div>
                  <div className="mb-2"><span className="font-bold">Cheque No.:</span> {voucher.chequeNo} <span className="font-bold ml-4">Bank:</span> {voucher.bank}</div>
                  <div className="mb-2"><span className="font-bold">Particulars:</span> {voucher.particulars}</div>
                  <div className="mb-2"><span className="font-bold">Amount:</span> {voucher.amount}</div>
                  <div className="mb-2"><span className="font-bold">Amount in Words:</span> {voucher.amountWords}</div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="font-semibold">Prepared By:</span> {voucher.preparedBy}</div>
                    <div><span className="font-semibold">Checked By:</span> {voucher.checkedBy}</div>
                    <div><span className="font-semibold">Approved By:</span> {voucher.approvedBy}</div>
                    <div><span className="font-semibold">Received By:</span> {voucher.receivedBy}</div>
                    <div><span className="font-semibold">Hon. Treasurer:</span> {voucher.honTreasurer}</div>
                    <div><span className="font-semibold">Hon. Secretary:</span> {voucher.honSecretary}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Analytics Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-purple-900">Analytics & Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <h3 className="font-semibold mb-2 text-purple-700">Requests by Department</h3>
            <Pie data={pieData} />
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <h3 className="font-semibold mb-2 text-purple-700">Requests per Month</h3>
            <Bar data={barMonthData} options={{ plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <h3 className="font-semibold mb-2 text-purple-700">Top 5 Most Requested Items</h3>
            <Bar data={barItemsData} options={{ plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    </div>
  );
} 