# Rostrum — Live Auction Platform

**Real-time live auctions with WebRTC video, WebSocket bidding, and event-driven architecture.**

Rostrum is a full-stack auction platform built to deeply explore real-time systems: WebSockets, WebRTC, Server-Sent Events, Redis pub/sub, Kafka-based event streaming, and the outbox pattern.

> **Live Demo**: [https://rostrum-auction-platform.vercel.app](https://rostrum-auction-platform.vercel.app)
>
> **Note:** The backend is hosted on Render’s free tier. If the service has been idle, it may take 30–60 seconds to spin up on the first request. You might see “Reconnecting…” or delayed updates until the server wakes up.

---

## Features

- **Live Bidding** — Real-time bid placement and updates over WebSockets
- **Seller Video Stream** — WebRTC-powered “Trading Floor” so bidders can see the seller live
- **Price Ticker & Chart** — Live price updates (SSE/Redis) + interactive chart (lightweight-charts)
- **Order Book** — Scrollable bid history for each room
- **Room Lifecycle** — Background worker manages start/end of auctions
- **Event-Driven Core** — Kafka topics + transactional outbox for bids, auction wins, orders, notifications, and analytics
- **Authentication** — JWT-based auth with role support (buyer/seller)
- **Modern UI** — Clean dark theme, countdown timers, responsive room pages

---

## Tech Stack

| Layer              | Technologies                                      |
|--------------------|---------------------------------------------------|
| **Frontend**       | Next.js 16, React 19, TypeScript, Tailwind CSS, lightweight-charts |
| **Backend**        | FastAPI (async), SQLAlchemy 2 (async), Alembic, Pydantic |
| **Real-time**      | WebSockets, WebRTC, Server-Sent Events, Redis pub/sub |
| **Messaging**      | Apache Kafka (outbox pattern + workers)           |
| **Database**       | PostgreSQL                                        |
| **Auth**           | JWT (python-jose), password hashing (pwdlib/bcrypt) |
| **Infra / Deploy** | Vercel (frontend), Render (backend – free tier), Redis, Kafka, PostgreSQL |

---

## Architecture Overview

```
┌─────────────────┐       HTTP / WS / SSE        ┌──────────────────────┐
│                 │ ◄──────────────────────────► │                      │
│  Next.js Client │                              │   FastAPI Backend    │
│  (Vercel)       │                              │                      │
└─────────────────┘                              └──────────┬───────────┘
                                                            │
                     ┌──────────────────────────────────────┼──────────────────────────┐
                     │                                      │                          │
                     ▼                                      ▼                          ▼
              ┌─────────────┐                        ┌─────────────┐           ┌──────────────┐
              │   Redis     │                        │ PostgreSQL  │           │    Kafka     │
              │ (pub/sub +  │                        │  (source of │           │  (events +   │
              │ connections)│                        │   truth)    │           │   outbox)    │
              └─────────────┘                        └─────────────┘           └──────┬───────┘
                                                                                      │
                                                                                      ▼
                                                                            ┌─────────────────┐
                                                                            │ Background      │
                                                                            │ Workers         │
                                                                            │ (orders,        │
                                                                            │  notifications, │
                                                                            │  analytics)     │
                                                                            └─────────────────┘
```

**Key design decisions:**
- Redis-backed connection managers for both bid WebSockets and WebRTC signaling
- Transactional outbox pattern so domain events are reliably published to Kafka
- Separate room lifecycle background task
- SSE endpoint for the price ticker (lightweight alternative to another WebSocket)

---

## Project Structure

```
Rostrum---Auction-Platform/
├── auction-backend/          # FastAPI application
│   ├── app/
│   │   ├── api/v1/           # REST + WebSocket + SSE routes
│   │   ├── core/             # Config, security
│   │   ├── db/               # Database session & models setup
│   │   ├── events/           # Kafka producer + outbox
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic (room lifecycle, etc.)
│   │   ├── sse/              # Server-Sent Events
│   │   ├── workers/          # Kafka consumers (orders, notifications, analytics)
│   │   ├── ws/               # WebSocket connection managers (bids + WebRTC)
│   │   └── main.py
│   ├── alembic/              # Migrations
│   └── pyproject.toml
│
├── auction-frontend/         # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # BidPanel, OrderBook, PriceChart, VideoRoom, Countdown...
│   │   ├── hooks/            # Custom hooks (WebSocket, ticker, etc.)
│   │   ├── lib/              # API client, utils
│   │   └── types/
│   └── package.json
│
├── LICENSE                   # MIT
└── README.md
```

---

## Getting Started

### Prerequisites
- Python ≥ 3.12
- Node.js ≥ 18
- PostgreSQL
- Redis
- Kafka (optional for full event pipeline; can be mocked/disabled for basic local run)

### Backend

```bash
cd auction-backend

# Install dependencies (uv recommended)
uv sync
# or: pip install -r requirements.txt

# Create .env (see variables below)
cp .env.example .env   # if you add one

# Run migrations
uv run alembic upgrade head

# Start the API
uv run fastapi dev
# → http://localhost:8000
```

**Required environment variables** (backend):

```env
APP_NAME=Rostrum
ENV=development
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/rostrum
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=["http://localhost:3000"]
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
# Optional WebRTC TURN credentials if you want better connectivity
```

### Frontend

```bash
cd auction-frontend

npm install
# or pnpm / yarn / bun

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8000" >> .env.local

npm run dev
# → http://localhost:3000
```

---

## Key Technical Highlights

- **WebSocket Connection Manager** — Redis-backed so multiple backend instances can share connection state and broadcast bids.
- **WebRTC Signaling** — Dedicated manager + ICE config endpoint; STUN by default, TURN optional.
- **Transactional Outbox** — Domain events written in the same DB transaction as the bid/auction state change, then relayed to Kafka.
- **Room Lifecycle Worker** — Background asyncio task that starts and closes rooms on schedule.
- **Price Ticker** — SSE stream per room for efficient one-way price updates.
- **Order Book + Chart** — Frontend consumes live updates and renders both a scrollable history and a price chart.

This project was built incrementally (see commit history) specifically to learn these patterns in a realistic domain.

---

## Known Limitations & Future Work

- **Backend cold starts** — The API is deployed on Render’s free tier, which spins down after inactivity. The first request after idle time can take 30–60 seconds while the server wakes up (you may see “Reconnecting…” in the UI).
- WebRTC works but is not fully production-hardened (TURN server recommended for restrictive networks).
- No real payment / settlement flow yet (orders are recorded).
- Kafka workers and full observability are still evolving.
- Demo data is intentionally playful.
- No automated tests or CI yet.
- Horizontal scaling of WebSocket/WebRTC layers needs further hardening.

Planned improvements:
- Proper payment integration
- Better TURN / media server support
- Admin dashboard
- Rate limiting & anti-snipe protections
- Comprehensive test suite

---

## License

MIT License — see [LICENSE](LICENSE)

---

## Author

Built by [deepakdevfile](https://github.com/deepakdevfile) as a deep-dive into real-time and event-driven systems.

Feel free to open issues or reach out if you want to discuss the architecture.
```