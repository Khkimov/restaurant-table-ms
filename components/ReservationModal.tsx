'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reservationSchema, type ReservationFormData } from '@/lib/validations'
import { createReservation } from '@/lib/actions'
import { Table } from '@prisma/client'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  availableTables: Table[]
}

export default function ReservationModal({ isOpen, onClose, availableTables }: ReservationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
  })

  const partySize = watch('partySize')

  const suitableTables = availableTables.filter(table => 
    !partySize || table.capacity >= partySize
  )

  const onSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true)
    
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    const result = await createReservation(formData)
    
    if (result.success) {
      reset()
      onClose()
    } else {
      alert(result.error)
    }
    
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Новая резервация</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Имя гостя</label>
            <input
              {...register('guestName')}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите имя"
            />
            {errors.guestName && (
              <p className="text-red-500 text-sm mt-1">{errors.guestName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <input
              {...register('phone')}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+7 (999) 123-45-67"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Количество гостей</label>
            <input
              {...register('partySize', { valueAsNumber: true })}
              type="number"
              min="1"
              max="20"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.partySize && (
              <p className="text-red-500 text-sm mt-1">{errors.partySize.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Дата и время</label>
            <input
              {...register('startAt')}
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.startAt && (
              <p className="text-red-500 text-sm mt-1">{errors.startAt.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Стол (опционально)</label>
            <select
              {...register('tableId', { valueAsNumber: true })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не выбран</option>
              {suitableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} ({table.capacity} мест)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Особые пожелания</label>
            <textarea
              {...register('specialRequests')}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Дополнительные пожелания..."
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
