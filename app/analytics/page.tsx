export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const today = new Date()
  const yesterday = subDays(today, 1)
  const weekAgo = subDays(today, 7)

  // Daily covers (количество гостей за день)
  const todayCovers = await prisma.seating.aggregate({
    where: {
      startedAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
    },
    _sum: { partySize: true },
    _count: { id: true },
  })

  const yesterdayCovers = await prisma.seating.aggregate({
    where: {
      startedAt: {
        gte: startOfDay(yesterday),
        lte: endOfDay(yesterday),
      },
    },
    _sum: { partySize: true },
  })

  // Average dining time
  const completedSeatings = await prisma.seating.findMany({
    where: {
      endedAt: { not: null },
      startedAt: { gte: weekAgo },
    },
    select: {
      startedAt: true,
      endedAt: true,
    },
  })

  const avgDiningTime = completedSeatings.length > 0
    ? completedSeatings.reduce((acc, seating) => {
        const duration = seating.endedAt!.getTime() - seating.startedAt.getTime()
        return acc + duration
      }, 0) / completedSeatings.length / (1000 * 60) // в минутах
    : 0

  // Peak hours data для графика
  const allSeatings = await prisma.seating.findMany({
    where: {
      startedAt: { gte: weekAgo },
    },
    select: {
      startedAt: true,
      partySize: true,
    },
  })

  // Группируем по часам
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const covers = allSeatings
      .filter(item => new Date(item.startedAt).getHours() === hour)
      .reduce((sum, item) => sum + item.partySize, 0)
    
    return {
      hour: `${hour}:00`,
      covers,
    }
  })

  // Recent reservations
  const recentReservations = await prisma.reservation.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { table: true },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← План зала
            </Link>
          </div>
          <p className="text-gray-600 mt-2">
            Данные за {format(today, 'd MMMM yyyy', { locale: ru })}
          </p>
        </header>

        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Гости сегодня
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {todayCovers._sum.partySize || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {todayCovers._count.id || 0} посадок
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Вчера
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {yesterdayCovers._sum.partySize || 0}
            </p>
            <div className="flex items-center mt-1">
              {todayCovers._sum.partySize && yesterdayCovers._sum.partySize ? (
                <span className={`text-sm ${
                  todayCovers._sum.partySize > yesterdayCovers._sum.partySize 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {todayCovers._sum.partySize > yesterdayCovers._sum.partySize ? '↗' : '↘'} 
                  {Math.abs(
                    ((todayCovers._sum.partySize - yesterdayCovers._sum.partySize) / 
                    yesterdayCovers._sum.partySize * 100)
                  ).toFixed(0)}%
                </span>
              ) : (
                <span className="text-sm text-gray-500">Нет данных</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Среднее время
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {avgDiningTime.toFixed(0)} мин
            </p>
            <p className="text-sm text-gray-600 mt-1">
              За неделю
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Активные резервации
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {recentReservations.filter(r => 
                ['created', 'confirmed'].includes(r.status)
              ).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Ожидают подтверждения
            </p>
          </div>
        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <AnalyticsCharts hourlyData={hourlyData} />
          
          {/* Последние резервации */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Последние резервации</h2>
            <div className="space-y-3">
              {recentReservations.slice(0, 8).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{reservation.guestName}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(reservation.startAt), 'dd.MM HH:mm', { locale: ru })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{reservation.partySize} чел.</p>
                    <p className={`text-xs ${
                      reservation.status === 'confirmed' ? 'text-green-600' :
                      reservation.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {reservation.status === 'confirmed' ? 'Подтверждено' :
                       reservation.status === 'cancelled' ? 'Отменено' :
                       'Ожидает'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
