import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function MovieForm({ onAddMovie }) {
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    rating: 5,
    notes: '',
    is_favorite: false
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const titleInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.genre.trim()) {
      return;
    }

    onAddMovie(formData);
    setFormData({
      title: '',
      genre: '',
      rating: 5,
      notes: '',
      is_favorite: false
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTitleChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, title: value }));

    if (value.trim().length >= 2) {
      setSuggestionsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/movies/search/${encodeURIComponent(value.trim())}`);
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchMovieDetails = async (title) => {
    if (!title || !title.trim()) return;

    setSuggestionsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/details`, {
        params: { title: title.trim() }
      });
      const details = response.data.details;
      setFormData(prev => ({
        ...prev,
        title: details.title || prev.title,
        genre: details.genre || prev.genre
      }));
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title
    }));
    setSuggestions([]);
    setShowSuggestions(false);
    await fetchMovieDetails(suggestion.title);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="movie-card mb-8">
      <h2 className="text-2xl font-bold mb-6 text-yellow-600 flex items-center">
        <span className="mr-2">🎥</span> Add New Movie
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Movie Title *</label>
            <div className="relative">
              <input
                ref={titleInputRef}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                placeholder="Start typing to search movies..."
                required
              />
              {suggestionsLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fetchMovieDetails(formData.title)}
              className="mt-3 text-sm font-semibold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border border-yellow-200 rounded-lg py-2 px-3 transition-all duration-200"
            >
              Auto-fill genre from OMDB
            </button>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="flex items-center p-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    {suggestion.poster && suggestion.poster !== 'N/A' ? (
                      <img
                        src={suggestion.poster}
                        alt={suggestion.title}
                        className="w-10 h-14 object-cover rounded mr-3 flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 rounded mr-3 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-gray-500">🎬</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{suggestion.title}</div>
                      <div className="text-sm text-gray-500">{suggestion.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Genre *</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Action, Drama, Comedy"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Rating: <span className="text-yellow-600 font-bold">{formData.rating}/10</span>
          </label>
          <input
            type="range"
            name="rating"
            min="1"
            max="10"
            value={formData.rating}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Optional notes about the movie..."
          />
        </div>

        <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <input
            type="checkbox"
            name="is_favorite"
            checked={formData.is_favorite}
            onChange={handleChange}
            className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
          />
          <label className="ml-3 text-sm font-medium text-gray-700">
            ⭐ Mark as Favorite
          </label>
        </div>

        <button type="submit" className="btn-primary w-full text-lg">
          ➕ Add Movie
        </button>
      </form>
    </div>
  );
}

export default MovieForm;