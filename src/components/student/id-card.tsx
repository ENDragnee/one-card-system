// components/student/id-card.tsx
'use client';

import Image from 'next/image';
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';
import { StudentIdData } from '@/types';

interface IdCardComponentProps {
  student: StudentIdData;
  universityName?: string;
  universitySubtitle?: string;
}

const FALLBACK_AVATAR_URL = '/default-avatar.png'; // Place in /public folder

export function IdCardComponent({
  student,
  universityName = "ASSOSA UNIVERSITY", // Default from image
  universitySubtitle = "OFFICIAL STUDENT IDENTIFICATION", // Default from image
}: IdCardComponentProps) {
  const barcodeRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (barcodeRef.current && student.barcodeValue) {
      try {
        JsBarcode(barcodeRef.current, student.barcodeValue, {
          format: 'CODE128',
          width: 1.2, // Adjust for optimal scanning and size
          height: 25, // Adjust height
          displayValue: false, // The ID number is displayed separately
          margin: 0,
          background: '#ffffff', // Crucial for barcode scanners
          lineColor: '#000000',
        });
      } catch (e) {
        console.error(`Error generating barcode for ${student.barcodeValue}:`, e);
        // Optionally, display an error message on the card or a placeholder
        if (barcodeRef.current) {
            const ctx = barcodeRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, barcodeRef.current.width, barcodeRef.current.height);
                ctx.font = '10px Arial';
                ctx.fillStyle = 'red';
                ctx.fillText('Barcode Error', 10, 15);
            }
        }
      }
    }
  }, [student.barcodeValue]);


  return (
    <div
      className="w-[85.6mm] h-[53.98mm] bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 flex flex-col print-id-card"
      style={{ fontFamily: 'Arial, sans-serif' }} // A common, readable font
    >
      {/* Header Section */}
      <div className="bg-[#002D72] text-white py-1 px-2 text-center"> {/* Dark Blue from image */}
        <h1 className="text-[9px] font-bold uppercase tracking-wide">{universityName}</h1>
        <p className="text-[6.5px] uppercase tracking-wider">{universitySubtitle}</p>
      </div>

      {/* Body Section: Photo and Details */}
      <div className="flex-grow p-[2mm] flex items-start space-x-[2mm]">
        {/* Student Photo */}
        <div className="w-[22mm] h-[28mm] flex-shrink-0 border border-gray-400 bg-gray-100">
          <Image
            src={student.photo || FALLBACK_AVATAR_URL}
            alt={`${student.name}'s photo`}
            width={83} // Approx 22mm at 96dpi
            height={106} // Approx 28mm at 96dpi
            className="object-cover w-full h-full"
            onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR_URL)}
            unoptimized={!!student.photo} // Use unoptimized if photos are external and not handled by Next/Image
          />
        </div>

        {/* Student Details */}
        <div className="flex-grow flex flex-col justify-center space-y-[0.8mm] text-[8px] leading-snug">
          <div>
            <p className="text-gray-500 uppercase text-[6.5px] font-medium">STUDENT NAME</p>
            <p className="font-bold text-black uppercase text-[8.5px]">{student.name}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-[6.5px] font-medium">DEPARTMENT</p>
            <p className="font-semibold text-black">{student.department || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-[6.5px] font-medium">ACADEMIC YEAR</p>
            <p className="font-semibold text-black">{student.academicYear}</p>
          </div>
        </div>
      </div>

      {/* Footer Section: ID Number and Barcode */}
      <div className="px-[3mm] pb-[1.5mm] pt-[1mm]">
        <div>
          <p className="text-gray-500 uppercase text-[6.5px] font-medium">ID NUMBER</p>
          <p className="font-semibold text-black text-[8.5px] tracking-wider">{student.username}</p>
        </div>
        <div className="w-full mt-[0.5mm]">
          <canvas ref={barcodeRef} className="w-full h-[25px]" />
        </div>
      </div>
    </div>
  );
}