'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AnalyticsChartsProps {
  hourlyData: Array<{
    hour: string
    covers: number
  }>
}

export default function AnalyticsCharts({ hourlyData }: AnalyticsChartsProps) {
  const peakHours = hourlyData
    .filter(item => item.covers > 0)
    .sort((a, b) => b.covers - a.covers)
    .slice(0, 3)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Пиковые часы</h2>
      
      {/* График */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              fontSize={12}
              interval={1}
            />
            <YAxis fontSize={12} />
            <Tooltip 
              labelFormatter={(label) => `Время: ${label}`}
              formatter={(value) => [`${value} гостей`, 'Количество']}
            />
            <Bar 
              dataKey="covers" 
              fill="#3B82F6" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Топ пиковых часов */}
      <div>
        <h3 className="font-medium mb-3">Самые загруженные часы:</h3>
        <div className="space-y-2">
          {peakHours.map((item, index) => (
            <div key={item.hour} className="flex justify-between items-center">
              <span className="text-sm">
                #{index + 1} {item.hour}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {item.covers} гостей
              </span>
            </div>
          ))}
          {peakHours.length === 0 && (
            <p className="text-gray-500 text-sm">Нет данных за выбранный период</p>
          )}
        </div>
      </div>
    </div>
  )
}
