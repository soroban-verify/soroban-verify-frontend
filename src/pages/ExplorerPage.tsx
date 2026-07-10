import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Network, VerificationRecord } from '../types/verification'
import { listVerifications } from '../lib/api'
import { useNetwork } from '../contexts/NetworkContext'
import { useDebounce } from '../hooks/useDebounce'
import TrustBadge from '../components/TrustBadge'

type ExplorerNetwork = Network | 'all'

export default function ExplorerPage() {
  const { network: preferredNetwork, setNetwork: setPreferredNetwork } = useNetwork()
  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [query, setQuery] = useState('')
  // Debounce the search query (issue #2): the input stays bound to `query`
  // for responsive typing, but the API call only fires after the user pauses
  // for 300 ms. The network filter deliberately stays undebounced — it's a
  // discrete selection, not a stream of keystrokes.
  const debouncedQuery = useDebounce(query, 300)
  // 'all' is an explorer-only filter layered on top of the app-level network
  // preference — keeps the existing "all networks" view intact.
  const [filterNetwork, setFilterNetwork] = useState<ExplorerNetwork>(preferredNetwork)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listVerifications({
      network: filterNetwork === 'all' ? undefined : filterNetwork,
      query: debouncedQuery || undefined,
    })
      .then((r) => {
        if (!cancelled) setRecords(r)
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
  }, [debouncedQuery, filterNetwork])

  function handleFilterChange(next: ExplorerNetwork) {
    setFilterNetwork(next)
    // Keep the app-level network preference in sync when the user narrows the
    // explorer to a specific network — the header selector and the explorer
    // filter should not disagree.
    if (next !== 'all') setPreferredNetwork(next)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Verification explorer</h1>
      <p className="mt-1 text-sm text-slate-600">
        Searchable index of verified contracts, including revocation history.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
      )}
    </div>
  )
}
