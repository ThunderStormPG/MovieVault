-- Create the watched_movies table
CREATE TABLE IF NOT EXISTS watched_movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE
);

-- Optional: Create an index on is_favorite for faster filtering
CREATE INDEX IF NOT EXISTS idx_watched_movies_favorite ON watched_movies(is_favorite);