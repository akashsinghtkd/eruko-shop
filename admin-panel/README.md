# Admin Panel (E-commerce Back Office)

Next.js admin UI for the e-commerce backend. Use it to manage catalog (brands, categories, products, variants), inventory, media, users, roles, reviews, settings, and audit logs.

## Setup

1. **Backend**: Run the NestJS API (from `../backend`) so it serves at `http://localhost:3000` and exposes Swagger at `http://localhost:3000/api/docs`.

2. **Env**: Create `.env.local` in this directory with:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
   ```
   If the API runs on another host/port, set this URL accordingly.

3. **Login**: Use the same admin credentials as your backend (e.g. from `npm run seed` in the backend).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) (or the port shown in the terminal; Next.js may use 3001 if 3000 is taken by the API). The app redirects `/` to `/dashboard` and shows `/login` when not authenticated.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
