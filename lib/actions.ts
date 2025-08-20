'use server'

import { prisma } from '@/lib/prisma'
import { reservationSchema } from '@/lib/validations'
import { pusherServer } from '@/lib/pusher'
import { revalidateTag } from 'next/cache'
import { TableStatus, ReservationStatus } from '@prisma/client'

async function triggerUpdate() {
  try {
    await pusherServer.trigger('restaurant-updates', 'table-updated', {})
    await pusherServer.trigger('restaurant-updates', 'reservation-updated', {})
  } catch (error) {
    console.error('Pusher error:', error)
  }
}

export async function createReservation(formData: FormData) {
  try {
    const data = {
      guestName: formData.get('guestName') as string,
      phone: formData.get('phone') as string,
      partySize: parseInt(formData.get('partySize') as string),
      startAt: formData.get('startAt') as string,
      specialRequests: formData.get('specialRequests') as string || undefined,
      tableId: formData.get('tableId') ? parseInt(formData.get('tableId') as string) : undefined,
    }

    const validatedData = reservationSchema.parse(data)

    const reservation = await prisma.reservation.create({
      data: {
        ...validatedData,
        startAt: new Date(validatedData.startAt),
        status: ReservationStatus.created,
      },
    })

    // Если выбран стол, обновляем его статус
    if (validatedData.tableId) {
      await prisma.table.update({
        where: { id: validatedData.tableId },
        data: { status: TableStatus.reserved },
      })
    }

    revalidateTag('reservations')
    revalidateTag('tables')
    await triggerUpdate()
    
    return { success: true, reservation }
  } catch (error) {
    console.error('Error creating reservation:', error)
    return { success: false, error: 'Не удалось создать резервацию' }
  }
}

export async function updateReservationStatus(reservationId: number, status: ReservationStatus) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { table: true },
    })

    if (!reservation) {
      return { success: false, error: 'Резервация не найдена' }
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
    })

    // Обновляем статус стола при отмене
    if (status === ReservationStatus.cancelled && reservation.tableId) {
      await prisma.table.update({
        where: { id: reservation.tableId },
        data: { status: TableStatus.available },
      })
    }

    revalidateTag('reservations')
    revalidateTag('tables')
    await triggerUpdate()
    
    return { success: true }
  } catch (error) {
    console.error('Error updating reservation:', error)
    return { success: false, error: 'Не удалось обновить резервацию' }
  }
}

export async function seatWalkIn(tableId: number, partySize: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // Создаём seating
      await tx.seating.create({
        data: {
          tableId,
          partySize,
        },
      })

      // Обновляем статус стола
      await tx.table.update({
        where: { id: tableId },
        data: { status: TableStatus.occupied },
      })
    })

    revalidateTag('tables')
    await triggerUpdate()
    return { success: true }
  } catch (error) {
    console.error('Error seating walk-in:', error)
    return { success: false, error: 'Не удалось посадить гостей' }
  }
}

export async function clearTable(tableId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // Завершаем активный seating
      await tx.seating.updateMany({
        where: {
          tableId,
          endedAt: null,
        },
        data: {
          endedAt: new Date(),
        },
      })

      // Освобождаем стол
      await tx.table.update({
        where: { id: tableId },
        data: { status: TableStatus.available },
      })
    })

    revalidateTag('tables')
    await triggerUpdate()
    return { success: true }
  } catch (error) {
    console.error('Error clearing table:', error)
    return { success: false, error: 'Не удалось освободить стол' }
  }
}
