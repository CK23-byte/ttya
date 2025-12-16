# Complete Testplan - Email & Payment Flow

## Overzicht

Dit testplan dekt alle email en payment flows voor TalkToYouAI. Volg deze tests in volgorde om te verifiëren dat alles correct werkt.

---

## 🧪 Test Suite 1: Email Templates (Supabase Auth)

### Test 1.1: Confirm Signup Email ✅

**Doel**: Verificeer dat nieuwe gebruikers een welkomsmail ontvangen

**Stappen**:
1. Ga naar https://talktoyouai.com
2. Klik op "Sign Up" / "Registreren"
3. Vul een **nieuw** email adres in
4. Vul wachtwoord in (min. 8 karakters)
5. Klik op "Create Account"

**Verwachte resultaten**:
- ✅ Gebruiker ziet "Check your email to confirm"
- ✅ Email ontvangt binnen 1 minuut:
  - **Subject**: "Welcome to TalkToYouAI! 🎉" (of jouw custom subject)
  - **From**: noreply@mail.app.supabase.io (of custom domain)
  - **Body**: Welcome bericht met:
    - Confirm button (oranje/roze)
    - Uitleg over signup bonus credits
    - Next steps
- ✅ Klik op "Confirm Email Address" button
- ✅ Redirect naar dashboard
- ✅ Credits zijn zichtbaar op Account pagina:
  - 10 text credits
  - 5 voice credits
  - 2 video credits

**Als test faalt**:
- Check Supabase email settings: Authentication → Email Templates
- Check spam folder
- Check of email adres correct is ingevuld

---

### Test 1.2: Magic Link Email ✅

**Doel**: Passwordless login via email link

**Stappen**:
1. Ga naar https://talktoyouai.com/email-auth
2. Selecteer "Send Magic Link"
3. Vul je email adres in
4. Klik op "Send Magic Link"

**Verwachte resultaten**:
- ✅ Bericht: "Check your email for the magic link"
- ✅ Email ontvangt binnen 1 minuut:
  - **Subject**: "Your TalkToYouAI login link 🔑"
  - **Body**: Sign in button + security note
- ✅ Klik op "Sign In" button
- ✅ Automatisch ingelogd en redirect naar dashboard

**Als test faalt**:
- Check of email adres bestaat in database
- Check magic link expiration (60 min)
- Check redirect URL in email template

---

### Test 1.3: Password Reset Email ✅

**Doel**: Wachtwoord resetten via email

**Stappen**:
1. Ga naar https://talktoyouai.com/reset-password (of login pagina → "Forgot password")
2. Vul email adres in
3. Klik op "Send Reset Link"

**Verwachte resultaten**:
- ✅ Bericht: "Check your email for reset instructions"
- ✅ Email ontvangt binnen 1 minuut:
  - **Subject**: "Reset your TalkToYouAI password 🔐"
  - **Body**: Reset button + expiration warning
- ✅ Klik op "Reset Password" button
- ✅ Redirect naar password reset pagina
- ✅ Vul nieuw wachtwoord in (2x)
- ✅ Klik "Update Password"
- ✅ Success bericht + redirect naar dashboard
- ✅ Log in met nieuwe wachtwoord werkt

**Als test faalt**:
- Check of email bestaat
- Check reset link expiration (60 min)
- Check redirect URL in template

---

### Test 1.4: Change Email Address ✅

**Doel**: Email adres wijzigen

**Stappen**:
1. Log in op https://talktoyouai.com
2. Ga naar Account Settings
3. (Als deze functie geïmplementeerd is) Klik "Change Email"
4. Vul nieuw email adres in

**Verwachte resultaten**:
- ✅ Email naar **nieuw** adres:
  - **Subject**: "Confirm your new email address 📧"
  - **Body**: Confirm button
- ✅ Klik confirm button
- ✅ Email is gewijzigd in account

**Note**: Deze functie moet mogelijk nog geïmplementeerd worden in AccountPage.tsx

---

## 🧪 Test Suite 2: Stripe Payment Receipts

### Test 2.1: Payment Receipt Email (Test Mode) ✅

**Doel**: Verificeer Stripe payment receipt emails

**Stappen**:
1. Ga naar https://talktoyouai.com/pricing
2. Klik op een credit pack (bijv. "100 Voice Credits - $9.99")
3. Je wordt doorgestuurd naar Stripe Checkout
4. Vul test gegevens in:
   - **Email**: Je eigen email
   - **Card**: `4242 4242 4242 4242`
   - **Expiry**: `12/34`
   - **CVC**: `123`
   - **Name**: Test User
   - **Postal Code**: 12345
5. Klik "Pay $9.99"

**Verwachte resultaten**:
- ✅ Payment succeeds
- ✅ Redirect naar: `https://talktoyouai.com/dashboard?payment=success`
- ✅ Email van Stripe ontvangt binnen 2 minuten:
  - **Subject**: "Payment Confirmation - $9.99 for Voice Credits..." (of custom)
  - **From**: receipts@stripe.com
  - **Body**:
    - Product naam
    - Bedrag betaald
    - Datum
    - Invoice PDF bijlage
  - **Footer**: TalkToYouAI business info

**Als test faalt**:
- Check Stripe email settings: https://dashboard.stripe.com/settings/emails
- Check "Successful payments" is enabled
- Check spam folder
- Check business info is ingevuld in Stripe

---

### Test 2.2: Declined Payment Email ✅

**Doel**: Email bij mislukte betaling

**Stappen**:
1. Ga naar Stripe Checkout (zoals test 2.1)
2. Gebruik **decline test card**: `4000 0000 0000 0002`
3. Vul overige gegevens in
4. Klik "Pay"

**Verwachte resultaten**:
- ✅ Payment fails met error message
- ✅ Email van Stripe (als enabled):
  - **Subject**: "Payment failed for..."
  - **Body**: Informatie over mislukte betaling + retry instructies
- ✅ Géén credits toegevoegd aan account

**Als test faalt**:
- Check "Failed payments" is enabled in Stripe email settings

---

## 🧪 Test Suite 3: Webhook & Auto Credit Addition

### Test 3.1: Webhook Registration ✅

**Doel**: Verificeer dat webhook correct geregistreerd is

**Stappen**:
1. Ga naar https://dashboard.stripe.com/test/webhooks
2. Check of endpoint bestaat:
   - **URL**: `https://talktoyouai.com/api/stripe/webhook`
   - **Status**: Active (groene dot)
   - **Events**:
     - checkout.session.completed
     - payment_intent.succeeded
     - payment_intent.payment_failed

**Verwachte resultaten**:
- ✅ Endpoint is visible en active
- ✅ Signing secret begint met `whsec_`
- ✅ All events zijn geconfigureerd

**Als test faalt**:
- Registreer webhook opnieuw (zie STRIPE_PAYMENT_EMAILS_SETUP.md)
- Check webhook secret in Vercel env vars

---

### Test 3.2: Credits Auto-Add via Webhook ✅

**Doel**: Credits worden automatisch toegevoegd na betaling

**Stappen**:
1. **Pre-check**: Noteer huidige credits:
   ```sql
   SELECT email, voice_credits, video_credits
   FROM profiles
   WHERE email = 'your-test-email@example.com';
   ```

2. Ga naar https://talktoyouai.com/pricing
3. Kies **Voice Credits 50** ($5.99)
4. Complete Stripe checkout met test card `4242 4242 4242 4242`
5. Wait 5-10 seconden

6. **Check 1 - Stripe Webhook Logs**:
   - Ga naar https://dashboard.stripe.com/test/webhooks
   - Klik op de webhook endpoint
   - Check "Recent deliveries" tab
   - Laatste event moet zijn:
     - **Event**: checkout.session.completed
     - **Status**: Succeeded (groene vinkje)
     - **Response code**: 200

7. **Check 2 - Supabase Credits**:
   ```sql
   SELECT email, voice_credits, video_credits
   FROM profiles
   WHERE email = 'your-test-email@example.com';
   ```
   - voice_credits moet **+50** zijn

8. **Check 3 - Transaction Log**:
   ```sql
   SELECT *
   FROM credit_transactions
   WHERE user_id = (SELECT id FROM profiles WHERE email = 'your-test-email@example.com')
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   - Moet transaction tonen met:
     - amount: 50
     - type: 'purchase'
     - credit_type: 'voice'
     - stripe_payment_id: pi_xxx

9. **Check 4 - Application UI**:
   - Refresh https://talktoyouai.com/account
   - Voice credits moet updated zijn

**Verwachte resultaten**:
- ✅ Webhook event succeeds (200 response)
- ✅ Credits zijn toegevoegd (+50 voice credits)
- ✅ Transaction is gelogd
- ✅ UI toont nieuwe credits

**Als test faalt**:

**Fout A: Webhook krijgt 500 error**
- Check Vercel function logs: `vercel logs --follow`
- Check environment variables zijn gezet:
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - SUPABASE_SERVICE_ROLE_KEY
- Check Supabase connection

**Fout B: Webhook succeeds maar credits niet toegevoegd**
- Check metadata op Payment Link:
  - credit_type: voice
  - credit_amount: 50
- Check Stripe webhook logs voor error details
- Check Supabase database permissions

**Fout C: "User not found" error**
- Email in Stripe checkout moet matchen met email in Supabase profiles table
- Case-sensitive check

---

### Test 3.3: Video Credits Purchase ✅

**Doel**: Verificeer video credits werken

**Stappen**:
1. Kies **Video Credits 100** ($34.99)
2. Complete checkout
3. Check webhook succeeds
4. Check video_credits += 100

**Verwachte resultaten**:
- ✅ video_credits increased by 100
- ✅ Transaction logged with credit_type: 'video'

---

## 🧪 Test Suite 4: Payment Link Metadata

### Test 4.1: Verify Payment Link Metadata ✅

**Doel**: Alle payment links hebben correcte metadata

**Stappen**:
Voor elke Payment Link in Stripe Dashboard:

1. Ga naar https://dashboard.stripe.com/payment-links
2. Open elke link
3. Check Metadata sectie

**Verwachte metadata**:

**Voice Credits 50**:
```
credit_type: voice
credit_amount: 50
```

**Voice Credits 100**:
```
credit_type: voice
credit_amount: 100
```

**Voice Credits 500**:
```
credit_type: voice
credit_amount: 500
```

**Video Credits 50**:
```
credit_type: video
credit_amount: 50
```

**Video Credits 100**:
```
credit_type: video
credit_amount: 100
```

**Video Credits 500**:
```
credit_type: video
credit_amount: 500
```

**Als test faalt**:
- Voeg metadata toe aan elke Payment Link
- Redeploy is niet nodig, metadata wordt direct gebruikt

---

## 🧪 Test Suite 5: End-to-End User Journey

### Test 5.1: Complete New User Flow ✅

**Doel**: Test hele user journey van signup tot eerste credit gebruik

**Stappen**:
1. **Signup** met nieuw email adres
2. **Check email** → Confirm signup
3. **Login** naar dashboard
4. **Verify bonus credits**: 10 text, 5 voice, 2 video
5. **Create personality** (optional)
6. **Send text message** → Check text_credits -1
7. **Buy more credits**: Voice 100 pack
8. **Complete checkout**
9. **Wait 10 sec** → Refresh account page
10. **Verify**: voice_credits +100
11. **Check email**: Stripe payment receipt ontvangen

**Verwachte resultaten**:
- ✅ Signup succeeds
- ✅ Confirmation email received
- ✅ Bonus credits awarded
- ✅ Text message works, credits deducted
- ✅ Payment succeeds
- ✅ Credits auto-added
- ✅ Payment receipt received

**Total tijd**: ~5 minuten

---

## 🧪 Test Suite 6: Production Tests

### Test 6.1: Production Webhook Test ✅

**Voorwaarden**:
- Alle test mode tests zijn geslaagd
- Webhook is geregistreerd voor **live mode**
- Live Payment Links zijn aangemaakt

**Stappen**:
1. Switch Stripe naar **live mode**
2. Ga naar https://dashboard.stripe.com/webhooks (live)
3. Check endpoint status: Active
4. Maak **kleine test purchase** (Voice 50 - $5.99)
5. Use **echte creditcard**
6. Complete betaling
7. Check webhook logs (live)
8. Check credits zijn toegevoegd
9. Check payment receipt email

**Verwachte resultaten**:
- ✅ Payment succeeds
- ✅ Webhook triggers
- ✅ Credits added
- ✅ Receipt email received
- ✅ Real money charged ($5.99)

**⚠️ Belangrijk**: Dit kost echt geld! Test alleen als je zeker bent.

---

### Test 6.2: Refund Test ✅

**Doel**: Test refund flow

**Stappen**:
1. Ga naar Stripe Dashboard → Payments
2. Find test payment
3. Click "Refund"
4. Refund $5.99
5. Check email notification

**Verwachte resultaten**:
- ✅ Refund succeeds
- ✅ Customer receives refund email
- ⚠️ Credits are **NOT** automatically removed (manual process)

**Note**: Automatic credit removal on refund requires extra webhook handling

---

## 📊 Test Results Tracking

### Checklist

#### Email Tests
- [ ] Test 1.1: Confirm Signup Email
- [ ] Test 1.2: Magic Link Email
- [ ] Test 1.3: Password Reset Email
- [ ] Test 1.4: Change Email Address

#### Payment Receipt Tests
- [ ] Test 2.1: Payment Receipt (Test Mode)
- [ ] Test 2.2: Declined Payment Email

#### Webhook Tests
- [ ] Test 3.1: Webhook Registration
- [ ] Test 3.2: Credits Auto-Add (Voice)
- [ ] Test 3.3: Credits Auto-Add (Video)

#### Metadata Tests
- [ ] Test 4.1: All Payment Links have correct metadata

#### End-to-End Tests
- [ ] Test 5.1: Complete User Journey

#### Production Tests (Optioneel)
- [ ] Test 6.1: Production Webhook
- [ ] Test 6.2: Refund Flow

---

## 🐛 Common Issues & Solutions

### Issue 1: "No customer email" webhook error

**Symptoom**: Webhook fails met "No customer email in checkout session"

**Oplossing**:
- Payment Link moet "Collect customer emails" enabled hebben
- Check in Stripe Payment Link settings

### Issue 2: "User profile not found"

**Symptoom**: Webhook fails met "User profile not found for email"

**Oplossing**:
- User moet eerst account aanmaken op TalkToYouAI
- Email in checkout moet exact matchen (case-sensitive)
- Check: `SELECT * FROM profiles WHERE email = 'test@example.com'`

### Issue 3: Credits toegevoegd maar dubbel

**Symptoom**: Credits worden 2x toegevoegd

**Oplossing**:
- Stripe retries webhooks bij failures
- Check `stripe_payment_id` is unique in credit_transactions
- Add unique constraint:
  ```sql
  ALTER TABLE credit_transactions
  ADD CONSTRAINT unique_stripe_payment
  UNIQUE (stripe_payment_id);
  ```

### Issue 4: Webhook signature verification fails

**Symptoom**: "Webhook verification failed" error

**Oplossing**:
- Check STRIPE_WEBHOOK_SECRET is correct
- Secret is different for test vs live mode
- Get secret from: Stripe Dashboard → Webhooks → Endpoint → Signing secret

---

## 📈 Success Metrics

After all tests pass, you should have:

✅ **100% email delivery rate** for auth emails
✅ **100% payment receipt delivery** via Stripe
✅ **< 5 second** webhook processing time
✅ **100% credit addition success rate**
✅ **Zero manual credit provisioning** needed

---

## 🎯 Final Checklist voor Go-Live

- [ ] All Test Mode tests passed (Suite 1-5)
- [ ] Webhook registered in Live Mode
- [ ] All Payment Links created with correct metadata
- [ ] Business information added to Stripe
- [ ] Email templates customized in Supabase
- [ ] At least 1 Production test completed successfully
- [ ] Monitoring set up (Stripe webhook logs, Vercel logs)
- [ ] Support email configured for customer questions

**Estimated total test time**: 45-60 minuten

**Status**: ✅ Ready for testing
**Laatste update**: December 2025
