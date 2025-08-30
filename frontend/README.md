1. Authentication Routes (/api/auth)
POST /api/auth/register - Create new user (Farmer/Vet)

POST /api/auth/login - Login, returns JWT token

GET /api/auth/me - Get current user profile (protected)

2. Treatment Routes (/api/treatments) - Most Important
POST /api/treatments - Log a new treatment (protected)

GET /api/treatments - Get all treatments for user's farm

GET /api/treatments/:id - Get specific treatment

3. Livestock Routes (/api/livestock)
GET /api/livestock - Get all livestock groups for farm

POST /api/livestock - Create new livestock group

PUT /api/livestock/:id/status - Update status (e.g., mark for sale)

4. Drug Routes (/api/drugs)
GET /api/drugs - Get list of all available drugs

POST /api/drugs - Add new drug (Admin only)