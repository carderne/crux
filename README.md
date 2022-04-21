# crux
A simple web-app to split a group of people into pairs with optimal levels of disagreement for [Double Crux](https://www.rationality.org/resources/updates/2016/double-crux) exercises!

## Algorithms
The app uses a simple greedy algorithm to create the pairs, which often won't be optimal.

A better solution is in [api/](api/), using Mixed-Integer Linear Programming.
This calculates the best disagreement based on maximising the maximum disagreement, maximising the minimum disagreement, or maximising the average disagreement, and is actually optimal! 🚀
The MILP API is available at [this endpoint](https://crux-milp-api.onrender.com/docs).

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

If you want the app to use the MILP backend, you must also run that server:
```bash
npm run api
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
