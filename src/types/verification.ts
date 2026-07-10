/**
 * Core domain types for soroban-verify.
 *
 * Spec traceability: trust tiers follow the multi-dimensional model in the
 * project README ("What It Does" §4); SEP-58 supplies the build metadata
 * vocabulary, SEP-55 the signed CI attestation format.
 */

export type Network = 'mainnet' | 'testnet'

/**
 * Multi-dimensional trust level — deliberately NOT a binary verified flag.
 *
 * - trusted:   reproduced inside an SDF-allowlisted trusted image (🟢)
 * - auditable: reproduced inside a publicly auditable, pinned image (🟡)
 * - deployer:  reproduced, but inside an arbitrary deployer-supplied image (🟠)
 *              — reproducibility alone is not faithfulness to source
 * - failed:    build failed or rebuilt Wasm did not match on-chain hash (🔴)
 */
export type TrustTier = 'trusted' | 'auditable' | 'deployer' | 'failed'

export type VerificationStatus =
  | 'pending'
  | 'building'
  | 'verified'
  | 'failed'
  | 'revoked'

/** SEP-58 build metadata embedded in (or surfaced alongside) the contract Wasm. */
export interface Sep58Metadata {
  sourceRepo: string
  commit: string
  packageName?: string
  buildImage?: string
  buildCommand?: string
  workflowUrl?: string
}

/** SEP-55 signed CI attestation binding a workflow run to a commit + artifact. */
export interface Sep55Attestation {
  workflowRunUrl: string
  signerKey: string
  signature: string
  attestedWasmHash: string
  attestedCommit: string
}

export interface BuildEnvironment {
  image: string
  imageDigest: string
  toolchain: string
  sdkVersion?: string
}

export interface VerificationRecord {
  id: string
  contractId: string
  network: Network
  status: VerificationStatus
  trustTier: TrustTier
  sourceRepo: string
  commit: string
  onChainWasmHash: string
  rebuiltWasmHash: string | null
  buildEnvironment: BuildEnvironment
  attestation: Sep55Attestation | null
  submittedAt: string
  verifiedAt: string | null
  /** Present when a previously verified record was revoked. */
  revokedAt: string | null
  revocationReason: string | null
}

export interface SubmissionRequest {
  contractId: string
  network: Network
  sourceRepo: string
  commit: string
  buildImage?: string
  buildCommand?: string
}

/** One line of the live build log streamed over SSE during verification. */
export interface BuildLogEvent {
  timestamp: string
  stream: 'stdout' | 'stderr' | 'system'
  line: string
}
