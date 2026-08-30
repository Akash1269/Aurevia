import {
  ArrowRightLeft,
  Briefcase,
  CandlestickChart,
  Landmark,
  Layers,
  LayoutGrid,
  Lock,
  Rocket,
  Shield,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', Icon: LayoutGrid },
  { to: '/us-stocks', label: 'US Stocks', Icon: TrendingUp },
  { to: '/india-stocks', label: 'India Stocks', Icon: CandlestickChart },
  { to: '/mutual-funds', label: 'Mutual Funds', Icon: Layers },
  { to: '/esops', label: 'ESOPs', Icon: Briefcase },
  { to: '/savings', label: 'Savings Accounts', Icon: Landmark },
  { to: '/fixed-deposits', label: 'Fixed Deposits', Icon: Lock },
  { to: '/pf', label: 'India PF', Icon: Shield },
  { to: '/projections', label: 'Projections', Icon: Rocket },
  { to: '/currency-converter', label: 'Currency Converter', Icon: ArrowRightLeft },
]
