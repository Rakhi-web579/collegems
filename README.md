# College Management System (Full Stack)

A feature-rich **College Management System** built using **React.js** and **Express.js**.  
This project is designed for **academic use**, **real-world learning**, and **full-stack skill enhancement**.

---

## Tech Stack

### Frontend
- React
- Tailwind CSS
- RxJS
- Chart.js

### Backend
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Swagger API Docs

---

## Local Setup

1. Create a server `.env` file from `collegems-server/.env.example` and set your MongoDB connection string, JWT secret, and port.
2. Create a client `.env` file in `collegems-client/` with:
   - `VITE_BACKEND_URL=http://localhost:5000/api`
3. Install dependencies and run each app:
   - `cd collegems-server && npm install`
   - `cd collegems-client && npm install`
   - `cd collegems-server && npm start`
   - `cd collegems-client && npm run dev`

---

## Core Features

### Authentication & Security
- JWT-based Authentication
- Role-based Access Control
- Email Verification
- Password Reset

### Student Module
- Profile Management  
- Course Enrollment  
- Attendance View  
- Assignment Submission  
- Exam Results  
- Fee Status  
- Leave Requests  
- Notifications  

### Teacher Module
- Course & Subject Management  
- Attendance Marking  
- Assignment Creation & Evaluation  
- Exam / Test Management  
- Student Performance Tracking  

### Admin / HOD Module
- User Management  
- Role & Permission Control  
- Department & Course Management  
- Approval Workflows  
- Academic Calendar  
- Audit Logs  

### Fees & Accounts
- Fee Structure Management  
- Installments & Late Fines  
- Payment Status Tracking  
- Fee Receipt Generation (PDF)

### Dashboards & Reports
- Role-based Dashboards  
- Attendance & Performance Analytics  
- Fee Collection Reports  
- Export Reports (PDF / Excel)

### Real-Time Features
- Live Announcements  
- Real-time Notifications  

### AI / Smart Features
- Attendance Prediction  
- Student Performance Prediction  
- At-risk Student Detection  
- Smart Notice Targeting  

---
## Application workflow
``` mermaid
flowchart LR
    User[Student / Teacher / Admin] --> Frontend[React Frontend]

    Frontend --> Auth[Authentication Service]
    Auth --> API[Express API Server]

    API --> DB[(MongoDB Database)]
    API --> AI[AI Prediction Engine]
    API --> Notify[Notification Service]

    AI --> DB
    Notify --> Frontend

    DB --> Dashboard[Analytics & Reports]
    Dashboard --> Frontend
```
---

## Additional Features
- API Documentation using Swagger  
- Role Guards & Interceptors  
- Centralized Error Handling  
- Environment-based Configuration  
- Deployment Ready Setup  

---

``` mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant D as Database

    U->>F: Perform Action
    F->>B: API Request (JWT)
    B->>D: Fetch/Update Data
    D-->>B: Response
    B-->>F: Processed Data
    F-->>U: UI Update
```

## Project Purpose
- College Academic Project  
- Full Stack Learning (Angular + NestJS)  
- Real-world ERP System Simulation  

---

## Future Enhancements
- Mobile App Integration  
- Advanced AI Analytics  
- Payment Gateway Integration  
- Microservices Architecture  

---

## Author
**Anchal Singh**  
Aspiring Full Stack Developer  

---

⭐ If you find this project useful, feel free to star the repository!
