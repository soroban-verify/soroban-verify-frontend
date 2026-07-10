import { useState } from 'react'
import type { Network } from '../types/verification'
import { badgeUrl } from '../lib/api'
import { useNetwork } from '../contexts/NetworkContext'

function CopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="text-xs font-medium text-indigo-600 hover:underline"
        >
          {copied ? 'Copied ✔' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-100">
        {code}
      </pre>
    </div>
  )
}

export default function BadgesPage() {
  // The badge form is driven directly by the app-level network preference
  // so the copy-paste blocks always reflect the currently selected network,
  // and changing the badge select updates the header selector as well.
  const { network, setNetwork } = useNetwork()
  const [contractId, setContractId] = useState('CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K')
  const svg = badgeUrl(contractId, network)
  const detailPage = `${window.location.origin}/contract/${network}/${contractId}`

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Embeddable badges & widgets</h1>
      <p className="mt-1 text-sm text-slate-600">
        Badges resolve live from the public API — they reflect current
        verification status, including revocations, not a snapshot.
      </p>

      <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Contract ID</label>
          <input
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as Network)}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </div>

        <CopyBlock
          label="Markdown (for READMEs)"
          code={`[![soroban-verify](${svg})](${detailPage})`}
        />
        <CopyBlock
          label="HTML"
          code={`<a href="${detailPage}"><img src="${svg}" alt="soroban-verify status" /></a>`}
        />
        <CopyBlock
          label="iframe widget (for project sites)"
          code={`<iframe src="${window.location.origin}/widget/${network}/${contractId}" width="320" height="80" frameborder="0"></iframe>`}
        />
      </div>
    </div>
  )
}
