# soroban-verify-frontend

The verification explorer and submission wizard for **soroban-verify** — an open-source, hosted contract verification service for Soroban, built on SEP-58 reproducible builds.

**Stack:** React 19 · TypeScript · Vite · TailwindCSS v4 · React Router · Freighter wallet

Designed so that **the frontend is never the trust anchor** — the verification registry contract and the public REST API are. This app is fully static-deployable (no SSR), so community mirrors can self-host it against the public API.

## Surfaces

| Route | Surface |
|---|---|
| `/` | Landing + contract lookup + trust-tier education |
| `/submit` | **Submission wizard** — contract ID → SEP-58 auto-detect → repo/commit/build-config confirmation → live build log (SSE) → result with trust-tier explanation |
| `/explorer` | **Verification explorer** — searchable index of verified contracts (trust tier, source repo, commit, revocations) |
| `/contract/:network/:contractId` | **Contract detail** — on-chain vs. rebuilt hash side-by-side, build environment fingerprint, SEP-55 attestation chain, "reproduce this yourself" command |
| `/badges` | **Embeddable badges & widgets** — live SVG badges for READMEs, iframe widget for project sites |
| `/docs/integrations` | **Explorer-facing integration docs** — how Stellar Expert, StellarChain, and wallets consume the public API |

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `VITE_API_URL` to point at a running soroban-verify API. **When `VITE_API_URL` is unset, the app runs against built-in mock data**, so the UI is fully developable before the backend (M3) exists.

```bash
npm run build     # typecheck + production build (static, to dist/)
npm run lint      # eslint
npm run preview   # serve the production build locally
```

## Project layout

```
src/
├── types/verification.ts    # Domain types: trust tiers, records, SEP-58/SEP-55
├── lib/
│   ├── api.ts               # Public REST API client (mock fallback when no API URL)
│   ├── trust.ts             # Trust-tier definitions + education copy
│   ├── freighter.ts         # Wallet — ownership claims only; reads never need it
│   └── mockData.ts          # Dev fixtures
├── components/              # Layout, TrustBadge, TrustTierExplainer, HashCompare
└── pages/                   # One file per surface (see routes above)
```

## Design decisions

- **Verification-as-education:** the UI always explains what a trust tier means *and what it does not guarantee*. No false green checkmarks — a reproduced build inside an arbitrary deployer image is rendered as weaker than one in an auditable or trusted image.
- **Freighter is used for exactly one thing:** project owners signing an ownership claim over a verification record. Reading is always permissionless.
- **Spec traceability:** UI behavior traces to SEP-58 / SEP-55 or the SCF RFP; if it doesn't, that's a docs bug.

## License

Apache-2.0
