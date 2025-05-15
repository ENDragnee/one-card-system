'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

// Define the props interface directly in this file
export interface IdCardProps {
  photoUrl?: string;
  fullName: string;
  universityName?: string;
  universityLogoUrl?: string;
  idCardTitle?: string;
  idNumber: string;
  department: string;
  academicYear: string; // e.g., "3rd Year", "2023-2024"
  qrCodeUrl?: string; // URL to the generated QR code image
  issueDate?: string;
  expiryDate?: string;
  phone?: string; // Optional
}

// Default values can be managed here or passed as props
const DEFAULT_UNIVERSITY_LOGO = "/aastu-logo.png"; // Replace with Samara Uni logo
const DEFAULT_QR_CODE_PLACEHOLDER = "/placeholder-qr.svg"; // A generic QR placeholder
const DEFAULT_PHOTO_PLACEHOLDER = "/placeholder.svg"; // Generic photo placeholder

export default function IdCard({
  photoUrl = DEFAULT_PHOTO_PLACEHOLDER,
  fullName,
  universityName = 'SAMARA UNIVERSITY',
  universityLogoUrl = DEFAULT_UNIVERSITY_LOGO,
  idCardTitle = 'STUDENT IDENTIFICATION',
  idNumber,
  department,
  academicYear,
  qrCodeUrl = DEFAULT_QR_CODE_PLACEHOLDER,
  issueDate = '09/2023', // Example
  expiryDate = '09/2027', // Example
  phone, // Optional
}: IdCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // You could return a skeleton loader here for better UX
    return null
  }

  // Define color palette for easier management if needed elsewhere
  const colors = {
    primaryBrand: '#1B3149', // Dark Blue
    secondaryBrand: '#C5A572', // Gold
    gradientTo: '#DBCA9A',   // Lighter Gold for gradient
    background: '#FFFFFF',
    textOnPrimary: '#FFFFFF', // Text on dark blue
    textOnSecondary: '#1B3149', // Text on gold
    textPrimary: '#1B3149', // Main text color
    textSecondary: '#555555', // Lighter text for less emphasis
  };

  return (
    <div 
      className="w-[350px] min-h-[550px] shadow-xl rounded-lg overflow-hidden relative flex flex-col"
      style={{ backgroundColor: colors.background }}
    >
      {/* Top Gold Bar */}
      <div 
        className="h-3"
        style={{ background: `linear-gradient(to right, ${colors.secondaryBrand}, ${colors.gradientTo})` }} 
      />

      {/* Header Section */}
      <div className="p-4 text-center border-b-2" style={{ borderColor: colors.secondaryBrand }}>
        <div className="flex items-center justify-center space-x-3">
          <Image
            src={universityLogoUrl}
            alt={`${universityName} Logo`}
            width={45}
            height={45}
            className="object-contain"
          />
          <h1 
            className="text-xl font-bold leading-tight tracking-wide"
            style={{ color: colors.primaryBrand }}
          >
            {universityName.toUpperCase()}
          </h1>
        </div>
        {idCardTitle && (
          <p className="text-xs font-semibold mt-1" style={{ color: colors.textSecondary, letterSpacing: '0.05em' }}>
            {idCardTitle.toUpperCase()}
          </p>
        )}
      </div>

      {/* Photo Section */}
      <div className="flex justify-center py-5 px-4">
        <div 
          className="relative w-40 h-48 rounded-md overflow-hidden border-2"
          style={{ borderColor: colors.primaryBrand }}
        >
          <Image
            src={photoUrl}
            alt="Profile Photo"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes
            className="object-cover"
            priority // Good for LCP elements
          />
        </div>
      </div>

      {/* Details Section */}
      <div className="px-6 pb-4 flex-grow">
        <h2 
          className="text-2xl font-bold text-center mb-4 tracking-wide"
          style={{ color: colors.primaryBrand }}
        >
          {fullName}
        </h2>
        
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold" style={{ color: colors.textPrimary }}>ID NO:</span>
            <span style={{ color: colors.textPrimary }}>{idNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold" style={{ color: colors.textPrimary }}>DEPARTMENT:</span>
            <span style={{ color: colors.textPrimary }}>{department}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold" style={{ color: colors.textPrimary }}>YEAR:</span>
            <span style={{ color: colors.textPrimary }}>{academicYear}</span>
          </div>
          {phone && (
            <div className="flex justify-between">
              <span className="font-semibold" style={{ color: colors.textPrimary }}>PHONE:</span>
              <span style={{ color: colors.textPrimary }}>{phone}</span>
            </div>
          )}
          <div className="flex justify-between pt-1">
            <span className="font-semibold" style={{ color: colors.textSecondary }}>ISSUED: {issueDate}</span>
            <span className="font-semibold" style={{ color: colors.textSecondary }}>EXPIRES: {expiryDate}</span>
          </div>
        </div>
      </div>

      {/* QR Code and Bottom Bar Section */}
      <div className="mt-auto"> {/* Pushes this section to the bottom */}
        <div className="p-4 flex justify-center">
          <Image
            src={qrCodeUrl} // You'd pass the actual QR code image URL here
            alt="QR Code"
            width={80}
            height={80}
          />
        </div>
        
        {/* Bottom Gold Bar */}
        <div 
          className="h-5" // Slightly thicker bottom bar
          style={{ background: `linear-gradient(to right, ${colors.secondaryBrand}, ${colors.gradientTo})` }} 
        />
      </div>
    </div>
  )
}