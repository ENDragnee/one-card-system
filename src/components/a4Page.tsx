'use client'

import Image from 'next/image'
import { IdCardProps } from '../types/id-card'
import { useEffect, useState, useRef } from 'react'
import JsBarcode from "jsbarcode";
import { set } from 'react-hook-form';

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

  const cardPages = chunkArray(cards, 4);

  return (
    <div>
      {cardPages.map((pageCards, pageIndex) => (
        <div 
          key={pageIndex} 
          className="w-[200mm] h-[265mm] mx-auto bg-white px-8 page-break-after-always"
        >
          <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
            {pageCards.map((card, index) => (
              <div
                key={index}
                className="w-[90mm] h-[130mm] bg-white shadow-xl rounded-lg overflow-hidden relative"
              >
                <div className="h-3 bg-gradient-to-r from-[#C5A572] to-[#DBCA9A]" />
                
                <div className="p-3 text-center bg-white">
                  <div className="flex justify-between items-center px-3">
                    <Image
                      src="/aastu.jpg"
                      alt="AASTU Logo"
                      width={70}
                      height={70}
                      className="w-10 h-10"
                    />
                    <div className="flex-1 px-3">
                      <h1 className="text-[#1B3149] text-sm font-bold leading-tight">
                        University Sport Association of Ethiopia
                      </h1>
                    </div>
                    <Image
                      src="/usae.png"
                      alt="USAE Logo"
                      width={35}
                      height={35}
                      className="w-10 h-10"
                    />
                  </div>
                </div>
                {/*This is a fast witch to the old img style*/}
                {/* <div className="flex justify-center p-3">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-3 border-[#1B3149]">
                    <img
                      src={card.photoUrl}
                      alt={card.fullName}
                      className="object-cover object-[50%_20%]"
                      sizes="128px"
                    />
                  </div>
                </div> */}
                <div className="flex justify-center p-3">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-3 border-[#1B3149]">
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
                </div>

                <div className="text-center px-3">
                  <div className="text-[#1B3149] text-xl font-bold tracking-wider mb-2">
                    {card.fullName} {card.honor ? `(${card.honor})` : ''}
                  </div>
                  <div className="bg-[#1B3149] text-[#C5A572] text-base font-bold py-1.5 px-4 rounded-full inline-block mb-4">
                    {card.role}
                  </div>
                  <div className="text-[#1B3149] text-sm font-bold tracking-wider mb-2">
                    {card.university}
                  </div>
                  
                  <div className="space-y-1.5 text-left max-w-xs mx-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-[#1B3149] text-sm font-bold">ID Number</span>
                      <span className="text-[#1B3149] text-sm">USAE{card.idNumber.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#1B3149] text-sm font-bold">Phone</span>
                      <span className="text-[#1B3149] text-sm">{card.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 flex justify-center mb-4">
                  <canvas
                    id={`barcode-${pageIndex}-${index}`}
                    className="w-full max-w-[180px]"
                    ref={(canvas) => {
                      if (canvas) {
                        JsBarcode(canvas, `${card.barcodeValue}`, {
                          font: "CustomFont",
                          format: "CODE128",
                          width: 2,
                          height: 50,
                          displayValue: false,
                        });
                      }
                    }}
                  />
                </div>

                <div className="h-3 bg-gradient-to-r from-[#C5A572] to-[#DBCA9A] mt-2 absolute bottom-0 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}