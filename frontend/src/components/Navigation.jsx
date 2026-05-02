import React from 'react';

function Navigation({ currentView, onViewChange }) {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200">
        <button
          onClick={() => onViewChange('all')}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            currentView === 'all'
              ? 'bg-yellow-500 text-gray-900 shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          📚 All Watched
        </button>
        <button
          onClick={() => onViewChange('favorites')}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            currentView === 'favorites'
              ? 'bg-yellow-500 text-gray-900 shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          ⭐ Favorites
        </button>
      </div>
    </div>
  );
}

export default Navigation;