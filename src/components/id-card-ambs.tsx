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
                <div className="h-8 bg-gradient-to-r from-blue-950 to-blue-900" >
                  <h1 className="text-gray-50 text-xs font-bold text-center">
                    ETHIOPIAN UNIVERSITY STUDENTS
                  </h1>
                  <h2 className="text-gray-50 text-xs text-center font-bold">
                    SPORTS FESTIVAL
                  </h2>
                </div>

                <div className="p-1.5 flex justify-center items-center text-center bg-white">
                    <Image
                      src="/EUSCR.png"
                      alt="AASTU Logo"
                      width={100}
                      height={80}
                      className="w-20 h-15 self-center"
                    />
                </div>
                
                <div className="text-center space-y-0">

                    <h3 className="text-[#1B3149] text-3xl font-bold tracking-wider">
                      VOLUNTEERS
                    </h3>
                </div>
                <div className="text-center space-y-0">

                    <h3 className="text-[#1B3149] text-sm font-bold tracking-wider">
                      Addis Ababa Science and Technology University
                    </h3>
                </div>

                {/* <div className="px-3 flex justify-center">
                  <canvas
                    id={`barcode-${pageIndex}-${index}`}
                    className="w-full max-w-[160px]"
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
                </div> */}


                <div className="h-4 bg-gradient-to-r from-blue-950 to-blue-900 absolute bottom-0 w-full" >
                    <div className="text-xs font-bold text-gray-100 text-center pb-1">
                            2025
                      </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}