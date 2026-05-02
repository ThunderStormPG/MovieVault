const express = require('express');
const router = express.Router();
const pool = require('../db');
const axios = require('axios');

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Helper function to fetch movie data from OMDB
async function fetchMovieFromOMDB(title) {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
    if (response.data.Response === 'True') {
      return {
        title: response.data.Title,
        year: response.data.Year,
        genre: response.data.Genre,
        director: response.data.Director,
        plot: response.data.Plot,
        poster: response.data.Poster,
        imdbRating: response.data.imdbRating,
        runtime: response.data.Runtime
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching movie "${title}" from OMDB:`, error.message);
    return null;
  }
}

// Helper function to search OMDB for movie title suggestions
async function searchMovieTitles(query, limit = 5) {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
    if (response.data.Response === 'True' && response.data.Search) {
      return response.data.Search.slice(0, limit).map(movie => ({
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster,
        imdbID: movie.imdbID
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error searching movies with query "${query}":`, error.message);
    return [];
  }
}

// Helper function to get poster for a specific movie
async function getMoviePoster(title) {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
    if (response.data.Response === 'True') {
      return {
        poster: response.data.Poster,
        title: response.data.Title,
        year: response.data.Year
      };
    }
    return { poster: null, title, year: null };
  } catch (error) {
    console.error(`Error fetching poster for "${title}":`, error.message);
    return { poster: null, title, year: null };
  }
}

// Helper function to search movies by genre on OMDB
async function searchMoviesByGenre(genre, limit = 5) {
  try {
    // OMDB doesn't have direct genre search, so we'll use some popular movies from that genre
    const popularMoviesByGenre = {
      'Action': ['Mad Max: Fury Road', 'John Wick', 'The Dark Knight', 'Avengers: Endgame', 'Inception'],
      'Comedy': ['The Grand Budapest Hotel', 'Parasite', 'Everything Everywhere All at Once', 'The Holdovers', 'Barbie'],
      'Drama': ['Oppenheimer', 'Poor Things', 'Killers of the Flower Moon', 'The Zone of Interest', 'Nyad'],
      'Thriller': ['Oppenheimer', 'Poor Things', 'Talk to Me', 'No One Will Save You', 'The Holdovers'],
      'Horror': ['Talk to Me', 'No One Will Save You', 'The Substance', 'Late Night with the Devil', 'Stopmotion'],
      'Sci-Fi': ['Dune: Part Two', 'Everything Everywhere All at Once', 'Poor Things', 'The Substance', 'Challengers'],
      'Romance': ['Poor Things', 'Nyad', 'Challengers', 'Love Lies Bleeding', 'Dune: Part Two'],
      'Adventure': ['Dune: Part Two', 'Everything Everywhere All at Once', 'Challengers', 'Love Lies Bleeding', 'Ghostlight']
    };

    const movies = popularMoviesByGenre[genre] || popularMoviesByGenre['Action'];
    const results = [];

    for (const movieTitle of movies.slice(0, limit)) {
      const movieData = await fetchMovieFromOMDB(movieTitle);
      if (movieData) {
        results.push(movieData);
      }
      if (results.length >= limit) break;
    }

    return results;
  } catch (error) {
    console.error('Error searching movies by genre:', error);
    return [];
  }
}

// GET /api/movies - Get all movies, optional favorites filter
router.get('/', async (req, res) => {
  try {
    const { favorites } = req.query;
    let query = 'SELECT * FROM watched_movies';
    let params = [];

    if (favorites === 'true') {
      query += ' WHERE is_favorite = $1';
      params = [true];
    }

    query += ' ORDER BY id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// POST /api/movies - Create a new movie
router.post('/', async (req, res) => {
  try {
    const { title, genre, rating, notes, is_favorite } = req.body;

    if (!title || !genre || rating === undefined) {
      return res.status(400).json({ error: 'Title, genre, and rating are required' });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Rating must be between 1 and 10' });
    }

    const result = await pool.query(
      'INSERT INTO watched_movies (title, genre, rating, notes, is_favorite) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, genre, rating, notes || '', is_favorite || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

// PATCH /api/movies/:id/favorite - Toggle favorite status
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_favorite } = req.body;

    if (typeof is_favorite !== 'boolean') {
      return res.status(400).json({ error: 'is_favorite must be a boolean' });
    }

    const result = await pool.query(
      'UPDATE watched_movies SET is_favorite = $1 WHERE id = $2 RETURNING *',
      [is_favorite, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating favorite status:', error);
    res.status(500).json({ error: 'Failed to update favorite status' });
  }
});

// DELETE /api/movies/:id - Delete a movie
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM watched_movies WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// Helper function to create recommendation reasoning text
function buildRecommendationReason(movie, topGenres) {
  const primaryGenre = movie.genre ? movie.genre.split(',')[0].trim() : null;
  if (primaryGenre && topGenres.includes(primaryGenre)) {
    return `This recommendation is a strong match because you rate ${primaryGenre} movies highly and often choose similar films.`;
  }
  if (primaryGenre) {
    return `Look for this movie if you want a ${primaryGenre}-style experience that is close to your favorites.`;
  }
  return 'This movie was selected based on your recent watch history and ratings.';
}

// GET /api/movies/recommendations - Get movie recommendations based on user's taste
router.get('/recommendations', async (req, res) => {
  try {
    // Get all movies for analysis
    const moviesResult = await pool.query('SELECT title, genre, rating, is_favorite FROM watched_movies ORDER BY rating DESC, is_favorite DESC');
    const movies = moviesResult.rows;

    if (movies.length === 0) {
      return res.json({ recommendations: [] });
    }

    if (!OMDB_API_KEY) {
      return res.status(500).json({ error: 'OMDB API key is not configured' });
    }

    // Analyze user's preferences
    const genreCount = {};
    const highRatedGenres = {};

    movies.forEach(movie => {
      const genres = movie.genre.split(', ').map(g => g.trim());
      const weight = movie.is_favorite ? 3 : (movie.rating >= 7 ? 2 : 1);

      genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + weight;
        if (movie.rating >= 7 || movie.is_favorite) {
          highRatedGenres[genre] = (highRatedGenres[genre] || 0) + weight;
        }
      });
    });

    // Get top 2 favorite genres
    const topGenres = Object.entries(highRatedGenres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([genre]) => genre);

    // If no high-rated genres, use most watched genres
    const fallbackGenres = topGenres.length > 0 ? topGenres : 
      Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([genre]) => genre);

    // Get recommendations from top genres
    const recommendations = [];
    const usedTitles = new Set(movies.map(m => m.title.toLowerCase()));

    for (const genre of fallbackGenres) {
      const genreMovies = await searchMoviesByGenre(genre, 3);
      for (const movie of genreMovies) {
        if (!usedTitles.has(movie.title.toLowerCase())) {
          recommendations.push({
            ...movie,
            reason: buildRecommendationReason(movie, topGenres)
          });
          if (recommendations.length >= 5) break;
        }
      }
      if (recommendations.length >= 5) break;
    }

    // If we don't have enough recommendations, add some popular movies
    if (recommendations.length < 5) {
      const popularMovies = ['Dune: Part Two', 'Everything Everywhere All at Once', 'Oppenheimer', 'Poor Things', 'The Holdovers'];
      for (const title of popularMovies) {
        if (recommendations.length >= 5) break;
        if (!usedTitles.has(title.toLowerCase())) {
          const movieData = await fetchMovieFromOMDB(title);
          if (movieData) {
            recommendations.push({
              ...movieData,
              reason: `This popular movie is recommended because it shares strong storytelling and pacing with your favorites.`
            });
          }
        }
      }
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// GET /api/movies/search/:query - Search for movie title suggestions
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    if (!OMDB_API_KEY) {
      return res.status(500).json({ error: 'OMDB API key is not configured' });
    }

    const suggestions = await searchMovieTitles(query.trim(), limit);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// GET /api/movies/details?title=... - Fetch movie details and genre from OMDB
router.get('/details', async (req, res) => {
  try {
    const title = req.query.title;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!OMDB_API_KEY) {
      return res.status(500).json({ error: 'OMDB API key is not configured' });
    }

    const details = await fetchMovieFromOMDB(title.trim());
    if (!details) {
      return res.status(404).json({ error: 'Movie details not found' });
    }

    res.json({ details });
  } catch (error) {
    console.error('Error fetching details:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// GET /api/movies/posters - Get posters for existing movies
router.get('/posters', async (req, res) => {
  try {
    // Get all movies from database
    const moviesResult = await pool.query('SELECT id, title FROM watched_movies ORDER BY id DESC');
    const movies = moviesResult.rows;

    if (!OMDB_API_KEY) {
      return res.status(500).json({ error: 'OMDB API key is not configured' });
    }

    // Fetch posters for each movie
    const posters = [];
    for (const movie of movies) {
      const posterData = await fetchMovieFromOMDB(movie.title);
      posters.push({
        id: movie.id,
        title: movie.title,
        poster: posterData?.poster || null,
        year: posterData?.year || null,
        genre: posterData?.genre || null,
        runtime: posterData?.runtime || null,
        plot: posterData?.plot || null,
        director: posterData?.director || null
      });

      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({ posters });
  } catch (error) {
    console.error('Error fetching posters:', error);
    res.status(500).json({ error: 'Failed to fetch posters' });
  }
});

module.exports = router;