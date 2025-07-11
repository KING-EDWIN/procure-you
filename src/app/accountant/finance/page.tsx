"use client";

import React, { useState } from "react";
import DashboardLayout from "../../dashboard-layout";

// Mock data for accountant's financial documents
const mockPaymentRequisitions = [
  {
    id: "PAY-001",
    date: "2024-01-15",
    requestor: "John Doe",
    purpose: "Office Supplies",
    amount: 500000,
    status: "Pending Accountant Review",
    approvalLevel: "Accountant",
  },
  {
    id: "PAY-002",
    date: "2024-01-14",
    requestor: "Jane Smith",
    purpose: "Travel Expenses",
    amount: 1200000,
    status: "Pending GM Approval",
    approvalLevel: "General Manager",
  },
  {
    id: "PAY-003",
    date: "2024-01-13",
    requestor: "Mike Johnson",
    purpose: "Equipment Maintenance",
    amount: 800000,
    status: "Pending Secretary Approval",
    approvalLevel: "Hon. Secretary",
  },
  {
    id: "PAY-004",
    date: "2024-01-12",
    requestor: "Sarah Wilson",
    purpose: "Service Payment",
    amount: 1500000,
    status: "Pending Treasurer Approval",
    approvalLevel: "Hon. Treasurer",
  },
  {
    id: "PAY-005",
    date: "2024-01-11",
    requestor: "David Brown",
    purpose: "Contract Payment",
    amount: 2000000,
    status: "Approved - Ready for Payment",
    approvalLevel: "Complete",
  },
];

const mockLocalPurchaseOrders = [
  {
    id: "LPO-001",
    date: "2024-01-15",
    supplier: "ABC Supplies Ltd",
    purpose: "Office Equipment",
    amount: 800000,
    status: "Pending Payment",
    paymentStatus: "Pending",
  },
  {
    id: "LPO-002",
    date: "2024-01-14",
    supplier: "XYZ Services",
    purpose: "IT Services",
    amount: 1500000,
    status: "Payment Proof Required",
    paymentStatus: "Paid - Proof Pending",
  },
  {
    id: "LPO-003",
    date: "2024-01-13",
    supplier: "Tech Solutions",
    purpose: "Software Licenses",
    amount: 500000,
    status: "Completed",
    paymentStatus: "Completed",
  },
];

export default function AccountantFinancePage() {
  const [activeTab, setActiveTab] = useState("payment-requisitions");
  const [showNewLPO, setShowNewLPO] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Accountant Review":
        return "bg-yellow-100 text-yellow-800";
      case "Pending GM Approval":
        return "bg-blue-100 text-blue-800";
      case "Pending Secretary Approval":
        return "bg-pink-100 text-pink-800";
      case "Pending Treasurer Approval":
        return "bg-red-100 text-red-800";
      case "Approved - Ready for Payment":
        return "bg-green-100 text-green-800";
      case "Pending Payment":
        return "bg-orange-100 text-orange-800";
      case "Payment Proof Required":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Paid - Proof Pending":
        return "bg-orange-100 text-orange-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = (document: any) => {
    setSelectedDocument(document);
    setShowApprovalModal(true);
  };

  return (
    <DashboardLayout userRole="accountant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Management</h1>
            <p className="text-gray-600">Manage all payment requisitions and local purchase orders</p>
          </div>
          <button
            onClick={() => setShowNewLPO(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            + New Local Purchase Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payment Req.</p>
                <p className="text-2xl font-bold text-gray-900">{mockPaymentRequisitions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Local Purchase Orders</p>
                <p className="text-2xl font-bold text-gray-900">{mockLocalPurchaseOrders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockPaymentRequisitions.filter(r => r.status.includes("Pending")).length}
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
                <p className="text-sm font-medium text-gray-600">Ready for Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockPaymentRequisitions.filter(r => r.status === "Approved - Ready for Payment").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("payment-requisitions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payment-requisitions"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payment Requisitions
              </button>
              <button
                onClick={() => setActiveTab("local-purchase-orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "local-purchase-orders"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Local Purchase Orders
              </button>
            </nav>
          </div>

          {/* Payment Requisitions Tab */}
          {activeTab === "payment-requisitions" && (
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
                      Requestor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approval Level
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
                  {mockPaymentRequisitions.map((requisition) => (
                    <tr key={requisition.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {requisition.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requisition.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requisition.requestor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requisition.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        UGX {requisition.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requisition.approvalLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(requisition.status)}`}>
                          {requisition.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {requisition.status === "Pending Accountant Review" && (
                          <button 
                            onClick={() => handleApprove(requisition)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Review
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900">Download PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Local Purchase Orders Tab */}
          {activeTab === "local-purchase-orders" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LPO ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
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
                  {mockLocalPurchaseOrders.map((lpo) => (
                    <tr key={lpo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lpo.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lpo.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lpo.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lpo.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        UGX {lpo.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(lpo.paymentStatus)}`}>
                          {lpo.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lpo.status)}`}>
                          {lpo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        {lpo.paymentStatus === "Paid - Proof Pending" && (
                          <button className="text-purple-600 hover:text-purple-900 mr-3">Upload Proof</button>
                        )}
                        <button className="text-green-600 hover:text-green-900">Download PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New LPO Modal */}
        {showNewLPO && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">New Local Purchase Order</h3>
                  <button
                    onClick={() => setShowNewLPO(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-center py-8">
                  <p className="text-gray-600">Local Purchase Order form will be implemented here</p>
                  <button
                    onClick={() => setShowNewLPO(false)}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedDocument && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Review {selectedDocument.id}</h3>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Requestor</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.requestor}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="mt-1 text-sm text-gray-900">UGX {selectedDocument.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Purpose</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.purpose}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowApprovalModal(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Reject
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Approve & Send to GM
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 