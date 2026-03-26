 SwiftLnk | High-Performance URL Shortener

SwiftLnk is a full-stack URL shortening service designed for speed and reliability. Built with a distributed architecture, it leverages Redis for sub-millisecond redirects and PostgreSQL for permanent data persistence.

Key Engineering Features

* Cache-Aside Pattern: Integrated Redis to reduce database read load. Redirects are served in $O(1)$ time (~2ms) compared to standard DB lookups (~30ms).
* Atomic Transactions: Uses PostgreSQL ACID transactions during the shortening process to ensure data integrity between the ID generation and Base62 encoding steps.
* Asynchronous Analytics: Click tracking is handled as a background process, ensuring analytics updates never block the user’s redirect experience.
* Base62 Encoding: Custom implementation to convert auto-incrementing database IDs into short, URL-friendly strings (e.g., `12582` becomes `3k6`).

 Tech Stack

* Frontend: React 18, TypeScript, Tailwind CSS, Vite.
* Backend: Node.js, Express, TypeScript.
* Infrastructure: PostgreSQL (Primary DB), Redis (Caching), Docker.

System Architecture

1. Request: User clicks `swiftlnk.com/4`.
2. Cache Check: The server checks Redis for key `4`.
3. Cache Hit: If found, user is redirected immediately (302).
4. Cache Miss: If not in Redis, the server queries PostgreSQL, updates the cache for future hits, and then redirects.
5. Analytics: The click counter is incremented in the background.

 Getting Started

Prerequisites

* Docker & Docker Compose
* Node.js (v18+)

Setup

1. Clone and Install:
git clone "link"
cd SwiftLnk
npm install




2. Launch Infrastructure:

docker-compose up -d



3. Run Development Servers:
* Server: `cd server && npm run dev`
* Client: `cd client && npm run dev`

