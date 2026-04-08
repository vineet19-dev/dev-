# AeroBridge - Airport Command & Control System

AeroBridge is a full-stack, real-time airport operations monitoring platform. It simulates the command center brain of an airport and continuously tracks HVAC, electrical, fire safety, security, and IT systems.

The dashboard is designed for hackathon demos and industrial digital-twin presentations:

- Real-time alerting and telemetry with Socket.io
- Smart backend rules for anomaly detection
- Interactive digital twin zones with live state coloring
- Animated mission-control UI with glassmorphism and neon status cues
- Logs history with sort/filter controls
- Incident timeline strip for rapid event storytelling
- KPI mini-trend sparklines for live telemetry visualization
- Optional browser-side alert audio cue toggle

## Tech Stack

- Frontend: React, Tailwind CSS, Framer Motion, Socket.io Client
- Backend: Node.js, Express, Socket.io
- Database: MongoDB with Mongoose

## Project Structure

```
backend/
	src/
		config/
		models/
		routes/
		services/
		server.js
frontend/
	src/
		components/
		hooks/
		lib/
		styles/
		App.jsx
```

## Features

### 1) Header Section

- AeroBridge Command Center identity bar
- Subtitle and live UTC clock

### 2) Alert Panel

- Animated alert cards
- Severity colors:
	- Critical: red
	- Warning: yellow
	- Normal: green
- Resolve action per alert
- Real-time updates from backend events

### 3) System Status Cards

- HVAC, Electrical, Security, Fire Safety, IT Systems
- Dynamic status and key metrics:
	- HVAC: temperature
	- Electrical: voltage
	- Security: active sensors
	- Fire: smoke level
	- IT: server load

### 4) Logs Table

- Auto-appended logs for every alert and resolution
- Sorting by columns
- Filtering by severity
- Scrollable history panel

### 5) Control Panel

Simulation buttons for demo flows:

- Trigger AC Failure
- Increase Temperature
- Power Failure
- Fire Alert

### 6) Digital Twin View

- Interactive airport zones:
	- Terminal 1
	- Terminal 2
	- Runway
	- Baggage Area
	- Control Room
- Color changes by severity
- Critical blink animation
- Hover telemetry and click-to-inspect detail panel
- SVG-based map-style layout with scanline grid effect

### 7) Incident Timeline

- Horizontal real-time event stream
- Severity colored cards aligned to a timeline axis
- Useful for narrating incidents during demos

### 8) KPI Trends

- Four live sparkline cards:
	- HVAC temperature
	- Grid voltage
	- Smoke density
	- Server load

### 9) Alert Audio

- Alert Audio ON/OFF toggle in dashboard
- Browser-generated tone on incoming alerts

### 10) One-Click Demo Scenario

- A single button runs a guided ~60 second incident sequence
- Sequence includes reset, thermal escalation, HVAC fault, power failure, and fire escalation
- Progress bar and step label help presenters narrate each phase clearly

## Smart Logic Rules

Implemented in backend engine:

- Temperature > 28C -> warning alert
- Temperature > 32C -> critical alert
- Voltage = 0 -> critical power failure alert
- AC operational OFF -> critical HVAC alert

Rules run during simulations and periodic telemetry ticks.

## API Endpoints

Routes are available at both root and /api prefix.

- GET /systems
- GET /alerts
- POST /alerts
- PATCH /alerts/:id/resolve
- GET /logs
- POST /simulate
- GET /snapshot
- POST /reset

Simulation payload:

```json
{
	"type": "AC_FAILURE"
}
```

Supported simulation types:

- AC_FAILURE
- TEMP_INCREASE
- POWER_FAILURE
- FIRE_ALERT

## Run Locally

Important: In development, open the frontend URL (`http://localhost:5173`) to see the interactive UI. The backend URL (`http://localhost:4000`) serves API endpoints.

### Prerequisites

- Node.js 18+
- MongoDB running locally or reachable via connection URI

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Default backend URL: http://localhost:4000

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Default frontend URL: http://localhost:5173

### Optional: Serve Frontend From Backend (Production-style)

If you want a single URL for both API and UI:

```bash
cd frontend
npm run build
cd ../backend
npm run start
```

Then open `http://localhost:4000`.

## Demo Script

1. Start with green dashboard baseline
2. Click Increase Temperature once -> warning behavior
3. Click again -> critical overheat
4. Observe alert panel + card + digital twin + logs update in real time
5. Trigger Power Failure and Fire Alert for multi-system incident simulation
6. Resolve alerts and watch active queue decrease

## Notes

- Backend emits live events for systems, alerts, and logs
- Alert deduplication prevents duplicate active incidents for same rule code
- Telemetry tick runs every 5 seconds for realism

## Deploy On Render

This repository includes a Render blueprint file: `render.yaml`.

### Option A: Blueprint Deploy (Recommended)

1. Push this repository to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select this repository and deploy.
4. Set these environment variables when prompted:

- `MONGODB_URI` = your MongoDB Atlas connection string
- `CLIENT_ORIGIN` = your final Render URL (example: `https://aerobridge-command-center.onrender.com`)

### Option B: Manual Web Service

Use the following values in Render:

- Runtime: `Node`
- Build Command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- Start Command: `cd backend && npm run start`

Environment variables:

- `NODE_ENV=production`
- `PORT=4000`
- `MONGODB_URI=<your atlas uri>`
- `CLIENT_ORIGIN=<your render app url>`

After deployment, open your Render URL to view the interactive dashboard.