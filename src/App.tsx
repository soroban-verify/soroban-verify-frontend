import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ExplorerPage from './pages/ExplorerPage'
import ContractDetailPage from './pages/ContractDetailPage'
import SubmitWizardPage from './pages/SubmitWizardPage'
import BadgesPage from './pages/BadgesPage'
import IntegrationDocsPage from './pages/IntegrationDocsPage'
import NotFoundPage from './pages/NotFoundPage'
import WidgetPage from './pages/WidgetPage'

export default function App() {
  return (
    <Routes>
      {/*
        The widget route is registered OUTSIDE the Layout wrapper on
        purpose — embedders drop the iframe into their own page chrome,
        so the widget must render without our header / footer / wrapper
        styles. Issue #6.
      */}
      <Route path="/widget/:network/:contractId" element={<WidgetPage />} />
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
