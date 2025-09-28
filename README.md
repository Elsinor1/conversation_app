# Conversation App API Documentation

A Django REST Framework API for managing conversation-based language learning with chatbot interactions.

## Table of Contents
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [User Management](#user-management)
  - [Theme Management](#theme-management)
  - [Scenario Management](#scenario-management)
  - [Chat Management](#chat-management)
  - [Chatbot Interaction](#chatbot-interaction)
- [Error Handling](#error-handling)
- [Setup Instructions](#setup-instructions)

## Authentication

This API uses Token Authentication. You need to obtain a token after registration and include it in the `Authorization` header for protected endpoints.

**Format:** `Authorization: Token <your_token_here>`

## API Endpoints

### User Management

#### Register User
**POST** `/register/`

Creates a new user account.

**Request Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "username": "string",
    "email": "string"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"u1","email":"u1@example.com","password":"pass1234"}'
```

#### Get Authentication Token
**POST** `/api-token-auth/`

Obtains an authentication token for the user.

**Request Body:**
```
username=string&password=string
```

**Response:**
```json
{
    "token": "string"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api-token-auth/ \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=u1&password=pass1234"
```

### Theme Management

#### List Themes
**GET** `/theme/`

Retrieves all available conversation themes.

**Response:**
```json
[
    {
        "id": "uuid",
        "title": "string",
        "description": "string"
    }
]
```

#### Create Theme
**POST** `/theme/`

Creates a new conversation theme.

**Request Body:**
```json
{
    "title": "string",
    "description": "string"
}
```

**Response:**
```json
{
    "id": "uuid",
    "title": "string",
    "description": "string"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/theme/ \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Travel","description":"Travel conversations"}'
```

#### Retrieve Theme
**GET** `/theme/{id}/`

Retrieves a specific theme by ID.

#### Update Theme
**PUT** `/theme/{id}/`

Updates an existing theme.

### Scenario Management

#### List Scenarios
**GET** `/scenario/`

Retrieves all available conversation scenarios.

**Response:**
```json
[
    {
        "id": "uuid",
        "title": "string",
        "slug": "string",
        "description": "string",
        "theme": "uuid",
        "teacher_role": "string",
        "student_role": "string"
    }
]
```

#### Create Scenario
**POST** `/scenario/`

Creates a new conversation scenario.

**Request Body:**
```json
{
    "title": "string",
    "slug": "string",
    "description": "string",
    "theme": "uuid",
    "teacher_role": "string",
    "student_role": "string"
}
```

**Response:**
```json
{
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "description": "string",
    "theme": "uuid",
    "teacher_role": "string",
    "student_role": "string"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/scenario/ \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Airport","description":"At the airport","theme":"f728185c-8450-439e-85fd-e83578b25473","teacher_role":"Agent","student_role":"Traveler"}'
```

#### Retrieve Scenario
**GET** `/scenario/{id}/`

Retrieves a specific scenario by ID.

#### Update Scenario
**PUT** `/scenario/{id}/`

Updates an existing scenario.

### Chat Management

#### List Chats
**GET** `/chat/`

Retrieves all chats for the authenticated user.

**Headers:** `Authorization: Token <your_token>`

**Response:**
```json
[
    {
        "theme": "uuid",
        "scenario": "uuid",
        "language_level": "uuid"
    }
]
```

#### Create Chat
**POST** `/chat/`

Creates a new chat session.

**Headers:** `Authorization: Token <your_token>`

**Request Body:**
```json
{
    "theme": "uuid",
    "scenario": "uuid",
    "language_level": "uuid"
}
```

**Response:**
```json
{
    "theme": "uuid",
    "scenario": "uuid",
    "language_level": "uuid"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/chat/ \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"theme":"f728185c-8450-439e-85fd-e83578b25473","scenario":"c99d2dad-0d83-4473-8f8e-01450d9bcbd0","language_level":"205284ef-e020-40c5-b3d3-e9aa0cb0cf16"}'
```

#### Retrieve Chat
**GET** `/chat/{id}/`

Retrieves a specific chat by ID.

#### Delete Chat
**DELETE** `/chat/{id}/`

Deletes a specific chat.

### Chatbot Interaction

#### Send Message to Chatbot
**POST** `/chat_message/`

Sends a message to the chatbot and receives a response.

**Headers:** `Authorization: Token <your_token>`

**Request Body:**
```json
{
    "chat_id": "uuid",
    "message": "string" // Optional for first message
}
```

**Response:**
```json
"string" // Chatbot response message
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/chat_message/ \
  -H "Authorization: Token <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"715426bf-1418-40cc-ac13-3abbee921306","message":"Hello, I need help with my flight"}'
```

**Note:** For the first message in a chat, the `message` field is optional as the chatbot will start the conversation. For subsequent messages, the `message` field is required.

## Error Handling

The API returns appropriate HTTP status codes and error messages:

### Common Error Responses

**400 Bad Request:**
```json
{
    "result": "error",
    "message": "Json decoding error"
}
```

**400 Bad Request (Validation Error):**
```json
{
    "error": "Validation error message"
}
```

**400 Bad Request (Missing Message):**
```json
{
    "result": "error",
    "message": "'message' not in data. Chat has already started, message is then mandatory."
}
```

**401 Unauthorized:**
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser (Optional):**
   ```bash
   python manage.py createsuperuser
   ```

4. **Start Development Server:**
   ```bash
   python manage.py runserver
   ```

5. **Access Admin Panel:**
   Visit `http://127.0.0.1:8000/admin/` to manage data through Django admin.

6. **Access API:**
   All API endpoints are available at `http://127.0.0.1:8000/`

## Models Overview

### Theme
- `id`: UUID (Primary Key)
- `title`: String (Unique)
- `description`: String
- `created`, `modified`: Timestamps

### Scenario
- `id`: UUID (Primary Key)
- `title`: String (Unique)
- `slug`: String
- `description`: String
- `theme`: Foreign Key to Theme
- `teacher_role`: String
- `student_role`: String
- `created`, `modified`: Timestamps

### Chat
- `id`: UUID (Primary Key)
- `user`: Foreign Key to User
- `theme`: Foreign Key to Theme
- `scenario`: Foreign Key to Scenario
- `language_level`: Foreign Key to LanguageLevel
- `is_started`: Boolean
- `created`, `modified`: Timestamps

### User
- Standard Django User model
- `username`: String (Unique)
- `email`: String
- `password`: String (Hashed)
