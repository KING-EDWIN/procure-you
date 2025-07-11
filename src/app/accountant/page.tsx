"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountantPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to finance tab by default since accountant primarily manages financial documents
    router.push("/accountant/finance");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Accountant Dashboard...</p>
      </div>
    </div>
  );
} 