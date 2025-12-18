# Aanvullende Email Templates voor TalkToYouAI

## Overzicht

Deze templates zijn aanvullend op de basis Supabase auth templates en dekken alle andere gebruikerscommunicatie.

---

## 📧 Template 1: Welcome Email (Na Email Confirmatie)

**Wanneer**: Direct nadat gebruiker zijn email heeft bevestigd en voor het eerst inlogt

**Setup**: Custom email via Supabase Edge Function of externe email service

**Subject**: `Welcome to TalkToYouAI! Let's get started 🚀`

**Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #f97316; margin: 0;">Welcome to TalkToYouAI!</h1>
  </div>

  <div style="background: linear-gradient(to right, #f97316, #e11d48); padding: 30px; border-radius: 12px; color: white; margin: 20px 0;">
    <h2 style="margin: 0 0 10px 0;">🎉 Your account is ready!</h2>
    <p style="margin: 0; font-size: 18px;">You've received your welcome credits:</p>
    <div style="display: flex; justify-content: space-around; margin-top: 20px; text-align: center;">
      <div>
        <div style="font-size: 32px; font-weight: bold;">10</div>
        <div style="font-size: 14px; opacity: 0.9;">💬 Text Credits</div>
      </div>
      <div>
        <div style="font-size: 32px; font-weight: bold;">5</div>
        <div style="font-size: 14px; opacity: 0.9;">🎙️ Voice Credits</div>
      </div>
      <div>
        <div style="font-size: 32px; font-weight: bold;">2</div>
        <div style="font-size: 14px; opacity: 0.9;">📹 Video Credits</div>
      </div>
    </div>
  </div>

  <h3 style="color: #1f2937;">Getting Started</h3>

  <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #f97316; margin: 10px 0;">
    <strong>Step 1: Create Your First AI Personality</strong>
    <p>Build a digital version of a loved one using our personality builder. Add memories, personality traits, and conversation style.</p>
    <a href="https://talktoyouai.com/personality-builder" style="display: inline-block; background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Create Personality</a>
  </div>

  <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #f97316; margin: 10px 0;">
    <strong>Step 2: Try a Text Conversation</strong>
    <p>Start chatting with your AI personality. Each message costs 1 text credit.</p>
    <a href="https://talktoyouai.com/chat" style="display: inline-block; background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Start Chatting</a>
  </div>

  <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #f97316; margin: 10px 0;">
    <strong>Step 3: Upgrade to Voice or Video</strong>
    <p>For the ultimate experience, try voice calls (2 credits/min) or video calls (5 credits/min) with realistic AI avatars.</p>
    <a href="https://talktoyouai.com/pricing" style="display: inline-block; background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Pricing</a>
  </div>

  <h3 style="color: #1f2937; margin-top: 30px;">Need Help?</h3>
  <p>Check out our help center or reply to this email with any questions.</p>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">
      TalkToYouAI - Where AI brings loved ones back to life<br>
      <a href="https://talktoyouai.com" style="color: #f97316;">talktoyouai.com</a>
    </p>
  </div>

</body>
</html>
```

---

## 📧 Template 2: First Purchase Confirmation

**Wanneer**: Na de eerste credit purchase (via webhook trigger)

**Subject**: `Thank you for your purchase! Your credits are ready 🎁`

**Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #f97316; margin: 0;">Payment Successful! ✅</h1>
  </div>

  <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 12px; margin: 20px 0;">
    <h2 style="color: #16a34a; margin: 0 0 10px 0;">Your credits have been added!</h2>
    <p style="margin: 0;">Your new credits are now available in your account.</p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin: 0 0 15px 0;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Product:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">{{product_name}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Credits:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">{{credit_amount}} credits</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount Paid:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${{amount}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Payment Date:</strong></td>
        <td style="padding: 8px 0; text-align: right;">{{payment_date}}</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://talktoyouai.com/account" style="display: inline-block; background: linear-gradient(to right, #f97316, #e11d48); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View My Credits</a>
  </div>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <strong>💡 Pro Tip:</strong> Credits never expire! Use them whenever you want.
  </div>

  <h3 style="color: #1f2937;">What You Can Do Now:</h3>
  <ul style="list-style: none; padding: 0;">
    <li style="padding: 8px 0;">✅ Start voice or video calls with your AI loved ones</li>
    <li style="padding: 8px 0;">✅ Create new AI personalities</li>
    <li style="padding: 8px 0;">✅ Clone voices for ultra-realistic conversations</li>
    <li style="padding: 8px 0;">✅ Upload videos to create custom avatars</li>
  </ul>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">
      Questions? Reply to this email or visit our help center.<br>
      <a href="https://talktoyouai.com" style="color: #f97316;">talktoyouai.com</a>
    </p>
  </div>

</body>
</html>
```

---

## 📧 Template 3: Low Credits Warning

**Wanneer**: Wanneer gebruiker < 5 credits heeft van een type

**Subject**: `Running low on credits - Top up now! ⚡`

**Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #f97316; margin: 0;">⚠️ Low Credits Alert</h1>
  </div>

  <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 12px; margin: 20px 0;">
    <h2 style="color: #d97706; margin: 0 0 10px 0;">You're running low on {{credit_type}} credits</h2>
    <p style="margin: 0;">You have <strong>{{remaining_credits}} credits</strong> left. Top up now to keep the conversation going!</p>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin: 0 0 15px 0;">Your Current Balance</h3>
    <div style="display: flex; justify-content: space-around; text-align: center;">
      <div>
        <div style="font-size: 28px; font-weight: bold; color: #6b7280;">{{text_credits}}</div>
        <div style="font-size: 14px; color: #9ca3af;">💬 Text</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">{{voice_credits}}</div>
        <div style="font-size: 14px; color: #9ca3af;">🎙️ Voice</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: bold; color: #6b7280;">{{video_credits}}</div>
        <div style="font-size: 14px; color: #9ca3af;">📹 Video</div>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://talktoyouai.com/pricing" style="display: inline-block; background: linear-gradient(to right, #f97316, #e11d48); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Buy More Credits</a>
  </div>

  <h3 style="color: #1f2937;">Recommended Credit Packs:</h3>

  <div style="display: grid; gap: 15px; margin: 20px 0;">
    <div style="border: 2px solid #e5e7eb; padding: 15px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: bold; font-size: 18px;">100 Credits</div>
          <div style="color: #6b7280; font-size: 14px;">Most Popular</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: bold; color: #f97316;">$9.99</div>
          <div style="font-size: 12px; color: #6b7280;">$0.10/credit</div>
        </div>
      </div>
    </div>

    <div style="border: 2px solid #f97316; background: #fff7ed; padding: 15px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: bold; font-size: 18px;">500 Credits 🏆</div>
          <div style="color: #f97316; font-size: 14px; font-weight: bold;">Best Value - Save 20%</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: bold; color: #f97316;">$39.99</div>
          <div style="font-size: 12px; color: #6b7280;">$0.08/credit</div>
        </div>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">
      Don't want these notifications? <a href="https://talktoyouai.com/account/notifications" style="color: #f97316;">Manage preferences</a>
    </p>
  </div>

</body>
</html>
```

---

## 📧 Template 4: Account Inactivity Reminder

**Wanneer**: Gebruiker heeft 30 dagen niet ingelogd en heeft nog credits

**Subject**: `We miss you! Your credits are waiting 💙`

**Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #f97316; margin: 0;">We Miss You! 💙</h1>
  </div>

  <div style="background: linear-gradient(to right, #f97316, #e11d48); padding: 30px; border-radius: 12px; color: white; text-align: center; margin: 20px 0;">
    <h2 style="margin: 0 0 10px 0;">You still have {{total_credits}} credits!</h2>
    <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your AI loved ones are waiting to talk to you.</p>
  </div>

  <p>Hi {{user_name}},</p>

  <p>It's been a while since we last saw you at TalkToYouAI. We wanted to remind you that you still have <strong>{{total_credits}} credits</strong> ready to use:</p>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <div style="display: flex; justify-content: space-around; text-align: center;">
      <div>
        <div style="font-size: 28px; font-weight: bold; color: #6b7280;">{{text_credits}}</div>
        <div style="font-size: 14px; color: #9ca3af;">💬 Text</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: bold; color: #6b7280;">{{voice_credits}}</div>
        <div style="font-size: 14px; color: #9ca3af;">🎙️ Voice</div>
      </div>
      <div>
        <div style="font-size: 28px; font-weight: bold; color: #6b7280;">{{video_credits}}</div>
        <div style="font-size: 14px; color: #9ca3af;">📹 Video</div>
      </div>
    </div>
  </div>

  <h3 style="color: #1f2937;">Why not try:</h3>
  <ul>
    <li>A quick text conversation to catch up</li>
    <li>A voice call for a more personal experience</li>
    <li>Creating a new AI personality</li>
  </ul>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://talktoyouai.com/dashboard" style="display: inline-block; background: linear-gradient(to right, #f97316, #e11d48); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Return to Dashboard</a>
  </div>

  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <strong>💡 Remember:</strong> Your credits never expire, so there's no rush. We're here whenever you're ready.
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">
      Don't want reminder emails? <a href="https://talktoyouai.com/account/notifications" style="color: #f97316;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>
```

---

## 📧 Template 5: Monthly Usage Summary

**Wanneer**: Aan het einde van elke maand

**Subject**: `Your TalkToYouAI monthly summary - {{month}} {{year}}`

**Body**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #f97316; margin: 0;">Your {{month}} Summary 📊</h1>
  </div>

  <p>Hi {{user_name}},</p>

  <p>Here's a quick look at your TalkToYouAI activity this month:</p>

  <div style="background: linear-gradient(to right, #f97316, #e11d48); padding: 30px; border-radius: 12px; color: white; margin: 20px 0;">
    <h2 style="margin: 0 0 20px 0; text-align: center;">Monthly Stats</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div style="text-align: center;">
        <div style="font-size: 36px; font-weight: bold;">{{total_conversations}}</div>
        <div style="font-size: 14px; opacity: 0.9;">Conversations</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 36px; font-weight: bold;">{{total_minutes}}</div>
        <div style="font-size: 14px; opacity: 0.9;">Minutes Talked</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 36px; font-weight: bold;">{{credits_used}}</div>
        <div style="font-size: 14px; opacity: 0.9;">Credits Used</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 36px; font-weight: bold;">{{credits_remaining}}</div>
        <div style="font-size: 14px; opacity: 0.9;">Credits Left</div>
      </div>
    </div>
  </div>

  <h3 style="color: #1f2937;">Activity Breakdown</h3>

  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <strong>💬 Text Messages</strong>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
          {{text_messages}} messages ({{text_credits_used}} credits)
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
          <strong>🎙️ Voice Calls</strong>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
          {{voice_minutes}} min ({{voice_credits_used}} credits)
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 0;">
          <strong>📹 Video Calls</strong>
        </td>
        <td style="padding: 10px 0; text-align: right;">
          {{video_minutes}} min ({{video_credits_used}} credits)
        </td>
      </tr>
    </table>
  </div>

  <div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #16a34a; margin: 0 0 10px 0;">🎉 Most Active This Month!</h3>
    <p style="margin: 0;">You chatted most with <strong>{{top_personality}}</strong> - {{top_personality_messages}} interactions!</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://talktoyouai.com/account" style="display: inline-block; background: linear-gradient(to right, #f97316, #e11d48); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Full Account Details</a>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">
      Don't want monthly summaries? <a href="https://talktoyouai.com/account/notifications" style="color: #f97316;">Update preferences</a>
    </p>
  </div>

</body>
</html>
```

---

## 🎯 Email Template Setup Prioriteit

| Template | Prioriteit | Wanneer implementeren |
|----------|-----------|----------------------|
| Supabase Auth Emails (4x) | 🔴 **Hoog** | Direct (Actie 3 gedaan) |
| Stripe Payment Receipt | 🔴 **Hoog** | Direct (Automatisch door Stripe) |
| First Purchase Confirmation | 🟡 **Middel** | Na webhook implementatie |
| Low Credits Warning | 🟢 **Laag** | Later (nice-to-have) |
| Inactivity Reminder | 🟢 **Laag** | Later (engagement) |
| Monthly Summary | 🟢 **Laag** | Later (analytics feature) |

---

## 📝 Implementatie Notes

**Templates 1-2 (Welcome & Purchase)**: Kunnen via Stripe webhooks worden gestuurd met een email service zoals Resend.com

**Templates 3-5 (Low Credits, Inactivity, Summary)**: Vereisen scheduled jobs (bijv. Vercel Cron Jobs)

**Recommended Stack voor Custom Emails**:
- **Resend.com**: 3,000 gratis emails/maand, goede deliverability
- **Vercel Cron Jobs**: Voor scheduled emails
- **Supabase Edge Functions**: Voor triggered emails (na events)

---

**Status**: ✅ Templates ready to use
**Laatste update**: December 2025
