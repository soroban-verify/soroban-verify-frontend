import { NavLink, Outlet } from 'react-router-dom'
import { useNetwork } from '../contexts/NetworkContext'
import type { Network } from '../types/verification'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
  }`

export default function Layout() {
  const { network, setNetwork } = useNetwork()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">
              soroban<span className="text-indigo-600">-verify</span>
            </span>
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/explorer" className={navLinkClass}>
              Explorer
            </NavLink>
            <NavLink to="/submit" className={navLinkClass}>
              Submit
            </NavLink>
            <NavLink to="/badges" className={navLinkClass}>
              Badges
            </NavLink>
            <NavLink to="/docs/integrations" className={navLinkClass}>
              Integrations
            </NavLink>
            <label className="ml-2 flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus-within:border-indigo-500">
              <span className="pl-1 text-slate-500">Network:</span>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value as Network)}
                className="border-0 bg-transparent py-0 pr-1 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="mainnet">Mainnet</option>
                <option value="testnet">Testnet</option>
              </select>
            </label>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          <p>
            soroban-verify is open source (Apache-2.0) and fully
            static-deployable — this explorer is never the trust anchor; the
            registry contract and public API are.
          </p>
        </div>
      </footer>
    </div>
  )
}
