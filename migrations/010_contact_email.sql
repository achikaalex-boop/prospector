-- 010_contact_email.sql
-- Add contact_email setting to app_settings table

INSERT INTO app_settings (key, value)
SELECT 'contact_email', 'prospector.ai@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key = 'contact_email');
