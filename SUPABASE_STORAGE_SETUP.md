# Supabase Storage Setup voor Avatars

## Overzicht

Deze guide helpt je om de Supabase Storage bucket voor profielfoto's (avatars) in te stellen.

---

## Optie 1: Setup via Supabase Dashboard (AANBEVOLEN)

### Stap 1: Maak de Storage Bucket aan

1. **Ga naar je Supabase Dashboard**: https://supabase.com/dashboard
2. **Selecteer je project**: ttya
3. **Navigate naar**: Storage (in linker sidebar)
4. **Klik op**: "New bucket"
5. **Vul in**:
   - **Bucket name**: `avatars`
   - **Public bucket**: ✅ **Enable** (zodat avatar URLs publiek toegankelijk zijn)
   - **File size limit**: 2MB (optioneel, voor extra beveiliging)
   - **Allowed MIME types**: `image/*` (optioneel, voor extra beveiliging)
6. **Klik op**: "Create bucket"

### Stap 2: Configureer RLS Policies voor de Bucket

Ga naar: **Storage → avatars bucket → Policies**

#### Policy 1: Users kunnen hun eigen avatar uploaden
```
Policy name: Users can upload their own avatar
Allowed operation: INSERT
Target roles: authenticated
USING expression:
(bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

**Of via SQL**:
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Iedereen kan avatars bekijken
```
Policy name: Anyone can view avatars
Allowed operation: SELECT
Target roles: public
USING expression:
bucket_id = 'avatars'::text
```

**Of via SQL**:
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Policy 3: Users kunnen hun eigen avatar updaten
```
Policy name: Users can update their own avatar
Allowed operation: UPDATE
Target roles: authenticated
USING expression:
(bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

**Of via SQL**:
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: Users kunnen hun eigen avatar verwijderen
```
Policy name: Users can delete their own avatar
Allowed operation: DELETE
Target roles: authenticated
USING expression:
(bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

**Of via SQL**:
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Optie 2: Setup via SQL Editor (SNELLER)

Ga naar: **SQL Editor** in Supabase Dashboard

Kopieer en run de volgende SQL:

```sql
-- Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Anyone can view avatars (public access)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 3: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add helpful comments
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';
```

---

## Verificatie

Na het instellen van de bucket en policies, test of alles werkt:

### Test 1: Bucket bestaat
```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

**Verwacht resultaat**:
```
id      | name    | public
--------|---------|--------
avatars | avatars | true
```

### Test 2: Policies zijn actief
```sql
SELECT
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%';
```

**Verwacht resultaat**: 4 policies

### Test 3: Upload functionaliteit (via Application)
1. Log in op je TalkToYouAI applicatie
2. Ga naar **Account Settings**
3. Klik op het camera icoon bij je profielfoto
4. Upload een afbeelding (max 2MB)
5. Controleer of de avatar zichtbaar is

---

## File Structuur in Storage

Avatars worden opgeslagen met deze structuur:
```
avatars/
├── {user_id_1}-{timestamp}.jpg
├── {user_id_1}-{timestamp}.png
├── {user_id_2}-{timestamp}.jpg
└── ...
```

**Voorbeeld**:
```
avatars/a1b2c3d4-e5f6-7890-abcd-ef1234567890-1702742400000.jpg
```

---

## Beveiliging & Best Practices

### ✅ Aanbevolen instellingen

1. **Public Bucket**: ✅ Enabled
   - Avatars moeten publiek zichtbaar zijn
   - RLS policies zorgen voor veiligheid

2. **File Size Limit**: 2MB
   - Voorkomt excessief grote uploads
   - Houdt storage kosten laag

3. **MIME Type Restriction**: `image/*`
   - Alleen afbeeldingen toegestaan
   - Voorkomt misbruik

4. **RLS Policies**:
   - Users kunnen alleen hun eigen avatars uploaden/wijzigen/verwijderen
   - Iedereen kan avatars bekijken (nodig voor publieke profielen)

### 🔒 Security Checks

**Check 1**: Kan user X de avatar van user Y uploaden?
- ❌ **NEE** - RLS policy blokkeert dit

**Check 2**: Kan een niet-ingelogde gebruiker avatars uploaden?
- ❌ **NEE** - Alleen `authenticated` users

**Check 3**: Kan iedereen avatars bekijken?
- ✅ **JA** - Dit is gewenst voor publieke profielen

---

## Troubleshooting

### Probleem: "Bucket not found" error

**Oplossing**:
1. Controleer of bucket bestaat: `SELECT * FROM storage.buckets WHERE id = 'avatars'`
2. Als niet: Run de SQL uit Optie 2

### Probleem: "Access denied" bij upload

**Oorzaken**:
1. RLS policies zijn niet ingesteld
2. User is niet ingelogd
3. Bucket is niet public

**Oplossing**:
1. Check policies: `SELECT * FROM pg_policies WHERE tablename = 'objects'`
2. Controleer auth status: `SELECT auth.uid()`
3. Check bucket public setting

### Probleem: Avatar wordt niet getoond

**Oorzaken**:
1. `avatar_url` is niet correct opgeslagen in profiles table
2. Bucket is niet public
3. Image URL is invalid

**Oplossing**:
1. Check profile: `SELECT avatar_url FROM profiles WHERE id = auth.uid()`
2. Enable public access op bucket
3. Test URL direct in browser

### Probleem: "File too large" error

**Oplossing**:
- Client-side validatie is ingesteld op 2MB
- Als je grotere files wilt toestaan, pas `handleAvatarUpload` aan in `AccountPage.tsx`:
```typescript
// Change from 2MB to 5MB
if (file.size > 5 * 1024 * 1024) {
  alert('Bestand is te groot. Maximale grootte is 5MB')
  return
}
```

---

## Database Schema

De `profiles` table bevat nu een `avatar_url` kolom:

```sql
-- Added via migration 20251216_add_avatar_url.sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile avatar/picture stored in Supabase Storage';
```

---

## Cleanup (Optioneel)

Als je oude avatars wilt verwijderen (bijv. na nieuwe upload):

```typescript
// In handleAvatarUpload, before uploading new avatar:
if (profile?.avatar_url) {
  // Extract filename from URL
  const oldFileName = profile.avatar_url.split('/').pop()
  if (oldFileName) {
    await supabase.storage
      .from('avatars')
      .remove([`avatars/${oldFileName}`])
  }
}
```

---

## Kosten

**Supabase Storage Pricing** (Free tier):
- ✅ **1GB storage** gratis
- ✅ **2GB bandwidth** gratis per maand
- ✅ Unlimited requests

**Schatting voor TalkToYouAI**:
- Gemiddelde avatar: ~200KB
- 1GB = ~5,000 avatars
- Ruim voldoende voor gratis tier

---

## Volgende Stappen

1. ✅ Run de SQL uit Optie 2 om bucket en policies aan te maken
2. ✅ Test avatar upload via Account Settings
3. ✅ Controleer of avatar zichtbaar is na refresh
4. ⏭️ Optioneel: Implementeer avatar cleanup functie
5. ⏭️ Optioneel: Voeg image compression toe (bijv. via Sharp library)

---

**Laatst bijgewerkt**: December 2025
**Status**: ✅ Ready for production
