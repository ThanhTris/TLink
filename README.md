

# TLink-Forum

## Introduction
TLink-Forum is a web platform for the IT community to share knowledge, ask questions, discuss, and connect. The project includes a modern React frontend and a secure Spring Boot backend, supporting authentication, posting, commenting, tagging, searching, recommendations, profile management, authorization, file upload, and more.


## Main Features
- Register & log in (email/phone, password, OTP, Google OAuth)
- Create, edit, delete, save, and view posts
- Comments with threaded replies, edit/delete, hide/unhide, and @mentions
- Like/unlike for posts and comments
- Parent/child tags, categories, and sidebar recommendations
- Search and filter by keyword, tag, or category
- Personalized post recommendations
- AI chatbot assistant to fetch, create, edit, and delete posts (guided steps)
- Profile management (avatar, info, password change)
- Upload images and files with posts
- Modern Glassmorphism UI
- Manage saved, liked, and authored posts
- Basic statistics for posts, comments, and likes
- Validation, error handling, and real-time toast notifications

## Demo Video (Japanese language)
- [Watch the main feature demo video on Google Drive](https://drive.google.com/file/d/1NdzDSpSY2IgWnX_MehKWYIltPGDIFSMd/view?usp=sharing)

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
- Import all SQL files in the `database/` folder in order: `Table.sql`, `Trigger.sql`, `Procedure.sql`, and sample data if needed.
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
- Backend: `backend/src/main/resources/application.properties` (DB, mail, JWT, ...)
- Frontend: `frontend/.env` (API base URL, ...)

## Usage
1. Register a new account or log in (via email/phone or Google)
2. Create, edit, delete, save, search, and interact with posts and comments
3. Use the sidebar to explore categories, tags, and resources
4. Manage your profile, saved/liked posts, and change password
5. Upload images/files when creating or editing posts
6. Enjoy a modern, optimized UI for both desktop & mobile



## Main Folder Structure
```
IT-Forum/
├── backend/    # Spring Boot backend (Java)
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/   # React frontend (TypeScript, Vite)
│   ├── src/
│   ├── package.json
│   └── ...
├── database/   # SQL schema, triggers, procedures, sample data
└── README.md
```

## Project Status
- The project is under active development.
- Core features are implemented and stable.
- Contributions and feedback are welcome!