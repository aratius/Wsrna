-- Add language_pair_id column to quizzes table
ALTER TABLE quizzes ADD COLUMN language_pair_id uuid NULL;

-- Add foreign key constraint to language_pairs table
ALTER TABLE quizzes ADD CONSTRAINT fk_quizzes_language_pair
FOREIGN KEY (language_pair_id) REFERENCES language_pairs(id);

-- Add index for better performance
CREATE INDEX idx_quizzes_language_pair_id ON quizzes(language_pair_id);