-- Add idiom_id column to quizzes table
ALTER TABLE quizzes ADD COLUMN idiom_id uuid NULL;

-- Add foreign key constraint to idioms table
ALTER TABLE quizzes ADD CONSTRAINT fk_quizzes_idiom
FOREIGN KEY (idiom_id) REFERENCES idioms(id);

-- Add index for better performance
CREATE INDEX idx_quizzes_idiom_id ON quizzes(idiom_id);