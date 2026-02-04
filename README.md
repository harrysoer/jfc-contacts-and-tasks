# JFC Contacts & Tasks

A [Next.js](https://nextjs.org) project for managing contacts, businesses, and tasks.

## Prerequisites

Before running this project locally, ensure you have the following installed:

- **Node.js** (v18 or later recommended)
- **npm** (or yarn/pnpm/bun)
- **PostgreSQL** database

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgres://[user]:[password]@[host]:[port]/[database]?sslmode=require"
JWT_SECRET="your-long-random-secret-key"
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. Can use a local PostgreSQL instance or a cloud database service. |
| `JWT_SECRET` | Secret key for signing JWT tokens. Should be a long, random string (32+ characters recommended). |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run Prisma migrations and generate

Apply database migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. (Optional) Seed the database

Populate the database with sample data:

```bash
npx tsx prisma/seed.ts
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Documentation

- [Authentication Flow](docs/auth-flow.md) - JWT authentication setup guide
- [ER Diagram](docs/erDiagram.md) - Entity relationship diagram

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
