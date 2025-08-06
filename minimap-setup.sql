-- Create minimaps table
CREATE TABLE IF NOT EXISTS minimaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Floorplan',
    background_image_url TEXT,
    markers JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{"width": 800, "height": 600, "scale": 1, "show_labels": true, "show_connections": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_minimaps_created_at ON minimaps(created_at);

-- Create updated_at trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_minimaps_updated_at') THEN
        CREATE TRIGGER update_minimaps_updated_at
            BEFORE UPDATE ON minimaps
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE minimaps ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Enable read access for all users" ON minimaps;
CREATE POLICY "Enable read access for all users" ON minimaps
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON minimaps;
CREATE POLICY "Enable insert for authenticated users only" ON minimaps
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON minimaps;
CREATE POLICY "Enable update for authenticated users only" ON minimaps
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON minimaps;
CREATE POLICY "Enable delete for authenticated users only" ON minimaps
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create storage bucket for minimap images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('minimaps', 'minimaps', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'minimaps');

DROP POLICY IF EXISTS "Authenticated users can upload minimap images" ON storage.objects;
CREATE POLICY "Authenticated users can upload minimap images" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'minimaps' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update minimap images" ON storage.objects;
CREATE POLICY "Authenticated users can update minimap images" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'minimaps' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete minimap images" ON storage.objects;
CREATE POLICY "Authenticated users can delete minimap images" ON storage.objects 
    FOR DELETE USING (bucket_id = 'minimaps' AND auth.role() = 'authenticated'); 