import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useGenerateRecipe } from '@/hooks/useRecipes'
import { useInventoryItems } from '@/hooks/useInventory'

const schema = z.object({
  use_inventory: z.boolean(),
  inventory_item_ids: z.array(z.number()),
  cuisine_preference: z.string().optional(),
  max_prep_time: z.number().min(5).max(480).optional(),
  servings: z.number().min(1).max(20),
  additional_instructions: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function GenerateRecipeForm() {
  const navigate = useNavigate()
  const generateMutation = useGenerateRecipe()
  const { data: inventoryData } = useInventoryItems()
  const inventoryItems = inventoryData?.results ?? []

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      use_inventory: true,
      inventory_item_ids: [],
      servings: 2,
    },
  })

  const useInventory = watch('use_inventory')

  const onSubmit = async (data: FormData) => {
    try {
      const recipe = await generateMutation.mutateAsync({
        use_inventory: data.use_inventory,
        inventory_item_ids: data.use_inventory ? data.inventory_item_ids : undefined,
        cuisine_preference: data.cuisine_preference || undefined,
        max_prep_time: data.max_prep_time || undefined,
        servings: data.servings,
        additional_instructions: data.additional_instructions || undefined,
      })
      navigate(`/recipes/${recipe.id}`)
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status
      if (status === 429) {
        toast.error(
          <span>
            Daily generation limit reached.{' '}
            <Link to="/subscription" className="underline">
              Upgrade your plan
            </Link>
          </span>
        )
      }
    }
  }

  if (generateMutation.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium">Generating your recipe...</p>
        <p className="text-sm text-muted-foreground">This can take 5-15 seconds</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Controller
          control={control}
          name="use_inventory"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} id="use-inventory" />
          )}
        />
        <Label htmlFor="use-inventory">Use my pantry ingredients</Label>
      </div>

      {useInventory && inventoryItems.length > 0 && (
        <div className="space-y-2">
          <Label>Select specific items (optional — leave blank to use all)</Label>
          <div className="max-h-48 overflow-y-auto rounded border p-3 space-y-2">
            <Controller
              control={control}
              name="inventory_item_ids"
              render={({ field }) => (
                <>
                  {inventoryItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={field.value.includes(item.id)}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked
                              ? [...field.value, item.id]
                              : field.value.filter((id) => id !== item.id)
                          )
                        }}
                      />
                      <label htmlFor={`item-${item.id}`} className="text-sm cursor-pointer">
                        {item.name} ({item.quantity} {item.unit})
                      </label>
                    </div>
                  ))}
                </>
              )}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cuisine_preference">Cuisine preference (optional)</Label>
        <Input
          id="cuisine_preference"
          {...register('cuisine_preference')}
          placeholder="e.g. Italian, Mexican, Asian"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_prep_time">Max prep time (minutes)</Label>
          <Input
            id="max_prep_time"
            type="number"
            min={5}
            max={480}
            {...register('max_prep_time', { valueAsNumber: true })}
            placeholder="e.g. 30"
          />
          {errors.max_prep_time && (
            <p className="text-xs text-destructive">{errors.max_prep_time.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="servings">Servings</Label>
          <Input id="servings" type="number" min={1} max={20} {...register('servings', { valueAsNumber: true })} />
          {errors.servings && (
            <p className="text-xs text-destructive">{errors.servings.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_instructions">Additional instructions (optional)</Label>
        <Textarea
          id="additional_instructions"
          {...register('additional_instructions')}
          placeholder="e.g. Make it vegetarian, low-calorie, kid-friendly..."
          rows={3}
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Generate Recipe
      </Button>
    </form>
  )
}
