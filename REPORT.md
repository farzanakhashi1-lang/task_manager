# Task Manager Web Application Report

## 1. Title Page

**Project title:** Task Manager Web Application  
**Project track:** Web Project  
**Course:** Educational Practice 2025-2026 Summer  
**Team name:** Write your team name here  
**Team leader:** Write team leader name here  
**Team members:** Write all team members here  
**Submission date:** June 18, 2026

## 2. Team Members And Contributions

| Student Name | Contribution |
| --- | --- |
| Team Leader | Repository setup, full-stack integration, final submission |
| Student 2 | Frontend interface and styling |
| Student 3 | Backend API and data storage |
| Student 4 | Testing, report, screenshots, demo video |

## 3. Project Overview

The Task Manager is a web application that helps students organize project tasks. The application allows users to add tasks, view all tasks, edit task details, delete completed or unnecessary tasks, and search or filter the task list.

The project was created for the Web Project track and satisfies the required add, view, edit, delete, and search/filter features.

## 4. Problem Statement

Students often need to manage deadlines, reports, demo videos, and coding tasks during a team project. Without a simple tracking system, tasks can be forgotten or duplicated. This project solves that problem by giving the team one place to store and manage tasks.

## 5. Methodology / Tools And Technologies Used

The project uses a client-server architecture with database storage.

Frontend:

- HTML5 for page structure
- CSS3 for responsive styling
- React for reusable components and state management
- Vite for development and build tooling

Backend:

- Node.js runtime
- Express.js web framework
- SQLite database for task data
- REST API endpoints for CRUD operations

## 6. Main Features / Model Description

Main features:

- Add task
- View task list
- Edit task
- Delete task
- Search by title or description
- Filter by status
- Filter by priority
- Display task statistics

Task fields:

- Title
- Description
- Priority: Low, Medium, High
- Status: Todo, In Progress, Done
- Due date

## 7. Implementation Explanation

The backend is implemented in `backend/server.js`. It provides REST API endpoints under `/api/tasks`. The tasks are stored in a SQLite database created by `backend/database.js`. The file `backend/data/tasks.json` is used as seed data when the database is empty. The server validates task input before saving it.

The frontend is implemented in `frontend/src/main.jsx`. It uses React state to manage the form, current filters, edit mode, loading state, and messages. It sends requests to the backend API using `fetch`.

The CSS file `frontend/src/styles.css` creates a responsive layout. On desktop, the task form is shown beside the task list. On smaller screens, the form and list stack vertically.

## 8. Screenshots

Add screenshots after running the project:

1. Home page with task list
2. Add task form
3. Edit task mode
4. Search/filter result
5. Backend API or terminal running

## 9. Testing Or Evaluation Results

Manual testing:

| Test Case | Expected Result | Status |
| --- | --- | --- |
| Add a task | New task appears in the list | Passed |
| Edit a task | Updated information is saved | Passed |
| Delete a task | Task disappears from the list | Passed |
| Search task | Matching tasks are displayed | Passed |
| Filter by status | Only selected status is displayed | Passed |
| Filter by priority | Only selected priority is displayed | Passed |

Automated testing:

The command `npm test` runs a backend API test that creates, updates, searches, and deletes a task.

## 10. Difficulties And Solutions

One difficulty was choosing a data storage method that is simple for a student project. SQLite was selected because it is a real database but does not require a separate database server or online account during the demo.

Another difficulty was making the interface clear on both laptop and mobile screens. This was solved with responsive CSS grid layouts and readable form controls.

## 11. Conclusion

The Task Manager project successfully implements a full-stack web application using React and Node.js. It includes all required web project features: add, view, edit, delete, search, and filter. The project can help a student team organize tasks before final submission.

## 12. GitHub And Demo Video Links

GitHub repository link: Add your private GitHub repository link here  
Demo video link: Add your demo video link here
