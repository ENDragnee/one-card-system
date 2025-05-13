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
          <div className="grid grid-cols-2 grid-rows-4 gap-4 h-full">
            {pageCards.map((card, index) => (
              <div
                key={index}
                className="w-[85.6mm] h-[53.98mm] bg-white shadow-xl rounded-lg overflow-hidden relative p-0"
              >
                <div className="max-h-[100%]">
                  <h4 className='text-xs pl-2'>Name:</h4>
                  <table className="table-auto border-collapse border border-gray-300 mx-0 text-center w-full max-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        {Array.from({ length: 11 }, (_, index) => (
                          <th
                            key={`header-${index}`}
                            className="border border-gray-300 px-2 py-1 text-xs font-medium"
                          >
                            {index + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 3 }, (_, rowIndex) => (
                        <tr key={`row-${rowIndex}`}>
                          {Array.from({ length: 11 }, (_, colIndex) => (
                            <td
                              key={`cell-${rowIndex}-${colIndex}`}
                              className="border border-gray-300 px-2 py-1 text-xs"
                            >
                              R{rowIndex + 1}, C{colIndex + 1}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="h-4 bg-gradient-to-r from-blue-950 to-blue-900 absolute bottom-0 w-full">
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
