# Foto Uploads Fixen - Stap voor Stap

## Probleem
Je krijgt deze foutmelding bij het uploaden van foto's:
- "Something went wrong with uploading. Please try again."
- Console error: `StorageApiError: new row violates row-level security policy`

## Oplossing
Je moet de **Storage Policies** in Supabase aanpassen zodat authenticated users foto's kunnen uploaden.

## Stappen

### 1. Open Supabase Dashboard
Ga naar: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

### 2. Open SQL Editor
- Klik in het linker menu op **SQL Editor**
- Of ga direct naar: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

### 3. Nieuwe Query
- Klik op **+ New Query** (rechtsboven)

### 4. Kopieer en Plak Deze SQL Code

```sql
-- ============================================
-- FIX STORAGE POLICIES VOOR user-uploads BUCKET
-- ============================================

-- Verwijder oude policies (als ze bestaan)
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read user-uploads files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to user-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their uploads" ON storage.objects;

-- ============================================
-- NIEUWE POLICIES
-- ============================================

-- 1. Iedereen kan bestanden LEZEN (public read)
CREATE POLICY "Public can read user-uploads files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-uploads');

-- 2. Ingelogde users kunnen bestanden UPLOADEN
CREATE POLICY "Authenticated users can upload to user-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads'
    AND auth.role() = 'authenticated'
  );

-- 3. Ingelogde users kunnen bestanden UPDATEN
CREATE POLICY "Users can update their uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-uploads'
    AND auth.role() = 'authenticated'
  );

-- 4. Ingelogde users kunnen bestanden VERWIJDEREN
CREATE POLICY "Users can delete their uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-uploads'
    AND auth.role() = 'authenticated'
  );

-- Klaar!
```

### 5. Voer de Query Uit
- Klik op **RUN** (of druk Ctrl+Enter / Cmd+Enter)
- Je zou moeten zien: "Success. No rows returned"

### 6. Test de Foto Upload
Ga terug naar je app en probeer:
1. **Account Settings** → Profile photo uploaden
2. **Improve Profile** → Upload Photos

Beide zouden nu moeten werken! ✅

## Nog Steeds Problemen?

### Check of de bucket bestaat
1. Ga naar **Storage** in Supabase dashboard
2. Controleer of er een bucket **user-uploads** bestaat
3. Als deze NIET bestaat:
   - Klik **New bucket**
   - Naam: `user-uploads`
   - **Public bucket**: AAN (toggle aan)
   - Klik **Create bucket**

### Check de policies
1. Ga naar **Storage** → **user-uploads** bucket
2. Klik op **Policies** tab
3. Je zou 4 policies moeten zien:
   - Public can read user-uploads files
   - Authenticated users can upload to user-uploads
   - Users can update their uploads
   - Users can delete their uploads

Als deze er niet zijn, voer de SQL query opnieuw uit.

## Wat Doet Dit?

De policies zorgen ervoor dat:
- ✅ **Iedereen** kan geüploade foto's **bekijken** (public read)
- ✅ **Alleen ingelogde users** kunnen foto's **uploaden**
- ✅ **Alleen ingelogde users** kunnen foto's **updaten**
- ✅ **Alleen ingelogde users** kunnen foto's **verwijderen**

Dit is veilig omdat:
- Foto's zijn gekoppeld aan ingelogde accounts
- Alleen authenticated users kunnen uploaden
- Public read is nodig zodat foto's getoond kunnen worden in de UI

## Hulp Nodig?

Als je vastloopt, stuur me:
1. Screenshot van de SQL Editor met de error
2. Screenshot van Storage → user-uploads → Policies tab
