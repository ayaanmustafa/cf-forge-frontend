<<<<<<< HEAD
# cf-forge-frontend
=======
<<<<<<< HEAD
# cf-forge-frontend
=======
# CF Forge Frontend

A competitive programming problem tracker with real-time filtering, bucketing, and tagging.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API client

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── api/            # API client and endpoints
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend runs on `http://localhost:5173` and communicates with the backend at `http://localhost:8000`.

## Features

- **Solved Problems** - View and filter solved problems by rating, tags, and buckets
- **Search** - Search for new problems by rating and contest
- **Buckets** - Organize problems into custom buckets
- **Problem Detail** - View problem info, tags, buckets, and notes
- **Dark UI** - Minimal dark theme focused on problem-solving

## API Integration

All API calls are handled through `/src/api/` with separate modules for:
- `problems.js` - Problem CRUD operations
- `buckets.js` - Bucket management
- `client.js` - Axios configuration
>>>>>>> 12780d0 (deploy ready)
>>>>>>> d287308 (ini)
