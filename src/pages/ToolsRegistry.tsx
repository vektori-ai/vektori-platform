import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, SearchInput, FilterChips } from '../components/ui'
import { PageHeader } from '../components/PageHeader'
import { Table, type Column } from '../components/Table'
import { Badge } from '../components/Badge'
import { allToolStats, type ToolStat } from '../data/runs'
import { AlertTriangle } from 'lucide-react'

const nsDot: Record<string, string> = {
  github: 'bg-fg',
  notion: 'bg-dim',
  local: 'bg-mid',
}

export function ToolsRegistry() {
  const navigate = useNavigate()
  const [namespace, setNamespace] = useState<string>('all')
  const [query, setQuery] = useState('')
  const stats = useMemo(() => allToolStats(), [])
  const namespaces = useMemo(() => ['all', ...new Set(stats.map((s) => s.namespace))], [stats])
  const maxCalls = Math.max(1, ...stats.map((s) => s.calls))

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return stats
      .filter((s) => namespace === 'all' || s.namespace === namespace)
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .map((s) => ({ ...s, id: s.name }))
  }, [stats, namespace, query])

  const columns: Column<ToolStat & { id: string }>[] = [
    {
      header: 'TOOL',
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${nsDot[s.namespace] ?? 'bg-dim'}`} />
          <span className="font-mono text-[12.5px] font-medium text-fg">{s.name}</span>
          <span className="rounded border border-line-2 bg-raise px-1.5 py-px text-[10px] font-medium text-dim">
            {s.namespace}
          </span>
        </div>
      ),
    },
    {
      header: 'CALLS',
      width: '200px',
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="h-[9px] w-24 overflow-hidden rounded-sm bg-raise">
            <div className="h-full rounded-sm bg-accent/70" style={{ width: `${(s.calls / maxCalls) * 100}%` }} />
          </div>
          <span className="tnum font-mono text-[12px] text-mid">{s.calls}</span>
        </div>
      ),
    },
    {
      header: 'AVG RESULT',
      align: 'right',
      render: (s) => (
        <span className="tnum font-mono text-[12px] text-dim">{s.avgResultChars.toLocaleString()} ch</span>
      ),
    },
    {
      header: 'ERRORS',
      align: 'right',
      render: (s) =>
        s.errors > 0 ? (
          <span className="tnum inline-flex items-center gap-1 font-mono text-[12px] font-medium text-err">
            <AlertTriangle size={11} /> {s.errors}
          </span>
        ) : (
          <span className="tnum font-mono text-[12px] text-faint">0</span>
        ),
    },
    {
      header: 'USED IN',
      align: 'right',
      render: (s) => (
        <div className="flex flex-wrap justify-end gap-1">
          {s.runIds.map((id) => (
            <Badge key={id} mono>
              {id}
            </Badge>
          ))}
        </div>
      ),
    },
  ]

  return (
    <Page crumbs={[{ label: 'Tools' }]}>
      <PageHeader
        title="Tools"
        description="Every tool the agent has invoked, aggregated across all ingested runs, with call volume, payload sizes, and failure counts."
      />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search tools…" width="w-64" />
          <FilterChips options={namespaces} value={namespace} onChange={setNamespace} />
        </div>
        <p className="tnum text-[12px] text-dim">
          {rows.length} of {stats.length} tools
        </p>
      </div>

      <Table
        columns={columns}
        rows={rows}
        onRowClick={(s) => s.runIds[0] && navigate(`/runs/${s.runIds[0]}`)}
        empty="No tools match the current filters."
      />
    </Page>
  )
}
