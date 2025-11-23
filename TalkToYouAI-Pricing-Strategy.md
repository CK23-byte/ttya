# TalkToYouAI Pricing Strategy

## Business Model Overview

TalkToYouAI uses a **freemium subscription model** with optional add-on packs. This structure:

1. **Acquires users** through a generous free tier
2. **Converts users** to paid plans with clear value progression
3. **Maximizes revenue** through premium tiers and add-ons
4. **Maintains healthy margins** while keeping prices competitive

### Cost Structure (Per Unit)

| Resource | Internal Cost | Notes |
|----------|---------------|-------|
| Text Message | €0.002 | Claude API (Haiku/Sonnet mix) |
| Voice Clip | €0.15 | 15-second TTS generation |
| Video Minute | €1.00 | AI avatar generation |

### Target Margins

| Resource Type | Target Margin | Rationale |
|---------------|---------------|-----------|
| Text | 300%+ | Low cost, high volume |
| Voice | ~100% | Medium cost, premium feature |
| Video | ~50% | High cost, flagship feature |

---

## Subscription Plans

### Overview Table

| Plan | Monthly | Yearly | Text/mo | Voice/mo | Video/mo |
|------|---------|--------|---------|----------|----------|
| **Free** | €0 | €0 | 50 | 0 | 0 |
| **Starter** | €9.99 | €99 | 1,000 | 0 | 0 |
| **Pro** | €19.99 | €199 | 3,000 | 10 clips | 0 |
| **Premium** | €49.99 | €499 | 5,000 | 30 clips | 5 min |

### Detailed Plan Breakdown

#### Free Plan
- **Price:** €0/month
- **Text Messages:** 50/month
- **Voice Clips:** 0
- **Video Minutes:** 0
- **Internal Cost:** €0.10
- **Purpose:** User acquisition and product sampling

#### Starter Plan
- **Price:** €9.99/month or €99/year (17% savings)
- **Text Messages:** 1,000/month
- **Voice Clips:** 0
- **Video Minutes:** 0
- **Internal Cost:** €2.00
- **Margin:** €7.99 (400%)
- **Target User:** Casual users, personal use

#### Pro Plan
- **Price:** €19.99/month or €199/year (17% savings)
- **Text Messages:** 3,000/month
- **Voice Clips:** 10/month
- **Video Minutes:** 0
- **Internal Cost:** €7.50 (€6.00 text + €1.50 voice)
- **Margin:** €12.49 (166%)
- **Target User:** Regular users, want voice features

#### Premium Plan
- **Price:** €49.99/month or €499/year (17% savings)
- **Text Messages:** 5,000/month
- **Voice Clips:** 30/month
- **Video Minutes:** 5/month
- **Internal Cost:** €18.50 (€10.00 text + €4.50 voice + €5.00 video)
- **Margin:** €31.49 (170%)
- **Target User:** Power users, want full experience

---

## Add-On Packs

For users who need more credits without upgrading their plan.

### Overview Table

| Pack | Price | Units | Cost | Margin | Margin % |
|------|-------|-------|------|--------|----------|
| **Extra Text** | €4.99 | 500 msgs | €1.00 | €3.99 | 399% |
| **Voice Pack** | €9.99 | 30 clips | €4.50 | €5.49 | 122% |
| **Video Pack** | €14.99 | 10 min | €10.00 | €4.99 | 50% |

### Detailed Add-On Breakdown

#### Extra Text Pack
- **Price:** €4.99 (one-time)
- **Included:** 500 text messages
- **Internal Cost:** €1.00
- **Margin:** €3.99 (399%)
- **Use Case:** Users who hit their text limit

#### Voice Pack
- **Price:** €9.99 (one-time)
- **Included:** 30 voice clips
- **Internal Cost:** €4.50
- **Margin:** €5.49 (122%)
- **Use Case:** Users who want more voice messages

#### Video Pack
- **Price:** €14.99 (one-time)
- **Included:** 10 video minutes
- **Internal Cost:** €10.00
- **Margin:** €4.99 (50%)
- **Use Case:** Users who want more video calls

---

## Financial Projections

### Per-User Monthly Revenue (Assuming Full Usage)

| Plan | Revenue | Cost | Profit | Margin % |
|------|---------|------|--------|----------|
| Free | €0 | €0.10 | -€0.10 | N/A |
| Starter | €9.99 | €2.00 | €7.99 | 400% |
| Pro | €19.99 | €7.50 | €12.49 | 166% |
| Premium | €49.99 | €18.50 | €31.49 | 170% |

### Blended Margin Analysis

Assuming user distribution:
- 70% Free (acquisition)
- 15% Starter
- 10% Pro
- 5% Premium

**Average Revenue Per Paying User (ARPPU):** €18.50/month
**Average Margin Per Paying User:** €13.50/month (73%)

---

## Justification

### Why This Structure Works

1. **Generous Free Tier**
   - 50 messages is enough to experience the product
   - Creates word-of-mouth and organic growth
   - Low cost to maintain (€0.10/user/month)

2. **Clear Upgrade Path**
   - Each tier offers 3x more value
   - Voice unlocks at Pro (emotional feature)
   - Video unlocks at Premium (flagship feature)

3. **Healthy Margins**
   - Text-heavy plans maintain 300%+ margins
   - Voice and video lower margins but add perceived value
   - Add-ons capture users who don't want to upgrade

4. **Fair for Users**
   - 1,000 messages/month is plenty for €9.99
   - Yearly discounts reward commitment (17% savings)
   - Add-ons provide flexibility

5. **Competitive Positioning**
   - Similar to ChatGPT Plus (€20/mo) and Claude Pro (€20/mo)
   - Voice and video are unique differentiators
   - Emotional connection use case justifies premium pricing

---

## Implementation Notes

### Stripe Products to Create

1. **Subscriptions:**
   - `starter_monthly` - €9.99/month recurring
   - `starter_yearly` - €99/year recurring
   - `pro_monthly` - €19.99/month recurring
   - `pro_yearly` - €199/year recurring
   - `premium_monthly` - €49.99/month recurring
   - `premium_yearly` - €499/year recurring

2. **One-Time Purchases:**
   - `addon_text_500` - €4.99
   - `addon_voice_30` - €9.99
   - `addon_video_10` - €14.99

### Credit Tracking

- Store credits in Supabase `profiles` table
- Deduct on each API call
- Reset monthly credits on billing date
- Add-on credits don't expire

---

*Last Updated: November 2024*
*Version: 1.0*
