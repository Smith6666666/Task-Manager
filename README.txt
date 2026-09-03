# Task Manager

A full-stack task management application built with React, Node.js, Express, and MongoDB.

This project was built as a hands-on full-stack learning project, covering the complete development lifecycle from building REST APIs and authentication to security hardening, cloud storage, browser push notifications, and production deployment.

Users can create and manage tasks, schedule reminders, receive browser notifications, manage their profile, enable two-factor authentication, recover forgotten passwords, and securely manage their account.

--------------------

## Live Demo

**Frontend:**  
https://task-manager-six-mu-80.vercel.app

**Backend API:**  
https://task-manager-7da6.onrender.com

> The backend is hosted on Render's free tier, so the first request may take some time if the service has been inactive.

--------------------

## Demo Notice

> **Important:** This project uses a free email service configuration for demonstration purposes.

> Email delivery is currently restricted, so verification and password-recovery emails may only be delivered to the email address authorized by the email provider.

> When testing authentication features such as **Forgot Password / Reset Password**, please use the **Authenticator OTP (Two-Factor Authentication) recovery option** instead of email verification when available.

> For the best demo experience:

> 1. Create an account.
> 2. Enable Two-Factor Authentication (2FA) from your account settings.
> 3. Scan the QR code using an authenticator app.
> 4. Use the generated OTP codes for authentication and account recovery features.

> This limitation is related to the project's free email-service configuration and is not a limitation of the authentication system itself.

--------------------

## Features

### Task Management

- Create tasks
- View personal tasks
- Update existing tasks
- Delete tasks
- Set task reminders
- User-specific task ownership
- Automatic reminder processing

### Browser Notifications

- Enable and disable browser notifications
- Web Push API integration
- Service Worker support
- VAPID authentication
- Receive task reminders even when the Task Manager tab is closed
- Push subscriptions are associated with individual user accounts
- Expired subscriptions are automatically cleaned up

### Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing with bcrypt
- Password strength validation
- Automatic invalidation of old JWTs after password changes
- Protected backend routes

### Two-Factor Authentication

- TOTP-based two-factor authentication
- QR code setup for authenticator applications
- OTP verification during login
- Enable and disable 2FA
- 2FA support during account recovery
- Rate limiting on OTP verification attempts

### Password Recovery

- Forgot-password workflow
- Authenticator OTP recovery
- Email-based recovery implementation
- Cryptographically secure reset tokens
- Reset tokens stored as hashes in the database
- Expiring password-reset links
- Generic recovery responses to reduce account enumeration
- Rate limiting on recovery requests

> **Demo limitation:** Email delivery is restricted by the free email-service configuration. For public testing, use the authenticator OTP recovery option after enabling 2FA.

### Profile Management

- Update user information
- Upload profile images
- Replace profile images
- Remove profile images
- Cloudinary image storage
- Automatic cleanup of replaced images
- Default profile image support

### Account Management

- Password verification for sensitive operations
- Password changes
- Two-factor authentication management
- Account termination
- Automatic cleanup of associated tasks
- Automatic cleanup of push subscriptions
- Automatic cleanup of Cloudinary profile images

--------------------

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- React Router
- Browser Notification API
- Service Workers
- Web Push API

### Backend

- Node.js
- Express.js
- JavaScript
- REST API
- Mongoose
- Multer
- Nodemailer
- Web Push

### Database

- MongoDB
- MongoDB Atlas
- Mongoose

### Authentication & Security

- JSON Web Tokens (JWT)
- bcrypt
- TOTP two-factor authentication
- otplib
- zxcvbn password-strength validation
- Helmet
- CORS
- express-rate-limit
- Cryptographically secure password-reset tokens
- Request body size limits
- File upload size/type validation
- User-scoped authorization

### Cloud Services

- MongoDB Atlas
- Cloudinary
- Resend SMTP

### Deployment

- Vercel — frontend
- Render — backend

--------------------

## Security

- Security was an important part of this project rather than being added only after development.


### Password Security

- Passwords are never stored as plain text. They are hashed using bcrypt before being stored in MongoDB.

- Password strength is also evaluated before accepting a new password.


### Authentication

- Protected API routes require a valid JWT.

- After a user changes or resets their password, tokens issued before the password change are rejected.

### Authorization

- Authentication alone is not enough to access resources.

- Tasks and other user-owned resources are scoped to the authenticated user's ID.

- For example, task queries follow the idea of:

`task ID + authenticated user ID` rather than trusting a task ID by itself.

- This prevents one authenticated user from accessing another user's resources by changing an ID in a request.

### Rate Limiting

- Sensitive authentication endpoints are protected against repeated requests.

- Rate limiting is applied to operations including:
  - Login attempts
  - OTP verification
  - Password recovery

- Production client IP handling was also configured to work correctly with the application's reverse-proxy environment.

### Password Reset Security

- Password-reset tokens are generated using cryptographically secure random values.

- Only a hash of the reset token is stored in MongoDB.

- Reset tokens expire after a limited period and generic forgot-password responses are returned so that the API does not easily reveal whether an email address is registered.

### HTTP Security

- Helmet is used to add security-related HTTP headers.

- CORS is restricted to the configured frontend origin instead of allowing unrestricted browser origins.

- JSON request bodies and uploaded files also have size limits.

### Database Security

- The production MongoDB database uses:
  - Authentication
  - Restricted database-user permissions
  - Network IP allowlisting

- The application database user has only the permissions required by the application rather than broad administrative access.

### Secret Management

- Sensitive values are stored in environment variables and are not committed to the repository.

- Examples include:
  - MongoDB connection credentials
  - JWT signing key
  - Email credentials
  - VAPID private key
  - Cloudinary credentials

--------------------

## Project Architecture

The application is separated into a React frontend and Express backend.

```text
User
 │
 ▼
React / Vite
(Vercel)
 │
 │ HTTPS REST API
 ▼
Node.js / Express
(Render)
 │
 ├──────────────► MongoDB Atlas
 │
 ├──────────────► Cloudinary
 │
 ├──────────────► Resend SMTP
 │
 └──────────────► Web Push
                        │
                        ▼
                  Service Worker
                        │
                        ▼
               Browser Notification