import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/recommendations`);
      setRecommendations(response.data.recommendations);
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movie-card sticky top-6">
      <h2 className="text-2xl font-bold mb-6 text-yellow-600 flex items-center">
        <span className="mr-2">🎯</span> Movie Recommendations
      </h2>

      <button
        onClick={generateRecommendations}
        disabled={loading}
        className="btn-primary w-full mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3"></div>
            Finding Movies...
          </div>
        ) : (
          '🎬 Get Recommendations'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <span className="mr-2">✨</span>
            Recommended for You
          </h3>
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100 hover:shadow-md transition-all duration-300 fade-in-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex gap-4">
                {rec.poster && rec.poster !== 'N/A' ? (
                  <img
                    src={rec.poster}
                    alt={`${rec.title} poster`}
                    className="w-20 h-28 object-cover rounded-lg flex-shrink-0 shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-20 h-28 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-gray-500">🎬</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{rec.title}</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    {rec.year} • {rec.genre} • {rec.runtime}
                  </p>
                  {rec.imdbRating && rec.imdbRating !== 'N/A' && (
                    <p className="text-yellow-600 text-sm font-semibold mb-2">
                      ⭐ IMDb: {rec.imdbRating}/10
                    </p>
                  )}
                  {rec.director && rec.director !== 'Unknown' && (
                    <p className="text-gray-600 text-sm mb-2">
                      🎬 {rec.director}
                    </p>
                  )}
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2 leading-relaxed">{rec.plot}</p>
                  <p className="text-yellow-700 text-sm font-medium italic bg-yellow-100 px-3 py-1 rounded-lg">
                    💡 {rec.reason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎭</div>
          <p className="text-gray-500 font-medium">
            Discover your next favorite movie!
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Get personalized recommendations based on your watching history.
          </p>
        </div>
      )}
    </div>
  );
}

export default Recommendations;