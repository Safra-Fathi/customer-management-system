CustomerFlow
Customer Relationship & Profile Management System
CustomerFlow is a full-stack web application for managing customer profiles and related business records in one place. It supports individual and business customers, employee access controls, and a history of customer-related activity.
Developed as a software engineering internship project for Neirah Tech.
Overview
Customer information is often spread across spreadsheets, messages, and separate files. CustomerFlow provides a centralized workspace where authorized employees can create, find, update, and review customer records.
The application focuses on customer profile management, not sales pipeline automation or help-desk ticketing.
Features
- Authentication: Employee sign-in using JWT-based authentication and Argon2 password hashing.
- Role-based access: Admin and Staff roles, with administrative user management restricted to Admin users.
- Customer profiles: Create, view, update, search, and archive individual or business customer records.
- Customer identifiers: Sequential customer numbers such as CUS-000001.
- Addresses: Maintain customer address information.
- Notes: Record information and follow-ups associated with customers.
- Documents: Associate documents with customer records.
- Activity history: Review recorded customer-related actions.
- User management: Admins can create employee accounts and manage account status.
Note: CustomerFlow does not offer public account registration. Employee accounts are created by an administrator.

Tech Stack
Layer	Technology
Frontend	React, TypeScript, Vite, Tailwind CSS
Backend	NestJS, TypeScript, Node.js
Database	PostgreSQL
ORM and migrations	Prisma
Authentication	JWT, Argon2
Source control	Git, GitHub


Architecture
React + TypeScript (Frontend)
           |
           | HTTP / JSON API
           v
NestJS (Backend)
  |-- Authentication and authorization
  |-- Customers, addresses, notes, documents
  |-- Activity history and user management
           |
           v
       Prisma ORM
           |
           v
       PostgreSQL
Project Structure
customer-management-system/
├── backend/             # NestJS API, Prisma schema and migrations
├── frontend/            # React + TypeScript application
├── package.json
└── README.md
Getting Started
Prerequisites
- Node.js and npm
- PostgreSQL
- Git
1. Clone the repository
git clone https://github.com/Safra-Fathi/customer-management-system.git
cd customer-management-system
2. Configure the backend
cd backend
npm install
Create a backend/.env file based on backend/.env.example. Configure the database connection and JWT secret according to the example file. Never commit .env or real credentials.
Example variable names (refer to the example file for the project's exact requirements):
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
Run the Prisma commands using the scripts and configuration provided in backend/package.json and backend/prisma7.config.ts. Apply existing migrations to your local database, generate the Prisma client, and create your initial administrator using the project's seed procedure where applicable.
Start the backend:
npm run start:dev
The backend is configured locally to run on port 3000 unless changed in its configuration.
3. Configure the frontend
Open a second terminal:
cd frontend
npm install
Create frontend/.env from frontend/.env.example, and set the backend API URL as required by the frontend configuration.
Start the frontend:
npm run dev
Vite typically serves the application at http://localhost:5173.
4. Sign in
Use an administrator account created during local setup. Administrators can create Staff accounts through the application's User Management screen.
For security, this README does not publish demo credentials.
Available Roles
Capability	Admin	Staff
Sign in	Yes	Yes
Manage customer records	Yes	Yes
Work with customer notes and addresses	Yes	Yes
Access customer activity history	Yes	Yes
Create and manage employee accounts	Yes	No


Role enforcement should be verified at both the API and UI levels before production use.
Production Deployment
Status: Deployment in progress.
The intended hosting arrangement is:
- Frontend: Vercel or another static frontend host
- Backend: A Node.js-compatible hosting service
- Database: Hosted PostgreSQL
Before making the application publicly accessible:
1. Configure production environment variables and a strong JWT secret.
2. Run Prisma migrations against the production database.
3. Provision the first Admin account securely.
4. Restrict CORS to the deployed frontend origin.
5. Confirm authorization for Admin-only endpoints.
6. Use persistent storage for uploaded customer documents; do not rely on ephemeral container filesystems.
7. Verify sign-in, customer operations, document handling, and role restrictions.
Deployment URLs will be added once the application is live.
Security Considerations
- Passwords are stored as Argon2 hashes rather than plaintext.
- Protected API routes use JWT authentication.
- Administrative actions require role-based authorization.
- Environment secrets must remain outside version control.
- Production deployment requires HTTPS, appropriate database access controls, and persistent document storage.
Project Scope
CustomerFlow is designed around customer relationship and profile management. Sales forecasting, email marketing automation, customer support ticketing, and task scheduling are potential future enhancements rather than current features.