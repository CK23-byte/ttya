# Vercel Environment Variables Setup

**BELANGRIJK:** Configureer deze environment variables in Vercel voordat je de Tavus integratie kunt gebruiken.

---

## 🔐 Vereiste Environment Variables voor Tavus

### In Vercel Dashboard

Ga naar: **https://vercel.com/[your-project]/settings/environment-variables**

Voeg de volgende variables toe:

### 1. **TAVUS_API_KEY** (Required)
- **Waarde:** Jouw Tavus API key (99eb169d2de14c5d961a5207171367x)
- **Environment:** Production, Preview
- **Beschrijving:** API key voor Tavus replica creation en conversations

### 2. **TAVUS_WEBHOOK_SECRET** (Optional but Recommended)
- **Waarde:** Gegenereerd in Tavus dashboard bij webhook setup
- **Environment:** Production, Preview
- **Beschrijving:** Secret voor webhook signature verification (security)

### 3. **OPENAI_API_KEY** (Required for Personas)
- **Waarde:** Jouw OpenAI API key
- **Environment:** Production, Preview
- **Beschrijving:** Voor LLM in Tavus personas (GPT-4 conversation logic)

---

## 📝 Stappen om Environment Variables Toe te Voegen

### Stap 1: Open Vercel Dashboard
1. Ga naar https://vercel.com
2. Selecteer jouw project
3. Klik op **Settings** → **Environment Variables**

### Stap 2: Voeg TAVUS_API_KEY toe
1. Klik **Add New**
2. **Name:** `TAVUS_API_KEY`
3. **Value:** `99eb169d2de14c5d961a5207171367x`
4. **Environments:** Check beide **Production** en **Preview**
5. Klik **Save**

### Stap 3: Voeg TAVUS_WEBHOOK_SECRET toe (Later)
1. Ga eerst naar Tavus dashboard
2. Setup webhook URL: `https://jouw-domain.vercel.app/api/tavus/webhook`
3. Kopieer de gegenereerde secret
4. Voeg toe aan Vercel (zelfde proces als stap 2)

### Stap 4: Redeploy
**BELANGRIJK:** Environment variables worden pas actief na een nieuwe deployment!

1. Ga naar **Deployments** tab
2. Klik op de laatste deployment
3. Klik **...** menu → **Redeploy**
4. Of: Push nieuwe code naar git (triggert auto-deploy)

---

## ✅ Verificatie

Na deployment, check de logs:

```bash
# In Vercel deployment logs moet je zien:
✓ TAVUS_API_KEY configured
✓ Ready to create replicas
```

**Test de API:**
1. Ga naar `/profile-improvement`
2. Upload een 2-min test video
3. Klik "Create Interactive Avatar"
4. Check Vercel logs voor errors

---

## 🔒 Security Best Practices

### DO's:
✅ Bewaar API keys in Vercel environment variables
✅ Gebruik verschillende keys voor development vs production
✅ Roteer keys regelmatig (elk kwartaal)
✅ Monitor usage in Tavus dashboard
✅ Enable webhook signature verification

### DON'Ts:
❌ NOOIT API keys in code committen
❌ NOOIT API keys in frontend (VITE_ prefix)
❌ NOOIT keys delen via onveilige kanalen
❌ NOOIT keys in screenshots/logs plaatsen

---

## 🔧 Troubleshooting

### Error: "Tavus API key not configured"
**Oplossing:**
1. Check of TAVUS_API_KEY in Vercel staat
2. Check of je hebt ge-redeploy na toevoegen
3. Check spelling (exact: `TAVUS_API_KEY`)

### Error: "Failed to create replica"
**Oplossing:**
1. Check Tavus dashboard credits
2. Check API key is geldig (test in Tavus dashboard)
3. Check video URL is publicly accessible

### Webhook Events Not Received
**Oplossing:**
1. Check webhook URL in Tavus dashboard
2. Moet exact zijn: `https://jouw-domain.vercel.app/api/tavus/webhook`
3. Check TAVUS_WEBHOOK_SECRET is correct
4. Check Vercel logs voor incoming requests

---

## 📊 Environment Variables Overzicht

| Variable | Required | Used By | Purpose |
|----------|----------|---------|---------|
| `TAVUS_API_KEY` | ✅ Yes | Backend API | Tavus API authentication |
| `TAVUS_WEBHOOK_SECRET` | ⚠️ Recommended | Webhook handler | Verify webhook signatures |
| `OPENAI_API_KEY` | ✅ Yes | Persona creation | LLM for conversations |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | All backend APIs | Database access |

---

## 🚀 Next Steps

Na het configureren van environment variables:

1. ✅ Redeploy de applicatie
2. ✅ Test replica creation met test video
3. ✅ Setup webhook in Tavus dashboard
4. ✅ Test complete video call workflow
5. ✅ Monitor credits usage

---

## 📞 Support

**Tavus Support:**
- Dashboard: https://tavus.io/dashboard
- Docs: https://docs.tavus.io
- Email: support@tavus.io

**Vercel Support:**
- Docs: https://vercel.com/docs
- Environment Variables: https://vercel.com/docs/environment-variables

---

**Laatste Update:** 2024-12-26
