"use client";

import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useWorkflow, PaymentLineItem, RequisitionFormData, WorkflowForm } from "../workflow-context";

const defaultLineItem: PaymentLineItem = { quantity: '', unit: '', particulars: '', unitPrice: '', total: '' };

const roleIcon = (
  <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2 mr-2">
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" stroke="currentColor" strokeWidth="2"/></svg>
  </span>
);

export default function ClaimantDashboard() {
  const { forms, addForm, signAndSend } = useWorkflow();
  const claimantName = "Nwesige Joann";
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RequisitionFormData & { type: "requisition" }>({
    type: "requisition",
    requestor: "Nwesige Joann",
    department: "Maintenance/IT",
    needBy: "",
    subject: "",
    comments: "",
    signature: null,
    lineItems: [ { ...defaultLineItem } ],
    detailsUnderItems: "",
  });
  const [submittedForm, setSubmittedForm] = useState<(RequisitionFormData & { type: "requisition" }) | null>(null);
  const formRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [tab, setTab] = useState<'inbox' | 'history'>('inbox');

  const handleLineItemChange = (idx: number, field: keyof PaymentLineItem, value: string) => {
    const updated = [...form.lineItems];
    updated[idx][field] = value;
    // Auto-calculate total if qty and unitPrice are present
    if ((field === 'quantity' || field === 'unitPrice') && updated[idx].quantity && updated[idx].unitPrice) {
      updated[idx].total = String(Number(updated[idx].quantity) * Number(updated[idx].unitPrice));
    }
    setForm({ ...form, lineItems: updated });
  };

  const addLineItem = () => setForm({ ...form, lineItems: [...form.lineItems, { ...defaultLineItem }] });
  const removeLineItem = (idx: number) => setForm({ ...form, lineItems: form.lineItems.filter((_item, i) => i !== idx) });

  const handleSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, signature: e.target.files?.[0] || null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addForm({
      type: "requisition",
      title: form.subject || "Untitled",
      status: "Draft (Not Submitted)",
      currentRole: "claimant",
      data: { ...form, type: "requisition", requestor: claimantName },
    });
    setSubmittedForm(form);
    setShowForm(false);
  };

  function isRequisitionData(data: unknown): data is RequisitionFormData & { type: "requisition" } {
    return Boolean(data && typeof data === 'object' && data !== null && 'type' in data && data.type === "requisition");
  }
  const handleDownloadPDF = async (req: RequisitionFormData | WorkflowForm, id: number) => {
    let data: RequisitionFormData | null = null;
    if ('data' in req) {
      if (isRequisitionData(req.data)) {
        data = req.data;
      }
    } else if (isRequisitionData(req)) {
      data = req;
    }
    if (!data) return;
    const ref = formRefs.current[id];
    if (!ref) return;
    const canvas = await html2canvas(ref, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth - 40;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 20, 20, pdfWidth, pdfHeight);
    pdf.save(`Procurement_Requisition_${id}.pdf`);
  };

  // Split forms for inbox/history
  const inboxForms = forms.filter(f => f.currentRole === 'claimant' && isRequisitionData(f.data) && f.data.requestor === claimantName);
  const historyForms = forms.filter(f => isRequisitionData(f.data) && f.data.requestor === claimantName);

  // Compute enhanced stats
  const approvedForms = historyForms.filter(f => f.status.toLowerCase().includes('approved'));
  const rejectedForms = historyForms.filter(f => f.status.toLowerCase().includes('rejected'));
  const totalApprovedValue = approvedForms.reduce((sum, f) => {
    if (!isRequisitionData(f.data) || !f.data.lineItems) return sum;
    return sum + f.data.lineItems.reduce((itemSum: number, item: PaymentLineItem) => itemSum + (Number(item.total) || 0), 0);
  }, 0);
  // Average approval time (if history has timestamps)
  const avgApprovalTime = (() => {
    const times = approvedForms.map(f => {
      if (!f.history || f.history.length < 2) return null;
      const created = new Date(f.created).getTime();
      const approved = f.history.find((h) => h.action.toLowerCase().includes('approved'));
      if (!approved) return null;
      const approvedDate = new Date(approved.date).getTime();
      return (approvedDate - created) / (1000 * 60 * 60 * 24); // days
    }).filter((v): v is number => v !== null);
    if (!times.length) return null;
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
  })();

  // Approval trail mini component
  const ApprovalTrail = ({ form }: { form: WorkflowForm }) => {
    const steps = ['claimant', 'supervisor', 'procurement', 'gm', 'secretary', 'treasurer'];
    return (
      <div className="flex items-center gap-1 mt-2">
        {steps.map((role) => {
          const done = form.history.some((h) => h.role === role);
          return <span key={role} className={`w-2 h-2 rounded-full ${done ? 'bg-blue-500' : 'bg-gray-200'}`}></span>;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100 mt-8">
        <div className="flex items-center mb-4">
          {roleIcon}
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Claimant Dashboard</h1>
            <div className="text-gray-600 text-sm">Welcome, {claimantName}! Submit and track your procurement requests here.</div>
          </div>
        </div>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-700">{inboxForms.length}</div>
            <div className="text-xs text-blue-700">Awaiting Your Action</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-500">{historyForms.length}</div>
            <div className="text-xs text-blue-500">Total Requests</div>
          </div>
          <div className="bg-green-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700">{approvedForms.length}</div>
            <div className="text-xs text-green-700">Approved</div>
          </div>
          <div className="bg-red-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-700">{rejectedForms.length}</div>
            <div className="text-xs text-red-700">Rejected</div>
          </div>
          <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-purple-700">UGX {totalApprovedValue.toLocaleString()}</div>
            <div className="text-xs text-purple-700">Total Approved Value</div>
          </div>
          <div className="bg-yellow-100 rounded-xl p-4 flex flex-col items-center col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-yellow-700">{avgApprovalTime ? `${avgApprovalTime} days` : '--'}</div>
            <div className="text-xs text-yellow-700">Avg. Approval Time</div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'inbox' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`} onClick={() => setTab('inbox')}>Inbox</button>
          <button className={`px-4 py-2 rounded-lg font-semibold ${tab === 'history' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`} onClick={() => setTab('history')}>History</button>
        </div>
        {/* Create New Button */}
        <div className="mb-6 flex justify-end">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition" onClick={() => setShowForm(true)}>+ New Requisition</button>
        </div>
        {/* Inbox Tab */}
        {tab === 'inbox' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Inbox</h2>
            <div className="space-y-3 mb-8">
              {inboxForms.length === 0 && <div className="text-gray-500">No forms awaiting your action.</div>}
              {inboxForms.map(form => (
                <div key={form.id} className="p-4 rounded-lg border border-blue-200 bg-blue-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-900">{form.title}</div>
                    <div className="text-xs text-gray-500">Type: {form.type}</div>
                    <div className="text-xs text-gray-500">Created: {form.created}</div>
                    <div className="text-xs text-gray-500">Status: <span className="inline-block px-2 py-0.5 rounded bg-blue-200 text-blue-800 text-xs">{form.status}</span></div>
                    <ApprovalTrail form={form} />
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col sm:items-end gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 mt-2"
                      onClick={() => handleDownloadPDF(form, form.id)}
                    >
                      Download PDF
                    </button>
                    {form.currentRole === "claimant" && (
                      <button
                        className="bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-800 mt-2"
                        onClick={() => signAndSend(form.id, claimantName, "supervisor", "Awaiting Supervisor Approval")}
                      >
                        Sign & Send to Supervisor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* History Tab */}
        {tab === 'history' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">History</h2>
            <div className="space-y-3 mb-8">
              {historyForms.length === 0 && <div className="text-gray-500">No forms submitted yet.</div>}
              {historyForms.map(form => (
                <div key={form.id} className="p-4 rounded-lg border border-blue-200 bg-blue-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-blue-900">{form.title}</div>
                    <div className="text-xs text-gray-500">Type: {form.type}</div>
                    <div className="text-xs text-gray-500">Created: {form.created}</div>
                    <div className="text-xs text-gray-500">Status: <span className="inline-block px-2 py-0.5 rounded bg-blue-200 text-blue-800 text-xs">{form.status}</span></div>
                    <ApprovalTrail form={form} />
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col sm:items-end gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700 mt-2"
                      onClick={() => handleDownloadPDF(form, form.id)}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowForm(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4 text-blue-900">Procurement Requisition Form</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Requestor</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.requestor} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department/Section</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Need-By Date</label>
                    <input type="date" className="mt-1 w-full border rounded px-3 py-2" value={form.needBy} onChange={e => setForm({ ...form, needBy: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject/Purpose</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                  <table className="w-full border text-xs mb-2">
                    <thead>
                      <tr className="bg-blue-200">
                        <th className="border px-2 py-1 text-blue-900 font-bold">No.</th>
                        <th className="border px-2 py-1 text-blue-900 font-bold">Quantity</th>
                        <th className="border px-2 py-1 text-blue-900 font-bold">Unit</th>
                        <th className="border px-2 py-1 text-blue-900 font-bold">Particulars</th>
                        <th className="border px-2 py-1 text-blue-900 font-bold">Unit Price</th>
                        <th className="border px-2 py-1 text-blue-900 font-bold">Total</th>
                        <th className="border px-2 py-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.lineItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1 text-center">{idx + 1}</td>
                          <td className="border px-2 py-1"><input type="number" className="w-16 border rounded px-1" value={item.quantity} onChange={e => handleLineItemChange(idx, 'quantity', e.target.value)} /></td>
                          <td className="border px-2 py-1"><input className="w-16 border rounded px-1" value={item.unit} onChange={e => handleLineItemChange(idx, 'unit', e.target.value)} /></td>
                          <td className="border px-2 py-1"><input className="w-32 border rounded px-1" value={item.particulars} onChange={e => handleLineItemChange(idx, 'particulars', e.target.value)} /></td>
                          <td className="border px-2 py-1"><input type="number" className="w-20 border rounded px-1" value={item.unitPrice} onChange={e => handleLineItemChange(idx, 'unitPrice', e.target.value)} /></td>
                          <td className="border px-2 py-1"><input type="number" className="w-24 border rounded px-1" value={item.total} readOnly /></td>
                          <td className="border px-2 py-1">
                            {form.lineItems.length > 1 && (
                              <button type="button" className="text-red-500 text-xs" onClick={() => removeLineItem(idx)}>-</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" className="text-blue-600 text-xs font-semibold" onClick={addLineItem}>+ Add Line Item</button>
                </div>
                {/* Details/Notes under items */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Details/Notes under items (e.g. Card Names attached, VAT, etc.)</label>
                  <textarea
                    className="mt-1 w-full border rounded px-3 py-2 text-xs"
                    value={form.detailsUnderItems}
                    onChange={e => setForm({ ...form, detailsUnderItems: e.target.value })}
                    placeholder="e.g. Card Names attached, 18% VAT, etc."
                  />
                  {/* Show the text as it will appear under the table */}
                  {form.detailsUnderItems && (
                    <div className="mt-2 text-xs italic text-gray-700 border-t pt-2 whitespace-pre-line">{form.detailsUnderItems}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comments</label>
                  <textarea className="mt-1 w-full border rounded px-3 py-2" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Digital Signature</label>
                  <input type="file" accept="image/*" className="mt-1" onChange={handleSignature} />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Submit Requisition</button>
              </form>
            </div>
          </div>
        )}
        {submittedForm && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-blue-900">Requisition Preview</h2>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 shadow"
                onClick={() => handleDownloadPDF(submittedForm, 0)}
              >
                Download as PDF
              </button>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow max-w-2xl mx-auto text-sm">
              <div className="flex justify-between mb-2">
                <div><span className="font-bold">Requestor:</span> {submittedForm.requestor}</div>
                <div><span className="font-bold">Department:</span> {submittedForm.department}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div><span className="font-bold">Need-By Date:</span> {submittedForm.needBy}</div>
                <div><span className="font-bold">Subject:</span> {submittedForm.subject}</div>
              </div>
              <table className="w-full border text-xs mb-2">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border px-2 py-1 text-blue-900 font-bold">No.</th>
                    <th className="border px-2 py-1 text-blue-900 font-bold">Quantity</th>
                    <th className="border px-2 py-1 text-blue-900 font-bold">Unit</th>
                    <th className="border px-2 py-1 text-blue-900 font-bold">Particulars</th>
                    <th className="border px-2 py-1 text-blue-900 font-bold">Unit Price</th>
                    <th className="border px-2 py-1 text-blue-900 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedForm.lineItems.map((item, idx) => (
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
              {submittedForm.detailsUnderItems && (
                <div className="mt-2 text-xs italic text-gray-700 border-t pt-2 whitespace-pre-line">{submittedForm.detailsUnderItems}</div>
              )}
              <div className="mt-4"><span className="font-bold">Comments:</span> {submittedForm.comments}</div>
              <div className="mt-4 flex items-center">
                <span className="font-bold mr-2">Signature:</span>
                {submittedForm.signature ? (
                  <span className="inline-block border rounded bg-gray-100 px-2 py-1 text-xs">[Signature Uploaded]</span>
                ) : (
                  <span className="text-gray-400 text-xs">No signature uploaded</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 