# Test: Controleer of Foto's Daadwerkelijk in Bucket Staan

Voer deze stappen uit in **Supabase Dashboard**:

## Stap 1: Check Bucket Inhoud

1. Ga naar **Storage** → **user-uploads**
2. Klik op de **profiles** folder
3. Klik op een van de nummer folders (bijv. `1766489423676`)
4. Klik op de **photos** subfolder

**Vraag:** Zie je daar de foto's staan die je hebt geüpload?
- Ja → De files zijn er, maar de URLs zijn verkeerd
- Nee → De upload faalt stilletjes

## Stap 2: Test Direct URL

Als je foto's ziet in de bucket:

1. Klik met rechtermuisknop op een foto
2. Kies **"Copy URL"** of **"Get public URL"**
3. Plak deze URL in een nieuwe browser tab

**Vraag:** Laadt de foto?
- Ja → Probleem zit in de app (verkeerde URL constructie)
- Nee, 404 → Bucket permissions probleem

## Stap 3: Check Bucket Policies (Opnieuw)

Ga naar **Storage** → **user-uploads** → **Policies** tab

Je ZOU deze 4 policies moeten zien:
```
✅ Public can read user-uploads files (SELECT)
✅ Authenticated users can upload to user-uploads (INSERT)
✅ Users can update their uploads (UPDATE)
✅ Users can delete their uploads (DELETE)
```

**Als je deze NIET allemaal ziet:**
1. Ga naar **SQL Editor**
2. Voer OPNIEUW het fix_storage_policies.sql script uit

## Stap 4: Test met SQL Query

Voer dit uit in **SQL Editor**:

```sql
-- Check welke foto's er echt zijn
SELECT
  name,
  bucket_id,
  created_at,
  metadata->>'size' as size_bytes
FROM storage.objects
WHERE bucket_id = 'user-uploads'
  AND name LIKE 'profiles/%/photos/%'
ORDER BY created_at DESC
LIMIT 10;
```

Dit toont de laatste 10 foto's die zijn geüpload.

**Vergelijk de `name` kolom met de URLs uit je console logs.**

Bijvoorbeeld:
- Console URL: `.../photos/1766491293314_wfuylr.jpeg`
- SQL name: `profiles/1766489423676/photos/1766491293314_wfuylr.jpeg`

Als de paths NIET matchen, dan construeren we de verkeerde URL!

---

## Wat Te Doen

**Scenario A: Foto's staan er NIET**
→ De upload faalt. Moet wachten op nieuwe deployment met debug logging.

**Scenario B: Foto's staan er WEL, maar URL werkt niet**
→ Bucket permissions probleem. Voer fix_storage_policies.sql opnieuw uit.

**Scenario C: Foto's staan er WEL, URL werkt in browser, maar niet in app**
→ Path mismatch. Stuur me de SQL query resultaten.

**Scenario D: Foto's staan op andere locatie dan verwacht**
→ Path constructie is verkeerd. Stuur me de SQL query resultaten + console logs.

---

Stuur me:
1. ✅ of ❌ voor elke stap
2. De SQL query resultaten
3. Een screenshot van de Storage browser als je foto's ziet

Dan kan ik het probleem exact identificeren!
