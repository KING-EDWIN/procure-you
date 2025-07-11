"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// --- Types ---
export type Role = "claimant" | "supervisor" | "procurement" | "gm" | "secretary" | "treasurer";
export type FormType = "requisition" | "payment" | "lpo" | "voucher";

export type PaymentLineItem = { quantity: string; unit: string; particulars: string; unitPrice: string; total: string };
export type LPOItem = { particulars: string; quantity: string; unitPrice: string; amount: string };

export interface RequisitionFormData {
  requestor: string;
  department: string;
  needBy: string;
  subject: string;
  comments: string;
  signature: File | null;
  lineItems: PaymentLineItem[];
  detailsUnderItems: string;
}

export interface PaymentFormData {
  requestor: string;
  department: string;
  needBy: string;
  subject: string;
  comments: string;
  signature: File | null;
  lineItems: PaymentLineItem[];
  detailsUnderItems: string;
  approvals: {
    claimant: { name: string; date: string; signed: boolean };
    procurement: { name: string; date: string; signed: boolean };
    gm: { name: string; date: string; signed: boolean };
    secretary: { name: string; date: string; signed: boolean };
    treasurer: { name: string; date: string; signed: boolean };
  };
}

export interface LPOFormData {
  orderNo: string;
  supplierName: string;
  orderDate: string;
  modeOfPayment: string;
  deliveryDate: string;
  items: LPOItem[];
  grandTotal: string;
  preparedBy: string;
  verifiedBy: string;
  verifiedDate: string;
  approvedBy: string;
  authorisedBy: string;
}

export interface VoucherFormData {
  voucherNo: string;
  date: string;
  payee: string;
  chequeNo: string;
  bank: string;
  particulars: string;
  amount: string;
  amountWords: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  receivedBy: string;
  honTreasurer: string;
  honSecretary: string;
}

export type WorkflowFormData =
  | ({ type: "requisition" } & RequisitionFormData)
  | ({ type: "payment" } & PaymentFormData)
  | ({ type: "lpo" } & LPOFormData)
  | ({ type: "voucher" } & VoucherFormData);

export interface WorkflowForm {
  id: number;
  type: FormType;
  title: string;
  created: string;
  status: string;
  currentRole: Role;
  history: { role: Role; date: string; action: string; signature?: string }[];
  data: WorkflowFormData;
}

interface WorkflowContextType {
  forms: WorkflowForm[];
  addForm: (form: Omit<WorkflowForm, "id" | "created" | "history">) => void;
  signAndSend: (id: number, signature: string, nextRole: Role, status: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialForms: WorkflowForm[] = [
  {
    id: 1001,
    type: "requisition",
    title: "Test Office Supplies",
    created: "2025-06-20",
    status: "Awaiting Supervisor Approval",
    currentRole: "supervisor",
    history: [
      {
        role: "claimant",
        date: "2025-06-20",
        action: "signed & sent",
        signature: JSON.stringify({ name: "Nwesige Joann", signatureUrl: "" }),
      },
    ],
    data: {
      type: "requisition",
      requestor: "Nwesige Joann",
      department: "Maintenance/IT",
      needBy: "2025-06-25",
      subject: "Office Supplies",
      comments: "Urgent for monthly reports",
      signature: null,
      lineItems: [
        { quantity: "10", unit: "Boxes", particulars: "A4 Paper", unitPrice: "20000", total: "200000" },
      ],
      detailsUnderItems: "Urgent for monthly reports",
    },
  },
  // Procurement Officer inbox
  {
    id: 1002,
    type: "requisition",
    title: "Printer Purchase",
    created: "2025-06-19",
    status: "Awaiting Procurement Officer Action",
    currentRole: "procurement",
    history: [
      { role: "claimant", date: "2025-06-19", action: "signed & sent", signature: JSON.stringify({ name: "Alice", signatureUrl: "" }) },
      { role: "supervisor", date: "2025-06-19", action: "signed & sent", signature: JSON.stringify({ name: "Bob", signatureUrl: "" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Alice",
      department: "IT",
      needBy: "2025-06-30",
      subject: "Printer Purchase",
      comments: "Color printer needed",
      signature: null,
      lineItems: [
        { quantity: "1", unit: "Unit", particulars: "HP Color Printer", unitPrice: "800000", total: "800000" },
      ],
      detailsUnderItems: "For graphics team",
    },
  },
  // General Manager inbox
  {
    id: 1003,
    type: "requisition",
    title: "Laptop Upgrade",
    created: "2025-06-18",
    status: "Awaiting General Manager Approval",
    currentRole: "gm",
    history: [
      { role: "claimant", date: "2025-06-18", action: "signed & sent", signature: JSON.stringify({ name: "Chris", signatureUrl: "" }) },
      { role: "supervisor", date: "2025-06-18", action: "signed & sent", signature: JSON.stringify({ name: "Diana", signatureUrl: "" }) },
      { role: "procurement", date: "2025-06-18", action: "signed & sent", signature: JSON.stringify({ name: "Eve", signatureUrl: "" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Chris",
      department: "Finance",
      needBy: "2025-07-01",
      subject: "Laptop Upgrade",
      comments: "For new accounting software",
      signature: null,
      lineItems: [
        { quantity: "2", unit: "Units", particulars: "Dell Latitude", unitPrice: "2500000", total: "5000000" },
      ],
      detailsUnderItems: "Urgent for Q3 reporting",
    },
  },
  // Secretary inbox
  {
    id: 1004,
    type: "requisition",
    title: "Meeting Room Chairs",
    created: "2025-06-17",
    status: "Awaiting Hon. Secretary Approval",
    currentRole: "secretary",
    history: [
      { role: "claimant", date: "2025-06-17", action: "signed & sent", signature: JSON.stringify({ name: "Faith", signatureUrl: "" }) },
      { role: "supervisor", date: "2025-06-17", action: "signed & sent", signature: JSON.stringify({ name: "George", signatureUrl: "" }) },
      { role: "procurement", date: "2025-06-17", action: "signed & sent", signature: JSON.stringify({ name: "Helen", signatureUrl: "" }) },
      { role: "gm", date: "2025-06-17", action: "signed & sent", signature: JSON.stringify({ name: "Isaac", signatureUrl: "" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Faith",
      department: "Admin",
      needBy: "2025-07-05",
      subject: "Meeting Room Chairs",
      comments: "Replace old chairs",
      signature: null,
      lineItems: [
        { quantity: "20", unit: "Units", particulars: "Ergonomic Chair", unitPrice: "150000", total: "3000000" },
      ],
      detailsUnderItems: "For main boardroom",
    },
  },
  // Treasurer inbox
  {
    id: 1005,
    type: "requisition",
    title: "Projector Replacement",
    created: "2025-06-16",
    status: "Awaiting Hon. Treasurer Approval",
    currentRole: "treasurer",
    history: [
      { role: "claimant", date: "2025-06-16", action: "signed & sent", signature: JSON.stringify({ name: "Joy", signatureUrl: "" }) },
      { role: "supervisor", date: "2025-06-16", action: "signed & sent", signature: JSON.stringify({ name: "Ken", signatureUrl: "" }) },
      { role: "procurement", date: "2025-06-16", action: "signed & sent", signature: JSON.stringify({ name: "Liam", signatureUrl: "" }) },
      { role: "gm", date: "2025-06-16", action: "signed & sent", signature: JSON.stringify({ name: "Mona", signatureUrl: "" }) },
      { role: "secretary", date: "2025-06-16", action: "signed & sent", signature: JSON.stringify({ name: "Nina", signatureUrl: "" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Joy",
      department: "Events",
      needBy: "2025-07-10",
      subject: "Projector Replacement",
      comments: "Old projector is faulty",
      signature: null,
      lineItems: [
        { quantity: "1", unit: "Unit", particulars: "Epson Projector", unitPrice: "1800000", total: "1800000" },
      ],
      detailsUnderItems: "For conference hall",
    },
  },
  {
    id: 1006,
    type: "requisition",
    title: "Demo: Full Approval Trail Example",
    created: "2025-06-15",
    status: "Awaiting Hon. Treasurer Approval",
    currentRole: "treasurer",
    history: [
      { role: "claimant", date: "2025-06-15", action: "signed & sent", signature: JSON.stringify({ name: "Edwin King", signatureUrl: "https://ui-avatars.com/api/?name=Edwin+King" }) },
      { role: "supervisor", date: "2025-06-15", action: "signed & sent", signature: JSON.stringify({ name: "Sarah Supervisor", signatureUrl: "https://ui-avatars.com/api/?name=Sarah+Supervisor" }) },
      { role: "procurement", date: "2025-06-15", action: "signed & sent", signature: JSON.stringify({ name: "Paul Procurement", signatureUrl: "https://ui-avatars.com/api/?name=Paul+Procurement" }) },
      { role: "gm", date: "2025-06-15", action: "signed & sent", signature: JSON.stringify({ name: "Grace Manager", signatureUrl: "https://ui-avatars.com/api/?name=Grace+Manager" }) },
      { role: "secretary", date: "2025-06-15", action: "signed & sent", signature: JSON.stringify({ name: "Helen Secretary", signatureUrl: "https://ui-avatars.com/api/?name=Helen+Secretary" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Edwin King",
      department: "Research & Development",
      needBy: "2025-07-20",
      subject: "Demo Procurement for Laptops & Accessories",
      comments: "Demo for full approval trail and signatures.",
      signature: null,
      lineItems: [
        { quantity: "5", unit: "Laptops", particulars: "Dell XPS 13, 16GB RAM, 512GB SSD", unitPrice: "4500000", total: "22500000" },
        { quantity: "5", unit: "Docking Stations", particulars: "Dell Thunderbolt Dock", unitPrice: "800000", total: "4000000" },
        { quantity: "5", unit: "Monitors", particulars: "Dell 24'' UltraSharp", unitPrice: "1200000", total: "6000000" },
      ],
      detailsUnderItems: "All items for new R&D team onboarding.",
    },
  },
  // Add more diverse dummy data for analytics
  {
    id: 2001,
    type: "requisition",
    title: "Printer Toner Purchase",
    created: "2025-01-10",
    status: "Approved by Treasurer",
    currentRole: "treasurer",
    history: [
      { role: "claimant", date: "2025-01-10", action: "signed & sent", signature: JSON.stringify({ name: "Alice", signatureUrl: "https://ui-avatars.com/api/?name=Alice" }) },
      { role: "supervisor", date: "2025-01-11", action: "signed & sent", signature: JSON.stringify({ name: "Bob Supervisor", signatureUrl: "https://ui-avatars.com/api/?name=Bob+Supervisor" }) },
      { role: "procurement", date: "2025-01-12", action: "signed & sent", signature: JSON.stringify({ name: "Cathy Procurement", signatureUrl: "https://ui-avatars.com/api/?name=Cathy+Procurement" }) },
      { role: "gm", date: "2025-01-13", action: "signed & sent", signature: JSON.stringify({ name: "David GM", signatureUrl: "https://ui-avatars.com/api/?name=David+GM" }) },
      { role: "secretary", date: "2025-01-14", action: "signed & sent", signature: JSON.stringify({ name: "Eve Secretary", signatureUrl: "https://ui-avatars.com/api/?name=Eve+Secretary" }) },
      { role: "treasurer", date: "2025-01-15", action: "approved", signature: JSON.stringify({ name: "Frank Treasurer", signatureUrl: "https://ui-avatars.com/api/?name=Frank+Treasurer" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Alice",
      department: "IT",
      needBy: "2025-01-20",
      subject: "Printer Toner",
      comments: "Urgent for office printers",
      signature: null,
      lineItems: [
        { quantity: "5", unit: "Toner", particulars: "HP 26A Black", unitPrice: "350000", total: "1750000" },
        { quantity: "2", unit: "Toner", particulars: "HP 26A Color", unitPrice: "400000", total: "800000" },
      ],
      detailsUnderItems: "For all office printers",
    },
  },
  {
    id: 2002,
    type: "requisition",
    title: "Conference Catering",
    created: "2025-02-05",
    status: "Awaiting GM Approval",
    currentRole: "gm",
    history: [
      { role: "claimant", date: "2025-02-05", action: "signed & sent", signature: JSON.stringify({ name: "Grace", signatureUrl: "https://ui-avatars.com/api/?name=Grace" }) },
      { role: "supervisor", date: "2025-02-06", action: "signed & sent", signature: JSON.stringify({ name: "Henry Supervisor", signatureUrl: "https://ui-avatars.com/api/?name=Henry+Supervisor" }) },
      { role: "procurement", date: "2025-02-07", action: "signed & sent", signature: JSON.stringify({ name: "Ivy Procurement", signatureUrl: "https://ui-avatars.com/api/?name=Ivy+Procurement" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Grace",
      department: "Events",
      needBy: "2025-02-15",
      subject: "Catering for Conference",
      comments: "Buffet for 50 people",
      signature: null,
      lineItems: [
        { quantity: "50", unit: "Person", particulars: "Buffet Lunch", unitPrice: "40000", total: "2000000" },
        { quantity: "50", unit: "Person", particulars: "Buffet Dinner", unitPrice: "50000", total: "2500000" },
      ],
      detailsUnderItems: "Vegetarian options included",
    },
  },
  {
    id: 2003,
    type: "requisition",
    title: "Stationery Restock",
    created: "2025-03-12",
    status: "Awaiting Secretary Approval",
    currentRole: "secretary",
    history: [
      { role: "claimant", date: "2025-03-12", action: "signed & sent", signature: JSON.stringify({ name: "Isaac", signatureUrl: "https://ui-avatars.com/api/?name=Isaac" }) },
      { role: "supervisor", date: "2025-03-13", action: "signed & sent", signature: JSON.stringify({ name: "Janet Supervisor", signatureUrl: "https://ui-avatars.com/api/?name=Janet+Supervisor" }) },
      { role: "procurement", date: "2025-03-14", action: "signed & sent", signature: JSON.stringify({ name: "Kevin Procurement", signatureUrl: "https://ui-avatars.com/api/?name=Kevin+Procurement" }) },
      { role: "gm", date: "2025-03-15", action: "signed & sent", signature: JSON.stringify({ name: "Linda GM", signatureUrl: "https://ui-avatars.com/api/?name=Linda+GM" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Isaac",
      department: "Admin",
      needBy: "2025-03-20",
      subject: "Stationery",
      comments: "Monthly restock",
      signature: null,
      lineItems: [
        { quantity: "10", unit: "Ream", particulars: "A4 Paper", unitPrice: "18000", total: "180000" },
        { quantity: "20", unit: "Pen", particulars: "Blue Ballpoint", unitPrice: "2000", total: "40000" },
        { quantity: "5", unit: "Box", particulars: "Staples", unitPrice: "5000", total: "25000" },
      ],
      detailsUnderItems: "For all departments",
    },
  },
  {
    id: 2004,
    type: "requisition",
    title: "IT Equipment Upgrade",
    created: "2025-04-18",
    status: "Awaiting Treasurer Approval",
    currentRole: "treasurer",
    history: [
      { role: "claimant", date: "2025-04-18", action: "signed & sent", signature: JSON.stringify({ name: "Moses", signatureUrl: "https://ui-avatars.com/api/?name=Moses" }) },
      { role: "supervisor", date: "2025-04-19", action: "signed & sent", signature: JSON.stringify({ name: "Nina Supervisor", signatureUrl: "https://ui-avatars.com/api/?name=Nina+Supervisor" }) },
      { role: "procurement", date: "2025-04-20", action: "signed & sent", signature: JSON.stringify({ name: "Oscar Procurement", signatureUrl: "https://ui-avatars.com/api/?name=Oscar+Procurement" }) },
      { role: "gm", date: "2025-04-21", action: "signed & sent", signature: JSON.stringify({ name: "Pam GM", signatureUrl: "https://ui-avatars.com/api/?name=Pam+GM" }) },
      { role: "secretary", date: "2025-04-22", action: "signed & sent", signature: JSON.stringify({ name: "Quinn Secretary", signatureUrl: "https://ui-avatars.com/api/?name=Quinn+Secretary" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Moses",
      department: "IT",
      needBy: "2025-04-30",
      subject: "Laptops & Accessories",
      comments: "Upgrade for dev team",
      signature: null,
      lineItems: [
        { quantity: "3", unit: "Laptop", particulars: "Dell XPS 15", unitPrice: "7000000", total: "21000000" },
        { quantity: "3", unit: "Dock", particulars: "Dell Thunderbolt Dock", unitPrice: "900000", total: "2700000" },
      ],
      detailsUnderItems: "For new hires",
    },
  },
  {
    id: 2005,
    type: "requisition",
    title: "Cleaning Supplies",
    created: "2025-05-10",
    status: "Awaiting Supervisor Approval",
    currentRole: "supervisor",
    history: [
      { role: "claimant", date: "2025-05-10", action: "signed & sent", signature: JSON.stringify({ name: "Rita", signatureUrl: "https://ui-avatars.com/api/?name=Rita" }) },
    ],
    data: {
      type: "requisition",
      requestor: "Rita",
      department: "Facilities",
      needBy: "2025-05-15",
      subject: "Cleaning Supplies",
      comments: "Monthly cleaning stock",
      signature: null,
      lineItems: [
        { quantity: "10", unit: "Bottle", particulars: "Disinfectant", unitPrice: "8000", total: "80000" },
        { quantity: "5", unit: "Pack", particulars: "Mop Heads", unitPrice: "12000", total: "60000" },
      ],
      detailsUnderItems: "For all cleaning staff",
    },
  },
];

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<WorkflowForm[]>(initialForms);

  // Add a new form (from claimant or procurement officer)
  const addForm = (form: Omit<WorkflowForm, "id" | "created" | "history">) => {
    setForms(prev => [
      {
        ...form,
        id: Date.now(),
        created: new Date().toISOString().slice(0, 10),
        history: [],
      },
      ...prev,
    ]);
  };

  // Sign and send to next role
  const signAndSend = (id: number, signature: string, nextRole: Role, status: string) => {
    setForms(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              currentRole: nextRole,
              status,
              history: [
                ...f.history,
                { role: f.currentRole, date: new Date().toISOString().slice(0, 10), action: "signed & sent", signature },
              ],
            }
          : f
      )
    );
  };

  return (
    <WorkflowContext.Provider value={{ forms, addForm, signAndSend }}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used within a WorkflowProvider");
  return ctx;
} 