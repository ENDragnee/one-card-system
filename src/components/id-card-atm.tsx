'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import JsBarcode from "jsbarcode";
import { IdCardProps } from '../types/id-card'

interface IdCardsProps {
  cards: IdCardProps[]
}

export default function IdCards({ cards }: IdCardsProps) {
  let id = 1;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  const chunkArray = (arr: IdCardProps[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    )
  }
  // Changed from 4 to 8 cards per page
  const cardPages = chunkArray(cards, 8);

  // Role-to-color mapping
    const roleColors: Record<string, string> = {
      Athlete: 'bg-[#282A36] text-[#C5A572]',
      Coach: 'bg-[#F1FA8C] text-[#282A36]',
      Driver: 'bg-[#50FA7B] text-white',
      Guest: 'bg-[#EBD9A3] text-black',
      HOD: 'bg-[#C5A572] text-white',
      Media: 'bg-[#6272A4] text-white',
      "Medical staff": 'bg-[#8BE9FD] text-[#282A36]',
      "Support staff": 'bg-[#44475A] text-white',
      "VIP Guest": 'bg-[#C5A572] text-[#282A36]',
      // Default color for undefined roles
      default: 'bg-[#F5F5F5] text-black'
    };

  return (
    <div>
      {cardPages.map((pageCards, pageIndex) => (
        <div 
          key={pageIndex} 
          className="w-[210mm] h-[270mm] mx-auto bg-white px-4 py-8 page-break-after-always"
        >
          {/* Changed to 2 columns and 4 rows */}
          <div className="grid grid-cols-2 grid-rows-4 gap-0 h-full">
            {pageCards.map((card, index) => (
              <div
                key={index}
                className="w-[85.6mm] h-[53.98mm] bg-white shadow-xl rounded-lg overflow-hidden relative"
              >
                <div className="h-1.5 bg-gradient-to-r from-[#C5A572] to-[#DBCA9A]" />
                
                <div className="p-1.5 text-center bg-white">
                  <div className="flex justify-between items-center px-1.5">
                    <Image
                      src="/aastu.jpg"
                      alt="AASTU Logo"
                      width={70}
                      height={70}
                      className="w-6 h-6"
                    />
                    <div className="flex-1 px-1.5">
                      <h1 className="text-[#1B3149] text-xs font-bold leading-tight">
                        University Sport Association of Ethiopia
                      </h1>
                    </div>
                    <Image
                      src="/usae.png"
                      alt="USAE Logo"
                      width={35}
                      height={35}
                      className="w-6 h-6"
                    />
                  </div>
                </div>

                <div className="flex gap-3 px-3">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-[#1B3149]">
                    <div className="w-full h-full">
                      <img
                        src={card.photoUrl}
                        alt={card.fullName}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: '50% 10%',
                          aspectRatio: '1/1'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-[#1B3149] text-xs font-bold tracking-wider mb-0.5">
                      {card.fullName} {card.honor ? `(${card.honor})` : ''}
                    </div>
                    <div className="text-[#1B3149] text-xs font-bold tracking-wider mb-0.5">
                      {card.university}
                    </div>
                    <div 
                      className={`text-base font-bold py-0.5 px-2 rounded-full inline-block mb-1 ${card.role ? roleColors[card.role] : roleColors.default}`}
                    >
                      {card.role}
                    </div>
                  </div>
                </div>

                <div className="px-3 mt-1">
                  <div className="space-y-0.5 text-left max-w-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#1B3149] text-xs font-bold">ID Number</span>
                      <span className="text-[#1B3149] text-xs">USAE{(id++).toString().padStart(2, '0')}/{card.idNumber.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#1B3149] text-xs font-bold">Phone</span>
                      <span className="text-[#1B3149] text-xs">{card.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="px-3 flex justify-center">
                  <canvas
                    id={`barcode-${pageIndex}-${index}`}
                    className="w-full max-w-[150px]"
                    ref={(canvas) => {
                      if (canvas) {
                        JsBarcode(canvas, `${card.barcodeValue}`, {
                          font: "CustomFont",
                          format: "CODE128",
                          width: 1,
                          height: 20,
                          displayValue: false,
                        });
                      }
                    }}
                  />
                </div>

                <div className="h-1.5 bg-gradient-to-r from-[#C5A572] to-[#DBCA9A] absolute bottom-0 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}