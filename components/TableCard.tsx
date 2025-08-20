'use client'

import { useState } from 'react'
import { Table, TableStatus } from '@prisma/client'
import { cn } from '@/lib/utils'
import { clearTable } from '@/lib/actions'
import WalkInModal from './WalkInModal'

interface TableCardProps {
  table: Table
}

export default function TableCard({ table }: TableCardProps) {
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const statusColors = {
    [TableStatus.available]: 'bg-green-100 border-green-300 text-green-800',
    [TableStatus.occupied]: 'bg-red-100 border-red-300 text-red-800',
    [TableStatus.reserved]: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  }

  const statusText = {
    [TableStatus.available]: 'Свободно',
    [TableStatus.occupied]: 'Занято',
    [TableStatus.reserved]: 'Зарезервировано',
  }

  const handleClearTable = async () => {
    setIsClearing(true)
    const result = await clearTable(table.id)
    if (!result.success) {
      alert(result.error)
    }
    setIsClearing(false)
  }

  const handleTableClick = () => {
    if (table.status === TableStatus.available) {
      setIsWalkInModalOpen(true)
    }
  }

  return (
    <>
      <div
        className={cn(
          'w-24 h-24 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all relative group',
          statusColors[table.status],
          table.status === TableStatus.available && 'cursor-pointer hover:shadow-md'
        )}
        onClick={handleTableClick}
      >
        <div className="font-bold">{table.name}</div>
        <div className="text-xs opacity-75">{table.capacity} мест</div>
        <div className="text-xs mt-1">{statusText[table.status]}</div>
        
        {/* Кнопка освобождения для занятых столов */}
        {table.status === TableStatus.occupied && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClearTable()
            }}
            disabled={isClearing}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
            title="Освободить стол"
          >
            {isClearing ? '...' : '✕'}
          </button>
        )}
        
        {/* Подсказка для свободных столов */}
        {table.status === TableStatus.available && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Нажмите для посадки
          </div>
        )}
      </div>

      <WalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        tableId={table.id}
        tableName={table.name}
        tableCapacity={table.capacity}
      />
    </>
  )
}
