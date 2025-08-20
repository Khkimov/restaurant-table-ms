'use client'

import { useState } from 'react'
import { seatWalkIn } from '@/lib/actions'

interface WalkInModalProps {
  isOpen: boolean
  onClose: () => void
  tableId: number
  tableName: string
  tableCapacity: number
}

export default function WalkInModal({ 
  isOpen, 
  onClose, 
  tableId, 
  tableName, 
  tableCapacity 
}: WalkInModalProps) {
  const [partySize, setPartySize] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const result = await seatWalkIn(tableId, partySize)
    
    if (result.success) {
      onClose()
      setPartySize(1)
    } else {
      alert(result.error)
    }
    
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Посадить гостей</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">Стол: <span className="font-medium">{tableName}</span></p>
          <p className="text-gray-600">Вместимость: <span className="font-medium">{tableCapacity} мест</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Количество гостей</label>
            <input
              type="number"
              min="1"
              max={tableCapacity}
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || partySize > tableCapacity}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Посадка...' : 'Посадить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
