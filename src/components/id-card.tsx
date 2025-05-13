'use client'

import Image from 'next/image'
import { IdCardProps } from '../types/id-card'
import { useEffect, useState } from 'react'

export default function IdCard({
  photoUrl,
  fullName,
  university = 'AASTU',
  role = 'AT',
  idNumber,
  phone,
  honor,
}: IdCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="w-[400px] min-h-[650px] bg-white shadow-xl rounded-lg overflow-hidden relative">
      {/* Gold bars at top and bottom */}
      <div className="h-4 bg-gradient-to-r from-[#C5A572] to-[#DBCA9A]" />
      
      {/* Header */}
      <div className="p-4 text-center bg-white">
        <div className="flex justify-between items-center px-4">
          <Image
            src="/usae-logo.png"
            alt="USAE Logo"
            width={50}
            height={50}
            className="w-12 h-12"
          />
          <div className="flex-1 px-4">
            <h1 className="text-[#1B3149] text-xl font-bold leading-tight">
              Universities Sport Association Ethiopia
            </h1>
          </div>
          <Image
            src="/aastu-logo.png"
            alt="AASTU Logo"
            width={50}
            height={50}
            className="w-12 h-12"
          />
        </div>
        
      </div>

      {/* Photo Section */}
      <div className="flex justify-center p-4">
        <div className="relative w-48 h-48 rounded-3xl overflow-hidden border-4 border-[#1B3149]">
          <Image
            src={photoUrl || "/placeholder.svg?height=192&width=192"}
            alt="Profile Photo"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Name and Details */}
      <div className="text-center px-4">
        <h2 className="text-[#1B3149] text-4xl font-bold tracking-wider mb-4">
          {fullName}
        </h2>
        <div className="bg-[#1B3149] text-[#C5A572] text-2xl font-bold py-2 px-8 rounded-full inline-block mb-8">
          {university}
        </div>
        
        <div className="space-y-2 text-left max-w-xs mx-auto">
          <div className="flex justify-between items-center">
            <span className="text-[#1B3149] text-lg">ID Number</span>
            <span className="text-[#1B3149] text-lg">: {idNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#1B3149] text-lg">Phone</span>
            <span className="text-[#1B3149] text-lg">{phone}</span>
          </div>
        </div>

        <div className="absolute top-[500px] right-4">
          <div className="w-12 h-12 bg-[#1B3149] flex items-center justify-center">
            <span className="text-white text-xl font-bold">{role}</span>
          </div>
        </div>
      </div>

      {/* Barcode */}
      <div className="mt-8 p-4 flex justify-center">
        <Image
          src="/placeholder.svg?height=80&width=300"
          alt="Barcode"
          width={300}
          height={80}
          className="w-full max-w-[300px]"
        />
      </div>

      {/* Bottom gold bar */}
      <div className="h-4 bg-gradient-to-r from-[#C5A572] to-[#DBCA9A] mt-4" />
    </div>
  )
}

