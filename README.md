# Task Manager Web Application

Educational Practice 2025-2026 Summer project.

## Project Track

Web Project: Task Manager

## Description

This is my Task Manager web application for the Educational Practice project. In this project, users can add, view, edit, delete, search, and filter tasks. I used React for the frontend and Node.js with Express for the backend. For the online version, I used MongoDB Atlas to store the tasks. For local development, the project can also use SQLite.

## Features

- Add a new task with title, description, priority, status, and due date
- View all tasks in a clean task list
- Edit existing task information
- Delete tasks
- Search tasks by title or description
- Filter tasks by status and priority
- Store task data in a backend database
- Use MongoDB Atlas when the project is deployed online
- Use SQLite for local development
- Basic backend validation and API test

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

## How To Run Locally

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

Then open the frontend link shown in the terminal. It is usually:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:5001/api
```

## Database

The backend can use two database options:

1. **MongoDB Atlas** for the online deployed version
2. **SQLite** for running the project locally

For the online version, I set this environment variable:

```text
MONGODB_URI=your_mongodb_atlas_connection_string
```

Database name:

```text
MONGODB_DB_NAME=task_manager
```

If `MONGODB_URI` is not added locally, the backend uses SQLite and creates this file:

```text
backend/data/task_manager.sqlite
```

The file `backend/data/tasks.json` is only used to add sample tasks when the database is empty. The SQLite database file is not pushed to GitHub because it is created automatically.

## Build For Demo

```bash
npm run build
npm start
```

After building, the backend serves the frontend from:

```text
http://localhost:5001
```

## Online Deployment With Render

I deployed this project on Render. The Node.js backend serves both the API and the built React frontend.

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

6. Click Deploy or Manual Deploy.

After deployment, Render gives an online link ending with:

```text
.onrender.com
```

Important: for the online project, `MONGODB_URI` must be added in Render. If it is missing, the project will not start in production because the online version should save data in MongoDB Atlas.

To check that Render is connected to MongoDB Atlas, I can open:

```text
https://your-render-service.onrender.com/api/health
```

The response should show:

```json
{
  "database": "MongoDB database \"task_manager\""
}
```

If I run the project locally without MongoDB, it can show SQLite. That is normal for local development.

## Testing

Run the backend API test:

```bash
npm test
```
