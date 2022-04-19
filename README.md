# crux

Based on the Indie [Remix Stack](https://remix.run/stacks).

## Development
Install:
```bash
npm install
```

You'll need a running Redis server (easiest is to install and start it locally).
Then copy `.env.example` to `.env`, editing the `REDIS_URL` if needed.

Run dev server:
```bash
npm run dev
```

### Relevant code
Everything interesting is in [app/](app/).

## Deployment
Deploying the [Dockerfile](./Dockerfile) automatically from Render.

There is a Redis cluster running on Render, with the `REDIS_URL` environment variable specified in the dashboard.

## Testing
### Cypress
End-to-end Cypress tests are in `cypress/`.

Run with:
```bash
npm run test:e2e:dev
```

### Vitest
Some units tests are configured in `*.test.ts/tsx` files.

Run with:
```bash
npm run test
```

### Type Checking
TypeScript FTW.
```bash
npm run typecheck
```

### Linting and formatting
This project uses ESLint for linting. That is configured in `.eslintrc.js`.

[Prettier](https://prettier.io/) handles auto-formatting in this project.

If they aren't done automatically by your editor, you can do both with:
```bash
npm run lint
npm run format
```
