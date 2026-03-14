import { getPageFromUrl } from '@/lib/utils'

interface PaginationControlsProps {
  count: number
  next: string | null
  previous: string | null
  currentPage: number
  onPageChange: (page: number) => void
}

export function PaginationControls({
  count,
  next,
  previous,
  currentPage,
  onPageChange,
}: PaginationControlsProps) {
  const nextPage = getPageFromUrl(next)
  const prevPage = getPageFromUrl(previous)

  if (!next && !previous) return null

  return (
    <div className="flex items-center justify-between py-4">
      <p className="text-sm text-muted-foreground">{count} total results</p>
      <div className="flex gap-2">
        <button
          disabled={!previous}
          onClick={() => prevPage && onPageChange(prevPage)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-sm">Page {currentPage}</span>
        <button
          disabled={!next}
          onClick={() => nextPage && onPageChange(nextPage)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
