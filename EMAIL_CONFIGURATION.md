# Email Configuratie voor TalkToYouAI

## Overzicht

TalkToYouAI gebruikt Supabase Auth voor de meeste email notificaties en Stripe voor betaal-gerelateerde emails.

## 1. Supabase Auth Emails

Ga naar: **Supabase Dashboard → Authentication → Email Templates**

### 1.1 Confirm Signup (Welkomsmail)

**Wanneer**: Bij nieuwe account registratie
**Subject**: Welcome to TalkToYouAI! 🎉

**Email Template**:
```html
<h2>Welcome to TalkToYouAI!</h2>

<p>Hi {{ .Email }},</p>

<p>Thank you for joining TalkToYouAI - where AI brings your loved ones back to life through realistic conversations.</p>

<p>Please confirm your email address by clicking the button below:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Confirm Email Address</a></p>

<p>Or copy and paste this link into your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<h3>What's Next?</h3>
<ul>
  <li>✨ You received <strong>10 text credits</strong>, <strong>5 voice credits</strong>, and <strong>2 video credits</strong> to get started!</li>
  <li>💬 Create your first AI personality</li>
  <li>🎙️ Try voice calls with realistic AI voices</li>
  <li>📹 Experience video calls with AI avatars</li>
</ul>

<p>Need help? Reply to this email or visit our support center.</p>

<p>Best regards,<br>
The TalkToYouAI Team</p>

<hr>
<p style="font-size: 12px; color: #666;">
If you didn't create an account with TalkToYouAI, you can safely ignore this email.
</p>
```

**Redirect URL**: `https://talktoyouai.com/dashboard`

---

### 1.2 Magic Link (Wachtwoordloos inloggen)

**Wanneer**: Bij magic link login
**Subject**: Your TalkToYouAI login link 🔑

**Email Template**:
```html
<h2>Sign in to TalkToYouAI</h2>

<p>Hi {{ .Email }},</p>

<p>Click the button below to sign in to your TalkToYouAI account:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Sign In</a></p>

<p>Or copy and paste this link into your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>Security Note:</strong> This link expires in 60 minutes and can only be used once.</p>

<p>If you didn't request this login link, please ignore this email.</p>

<p>Best regards,<br>
The TalkToYouAI Team</p>
```

**Redirect URL**: `https://talktoyouai.com/dashboard`

---

### 1.3 Reset Password (Wachtwoord herstellen)

**Wanneer**: Bij wachtwoord reset aanvraag
**Subject**: Reset your TalkToYouAI password 🔐

**Email Template**:
```html
<h2>Reset Your Password</h2>

<p>Hi {{ .Email }},</p>

<p>We received a request to reset your TalkToYouAI password.</p>

<p>Click the button below to create a new password:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a></p>

<p>Or copy and paste this link into your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>Security Note:</strong> This link expires in 60 minutes. If you didn't request a password reset, please ignore this email - your password will remain unchanged.</p>

<p>Best regards,<br>
The TalkToYouAI Team</p>
```

**Redirect URL**: `https://talktoyouai.com/reset-password`

---

### 1.4 Change Email Address

**Wanneer**: Bij email adres wijziging
**Subject**: Confirm your new email address 📧

**Email Template**:
```html
<h2>Confirm Email Change</h2>

<p>Hi {{ .Email }},</p>

<p>You recently requested to change your TalkToYouAI account email address.</p>

<p>Click the button below to confirm this change:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Confirm Email Change</a></p>

<p>Or copy and paste this link into your browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p>If you didn't request this change, please contact our support team immediately.</p>

<p>Best regards,<br>
The TalkToYouAI Team</p>
```

**Redirect URL**: `https://talktoyouai.com/dashboard`

---

## 2. Stripe Emails (Betaling & Facturen)

Ga naar: **Stripe Dashboard → Settings → Emails**

### 2.1 Succesvol Payment Email

**Configuratie in Stripe**:
1. Ga naar **Settings → Emails → Successful payments**
2. Enable "Send receipt emails"
3. Customize subject: "Payment Confirmation - TalkToYouAI"
4. Add custom message:

```
Thank you for your purchase!

Your credits have been added to your TalkToYouAI account and are ready to use.

You can start using your new credits immediately by visiting your dashboard.

Questions? Contact us at support@talktoyouai.com
```

---

### 2.2 Automatische Facturen

**Configuratie in Stripe**:
1. Ga naar **Settings → Emails → Invoices**
2. Enable "Automatically send invoices"
3. Customize invoice email:
   - Subject: "Invoice from TalkToYouAI"
   - Enable PDF attachment
   - Enable "Send invoice receipts"

**Invoice Details toe te voegen**:
- Business Name: [Jouw Bedrijfsnaam]
- KVK Number: [Jouw KVK nummer]
- BTW/VAT ID: [Indien van toepassing]
- Address: [Jouw bedrijfsadres]

**Extra Configuratie**:
- **Settings → Business settings → Business information**
  - Vul alle bedrijfsgegevens in
  - Upload logo
- **Settings → Invoices → Invoice settings**
  - Enable "Automatically finalize invoices"
  - Set invoice numbering prefix (bijv. "TTY-")

---

### 2.3 Failed Payment Email

**Configuratie in Stripe**:
1. **Settings → Emails → Failed payments**
2. Enable email notificaties
3. Custom message:

```
We were unable to process your payment for TalkToYouAI.

Please update your payment method to continue using your subscription.

Update payment method: [Stripe hosted page link]

Need help? Contact support@talktoyouai.com
```

---

## 3. Custom Email Notificaties (via Supabase Edge Functions)

Voor extra custom emails zoals "New login detected" heb je Supabase Edge Functions nodig.

### 3.1 New Login Notification

**Bestand**: `supabase/functions/send-login-notification/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  const { email, location, device, timestamp } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'TalkToYouAI <noreply@talktoyouai.com>',
      to: [email],
      subject: 'New Login Detected - TalkToYouAI',
      html: `
        <h2>New Login Detected</h2>
        <p>Hi there,</p>
        <p>We detected a new login to your TalkToYouAI account:</p>
        <ul>
          <li><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</li>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Device:</strong> ${device}</li>
        </ul>
        <p>If this was you, you can safely ignore this email.</p>
        <p>If you don't recognize this login, please reset your password immediately and contact our support team.</p>
        <p>Best regards,<br>The TalkToYouAI Team</p>
      `,
    }),
  })

  return new Response(JSON.stringify({ sent: res.ok }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## 4. Email Providers

### Optie A: Supabase Ingebouwde Email (GRATIS)

**Voordelen**:
- ✅ Gratis included
- ✅ Werkt out-of-the-box
- ✅ Geen extra configuratie

**Nadelen**:
- ❌ Beperkt tot 3 emails per uur in gratis tier
- ❌ Generic "noreply@" adres
- ❌ Beperkte customization

**Voor Productie**: Upgrade naar Custom SMTP

---

### Optie B: Custom SMTP (Resend - AANBEVOLEN)

**Waarom Resend?**
- ✅ 3,000 emails gratis per maand
- ✅ Eigen domein (noreply@talktoyouai.com)
- ✅ Professionele templates
- ✅ Email analytics

**Setup**:
1. Account aanmaken op [resend.com](https://resend.com)
2. Domein verifiëren (talktoyouai.com)
3. API key ophalen
4. In Supabase: **Settings → Auth → SMTP Settings**:
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [YOUR_RESEND_API_KEY]
   From: noreply@talktoyouai.com
   ```

---

## 5. DNS Records voor Email (Resend)

Voeg deze DNS records toe aan je domein:

```
Type: TXT
Name: @
Value: [Resend verification code]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@talktoyouai.com

Type: TXT
Name: resend._domainkey
Value: [Resend DKIM key]

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

---

## 6. Testing Checklist

Test alle email flows:

### Supabase Auth Emails:
- [ ] Nieuwe account registratie → Welkomsmail
- [ ] Magic link login
- [ ] Wachtwoord reset
- [ ] Email adres wijziging
- [ ] Email verificatie

### Stripe Emails:
- [ ] Succesvolle betaling → Receipt
- [ ] Succesvolle betaling → Factuur PDF
- [ ] Failed payment notificatie
- [ ] Subscription renewal
- [ ] Subscription cancelled

### Custom Notifications (optioneel):
- [ ] New login notification
- [ ] Suspicious activity
- [ ] Credits running low
- [ ] Monthly usage summary

---

## 7. Spam Score Verbeteren

Om emails uit spam te houden:

1. **SPF Record** toevoegen:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   ```

2. **DKIM** inschakelen (via Resend)

3. **DMARC Policy** instellen:
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@talktoyouai.com
   ```

4. **Reply-To** adres instellen op echt email: `support@talktoyouai.com`

---

## 8. Email Templates Branding

Voeg deze styling toe aan alle templates:

```html
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  h2 {
    color: #f97316;
    margin-bottom: 20px;
  }

  .button {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(to right, #f97316, #e11d48);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
  }

  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    font-size: 12px;
    color: #666;
  }
</style>
```

---

## Implementatie Volgorde

1. **Week 1**: Supabase Auth emails configureren
2. **Week 2**: Stripe emails & facturen instellen
3. **Week 3**: Resend account + custom domain
4. **Week 4**: DNS records + email testing
5. **Week 5**: Custom notifications (optioneel)

---

## Support

Voor vragen over email setup:
- **Supabase Docs**: https://supabase.com/docs/guides/auth/auth-email-templates
- **Stripe Docs**: https://stripe.com/docs/receipts
- **Resend Docs**: https://resend.com/docs

---

**Laatst bijgewerkt**: December 2025
