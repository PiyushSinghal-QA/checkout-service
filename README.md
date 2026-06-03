# checkout-service

A small **NestJS REST API + storefront UI** — the target application for the AutoFix AI demo.
Stakeholders can browse products, add to a cart, and check out from a real web page; QA and the
AutoFix agent exercise it over its HTTP API.

## Run it

```bash
npm install
npm start          # → http://localhost:3000
```

Open **http://localhost:3000** for the storefront. Browse → add to cart → place order → see the
confirmation with the full price breakdown.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | liveness |
| GET | `/products` | product catalogue |
| GET | `/cart/:id` | fetch a cart |
| POST | `/cart/:id/items` | add an item |
| POST | `/checkout` | price the cart, take payment, return an order |

## Seeded bugs

`main` is clean. Five `bug/*` branches each introduce exactly one defect, so the
**checkout-e2e** suite has something to catch and **autofix-agent** has something to fix:

`bug/null-check` · `bug/typo` · `bug/wrong-import` · `bug/missing-validation` · `bug/unhandled-error`

Rebuild the branches any time with `npm run seed:bugs`.

## Related repos

- **checkout-e2e** — the Playwright black-box test suite that runs against this app.
- **autofix-agent** — detects a failing test, fixes this repo, and opens a pull request.
