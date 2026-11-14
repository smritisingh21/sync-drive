# Sync Drive 🚀

A modern, full-stack cloud storage web application inspired by Google Drive and Pinterest. Built with a **React (Vite)** frontend and a **Node.js (Express)** backend, featuring direct **AWS S3** uploads via presigned URLs, **Redis** session storage, **MongoDB Atlas**, and flexible masonry grid / list views.

---

## 🌟 Key Features

* **Direct S3 Uploads (Presigned URLs)**: Client uploads directly to AWS S3 using short-lived presigned PUT URLs, bypassing the application server to maximize throughput and minimize server load.
* **Real-Time Upload Progress**: Live progress bars tracking byte transfer to S3 using `XMLHttpRequest`.
* **Instant Image Previews & Thumbnails**:
  * **Fluid Masonry Grid View**: Pinterest-inspired dynamic grid displaying real image thumbnails generated on-the-fly via presigned S3 GET URLs.
  * **Structured List View**: Minimal, metadata-rich table view showing sizes, modification dates, and folder item counts.
  * **Instant Upload Previews**: Client-side object URLs (`URL.createObjectURL`) show instant photo previews while uploads are in flight.
* **Hierarchical Folder Structure**: Nested directories with automated size rollup calculations and parent directory tracking.
* **Dual Authentication System**:
  * Traditional Email & Password (with `bcrypt` hashing).
  * One-click Google Sign-In (via Google Identity Services OAuth 2.0).
  * High-performance session storage powered by **Redis Cloud** with cross-domain, HTTP-only secure signed cookies.
* **Complete File Management**:
  * Context menus with **Download**, **Rename**, **Delete**, and **Details** modals.
  * Storage quota enforcement preventing uploads beyond user storage allocation.
  * Cascading directory deletion and AWS S3 object cleanup.

---

## ⚙️ Tech Stack

### Frontend
* **Core**: React 18, Vite
* **Styling**: Tailwind CSS
* **Routing**: React Router (v7)
* **Icons & UI**: Lucide React, React Icons
* **Networking**: Axios (with credentials support)
* **Auth Integration**: `@react-oauth/google`

### Backend
* **Runtime**: Node.js (ES Modules), Express.js
* **Databases**:
  * **MongoDB Atlas** (with Mongoose ODM) for persistent file/folder metadata and users.
  * **Redis Cloud** for fast, distributed session management.
* **Object Storage**: AWS S3 via `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` (v3).
* **Security & Auth**: `bcrypt`, `cookie-parser`, CORS (configured for cross-origin deployments).

### Deployment & Infrastructure
* **Frontend**: Vercel (Global Edge Network with SPA URL rewrites).
* **Backend**: AWS EC2 (Ubuntu 24.04 LTS), managed with **PM2** process manager.
* **Web Server**: **Nginx** reverse proxy forwarding traffic to port `4000`.
* **SSL/TLS**: Let's Encrypt SSL via Certbot.

---

## 📐 Architecture & Upload Workflow

```
[ Browser / React ]
       │
       │ 1. POST /file/upload/initiate (file metadata & quota check)
       ▼
[ Express API ] ─────────► [ S3 SDK ] (generates presigned PUT URL)
       │
       │ 2. Returns { uploadSignedUrl, fileId }
       ▼
[ Browser / React ]
       │
       │ 3. Direct PUT binary payload to S3 (live % progress)
       ▼
[ AWS S3 Bucket ]
       │
       │ 4. 200 OK (Upload Complete)
       ▼
[ Browser / React ]
       │
       │ 5. POST /file/upload/complete { fileId }
       ▼
[ Express API ] ─────────► [ S3 HeadObject ] (verifies file size & marks active in DB)
```

---

## 📁 Project Structure

```text
storage-app/
├── backend/
│   ├── config/             # DB, Redis, and AWS S3 SDK configs
│   ├── controllers/        # Business logic (files, directories, auth, users)
│   ├── middlewares/        # Authentication and ID validation
│   ├── models/             # Mongoose schemas (User, Directory, File, Session)
│   ├── routes/             # Express route definitions
│   ├── app.js              # Server entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/            # Axios API client functions
│   │   ├── components/     # Modals, ContextMenu, DirectoryItem, Header, etc.
│   │   ├── context/        # DirectoryContext for global state
│   │   ├── DirectoryView.jsx # Main dashboard (Grid & List views)
│   │   ├── Login.jsx       # Email + Google authentication
│   │   └── App.jsx
│   ├── vercel.json         # SPA routing configuration for Vercel
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js** (v20+ recommended)
* **MongoDB** (Local instance or MongoDB Atlas cluster URI)
* **Redis** (Local instance or Redis Cloud)
* **AWS S3 Bucket** with CORS enabled and IAM access keys

### 1. Clone the Repository
```bash
git clone https://github.com/smritisingh21/sync-drive.git
cd sync-drive
```

### 2. Configure Backend Environment
Navigate to `backend/` and create a `.env` file:
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=4000
BASE_URL=http://localhost:4000
MONGODB_CONNECTION_STRING=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secret_key

# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USER=default
REDIS_PWD=your_redis_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# AWS S3 Configuration
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_KEY=your_aws_secret_access_key
AWS_BUCKET_NAME=sync-drive-bucket
```

Start the backend:
```bash
npm run dev
```

### 3. Configure Frontend Environment
In a new terminal window:
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_BACKEND_BASE_URL=http://localhost:4000
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔒 S3 Bucket CORS Configuration

Ensure your S3 bucket has the following Cross-Origin Resource Sharing (CORS) rules enabled in the **AWS Console ➔ S3 ➔ [Your Bucket] ➔ Permissions ➔ CORS**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
