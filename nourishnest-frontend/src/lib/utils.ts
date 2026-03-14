import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPageFromUrl(url: string | null): number | null {
  if (!url) return null
  try {
    return parseInt(new URL(url).searchParams.get('page') ?? '1', 10)
  } catch {
    return null
  }
}

export function daysUntil(dateStr: string): number {
  const now = new Date()
  const date = new Date(dateStr)
  return Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
