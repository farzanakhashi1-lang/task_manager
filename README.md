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


