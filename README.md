# Task Manager Web Application

Educational Practice 2025-2026 Summer project.

## Project Track

Web Project: Task Manager

## Description

This project is a simple task manager web application. Users can add, view, edit, delete, search, and filter tasks. The frontend is built with HTML5, CSS3, and React. The backend is built with Node.js and Express. Online task data is stored in MongoDB Atlas, with SQLite used as a local fallback when no MongoDB connection string is provided.

## Main Features

- Add a new task with title, description, priority, status, and due date
- View all tasks in a clean task list
- Edit existing task information
- Delete tasks
- Search tasks by title or description
- Filter tasks by status and priority
- Store tasks in a real database on the backend
- Use MongoDB Atlas for online deployment
- Use SQLite automatically for local development
- Basic API validation and automated API test

## Technologies Used

- HTML5
- CSS3
- React
- Vite
- Node.js
- Express.js
- MongoDB Atlas
- SQLite local fallback

## Project Structure

```text
backend/
  database.js
  data/tasks.json
  server.js
  tests/api.test.js
frontend/
  src/main.jsx
  src/styles.css
  index.html
README.md
REPORT.md
CONTRIBUTIONS.md
```

## How To Run

Install dependencies:

```bash
npm run install:all
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open the frontend URL shown by Vite, usually:

```text
http://localhost:5173
```

Backend API runs at:

```text
http://localhost:5001/api
```

## Database

The backend supports two database modes:

1. **MongoDB Atlas** for online deployment
2. **SQLite** for local development fallback

For online deployment, set this environment variable:

```text
MONGODB_URI=your_mongodb_atlas_connection_string
```

Optional database name:

```text
MONGODB_DB_NAME=task_manager
```

If `MONGODB_URI` is not set, the backend uses SQLite and automatically creates this local file:

```text
backend/data/task_manager.sqlite
```

The file `backend/data/tasks.json` is used only as seed data when the selected database is empty. The SQLite database file is ignored by Git because it is generated automatically.

## Build For Final Demo

```bash
npm run build
npm start
```

After building, the backend can serve the production frontend from:

```text
http://localhost:5001
```

## Deploy Online With Render

The simplest online deployment is Render because the Node backend serves both the API and the built React frontend.

1. Push this project to GitHub.
2. Open Render and create a new Web Service.
3. Connect your GitHub repository.
4. Use these settings:

```text
Build Command: npm run install:all && npm run build
Start Command: npm start
```

5. Add environment variables:

```text
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB_NAME=task_manager
```

6. Click Deploy.

After deployment, Render gives you an online link ending with:

```text
.onrender.com
```

Important: for online deployment, use MongoDB Atlas by setting `MONGODB_URI`. If this value is missing online, the project falls back to SQLite, but online hosting may reset local SQLite files after redeploys or restarts.

## Testing

Run the backend API test:

```bash
npm test
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Check server status |
| GET | `/api/tasks` | Get tasks with optional search/filter |
| POST | `/api/tasks` | Add a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Final Submission Checklist

- Private GitHub repository link
- Add instructor as collaborator: `@bakhtiyar-k`
- Report PDF
- Demo video link, 3-5 minutes
- Contribution table
