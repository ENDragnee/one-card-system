"use client"

import { Suspense } from "react"
import PrintIdsContent from "./_components/PrintIdsContent"
import { Skeleton } from "@/components/ui/skeleton";

const CARDS_PER_A4_PAGE = 8; // Keep consistent

function PrintIdsPageSkeleton() {
  return (
    <>
      <div className="fixed top-4 right-4 z-[100] print:hidden flex space-x-2 animate-pulse">
        <div className="h-10 w-20 bg-gray-300 rounded"></div> {/* Close Button Skeleton */}
        <div className="h-10 w-32 bg-gray-300 rounded"></div> {/* Print Button Skeleton */}
      </div>

      <div className="print-area">
        <div
          className="print-page w-[210mm] min-h-[297mm] mx-auto my-0 bg-white p-[10mm] print:shadow-none print:my-0 print:p-[5mm]"
        >
          <div className="h-8 w-3/5 mb-8 bg-gray-300 rounded animate-pulse mx-auto"></div> {/* Title Placeholder */}
          <div className="grid grid-cols-2 gap-[4mm] h-full content-start">
            {Array.from({ length: CARDS_PER_A4_PAGE }).map((_, index) => (
              <Skeleton key={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Minimal print styles needed for the skeleton page itself */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
          }
          .print\\:hidden {
             display: none !important;
          }
          .print-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
           .print-page-break-after {
            page-break-after: always !important;
          }
          .print-page-break-after:last-child {
            page-break-after: auto !important;
          }
        }
        @page {
          size: A4 portrait;
          margin: 0mm;
        }
      `}</style>
    </>
  );
}

export default function PrintIdsPage(){
    return(
        <Suspense fallback={PrintIdsPageSkeleton()}>
            <PrintIdsContent />
        </Suspense>
    );
}