"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardLayoutProps {
  userRole: string;
  children: React.ReactNode;
}

interface TabConfig {
  key: string;
  label: string;
  icon: string;
  roles: string[];
}

const tabs: TabConfig[] = [
  {
    key: "procurement",
    label: "Procurement",
    icon: "📋",
    roles: ["department-head", "procurement-officer", "accountant", "general-manager"],
  },
  {
    key: "finance",
    label: "Finance",
    icon: "💰",
    roles: ["department-head", "procurement-officer", "accountant", "general-manager", "hon-secretary", "hon-treasurer"],
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: "📦",
    roles: ["accountant", "general-manager", "hon-secretary", "hon-treasurer", "inventory-manager"],
  },
];

export default function DashboardLayout({ userRole, children }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("procurement");
  const router = useRouter();

  // Get available tabs for this user role
  const availableTabs = tabs.filter(tab => tab.roles.includes(userRole));

  // Set initial active tab to first available tab
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.key === activeTab)) {
      setActiveTab(availableTabs[0].key);
    }
  }, [userRole, availableTabs, activeTab]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    // Navigate to the appropriate route based on role and tab
    router.push(`/${userRole}/${tabKey}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Kampala Club Procurement System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Logged in as: <span className="font-medium text-gray-900">{userRole.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </span>
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {availableTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
} 