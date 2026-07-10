/** Side-by-side on-chain vs. rebuilt Wasm hash comparison. */
export default function HashCompare({
  onChain,
  rebuilt,
}: {
  onChain: string
  rebuilt: string | null
}) {
  const match = rebuilt !== null && onChain === rebuilt
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          On-chain Wasm hash
        </div>
        <code className="mt-1 block break-all font-mono text-xs text-slate-800">
          {onChain}
        </code>
      </div>
      <div
        className={`rounded-lg border p-3 ${
          rebuilt === null
            ? 'border-slate-200 bg-white'
            : match
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-red-300 bg-red-50'
        }`}
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Rebuilt Wasm hash {rebuilt !== null && (match ? '· match ✔' : '· MISMATCH ✘')}
        </div>
        <code className="mt-1 block break-all font-mono text-xs text-slate-800">
          {rebuilt ?? '— build did not produce an artifact —'}
        </code>
      </div>
    </div>
  )
}
