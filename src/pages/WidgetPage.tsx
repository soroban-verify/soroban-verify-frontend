import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Network, VerificationRecord } from '../types/verification'
import { getVerification } from '../lib/api'
import TrustBadge from '../components/TrustBadge'

/**
 * Embeddable iframe widget for the /widget/:network/:contractId route
 * (issue #6).
 *
 * Design constraints:
 *  - Self-contained, NO Layout (no nav/header/footer). The route is
 *    registered outside the Layout wrapper in App.tsx on purpose.
 *  - Sized for a 320 × 80 px iframe viewport. Stays inside that box for
 *    a typical contract ID; truncates the ID aggressively if a parent
 *    picks a smaller size.
 *  - Reads live trust tier via `getVerification()` so the widget always
 *    reflects the current record — including revocations.
 *  - "View full details" link opens the full contract page in the parent
 *    window so the iframe frame never tries to host the rich detail UI.
 */
export default function WidgetPage() {
  const { network, contractId } = useParams<{ network: Network; contractId: string }>()
  // `undefined` = loading; `null` = not found / error; `record` = success.
  // Distinguishing `null` from `undefined` lets us render an explicit
  // "Not verified" message that is honest about what is and isn't known,
  // rather than flashing "Loading…" forever.
  const [record, setRecord] = useState<VerificationRecord | null | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!network || !contractId) {
      setRecord(null)
      return
    }
    let cancelled = false
    setRecord(undefined)
    setErrorMessage(null)
    getVerification(contractId, network)
      .then((r) => {
        if (!cancelled) setRecord(r)
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setErrorMessage(e.message)
          setRecord(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [network, contractId])

  return (
    // The widget lives inside its own iframe at 320 × 80 px. We deliberately
    // do NOT apply `min-h-screen` / `w-screen` from the host app's body —
    // those are tuned for the parent site's layout, not for an embed.
    // Instead we constrain to the typical badge size, hide overflow, and
    // let flexbox center the row.
    <div className="flex h-20 w-full items-center justify-center overflow-hidden bg-slate-50 p-3 text-slate-900 antialiased">
      <div className="flex w-full max-w-[296px] items-center justify-between gap-2">
        <Body record={record} errorMessage={errorMessage} network={network} contractId={contractId} />
      </div>
    </div>
  )
}

function Body({
  record,
  errorMessage,
  network,
  contractId,
}: {
  record: VerificationRecord | null | undefined
  errorMessage: string | null
  network: Network | undefined
  contractId: string | undefined
}) {
  if (record === undefined) {
    return (
      <>
        <p className="text-[11px] text-slate-500">Loading…</p>
        <LinkPlaceholder />
      </>
    )
  }

  if (record === null) {
    return (
      <>
        <p className="truncate text-[11px] text-slate-600">
          {errorMessage
            ? `Error: ${truncate(errorMessage, 36)}`
            : network && contractId
              ? 'Not verified'
              : 'Invalid widget URL'}
        </p>
        <LinkPlaceholder />
      </>
    )
  }

  const truncated =
    `${record.contractId.slice(0, 6)}…${record.contractId.slice(-6)}`
  const detailsHref = network
    ? `${window.location.origin}/contract/${network}/${record.contractId}`
    : `/contract/${record.network}/${record.contractId}`

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <TrustBadge tier={record.trustTier} />
        <code
          className="truncate font-mono text-[10px] text-slate-600"
          title={record.contractId}
        >
          {truncated}
        </code>
      </div>
      <a
        href={detailsHref}
        target="_top"
        rel="noreferrer"
        className="shrink-0 whitespace-nowrap rounded-md bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
      >
        View details
      </a>
    </>
  )
}

function LinkPlaceholder() {
  return <span className="shrink-0 text-[10px] text-slate-400">·</span>
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
