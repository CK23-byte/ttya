# Foto's Zichtbaar Maken - Bucket PUBLIC Instellen

## Wat Is Het Probleem?

Je ziet dit in de console:
```
✅ Photo uploaded (upload werkt!)
❌ Failed to load photo (foto kan niet worden getoond)
```

De foto's worden succesvol geüpload, maar kunnen niet worden bekeken omdat de **bucket niet PUBLIC** is.

## Oplossing: Maak de Bucket PUBLIC

### Stap 1: Open Supabase Storage

1. Ga naar https://supabase.com/dashboard
2. Kies je project
3. Klik op **Storage** in het linker menu

### Stap 2: Selecteer de user-uploads Bucket

- Je ziet een lijst met buckets
- Klik op de **user-uploads** bucket

### Stap 3: Open Bucket Settings

- Rechtsboven zie je een **⋮** (drie puntjes) of **Settings** knop
- Klik hierop
- Of klik op **Configuration** tab

### Stap 4: Maak de Bucket PUBLIC

Je ziet nu een scherm met bucket instellingen.

**Zoek naar:**
- **Public bucket** toggle/checkbox
- Of **Bucket visibility** setting

**Zet deze AAN:**
- Toggle de switch naar **ON** (blauw/groen)
- Of vink de checkbox **Public** aan

**Klik SAVE** (of de wijziging wordt automatisch opgeslagen)

### Stap 5: Verifieer

Je zou nu moeten zien:
- Een 🌐 icoon bij de user-uploads bucket (betekent PUBLIC)
- Of een label "Public" bij de bucket naam

### Stap 6: Test de Foto's

1. Ga terug naar je app
2. Refresh de pagina (F5 of Ctrl+R)
3. Ga naar **Improve Profile**
4. Upload een foto
5. De preview zou nu MOETEN WERKEN! ✅

## Alternatief: Maak een Nieuwe Bucket (als user-uploads niet bestaat)

Als je **user-uploads** bucket NIET ziet:

1. Klik op **New bucket** (rechtsboven in Storage)
2. Vul in:
   - **Name:** `user-uploads`
   - **Public bucket:** ✅ AAN (HEEL BELANGRIJK!)
   - **File size limit:** 50 MB (optioneel)
   - **Allowed MIME types:** Laat leeg (alle types toegestaan)
3. Klik **Create bucket**

## Wat Betekent PUBLIC?

**PUBLIC bucket** betekent:
- ✅ Foto's zijn toegankelijk via een openbare URL
- ✅ Iedereen met de URL kan de foto zien
- ✅ Foto's worden getoond in je app
- ⚠️ Foto's zijn niet privé (maar URLs zijn moeilijk te raden)

Dit is normaal voor user-uploaded content zoals profielfoto's.

**PRIVATE bucket** zou betekenen:
- ❌ Foto's alleen toegankelijk met signed URLs
- ❌ URLs verlopen na een tijdje
- ❌ Niet geschikt voor langdurige opslag van publieke content

## Checklist

- [ ] Ga naar Supabase Dashboard → Storage
- [ ] Selecteer user-uploads bucket
- [ ] Open Settings/Configuration
- [ ] Zet **Public bucket** AAN
- [ ] Klik SAVE (als nodig)
- [ ] Verifieer dat bucket nu 🌐 icon heeft
- [ ] Test foto upload in je app
- [ ] Foto preview zou nu moeten werken!

## Nog Steeds Problemen?

### Check Browser Console

Open Developer Tools (F12) en kijk naar:
- **Console tab:** Zie je nog steeds "Failed to load photo"?
- **Network tab:** Click op een foto URL, wat is de status code?
  - **200 OK:** Werkt! 🎉
  - **404 Not Found:** Foto bestaat niet in bucket
  - **403 Forbidden:** Bucket is nog steeds niet public

### Check de Foto URL

De URL zou er zo uit moeten zien:
```
https://YOUR_PROJECT.supabase.co/storage/v1/object/public/user-uploads/profiles/...
```

Let op het woord **public** in de URL! Als de bucket public is, zou deze URL moeten werken als je hem rechtstreeks opent in je browser.

### Herstart Vereist?

Soms moet je:
1. De app pagina **hard refreshen** (Ctrl+Shift+R of Cmd+Shift+R)
2. Of **browser cache leegmaken**
3. Of in **incognito/private mode** testen

## Hulp Nodig?

Stuur me:
1. Screenshot van Storage → user-uploads bucket (toon of het PUBLIC is)
2. Een voorbeeld foto URL uit de console
3. De HTTP status code als je de URL direct opent
