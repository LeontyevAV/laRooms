"use client";

import { Suspense } from "react";
import SearchPageInner from "./inner";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card border rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
