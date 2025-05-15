// File: app/students/print-ids/_components/PrintIdsContent.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudentIdData } from '@/types'; // Ensure this is imported
import { IdCardComponent } from '@/components/student/id-card'; // Assuming this exists
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { LoaderCircle } from 'lucide-react';

const CARDS_PER_A4_PAGE = 8;

export default function PrintIdsContent() {
  const searchParams = useSearchParams();
  const [studentsToPrint, setStudentsToPrint] = useState<StudentIdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const fetchStudentDataForPrint = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/user/id-data?ids=${idsParam}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch student data for printing.");
          }
          const data: StudentIdData[] = await response.json();
          if (data.length === 0) {
            setError("No student data found for the provided IDs.");
          }
          setStudentsToPrint(data);
        } catch (err: any) {
          console.error("Failed to fetch student data for printing:", err);
          setError(err.message || "An error occurred while fetching student data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudentDataForPrint();
    } else {
      setError("No student IDs provided for printing.");
      setIsLoading(false);
    }
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
        <p className="text-lg text-gray-700 mb-8">No students found or selected for printing.</p>
        <Button onClick={() => window.close()} variant="outline">Close Tab</Button>
      </div>
    );
  }

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
                // Ensure IdCardComponent expects StudentIdData
                <IdCardComponent key={student.id || student.username} student={student} />
              ))}
            </div>
          </div>
        ))}
      </div>

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