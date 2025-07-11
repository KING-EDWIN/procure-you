"use client";

import React, { useState } from "react";
import DashboardLayout from "../../dashboard-layout";

// Interface definitions
interface PaymentRequisition {
  id: string;
  date: string;
  department: string;
  requestor: string;
  description: string;
  amount: number;
  status: string;
  type: string;
}

interface LocalPurchaseOrder {
  id: string;
  date: string;
  supplier: string;
  description: string;
  amount: number;
  status: string;
  type: string;
}

// Mock data for General Manager's finance approvals
const mockPaymentRequisitions = [
  {
    id: "PR-001",
    date: "2024-01-15",
    department: "IT Department",
    requestor: "John Doe",
    description: "Computer equipment purchase",
    amount: 1500000,
    status: "Pending GM Approval",
    type: "Payment Requisition",
  },
  {
    id: "PR-002",
    date: "2024-01-14",
    department: "Marketing Department",
    requestor: "Jane Smith",
    description: "Marketing materials",
    amount: 800000,
    status: "Pending GM Approval",
    type: "Payment Requisition",
  },
];

const mockLocalPurchaseOrders = [
  {
    id: "LPO-001",
    date: "2024-01-15",
    supplier: "Tech Solutions Ltd",
    description: "Computer equipment",
    amount: 1500000,
    status: "Pending GM Approval",
    type: "Local Purchase Order",
  },
  {
    id: "LPO-002",
    date: "2024-01-14",
    supplier: "Office Supplies Co",
    description: "Office furniture",
    amount: 1200000,
    status: "Approved by GM",
    type: "Local Purchase Order",
  },
];

export default function GeneralManagerFinancePage() {
  const [selectedItem, setSelectedItem] = useState<PaymentRequisition | LocalPurchaseOrder | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [activeTab, setActiveTab] = useState("payment-requisitions");

  const allItems = [...mockPaymentRequisitions, ...mockLocalPurchaseOrders];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending GM Approval":
        return "bg-yellow-100 text-yellow-800";
      case "Approved by GM":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApprove = (item: PaymentRequisition | LocalPurchaseOrder) => {
    setSelectedItem(item);
    setShowApprovalModal(true);
  };

  const filteredItems = activeTab === "payment-requisitions" 
    ? mockPaymentRequisitions 
    : mockLocalPurchaseOrders;

  return (
    <DashboardLayout userRole="general-manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Approval</h1>
            <p className="text-gray-600">Approve payment requisitions and local purchase orders</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allItems.filter(item => item.status === "Pending GM Approval").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payment Requisitions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockPaymentRequisitions.filter(r => r.status === "Pending GM Approval").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">📄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Purchase Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockLocalPurchaseOrders.filter(po => po.status === "Pending GM Approval").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  UGX {(allItems.reduce((sum, item) => sum + item.amount, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("payment-requisitions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payment-requisitions"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payment Requisitions
              </button>
              <button
                onClick={() => setActiveTab("purchase-orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "purchase-orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Local Purchase Orders
              </button>
            </nav>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === "payment-requisitions" ? "Department" : "Supplier"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === "payment-requisitions" ? "Requestor" : "Description"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === "payment-requisitions" ? "Description" : "Amount"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activeTab === "payment-requisitions" ? (item as PaymentRequisition).department : (item as LocalPurchaseOrder).supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activeTab === "payment-requisitions" ? (item as PaymentRequisition).requestor : item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activeTab === "payment-requisitions" ? item.description : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      UGX {item.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.status === "Pending GM Approval" && (
                        <button 
                          onClick={() => handleApprove(item)}
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
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Review {selectedItem.type} {selectedItem.id}</h3>
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
                      <label className="block text-sm font-medium text-gray-700">
                        {selectedItem.type === "Payment Requisition" ? "Department" : "Supplier"}
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedItem.type === "Payment Requisition" 
                          ? (selectedItem as PaymentRequisition).department 
                          : (selectedItem as LocalPurchaseOrder).supplier}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {selectedItem.type === "Payment Requisition" ? "Requestor" : "Description"}
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedItem.type === "Payment Requisition" 
                          ? (selectedItem as PaymentRequisition).requestor 
                          : selectedItem.description}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="mt-1 text-sm text-gray-900">UGX {selectedItem.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedItem.date}</p>
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
                      Approve
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