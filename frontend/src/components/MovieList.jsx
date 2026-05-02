import { useMemo } from 'react';
import MovieCard from './MovieCard';

function MovieList({ movies, posters, loading, onToggleFavorite, onDeleteMovie }) {
  // Memoize filtered movies to prevent unnecessary re-renders
  const filteredMovies = useMemo(() => {
    return movies;
  }, [movies]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto"></div>
        <p className="mt-6 text-gray-600 text-lg font-medium">Loading your movies...</p>
      </div>
    );
  }

  if (filteredMovies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <p className="text-gray-500 text-xl font-medium">No movies found yet.</p>
        <p className="text-gray-400 mt-2">Add your first movie above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-yellow-600 flex items-center">
        <span className="mr-2">🎭</span>
        Your Movies ({filteredMovies.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="fade-in-up"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <MovieCard
              movie={movie}
              poster={posters[movie.id]}
              onToggleFavorite={onToggleFavorite}
              onDeleteMovie={onDeleteMovie}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieList;