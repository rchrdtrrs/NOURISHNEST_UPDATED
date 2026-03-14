import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Sparkles,
  Package,
  Globe,
  Trophy,
  Check,
  Leaf,
  ChefHat,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { publicClient } from '@/lib/api/client'
import type { SubscriptionPlan } from '@/types/user.types'
import { queryKeys } from '@/lib/queryKeys'

function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-white/80 backdrop-blur border-b px-6">
      <div className="flex items-center gap-2">
        <Leaf className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">NourishNest</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Get Started</Link>
        </Button>
      </div>
    </nav>
  )
}

const features = [
  {
    icon: Sparkles,
    title: 'AI Recipe Generation',
    description: 'Generate personalized recipes based on what is in your pantry using advanced AI.',
  },
  {
    icon: Package,
    title: 'Smart Pantry Tracking',
    description: 'Track expiry dates, get alerts, and reduce food waste with intelligent inventory management.',
  },
  {
    icon: Globe,
    title: 'Community Recipes',
    description: 'Discover and fork recipes from a growing community of home chefs.',
  },
  {
    icon: Trophy,
    title: 'Gamified Rewards',
    description: 'Earn points, build streaks, and unlock badges for cooking and reducing waste.',
  },
]

const steps = [
  { num: '1', title: 'Add your ingredients', desc: 'Log what is in your pantry with expiry dates and quantities.' },
  { num: '2', title: 'Generate a recipe', desc: 'Let AI craft the perfect recipe from your available ingredients.' },
  { num: '3', title: 'Cook and earn rewards', desc: 'Log your meals, build streaks, and earn badges.' },
]

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/inventory')
  }, [isAuthenticated, isLoading, navigate])

  const { data: plans } = useQuery({
    queryKey: queryKeys.subscriptionPlans(),
    queryFn: async () => {
      const res = await publicClient.get('/subscription/plans/')
      return res.data as SubscriptionPlan[]
    },
  })

  if (isLoading) return null

  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-32 pb-20 px-6 text-center">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" variant="outline">
          Smart Kitchen Management
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Smart kitchen management,
          <br />
          <span className="text-primary">powered by AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Reduce food waste, discover recipes from your pantry, and earn rewards for cooking smarter.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/register">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/community">Browse Recipes</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything your kitchen needs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      {plans && plans.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Simple, transparent pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={plan.tier === 'premium' ? 'border-primary shadow-lg' : ''}
                >
                  <CardHeader>
                    {plan.tier === 'premium' && (
                      <Badge className="w-fit mb-2">Most Popular</Badge>
                    )}
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="text-3xl font-bold">
                      {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6"
                      variant={plan.tier === 'premium' ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to="/register">Get started</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-primary text-primary-foreground text-center">
        <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-80" />
        <h2 className="text-3xl font-bold mb-4">Ready to reduce food waste?</h2>
        <p className="text-lg opacity-90 mb-8">Join thousands of home chefs cooking smarter.</p>
        <Button size="lg" variant="secondary" asChild>
          <Link to="/register">Sign Up Free</Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Leaf className="h-4 w-4 text-primary" />
          <span className="font-semibold">NourishNest</span>
        </div>
        <div className="flex justify-center gap-6">
          <Link to="/login" className="hover:text-foreground">Login</Link>
          <Link to="/register" className="hover:text-foreground">Sign Up</Link>
          <Link to="/community" className="hover:text-foreground">Community</Link>
        </div>
      </footer>
    </div>
  )
}
