# Rabbit Blog API Documentation

This document describes the data models and REST API endpoints exposed by the Rabbit Blog backend.  The project follows the same architecture and coding style as the provided e‑commerce backend while implementing a simpler blog domain.  All data is stored in MongoDB via Mongoose and images are uploaded to an S3‑compatible storage service (such as Cloudflare R2) using multipart/form‑data requests.

## Contents

* [Overview](#overview)
* [Authentication](#authentication)
* [Data Models](#data-models)
  * [Home](#home)
  * [Rabbit](#rabbit)
  * [Journal](#journal)
  * [User (Admin)](#user-admin)
* [Public API Endpoints](#public-api-endpoints)
  * [`/api/v1/home`](#apiv1home)
  * [`/api/v1/rabbits`](#apiv1rabbits)
  * [`/api/v1/journals`](#apiv1journals)
* [Dashboard API Endpoints (Admin)](#dashboard-api-endpoints-admin)
  * [Authentication](#authentication-endpoints)
  * [Home Management](#home-management)
  * [Rabbit Management](#rabbit-management)
  * [Journal Management](#journal-management)
* [Request/Response Examples](#requestresponse-examples)

## Overview

The Rabbit Blog API provides a simple way to manage content for a rabbit‑themed blog.  The API exposes public endpoints for reading data and protected dashboard endpoints for administrators to create, update and delete content.  Images are uploaded through multipart/form‑data requests and stored in an S3/R2 bucket.  Error handling, authentication and image processing mirror the patterns used in the reference backend.

## Authentication

Only administrators are allowed to modify data.  Admins authenticate by obtaining a JSON Web Token (JWT) via the `/api/v1/dashboard/signup` or `/api/v1/dashboard/login` endpoints.  The token must then be included in the `Authorization` header of subsequent requests in the format `Bearer &lt;token&gt;`.

### Sign up

Admins can create an account by sending a `POST` request to `/api/v1/dashboard/signup` containing their details and the `adminPassword` configured in the `config.env` file.  If the provided `adminPassword` does not match the value in the environment configuration the request is rejected.

### Login

Existing admins obtain a token by sending a `POST` request to `/api/v1/dashboard/login` with their phone number and password.  If the credentials are valid the server responds with a JWT.

### Protecting Routes

All dashboard routes are protected by two middleware functions:

1. **`protect`** – verifies that a valid JWT is present in the `Authorization` header and attaches the user to `req.user`.
2. **`onlyPermission('admin')`** – ensures that the authenticated user has the role `admin`.  Currently only the `admin` role exists, but this pattern allows new roles to be added later.

## Data Models

### Home

The **Home** document defines the imagery on the blog's landing page.  Exactly two rabbit images and one personal image must be supplied.

| Field         | Type     | Required | Description                                   |
|---------------|----------|----------|-----------------------------------------------|
| `rabbitImages`| `[String]` | Yes      | Array of **exactly two** image URLs (R2/S3).  |
| `personalImage` | `String` | Yes      | URL of a personal image (R2/S3).              |
| `createdAt` & `updatedAt` | `Date` | Auto | Automatically set by Mongoose.           |

#### Example

```json
{
  "rabbitImages": [
    "https://cdn.example.com/home/homeRabbit-admin-1700000000000-1.jpeg",
    "https://cdn.example.com/home/homeRabbit-admin-1700000000000-2.jpeg"
  ],
  "personalImage": "https://cdn.example.com/home/homePersonal-admin-1700000000000.jpeg",
  "_id": "661111111111111111111111",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Rabbit

Each **Rabbit** represents a featured animal on the blog.  Multiple images may be associated with a single rabbit.  Age and birth date are optional metadata.  The field `favoriteSnake` deliberately mirrors the provided specification; it can be used to store the rabbit’s favourite snack.

| Field          | Type        | Required | Description                                               |
|----------------|-------------|----------|-----------------------------------------------------------|
| `images`       | `[String]`  | Yes      | Array of image URLs (R2/S3).                              |
| `name`         | `String`    | Yes      | Name of the rabbit.                                       |
| `description`  | `String`    | No       | Free‑text description of the rabbit.                      |
| `birthDate`    | `Date`      | No       | Date the rabbit was born.                                 |
| `age`          | `Number`    | No       | Age in years.                                             |
| `favoriteSnake`| `String`    | No       | Favourite snack (spelled as “snake” in the specification).|
| `createdAt` & `updatedAt` | `Date` | Auto | Automatically managed by Mongoose.                   |

### Journal

A **Journal** entry records a diary entry related to the rabbits.  Each entry contains one or more images, a textual entry and the date it was written.

| Field    | Type       | Required | Description                                           |
|----------|------------|----------|-------------------------------------------------------|
| `images` | `[String]` | Yes      | Array of image URLs (R2/S3).                          |
| `text`   | `String`   | Yes      | Diary text for the entry.                             |
| `date`   | `Date`     | Yes      | The date of the entry.                                |
| `createdAt` & `updatedAt` | `Date` | Auto | Automatically maintained by Mongoose.             |

### User (Admin)

The **User** model in this application only stores administrators.  Users have a phone number and hashed password.  The `role` field is fixed to `admin`.

| Field         | Type      | Required | Description                                     |
|---------------|-----------|----------|-------------------------------------------------|
| `name`        | `String`  | No       | Name of the admin.                              |
| `phone`       | `String`  | Yes      | Phone number used as the username.              |
| `password`    | `String`  | Yes      | Hashed password (min 8 characters).             |
| `role`        | `String`  | Yes      | Always `admin`.                                 |
| `passwordChangedAt` | `Date` | No   | Time the password was last changed.             |

## Public API Endpoints

Public endpoints require no authentication and allow visitors to read data from the blog.

### `/api/v1/home`

| Method | Description                              | Sample Response |
|--------|------------------------------------------|-----------------|
| `GET /api/v1/home` | Retrieve all home documents (there is usually only one). | Returns an array of home objects as described in the [Home](#home) model. |
| `GET /api/v1/home/:id` | Retrieve a single home document by its ID. | Returns a single home object. |

### `/api/v1/rabbits`

| Method | Description                              | Sample Response |
|--------|------------------------------------------|-----------------|
| `GET /api/v1/rabbits` | Retrieve a paginated list of rabbits. Supports filtering, sorting and field limiting via query parameters. | Returns an array of rabbit objects. |
| `GET /api/v1/rabbits/:id` | Retrieve a single rabbit by ID. | Returns a rabbit object. |

### `/api/v1/journals`

| Method | Description                              | Sample Response |
|--------|------------------------------------------|-----------------|
| `GET /api/v1/journals` | Retrieve a paginated list of journal entries. | Returns an array of journal objects. |
| `GET /api/v1/journals/:id` | Retrieve a single journal entry by ID. | Returns a journal object. |

## Dashboard API Endpoints (Admin)

All dashboard endpoints require a valid JWT obtained via the authentication endpoints.  The base URL for dashboard routes is `/api/v1/dashboard`.

### Authentication Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `POST` | `/signup` | `{ "name": "Alice", "phone": "07777777777", "password": "secret123", "adminPassword": "<env ADMIN_PASSWORD>" }` | Create a new admin account. The `adminPassword` must match the `ADMIN_PASSWORD` in `config.env`. |
| `POST` | `/login` | `{ "phone": "07777777777", "password": "secret123" }` | Authenticate an admin and receive a JWT. |

The responses to both sign‑up and login include a token and the user document:

```json
{
  "status": "success",
  "token": "<jwt>",
  "data": {
    "user": {
      "_id": "661111111111111111111111",
      "name": "Alice",
      "phone": "07777777777",
      "role": "admin"
    }
  }
}
```

Include the token in subsequent requests using an `Authorization` header:

```
Authorization: Bearer <jwt>
```

### Home Management

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET`   | `/home` | – | List all home documents. |
| `POST`  | `/home` | Multipart/form‑data with fields: `json` (stringified JSON for other properties) and `rabbitImages` (up to 2 image files) and `personalImage` (single image file). | Create a new home document. Requires exactly two images in `rabbitImages` and one in `personalImage`. |
| `GET`   | `/home/:id` | – | Retrieve a specific home document. |
| `PATCH` | `/home/:id` | Multipart/form‑data; same fields as POST but all optional. | Update an existing home document. Only provided fields are updated. |
| `DELETE`| `/home/:id` | – | Delete a home document. |

### Rabbit Management

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET`   | `/rabbits` | – | List rabbits with pagination and filtering. |
| `POST`  | `/rabbits` | Multipart/form‑data containing a `json` field and an `images` array of files.  The JSON should include the keys `name`, `description`, `birthDate`, `age` and `favoriteSnake` where appropriate. | Create a new rabbit. At least one image is required. |
| `GET`   | `/rabbits/:id` | – | Retrieve a specific rabbit. |
| `PATCH` | `/rabbits/:id` | Multipart/form‑data; same fields as POST but all optional. | Update an existing rabbit. |
| `DELETE`| `/rabbits/:id` | – | Remove a rabbit from the collection. |

### Journal Management

| Method | Path | Body | Description |
|--------|------|------|-------------|
| `GET`   | `/journals` | – | List journal entries. |
| `POST`  | `/journals` | Multipart/form‑data containing a `json` field and an `images` array of files.  The JSON should include the keys `text` and `date`. | Create a new journal entry. At least one image is required. |
| `GET`   | `/journals/:id` | – | Retrieve a specific journal entry. |
| `PATCH` | `/journals/:id` | Multipart/form‑data; same fields as POST but all optional. | Update a journal entry. |
| `DELETE`| `/journals/:id` | – | Delete a journal entry. |

## Request/Response Examples

### Create a Rabbit (Dashboard)

A new rabbit can be created by sending a multipart/form‑data request to `/api/v1/dashboard/rabbits` with a JSON payload and one or more image files.  If using a tool like Postman, add a `json` field containing the JSON string and an `images` field with the files.

**Request Body (multipart/form‑data)**

| Field     | Type            | Notes                                                     |
|-----------|-----------------|-----------------------------------------------------------|
| `json`    | `String`        | Must contain a JSON string with the rabbit properties.    |
| `images`  | `File[]`        | One or more image files.                                  |

**Example JSON (for the `json` field)**

```json
{
  "name": "Snowball",
  "description": "A playful white rabbit",
  "birthDate": "2023-03-15",
  "age": 2,
  "favoriteSnake": "Carrots"
}
```

**Example Response**

```json
{
  "status": "success",
  "data": {
    "rabbit": {
      "_id": "662222222222222222222222",
      "images": [
        "https://cdn.example.com/rabbits/rabbit-admin-1700000000000-1.jpeg",
        "https://cdn.example.com/rabbits/rabbit-admin-1700000000000-2.jpeg"
      ],
      "name": "Snowball",
      "description": "A playful white rabbit",
      "birthDate": "2023-03-15T00:00:00.000Z",
      "age": 2,
      "favoriteSnake": "Carrots",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### List Journal Entries (Public)

A client can retrieve a list of journal entries by issuing a `GET` request to `/api/v1/journals`.

**Example Response**

```json
{
  "status": "success",
  "results": 1,
  "data": {
    "journals": [
      {
        "_id": "663333333333333333333333",
        "images": [
          "https://cdn.example.com/journals/journal-admin-1700000000000-1.jpeg"
        ],
        "text": "Today Snowball explored the garden and met a friendly butterfly.",
        "date": "2024-04-10T00:00:00.000Z",
        "createdAt": "2024-04-10T12:00:00.000Z",
        "updatedAt": "2024-04-10T12:00:00.000Z"
      }
    ]
  }
}
```

## Postman Collection

A Postman collection is provided in `postman_collection.json`.  Import this file into Postman to quickly explore the API.  The collection contains preconfigured requests for signing up and logging in, as well as CRUD operations for the Home, Rabbit and Journal resources.