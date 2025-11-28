# Parallax Backend API Documentation

**Version:** Demo / Development  
**Status:** Stable (HTTP contracts), internal persistence may evolve (SQLite planned)

This document defines the REST-style API exposed by the Parallax Java backend.  
All APIs return JSON.  
All dates and times are server-local unless otherwise noted.

---

## 1. Overview

The backend exposes endpoints for:

- **Authentication & Accounts**
- **Vehicle Management**
- **Blacklist Management (admin only)**
- **Query**
- **System Health**

The system is currently **stateless**:  
The front-end includes a header such as:

```
X-User: <username>
```

to indicate the authenticated user.  
In production, this will be replaced with secure sessions (JWT or server-side tokens).

Admin account is configured statically in `AppConfig`.

---

## 2. Authentication & Accounts

### 2.1 Register

**`POST /auth/register`**

Create a new user account.

**Request Body**

```json
{
  "country": "CA",
  "firstName": "Liam",
  "lastName": "Frost",
  "birthMonth": 1,
  "birthDay": 15,
  "birthYear": 2003,
  "email": "liam@example.com",
  "password": "Secret123",
  "phoneCountry": "+1",
  "phone": "6041234567",
  "contactMethod": "text"
}
```

**Response**

```json
{ "success": true }
```

**Errors:**

- `400` missing/invalid fields
- `409` account already exists

---

### 2.2 Login

**`POST /auth/login`**

Authenticates the user.

**Request Body**

```json
{
  "username": "liam@example.com",
  "password": "Secret123"
}
```

**Response**

```json
{
  "success": true,
  "username": "liam@example.com"
}
```

---

### 2.3 Get Current User Info

**`GET /account/me`**

**Requires:**

```
X-User: <username>
```

**Response Example**

```json
{
  "country": "CA",
  "firstName": "Liam",
  "lastName": "Frost",
  "birthMonth": 1,
  "birthDay": 15,
  "birthYear": 2003,
  "email": "liam@example.com",
  "phoneCountry": "+1",
  "phone": "6041234567",
  "contactMethod": "text"
}
```

---

### 2.4 Update Contact Info

**`PUT /account/contact`**

**Requires:**

```
X-User: <username>
```

**Request Body**

```json
{
  "email": "new@example.com",
  "phoneCountry": "+1",
  "phone": "7781239876",
  "currentPassword": "Secret123"
}
```

**Response**

```json
{ "success": true }
```

---

### 2.5 Change Password

**`PUT /account/password`**

**Request Body**

```json
{
  "oldPassword": "Secret123",
  "newPassword": "NewPass456",
  "captcha": "ABCD"
}
```

**Response**

```json
{ "success": true }
```

---

### 2.6 Delete Account

**`DELETE /account`**

Admin account cannot be deleted.

**Response**

```json
{ "success": true }
```

---

## 3. Vehicles

All vehicle endpoints require:

```
X-User: <username>
```

Admins may list **all** vehicles.

---

### 3.1 List Vehicles

**`GET /vehicles`**

**Response Example:**

```json
{
  "vehicles": [
    {
      "licenseNumber": "ABC1234",
      "make": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "blacklisted": false,
      "owner": "liam@example.com",
      "phoneCountry": "+1",
      "phone": "6041234567"
    }
  ]
}
```

Admin sees all vehicles; regular users only see their own.

---

### 3.2 Add Vehicle

**`POST /vehicles`**

**Request Body**

```json
{
  "licenseNumber": "ABC1234",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020
}
```

**Response**

```json
{ "success": true }
```

---

### 3.3 Delete Vehicle

**`DELETE /vehicles`**

**Request Body**

```json
{
  "licenseNumber": "ABC1234"
}
```

**Response**

```json
{ "success": true }
```

---

## 4. Blacklist (Admin Only)

Admin credentials are configured in `AppConfig`.

Admin-only endpoints require:

```
X-User: <admin-email>
```

---

### 4.1 Update Blacklist Status

**`POST /vehicles/blacklist`**

**Request Body**

```json
{
  "username": "liam@example.com",
  "licenseNumber": "ABC1234",
  "blacklisted": true
}
```

**Response**

```json
{
  "success": true,
  "vehicle": {
    "licenseNumber": "ABC1234",
    "blacklisted": true
  }
}
```

---

## 5. Query

### 5.1 Text Query (Public or Authenticated)

**`GET /vehicles/query?license=ABC1234`**

**Response if found**

```json
{
  "found": true,
  "licenseNumber": "ABC1234",
  "blacklisted": false
}
```

**Response if not found**

```json
{
  "found": false
}
```

No owner or personal information is returned.

---

### 5.2 Image Recognition Query (Java → Python Service)

**`POST /vehicles/query/image`**

Form-data request:

```
file: <uploaded image>
```

**Java Backend Steps**

1. Receives image upload

2. Forwards to Python service:

   ```
   POST http://python-service/recognize
   ```
   
   with image bytes

3. Python returns:

   ```json
   { "plate": "ABC1234" }
   ```

4. Java performs the same blacklist lookup as text query

5. Java returns:

**Response**

```json
{
  "plate": "ABC1234",
  "blacklisted": true
}
```

**Errors:**

- `400` no plate detected
- `502` Python service unreachable

---

## 6. Health Check

**`GET /api/health`**

**Response**

```json
{ "status": "ok" }
```

---

## 7. Error Format (Standard)

All errors follow:

```json
{
  "success": false,
  "error": "MESSAGE"
}
```

**Status codes:**

- `400` invalid request
- `401` not authenticated
- `403` not authorized
- `404` not found
- `409` conflict (e.g., duplicate registration)
- `500` internal error
- `502` upstream error (Python recognition service)

---

## 8. Future Backward-Compatible Expansions

- SQLite-based repositories (`SQLiteUserRepository`, `SQLiteVehicleRepository`)
  - No API changes required; only internal swap.
- JWT authentication
- Admin audit logs
- Batch query / statistics endpoints
- Multi-tenant environment support

---

## 9. Versioning Strategy

On stabilization, routes will move to:

```
/api/v1/<...>
```

Backward compatibility will be preserved for existing clients.
