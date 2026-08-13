# AXiM Neon Chess

React chess game served by a Cloudflare Worker at
`https://axim.us.com/games/neon-chess`.

## Deployment

The Worker serves the Vite build from the `/games/neon-chess/` path and provides
the same-origin chess move and match telemetry endpoints. Match aggregates are
written to the `axim_neon_chess` Workers Analytics Engine dataset.

```sh
npm run deploy:dry-run
npm run deploy
```

The configured Cloudflare account must control the `axim.us.com` zone and have
an existing proxied DNS record for `axim.us.com`.
