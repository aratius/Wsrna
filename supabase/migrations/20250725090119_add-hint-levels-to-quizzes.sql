-- Add hint_levels column to quizzes table
ALTER TABLE quizzes ADD COLUMN hint_levels jsonb NULL;