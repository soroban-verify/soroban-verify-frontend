import type { TrustTier } from '../types/verification'

/**
 * Verification-as-education: every tier carries an explanation of what it
 * means AND what it does not guarantee. No false green checkmarks.
 */
export interface TrustTierInfo {
  tier: TrustTier
  label: string
  emoji: string
  /** Tailwind classes for the badge chip. */
  badgeClass: string
  means: string
  doesNotGuarantee: string
}

export const TRUST_TIERS: Record<TrustTier, TrustTierInfo> = {
  trusted: {
    tier: 'trusted',
    label: 'Trusted build',
    emoji: '🟢',
    badgeClass: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    means:
      'The Wasm was reproduced byte-for-byte inside an SDF-allowlisted trusted build image, from the claimed source repo and commit.',
    doesNotGuarantee:
      'It does not mean the source code is safe or audited — only that the on-chain bytes faithfully correspond to the published source.',
  },
  auditable: {
    tier: 'auditable',
    label: 'Auditable build',
    emoji: '🟡',
    badgeClass: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    means:
      'The Wasm was reproduced inside a publicly auditable, pinned build image. Anyone can inspect the image and re-run the build.',
    doesNotGuarantee:
      'The image is not on the SDF trusted allowlist, so you are trusting the image publisher’s pinning and publication process.',
  },
  deployer: {
    tier: 'deployer',
    label: 'Deployer-supplied build',
    emoji: '🟠',
    badgeClass: 'bg-orange-100 text-orange-800 ring-orange-600/20',
    means:
      'The Wasm was reproduced, but inside an arbitrary image supplied by the deployer.',
    doesNotGuarantee:
      'Reproducibility alone is not faithfulness to source: a hostile build image can deterministically rewrite bytes and still pass byte-comparison. Treat this tier with caution.',
  },
  failed: {
    tier: 'failed',
    label: 'Failed / mismatch',
    emoji: '🔴',
    badgeClass: 'bg-red-100 text-red-800 ring-red-600/20',
    means:
      'The rebuild failed, or the rebuilt Wasm hash did not match the on-chain Wasm hash.',
    doesNotGuarantee:
      'This does not necessarily mean the contract is malicious — but its bytecode could not be tied to the claimed source.',
  },
}

/** Copy-paste command shown on the contract detail page ("reproduce this yourself"). */
export function reproduceCommand(repo: string, commit: string, contractId: string): string {
  return [
    `git clone ${repo} && cd $(basename ${repo} .git)`,
    `git checkout ${commit}`,
    `stellar contract build --verbose`,
    `# compare against on-chain wasm for ${contractId}`,
  ].join('\n')
}
