import { useEffect, useState } from 'react'
import {
  connectWallet,
  isFreighterAvailable,
  signOwnershipClaim,
} from '../lib/freighter'
import { submitOwnershipClaim } from '../lib/api'

type ClaimPhase = 'idle' | 'connecting' | 'signing' | 'submitting' | 'success' | 'error'

interface OwnershipClaimPanelProps {
  verificationId: string
  contractId: string
}

/**
 * Panel that lets a project owner sign an ownership claim over a
 * verification record using the Freighter browser wallet (issue #3).
 *
 * Visibility: the entire panel is hidden when Freighter is not detected
 * (no installed extension, or the API is unavailable). We check once on
 * mount via `isFreighterAvailable()`; the resolved boolean gates render.
 *
 * State machine: idle → connecting → signing → submitting → success | error.
 * Each transition surfaces an `aria-live="polite"` status message so screen
 * readers announce progress and outcome.
 */
export default function OwnershipClaimPanel({
  verificationId,
  contractId,
}: OwnershipClaimPanelProps) {
  const [available, setAvailable] = useState<boolean | null>(null)
  const [phase, setPhase] = useState<ClaimPhase>('idle')
  const [signerAddress, setSignerAddress] = useState<string | null>(null)
  const [claimId, setClaimId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    isFreighterAvailable().then((ok) => {
      if (!cancelled) setAvailable(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleClaim() {
    setErrorMessage(null)
    setClaimId(null)
    try {
      setPhase('connecting')
      const address = await connectWallet()
      setSignerAddress(address)

      setPhase('signing')
      const signed = await signOwnershipClaim(verificationId, contractId)

      setPhase('submitting')
      const { id } = await submitOwnershipClaim(verificationId, {
        signerAddress: signed.signerAddress,
        signedMessage: signed.signedMessage,
      })

      setClaimId(id)
      setPhase('success')
    } catch (e) {
      setErrorMessage((e as Error).message || 'Unknown error')
      setPhase('error')
    }
  }

  function handleReset() {
    setPhase('idle')
    setErrorMessage(null)
    setSignerAddress(null)
    setClaimId(null)
  }

  // While we're still checking for Freighter, render nothing so the panel
  // doesn't flash in and out.
  if (available !== true) return null

  const busy = phase === 'connecting' || phase === 'signing' || phase === 'submitting'

  return (
    <section
      aria-labelledby="ownership-claim-heading"
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 id="ownership-claim-heading" className="text-base font-semibold">
        Ownership claim
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Are you the deployer of this contract? Sign a message with Freighter to
        attest ownership of this verification record. Reading is always
        permissionless — only signing requires a wallet.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleClaim}
          disabled={busy || phase === 'success'}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {phase === 'idle' || phase === 'error'
            ? 'Claim ownership'
            : phase === 'connecting'
              ? 'Connecting…'
              : phase === 'signing'
                ? 'Signing…'
                : phase === 'submitting'
                  ? 'Submitting…'
                  : 'Claimed ✔'}
        </button>

        {phase === 'success' && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Sign again
          </button>
        )}
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-3 min-h-[1.25rem] text-sm"
      >
        {phase === 'connecting' && 'Requesting Freighter access…'}
        {phase === 'signing' && 'Awaiting your signature in Freighter…'}
        {phase === 'submitting' && 'Submitting signed claim…'}
        {phase === 'success' && signerAddress && (
          <span className="text-emerald-700">
            ✔ Claim submitted by{' '}
            <code className="font-mono text-xs">{signerAddress}</code>
            {claimId && (
              <>
                {' '}— claim id <code className="font-mono text-xs">{claimId}</code>
              </>
            )}
          </span>
        )}
        {phase === 'error' && errorMessage && (
          <span className="text-red-700">
            <strong>Claim failed:</strong> {errorMessage}
          </span>
        )}
      </p>
    </section>
  )
}
