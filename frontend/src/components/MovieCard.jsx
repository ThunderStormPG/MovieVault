import React, { useState } from 'react';

function MovieCard({ movie, poster, onToggleFavorite, onDeleteMovie }) {
  const [showSummary, setShowSummary] = useState(false);
  const handleFavoriteToggle = () => {
    // Optimistic update: toggle favorite status immediately for better UX
    onToggleFavorite(movie.id, movie.is_favorite);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${movie.title}"?`)) {
      onDeleteMovie(movie.id);
    }
  };

  return (
    <div className="movie-card h-full flex flex-col">
      {/* Movie Poster */}
      {poster && poster.poster && poster.poster !== 'N/A' ? (
        <div className="mb-4">
          <img
            src={poster.poster}
            alt={`${movie.title} poster`}
            className="w-full h-48 object-cover rounded-lg shadow-sm"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="mb-4 w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🎬</div>
            <div className="text-xs text-gray-500">No poster available</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 leading-tight pr-2">{movie.title}</h3>
        <button
          onClick={handleFavoriteToggle}
          className={`text-2xl transition-all duration-200 hover:scale-110 ${
            movie.is_favorite
              ? 'text-yellow-500 drop-shadow-sm'
              : 'text-gray-300 hover:text-yellow-400'
          }`}
          title={movie.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {movie.is_favorite ? '⭐' : '☆'}
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-3 font-medium">{movie.genre}</p>

      <div className="flex items-center mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < Math.floor(movie.rating / 2)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {movie.rating}/10
        </span>
      </div>

      {movie.notes && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
          {movie.notes}
        </p>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3 mt-auto pt-4 border-t border-gray-100">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          movie.is_favorite
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}>
          {movie.is_favorite ? '❤️ Favorite' : '👀 Watched'}
        </span>

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSummary(prev => !prev)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          >
            {showSummary ? 'Hide Summary' : 'Show Summary'}
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger text-sm px-4 py-2 hover:bg-red-600 transition-all duration-200"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {showSummary && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-gray-700">
          <h4 className="font-semibold text-gray-800 mb-2">Short Summary</h4>
          <p className="leading-relaxed">
            {poster?.plot || movie.notes || 'A short summary is not available for this movie.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default MovieCard;