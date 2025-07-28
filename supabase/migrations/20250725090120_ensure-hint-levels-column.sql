-- Ensure hint_levels column exists in quizzes table
-- This migration ensures the hint_levels column is properly added if it doesn't exist

DO $$
BEGIN
    -- Check if hint_levels column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'quizzes'
        AND column_name = 'hint_levels'
    ) THEN
        -- Add hint_levels column if it doesn't exist
        ALTER TABLE quizzes ADD COLUMN hint_levels jsonb NULL;

        -- Add comment for documentation
        COMMENT ON COLUMN quizzes.hint_levels IS 'Progressive hints array for quiz questions (4 levels)';
    END IF;
END $$;