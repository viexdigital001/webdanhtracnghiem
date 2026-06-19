# Migrating Database Layer from MongoDB to Firebase Firestore

This plan outlines the steps to replace the MongoDB layer with Google Firebase Firestore. This resolves Vercel deployment IP whitelist issues and dynamic network resolution errors, as Firestore is fully serverless and works out of the box on Vercel.

## User Review Required

> [!IMPORTANT]
> **Firebase Setup Required**:
> To connect to Firestore, you will need to add three environment variables to your `.env` (locally) and in your Vercel Dashboard settings:
> 1. `FIREBASE_PROJECT_ID`
> 2. `FIREBASE_CLIENT_EMAIL`
> 3. `FIREBASE_PRIVATE_KEY` (The private key should contain the full `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` text).
>
> You can get these credentials by going to your **Firebase Console** -> **Project Settings** -> **Service Accounts**, and clicking **Generate new private key**.

> [!TIP]
> This change includes adding a [vercel.json](file:///d:/WorkSpace/Hoc/web/vercel.json) file to route Express API requests and serve static assets seamlessly on Vercel.

## Proposed Changes

### Dependencies & Configuration

#### [MODIFY] [package.json](file:///d:/WorkSpace/Hoc/web/package.json)
- Add `firebase-admin` dependency.
- Remove `mongodb` dependency (optional, for cleanliness).

#### [NEW] [vercel.json](file:///d:/WorkSpace/Hoc/web/vercel.json)
Configure Vercel serverless routing to point `/api` and `/health` requests to `server.js` and serve `index.html` as the default.

#### [MODIFY] [.env](file:///d:/WorkSpace/Hoc/web/.env)
- Remove `MONGODB_URI` and `MONGODB_DB`.
- Add placeholders for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

### Backend Implementation

#### [MODIFY] [server.js](file:///d:/WorkSpace/Hoc/web/server.js)
- Replace `MongoClient` with `firebase-admin`.
- Rework `users` and `sessions` interfaces to run queries using Firestore Collections (`users` and `sessions`).
- Rework `ensureReady()` and `/health` to verify Firebase configuration and ping status.

---

## Verification Plan

### Automated Tests
- Run `npm install` to download dependencies.
- Verify node server starts locally and throws an error if Firebase environment variables are missing.
- Mock the Firebase credentials and check if the database connects successfully.

### Manual Verification
- Test registration and login flow in the browser once Firebase variables are configured.
- Test loading and saving quiz progress to verify data persistence in Firestore.
