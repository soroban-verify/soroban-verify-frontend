import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BuildLogEvent, Network, Sep58Metadata } from '../types/verification'
import { DEFAULT_NETWORK, detectSep58Metadata, streamBuildLog, submitVerification } from '../lib/api'

type Step = 'contract' | 'confirm' | 'building' | 'result'

const STEPS: { key: Step; label: string }[] = [
  { key: 'contract', label: 'Contract' },
  { key: 'confirm', label: 'Source & build' },
  { key: 'building', label: 'Rebuild' },
  { key: 'result', label: 'Result' },
]

export default function SubmitWizardPage() {
  const [step, setStep] = useState<Step>('contract')
  const [contractId, setContractId] = useState('')
  const [network, setNetwork] = useState<Network>(DEFAULT_NETWORK)
  const [detecting, setDetecting] = useState(false)
  const [metadata, setMetadata] = useState<Sep58Metadata | null>(null)
  const [sourceRepo, setSourceRepo] = useState('')
  const [commit, setCommit] = useState('')
  const [buildImage, setBuildImage] = useState('')
  const [log, setLog] = useState<BuildLogEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  async function handleDetect() {
    setError(null)
    setDetecting(true)
    try {
      const meta = await detectSep58Metadata(contractId.trim(), network)
      setMetadata(meta)
      if (meta) {
        setSourceRepo(meta.sourceRepo)
        setCommit(meta.commit)
        if (meta.buildImage) setBuildImage(meta.buildImage)
      }
      setStep('confirm')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDetecting(false)
    }
  }

  async function handleSubmit() {
    setError(null)
    try {
      const { id } = await submitVerification({
        contractId: contractId.trim(),
        network,
        sourceRepo: sourceRepo.trim(),
        commit: commit.trim(),
        buildImage: buildImage.trim() || undefined,
      })
      setStep('building')
      setLog([])
      streamBuildLog(
        id,
        (event) => setLog((prev) => [...prev, event]),
        () => setStep('result'),
      )
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Submit a contract for verification</h1>
      <p className="mt-1 text-sm text-slate-600">
        Anyone can submit a claim — you don’t need to be the deployer. The
        service rebuilds the Wasm from source and byte-compares it against the
        on-chain hash.
      </p>

      <ol className="mt-6 flex gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            className={`flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium ${
              i === stepIndex
                ? 'bg-indigo-600 text-white'
                : i < stepIndex
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            {i + 1}. {s.label}
          </li>
        ))}
      </ol>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        {step === 'contract' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Contract ID</label>
              <input
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="C…"
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
                <option value="testnet">Testnet</option>
                <option value="mainnet">Mainnet</option>
              </select>
            </div>
            <button
              onClick={handleDetect}
              disabled={!contractId.trim() || detecting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {detecting ? 'Detecting SEP-58 metadata…' : 'Continue'}
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <p
              className={`rounded-lg p-3 text-sm ${
                metadata ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
              }`}
            >
              {metadata
                ? 'SEP-58 build metadata detected on-chain — confirm or adjust the fields below.'
                : 'No SEP-58 metadata found for this contract. Enter the source and build configuration manually.'}
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700">Source repository</label>
              <input
                value={sourceRepo}
                onChange={(e) => setSourceRepo(e.target.value)}
                placeholder="https://github.com/org/project"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Commit</label>
              <input
                value={commit}
                onChange={(e) => setCommit(e.target.value)}
                placeholder="full commit SHA"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Build image <span className="font-normal text-slate-400">(optional — defaults to the SDF trusted image)</span>
              </label>
              <input
                value={buildImage}
                onChange={(e) => setBuildImage(e.target.value)}
                placeholder="stellar/soroban-build:22.0.0"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Supplying your own image lowers the trust tier to
                “deployer-supplied”: a hostile image can deterministically
                rewrite bytes and still pass byte-comparison.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep('contract')}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!sourceRepo.trim() || !commit.trim()}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Start verification
              </button>
            </div>
          </div>
        )}

        {(step === 'building' || step === 'result') && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">
              {step === 'building' ? 'Rebuilding from source…' : 'Build complete'}
            </h2>
            <div className="max-h-80 overflow-y-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100">
              {log.map((event, i) => (
                <div key={i}>
                  <span className="text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString()}{' '}
                  </span>
                  {event.line}
                </div>
              ))}
              {step === 'building' && <div className="animate-pulse text-slate-400">▌</div>}
              <div ref={logEndRef} />
            </div>
            {step === 'result' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  The verification record is published via the public API and
                  attested on-chain in the verification registry.
                </p>
                <Link
                  to={`/contract/${network}/${contractId.trim()}`}
                  className="inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  View verification result
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
