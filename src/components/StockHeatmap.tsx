import { ResponsiveContainer, Tooltip, Treemap } from 'recharts'
import { formatCompactInr, formatInr } from '../utils/format'

export interface HeatmapDatum {
  name: string
  size: number
  gainPct: number
}

function heatColor(gainPct: number): string {
  if (gainPct >= 30) return '#15803d'
  if (gainPct >= 0) return '#22c55e'
  if (gainPct >= -15) return '#f87171'
  return '#b91c1c'
}

interface CellContentProps {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  size?: number
  gainPct?: number
  index?: number
  formatCompact?: (value: number) => string
}

function CellContent({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  name = '',
  size = 0,
  gainPct = 0,
  index = 0,
  formatCompact = formatCompactInr,
}: CellContentProps) {
  const showValue = width > 70 && height > 46
  const showGain = showValue || (width > 55 && height > 32)
  const showCodeOnly = !showGain && width > 22 && height > 14
  const clipId = `heatmap-cell-${index}`

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={heatColor(gainPct)} stroke="var(--card-bg)" strokeWidth={2} />
      {(showGain || showCodeOnly) && (
        <>
          <clipPath id={clipId}>
            <rect x={x + 2} y={y + 2} width={Math.max(0, width - 4)} height={Math.max(0, height - 4)} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <text x={x + 5} y={y + 15} fontSize={11} fontWeight={600} fill="#ffffff">
              {name}
            </text>
            {showGain && (
              <text x={x + 5} y={y + 29} fontSize={10} fill="rgba(255,255,255,0.85)">
                {showValue && `${formatCompact(size)} · `}
                {gainPct > 0 ? '+' : ''}
                {gainPct.toFixed(1)}%
              </text>
            )}
          </g>
        </>
      )}
    </g>
  )
}

interface HeatmapTooltipProps {
  active?: boolean
  payload?: { payload?: HeatmapDatum }[]
  formatFull?: (value: number) => string
}

function HeatmapTooltip({ active, payload, formatFull = formatInr }: HeatmapTooltipProps) {
  const datum = payload?.[0]?.payload
  if (!active || !datum) return null
  return (
    <div
      style={{
        background: '#1a1a1e',
        border: '1px solid var(--card-dark-border)',
        borderRadius: 10,
        padding: 'var(--space-3) var(--space-4)',
        color: '#fff',
        fontSize: 'var(--text-sm)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{datum.name}</div>
      <div>{formatFull(datum.size)}</div>
      <div>
        {datum.gainPct > 0 ? '+' : ''}
        {datum.gainPct.toFixed(1)}%
      </div>
    </div>
  )
}

export function StockHeatmap({
  data,
  formatCompact = formatCompactInr,
  formatFull = formatInr,
}: {
  data: HeatmapDatum[]
  formatCompact?: (value: number) => string
  formatFull?: (value: number) => string
}) {
  const sorted = [...data].sort((a, b) => b.size - a.size)
  return (
    <ResponsiveContainer width="100%" height={280}>
      <Treemap data={sorted} dataKey="size" isAnimationActive={false} content={<CellContent formatCompact={formatCompact} />}>
        <Tooltip content={<HeatmapTooltip formatFull={formatFull} />} />
      </Treemap>
    </ResponsiveContainer>
  )
}
