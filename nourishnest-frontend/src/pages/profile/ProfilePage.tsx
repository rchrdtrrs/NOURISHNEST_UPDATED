import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { useUserProfile, useUpdateUser, useUpdateProfile } from '@/hooks/useProfile'
import type { UpdateUserPayload, UpdateProfilePayload } from '@/types/user.types'

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setInput('')
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {value.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="h-8"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

const accountSchema = z.object({
  username: z.string().min(3),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
})
type AccountForm = z.infer<typeof accountSchema>

const profileSchema = z.object({
  height_cm: z.number().min(0).optional().nullable(),
  weight_kg: z.number().min(0).optional().nullable(),
  budget_limit: z.number().min(0).optional().nullable(),
  calorie_target: z.number().min(0).optional().nullable(),
})
type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user } = useAuth()
  const { data: profile } = useUserProfile()
  const updateUserMutation = useUpdateUser()
  const updateProfileMutation = useUpdateProfile()

  const [allergies, setAllergies] = useState<string[]>([])
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([])

  useEffect(() => {
    if (profile) {
      setAllergies(profile.allergies ?? [])
      setDietaryRestrictions(profile.dietary_restrictions ?? [])
      setFitnessGoals(profile.fitness_goals ?? [])
    }
  }, [profile])

  const accountForm = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: user?.username ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
    },
  })

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      height_cm: null,
      weight_kg: null,
      budget_limit: null,
      calorie_target: null,
    },
  })

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        budget_limit: profile.budget_limit,
        calorie_target: profile.calorie_target,
      })
    }
  }, [profile, profileForm])

  const onAccountSubmit = (data: AccountForm) => {
    updateUserMutation.mutate(data as UpdateUserPayload)
  }

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate({
      ...data,
      allergies,
      dietary_restrictions: dietaryRestrictions,
      fitness_goals: fitnessGoals,
    } as UpdateProfilePayload)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {user?.subscription_tier} plan
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/subscription">Upgrade</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="health">Health Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...accountForm.register('username')} />
              {accountForm.formState.errors.username && (
                <p className="text-xs text-destructive">
                  {accountForm.formState.errors.username.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" {...accountForm.register('first_name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...accountForm.register('last_name')} />
              </div>
            </div>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Saving...' : 'Save account'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input id="height_cm" type="number" {...profileForm.register('height_cm', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  step="0.1"
                  {...profileForm.register('weight_kg', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calorie_target">Daily calorie target</Label>
                <Input
                  id="calorie_target"
                  type="number"
                  {...profileForm.register('calorie_target', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_limit">Weekly budget ($)</Label>
                <Input
                  id="budget_limit"
                  type="number"
                  step="0.01"
                  {...profileForm.register('budget_limit', { valueAsNumber: true })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Allergies</Label>
              <TagInput
                value={allergies}
                onChange={setAllergies}
                placeholder="e.g. peanuts (press Enter)"
              />
            </div>
            <div className="space-y-2">
              <Label>Dietary restrictions</Label>
              <TagInput
                value={dietaryRestrictions}
                onChange={setDietaryRestrictions}
                placeholder="e.g. vegetarian"
              />
            </div>
            <div className="space-y-2">
              <Label>Fitness goals</Label>
              <TagInput
                value={fitnessGoals}
                onChange={setFitnessGoals}
                placeholder="e.g. weight loss"
              />
            </div>

            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Save health profile'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
