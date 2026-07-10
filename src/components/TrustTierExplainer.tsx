import type { TrustTier } from '../types/verification'
import { TRUST_TIERS } from '../lib/trust'
import TrustBadge from './TrustBadge'

/**
 * Verification-as-education: shown wherever a tier is displayed prominently.
 * Always states what the tier does NOT guarantee. No false green checkmarks.
 */
export default function TrustTierExplainer({ tier }: { tier: TrustTier }) {
  const info = TRUST_TIERS[tier]
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-2">
        <TrustBadge tier={tier} />
      </div>
      <p className="text-sm text-slate-700">{info.means}</p>
      <p className="mt-2 text-sm text-slate-500">
        <span className="font-semibold text-slate-600">What this does not guarantee: </span>
        {info.doesNotGuarantee}
      </p>
    </div>
  )
}
