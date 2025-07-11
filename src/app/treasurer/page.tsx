"use client";

import React, { useState } from "react";
import { useWorkflow } from "../workflow-context";

const roleIcon = (
  <span className="inline-block bg-orange-100 text-orange-600 rounded-full p-2 mr-2">
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2"/></svg>
  </span>
);

export default function TreasurerDashboard() {
  const { forms, signAndSend } = useWorkflow();
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string>("");

  // Only show forms where currentRole is 'treasurer'
  const inbox = forms.filter(f => f.currentRole === "treasurer");

  // Compute enhanced stats for Treasurer
  const treasurerName = "Paul Treasurer"; // You can make this dynamic if needed
  const handledForms = forms.filter(f => f.history.some((h: any) => h.role === 'treasurer'));
  const approvedForms = handledForms.filter(f => f.status.toLowerCase().includes('approved'));
  const rejectedForms = handledForms.filter(f => f.status.toLowerCase().includes('rejected'));
  const avgApprovalTime = (() => {
    const times = handledForms.map(f => {
      const treasurerEntry = f.history.find((h: any) => h.role === 'treasurer');
      if (!treasurerEntry) return null;
      const created = new Date(f.created).getTime();
      const approvedDate = new Date(treasurerEntry.date).getTime();
      return (approvedDate - created) / (1000 * 60 * 60 * 24); // days
    }).filter((v): v is number => v !== null);
    if (!times.length) return null;
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
  })();

  // Approval trail mini component
  const ApprovalTrail = ({ form }: { form: any }) => {
    const steps = ['claimant', 'supervisor', 'procurement', 'gm', 'secretary', 'treasurer'];
    return (
      <div className="flex items-center gap-1 mt-2">
        {steps.map((role, idx) => {
          const done = form.history.some((h: any) => h.role === role);
          return <span key={role} className={`w-2 h-2 rounded-full ${done ? 'bg-orange-500' : 'bg-gray-200'}`}></span>;
        })}
      </div>
    );
  };

  const handleSign = (form: any) => {
    setSelectedForm(form);
    setShowModal(true);
    setName("");
    setSignatureFile(null);
    setSignatureUrl("");
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSignatureFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setSignatureUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setSignatureUrl("");
    }
  };

  const handleSendToNext = (id: number) => {
    if (!name || !signatureUrl) return;
    signAndSend(id, JSON.stringify({ name, signatureUrl }), "procurement", "Returned to Procurement Officer");
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border border-orange-100 mt-8">
        <div className="flex items-center mb-4">
          {roleIcon}
          <div>
            <h1 className="text-2xl font-bold text-orange-900">Hon. Treasurer Dashboard</h1>
            <div className="text-gray-600 text-sm">Review and sign forms awaiting your action.</div>
          </div>
        </div>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-700">{inbox.length}</div>
            <div className="text-xs text-orange-700">Awaiting Your Action</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-500">{handledForms.length}</div>
            <div className="text-xs text-orange-500">Total Handled</div>
          </div>
          <div className="bg-green-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-700">{approvedForms.length}</div>
            <div className="text-xs text-green-700">Approved</div>
          </div>
          <div className="bg-red-100 rounded-xl p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-700">{rejectedForms.length}</div>
            <div className="text-xs text-red-700">Rejected</div>
          </div>
          <div className="bg-yellow-100 rounded-xl p-4 flex flex-col items-center col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-yellow-700">{avgApprovalTime ? `${avgApprovalTime} days` : '--'}</div>
            <div className="text-xs text-yellow-700">Avg. Approval Time</div>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-2">Inbox</h2>
        <div className="space-y-3 mb-8">
          {inbox.length === 0 && <div className="text-gray-500">No forms awaiting your action.</div>}
          {inbox.map(form => (
            <div key={form.id} className="p-4 rounded-lg border border-orange-200 bg-orange-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-orange-900">{form.title}</div>
                <div className="text-xs text-gray-500">Type: {form.type}</div>
                <div className="text-xs text-gray-500">Created: {form.created}</div>
                <div className="text-xs text-gray-500">Status: <span className="inline-block px-2 py-0.5 rounded bg-orange-200 text-orange-800 text-xs">{form.status}</span></div>
                <ApprovalTrail form={form} />
              </div>
              <div className="mt-2 sm:mt-0 flex flex-col sm:items-end gap-2">
                <button className="bg-orange-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-orange-700 mt-2" onClick={() => handleSign(form)}>View & Sign</button>
              </div>
            </div>
          ))}
        </div>
        {showModal && selectedForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button className="sticky top-3 right-3 float-right text-gray-400 hover:text-gray-700 z-10" onClick={() => setShowModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4 text-orange-900">Sign Form</h2>
              {/* Render the full form in a readable layout */}
              <div className="mb-6">
                <div className="font-semibold text-lg mb-2">{selectedForm.title}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  <div><span className="font-semibold">Type:</span> {selectedForm.type}</div>
                  <div><span className="font-semibold">Created:</span> {selectedForm.created}</div>
                  <div><span className="font-semibold">Requestor:</span> {selectedForm.data.requestor}</div>
                  <div><span className="font-semibold">Department:</span> {selectedForm.data.department}</div>
                  <div><span className="font-semibold">Need By:</span> {selectedForm.data.needBy}</div>
                  <div><span className="font-semibold">Subject:</span> {selectedForm.data.subject}</div>
                </div>
                <div className="mb-2"><span className="font-semibold">Comments:</span> {selectedForm.data.comments}</div>
                <div className="mb-2"><span className="font-semibold">Details/Notes:</span> {selectedForm.data.detailsUnderItems}</div>
                {/* Line Items Table */}
                <div className="mb-4">
                  <div className="font-semibold mb-1">Line Items</div>
                  <table className="w-full border text-xs mb-2">
                    <thead>
                      <tr className="bg-orange-200">
                        <th className="border px-2 py-1">No.</th>
                        <th className="border px-2 py-1">Quantity</th>
                        <th className="border px-2 py-1">Unit</th>
                        <th className="border px-2 py-1">Particulars</th>
                        <th className="border px-2 py-1">Unit Price</th>
                        <th className="border px-2 py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedForm.data.lineItems && selectedForm.data.lineItems.map((item: any, idx: number) => (
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
                </div>
              </div>
              {/* Approval Trail with Signatures */}
              <div className="mb-6">
                <div className="font-semibold mb-2 text-orange-900">Approval Trail & Signatures</div>
                <div className="space-y-2">
                  {selectedForm.history && selectedForm.history.map((entry: any, idx: number) => {
                    const signatureData = entry.signature ? JSON.parse(entry.signature) : null;
                    return (
                      <div key={idx} className="flex items-center gap-4 border rounded p-2 bg-orange-50">
                        <div className="font-semibold capitalize w-32">{entry.role}</div>
                        <div className="flex-1">
                          <div className="text-sm">{signatureData?.name || <span className='italic text-gray-400'>No name</span>}</div>
                          <div className="text-xs text-gray-500">{entry.date} • {entry.action}</div>
                        </div>
                        {signatureData?.signatureUrl && (
                          <img src={signatureData.signatureUrl} alt="Signature" className="h-10 border bg-white" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Signature input for current user */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                <input className="mt-1 w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Upload Signature Image</label>
                <input type="file" accept="image/*" className="mt-1" onChange={handleSignatureUpload} />
                {signatureUrl && <img src={signatureUrl} alt="Signature preview" className="mt-2 h-12" />}
              </div>
              <button className="bg-orange-600 text-white px-4 py-2 rounded font-semibold hover:bg-orange-700 w-full" onClick={() => handleSendToNext(selectedForm.id)}>Sign & Return to Procurement Officer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 