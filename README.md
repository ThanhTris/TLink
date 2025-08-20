# IT-Forum

## Description
IT-Forum is a full-stack web application for IT enthusiasts to share knowledge, ask questions, discuss topics, and connect with the tech community. The project includes a modern React frontend and a secure Spring Boot backend, supporting user authentication, post creation, commenting, tagging, and more.

## Features
- User registration and login (email/phone, password, OTP verification)
- Create, edit, delete, and save posts
- Comment and reply on posts (nested comments)
- Like/unlike posts and comments
- Tagging system (parent/child tags)
- Search and filter posts by category or tag
- User profile management (avatar, info, password change)
- File and image upload for posts
- Responsive UI, modern design
- Role-based access and security

## Prerequisites
- Node.js (>= 18.x)
- npm or yarn
- Java 17 or newer
- Maven 3.8+
- MySQL 8.x

## Setup & Run Instructions

### 1. Clone the repository
```bash
git clone https://github.com/ThanhTris/IT-Forum.git
cd IT-Forum
```

### 2. Database setup
- Create a MySQL database named `prj_forum`.
- Import all SQL files in the `database/` folder in order: `Table.sql`, `Trigger.sql`, `Procedure.sql`, and data files as needed.
- Update your MySQL credentials in `backend/src/main/resources/application.properties`.

### 3. Backend setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
# or run the packaged jar:
# java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### 4. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
# The app will be available at http://localhost:5173
```

## Configuration
- Backend configs: `backend/src/main/resources/application.properties` (DB, mail, JWT, etc.)
- Frontend configs: `frontend/.env` (API base URL, etc.)

## Usage
1. Register a new account or log in.
2. Create, view, and interact with posts and comments.
3. Use the sidebar to explore categories, tags, and resources.
4. Manage your profile and saved posts in the user section.

## Folder Structure (Main)
```
IT-Forum/
├── backend/         # Spring Boot backend (Java)
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/        # React frontend (TypeScript, Vite)
│   ├── src/
│   ├── package.json
│   └── ...
├── database/        # SQL schema, triggers, procedures, test data
└── README.md
```

## Project Status
- The project is under active development.
- Core features are implemented and stable.
- Contributions and feedback are welcome!