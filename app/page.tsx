import { prisma } from '@/lib/prisma'
import TableCard from '@/components/TableCard'
import ReservationsList from '@/components/ReservationsList'
import RealtimeProvider from '@/components/RealtimeProvider'
import Link from 'next/link'
import { TableStatus } from '@prisma/client'

export default async function HomePage() {
  const tables = await prisma.table.findMany({
    orderBy: [{ y: 'asc' }, { x: 'asc' }]
  })

  const availableTables = tables.filter(table => table.status === TableStatus.available)

  const todayReservations = await prisma.reservation.findMany({
    where: {
      startAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999))
      },
      status: { in: ['created', 'confirmed'] }
    },
    include: { table: true },
    orderBy: { startAt: 'asc' }
  })

  const statusCounts = {
    available: tables.filter(t => t.status === TableStatus.available).length,
    occupied: tables.filter(t => t.status === TableStatus.occupied).length,
    reserved: tables.filter(t => t.status === TableStatus.reserved).length,
  }

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">План зала</h1>
            <Link 
              href="/analytics"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              📊 Аналитика
            </Link>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Свободно ({statusCounts.available})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Занято ({statusCounts.occupied})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Зарезервировано ({statusCounts.reserved})</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* План зала */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Столы</h2>
              <div className="relative grid grid-cols-8 gap-4 min-h-[400px]">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="absolute"
                    style={{
                      gridColumn: table.x,
                      gridRow: table.y,
                    }}
                  >
                    <TableCard table={table} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Резервации */}
          <div className="lg:col-span-1">
            <ReservationsList 
              reservations={todayReservations} 
              availableTables={availableTables}
            />
          </div>
        </div>
      </div>
    </div>
    </RealtimeProvider>
  )
}