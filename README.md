# SpacePulse AI

> **"What is happening above you right now, and why should you care?"**

SpacePulse AI is a real-time space weather intelligence platform that turns complex astronomical data into personalized, profession-aware insights. Built for pilots, photographers, farmers, researchers, and everyday people — not just astronomers.

---

## What It Does

Most space weather platforms answer **"what happened?"**  
SpacePulse AI answers **"why should I care?"**

Select your profession, and our Groq-powered AI engine cross-references live space weather events with your specific context to generate a personalized impact score, plain-English summary, and actionable recommendation — in under a second.

---
## Screenshots

### Landing Page
![Landing](assets/screenshots/hero.png)

### Dashboard — Mission Control
![Dashboard](assets/screenshots/1.png)
![Dashboard Impact](assets/screenshots/2.png)

### AI Impact Analysis
![Impact](assets/screenshots/3.png)
![Heatmap](assets/screenshots/4.png)

### Sky Feed
![Sky Feed](assets/screenshots/5.png)

### AI Night Planner
![Night Planner](assets/screenshots/6.png)
![Planner Timeline](assets/screenshots/7.png)

### Sky Chart
![Sky Chart](assets/screenshots/8.png)

---

## Features

- **Live Space Weather Dashboard** — Real-time Kp Index, solar flares, CMEs, and geomagnetic storm data from NOAA SWPC and NASA DONKI
- **AI Impact Engine** — Groq Llama 3 generates profession-aware impact scores and recommendations
- **ISS Live Tracker** — Real-time International Space Station position and next pass time for your location
- **Sky Feed** — Tonight's viewing conditions, visible planets, moon phase, and upcoming events based on your GPS location
- **AI Night Planner** — Ask our AI to build a custom sky-watching schedule for tonight
- **Sky Chart** — Live interactive star map powered by Stellarium Web, calibrated to your location
- **AI Assistant** — Chat with SpacePulse AI about space weather, astronomy, and what's visible tonight

---

## Tech Stack

### Frontend
- Next.js 15 (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Recharts (heatmap visualization)
- Orbitron + Inter (Google Fonts)

### Backend
- Node.js + Express
- MongoDB Atlas + Mongoose

### AI
- Groq API + Llama 3 (impact engine, night planner, assistant)

### Data Sources (all free)
| Source | Data |
|---|---|
| NOAA SWPC | Kp Index, geomagnetic activity |
| NASA DONKI | Solar flares, CMEs, geomagnetic storms |
| Where The ISS At API | Real-time ISS position and pass times |
| Open-Meteo | Cloud cover, visibility, weather |
| Nominatim (OpenStreetMap) | Reverse geocoding |
| Stellarium Web (GPL v2) | Interactive sky chart |

---

## Project Structure

```
spacepulse-ai/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Mission Control
│   │   ├── sky-feed/          # Tonight's sky
│   │   ├── planner/           # AI Night Planner
│   │   ├── locator/           # Sky Chart (Stellarium)
│   │   └── assistant/         # AI Chat
│   ├── components/            # Reusable UI components
│   ├── context/               # React context
│   └── public/                # Static assets
│
├── backend/
│   └── src/
│       ├── services/
│       │   ├── noaaService.js        # NOAA Kp Index
│       │   ├── nasaService.js        # NASA solar flares + CMEs
│       │   ├── celestrakService.js   # ISS live position
│       │   ├── weatherService.js     # Open-Meteo weather
│       │   ├── aggregateEvents.js    # Combines all data sources
│       │   ├── impactEngine.js       # Groq AI impact scoring
│       │   ├── skyPlanner.js         # Groq AI night planner
│       │   └── aiService.js          # Groq AI assistant
│       ├── controllers/
│       ├── middleware/
│       └── utils/
│
├── models/                    # MongoDB schemas
│   ├── User.js
│   └── Observation.js
│
├── routes/                    # Express API routes
│   ├── events.js              # GET /api/events
│   ├── impact.js              # POST /api/impact
│   ├── weather.js             # GET /api/weather
│   ├── satellites.js          # GET /api/satellites
│   └── assistant.js           # POST /api/assistant
│
└── server.js                  # Express entry point
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Groq API key (free at console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/sid-skippy/spacepulse-ai
cd spacepulse-ai
```

### 2. Set up environment variables
Create a `.env` file at the root:
```
GROQ_API_KEY=your_groq_key
NASA_API_KEY=DEMO_KEY
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 3. Install and run the backend
```bash
npm install
node server.js
```

### 4. Install and run the frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events?lat=&lon=` | Live space weather + ISS + weather |
| POST | `/api/impact` | AI impact score for a profession |
| GET | `/api/weather?lat=&lon=` | Local cloud cover and visibility |
| GET | `/api/satellites?lat=&lon=` | ISS next pass time |
| POST | `/api/assistant` | AI night planner |

---

## Open Source Credits

- **Stellarium Web** — Live sky chart (GPL v2) · [stellarium-web.org](https://stellarium-web.org)
- **NOAA SWPC** — Space weather data (public domain)
- **NASA DONKI** — Solar event data (public domain)
- **Where The ISS At** — ISS position API (public domain)
- **Open-Meteo** — Weather data (CC BY 4.0)
- **Nominatim / OpenStreetMap** — Geocoding (ODbL)

---

## Team

**Team PaperRex** · ArcNight Hackathon 2026

| Member | Role |
|---|---|
| Sourja Bose | Team Lead · Backend |
| Abhishek Paul | AI Engine |
| Kushaagra Sood | Space Data |
| Siddhartha Gupta | Frontend |

---

## License

MIT License · © 2026 Team PaperRex
