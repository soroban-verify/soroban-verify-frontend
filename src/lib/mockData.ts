import type { VerificationRecord } from '../types/verification'

/**
 * Development-only fixtures used when VITE_API_URL is unset, so the explorer
 * renders meaningfully before the backend (M3) exists. Never the trust anchor.
 */
export const MOCK_RECORDS: VerificationRecord[] = [
  {
    id: 'ver_01',
    contractId: 'CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K',
    network: 'mainnet',
    status: 'verified',
    trustTier: 'trusted',
    sourceRepo: 'https://github.com/example-dao/amm-core',
    commit: '4f2a9c1d8e7b6a5f4e3d2c1b0a9f8e7d6c5b4a39',
    onChainWasmHash:
      'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
    rebuiltWasmHash:
      'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
    buildEnvironment: {
      image: 'stellar/soroban-build:22.0.0',
      imageDigest: 'sha256:9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0',
      toolchain: 'rustc 1.84.0 + wasm32v1-none',
      sdkVersion: 'soroban-sdk 22.0.0',
    },
    attestation: {
      workflowRunUrl: 'https://github.com/example-dao/amm-core/actions/runs/123456789',
      signerKey: 'GDEXAMPLESIGNERKEYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      signature: 'base64-ed25519-signature==',
      attestedWasmHash:
        'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
      attestedCommit: '4f2a9c1d8e7b6a5f4e3d2c1b0a9f8e7d6c5b4a39',
    },
    submittedAt: '2026-06-28T14:12:00Z',
    verifiedAt: '2026-06-28T14:19:42Z',
    revokedAt: null,
    revocationReason: null,
  },
  {
    id: 'ver_02',
    contractId: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA',
    network: 'testnet',
    status: 'verified',
    trustTier: 'auditable',
    sourceRepo: 'https://github.com/example-labs/oracle-feed',
    commit: '7c6b5a49382716f5e4d3c2b1a09f8e7d6c5b4a39',
    onChainWasmHash:
      'b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1',
    rebuiltWasmHash:
      'b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1',
    buildEnvironment: {
      image: 'ghcr.io/example-labs/rust-wasm-builder:1.84-pinned',
      imageDigest: 'sha256:1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809',
      toolchain: 'rustc 1.84.0 + wasm32v1-none',
    },
    attestation: null,
    submittedAt: '2026-07-01T09:30:00Z',
    verifiedAt: '2026-07-01T09:41:07Z',
    revokedAt: null,
    revocationReason: null,
  },
  {
    id: 'ver_03',
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    network: 'mainnet',
    status: 'failed',
    trustTier: 'failed',
    sourceRepo: 'https://github.com/someone/token-fork',
    commit: '0f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c',
    onChainWasmHash:
      'c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2',
    rebuiltWasmHash:
      'd4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3',
    buildEnvironment: {
      image: 'stellar/soroban-build:21.7.1',
      imageDigest: 'sha256:2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a',
      toolchain: 'rustc 1.81.0 + wasm32-unknown-unknown',
    },
    attestation: null,
    submittedAt: '2026-07-05T18:02:00Z',
    verifiedAt: null,
    revokedAt: null,
    revocationReason: null,
  },
]
