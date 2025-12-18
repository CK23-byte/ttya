# Supabase Setup Instructies

Dit document helpt je om de Supabase database correct in te stellen voor TalkToYouAI.

## Probleem

Je wordt na inloggen teruggestuurd naar de inlogpagina. Dit komt door:
1. **406 errors** bij het ophalen van het profiel
2. **RLS (Row Level Security) policies** die de query blokkeren

## Oplossing

Voer de volgende stappen uit in je Supabase dashboard:

### Stap 1: Open Supabase SQL Editor

1. Ga naar [supabase.com](https://supabase.com) en log in
2. Open je project: `gfgtxeglkzptqxiufjvv`
3. Klik op **SQL Editor** in het linker menu

### Stap 2: Voer het Setup Script Uit

1. Kopieer de volledige inhoud van `supabase-setup.sql`
2. Plak het in de SQL Editor
3. Klik op **Run** (of druk Ctrl+Enter)

Dit script doet het volgende:
- ✅ Schakelt Row Level Security (RLS) in
- ✅ Maakt policies zodat users hun eigen profiel kunnen lezen/updaten
- ✅ Maakt policies voor credit transactions

### Stap 3: Verifieer de Setup

Na het uitvoeren van het script, controleer het volgende:

#### Check 1: RLS is ingeschakeld
Voer deze query uit:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'credit_transactions');
```

Resultaat moet zijn:
```
schemaname | tablename             | rowsecurity
-----------|-----------------------|------------
public     | profiles              | true
public     | credit_transactions   | true
```

#### Check 2: Policies zijn aangemaakt
Voer deze query uit:
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'credit_transactions')
ORDER BY tablename, policyname;
```

Je zou deze policies moeten zien:
- ✅ `profiles` → "Users can read own profile" (SELECT)
- ✅ `profiles` → "Users can update own profile" (UPDATE)
- ✅ `profiles` → "Users can insert own profile" (INSERT)
- ✅ `credit_transactions` → "Users can read own transactions" (SELECT)
- ✅ `credit_transactions` → "Service role can insert transactions" (INSERT)

### Stap 4: Test de Login

1. Ga naar je app: [https://ttya-gxnwjkkfe-cas-projects-04caf2ac.vercel.app](https://ttya-gxnwjkkfe-cas-projects-04caf2ac.vercel.app)
2. Probeer in te loggen met:
   - Email: (je test email)
   - Password: (je test wachtwoord)
3. Je zou nu naar `/dashboard` moeten worden doorgestuurd

### Stap 5: Check Browser Console

Open de browser console (F12) en let op de logs:
- ✅ "Sign in successful: [user-id]"
- ✅ "Fetching profile for user: [user-id]"
- ✅ "Profile loaded successfully"
- ✅ "Redirecting to dashboard after sign in"

Als je nog steeds errors ziet:
- ❌ "Profile fetch error: 406" → RLS policies niet correct
- ❌ "Sign in error: 400" → Verkeerde credentials of email auth niet ingeschakeld

## Extra Controles

### Is Email Auth ingeschakeld?

1. Ga naar **Authentication** → **Providers** in Supabase
2. Controleer dat **Email** is ingeschakeld
3. Controleer dat **Confirm email** is uitgeschakeld (voor development)

### Bestaat de profiles table?

1. Ga naar **Table Editor** in Supabase
2. Zoek de `profiles` table
3. Controleer dat de table deze kolommen heeft:
   - `id` (uuid, primary key)
   - `email` (text)
   - `display_name` (text, nullable)
   - `credits` (int4, default 0)
   - `text_credits` (int4, default 0)
   - `voice_credits` (int4, default 0)
   - `video_credits` (int4, default 0)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)
   - `is_local_user` (bool, default false)

## Hulp Nodig?

Als het nog steeds niet werkt:

1. Check de browser console voor errors (F12)
2. Check de Supabase logs:
   - Ga naar **Logs** → **Postgres Logs**
   - Filter op "profiles"
3. Neem contact op met support met:
   - Screenshot van de browser console errors
   - Screenshot van de Supabase logs
   - De query die je probeerde uit te voeren

## Belangrijke Notities

⚠️ **Nooit de Service Key in de frontend gebruiken!**
- De `SUPABASE_SERVICE_KEY` mag ALLEEN in backend/API code gebruikt worden
- Frontend gebruikt altijd de `SUPABASE_ANON_KEY`

⚠️ **RLS Policies zijn essentieel voor beveiliging**
- Zonder RLS kan iedereen alle profielen lezen
- Met RLS kan elke user alleen zijn eigen profiel zien

✅ **Service Role bypasses RLS**
- API endpoints gebruiken de Service Key
- Deze kunnen alle data lezen/schrijven (voor credit deductions etc.)
