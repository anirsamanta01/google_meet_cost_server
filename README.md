# Google Meet Cost API

Express server for user signup/signin and authenticated project cost tracking. Project costs model labor, Google Meet/platform costs, and other costs.

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

The development server uses Nodemon and listens on `http://localhost:5000` by default. Use `npm start` for a normal production-style start without file watching. MongoDB must be running and `MONGO_URL` must be set in `.env`; the server will not start if the database connection fails. Data is currently stored in memory by the API repository and is lost when the process restarts. Set `JWT_SECRET` in `.env` before using it outside local development.

## Endpoints

- `GET /health`
- `POST /api/auth/signup` with `{ "name", "email", "phone", "password" }`
- `POST /api/auth/signin` with `{ "email", "password" }`
- `GET /api/projects` (Bearer token)
- `POST /api/projects` (Bearer token)
- `GET /api/projects/:id` (Bearer token)
- `PATCH /api/projects/:id` (Bearer token)
- `DELETE /api/projects/:id` (Bearer token)
- `GET /api/projects/:id/cost-summary` (Bearer token)

Project fields include `name`, `description`, `clientName`, `hourlyRate`, `estimatedHours`, `participants`, `durationMinutes`, `meetingCount`, `platformCost`, and `otherCosts`. Every project response includes calculated `cost` values.
