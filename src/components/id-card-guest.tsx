'use client'

import Image from 'next/image'
import { IdCardProps } from '../types/id-card'
import { useEffect, useState } from 'react'
import JsBarcode from "jsbarcode";

interface IdCardsProps {
  cards: IdCardProps[]
}

export default function IdCards({ cards }: IdCardsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  const chunkArray = (arr: IdCardProps[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    )
  }

  const cardPages = chunkArray(cards, 12);

  return (
    <div>
      {cardPages.map((pageCards, pageIndex) => (
        <div 
          key={pageIndex} 
          className="w-[210mm] h-[280mm] mx-auto bg-white px-4 page-break-after-always"
        >
          <div className="grid grid-cols-4 grid-rows-3 gap-0 h-full">
            {pageCards.map((card, index) => (
              <div
                key={index}
                className="w-[50mm] h-[80mm] bg-white shadow-md rounded-lg overflow-hidden relative border border-gray-300"
              >
              <div className="h-10 bg-gradient-to-r from-blue-950 to-blue-900" />
                <div className="bg-[url('/bg.png')] bg-cover bg-center bg-gray-50">
                  <div className="p-1 text-center bg-gray-50 ">
                    <div className="flex justify-between items-center px-1">
                      <Image
                        src="/EUSCR.png"
                        alt="AASTU Logo"
                        width={40}
                        height={40}
                        className="w-10 h-8"
                      />
                      <div className="text-xs font-bold text-gray-700 flex flex-col items-center">
                        <p>2025</p>
                        <p>AASTU</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center p-1">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                      <img
                        src="/EUSCR.png"
                        alt={card.fullName}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: '50% 10%', aspectRatio: '1/1' }}
                      />
                    </div>
                  </div>

                  <div className="text-center text-[#1B3149] text-xs font-bold">
                    ETHIOPIAN UNIVERSITY
                  </div>
                  <div className="text-center text-[#1B3149] text-xs font-bold">
                    STUDENTS SPORTS
                  </div>

                  <div className="text-center text-[#1B3149] text-sm font-bold my-1">
                    {card.role}
                  </div>

                  <div className="flex justify-center mt-8">
                    <canvas
                      id={`barcode-${pageIndex}-${index}`}
                      className="w-[40mm]"
                      ref={(canvas) => {
                        if (canvas) {
                          JsBarcode(canvas, `${card.barcodeValue}`, {
                            font: "CustomFont",
                            format: "CODE128",
                            width: 1,
                            height: 25,
                            displayValue: false,
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="h-6 bg-gradient-to-r from-blue-900 to-blue-800 absolute bottom-0 w-full flex items-center justify-center text-white text-xs font-bold">
                  2025 G.C
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
