import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, SearchInput } from '../components/ui'
import { PageHeader } from '../components/PageHeader'
import { Table, type Column } from '../components/Table'
import { Badge } from '../components/Badge'
import { Progress } from '../components/Bars'
import { environments, passRate } from '../data/environments'
import type { Environment } from '../types'
import { Workflow } from 'lucide-react'

type EnvRow = Environment & { id: string }

export function EnvironmentsList() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const rows: EnvRow[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    return environments
      .map((e) => ({ ...e, id: e.id }))
      .filter((e) => !q || e.name.toLowerCase().includes(q) || e.repo.toLowerCase().includes(q))
  }, [query])

  const columns: Column<EnvRow>[] = [
    {
      header: 'ENVIRONMENT',
      render: (e) => (
        <div className="min-w-0 py-0.5">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13.5px] font-medium text-fg">{e.name}</p>
            <Badge tone="accent">
              <Workflow size={11} /> auto-synthesized
            </Badge>
          </div>
          <p className="mt-1 truncate font-mono text-[11.5px] text-dim">{e.repo}</p>
        </div>
      ),
    },
    {
      header: 'PASS RATE',
      width: '200px',
      render: (e) => {
        const r = passRate(e)
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-24">
              <Progress pct={r.pct} tone={r.pct >= 80 ? 'ok' : 'warn'} />
            </div>
            <span className="tnum font-mono text-[12px] text-mid">
              {r.pct.toFixed(1)}%
            </span>
          </div>
        )
      },
    },
    {
      header: 'SCENARIOS',
      align: 'right',
      render: (e) => {
        const r = passRate(e)
        return (
          <span className="tnum font-mono text-[12.5px] text-mid">
            <span className="text-ok">{r.passed}</span>
            <span className="text-faint"> / {r.total}</span>
          </span>
        )
      },
    },
    {
      header: 'DEVELOPERS',
      align: 'right',
      render: (e) => (
        <span className="tnum font-mono text-[12.5px] text-mid">{new Set(e.scenarios.map((s) => s.developer)).size}</span>
      ),
    },
    {
      header: 'RUBRIC',
      align: 'right',
      render: (e) => <span className="tnum font-mono text-[12.5px] text-mid">{e.rubric.length} checks</span>,
    },
    {
      header: 'SOURCE RUN',
      align: 'right',
      render: (e) => (
        <Badge mono>{e.sourceRunId}</Badge>
      ),
    },
  ]

  return (
    <Page crumbs={[{ label: 'Environments' }]}>
      <PageHeader title="Environments" />

      <div className="mb-3 flex items-center justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search environments…" width="w-72" />
        <p className="tnum text-[12px] text-dim">
          {rows.length} of {environments.length} environments
        </p>
      </div>

      <Table
        columns={columns}
        rows={rows}
        onRowClick={(e) => navigate(`/environments/${e.id}`)}
        empty="No environments match your search."
      />
    </Page>
  )
}
