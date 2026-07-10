import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Network, VerificationRecord } from '../types/verification'
import { getVerification } from '../lib/api'
import { reproduceCommand } from '../lib/trust'
import TrustTierExplainer from '../components/TrustTierExplainer'
import HashCompare from '../components/HashCompare'
import OwnershipClaimPanel from '../components/OwnershipClaimPanel'

export default function ContractDetailPage() {
  const { network, contractId } = useParams<{ network: Network; contractId: string }>()
  const [record, setRecord] = useState<VerificationRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!network || !contractId) return
    let cancelled = false
    getVerification(contractId, network)
      .then((r) => {
        if (!cancelled) setRecord(r)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [network, contractId])

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>

  if (!record) {
    return (
      <div className="mx-auto max-w-xl pt-12 text-center">
        <h1 className="text-xl font-semibold">No verification record</h1>
        <p className="mt-2 text-sm text-slate-600">
          No verification exists for <code className="font-mono text-xs">{contractId}</code> on{' '}
          {network}. Anyone can submit one — you don’t need to be the deployer.
        </p>
        <Link
          to="/submit"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Submit for verification
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Contract · {record.network}
        </div>
        <h1 className="mt-1 break-all font-mono text-lg font-semibold">{record.contractId}</h1>
      </div>

      <TrustTierExplainer tier={record.trustTier} />

      {record.status === 'revoked' && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          <strong>Revoked</strong>
          {record.revokedAt && <> on {new Date(record.revokedAt).toLocaleString()}</>}
          {record.revocationReason && <>: {record.revocationReason}</>}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold">Wasm hash comparison</h2>
        <HashCompare onChain={record.onChainWasmHash} rebuilt={record.rebuiltWasmHash} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Source</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Repository</dt>
              <dd>
                <a
                  href={record.sourceRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-indigo-600 hover:underline"
                >
                  {record.sourceRepo}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Commit</dt>
              <dd className="break-all font-mono text-xs">{record.commit}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Build environment fingerprint</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Image</dt>
              <dd className="break-all font-mono text-xs">{record.buildEnvironment.image}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Image digest</dt>
              <dd className="break-all font-mono text-xs">{record.buildEnvironment.imageDigest}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Toolchain</dt>
              <dd className="font-mono text-xs">{record.buildEnvironment.toolchain}</dd>
            </div>
          </dl>
        </div>
      </section>

      {record.attestation && (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">SEP-55 CI attestation</h2>
          <p className="mt-1 text-sm text-slate-600">
            A signed attestation binds this workflow run to the commit and the Wasm artifact.
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Workflow run</dt>
              <dd>
                <a
                  href={record.attestation.workflowRunUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-indigo-600 hover:underline"
                >
                  {record.attestation.workflowRunUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Signer</dt>
              <dd className="break-all font-mono text-xs">{record.attestation.signerKey}</dd>
            </div>
          </dl>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-base font-semibold">Reproduce this yourself</h2>
        <p className="mb-3 text-sm text-slate-600">
          Don’t trust this page — the registry contract and API are the trust
          anchor, and you can independently reproduce the build:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100">
          {reproduceCommand(record.sourceRepo, record.commit, record.contractId)}
        </pre>
      </section>

      <OwnershipClaimPanel
        verificationId={record.id}
        contractId={record.contractId}
      />
    </div>
  )
}
