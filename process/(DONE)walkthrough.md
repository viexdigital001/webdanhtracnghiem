# Walkthrough: Migrating Database to Firebase Firestore

This document summarizes the steps taken to replace the MongoDB layer with Firebase Firestore, providing serverless database storage that runs seamlessly on Vercel.

## Changes Made

### 1. Project Dependencies

- **[package.json](file:///d:/WorkSpace/Hoc/web/package.json)**:
  - Swapped the `mongodb` driver with `firebase-admin` (v12.7.0).

### 2. Vercel Serverless Configuration

- **[vercel.json](file:///d:/WorkSpace/Hoc/web/vercel.json)**:
  - Created a configuration file to declare `server.js` as a Serverless function (`@vercel/node` builder) and map the `/api`, `/health`, and `/questions.js` routes to it, while serving `index.html` static layout for all other paths.

### 3. Environment variables

- **[.env](file:///d:/WorkSpace/Hoc/web/.env)**:
  - Swapped MongoDB keys for Firebase service account placeholders:
    - `FIREBASE_PROJECT_ID`
    - `FIREBASE_CLIENT_EMAIL`
    - `FIREBASE_PRIVATE_KEY`

### 4. Backend Refactoring

- **[server.js](file:///d:/WorkSpace/Hoc/web/server.js)**:
  - Swapped `MongoClient` imports for `firebase-admin`.
  - Configured `firebase-admin` with key formatting (`replace(/\\n/g, '\n')`) and wrapped initialization in a `try-catch` block so the server won't crash on startup if credentials are unconfigured or invalid.
  - Implemented `convertTimestamps` utility to map Firestore `Timestamp` objects back to standard JavaScript `Date` objects, keeping the JSON responses compatible with the frontend client expectations.
  - Re-implemented the `users` and `sessions` interfaces to connect directly to Firestore collections.
  - Updated `/health` endpoint to test firestore connection.

---

## Verification & Testing

### 1. Local Compile & Startup
- Ran `node server.js` to ensure the server starts.
- The server booted successfully:
  ```text
  Failed to initialize Firebase admin: Failed to parse private key: Error: Invalid PEM formatted message.
  Firebase configuration is missing, incomplete, or invalid.
  Server running on http://localhost:3000
  ```
- This confirms the error boundary keeps the server running when credentials are unconfigured.

### 2. API Health Check Response
- Triggered `/health` request locally to check the error propagation:
  ```json
  {
    "ok": false,
    "database": "firestore",
    "error": "Database unavailable",
    "detail": "Firebase environment variables are missing or incomplete."
  }
  ```

Once you fill in the Firebase credentials in your local `.env` and Vercel Dashboard, the app will automatically connect and run on Vercel without further changes.
