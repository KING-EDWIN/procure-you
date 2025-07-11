"use client";

import React, { useState } from "react";
import DashboardLayout from "../../dashboard-layout";

// Mock data for department head's procurement requisitions
const mockRequisitions = [
  {
    id: "PR-001",
    date: "2024-01-15",
    department: "IT Department",
    status: "Pending",
    items: 3,
    totalAmount: 1500000,
  },
  {
    id: "PR-002",
    date: "2024-01-10",
    department: "IT Department",
    status: "Approved",
    items: 2,
    totalAmount: 800000,
  },
  {
    id: "PR-003",
    date: "2024-01-05",
    department: "IT Department",
    status: "Rejected",
    items: 1,
    totalAmount: 500000,
  },
];

export default function DepartmentHeadProcurementPage() {
  const [showNewForm, setShowNewForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout userRole="department-head">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
            <p className="text-gray-600">Create and manage procurement requisitions for your department</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Procurement Requisition
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requisitions</p>
                <p className="text-2xl font-bold text-gray-900">{mockRequisitions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockRequisitions.filter(r => r.status === "Pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockRequisitions.filter(r => r.status === "Approved").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockRequisitions.filter(r => r.status === "Rejected").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Procurement Requisitions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requisition ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockRequisitions.map((requisition) => (
                  <tr key={requisition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {requisition.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {requisition.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {requisition.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {requisition.items}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      UGX {requisition.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(requisition.status)}`}>
                        {requisition.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Download PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* New Requisition Form Modal */}
        {showNewForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">New Procurement Requisition</h3>
                  <button
                    onClick={() => setShowNewForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <ProcurementRequisitionForm onClose={() => setShowNewForm(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProcurementRequisitionForm({ onClose }: { onClose: () => void }) {
  type LineItem = { quantity: string; unit: string; particulars: string; unitPrice: string; total: string };
  const [form, setForm] = useState({
    requestor: "",
    date: new Date().toISOString().slice(0, 10),
    department: "",
    needByDate: "",
    subject: "",
    comments: "",
    signature: "",
    signatureDate: new Date().toISOString().slice(0, 10),
    lineItems: [
      { quantity: "", unit: "", particulars: "", unitPrice: "", total: "" },
    ] as LineItem[],
  });

  const handleLineItemChange = (idx: number, field: keyof LineItem, value: string) => {
    const newItems = [...form.lineItems];
    newItems[idx][field] = value;
    // Auto-calculate total if quantity and unitPrice are present
    if ((field === "quantity" || field === "unitPrice") && newItems[idx].quantity && newItems[idx].unitPrice) {
      const qty = parseFloat(newItems[idx].quantity);
      const price = parseFloat(newItems[idx].unitPrice);
      if (!isNaN(qty) && !isNaN(price)) {
        newItems[idx].total = (qty * price).toString();
      }
    }
    setForm({ ...form, lineItems: newItems });
  };

  const addLineItem = () => {
    setForm({ ...form, lineItems: [...form.lineItems, { quantity: "", unit: "", particulars: "", unitPrice: "", total: "" }] });
  };

  const removeLineItem = (idx: number) => {
    if (form.lineItems.length === 1) return;
    setForm({ ...form, lineItems: form.lineItems.filter((_, i) => i !== idx) });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle saving the form
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Requestor</label>
          <input name="requestor" value={form.requestor} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dept./Section</label>
          <input name="department" value={form.department} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Need-By Date</label>
          <input type="date" name="needByDate" value={form.needByDate} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Subject/Purpose</label>
          <input name="subject" value={form.subject} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>
      </div>
      {/* Line Items Table */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 border">No.</th>
                <th className="px-2 py-1 border">Quantity</th>
                <th className="px-2 py-1 border">Unit of Measure</th>
                <th className="px-2 py-1 border">Particulars</th>
                <th className="px-2 py-1 border">Unit Price</th>
                <th className="px-2 py-1 border">Total</th>
                <th className="px-2 py-1 border"></th>
              </tr>
            </thead>
            <tbody>
              {form.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">
                    <input type="number" min="0" className="w-16 border rounded px-1 py-0.5" value={item.quantity} onChange={e => handleLineItemChange(idx, "quantity", e.target.value)} required />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="w-24 border rounded px-1 py-0.5" value={item.unit} onChange={e => handleLineItemChange(idx, "unit", e.target.value)} required />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="w-40 border rounded px-1 py-0.5" value={item.particulars} onChange={e => handleLineItemChange(idx, "particulars", e.target.value)} required />
                  </td>
                  <td className="border px-2 py-1">
                    <input type="number" min="0" className="w-24 border rounded px-1 py-0.5" value={item.unitPrice} onChange={e => handleLineItemChange(idx, "unitPrice", e.target.value)} required />
                  </td>
                  <td className="border px-2 py-1">
                    <input type="number" min="0" className="w-24 border rounded px-1 py-0.5" value={item.total} readOnly />
                  </td>
                  <td className="border px-2 py-1">
                    <button type="button" onClick={() => removeLineItem(idx)} className="text-red-500 hover:text-red-700">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addLineItem} className="mt-2 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">+ Add Item</button>
      </div>
      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Comments</label>
        <textarea name="comments" value={form.comments} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" rows={2} />
      </div>
      {/* Signature & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Signature (Claimant)</label>
          <input name="signature" value={form.signature} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date (Claimant)</label>
          <input type="date" name="signatureDate" value={form.signatureDate} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" required />
        </div>
      </div>
      {/* Approval Placeholders */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-semibold text-gray-700 mb-2">Authorisation and Approval</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">Supervisor</label>
            <input className="mt-1 block w-full border rounded px-3 py-2 bg-gray-100" value="" placeholder="Pending" readOnly />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Procurement Officer</label>
            <input className="mt-1 block w-full border rounded px-3 py-2 bg-gray-100" value="" placeholder="Pending" readOnly />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">General Manager</label>
            <input className="mt-1 block w-full border rounded px-3 py-2 bg-gray-100" value="" placeholder="Pending" readOnly />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit</button>
      </div>
    </form>
  );
} 