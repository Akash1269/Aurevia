import type { ComponentType, SVGProps } from 'react'
import {
  BankIcon,
  BriefcaseIcon,
  CandlestickIcon,
  GridIcon,
  LayersIcon,
  LockIcon,
  ShieldIcon,
  SwapIcon,
  TrendUpIcon,
} from './components/icons'

export interface NavItem {
  to: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', Icon: GridIcon },
  { to: '/us-stocks', label: 'US Stocks', Icon: TrendUpIcon },
  { to: '/india-stocks', label: 'India Stocks', Icon: CandlestickIcon },
  { to: '/mutual-funds', label: 'Mutual Funds', Icon: LayersIcon },
  { to: '/esops', label: 'ESOPs', Icon: BriefcaseIcon },
  { to: '/savings', label: 'Savings Accounts', Icon: BankIcon },
  { to: '/fixed-deposits', label: 'Fixed Deposits', Icon: LockIcon },
  { to: '/pf', label: 'India PF', Icon: ShieldIcon },
  { to: '/currency-converter', label: 'Currency Converter', Icon: SwapIcon },
]
