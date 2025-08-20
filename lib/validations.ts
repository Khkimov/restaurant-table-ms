import { z } from 'zod'

export const reservationSchema = z.object({
  guestName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  partySize: z.number().min(1, 'Минимум 1 человек').max(20, 'Максимум 20 человек'),
  startAt: z.string().min(1, 'Выберите дату и время'),
  specialRequests: z.string().optional(),
  tableId: z.number().optional(),
})

export type ReservationFormData = z.infer<typeof reservationSchema>
