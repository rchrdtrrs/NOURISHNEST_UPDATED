import { GenerateRecipeForm } from '@/components/recipes/GenerateRecipeForm'

export function GenerateRecipePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Recipe</h1>
        <p className="text-muted-foreground">Let AI create a personalized recipe from your pantry.</p>
      </div>
      <GenerateRecipeForm />
    </div>
  )
}
