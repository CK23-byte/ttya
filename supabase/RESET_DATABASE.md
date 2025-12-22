# Database Reset Instructions

Volg deze stappen om de Supabase database volledig op te schonen en opnieuw op te zetten.

## ⚠️ WAARSCHUWING

Dit verwijdert **ALLE DATA** uit je database:
- Alle gebruikersprofielen
- Alle personality profiles
- Alle credit transacties
- Alle API usage data

**Uploaded bestanden (photos/videos) in Storage blijven behouden** (tenzij je die ook handmatig verwijdert).

---

## Stap 1: Cleanup (alles verwijderen)

1. Ga naar **Supabase Dashboard**
2. Klik op je project → **SQL Editor**
3. Open het bestand `/home/user/ttya/supabase/cleanup_all.sql`
4. Kopieer de **VOLLEDIGE** inhoud
5. Plak in de SQL Editor
6. Klik **RUN** ▶️

Je zou moeten zien:
```
NOTICE: Cleanup complete! All tables, policies, triggers, and functions have been removed.
NOTICE: You can now run the fresh schema to recreate everything.
```

---

## Stap 2: Fresh Schema (alles opnieuw aanmaken)

1. Blijf in de **SQL Editor**
2. Open het bestand `/home/user/ttya/supabase/fresh_schema.sql`
3. Kopieer de **VOLLEDIGE** inhoud
4. Plak in de SQL Editor
5. Klik **RUN** ▶️

Je zou moeten zien:
```
NOTICE: ✅ Fresh schema installed successfully!
NOTICE: Tables created: profiles, personality_profiles, credit_transactions, api_usage
NOTICE: All RLS policies, functions, triggers, and indexes are set up.
NOTICE: ⚠️  IMPORTANT: Make sure to create the "user-uploads" storage bucket...
```

---

## Stap 3: Storage Bucket aanmaken/checken

1. Ga naar **Supabase Dashboard** → **Storage**
2. Check of de bucket **"user-uploads"** bestaat:
   - **Als JA:** Check of deze op **PUBLIC** staat
     - Klik op de bucket → **Configuration** → **Public bucket** moet **AAN** staan
   - **Als NEE:** Maak de bucket aan:
     - Klik **New bucket**
     - Name: `user-uploads`
     - Zet **Public bucket** op **ON**
     - Klik **Create bucket**

---

## Stap 4: Test de app

1. **Log uit** van de app (als je ingelogd bent)
2. **Wis browser cache** (of gebruik incognito mode)
3. **Ga naar je app** (Vercel deployment URL)
4. **Maak een nieuw account** aan of **log in**
5. **Maak een profiel** aan → zou moeten werken! ✅
6. **Klik "Improve Profile"** → zou moeten werken! ✅
7. **Upload een foto** → zou preview moeten tonen! ✅
8. **Klik "Save Changes"** → wordt opgeslagen in database! ✅
9. **Log uit en weer in** → je profiel is er nog! 🎉

---

## Troubleshooting

### "Error: relation does not exist"
- Je hebt stap 2 (fresh schema) nog niet uitgevoerd
- Voer `fresh_schema.sql` uit in de SQL Editor

### "Error: policy already exists"
- Je hebt stap 1 (cleanup) niet goed uitgevoerd
- Voer `cleanup_all.sql` opnieuw uit

### Photos uploaden maar niet zichtbaar
- Check of `user-uploads` bucket op **PUBLIC** staat
- Check de browser console voor errors
- Check of de RLS policies correct zijn aangemaakt (zie stap 2)

### Login werkt niet
- Check of je de correcte `VITE_SUPABASE_ANON_KEY` hebt in Vercel
- De key moet beginnen met `eyJ...` (JWT format)
- Ga naar Supabase Dashboard → Settings → API → Copy **anon public** key

### Profiles verdwijnen na logout/refresh
- Dit betekent dat de database niet correct is opgezet
- Voer stap 1 + 2 opnieuw uit

---

## Volgende stappen na reset

Na de reset is je database **leeg**. Dat betekent:

1. **Alle users moeten opnieuw een account aanmaken**
2. **Alle profiles moeten opnieuw worden aangemaakt**
3. **Alle photos/videos moeten opnieuw worden geupload**

Maar vanaf nu wordt **alles** opgeslagen in de database en blijft het behouden! 🎉

---

## Handige SQL queries voor debugging

### Check hoeveel profiles er zijn
```sql
SELECT COUNT(*) FROM public.personality_profiles;
```

### Bekijk alle profiles van een user
```sql
SELECT * FROM public.personality_profiles
WHERE user_id = 'YOUR_USER_ID_HERE';
```

### Check alle RLS policies
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check storage policies
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;
```
