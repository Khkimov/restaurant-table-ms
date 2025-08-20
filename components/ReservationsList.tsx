'use client'

import { useState } from 'react'
import { Reservation, Table } from '@prisma/client'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { updateReservationStatus } from '@/lib/actions'
import { ReservationStatus } from '@prisma/client'
import ReservationModal from './ReservationModal'

interface ReservationsListProps {
  reservations: (Reservation & { table: Table | null })[]
  availableTables: Table[]
}

export default function ReservationsList({ reservations, availableTables }: ReservationsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStatusUpdate = async (reservationId: number, status: ReservationStatus) => {
    const result = await updateReservationStatus(reservationId, status)
    if (!result.success) {
      alert(result.error)
    }
  }
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Резервации на сегодня</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Новая резервация
        </button>
      </div>
      
      {reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Резерваций на сегодня нет</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{reservation.guestName}</h3>
                  <p className="text-sm text-gray-600">{reservation.phone}</p>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {reservation.partySize} чел.
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {format(new Date(reservation.startAt), 'HH:mm', { locale: ru })}
                </span>
                {reservation.table && (
                  <span className="text-gray-600">
                    Стол {reservation.table.name}
                  </span>
                )}
              </div>
              
              {reservation.specialRequests && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  {reservation.specialRequests}
                </p>
              )}
              
              <div className="flex gap-2 mt-3">
                {reservation.status === 'created' && (
                  <button 
                    onClick={() => handleStatusUpdate(reservation.id, ReservationStatus.confirmed)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Подтвердить
                  </button>
                )}
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                  Изменить
                </button>
                <button 
                  onClick={() => handleStatusUpdate(reservation.id, ReservationStatus.cancelled)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Отменить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ReservationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableTables={availableTables}
      />
    </div>
  )
}
