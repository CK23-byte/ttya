# Stripe Product Descriptions

## Voice Credits - Product Omschrijvingen

### 50 Voice Credits ($5.99)
**Product Naam**: Voice Credits - 50 Credits (25 minutes)
**Prijs**: $5.99 (one-time payment)

**Omschrijving voor Stripe**:
```
Get 50 voice credits for realistic AI voice calls with your loved ones.

✓ 50 credits = 25 minutes of voice calls
✓ 2 credits per minute
✓ Ultra-realistic voice conversations
✓ Works with cloned voices or preset voices
✓ Credits never expire

Perfect for trying out voice calls or occasional conversations.
```

---

### 100 Voice Credits ($9.99) ⭐ POPULAR
**Product Naam**: Voice Credits - 100 Credits (50 minutes)
**Prijs**: $9.99 (one-time payment)

**Omschrijving voor Stripe**:
```
Get 100 voice credits for extended AI voice conversations.

✓ 100 credits = 50 minutes of voice calls
✓ 2 credits per minute
✓ Most popular pack - best value!
✓ Ultra-realistic voice conversations
✓ Works with cloned voices or preset voices
✓ Credits never expire

Recommended for regular voice conversations.
```

---

### 500 Voice Credits ($39.99) 🏆 BEST VALUE
**Product Naam**: Voice Credits - 500 Credits (250 minutes)
**Prijs**: $39.99 (one-time payment)

**Omschrijving voor Stripe**:
```
Get 500 voice credits - our best value pack for dedicated users.

✓ 500 credits = 250 minutes of voice calls
✓ 2 credits per minute
✓ Best price per minute (20% savings!)
✓ Ultra-realistic voice conversations
✓ Works with cloned voices or preset voices
✓ Credits never expire

Perfect for frequent voice conversations with your AI loved ones.
```

---

## Video Credits - Product Omschrijvingen

### 50 Video Credits ($19.99)
**Product Naam**: Video Credits - 50 Credits (10 minutes)
**Prijs**: $19.99 (one-time payment)

**Omschrijving voor Stripe**:
```
Get 50 video credits for face-to-face AI video calls.

✓ 50 credits = 10 minutes of video calls
✓ 5 credits per minute
✓ Realistic avatar video conversations
✓ See your loved one's face and expressions
✓ Powered by HeyGen AI technology
✓ Credits never expire

Experience the future of AI conversations with lifelike video.
```

---

### 100 Video Credits ($34.99) ⭐ POPULAR
**Product Naam**: Video Credits - 100 Credits (20 minutes)
**Prijs**: $34.99 (one-time payment)

**Omschrijving voor Stripe**:
```
Get 100 video credits for extended face-to-face AI conversations.

✓ 100 credits = 20 minutes of video calls
✓ 5 credits per minute
✓ Most popular video pack!
✓ Realistic avatar video conversations
✓ See your loved one's face and expressions
✓ Powered by HeyGen AI technology
✓ Credits never expire

Perfect for meaningful video conversations with your AI loved ones.
```

---

### 500 Video Credits ($149.99) 🏆 BEST VALUE
**Product Naam**: Video Credits - 500 Credits (100 minutes)
**Prijs**: $149.99 (one-time payment)

**Omschrijving voor Stripe**:
```
Get 500 video credits - our best value pack for video calls.

✓ 500 credits = 100 minutes of video calls
✓ 5 credits per minute
✓ Best price per minute (25% savings!)
✓ Realistic avatar video conversations
✓ See your loved one's face and expressions
✓ Powered by HeyGen AI technology
✓ Credits never expire

Ultimate package for dedicated users who want regular video conversations.
```

---

## Product Setup Instructies voor Stripe Dashboard

### Voor VOICE Credits:

1. **Ga naar**: https://dashboard.stripe.com/products
2. **Klik op**: "Add product"
3. **Vul in**:
   - Name: (zie hierboven)
   - Description: (kopieer omschrijving hierboven)
   - Pricing model: One time
   - Price: (zie bedrag hierboven)
   - Currency: USD
4. **Klik op**: "Save product"
5. **Klik op**: "Create payment link"
6. **Stel in**:
   - After payment → Redirect to: `https://talktoyouai.com/dashboard?payment=success`
   - Collect customer emails: Yes
7. **Kopieer** de Payment Link URL
8. **Voeg toe** aan `.env`:
   - `VITE_STRIPE_VOICE_CREDITS_50_LINK=...`
   - `VITE_STRIPE_VOICE_CREDITS_100_LINK=...`
   - `VITE_STRIPE_VOICE_CREDITS_500_LINK=...`

### Voor VIDEO Credits:

Volg dezelfde stappen als Voice Credits, maar gebruik de Video Credit omschrijvingen.

**Environment variables**:
- `VITE_STRIPE_VIDEO_CREDITS_50_LINK=...`
- `VITE_STRIPE_VIDEO_CREDITS_100_LINK=...`
- `VITE_STRIPE_VIDEO_CREDITS_500_LINK=...`

---

## Subscription Plans (Text Chat) - OPTIONEEL

### Starter Monthly ($9.99/month)
**Product Naam**: Starter Plan - Monthly
**Prijs**: $9.99/month (recurring)

**Omschrijving**:
```
Start connecting with AI versions of your loved ones.

✓ 1,500 messages per month
✓ 3 AI Personalities
✓ All chat themes
✓ Priority text generation
✓ Upload up to 3 chat archives

Perfect for getting started with AI conversations.
```

### Pro Monthly ($24.99/month) ⭐ MOST POPULAR
**Product Naam**: Pro Plan - Monthly
**Prijs**: $24.99/month (recurring)

**Omschrijving**:
```
Deep, emotional continuity with your AI loved ones.

✓ 6,000 messages per month
✓ 10 AI Personalities
✓ Faster responses
✓ All chat themes
✓ Unlimited chat archives
✓ Conversation memory enhancement

Recommended for meaningful, regular conversations.
```

### Premium Monthly ($49.99/month) 🏆 PREMIUM
**Product Naam**: Premium Plan - Monthly
**Prijs**: $49.99/month (recurring)

**Omschrijving**:
```
The closest experience to talking with a real person.

✓ 20,000 messages per month
✓ Unlimited AI Personalities
✓ Ultra fast responses
✓ Extended memory model
✓ Priority support

For users who want the ultimate AI conversation experience.
```

---

## ⚠️ Belangrijk

**Na het aanmaken van alle producten**:
1. Test elke payment link in je browser
2. Controleer of de redirect naar `/dashboard?payment=success` werkt
3. Verifieer dat credits correct worden toegekend na betaling (dit vereist Stripe webhook setup)

**Webhook Setup** (voor automatische credit toekenning):
- Endpoint: `https://talktoyouai.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`

---

## Contact Support
Voor vragen over Stripe setup: support@talktoyouai.com
