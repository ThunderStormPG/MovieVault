# Movie Tracker with OMDB Recommendations

A full-stack web application for tracking watched movies with an integrated recommendation engine powered by OMDB API.

## Features

- **Movie Tracking**: Add, view, and manage your watched movies
- **Favorites System**: Mark movies as favorites and filter by them
- **Dual Views**: Switch between "All Watched" and "Favorites" views
- **Smart Recommendations**: Get personalized movie suggestions based on your taste using OMDB data
- **Movie Posters**: Automatic poster fetching and display for all movies using OMDB API
- **Autocomplete Search**: Intelligent movie title suggestions while typing for accurate movie entry
- **Responsive Design**: Beautiful yellow-themed interface with smooth animations
- **Modern UI**: Clean, minimalistic design with hover effects and transitions
- **RESTful API**: Clean backend API with proper error handling

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- pg (node-postgres) for database connectivity
- OMDB API for movie data and recommendations
- CORS, dotenv, axios for utilities

### Frontend
- React.js with Vite
- Functional Components with Hooks
- Tailwind CSS for styling with custom animations
- Yellow-themed responsive design
- Axios for HTTP requests

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database named `movie_tracker`
2. Run the schema file:
   ```bash
   psql -d movie_tracker -f database/schema.sql
   ```

### 3. Environment Configuration

1. Copy the `.env` file in the backend directory
2. Update the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OMDB_API_KEY`: Your OMDB API key (get from http://www.omdbapi.com/)

### 4. Start the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in a new terminal)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

- `GET /api/movies` - Get all movies (optional `?favorites=true` filter)
- `POST /api/movies` - Create a new movie
- `PATCH /api/movies/:id/favorite` - Toggle favorite status
- `DELETE /api/movies/:id` - Delete a movie
- `GET /api/movies/recommendations` - Get AI-powered recommendations
- `GET /api/movies/search/:query` - Search for movie title suggestions (autocomplete)
- `GET /api/movies/posters` - Get posters for all existing movies

## API Endpoints

- `GET /api/movies` - Get all movies (optional `?favorites=true` filter)
- `POST /api/movies` - Create a new movie
- `PATCH /api/movies/:id/favorite` - Toggle favorite status
- `DELETE /api/movies/:id` - Delete a movie
- `GET /api/movies/recommendations` - Get AI recommendations

## Project Structure

```
movie-tracker/
├── backend/
│   ├── routes/
│   │   └── movies.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieForm.jsx
│   │   │   ├── MovieList.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── Recommendations.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── database/
    └── schema.sql
```

## Usage

1. Add movies using the form with title, genre, rating, and optional notes
2. Mark movies as favorites using the star button
3. Switch between "All Watched" and "Favorites" views
4. Click "Generate Suggestions" to get AI-powered recommendations based on your history

## AI Recommendation Logic

The AI recommendation engine:
1. Collects your movie history with ratings and favorite status
2. Weights favorites more heavily in the analysis
3. Constructs a detailed prompt for the AI model
4. Uses Groq's Llama model to generate 5 personalized recommendations
5. Returns structured JSON with title, genre, and reasoning for each suggestion