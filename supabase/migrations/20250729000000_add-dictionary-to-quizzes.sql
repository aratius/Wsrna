-- Add dictionary column to quizzes table
ALTER TABLE quizzes ADD COLUMN dictionary jsonb NULL;

-- Add comment for documentation
COMMENT ON COLUMN quizzes.dictionary IS 'Dictionary object with word meanings for each word in the question sentence';

-- Add index for better performance on dictionary queries
CREATE INDEX idx_quizzes_dictionary ON quizzes USING GIN (dictionary);