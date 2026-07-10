/**
 * Explorer-facing integration docs: how Stellar Expert, StellarChain, and
 * wallets consume the public API. The RFP requires the service to expose what
 * explorers need while leaving their UI work to them.
 */
export default function IntegrationDocsPage() {
  return (
    <div className="prose prose-slate mx-auto max-w-3xl prose-pre:bg-slate-900">
      <h1 className="text-2xl font-bold">Integrating with soroban-verify</h1>
      <p className="mt-2 text-slate-600">
        Explorers, wallets, and CI pipelines consume verification status
        through the public REST API or directly from the on-chain verification
        registry. Reading never requires authentication or a wallet.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Look up a contract’s verification status</h2>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-100">
{`GET /v1/contracts/{network}/{contractId}/verification

{
  "status": "verified",
  "trustTier": "trusted",
  "sourceRepo": "https://github.com/org/project",
  "commit": "abc123…",
  "onChainWasmHash": "…",
  "rebuiltWasmHash": "…",
  "verifiedAt": "2026-06-28T14:19:42Z",
  "revokedAt": null
}`}
      </pre>

      <h2 className="mt-8 text-lg font-semibold">Trust tiers — render them faithfully</h2>
      <p className="mt-2 text-sm text-slate-600">
        Verification is not a binary flag. Please surface the tier, not just a
        checkmark — a <code>deployer</code>-tier reproduction is materially
        weaker than a <code>trusted</code>-tier one, because a hostile build
        image can deterministically rewrite bytes and still pass
        byte-comparison. Rendering all tiers as one green check would be a
        false signal to users.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Query the registry contract trustlessly</h2>
      <p className="mt-2 text-sm text-slate-600">
        Verification results are also attested on-chain in the
        <code> verification_registry</code> contract, so other Soroban
        contracts and fully trustless integrations can query status without
        touching this service at all.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Revocations</h2>
      <p className="mt-2 text-sm text-slate-600">
        Verifications can be revoked (for example after a spec-tracking change
        or a discovered build-image compromise). Poll the API or subscribe to
        registry events rather than caching a one-time result indefinitely.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Badges</h2>
      <p className="mt-2 text-sm text-slate-600">
        Live SVG badges are available at{' '}
        <code>/v1/badge/{'{network}'}/{'{contractId}'}.svg</code> and always
        reflect current status.
      </p>
    </div>
  )
}
