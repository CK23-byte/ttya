# Tavus API - Quick Start Guide

**Voor:** Schaalbare Real-Time Video Avatars
**Status:** Ready to Implement
**Tijd:** 3-5 dagen

---

## 🎯 Wat Jij Moet Doen (Vandaag)

### Stap 1: Tavus Account Aanmaken

1. Ga naar: **https://tavus.io**
2. Klik op "Sign Up" of "Get Started"
3. Kies: **Hobbyist Plan ($39/maand)**
   - 3 personal replicas
   - 2,500 avatar tokens/maand
   - 25 minuten video per maand
   - Perfect voor testen!

### Stap 2: API Key Ophalen

1. Log in op Tavus dashboard
2. Ga naar: **Settings → API Keys**
3. Klik op "Create API Key"
4. **Kopieer de key** (ziet eruit als: `sk_...`)
5. **Bewaar veilig** - je ziet hem maar 1 keer!

### Stap 3: Webhook Secret Genereren

1. In Tavus dashboard: **Settings → Webhooks**
2. Klik "Add Webhook"
3. URL: `https://jouw-domain.vercel.app/api/tavus/webhook`
4. Events selecteren:
   - `replica.training.completed`
   - `replica.training.failed`
   - `conversation.started`
   - `conversation.ended`
5. **Kopieer Webhook Secret**

### Stap 4: Test Video Opnemen

**Vereisten voor Training Video:**
- ⏱️ **Lengte:** 2-5 minuten
- 📹 **Kwaliteit:** 1080p of hoger
- 💡 **Verlichting:** Helder, gelijkmatig licht
- 🎤 **Audio:** Duidelijk, geen achtergrondgeluid
- 👤 **Persoon:** Frontaal gezicht altijd zichtbaar
- 🗣️ **Spraak:** Natuurlijk praten, verschillende uitdrukkingen
- 🎬 **Format:** MP4 of WebM

**Tips voor Beste Resultaat:**
- Spreek verschillende zinnen uit
- Varieer je gezichtsuitdrukkingen
- Beweeg je hoofd licht (niet te veel!)
- Kijk direct in de camera
- 30 seconden stilte/idle aan het eind

**Voorbeeld Script voor 2-min Video:**
```
"Hallo! Ik ben [naam]. Ik ga jullie vandaag wat vertellen over mezelf.

Ik ben geboren in [plaats] en woon nu in [plaats]. Ik houd van [hobby's].

Mijn favoriete herinnering is [verhaal]. Het was zo bijzonder omdat...

Als ik aan jullie denk, dan... [emotioneel moment]

Ik hoop dat jullie dit fijn vinden om te zien. Tot snel!

[30 seconden stil blijven zitten, camera blijft aan]"
```

### Stap 5: Credentials Delen

**Stuur mij (veilig):**
- ✅ Tavus API Key
- ✅ Webhook Secret
- ✅ Test video (via Google Drive/WeTransfer)

**BELANGRIJK:** Deel deze NOOIT via normale chat! Gebruik:
- Encrypted email
- Password manager share
- Secure file transfer

---

## 📋 Wat Ik Ga Doen (Na jouw setup)

### Dag 1-2: Backend Development
- ✅ Database migrations toepassen
- ✅ `/api/tavus/*` endpoints bouwen
- ✅ Webhook handler implementeren
- ✅ Credit system integreren
- ✅ Error handling + logging

### Dag 3: Frontend Development
- ✅ ProfileImprovementPage updates
- ✅ VideoTavusPage maken
- ✅ Routing updates
- ✅ UI components
- ✅ Upload flow

### Dag 4: Testing
- ✅ Test replica creation met jouw video
- ✅ Test persona creation
- ✅ Test video call flow
- ✅ Test credit deduction
- ✅ Fix bugs

### Dag 5: Deployment
- ✅ Environment variables configureren
- ✅ Deploy naar Vercel production
- ✅ Monitor logs
- ✅ Verify webhooks
- ✅ Final testing

---

## 💰 Kosten Overzicht

### Development/Testing (Nu)
**Hobbyist Plan: $39/maand**
- 3 replicas (voor testen)
- 2,500 tokens
- 25 minuten video calls
- Perfect om mee te starten!

### Production (Later)
**Growth Plan: $375/maand**
- 10 complimentary replicas (gratis)
- Extra replicas: ~$37.50 per stuk
- 15 concurrent conversations
- Voor 100 users: ~$3,750/maand

**vs HeyGen:** $50,000/jaar
**Besparing:** 90% goedkoper!

### Credit Pricing in App
```typescript
TAVUS_REPLICA_CREATE: 50 credits      // One-time per avatar
TAVUS_PERSONA_CREATE: 10 credits      // One-time per persona
TAVUS_VIDEO_CALL_PER_MINUTE: 0.2      // Per minute
TAVUS_VIDEO_CALL_MINIMUM: 1 credit    // Min 5 minutes
```

---

## 🚀 Complete Workflow (Straks)

### Voor Gebruiker:

```
1. Upload 2-min training video
   └─ Progress bar shows upload

2. Click "Create Interactive Avatar"
   └─ System creates Tavus replica
   └─ Processing: 10-30 minutes
   └─ Email notification when ready

3. System auto-creates persona
   └─ Uses personality data from profile
   └─ Configures voice (ElevenLabs integration)
   └─ Ready for video calls!

4. Click "Start Video Call"
   └─ Redirect naar Daily.co room
   └─ Real-time conversation with AI avatar
   └─ Lip-sync, natural movements
   └─ FaceTime-achtige ervaring!

5. End call
   └─ Duration recorded
   └─ Credits deducted
   └─ Analytics saved
```

### Technische Flow:

```
User Upload → Supabase Storage → Presigned URL
     ↓
API: POST /v2/replicas
     ↓
Tavus: Training (10-30 min)
     ↓
Webhook: replica.training.completed
     ↓
DB Update: status = 'ready'
     ↓
API: POST /v2/personas (auto)
     ↓
DB Update: persona_id saved
     ↓
User Click: "Start Video Call"
     ↓
API: POST /v2/conversations
     ↓
Daily.co: WebRTC session
     ↓
User: Real-time video conversation
     ↓
End Call → Credit deduction
```

---

## 📚 Resources

### Tavus Documentatie
- **Main Docs:** https://docs.tavus.io/
- **API Reference:** https://docs.tavus.io/api-reference/
- **Replica Creation:** https://docs.tavus.io/api-reference/phoenix-replica-model/create-replica
- **Conversations:** https://docs.tavus.io/api-reference/conversations/create-conversation
- **GitHub Examples:** https://github.com/Tavus-Engineering/tavus-examples

### Video Training Guide
- **Best Practices:** https://docs.tavus.io/ (look for Replica Training guide)
- **Phoenix Model:** Phoenix-3 voor beste kwaliteit

### Support
- **Email:** support@tavus.io
- **Discord:** Join Tavus community
- **Docs:** Comprehensive documentation

---

## ✅ Checklist

### Jouw Taken (Vandaag):
- [ ] Tavus account aangemaakt
- [ ] Hobbyist plan actief ($39/maand)
- [ ] API key gekopieerd
- [ ] Webhook secret gekopieerd
- [ ] Test video opgenomen (2-5 min)
- [ ] Credentials veilig gedeeld met mij

### Mijn Taken (Deze Week):
- [ ] Environment variables geconfigureerd
- [ ] Database migrations applied
- [ ] Backend API endpoints gebouwd
- [ ] Frontend components gemaakt
- [ ] Testing met jouw video
- [ ] Production deployment
- [ ] Documentatie voltooid

### Samen Testen:
- [ ] Replica creation werkt
- [ ] Video quality check
- [ ] Conversation flow test
- [ ] Credit system werkt
- [ ] Error handling test
- [ ] Performance check

---

## 🎬 Klaar om Te Beginnen?

**Zodra jij:**
1. ✅ Tavus account hebt
2. ✅ API credentials hebt gedeeld
3. ✅ Test video hebt geüpload

**Dan start ik:**
1. 🚀 Backend development
2. 🎨 Frontend integration
3. 🧪 Testing & debugging
4. 📦 Production deployment

**Geschatte tijd:** 3-5 dagen tot volledig werkend systeem!

---

## 💡 Pro Tips

### Video Opname:
- Gebruik je smartphone (vaak betere camera dan webcam)
- Landschap modus (landscape, niet portrait)
- Statief of stabiele ondergrond
- Test verlichting eerst (geen schaduwen in gezicht)
- Record meerdere takes, kies de beste

### Cost Optimization:
- Start met Hobbyist ($39)
- Scale naar Growth als je 10+ users hebt
- Contact Tavus voor Enterprise pricing bij 50+ users
- Monitor usage dashboard regelmatig

### Best Practices:
- Train 1 test replica eerst
- Verify kwaliteit voor je er meer maakt
- Use webhooks (niet polling)
- Cache persona configs
- Set max call duration (prevent runaway costs)

---

**Vragen? Let me know!** 🚀
