import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieList from './components/MovieList';
import MovieForm from './components/MovieForm';
import Recommendations from './components/Recommendations';
import Navigation from './components/Navigation';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [movies, setMovies] = useState([]);
  const [posters, setPosters] = useState({});
  const [currentView, setCurrentView] = useState('all'); // 'all' or 'favorites'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch movie posters
  const fetchPosters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/posters`);
      const postersMap = {};
      response.data.posters.forEach(poster => {
        postersMap[poster.id] = poster;
      });
      setPosters(postersMap);
    } catch (err) {
      console.error('Error fetching posters:', err);
      // Don't set error state for posters, as it's not critical
    }
  };

  // Fetch movies based on current view
  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = currentView === 'favorites' ? { favorites: 'true' } : {};
      const response = await axios.get(`${API_BASE_URL}/movies`, { params });
      setMovies(response.data);
    } catch (err) {
      setError('Failed to fetch movies');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchPosters();
  }, [currentView]);

  // Add new movie
  const addMovie = async (movieData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/movies`, movieData);
      setMovies(prev => [response.data, ...prev]);
      // Refresh posters to include the new movie
      setTimeout(fetchPosters, 1000); // Small delay to ensure movie is saved
    } catch (err) {
      setError('Failed to add movie');
      console.error('Error adding movie:', err);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (id, currentFavorite) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/movies/${id}/favorite`, {
        is_favorite: !currentFavorite
      });
      
      // Update local state for immediate UI feedback
      setMovies(prev => prev.map(movie => 
        movie.id === id ? response.data : movie
      ));
    } catch (err) {
      setError('Failed to update favorite status');
      console.error('Error toggling favorite:', err);
    }
  };

  // Delete movie
  const deleteMovie = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/movies/${id}`);
      setMovies(prev => prev.filter(movie => movie.id !== id));
    } catch (err) {
      setError('Failed to delete movie');
      console.error('Error deleting movie:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-yellow-600 fade-in-up">
          🎬 Movie Tracker
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 fade-in-up shadow-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right ml-4 text-red-600 hover:text-red-800 font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        <div className="slide-in-left">
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="fade-in-up">
              <MovieForm onAddMovie={addMovie} />
            </div>
            <div className="fade-in-up" style={{animationDelay: '0.2s'}}>
              <MovieList
                movies={movies}
                posters={posters}
                loading={loading}
                onToggleFavorite={toggleFavorite}
                onDeleteMovie={deleteMovie}
              />
            </div>
          </div>
          <div className="fade-in-up" style={{animationDelay: '0.4s'}}>
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;