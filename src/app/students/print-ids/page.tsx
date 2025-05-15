// app/students/print-ids/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudentIdData } from '@/types';
import { IdCardComponent } from '@/components/student/id-card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons'; // Assuming you have a Print icon
import { LoaderCircle } from 'lucide-react';

const CARDS_PER_A4_PAGE = 8; // 2 columns, 4 rows on A4

export default function PrintIdsPage() {
  const searchParams = useSearchParams();
  const [studentsToPrint, setStudentsToPrint] = useState<StudentIdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const studentsDataParam = searchParams.get('students');
    if (studentsDataParam) {
      try {
        const parsedStudents: StudentIdData[] = JSON.parse(decodeURIComponent(studentsDataParam));
        setStudentsToPrint(parsedStudents);
      } catch (err) {
        console.error("Failed to parse student data for printing:", err);
        setError("Invalid student data provided. Please try again.");
      }
    } else {
      setError("No student data provided for printing.");
    }
    setIsLoading(false);
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <LoaderCircle className="animate-spin h-12 w-12 text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">Preparing IDs for printing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-red-600">Error</h1>
        <p className="text-lg text-gray-700 mb-8">{error}</p>
        <Button onClick={() => window.close()} variant="outline">Close Tab</Button>
      </div>
    );
  }

  if (studentsToPrint.length === 0 && !isLoading) {
     return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Print Student IDs</h1>
        <p className="text-lg text-gray-700 mb-8">No students selected for printing.</p>
        <Button onClick={() => window.close()} variant="outline">Close Tab</Button>
      </div>
    );
  }

  // Chunk students for pagination on the print sheet
  const pages = [];
  for (let i = 0; i < studentsToPrint.length; i += CARDS_PER_A4_PAGE) {
    pages.push(studentsToPrint.slice(i, i + CARDS_PER_A4_PAGE));
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-[100] print:hidden flex space-x-2">
        <Button onClick={() => window.close()} variant="outline">Close</Button>
        <Button onClick={handlePrint}>
          <Icons.Print className="mr-2 h-4 w-4" /> Print IDs
        </Button>
      </div>

      <div className="print-area">
        {pages.map((pageStudents, pageIndex) => (
          <div
            key={pageIndex}
            className="print-page w-[210mm] min-h-[297mm] mx-auto my-0 bg-white p-[10mm] print:shadow-none print:my-0 print:p-[5mm] print-page-break-after"
          >
            <div className="grid grid-cols-2 gap-[4mm] h-full content-start">
              {pageStudents.map((student) => (
                <IdCardComponent key={student.id || student.username} student={student} />
              ))}
              {/* Optional: Add empty placeholders to fill the grid if page is not full */}
              {/* Helps with consistent cutting if you're using a guillotine */}
              {/* {Array(CARDS_PER_A4_PAGE - pageStudents.length).fill(null).map((_, i) => (
                <div key={`empty-${pageIndex}-${i}`} className="w-[85.6mm] h-[53.98mm] border border-dashed border-gray-200 print:border-transparent"></div>
              ))} */}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important; /* Chrome, Safari */
            print-color-adjust: exact !important; /* Firefox */
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
            padding: 0 !important; /* This ensures content goes to edge if @page margin is 0 */
            width: 100% !important;
            height: 100% !important; /* Or min-height: 100vh */
          }
          .print-page-break-after {
            page-break-after: always !important;
          }
          .print-page-break-after:last-child {
            page-break-after: auto !important; /* Avoid extra blank page */
          }
        }
        @page {
          size: A4 portrait;
          margin: 0mm; /* Controls browser's default print margins. Set to 0 if page itself has padding. */
        }
      `}</style>
    </>
  );
}