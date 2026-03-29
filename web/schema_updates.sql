-- schema_updates.sql
-- Run these commands in your Supabase SQL Editor to support the new features.

-- 1. Ensure the `is_anonymous` column exists in the `rti_requests` table.      
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rti_requests' AND column_name = 'is_anonymous') THEN
        ALTER TABLE rti_requests ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Ensure the `is_anonymous` column exists in the `citizen_reports` table.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'citizen_reports' AND column_name = 'is_anonymous') THEN
        ALTER TABLE citizen_reports ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Update existing reports to 'Verified' to match the new auto-verify rule (Optional but recommended for maintaining consistency with older data).
UPDATE citizen_reports 
SET status = 'Verified' 
WHERE status = 'Pending AI' OR status = 'Pending';

-- 4. Allow anonymous submissions by dropping the NOT NULL constraint on user_id columns
ALTER TABLE rti_requests ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE citizen_reports ALTER COLUMN user_id DROP NOT NULL;
