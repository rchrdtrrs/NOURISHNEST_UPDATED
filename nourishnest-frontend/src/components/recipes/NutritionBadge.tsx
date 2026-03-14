interface NutritionBadgeProps {
  nutritionInfo: Record<string, number>
}

export function NutritionBadge({ nutritionInfo }: NutritionBadgeProps) {
  const keys = ['calories', 'protein_g', 'carbs_g', 'fat_g']
  const labels: Record<string, string> = {
    calories: 'Calories',
    protein_g: 'Protein',
    carbs_g: 'Carbs',
    fat_g: 'Fat',
  }
  const units: Record<string, string> = {
    calories: 'kcal',
    protein_g: 'g',
    carbs_g: 'g',
    fat_g: 'g',
  }

  const present = keys.filter((k) => nutritionInfo[k] !== undefined)
  if (!present.length) return null

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {present.map((key) => (
        <div key={key} className="rounded-lg bg-muted p-3 text-center">
          <p className="text-lg font-bold">{nutritionInfo[key]}</p>
          <p className="text-xs text-muted-foreground">
            {labels[key]} {units[key]}
          </p>
        </div>
      ))}
    </div>
  )
}
