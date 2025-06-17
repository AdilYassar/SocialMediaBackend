Social Media App - Assessment Test
This project is a Social Media App built as part of an assessment test. Below is an overview of the application's structure, features, and how to set it up.

Key Features
Authentication

Sign-Up/Login: Users register with their name, email, and password.

Token-Based Authentication: Tokens are generated upon registration and login. Each token is associated with a unique user ID.

Middleware ensures secure handling of tokens for all protected routes.

Posts

Create Posts: Users can create posts with text and an optional image. Images are handled as base64 strings and stored in the backend.

Feed Logic: The feed displays all posts, including:

Text content

Images (if provided)

Author’s name

Like and comment counts

Interactions:

Users can like or comment on posts.

Profile

Displays the logged-in user's profile and their posts.

Tech Stack
Frontend: Built with React Native

Backend: Node.js with Express.js

Database: MongoDB

Project Structure
Controllers
User Controller: Handles user registration, login, and token generation.

Post Controller: Manages the creation of posts, feed retrieval, likes, and comments.

Profile Controller: Handles profile-related logic, including displaying user details and posts.

Schemas
User Schema: Manages user data (name, email, password, tokens).

Post Schema: Handles post data (text, optional image, likes, comments, etc.).

Comment Schema: Manages comment details (text, author, and post reference).

Routes
Organized for modularity:

User routes for authentication.

Post routes for post creation, liking, and commenting.

Profile routes for user-specific data.

Middleware
Token Middleware: Validates tokens for protected routes to ensure secure user access.

Setup Instructions
Clone the repository:

bash
Copy
Edit
git clone <repository-url>
cd <project-directory>
Install dependencies:

bash
Copy
Edit
npm install
Start the server:

bash
Copy
Edit
npm start
The server will run and connect to MongoDB.

Access the APIs through the provided routes.

Key Notes
Database: MongoDB is used for data storage.

Images:

Images are uploaded as base64 strings and stored in this format.

Supports efficient retrieval and display.

Authentication Middleware: Ensures all protected routes are secured with token-based validation.

This app is a basic yet robust implementation of a social media platform, covering essential features mentioned in assesement 
