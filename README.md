# Backend Stage 2 Task: User Authentication & Organisation

This project implements user authentication and organisation management using a backend framework of your choice connected to a PostgreSQL database. It includes endpoints for user registration, login, and organisation management.

## Task Requirements

1. **Database Setup**: Connect the application to a PostgreSQL database.
2. **User Model**: Define a user model with unique `userId` and `email`, and validate all fields.
3. **User Authentication**:
   - **Registration**: Implement endpoint for user registration with hashed password storage.
   - **Login**: Implement endpoint for user login with JWT token generation.
4. **Organisation Model**: Define an organisation model linked to users, where users can belong to multiple organisations.
5. **Endpoints**:
   - `/auth/register`: Registers a user and creates a default organisation.
   - `/auth/login`: Logs in a user and returns an access token.
   - `/api/users/:id`: Retrieves a user's own record or in organisations they belong to or created.
   - `/api/organisations`: Retrieves all organisations a user belongs to or created.
   - `/api/organisations/:orgId`: Retrieves a single organisation record.
   - `/api/organisations/:orgId/users`: Adds a user to a specific organisation.
6. **Unit Testing**: Write tests covering token generation, organisation access restrictions, and end-to-end tests for registration endpoints.

## Solution Overview

This project utilizes Prisma for database interactions. It implements JWT for authentication, ensures unique constraints for `userId` and `email`, and manages organisations with CRUD operations.

## How to Use

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- PostgreSQL database running
- Clone the repository

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables (`.env` file) for database connection and JWT secret.

    ```env
    DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
    JWT_SECRET="your_secret"
    ```

3. Run database migrations (if using ORM):

   ```bash
   npm run migrate
   ```

### Running the Server

Start the server:

```bash
npm run start
```

The server runs on `http://localhost:7000` (or your specified port).

### Making Requests

#### User Registration

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword",
  "phone": "+1234567890"
}
```

#### User Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepassword"
}
```

#### Get User's Own Record

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Get User's Organisations

```http
GET /api/organisations
Authorization: Bearer <token>
```

#### Create Organisation

```http
POST /api/organisations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John's Organisation",
  "description": "This is John's organisation."
}
```

#### Add User to Organisation

```http
POST /api/organisations/:orgId/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_to_add"
}
```

## Testing

Run tests using Jest:

```bash
npm run test
```
