# NourishNest Reward System Integration - Implementation Guide

## Overview
This document provides a complete guide to the newly implemented reward redemption system that allows users to spend points earned through cooking and activity to unlock premium features and exclusive content.

---

## Table of Contents
1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [Database Schema Changes](#database-schema-changes)
4. [API Endpoints](#api-endpoints)
5. [Integration Guide](#integration-guide)
6. [Testing](#testing)

---

## Backend Implementation

### Models (users/models.py)

#### Updated UserBaseProfile
```python
class UserBaseProfile(models.Model):
    # ... existing fields ...
    has_advanced_analytics = BooleanField(default=False)
    has_ai_substitutions = BooleanField(default=False)
    theme_slugs = JSONField(default=list)
```

**New Fields:**
- `has_advanced_analytics`: Unlock detailed nutrition/spending analytics (100 points)
- `has_ai_substitutions`: Enable AI-powered ingredient substitutions (100 points)
- `theme_slugs`: List of unlocked theme identifiers (50 points each)

#### Updated UserRewards
```python
class UserRewards(models.Model):
    # ... existing fields ...
    chef_curated_recipes = ManyToManyField('recipes.Recipe', related_name='unlocked_by_users')
```

**New Field:**
- `chef_curated_recipes`: M2M relationship to unlock individual chef-curated recipes (75 points each)

### Serializers (users/serializers.py)

#### RedeemRewardSerializer
Validates and processes reward redemption requests:
```python
{
    "reward_type": "advanced_analytics|ai_substitutions|theme|chef_recipe|badge",
    "value": "optional - theme_slug, recipe_id, or badge_name"
}
```

#### RewardRedemptionResponseSerializer
Returns confirmation after successful redemption:
```python
{
    "success": true,
    "message": "Reward unlocked! You spent 100 points.",
    "points_remaining": 250,
    "reward_type": "advanced_analytics",
    "unlocked_item": "Advanced Analytics"
}
```

### View (users/views.py)

#### RedeemRewardView
**Endpoint:** `POST /api/users/rewards/redeem/`

**Point Costs:**
| Reward Type | Cost | Description |
|------------|------|-------------|
| `advanced_analytics` | 100 | Advanced nutrition & spending analytics |
| `ai_substitutions` | 100 | AI ingredient substitution suggestions |
| `theme` | 50 | Custom theme unlock |
| `chef_recipe` | 75 | Individual chef-curated recipe |
| `badge` | 30 | Collectible badge |

**Features:**
- ✅ Validates sufficient points
- ✅ Prevents duplicate unlocks
- ✅ Deducts points atomically
- ✅ Handles all reward types
- ✅ Comprehensive error handling with detailed messages

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/users/rewards/redeem/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reward_type": "advanced_analytics"
  }'
```

**Example Response (Success):**
```json
{
  "success": true,
  "message": "Reward unlocked! You spent 100 points.",
  "points_remaining": 150,
  "reward_type": "advanced_analytics",
  "unlocked_item": "Advanced Analytics"
}
```

**Example Response (Insufficient Points):**
```json
{
  "success": false,
  "message": "Not enough points. You have 50 but need 100.",
  "points_remaining": 50
}
```

---

## Frontend Implementation

### Types (src/types/user.types.ts)

```typescript
type RewardType = 'advanced_analytics' | 'ai_substitutions' | 'theme' | 'chef_recipe' | 'badge'

interface RewardPerk {
  id: string
  type: RewardType
  name: string
  description: string
  pointCost: number
  icon: React.ComponentType<{ className?: string }>
  value?: string // For theme slug, recipe ID, or badge name
}

interface RedeemRewardRequest {
  reward_type: RewardType
  value?: string
}

interface RedeemRewardResponse {
  success: boolean
  message: string
  points_remaining: number
  reward_type: RewardType
  unlocked_item?: string
}
```

### API Client (src/lib/api/users.api.ts)

```typescript
redeemReward: async (data: RedeemRewardRequest): Promise<RedeemRewardResponse> => {
  const res = await apiClient.post('/users/rewards/redeem/', data)
  return res.data
}
```

### Hooks (src/hooks/useRewards.ts)

#### useRewards()
Fetches current user rewards and points.

#### useRedeemReward()
Mutation hook for redeeming rewards with automatic cache invalidation:
```typescript
const { mutate: redeemReward, isPending } = useRedeemReward()

redeemReward(
  { reward_type: 'advanced_analytics' },
  {
    onSuccess: (response) => {
      toast.success(response.message)
    },
    onError: (error) => {
      toast.error(error.response.data.message)
    }
  }
)
```

### Components

#### RewardsStore.tsx (src/components/rewards/RewardsStore.tsx)

A comprehensive rewards marketplace UI component with:

**Features:**
- 🎨 Beautiful khaki/dark brown aesthetic (Tailwind)
- 📊 Points summary card with visual indicator
- 🎯 Organized reward categories
- 🔒 Visual unlock status
- ✨ Radix UI Dialog confirmation modal
- 🔔 Sonner toast notifications
- ♿ Fully accessible (ARIA compliant)
- 📱 Responsive grid layout

**Reward Categories:**
1. **Premium Features** - Analytics & AI features
2. **Themes** - Custom UI themes
3. **Exclusive Content** - Chef-curated recipes
4. **Badges & Collectibles** - Achievement badges

**Component Structure:**
```
RewardsStore (main container)
├── PointsSummary (display current points)
├── RewardCategories
│   ├── RewardCard (for each perk)
│   │   ├── Icon + Name
│   │   ├── Description
│   │   ├── Point cost
│   │   └── Unlock button
│   └── ...
└── RewardConfirmationModal
    ├── Reward details
    ├── Point breakdown
    ├── Validation checks
    └── Confirm/Cancel buttons
```

**RewardCard Props:**
```typescript
{
  perk: RewardPerk
  currentPoints: number
  isUnlocked: boolean
  onSelect: (perk: RewardPerk) => void
}
```

**Visual States:**
- ✅ Unlocked (green, checkmark badge)
- 🔓 Available (amber, clickable)
- 🔐 Locked (muted, insufficient points)

---

## Database Schema Changes

### Migration File
**Location:** `Backend/users/migrations/0009_reward_system_unlock.py`

**Changes:**
1. Add `has_advanced_analytics` (BooleanField) to UserBaseProfile
2. Add `has_ai_substitutions` (BooleanField) to UserBaseProfile
3. Add `theme_slugs` (JSONField) to UserBaseProfile
4. Add `chef_curated_recipes` (ManyToManyField) to UserRewards

### Run Migration
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## API Endpoints

### Redeem Reward
**Endpoint:** `POST /api/users/rewards/redeem/`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "reward_type": "advanced_analytics|ai_substitutions|theme|chef_recipe|badge",
  "value": "optional_value"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Reward unlocked! You spent X points.",
  "points_remaining": 250,
  "reward_type": "advanced_analytics",
  "unlocked_item": "Advanced Analytics"
}
```

**Error Cases:**
- `400 Bad Request` - Insufficient points, invalid reward, already unlocked
- `404 Not Found` - Recipe not found (for chef_recipe type)
- `500 Internal Server Error` - Server-side processing error

### Get User Rewards
**Endpoint:** `GET /api/users/rewards/`

**Authentication:** Required (Bearer token)

**Response:** `200 OK`
```json
{
  "points": 500,
  "streak_count": 10,
  "last_cooked_date": "2026-03-15",
  "badges": [...]
}
```

### Get User Profile
**Endpoint:** `GET /api/users/profile/`

**Authentication:** Required (Bearer token)

**Response:** `200 OK`
```json
{
  "id": 1,
  "user": 1,
  "height_cm": 180,
  "weight_kg": 75.5,
  "allergies": [],
  "dietary_restrictions": [],
  "fitness_goals": [],
  "budget_limit": 500,
  "calorie_target": 2000,
  "has_advanced_analytics": true,
  "has_ai_substitutions": false,
  "theme_slugs": ["dark-khaki"]
}
```

---

## Integration Guide

### Step 1: Run Database Migration
```bash
cd Backend
python manage.py migrate users
```

### Step 2: Add RewardsStore to Dashboard/Profile Page
```typescript
import { RewardsStore } from '@/components/rewards/RewardsStore'

export function RewardsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold text-amber-950">Rewards Store</h1>
      <RewardsStore />
    </div>
  )
}
```

### Step 3: Add Link in Navigation
```typescript
<Link to="/rewards" className="...">
  <Zap className="h-5 w-5" />
  Rewards Store
</Link>
```

### Step 4: Connect Point-Earning Logic
Points are awarded through:
- **MealHistory:** When user cooks a recipe (+10 points default)
- **RecipeReview:** When user rates a recipe (+5 points)
- **Custom events:** Configurable in recipes/services.py

**Example - Award points when user cooks:**
```python
# In recipes/views.py or services.py
from users.models import UserRewards

def log_meal_history(user, recipe):
    meal = MealHistory.objects.create(user=user, recipe=recipe)
    
    # Award points
    rewards = user.rewards
    rewards.points += 10
    rewards.save()
    
    return meal
```

---

## Testing

### Backend Tests (users/tests.py)

```python
from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User, UserRewards, UserBaseProfile

class RedeemRewardTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            username='testuser',
            password='testpass123'
        )
        self.rewards = UserRewards.objects.create(
            user=self.user,
            points=500
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_redeem_advanced_analytics(self):
        """Test unlocking advanced analytics feature"""
        response = self.client.post('/api/users/rewards/redeem/', {
            'reward_type': 'advanced_analytics'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['points_remaining'], 400)
        
        # Verify profile updated
        self.user.base_profile.refresh_from_db()
        self.assertTrue(self.user.base_profile.has_advanced_analytics)

    def test_insufficient_points(self):
        """Test error when user lacks points"""
        self.rewards.points = 50
        self.rewards.save()
        
        response = self.client.post('/api/users/rewards/redeem/', {
            'reward_type': 'advanced_analytics'
        })
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    def test_duplicate_unlock(self):
        """Test preventing duplicate feature unlocks"""
        profile = self.user.base_profile
        profile.has_advanced_analytics = True
        profile.save()
        
        response = self.client.post('/api/users/rewards/redeem/', {
            'reward_type': 'advanced_analytics'
        })
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('already unlocked', response.data['message'])
```

### Frontend Tests (components/rewards/RewardsStore.test.tsx)

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RewardsStore } from './RewardsStore'

const mockRewardsData = {
  points: 500,
  streak_count: 10,
  badges: [],
  last_cooked_date: '2026-03-15'
}

describe('RewardsStore', () => {
  it('renders points display', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <RewardsStore />
      </QueryClientProvider>
    )
    
    expect(screen.getByText(/Reward Points/i)).toBeInTheDocument()
  })

  it('disables unlock button when insufficient points', () => {
    // Test with low points
    const buttons = screen.getAllByRole('button')
    const lockedButton = buttons.find(b => b.textContent.includes('Need More Points'))
    expect(lockedButton).toBeDisabled()
  })

  it('opens confirmation modal on unlock click', () => {
    const unlockButtons = screen.getAllByRole('button').filter(b => 
      b.textContent.includes('Unlock')
    )
    fireEvent.click(unlockButtons[0])
    
    expect(screen.getByText(/Confirm Reward Redemption/i)).toBeInTheDocument()
  })
})
```

### Manual Testing Checklist

- [ ] User can view rewards store with current points
- [ ] Point costs display correctly for each reward
- [ ] Disabled buttons show for insufficient points
- [ ] Modal opens on "Unlock" click
- [ ] Modal shows correct reward details and cost
- [ ] Confirmation button deducts points correctly
- [ ] Unlocked rewards display checkmark
- [ ] Success toast notification appears
- [ ] Points update immediately in UI
- [ ] Duplicate unlock attempts show error
- [ ] Invalid reward types show error
- [ ] Network errors handled gracefully

---

## File Structure Summary

```
Backend/
├── users/
│   ├── models.py (✅ Updated: UserBaseProfile, UserRewards)
│   ├── views.py (✅ Added: RedeemRewardView)
│   ├── serializers.py (✅ Added: RedeemRewardSerializer, RewardRedemptionResponseSerializer)
│   ├── urls.py (✅ Updated: Added redeem-reward route)
│   └── migrations/
│       └── 0009_reward_system_unlock.py (✅ New)

nourishnest-frontend/
├── src/
│   ├── types/
│   │   └── user.types.ts (✅ Updated: Added reward types)
│   ├── hooks/
│   │   ├── useRewards.ts (✅ Updated: Added useRedeemReward)
│   │   └── useProfile.ts (✅ Updated: Added useProfile export)
│   ├── lib/api/
│   │   └── users.api.ts (✅ Updated: Added redeemReward method)
│   └── components/rewards/
│       ├── RewardsStore.tsx (✅ New)
│       ├── BadgeGrid.tsx (existing)
│       ├── RewardsCard.tsx (existing)
│       └── StreakDisplay.tsx (existing)
```

---

## Next Steps

1. **Deploy Migration:** Run migration on production database
2. **Test Integration:** Use test cases provided above
3. **Add Point-Earning Logic:** Connect to MealHistory and RecipeReview
4. **Analytics Dashboard:** Display feature usage for unlocked features
5. **Admin Panel:** Create admin interface to manage reward perks

---

## Support & Troubleshooting

### Common Issues

**Issue:** "redeemReward is not a function"
- **Solution:** Ensure you've imported `useRedeemReward` from hooks, not just `useRewards`

**Issue:** Points not updating after redemption
- **Solution:** Check that `queryClient.invalidateQueries` is called in mutation onSuccess

**Issue:** Modal won't open
- **Solution:** Verify Dialog component is imported from `@/components/ui/dialog`

**Issue:** Insufficient points error on valid redemption
- **Solution:** Check that UserRewards.points is an integer, not a float

### Debug Mode

Enable debug logging in the API call:
```typescript
mutationFn: (data) => {
  console.log('Redeeming:', data)
  return usersApi.redeemReward(data)
}
```

---

## Future Enhancements

- [ ] Achievement system (earn badges automatically)
- [ ] Leaderboard (compete for points)
- [ ] Point multipliers (special events)
- [ ] Referral bonuses (invite friends)
- [ ] Daily challenges (earn bonus points)
- [ ] Reward expiration (limited-time offers)
- [ ] Bundled rewards (buy multiple at discount)

---

**Last Updated:** March 15, 2026  
**Version:** 1.0  
**Author:** NourishNest Development Team
