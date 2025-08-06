-- Add updated_at column to idioms table
ALTER TABLE idioms ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to automatically update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_idioms_updated_at
    BEFORE UPDATE ON idioms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();