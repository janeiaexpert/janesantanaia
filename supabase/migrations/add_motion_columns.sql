-- Adicionar colunas motion_type e background_type na tabela site_settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS motion_type TEXT DEFAULT 'scale';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'gradient';
