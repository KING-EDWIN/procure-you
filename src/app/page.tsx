import React from "react";
import Image from "next/image";

const roles = [
  {
    key: "department-head",
    label: "Department Head",
    description: "Create procurement requisitions and payment requests for your department.",
    color: "bg-blue-600",
  },
  {
    key: "procurement-officer",
    label: "Procurement Officer",
    description: "Review procurement requisitions and create local purchase orders.",
    color: "bg-green-600",
  },
  {
    key: "accountant",
    label: "Accountant",
    description: "Manage all payment requisitions, local purchase orders, and payments.",
    color: "bg-purple-600",
  },
  {
    key: "general-manager",
    label: "General Manager",
    description: "Final approval for procurement and financial documents.",
    color: "bg-yellow-600",
  },
  {
    key: "hon-secretary",
    label: "Hon. Secretary",
    description: "Approve payment requisitions and local purchase orders.",
    color: "bg-pink-600",
  },
  {
    key: "hon-treasurer",
    label: "Hon. Treasurer",
    description: "Final financial approval for all payment documents.",
    color: "bg-red-600",
  },
  {
    key: "inventory-manager",
    label: "Inventory Manager",
    description: "Manage inventory, track stock levels, and handle notifications.",
    color: "bg-indigo-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="flex flex-col items-center mb-8">
          <Image src="/next.svg" alt="Logo" width={120} height={40} className="mb-2" />
          <h1 className="text-3xl font-bold text-blue-900 mb-1 tracking-tight">Kampala Club Procurement System</h1>
          <p className="text-gray-500 text-lg">Select your role to begin the demo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {roles.map((role) => (
            <a
              key={role.key}
              href={`/${role.key}`}
              className={`rounded-xl shadow-md p-6 flex flex-col items-start transition-transform hover:scale-105 border-2 border-transparent hover:border-blue-400 ${role.color} text-white`}
          >
              <span className="text-xl font-semibold mb-1">{role.label}</span>
              <span className="text-sm opacity-90 mb-2">{role.description}</span>
              <span className="mt-auto text-xs bg-white/20 rounded px-2 py-1">Enter as {role.label}</span>
            </a>
          ))}
        </div>
      </div>
      <footer className="mt-10 text-gray-400 text-xs">Demo for Kampala Club Limited &copy; {new Date().getFullYear()}</footer>
    </div>
  );
}
