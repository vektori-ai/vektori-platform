import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, SearchInput, FilterChips } from '../components/ui'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { Badge, statusTone } from '../components/Badge'
import { Table, type Column } from '../components/Table'
import { runs, taskPrompt, toolErrors } from '../data/runs'
import { environments } from '../data/environments'
import { formatTokens } from '../lib/format'
import type { Run } from '../types'
import { Wrench, Coins, ListTree, AlertTriangle, Workflow } from 'lucide-react'

type RunRow = Run & { id: string }
type StatusFilter = 'all' | 'success' | 'failed'

export function RunsOverview() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const totalToolCalls = runs.reduce((a, r) => a + r.keyStats.tool_calls, 0)
  const totalTokens = runs.reduce((a, r) => a + r.keyStats.total_tokens, 0)
  const totalErrors = runs.reduce((a, r) => a + toolErrors(r).length, 0)
  const totalRequests = runs.reduce((a, r) => a + r.keyStats.agent_llm_requests, 0)

  const rows: RunRow[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    return runs
      .map((r) => ({ ...r, id: r.runId }))
      .filter((r) => status === 'all' || (status === 'success' ? r.status === 'success' : r.status !== 'success'))
      .filter((r) => !q || r.runId.toLowerCase().includes(q) || taskPrompt(r).toLowerCase().includes(q))
  }, [query, status])

  const columns: Column<RunRow>[] = [
    {
      header: 'RUN',
      render: (r) => (
        <div className="min-w-0 max-w-xl py-0.5">
          <p className="font-mono text-[13px] font-medium text-fg">{r.runId}</p>
          <p className="mt-1 truncate text-[12px] text-dim">{taskPrompt(r)}</p>
        </div>
      ),
    },
    { header: 'STATUS', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    {
      header: 'SYNTHESIZED ENV',
      render: (r) => {
        const env = environments.find((e) => e.sourceRunId === r.runId)
        return env ? (
          <span className="inline-flex items-center gap-1.5 truncate font-mono text-[11.5px] text-mid">
            <Workflow size={11} className="shrink-0 text-dim" />
            {env.repo.split('/')[1]}
          </span>
        ) : (
          <span className="text-[11.5px] text-faint">queued</span>
        )
      },
    },
    {
      header: 'TOOL CALLS',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12px] text-mid">{r.keyStats.tool_calls}</span>,
    },
    {
      header: 'ERRORS',
      align: 'right',
      render: (r) => {
        const n = toolErrors(r).length
        return n > 0 ? (
          <span className="tnum inline-flex items-center gap-1 font-mono text-[12px] font-medium text-err">
            <AlertTriangle size={11} /> {n}
          </span>
        ) : (
          <span className="tnum font-mono text-[12px] text-faint">0</span>
        )
      },
    },
    {
      header: 'TOKENS',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12px] text-mid">{formatTokens(r.keyStats.total_tokens)}</span>,
    },
    {
      header: 'MESSAGES',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12px] text-mid">{r.keyStats.total_messages}</span>,
    },
  ]

  return (
    <Page crumbs={[{ label: 'Runs' }]}>
      <PageHeader
        title="Runs"
        description="The raw material: full agent execution traces, turn by turn. Each ingested run is automatically distilled into a graded environment."
      />

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Runs ingested" value={runs.length} icon={<ListTree size={15} />} />
        <StatCard label="Tool calls" value={totalToolCalls} sub={`${totalRequests} LLM requests`} icon={<Wrench size={15} />} />
        <StatCard label="Total tokens" value={formatTokens(totalTokens)} icon={<Coins size={15} />} />
        <StatCard
          label="Errors flagged"
          value={<span className={totalErrors ? 'text-err' : undefined}>{totalErrors}</span>}
          sub="pattern-matched from tool results"
          icon={<AlertTriangle size={15} />}
        />
      </div>

      <div className="mb-3 mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by run ID or task…" width="w-72" />
          <FilterChips<StatusFilter> options={['all', 'success', 'failed']} value={status} onChange={setStatus} />
        </div>
        <p className="tnum text-[12px] text-dim">
          {rows.length} of {runs.length} runs
        </p>
      </div>

      <Table columns={columns} rows={rows} onRowClick={(r) => navigate(`/runs/${r.runId}`)} empty="No runs match the current filters." />
    </Page>
  )
}
