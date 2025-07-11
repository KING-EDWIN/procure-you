"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InventoryManagerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to inventory tab by default
    router.push("/inventory-manager/inventory");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Inventory Manager Dashboard...</p>
      </div>
    </div>
  );
} 