# Go Game 🎮

A frontend web app connecting players with game companions for paid play sessions — think a marketplace for finding someone to duo/queue with, by game, skill level, and price.

[**[Live Demo](#)** *https://kayson03.github.io/Go-Game-Game-Companion-Website-/*]

## Features

- **Role-based dashboard** — one login flow, two experiences: Players browse companions, Companions manage their own listings, all driven by a single `dashboard.html`
- **Browse & filter** — search by game name, filter by title, sort by price or rating
- **Detailed profile modal** — region, languages spoken, past reviews from other users, per companion
- **Booking system** — pick a session date, book it, view/cancel it under "My Bookings"
- **Service management** (Companion role) — publish new services, remove existing ones
- **Persistent state** — bookings and published services are saved with `localStorage`, so data survives a page refresh

## Tech Stack

- HTML5, CSS3 (no framework — hand-rolled layout using Flexbox/Grid)
- Vanilla JavaScript (no framework — DOM manipulation, event listeners, array methods like `map`/`filter`/`sort`)
- `localStorage` for client-side persistence (this is a frontend-only prototype — see Roadmap below)

## Project Structure

```
go-game/
├── index.html       # Login / Register page
├── dashboard.html    # Main app shell — role-based view (Player vs Companion)
├── style.css         # Shared base styles (reset, auth forms)
├── main.css           # Dashboard-specific styles (navbar, cards, modal)
├── script.js          # Login/register logic + mock auth
└── main.js             # Dashboard logic — rendering, filtering, booking, publishing
```

## Running Locally

No build step required — it's plain HTML/CSS/JS.

```bash
git clone https://github.com/<your-username>/go-game.git
cd go-game
```

Then just open `index.html` in your browser (or use a tool like VS Code's Live Server extension for auto-reload during development).

## Try It Out

- Register a new account and pick a role (**Player** or **Game Companion**) to see the two different dashboards
- As a Player: browse companions, click **View Details** to see their profile and reviews, then book a session
- As a Companion: use the **Publish a New Service** form to list a service, and manage your listings

## Roadmap

This is currently a frontend-only prototype using fake/mock data and `localStorage`. Planned next steps:

- [ ] Real backend (FastAPI + PostgreSQL) for persistent, multi-device data
- [ ] Proper authentication (hashed passwords, sessions/JWT)
- [ ] Real-time chat between players and companions
- [ ] Payment integration (Stripe) for booking sessions
- [ ] Companion-side view of incoming booking requests

## Author

Built by Kai Qian as a portfolio project while transitioning from data science into software engineering.
