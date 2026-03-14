import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Leaf, Check, X } from 'lucide-react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { key: 'uppercase', label: 'Contains an uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'Contains a lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { key: 'digit', label: 'Contains a number', test: (v: string) => /\d/.test(v) },
  { key: 'notNumeric', label: 'Not entirely numeric', test: (v: string) => v.length > 0 && !/^\d+$/.test(v) },
] as const

const schema = z
  .object({
    email: z.string().email('Invalid email'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/\d/, 'Must contain a number')
      .refine((v) => !/^\d+$/.test(v), 'Password cannot be entirely numeric'),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  })

type FormData = z.infer<typeof schema>

type ServerErrors = Record<string, string[]>

function extractServerErrors(err: unknown): ServerErrors | null {
  if (!axios.isAxiosError(err)) return null
  const data = err.response?.data
  if (!data || typeof data !== 'object') return null
  return data as ServerErrors
}

function PasswordChecklist({ password }: { password: string }) {
  const results = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password],
  )

  return (
    <ul className="mt-2 space-y-1">
      {results.map((r) => (
        <li key={r.key} className="flex items-center gap-1.5 text-xs">
          {r.passed ? (
            <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
          ) : (
            <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          )}
          <span className={r.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
            {r.label}
          </span>
        </li>
      ))}
    </ul>
  )
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null
  return (
    <>
      {messages.map((msg, i) => (
        <p key={i} className="text-xs text-destructive">{msg}</p>
      ))}
    </>
  )
}

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [serverErrors, setServerErrors] = useState<ServerErrors>({})

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const passwordValue = watch('password', '')

  const onSubmit = async (data: FormData) => {
    setGlobalError(null)
    setServerErrors({})
    try {
      await registerUser(data)
      navigate('/inventory')
    } catch (err) {
      const fieldErrors = extractServerErrors(err)
      if (!fieldErrors) {
        setGlobalError('Registration failed. Please try again.')
        return
      }

      if (fieldErrors.non_field_errors) {
        setGlobalError(fieldErrors.non_field_errors.join(' '))
      }

      setServerErrors(fieldErrors)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Leaf className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start managing your kitchen smarter</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {globalError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{globalError}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" {...register('first_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" {...register('last_name')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            <FieldError messages={serverErrors.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            <FieldError messages={serverErrors.username} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            <FieldError messages={serverErrors.password} />
            <PasswordChecklist password={passwordValue} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirm">Confirm password</Label>
            <Input id="password_confirm" type="password" {...register('password_confirm')} />
            {errors.password_confirm && (
              <p className="text-xs text-destructive">{errors.password_confirm.message}</p>
            )}
            <FieldError messages={serverErrors.password_confirm} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
