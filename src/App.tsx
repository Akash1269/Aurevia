import { Route, Routes } from 'react-router-dom'
import { PortfolioDataProvider } from './context/PortfolioDataContext'
import { AppShell } from './layouts/AppShell'
import { CurrencyConverterPage } from './pages/CurrencyConverterPage'
import { EsopsPage } from './pages/EsopsPage'
import { FixedDepositsPage } from './pages/FixedDepositsPage'
import { IndiaStocksPage } from './pages/IndiaStocksPage'
import { MutualFundsPage } from './pages/MutualFundsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OverviewPage } from './pages/OverviewPage'
import { PfPage } from './pages/PfPage'
import { ProjectionsPage } from './pages/ProjectionsPage'
import { SavingsPage } from './pages/SavingsPage'
import { UsStocksPage } from './pages/UsStocksPage'

function App() {
  return (
    <PortfolioDataProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/us-stocks" element={<UsStocksPage />} />
          <Route path="/india-stocks" element={<IndiaStocksPage />} />
          <Route path="/mutual-funds" element={<MutualFundsPage />} />
          <Route path="/esops" element={<EsopsPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/fixed-deposits" element={<FixedDepositsPage />} />
          <Route path="/pf" element={<PfPage />} />
          <Route path="/projections" element={<ProjectionsPage />} />
          <Route path="/currency-converter" element={<CurrencyConverterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </PortfolioDataProvider>
  )
}

export default App
