"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HonTreasurerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to finance tab by default
    router.push("/hon-treasurer/finance");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Hon. Treasurer Dashboard...</p>
      </div>
    </div>
  );
} 