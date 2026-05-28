ALTER TABLE profiles
    ADD COLUMN optional_remote_translation BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN optional_geocoding BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN optional_ai_matching BOOLEAN NOT NULL DEFAULT FALSE;
