import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Network, VerificationRecord } from '../types/verification'
import { DEFAULT_LIST_LIMIT, listVerifications } from '../lib/api'
import { useNetwork } from '../contexts/NetworkContext'
import TrustBadge from '../components/TrustBadge'

type ExplorerNetwork = Network | 'all'

export default function ExplorerPage() {
  const { network: preferredNetwork, setNetwork: setPreferredNetwork } = useNetwork()
  const [searchParams] = useSearchParams()
  // Allow `?limit=N` in the URL for manual QA (e.g. ?limit=1 walks all 3
  // fixtures through pagination one at a time). Anything that doesn’t parse
  // as a positive integer falls back to the default page size.
  const urlLimit = useMemo(() => {
    const raw = searchParams.get('limit')
    const parsed = raw ? parseInt(raw, 10) : NaN
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIST_LIMIT
  }, [searchParams])
  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [query, setQuery] = useState('')
  // 'all' is an explorer-only filter layered on top of the app-level network
  // preference — keeps the existing "all networks" view intact.
  const [filterNetwork, setFilterNetwork] = useState<ExplorerNetwork>(preferredNetwork)
  const [cursor, setCursor] = useState<string | null>(null)
  // Stack of prior cursors so the Previous control can pop back. Reset
  // alongside `cursor` whenever a filter changes.
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listVerifications({
      network: filterNetwork === 'all' ? undefined : filterNetwork,
      query: query || undefined,
      cursor: cursor ?? undefined,
      limit: urlLimit,
    })
      .then((r) => {
        if (!cancelled) {
          setRecords(r.records)
          setNextCursor(r.nextCursor)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query, filterNetwork, cursor, urlLimit])

  function handleFilterChange(next: ExplorerNetwork) {
    setFilterNetwork(next)
    // Keep the app-level network preference in sync when the user narrows the
    // explorer to a specific network — the header selector and the explorer
    // filter should not disagree.
    if (next !== 'all') setPreferredNetwork(next)
    // Any filter change resets pagination to page 1.
    setCursor(null)
    setCursorHistory([])
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    // Query change resets pagination to page 1 so the user isn’t left on
    // page 4 of a result set that no longer applies.
    setCursor(null)
    setCursorHistory([])
  }

  const goToCursor = useCallback(
    (next: string | null) => {
      setCursorHistory((history) => [...history, cursor])
      setCursor(next)
    },
    [cursor],
  )

  // Compute previous cursor from the latest history snapshot. We deliberately
  // do NOT call setCursor from inside setCursorHistory's updater fn — React
  // may invoke updater fns twice in strict mode, and coupling the two
  // setters that way would desynchronise cursor and history.
  const goBack = useCallback(() => {
    if (cursorHistory.length === 0) return
    const previous = cursorHistory[cursorHistory.length - 1]
    setCursor(previous)
    setCursorHistory(cursorHistory.slice(0, -1))
  }, [cursorHistory])

  const offset = cursor ? Math.max(0, parseInt(cursor, 10) || 0) : 0
  const rangeStart = records.length === 0 ? 0 : offset + 1
  const rangeEnd = offset + records.length

  return (
    <div>
      <h1 className="text-2xl font-bold">Verification explorer</h1>
      <p className="mt-1 text-sm text-slate-600">
        Searchable index of verified contracts, including revocation history.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search by contract ID or repo…"
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={filterNetwork}
          onChange={(e) => handleFilterChange(e.target.value as ExplorerNetwork)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All networks</option>
          <option value="mainnet">Mainnet</option>
          <option value="testnet">Testnet</option>
        </select>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : (
        <>
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Contract</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Trust tier</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/contract/${r.network}/${r.contractId}`}
                      className="font-mono text-xs text-indigo-600 hover:underline"
                    >
                      {r.contractId.slice(0, 8)}…{r.contractId.slice(-6)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.network}</td>
                  <td className="px-4 py-3">
                    <TrustBadge tier={r.trustTier} />
                    {r.status === 'revoked' && (
                      <span className="ml-2 text-xs font-semibold text-red-600">revoked</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700">
                      {r.sourceRepo.replace('https://github.com/', '')}
                    </span>
                    <span className="ml-1 font-mono text-xs text-slate-400">
                      @{r.commit.slice(0, 7)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.verifiedAt ? new Date(r.verifiedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No verifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p>
            Showing <span className="font-semibold text-slate-800">{rangeStart}–{rangeEnd}</span>
            {' '}· page size {urlLimit}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={cursorHistory.length === 0 || loading}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => nextCursor && goToCursor(nextCursor)}
              disabled={!nextCursor || loading}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
