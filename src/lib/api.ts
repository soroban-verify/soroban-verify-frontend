import type {
  BuildLogEvent,
  Network,
  Sep58Metadata,
  SubmissionRequest,
  VerificationRecord,
} from '../types/verification'
import { MOCK_RECORDS } from './mockData'

/**
 * Client for the soroban-verify public REST API (M3).
 *
 * The frontend is never the trust anchor: everything here is a read-through
 * to the API / registry contract. When VITE_API_URL is unset (backend not yet
 * running), calls fall back to local mock data so the UI is developable.
 */
const API_URL: string = import.meta.env.VITE_API_URL || ''

export const DEFAULT_NETWORK: Network =
  (import.meta.env.VITE_DEFAULT_NETWORK as Network) || 'testnet'

const useMocks = API_URL === ''

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

/** Params for {@link listVerifications}. Cursor is an opaque pagination
 * token (a server-issued cursor in production; a stringified offset in mock
 * dev mode). `limit` defaults to 25. */
export interface ListVerificationsParams {
  network?: Network
  query?: string
  cursor?: string | null
  limit?: number
}

/** Shape of {@link listVerifications}'s response. `nextCursor` is `null` at
 * the end of the result set so the UI can disable its Next control. */
export interface ListVerificationsResult {
  records: VerificationRecord[]
  nextCursor: string | null
}

/** Default page size for the explorer table — small enough to be fast, large
 * enough that most result sets fit on one page. */
export const DEFAULT_LIST_LIMIT = 25

export async function listVerifications(
  params?: ListVerificationsParams,
): Promise<ListVerificationsResult> {
  const limit = params?.limit ?? DEFAULT_LIST_LIMIT

  if (useMocks) {
    let filtered = MOCK_RECORDS
    if (params?.network) {
      filtered = filtered.filter((r) => r.network === params.network)
    }
    if (params?.query) {
      const q = params.query.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.contractId.toLowerCase().includes(q) ||
          r.sourceRepo.toLowerCase().includes(q),
      )
    }
    // Cursor encodes the integer offset into the post-filter result set.
    // It is reset by ExplorerPage whenever a filter changes, so a stale
    // cursor from a different filter never lands here in practice — but we
    // still clamp it defensively to avoid slicing into negative territory.
    const offset = params?.cursor ? Math.max(0, parseInt(params.cursor, 10) || 0) : 0
    const records = filtered.slice(offset, offset + limit)
    const nextOffset = offset + limit
    const nextCursor = nextOffset < filtered.length ? String(nextOffset) : null
    return { records, nextCursor }
  }

  const search = new URLSearchParams()
  if (params?.network) search.set('network', params.network)
  if (params?.query) search.set('q', params.query)
  if (params?.cursor) search.set('cursor', params.cursor)
  if (limit !== DEFAULT_LIST_LIMIT) search.set('limit', String(limit))
  return get(`/v1/verifications?${search}`)
}

export async function getVerification(
  contractId: string,
  network: Network,
): Promise<VerificationRecord | null> {
  if (useMocks) {
    return (
      MOCK_RECORDS.find(
        (r) => r.contractId === contractId && r.network === network,
      ) ?? null
    )
  }
  return get(`/v1/contracts/${network}/${contractId}/verification`)
}

/**
 * Auto-detect SEP-58 metadata for a contract (wizard step 2).
 * Returns null when the contract embeds no SEP-58 metadata and the
 * submitter must fill in repo/commit/build config manually.
 */
export async function detectSep58Metadata(
  contractId: string,
  network: Network,
): Promise<Sep58Metadata | null> {
  if (useMocks) {
    const record = MOCK_RECORDS.find(
      (r) => r.contractId === contractId && r.network === network,
    )
    if (!record) return null
    return { sourceRepo: record.sourceRepo, commit: record.commit }
  }
  return get(`/v1/contracts/${network}/${contractId}/sep58`)
}

export async function submitVerification(
  request: SubmissionRequest,
): Promise<{ id: string }> {
  if (useMocks) return { id: `mock_${Date.now()}` }
  return post('/v1/verifications', request)
}

/**
 * Submit a Freighter-signed ownership claim over a verification record
 * (issue #3). The signature itself is produced in `lib/freighter.ts`; this
 * function only forwards the payload to the registry/API.
 *
 * In mock mode (no VITE_API_URL) we console.log the payload so the full
 * end-to-end flow is exercisable from the UI without a backend.
 */
export async function submitOwnershipClaim(
  verificationId: string,
  payload: { signerAddress: string; signedMessage: string },
): Promise<{ id: string }> {
  if (useMocks) {
    console.log('[mock] submitOwnershipClaim', { verificationId, payload })
    return { id: `mock_claim_${Date.now()}` }
  }
  return post(`/v1/verifications/${verificationId}/claim`, payload)
}

/**
 * Subscribe to the live build log for a verification job (SSE).
 * Returns an unsubscribe function. In mock mode, emits a scripted log.
 */
export function streamBuildLog(
  verificationId: string,
  onEvent: (event: BuildLogEvent) => void,
  onDone: () => void,
): () => void {
  if (useMocks) {
    const script = [
      'Pulling build image stellar/soroban-build:22.0.0…',
      'Cloning repository at pinned commit…',
      'cargo build --target wasm32v1-none --release',
      'Optimizing Wasm…',
      'Computing SHA-256 of rebuilt artifact…',
      'Comparing against on-chain Wasm hash…',
      '✔ Byte-for-byte match',
    ]
    let i = 0
    const timer = setInterval(() => {
      if (i >= script.length) {
        clearInterval(timer)
        onDone()
        return
      }
      onEvent({
        timestamp: new Date().toISOString(),
        stream: 'system',
        line: script[i++],
      })
    }, 700)
    return () => clearInterval(timer)
  }

  const source = new EventSource(`${API_URL}/v1/verifications/${verificationId}/log`)
  source.onmessage = (e) => onEvent(JSON.parse(e.data) as BuildLogEvent)
  source.addEventListener('done', () => {
    source.close()
    onDone()
  })
  source.onerror = () => {
    source.close()
    onDone()
  }
  return () => source.close()
}

/** URL of the live SVG badge for a contract (embeddable in READMEs). */
export function badgeUrl(contractId: string, network: Network): string {
  const base = API_URL || 'https://api.soroban-verify.example'
  return `${base}/v1/badge/${network}/${contractId}.svg`
}
