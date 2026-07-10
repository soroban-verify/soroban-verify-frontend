import type { TrustTier } from '../types/verification'
import { TRUST_TIERS } from '../lib/trust'

export default function TrustBadge({ tier }: { tier: TrustTier }) {
  const info = TRUST_TIERS[tier]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${info.badgeClass}`}
      title={info.means}
    >
      <span aria-hidden>{info.emoji}</span>
      {info.label}
    </span>
  )
}
