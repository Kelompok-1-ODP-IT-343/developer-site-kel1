This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment configuration (switch remote/local easily)

The app is configured to use a shared `.env` with sane defaults and per-developer overrides in `.env.local`.

1) Defaults in `.env` (committed)

```
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_CREDIT_SCORE_API_URL=/credit-api
API_PROXY_TARGET_CORE=https://local-dev.satuatap.my.id/api/v1
API_PROXY_TARGET_CREDIT=https://local-dev.satuatap.my.id/api/v1
```

This makes the browser call `/api/v1` and `/credit-api` (same-origin). Next.js proxies them to the remote backend, avoiding CORS.

2) Local overrides in `.env.local` (git-ignored)

Uncomment to use localhost backends:

```
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_CREDIT_SCORE_API_URL=/credit-api
API_PROXY_TARGET_CORE=http://localhost:18080/api/v1
API_PROXY_TARGET_CREDIT=http://localhost:9009/api/v1
```

3) Apply changes

- Restart dev server after editing env files.
- If you set `NEXT_PUBLIC_API_URL` to an absolute external URL instead of a relative path, ensure your backend CORS allows `http://localhost:3000`. Using relative paths with the proxy is recommended to avoid CORS setup.

## Authentication and Refresh Tokens

- The app expects the backend to return `token` (access token) and `refreshToken` on successful login/OTP verification.
- Access tokens are attached to API calls via an Axios interceptor in `src/lib/coreApi.ts`.
- When an API call returns 401, the interceptor attempts to refresh using `/auth/refresh` with body `{ refreshToken }`.
- Refresh tokens are treated with a 24-hour lifetime on the client. We store a `refresh_expires_at` timestamp and stop refreshing after it elapses; users are redirected to `/login`.
- Logout clears both tokens and the refresh metadata.

Endpoints used (relative to `NEXT_PUBLIC_API_URL`):

- `POST /auth/login` or `POST /auth/verify-otp` to obtain tokens
- `POST /auth/refresh` to refresh the access token
- `POST /auth/logout` to end the session

If the refresh endpoint also returns a new `refreshToken`, it will be persisted and the 24-hour window is reset.
