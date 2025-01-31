# FundMe Backend System

A NestJS-based backend application for managing financial journals, ledgers, and user authentication with 2FA support.

---

## Features

- **Authentication & Authorization**
  - User registration/login with JWT
  - Two-Factor Authentication (2FA) using TOTP
  - Role-Based Access Control (Admin/User roles)
  
- **Financial Management**
  - Double-entry journal management
  - Ledger generation with balance calculations
  - Transaction integrity using database transactions

- **Technical**
  - PostgreSQL database with TypeORM
  - Dockerized PostgreSQL setup
  - Optimized SQL queries with indexing
  - API documentation
  - Unit tests with Jest

---

## Technologies

- **Backend Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, TOTP
- **Containerization**: Docker
- **API Documentation**: Postman
- **Testing**: Jest

---

## Setup Instructions

### Dependencies

1. Ensure you have Node.js and npm installed.
2. Install NestJS CLI globally:
   ```bash
   npm install -g @nestjs/cli
   ```
3. Install project dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add the following variables:
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=fundme
JWT_SECRET=your_jwt_secret
TOTP_SECRET=your_totp_secret
```

### Running the Application

1. Start the PostgreSQL database using Docker:
   ```bash
   docker-compose up -d
   ```
2. Run the NestJS application:
   ```bash
   npm run start:dev
   ```

---

## Example Requests for Testing the APIs using Postman

### Journal Operations

1. Create Journal Entry
POST `/journal`
Headers:
```
Authorization: Bearer <JWT_TOKEN>
```
Body:
```json
{
  "debit": 1000,
  "credit": 1000,
  "description": "Sample transaction"
}
```

2. Get Journal Entries
GET `/journal/:userId?page=1&limit=10&startDate=2023-01-01&endDate=2023-12-31`
Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

3. Update Journal Entry
PUT `/journal/:journalId`
Headers:
```
Authorization: Bearer <JWT_TOKEN>
```
Body:
```json
{
  "debit": 2000,
  "credit": 2000,
  "description": "Updated transaction"
}
```

4. Delete Journal Entry
DELETE `/journal/:journalId`
Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

### Ledger Operations

Generate Ledger Report
POST `/ledger`
Headers:
```
Authorization: Bearer <JWT_TOKEN>
```
Query Parameters:
```
startDate: 2023-01-01
endDate: 2023-12-31
```

### User Operations

1. Get User by ID
GET `/user/:id`
Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

2. Get All Users (Admin Only)
GET `/user`
Headers:
```
Authorization: Bearer <JWT_TOKEN>
```

## Important Notes

- All amounts in journal entries must have equal debit and credit values
- Ledger generation automatically calculates opening balance, total debits/credits, and closing balance
- Journal entries maintain a running balance using transactions for data integrity
- All endpoints except authentication require a valid JWT token

---
