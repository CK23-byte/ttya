# Stripe Payment Confirmations & Webhooks Setup Guide

## Overzicht

Deze guide legt uit hoe je automatische betaalbevestigingen per email instelt wanneer gebruikers credits kopen via Stripe Payment Links.

---

## 📧 Automatische Stripe Emails (Zonder Code)

Stripe stuurt automatisch emails voor betalingen. Hier is hoe je dit configureert:

### Stap 1: Email Receipts Inschakelen

1. **Ga naar**: https://dashboard.stripe.com/settings/emails
2. **Scroll naar**: "Customer emails"
3. **Enable**: "Successful payments" ✅
4. **Enable**: "Failed payments" ✅
5. **Enable**: "Refunds" ✅

**Wat krijgen klanten**:
- ✅ Payment receipt direct na succesvolle betaling
- ✅ PDF invoice als bijlage
- ✅ Transactie details (bedrag, datum, product)
- ✅ Bedrijfsinformatie (KVK nummer)

---

### Stap 2: Stripe Email Templates Customizen

1. **Ga naar**: https://dashboard.stripe.com/settings/emails
2. **Klik op**: "Customize receipt email"
3. **Personaliseer**:

#### Onderwerp (Subject Line)
```
Payment Confirmation - {{amount}} for {{product_name}} | TalkToYouAI
```

#### Email Body (gebruik de Stripe editor)
```html
Hi {{customer_name}},

Thank you for your purchase at TalkToYouAI!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER DETAILS
{{product_name}}
Amount paid: {{amount}}
Payment date: {{payment_date}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your credits have been added to your account automatically.

View your credits: https://talktoyouai.com/account

Questions? Reply to this email or visit our help center.

Thanks,
The TalkToYouAI Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TalkToYouAI - Where AI brings loved ones back to life
```

4. **Add logo**: Upload je TalkToYouAI logo (250x100px aanbevolen)
5. **Brand color**: `#f97316` (Orange-500)
6. **Save**

---

### Stap 3: Business Information Toevoegen

Voor professionele invoices moet je bedrijfsinformatie toevoegen:

1. **Ga naar**: https://dashboard.stripe.com/settings/public
2. **Vul in**:
   - **Business name**: TalkToYouAI
   - **Support email**: support@talktoyouai.com (of je eigen email)
   - **Support phone**: +31 6 XXX XXX XX
   - **Business address**: Je KVK adres
   - **Tax ID/VAT**: Je BTW nummer

3. **Ga naar**: https://dashboard.stripe.com/settings/billing/automatic
4. **Enable**: "Automatic tax calculation" (optioneel, handig voor EU BTW)

Deze info verschijnt automatisch op alle Stripe invoices.

---

## 🔔 Webhooks voor Credit Synchronisatie (Belangrijk!)

Momenteel worden credits handmatig toegekend. Met webhooks kun je dit automatiseren.

### Waarom Webhooks?

**Zonder webhooks**:
- ❌ Gebruiker betaalt, maar credits worden niet automatisch toegevoegd
- ❌ Je moet handmatig credits toekennen
- ❌ Gebruiker moet wachten

**Met webhooks**:
- ✅ Gebruiker betaalt → Credits worden direct toegevoegd
- ✅ Automatisch, geen handmatige actie nodig
- ✅ Real-time synchronisatie

---

### Webhook Setup - Stap voor Stap

#### Stap 1: Maak Webhook Endpoint in Code

**Bestand**: `api/stripe/webhook.ts` (nieuw aan te maken)

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key needed for admin operations
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature'] as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).json({ error: 'Webhook signature verification failed' })
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Get customer email
      const customerEmail = session.customer_details?.email

      if (!customerEmail) {
        throw new Error('No customer email found')
      }

      // Get user from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, voice_credits, video_credits')
        .eq('email', customerEmail)
        .single()

      if (profileError || !profile) {
        throw new Error('User profile not found')
      }

      // Parse metadata to determine credit type and amount
      const metadata = session.metadata || {}
      const creditType = metadata.credit_type as 'voice' | 'video'
      const creditAmount = parseInt(metadata.credit_amount || '0')

      if (!creditType || !creditAmount) {
        throw new Error('Invalid metadata')
      }

      // Add credits
      const updates = creditType === 'voice'
        ? { voice_credits: profile.voice_credits + creditAmount }
        : { video_credits: profile.video_credits + creditAmount }

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)

      // Log transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: profile.id,
          amount: creditAmount,
          type: 'purchase',
          credit_type: creditType,
          description: `Purchased ${creditAmount} ${creditType} credits`,
          stripe_payment_id: session.payment_intent as string,
        })

      console.log(`✅ Added ${creditAmount} ${creditType} credits to user ${customerEmail}`)
    } catch (error) {
      console.error('Error processing payment:', error)
      return res.status(500).json({ error: 'Failed to process payment' })
    }
  }

  res.status(200).json({ received: true })
}
```

#### Stap 2: Voeg Environment Variables toe aan Vercel

1. **Ga naar**: Vercel Dashboard → ttya → Settings → Environment Variables
2. **Voeg toe**:

```bash
# Stripe Secret Key (haal op van Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_live_xxx (of sk_test_xxx voor test mode)

# Stripe Webhook Secret (krijg je in stap 3)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase Service Role Key (haal op van Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

3. **Save** en **Redeploy**

---

#### Stap 3: Registreer Webhook in Stripe

1. **Ga naar**: https://dashboard.stripe.com/webhooks
2. **Klik op**: "Add endpoint"
3. **Vul in**:
   - **Endpoint URL**: `https://talktoyouai.com/api/stripe/webhook`
   - **Description**: Credit auto-add webhook
   - **Events to send**:
     - ✅ `checkout.session.completed`
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
4. **Click**: "Add endpoint"
5. **Kopieer** de "Signing secret" (begint met `whsec_`)
6. **Voeg toe** als `STRIPE_WEBHOOK_SECRET` in Vercel (zie stap 2)

---

#### Stap 4: Voeg Metadata toe aan Payment Links

Ga terug naar je Stripe Payment Links en voeg metadata toe:

**Voice Credits 50**:
- Metadata:
  - `credit_type`: `voice`
  - `credit_amount`: `50`

**Voice Credits 100**:
- Metadata:
  - `credit_type`: `voice`
  - `credit_amount`: `100`

**Voice Credits 500**:
- Metadata:
  - `credit_type`: `voice`
  - `credit_amount`: `500`

**Video Credits 50**:
- Metadata:
  - `credit_type`: `video`
  - `credit_amount`: `50`

**Video Credits 100**:
- Metadata:
  - `credit_type`: `video`
  - `credit_amount`: `100`

**Video Credits 500**:
- Metadata:
  - `credit_type`: `video`
  - `credit_amount`: `500`

Dit zorgt ervoor dat de webhook weet hoeveel en welk type credits moeten worden toegevoegd.

---

## ✅ Testing Checklist

### Test 1: Email Receipt Test

1. ✅ Gebruik Stripe test mode (test Payment Link)
2. ✅ Gebruik test kaart: `4242 4242 4242 4242`, exp: `12/34`, CVC: `123`
3. ✅ Vul je echte email in
4. ✅ Complete de betaling
5. ✅ Check of je een payment receipt ontvangt
6. ✅ Verify invoice PDF is bijgevoegd

**Verwachte email**:
- Subject: "Payment Confirmation - $X.XX for Voice/Video Credits"
- Body: Bedankt bericht + order details
- Bijlage: Invoice PDF

---

### Test 2: Webhook Test (Credits Auto-Add)

1. ✅ Deploy webhook endpoint naar Vercel
2. ✅ Registreer webhook in Stripe (met test endpoint URL)
3. ✅ Maak test payment
4. ✅ Check Stripe webhook logs: https://dashboard.stripe.com/test/webhooks
5. ✅ Verify "checkout.session.completed" event was received
6. ✅ Check Supabase: Credits zijn toegevoegd aan user profile
7. ✅ Check Supabase: Transaction is gelogd in credit_transactions table

**Debug hulp**:
```sql
-- Check user credits
SELECT email, voice_credits, video_credits
FROM profiles
WHERE email = 'your-test-email@example.com';

-- Check transactions
SELECT * FROM credit_transactions
WHERE user_id = (SELECT id FROM profiles WHERE email = 'your-test-email@example.com')
ORDER BY created_at DESC;
```

---

### Test 3: Failed Payment Email

1. ✅ Gebruik Stripe test kaart voor declined payment: `4000 0000 0000 0002`
2. ✅ Complete checkout
3. ✅ Verify je een "Payment failed" email ontvangt
4. ✅ Check dat géén credits zijn toegevoegd

---

### Test 4: Production Test (Kleine Transactie)

Na alle test mode tests:

1. ✅ Switch naar live mode in Stripe
2. ✅ Update webhook endpoint naar production URL
3. ✅ Maak een kleine test aankoop (bijv. 50 voice credits voor $5.99)
4. ✅ Use echte creditcard
5. ✅ Verify alle flows werken:
   - Email receipt ontvangen
   - Credits toegevoegd
   - Transaction gelogd
   - Redirect naar dashboard werkt

---

## 📊 Email Flow Diagram

```
User klikt "Buy Credits"
       ↓
Redirect naar Stripe Checkout
       ↓
User vult betaalgegevens in
       ↓
Payment succeeds ✅
       ↓
┌──────────────────────────────┬─────────────────────────────┐
│                              │                             │
│   STRIPE SENDS EMAIL         │   WEBHOOK TRIGGERED         │
│   ✅ Payment receipt         │   ✅ Credits auto-added     │
│   ✅ Invoice PDF             │   ✅ Transaction logged     │
│                              │                             │
└──────────────────────────────┴─────────────────────────────┘
       ↓
User redirected to dashboard
       ↓
Success message: "Payment successful! Your credits have been added"
```

---

## 🔧 Troubleshooting

### Probleem: Geen email ontvangen

**Check**:
1. Spam folder controleren
2. Stripe email settings: https://dashboard.stripe.com/settings/emails
3. Customer email is correct ingevuld tijdens checkout

**Fix**: Enable "Successful payments" in Stripe email settings

---

### Probleem: Webhook werkt niet

**Check**:
1. Webhook endpoint is deployed: https://talktoyouai.com/api/stripe/webhook
2. Webhook secret is correct in Vercel env vars
3. Stripe webhook logs voor errors: https://dashboard.stripe.com/webhooks

**Debug**:
```bash
# Check Vercel function logs
vercel logs --follow

# Test webhook lokaal (gebruik Stripe CLI)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

### Probleem: Credits worden niet toegevoegd

**Check**:
1. Metadata is toegevoegd aan Payment Link (credit_type, credit_amount)
2. User email in Stripe matcht met email in Supabase
3. SUPABASE_SERVICE_ROLE_KEY heeft write permissies

**Debug**: Check Stripe webhook logs en Vercel function logs

---

## 🎯 Samenvatting Setup Stappen

| Stap | Actie | Tijd | Status |
|------|-------|------|--------|
| 1 | Enable Stripe email receipts | 2 min | ⏳ |
| 2 | Customize Stripe email template | 5 min | ⏳ |
| 3 | Add business information to Stripe | 3 min | ⏳ |
| 4 | Create webhook endpoint (code) | - | 🤖 AI doet |
| 5 | Add environment variables to Vercel | 5 min | ⏳ |
| 6 | Register webhook in Stripe | 3 min | ⏳ |
| 7 | Add metadata to Payment Links | 5 min | ⏳ |
| 8 | Test in test mode | 10 min | ⏳ |
| 9 | Test in production | 5 min | ⏳ |
| **TOTAAL** | | **~40 min** | |

---

## 📝 Handmatige Acties Vereist

### Actie A: Stripe Email Setup (10 min)
1. Enable payment receipts
2. Customize email template
3. Add business info

### Actie B: Webhook Registratie (8 min)
1. Deploy code (AI doet)
2. Add env vars to Vercel
3. Register webhook in Stripe
4. Add metadata to Payment Links

### Actie C: Testing (15 min)
1. Test mode payment
2. Verify email
3. Verify credits
4. Production test

**Totaal handmatig werk**: ~33 minuten

---

**Laatste update**: December 2025
**Status**: Klaar voor implementatie
