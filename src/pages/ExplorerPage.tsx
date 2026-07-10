import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Network, VerificationRecord } from '../types/verification'
import { listVerifications } from '../lib/api'
import TrustBadge from '../components/TrustBadge'

export default function ExplorerPage() {
  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [query, setQuery] = useState('')
  const [network, setNetwork] = useState<Network | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listVerifications({
      network: network === 'all' ? undefined : network,
      query: query || undefined,
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
  }, [query, network])

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
          value={network}
          onChange={(e) => setNetwork(e.target.value as Network | 'all')}
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
