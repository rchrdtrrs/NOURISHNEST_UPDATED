import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Clock, FileText, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useFork } from '@/hooks/useRecipes'
import { formatDate } from '@/lib/utils'

export function ForkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: fork, isLoading, error } = useFork(Number(id))

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !fork) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Fork not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/recipes/my-forks">Back to my forks</Link>
        </Button>
      </div>
    )
  }

  const hasInstructions = fork.custom_instructions.trim().length > 0
  const instructionLines = hasInstructions
    ? fork.custom_instructions.split('\n').filter(Boolean)
    : []

  return (
    <div className="max-w-3xl">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/recipes/my-forks">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to my forks
        </Link>
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{fork.original_recipe_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Forked {formatDate(fork.created_at)}
            </span>
            <Button variant="link" size="sm" className="h-auto p-0 text-sm" asChild>
              <Link to={`/recipes/${fork.original_recipe}`}>
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View original recipe
              </Link>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Custom Ingredients */}
        <div>
          <h2 className="mb-3 text-xl font-semibold">Custom Ingredients</h2>
          {fork.custom_ingredients.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {fork.custom_ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {ing}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No custom ingredients — using the original recipe's ingredients.
            </p>
          )}
        </div>

        {/* Custom Instructions */}
        {hasInstructions && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Custom Instructions
              </h2>
              <div className="space-y-3 text-sm">
                {instructionLines.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {fork.notes && (
          <>
            <Separator />
            <div>
              <h2 className="mb-3 text-xl font-semibold flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Notes
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{fork.notes}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
