<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Admin e-commerce backend built with NestJS and Supabase (PostgreSQL, Auth, Storage).  
This app exposes admin-only REST APIs for auth, RBAC, users, catalog (brands, categories, products, variants), inventory, media, reviews, settings, and audit logs.

## 1. Project setup

```bash
# from /backend
npm install
```

### Environment variables

Create a `.env` file in `backend/` with at least:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

PORT=3000
NODE_ENV=development

# optional: used by the seed script to create/link a super admin user
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
```

> `SUPABASE_SERVICE_ROLE_KEY` must be the **service role key** from Supabase (never expose it to the frontend).

## 2. Database schema (Supabase)

The full database schema is defined in:

- `supabase/migrations/0001_schema.sql`

Apply it in Supabase:

1. Open Supabase → SQL Editor.
2. Create a new query.
3. Paste the contents of `supabase/migrations/0001_schema.sql`.
4. Run the query and verify it succeeds.

## 3. Seed roles, permissions, and super admin user

The seed script:

- Creates/updates all core **permissions** (auth, users, RBAC, catalog, inventory, media, reviews, settings, audit logs).
- Creates/updates core **roles**: `super_admin`, `admin`, `staff`.
- Populates `role_permissions` according to a sensible default matrix.
- Creates/updates a `users` row and links it to `super_admin` (using `ADMIN_EMAIL`).
- Creates or verifies a Supabase Auth user for the same email with `ADMIN_PASSWORD`.

Run from `backend/`:

```bash
# make sure .env is configured and 0001_schema.sql has been applied

npm run seed
```

By default (if env vars are not set), the script will create:

- Supabase Auth user: `admin@example.com`
- Password: `Admin123!`

and ensure:

- A matching row exists in the local `users` table.
- That user is linked to the `super_admin` role via `user_roles`.

You can override these defaults with env vars:

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=YourStrongPassword123!
```

## 4. Compile and run the project

```bash
# development (watch mode)
npm run start:dev

# single-run development
npm run start

# production build and run
npm run build
npm run start:prod
```

- API base URL: `http://localhost:3000/api/v1`
- Swagger docs: `http://localhost:3000/api/docs`

## 5. Authentication & testing APIs

1. After seeding, log in with the super admin credentials (either the defaults or your env override).
2. Call the login endpoint:

```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

3. Use the returned `accessToken` as a Bearer token:

```http
Authorization: Bearer <accessToken>
```

4. Test any secured endpoint, for example:

- `GET /api/v1/users`
- `GET /api/v1/brands`
- `GET /api/v1/products`
- `GET /api/v1/inventory`

## 6. Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
