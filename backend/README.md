# Backend API

This is the backend API for the full-stack application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization with JWT
- Secure password reset flow
- Rate limiting and security best practices
- Error handling and logging
- API documentation (coming soon)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables in `.env` with your configuration

## Running the Application

### Development

```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

### Production

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/v1/users/signup` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password

### Users (Protected)

- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/updateMyPassword` - Update password
- `PATCH /api/v1/users/updateMe` - Update user data
- `DELETE /api/v1/users/deleteMe` - Delete current user

### Admin (Protected & Restricted)

- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID (Admin only)
- `PATCH /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

## Environment Variables

See `.env.example` for all available environment variables.

## Security Best Practices

- Always use HTTPS in production
- Keep your JWT secret secure
- Use strong passwords
- Regularly update dependencies
- Implement proper CORS policies
- Use rate limiting
- Sanitize user input
- Use security headers

## Error Handling

The API follows RESTful error handling conventions with appropriate HTTP status codes and error messages.

## Logging

Logs are stored in the `logs` directory with separate files for errors and combined logs.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
