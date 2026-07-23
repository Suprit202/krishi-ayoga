# Krishi-Ayoga

Krishi-Ayoga is a modern agriculture management platform for farmers, veterinarians, and administrators. It combines a React + Vite frontend with an Express + MongoDB backend to manage farms, livestock groups, treatments, drug inventories, reports, alerts, and feedback.

## Key Features

- Farmer and veterinarian user authentication with JWT
- Farm and livestock group management
- Treatment logging and tracking
- Drug inventory and administration support
- Reports, alerts, and feedback workflows
- Responsive React dashboard with charts and analytics
- Seed scripts for demo data generation

## Repository Structure

- `backend/`
  - `server.js` – Express server entry point
  - `config/database.js` – MongoDB connection helper
  - `models/` – Mongoose schemas for users, farms, livestock, treatments, drugs, reports
  - `routes/` – API route modules for auth, farms, treatments, livestock, drugs, reports, alerts, feedback
  - `scripts/` – helper scripts for seeding demo data

- `frontend/`
  - `src/` – React application source code
  - `src/services/api.js` – Axios API client configured for auth and API requests
  - `src/contexts/` – auth and notification context providers
  - `src/components/` – UI and dashboard components
  - `src/pages/` – routed application pages

## Prerequisites

- Node.js 18+ or later
- npm 10+ or later
- MongoDB connection string (local or cloud)

## Environment Variables

Create a `.env` file in `backend/` with these variables:

```env
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=5000
```

## Backend Setup

1. Open a terminal in `backend/`
2. Install dependencies:

```bash
cd backend
npm install
```

3. Start the backend server:

```bash
npm start
```

4. (Optional) Use nodemon during development:

```bash
npm run api
```

## Frontend Setup

1. Open a terminal in `frontend/`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the frontend dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Preview the production build:

```bash
npm run preview
```

## Running the App Locally

- Backend API runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173` by default

The frontend currently points at the deployed API base URL in `frontend/src/services/api.js`. To use local backend during development, update `API_BASE_URL` to:

```js
const API_BASE_URL = 'http://localhost:5000/api/';
```

## Seed Data Scripts

The backend includes scripts for sample data generation:

- `npm run seedFarms` – seed farm records
- `npm run seedDrugs` – seed drug inventory
- `npm run demoData` – create demo data set

## API Endpoints

### Authentication
- `POST /api/auth/register` – register a new user
- `POST /api/auth/login` – login and receive JWT token
- `GET /api/auth/me` – get current user profile (protected)

### Treatments
- `POST /api/treatments` – create a treatment record (protected)
- `GET /api/treatments` – list treatments for the current farm
- `GET /api/treatments/:id` – get treatment details

### Livestock
- `GET /api/livestock` – list livestock groups for the farm
- `POST /api/livestock` – create a new livestock group
- `PUT /api/livestock/:id/status` – update livestock group status

### Drugs
- `GET /api/drugs` – list available drugs
- `POST /api/drugs` – add a drug (admin access)

### Farms, Reports, Alerts, Feedback
- `POST /api/farms` / `GET /api/farms` – manage farm data
- `GET /api/reports` / `POST /api/reports` – farm reports and analytics
- `GET /api/alerts` – system alerts and notifications
- `POST /api/feedback` – submit user feedback

## Deployment Notes

- Ensure CORS is configured for your frontend origin in `backend/server.js`
- Use secure storage for `MONGODB_URI` and `JWT_SECRET`
- Update `frontend/src/services/api.js` to point at the deployed backend API URL for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## Live Link
https://krishi-ayoga.vercel.app/login

