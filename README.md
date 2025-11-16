# TalkToYouAI

Een veilige, privacy-first applicatie om te blijven verbinden met geliefden door AI-gestuurde persoonlijkheidssimulatie.

## 🔐 Beveiliging & Privacy

- **Client-Side Encryptie**: Alle data wordt versleuteld met AES-256-GCM voordat het wordt opgeslagen
- **Master Password**: Nooit opgeslagen - alleen gebruikt voor key derivation met PBKDF2 (100.000+ iteraties)
- **Zero Server Communication**: Alle verwerking gebeurt lokaal in je browser
- **Auto-Logout**: Sessie timeout na 30 minuten inactiviteit
- **Rate Limiting**: Maximaal 5 inlogpogingen met tijdelijke lockout

## ✨ Features

### ✅ Geïmplementeerd

1. **Authenticatie & Beveiliging**
   - Master wachtwoord setup met sterke validatie
   - Veilig login systeem met lockout protection
   - Encrypted localStorage voor alle gevoelige data

2. **WhatsApp-style Chat Interface**
   - Herkenbare chat UI (exact zoals WhatsApp)
   - Real-time berichten met typing indicator
   - Versleutelde berichtengeschiedenis
   - Anthropic Claude API integratie

3. **Memory Upload Systeem**
   - **WhatsApp Exports**: Upload en parse chat exports (.txt)
   - **Foto's**: Multiple upload met client-side compressie
   - **Audio Fragmenten**: Voice memos en geluidsopnames
   - Alle uploads worden encrypted opgeslagen

### 🚧 In Ontwikkeling

4. **AI Personality Builder** (volgende stap)
   - Stapsgewijze wizard voor personality profiel
   - Analyse van WhatsApp schrijfstijl
   - Custom personality traits
   - Preview van AI responses

5. **Video Call Interface** (gepland)
   - FaceTime-achtige video interface
   - Geanimeerde avatars
   - Call logging

## 🚀 Getting Started

### Installatie

```bash
# Kloon de repository
git clone https://github.com/CK23-byte/ttya.git
cd ttya

# Installeer dependencies
npm install

# Maak een .env bestand
cp .env.example .env

# Voeg je Anthropic API key toe aan .env
# VITE_ANTHROPIC_API_KEY=your_key_here
```

### Development

```bash
# Start development server
npm run dev

# Build voor productie
npm run build

# Preview productie build
npm run preview
```

## 📁 Project Structuur

```
ttya/
├── src/
│   ├── components/          # Herbruikbare UI componenten
│   │   ├── ChatHeader.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── MessageInput.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── PasswordSetup.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── WhatsAppUploader.tsx
│   │   ├── PhotoUploader.tsx
│   │   └── AudioUploader.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/               # Page componenten
│   │   ├── ChatPage.tsx
│   │   ├── MemoriesPage.tsx
│   │   ├── PersonalityBuilderPage.tsx
│   │   └── VideoPage.tsx
│   ├── utils/               # Utility functies
│   │   ├── encryption.ts    # AES-GCM encryptie
│   │   ├── secureStorage.ts # Encrypted localStorage wrapper
│   │   ├── claudeAPI.ts     # Anthropic API client
│   │   └── whatsappParser.ts# WhatsApp export parser
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── CLAUDE.md                # AI Assistant guide
├── README.md
└── package.json
```

## 🔧 Technologie Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Encryption**: Web Crypto API (AES-GCM, PBKDF2)
- **AI**: Anthropic Claude Sonnet 4

## 🔒 Beveiligingsarchitectuur

### Encryption Flow

```
Master Password (user input)
    ↓
PBKDF2 (100k iterations, SHA-256)
    ↓
Encryption Key (AES-256-GCM)
    ↓
[Stored only in memory during session]
    ↓
Encrypt/Decrypt localStorage data
```

### Data Opslag

- **Salt**: Opgeslagen in localStorage (public, gebruikt voor key derivation)
- **Encrypted Data**: Alle berichten, foto's, audio, personality profiles
- **Encryption Key**: NOOIT opgeslagen - alleen in geheugen tijdens actieve sessie

## 📱 Gebruik

1. **Eerste Keer Setup**
   - Stel een sterk master wachtwoord in (min. 12 tekens)
   - Dit wachtwoord kan NIET worden hersteld

2. **Upload Herinneringen**
   - WhatsApp chat export
   - Foto's van geliefde persoon
   - Audio fragmenten (stem, lach, etc.)

3. **Bouw Personality Profiel** (coming soon)
   - Vul persoonlijkheidskenmerken in
   - AI analyseert schrijfstijl uit WhatsApp
   - Stel toon en gedrag in

4. **Chat**
   - Praat met de AI personality
   - Berichten worden real-time gegenereerd
   - Alles encrypted opgeslagen

## ⚠️ Waarschuwingen

- **Wachtwoord Vergeten = Data Verloren**: Er is geen recovery optie
- **Browser Data**: Clearing browser data verwijdert alle herinneringen
- **API Kosten**: Claude API gebruik brengt kosten met zich mee
- **Emotioneel**: Deze tool kan emotioneel belastend zijn - gebruik met zorg

## 🛡️ Privacy Policy

- Geen tracking
- Geen analytics
- Geen externe data verzameling
- Alleen Anthropic API voor AI responses
- API calls bevatten alleen chat context, geen persoonlijke identificatie

## 📝 Development Status

- [x] Project setup & configuratie
- [x] Encryption layer & authenticatie
- [x] WhatsApp chat interface
- [x] Memory upload systeem
- [ ] Personality Builder wizard (in progress)
- [ ] Video call interface (planned)
- [ ] Testing & optimalisatie
- [ ] Deployment

## 🤝 Contributing

Zie [CLAUDE.md](./CLAUDE.md) voor development guidelines en best practices.

## 📄 License

TBD

## 🙏 Acknowledgments

- Anthropic voor Claude API
- React team voor excellent framework
- Vite team voor blazing fast tooling

---

**Met liefde gebouwd** 💜

*In nagedachtenis aan allen die we missen*
