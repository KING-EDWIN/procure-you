"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProcurementOfficerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to procurement tab by default
    router.push("/procurement-officer/procurement");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Procurement Officer Dashboard...</p>
      </div>
    </div>
  );
} 