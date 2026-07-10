import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ExplorerPage from './pages/ExplorerPage'
import ContractDetailPage from './pages/ContractDetailPage'
import SubmitWizardPage from './pages/SubmitWizardPage'
import BadgesPage from './pages/BadgesPage'
import IntegrationDocsPage from './pages/IntegrationDocsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explorer" element={<ExplorerPage />} />
        <Route path="/contract/:network/:contractId" element={<ContractDetailPage />} />
        <Route path="/submit" element={<SubmitWizardPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/docs/integrations" element={<IntegrationDocsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
