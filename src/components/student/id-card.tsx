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
  watermarkImageUrl?: string; // Optional watermark image URL
}

const FALLBACK_AVATAR_URL = '/default-avatar.png'; // Place in /public folder

export function IdCardComponent({
  student,
  universityName = "Samara University", // Default from image
  universitySubtitle = "OFFICIAL STUDENT IDENTIFICATION", // Default from image
  watermarkImageUrl = "/SUt.png", // Default watermark image URL
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
      className="w-[85.6mm] h-[53.98mm] bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col print-id-card relative mt-4 mx-8"
      style={{ fontFamily: 'Arial, sans-serif' }} // A common, readable font
    >
      {watermarkImageUrl && (
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none" // Adjust opacity-10 (10%) as needed
          style={{
            backgroundImage: `url(${watermarkImageUrl})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain', // Or 'cover', or a specific size like '60% 60%' or '50mm 50mm'
          }}
        ></div>
      )}
      {/* Header Section */}
      <div className='flex flex-row items-center justify-between p-[2mm] border-b-2 bg-[#0357A4] border-gray-300 z-10'>
        <Image
          src="/SUt.png" // Replace with the actual logo path
          alt="Samara University Logo"
          width={20} // Adjust size as needed
          height={20} // Adjust size as needed
          className="h-[8mm] w-[8mm] object-cover"
          onError={(e) => (e.currentTarget.src = '/default-logo.png')} // Fallback logo
        />
        <div className="text-white py-1 px-2 text-center"> {/* Dark Blue from image */}
          <h1 className="text-[9px] font-bold uppercase tracking-wide">{universityName}</h1>
          <p className="text-[6.5px] uppercase tracking-wider">{universitySubtitle}</p>
        </div>
      </div>

      {/* Body Section: Photo and Details */}
      <div className='flex flex-grow items-center justify-around p-[2mm] gap-x-4'>
        <div className="flex-grow p-[2mm] flex items-center justify-around space-x-[2mm]">
          {/* Student Photo */}
          <div className="w-[20mm] h-[22mm] flex-shrink-0 border border-gray-400 bg-gray-100 rounded-lg">
            <Image
              src={student.photo || FALLBACK_AVATAR_URL}
              alt={`${student.name}'s photo`}
              width={83} // Approx 22mm at 96dpi
              height={88} // Approx 28mm at 96dpi
              className="object-cover w-full h-full rounded-md"
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
            <p className="text-gray-500 uppercase text-[6.5px] font-medium">ID NUMBER</p>
            <p className="font-semibold text-black text-[8.5px] tracking-wider">{student.username}</p>
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
      </div>
      {/* Footer Section: ID Number and Barcode */}
      <div className="px-[3mm] pb-[1.5mm] mx-auto z-10">
        <div className="w-full mt-[0.5mm] flex justify-between items-center">
          <canvas ref={barcodeRef} className="w-fit h-[25px]" />
        </div>
      </div>
    </div>
  );
}