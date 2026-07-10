import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { TRUST_TIERS } from '../lib/trust'
import { useNetwork } from '../contexts/NetworkContext'
import TrustBadge from '../components/TrustBadge'

export default function HomePage() {
  const navigate = useNavigate()
  const { network } = useNetwork()
  const [query, setQuery] = useState('')

  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-2xl pt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Contract verification for <span className="text-indigo-600">Soroban</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Trustlessly confirm that deployed Wasm bytecode corresponds to
          published source code — built on SEP-58 reproducible builds.
        </p>
        <form
          className="mt-8 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const id = query.trim()
            if (id) navigate(`/contract/${network}/${id}`)
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a contract ID (C…)"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Look up
          </button>
        </form>
        <p className="mt-3 text-sm text-slate-500">
          or <Link to="/submit" className="text-indigo-600 hover:underline">submit a contract for verification</Link>
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Trust tiers, not checkmarks</h2>
        <p className="mt-1 text-sm text-slate-600">
          Verification is multi-dimensional. Every result explains what it
          means — and what it does not guarantee.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Object.values(TRUST_TIERS).map((info) => (
            <div key={info.tier} className="rounded-lg border border-slate-200 bg-white p-4">
              <TrustBadge tier={info.tier} />
              <p className="mt-2 text-sm text-slate-700">{info.means}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
