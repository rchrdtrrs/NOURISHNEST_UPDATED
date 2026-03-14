import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Lazy-loaded pages
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const InventoryPage = lazy(() => import('@/pages/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })))
const RecipeListPage = lazy(() => import('@/pages/recipes/RecipeListPage').then(m => ({ default: m.RecipeListPage })))
const RecipeDetailPage = lazy(() => import('@/pages/recipes/RecipeDetailPage').then(m => ({ default: m.RecipeDetailPage })))
const GenerateRecipePage = lazy(() => import('@/pages/recipes/GenerateRecipePage').then(m => ({ default: m.GenerateRecipePage })))
const MyForksPage = lazy(() => import('@/pages/recipes/MyForksPage').then(m => ({ default: m.MyForksPage })))
const ForkDetailPage = lazy(() => import('@/pages/recipes/ForkDetailPage').then(m => ({ default: m.ForkDetailPage })))
const MealHistoryPage = lazy(() => import('@/pages/meals/MealHistoryPage').then(m => ({ default: m.MealHistoryPage })))
const RewardsPage = lazy(() => import('@/pages/meals/RewardsPage').then(m => ({ default: m.RewardsPage })))
const CommunityPage = lazy(() => import('@/pages/community/CommunityPage').then(m => ({ default: m.CommunityPage })))
const CommunityRecipeDetailPage = lazy(() => import('@/pages/community/CommunityRecipeDetailPage').then(m => ({ default: m.CommunityRecipeDetailPage })))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
const SubscriptionPage = lazy(() => import('@/pages/subscription/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })))
const SubscriptionManagePage = lazy(() => import('@/pages/subscription/SubscriptionManagePage').then(m => ({ default: m.SubscriptionManagePage })))
const AnalyticsDashboardPage = lazy(() => import('@/pages/analytics/AnalyticsDashboardPage').then(m => ({ default: m.AnalyticsDashboardPage })))

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route element={<PublicLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route
                    path="/inventory"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <InventoryPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/recipes"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <RecipeListPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/recipes/generate"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <GenerateRecipePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/recipes/my-forks"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <MyForksPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/recipes/my-forks/:id"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <ForkDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/recipes/:id"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <RecipeDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/meals/history"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <MealHistoryPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/meals/rewards"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <RewardsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <CommunityPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/community/:id"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <CommunityRecipeDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <ProfilePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/subscription"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <SubscriptionPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/subscription/manage"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <SubscriptionManagePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <AnalyticsDashboardPage />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
