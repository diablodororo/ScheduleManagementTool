import { MS_PER_DAY } from '../constants'

export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const parseDate = (str: string): Date => new Date(str + 'T00:00:00')

export const getDaysDiff = (d1: Date, d2: Date): number =>
  Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY)

export const addDays = (date: Date, days: number): Date => {
  const res = new Date(date)
  res.setDate(res.getDate() + days)
  return res
}
