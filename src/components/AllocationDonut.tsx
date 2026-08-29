import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatInr } from '../utils/format'

export interface DonutDatum {
  name: string
  value: number
  color: string
}

export function AllocationDonut({ data }: { data: DonutDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatInr(value)} />
      </PieChart>
    </ResponsiveContainer>
  )
}
