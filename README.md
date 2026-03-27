# Prescripto

Prescripto is a full-stack doctor appointment platform with three apps in one repository:

- `frontend` - patient-facing React app
- `admin` - admin/doctor dashboard React app
- `backend` - Node.js + Express API with MongoDB

## Tech Stack

- Frontend/Admin: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Razorpay

## Repository Structure

```
prescripto/
  admin/
  backend/
  frontend/
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas (or local MongoDB)
- Cloudinary account
- Razorpay account (for payment flow)

## 1) Clone and Install

```bash
git clone https://github.com/rajn2199/Prescripto.git
cd Prescripto

cd backend && npm install
cd ../frontend && npm install
cd ../admin && npm install
```

## 2) Environment Variables

### Backend env file

Create `.env` inside `backend/`:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend env file

Create `.env` inside `frontend/`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Admin env file

Create `.env` inside `admin/`:

```env
VITE_BACKEND_URL=http://localhost:4000
```

## 3) Run the Project

Open 3 terminals:

### Terminal 1 - Backend

```bash
cd backend
npm run server
```

### Terminal 2 - Frontend (Patient App)

```bash
cd frontend
npm run dev
```

### Terminal 3 - Admin Panel

```bash
cd admin
npm run dev
```

## Default Local URLs

- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- Admin: http://localhost:5174 (or next available Vite port)

## API Base Routes

- `/api/user`
- `/api/doctor`
- `/api/admin`

## Available Scripts

### Backend

- `npm start` - run with Node
- `npm run server` - run with Nodemon

### Frontend/Admin

- `npm run dev` - start Vite dev server
- `npm run build` - build production assets
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Notes

- Keep secrets in `.env` files only.
- `.gitignore` already excludes `node_modules`, `.env*`, and build outputs.
- Uploaded files are ignored via `backend/uploads/`.
