import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('MMM DD, YYYY')
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('MMM DD, YYYY HH:mm')
}

export const formatTimeAgo = (date: string | Date): string => {
  return dayjs(date).fromNow()
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

