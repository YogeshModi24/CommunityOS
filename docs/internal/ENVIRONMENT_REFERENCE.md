# Environment Variables Reference

This document lists all environment variables supported by **CommunityOS** and validated at startup.

## 1. Server Configuration (API & Worker)

| Variable Name           | Required | Default Value                        | Description                                                                                            |
| :---------------------- | :------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `NODE_ENV`              | No       | `development`                        | The runtime mode of the application (local, development, test, staging, production).                   |
| `PORT`                  | No       | `5001`                               | Port number the Express API server listens on.                                                         |
| `MONGODB_URI`           | **Yes**  | `N/A`                                | Required. MongoDB connection URI string.                                                               |
| `REDIS_URL`             | No       | `mock`                               | Redis connection URL for BullMQ job queue manager. Set to "mock" to use in-memory queue.               |
| `GROQ_API_KEY`          | No       | `mock`                               | Groq API Key for llama-3.3-70b-versatile analysis. Set to "mock" to run with simulated mock responses. |
| `CLOUDINARY_CLOUD_NAME` | No       | `mock`                               | Cloudinary cloud name for media upload. Set to "mock" for local mocks.                                 |
| `CLOUDINARY_API_KEY`    | No       | `mock`                               | Cloudinary API Key for authentication. Set to "mock" for local mocks.                                  |
| `CLOUDINARY_API_SECRET` | No       | `mock`                               | Cloudinary API Secret for authentication. Set to "mock" for local mocks.                               |
| `JWT_SECRET`            | No       | `change_me_to_random_32_char_string` | Secret key used to sign and verify JWT authentication tokens.                                          |
| `CLIENT_URL`            | No       | `http://localhost:3000`              | Domain URL of the Next.js client web application (used for CORS mapping).                              |

## 2. Client Configuration (Next.js Application)

| Variable Name                          | Required | Default Value                        | Description                                                                          |
| :------------------------------------- | :------- | :----------------------------------- | :----------------------------------------------------------------------------------- |
| `NODE_ENV`                             | No       | `development`                        | The runtime mode of the application (local, development, test, staging, production). |
| `NEXT_PUBLIC_API_URL`                  | No       | `http://localhost:5001`              | Public endpoint URL of the backend API server.                                       |
| `NEXT_PUBLIC_SOCKET_URL`               | No       | `http://localhost:5001`              | Public endpoint URL of the WebSockets event socket server.                           |
| `NEXT_PUBLIC_MAPBOX_TOKEN`             | No       | `mock`                               | Mapbox public access token for interactive map plots.                                |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | No       | `mock`                               | Cloudinary cloud name for client-side direct upload streams.                         |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | No       | `mock`                               | Cloudinary unsigned upload preset identifier.                                        |
| `NEXTAUTH_SECRET`                      | No       | `change_me_to_random_32_char_string` | Secret key used to encrypt and sign cookie layers in NextAuth session controls.      |
| `AUTH_SECRET`                          | No       | `change_me_to_random_32_char_string` | Alternative encryption secret for NextAuth/Auth.js credentials provider.             |
| `NEXTAUTH_URL`                         | No       | `http://localhost:3000`              | Canonical base URL of the frontend web application.                                  |
| `AUTH_TRUST_HOST`                      | No       | `true`                               | Instructs Auth.js to trust the host header (required in container runtimes).         |
