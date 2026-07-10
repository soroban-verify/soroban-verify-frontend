import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Network } from '../types/verification'
import { DEFAULT_NETWORK } from '../lib/api'

/**
 * App-level network selection. Lifted out of individual pages so the choice
 * persists across navigations and reloads (issue #1).
 *
 * - The value is a concrete `Network` (mainnet | testnet) — not 'all' — because
 *   the explorer is the only place that filters across networks, and that
 *   page keeps an independent local filter on top of this context.
 * - `DEFAULT_NETWORK` (from `lib/api.ts`, sourced from VITE_DEFAULT_NETWORK)
 *   is the fallback when nothing is stored.
 * - localStorage is wrapped in try/catch because privacy-mode browsers and
 *   quota-exhausted storage can throw on access.
 */
const STORAGE_KEY = 'soroban-verify:network'

function readStoredNetwork(): Network {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'mainnet' || raw === 'testnet') return raw
  } catch {
    // localStorage unavailable — fall through to default
  }
  return DEFAULT_NETWORK
}

function writeStoredNetwork(network: Network): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, network)
  } catch {
    // Ignore: persistence is best-effort.
  }
}

export interface NetworkContextValue {
  network: Network
  setNetwork: (network: Network) => void
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<Network>(() => readStoredNetwork())

  // Re-sync from localStorage if another tab changes it.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && (e.newValue === 'mainnet' || e.newValue === 'testnet')) {
        setNetworkState(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo<NetworkContextValue>(
    () => ({
      network,
      setNetwork: (next: Network) => {
        writeStoredNetwork(next)
        setNetworkState(next)
      },
    }),
    [network],
  )

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext)
  if (!ctx) {
    throw new Error('useNetwork must be used inside <NetworkProvider>')
  }
  return ctx
}
