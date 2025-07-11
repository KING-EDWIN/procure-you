"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GeneralManagerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to procurement tab by default
    router.push("/general-manager/procurement");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading General Manager Dashboard...</p>
      </div>
    </div>
  );
} 