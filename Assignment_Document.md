# Project Assignment Submission Report

## 1. Project Overview
The **AI-Powered Task Management Portal** is a comprehensive, production-ready full-stack application designed to streamline personal or team productivity. It allows users to register securely, manage tasks via a modern dashboard, and utilize an integrated Google Gemini AI assistant to automatically generate detailed descriptions, assign priorities, and estimate completion times based purely on a short task title.

## 2. Assumptions Made
- **Single-tenant Architecture:** The system currently assumes users manage their own private tasks. Role-based access control (Admin vs. User) is scaffolded but not strictly required for the core task CRUD loop.
- **AI Availability:** It is assumed the host environment will provide a valid `GEMINI_API_KEY`. A fallback mechanism handles potential AI timeouts gracefully.
- **Database Environment:** The backend assumes a standard MySQL 8.0+ dialect.

## 3. Architecture Explanation
The application employs a decoupled client-server architecture:
- **Frontend (React.js + Vite):** A Single Page Application (SPA) utilizing Context API for global state management. Routing is handled by React Router DOM. Axios is configured with interceptors to automatically append the JWT token to secure requests.
- **Backend (Spring Boot):** Follows a strict Layered Architecture (Controller → Service → Repository → Entity). 
  - *Data Access:* Spring Data JPA / Hibernate interacts with the MySQL database.
  - *Validation:* Standard Jakarta Bean Validation ensures data integrity at the DTO level.
  - *Security:* Spring Security intercepts incoming requests, passing them through a custom JWT Auth Filter to validate stateless sessions.

## 4. AI Workflow
When a user requests AI assistance, the workflow is as follows:
1. Client sends `POST /api/ai/generate` with the task title.
2. The `AiService` constructs a prompt instructing Gemini to return a strict JSON payload.
3. Spring's `RestTemplate` dispatches the request to Google's REST endpoint.
4. The response is intercepted, cleaned (stripping Markdown block formatting), parsed using Jackson `ObjectMapper`, mapped to an `AiTaskResponse` DTO, and returned to the client.

## 5. Database Design
The relational database consists of two core tables:
- **`users`**: Stores authentication and profile data (`id`, `name`, `email`, BCrypt `password`).
- **`tasks`**: Stores task metadata (`id`, `title`, `description`, `priority`, `status`, `due_date`, `estimated_time`).
A One-to-Many relationship connects `users` and `tasks` via a `user_id` Foreign Key constraint, ensuring data segregation.

## 6. Security Features
- **Stateless Authentication:** JSON Web Tokens (JWT) eliminate the need for server-side sessions, enhancing scalability.
- **Password Hashing:** Passwords are never stored in plaintext. They are hashed using the BCrypt algorithm.
- **Endpoint Protection:** All `/api/tasks/**` and `/api/ai/**` endpoints require a valid Bearer token.
- **CORS Configuration:** Global CORS configuration limits API access to authorized frontend origins.
- **Global Exception Handling:** Prevents stack traces from leaking to the client by standardizing error JSON structures via `@ControllerAdvice`.

## 7. Deployment Details
- **Docker Integration:** The project includes a `docker-compose.yml` file to spin up the MySQL database, Spring Boot backend, and React frontend simultaneously in isolated containers.
- **Backend Hosting:** Designed for PaaS platforms like Render or Heroku using the provided `Dockerfile`.
- **Frontend Hosting:** Configured for Vercel or Netlify with a custom `vercel.json` to handle client-side routing rewrites.

## 8. Future Enhancements
- **Collaborative Workspaces:** Allowing users to invite others and assign tasks.
- **Push Notifications & Reminders:** Integrating WebSockets or email services (SendGrid) for upcoming due dates.
- **Drag-and-Drop Kanban Board:** Visualizing task statuses in a Trello-like interface.
- **OAuth2 Login:** Allowing sign-ins via Google or GitHub.

## 9. Challenges Faced
- **AI Response Formatting:** Language models often inject markdown (e.g., ```json ... ```) into their responses. The backend required custom regex sanitization to reliably parse the AI string back into a strict Java Object.
- **Complex UI State Management:** Ensuring the UI reacts optimistically to state changes (like instantly updating a status without a hard page reload) required careful memoization and Context API structuring.

## 10. Conclusion
This project demonstrates proficiency across the entire software development lifecycle—from conceptualization, database schema design, and secure API creation, to modern UI/UX implementation and containerized deployment. The addition of the Google Gemini AI integration successfully elevates a standard CRUD application into an intelligent, user-centric product.
