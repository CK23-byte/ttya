# Supabase Setup voor Living Legacy Avatars

Snelle setup om de storage bucket en database tables aan te maken.

## Optie 1: Via Supabase Dashboard (Snelst)

### Stap 1: Storage Bucket Aanmaken

1. Ga naar je Supabase project: https://supabase.com/dashboard
2. Klik op **Storage** in de zijbalk
3. Klik op **Create a new bucket**
4. Vul in:
   - **Name**: `living-legacy`
   - **Public bucket**: ✅ Aanvinken
   - **File size limit**: 50 MB
   - **Allowed MIME types**: Laat leeg (accepteert alles)
5. Klik **Create bucket**

### Stap 2: Database Tables Aanmaken

1. Klik op **SQL Editor** in de zijbalk
2. Klik op **New query**
3. Kopieer en plak de volledige inhoud van: `supabase/migrations/20241202_avatar_tables.sql`
4. Klik **Run** (onderaan)

Je zou moeten zien: ✅ "Success. No rows returned"

### Stap 3: Verifiëren

**Check Storage:**
- Ga naar **Storage** → Je ziet nu de bucket `living-legacy`

**Check Tables:**
- Ga naar **Table Editor** → Je ziet:
  - `avatar_profiles`
  - `avatar_messages`

**Check Policies:**
- Ga naar **Authentication** → **Policies**
- Je ziet policies voor beide tables

## Optie 2: Via SQL Script (Automatisch)

Als je Supabase CLI hebt geïnstalleerd:

```bash
# In project root
supabase db push

# Of run direct SQL
supabase db execute < supabase/migrations/20241202_avatar_tables.sql
```

## Optie 3: Via Setup Script

```bash
# Installeer dependencies
npm install @supabase/supabase-js

# Run setup script
node scripts/setup-supabase-storage.js
```

## Troubleshooting

### "Bucket not found" error

**Oorzaak**: Storage bucket bestaat nog niet

**Oplossing**: Voer Stap 1 hierboven uit (bucket aanmaken)

### "Permission denied" bij upload

**Oorzaak**: Storage policies zijn niet correct

**Oplossing**:
1. Ga naar **Storage** → **Policies** tab
2. Klik op bucket `living-legacy`
3. Add deze policies:

**INSERT Policy:**
```sql
CREATE POLICY "Users can upload to living-legacy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'living-legacy');
```

**SELECT Policy:**
```sql
CREATE POLICY "Public can read living-legacy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'living-legacy');
```

**DELETE Policy:**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'living-legacy');
```

### Tables bestaan al

Als je de foutmelding krijgt "relation already exists":
- Dit is OK! De tables bestaan al
- Skip deze stap

### RLS Policies conflict

Als je krijgt "policy already exists":
- Dit is OK! De policies bestaan al
- Skip deze stap

## Verificatie Test

Na setup, test of alles werkt:

```bash
# Start frontend
npm run dev

# Ga naar upload dashboard
http://localhost:5173/living-legacy/upload-dashboard

# Upload een voice file
# Als het werkt zonder "Bucket not found" → ✅ Success!
```

## Snelle Fix (Als je geen tijd hebt voor migrations)

Minimale SQL om snel te testen:

```sql
-- 1. Maak bucket aan
INSERT INTO storage.buckets (id, name, public)
VALUES ('living-legacy', 'living-legacy', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Geef iedereen upload rechten (alleen voor testing!)
CREATE POLICY "Allow all uploads for testing"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'living-legacy');

-- 3. Geef iedereen read rechten
CREATE POLICY "Allow all reads for testing"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'living-legacy');
```

⚠️ **Let op**: Dit geeft te veel permissions voor productie, maar werkt voor testen.

## Productie Setup

Voor productie, run de volledige migration:
```bash
# Via Supabase dashboard SQL editor
# Kopieer/plak: supabase/migrations/20241202_avatar_tables.sql
```

Dit setup:
- ✅ Avatar profiles table met RLS
- ✅ Avatar messages table met RLS
- ✅ Storage bucket met proper policies
- ✅ User-specific folder isolation
- ✅ Automatic timestamp updates
- ✅ Indexes voor performance

## Direct naar Supabase Dashboard

Je project URL: https://supabase.com/dashboard/project/gfgtxeglkzptqxiufjvv

Quick links:
- **Storage**: https://supabase.com/dashboard/project/gfgtxeglkzptqxiufjvv/storage/buckets
- **SQL Editor**: https://supabase.com/dashboard/project/gfgtxeglkzptqxiufjvv/sql/new
- **Table Editor**: https://supabase.com/dashboard/project/gfgtxeglkzptqxiufjvv/editor

## Support

Als je ergens vast loopt:
1. Check de Supabase logs: **Logs** → **Postgres Logs**
2. Check storage policies: **Storage** → klik bucket → **Policies** tab
3. Verify credentials in `.env` zijn correct
