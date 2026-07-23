import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Page, Button, Card, Tabs, SearchInput, FilterChips } from '../components/ui'
import { Badge } from '../components/Badge'
import { Table, type Column } from '../components/Table'
import { Progress, StackedBars } from '../components/Bars'
import { StatCard } from '../components/StatCard'
import { getEnvironment, passRate, developerBreakdown } from '../data/environments'
import { getRun, toolCallCounts } from '../data/runs'
import type { Scenario } from '../types'
import { CheckCircle2, CircleDashed, ArrowRight, ShieldCheck, ExternalLink, Workflow } from 'lucide-react'

const COMPONENT_KEYS: { key: keyof Scenario; label: string }[] = [
  { key: 'hasEvaluation', label: 'evaluation/' },
  { key: 'hasPreprocess', label: 'preprocess/' },
  { key: 'hasGroundtruthWorkspace', label: 'groundtruth_workspace/' },
  { key: 'hasInitialWorkspace', label: 'initial_workspace/' },
  { key: 'hasTaskConfig', label: 'task_config.json' },
]

const PACKAGE_PARTS: [string, string][] = [
  ['docs/', 'agent_system_prompt.md and task.md, the instructions this rubric checks'],
  ['evaluation/', 'main.py, pass/fail checks against a reference database'],
  ['preprocess/', 'seeds the sandbox/db state before the agent runs'],
  ['groundtruth_workspace/', 'expected final state for comparison'],
  ['initial_workspace/', 'starting files handed to the agent'],
  ['task_config.json', 'declares required MCP servers & local tools'],
]

function ComponentDots({ s }: { s: Scenario }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {COMPONENT_KEYS.map(({ key, label }) => (
        <span
          key={key}
          title={`${label} ${s[key] ? 'present' : 'absent'}`}
          className={`h-[7px] w-[7px] rounded-sm ${s[key] ? 'bg-accent/80' : 'bg-raise'}`}
        />
      ))}
    </div>
  )
}

type Tab = 'overview' | 'scenarios' | 'rubric'
type StatusFilter = 'all' | 'implemented' | 'implementing'

export function EnvironmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const env = id ? getEnvironment(id) : undefined
  const [tab, setTab] = useState<Tab>('overview')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const scenarioRows = useMemo(() => {
    if (!env) return []
    const q = query.trim().toLowerCase()
    return env.scenarios
      .filter((s) => status === 'all' || s.status === status)
      .filter((s) => !q || s.task.toLowerCase().includes(q) || s.developer.toLowerCase().includes(q))
      .map((s) => ({ ...s, id: `${s.developer}-${s.task}` }))
  }, [env, query, status])

  if (!env) {
    return (
      <Page crumbs={[{ label: 'Environments', to: '/environments' }, { label: 'Not found' }]}>
        <div className="py-16 text-center text-dim">Environment not found.</div>
      </Page>
    )
  }

  const rate = passRate(env)
  const sourceRun = getRun(env.sourceRunId)
  const byDev = developerBreakdown(env)
    .map((d) => ({ label: d.developer, a: d.passed, b: d.total - d.passed }))
    .sort((x, y) => y.a + y.b - (x.a + x.b))
  const counts = {
    all: env.scenarios.length,
    implemented: env.scenarios.filter((s) => s.status === 'implemented').length,
    implementing: env.scenarios.filter((s) => s.status === 'implementing').length,
  }

  const columns: Column<Scenario & { id: string }>[] = [
    {
      header: 'TASK',
      render: (s) => <span className="font-mono text-[12.5px] font-medium text-fg">{s.task}</span>,
    },
    {
      header: 'DEVELOPER',
      render: (s) => <span className="font-mono text-[12px] text-dim">{s.developer}</span>,
    },
    {
      header: 'STATUS',
      render: (s) =>
        s.status === 'implemented' ? (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ok">
            <CheckCircle2 size={13} /> implemented
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-warn">
            <CircleDashed size={13} /> implementing
          </span>
        ),
    },
    {
      header: 'RUBRIC ISSUE',
      render: (s) =>
        s.issues.length ? (
          <span className="text-[12px] text-warn">{s.issues.join('; ')}</span>
        ) : (
          <span className="text-faint">-</span>
        ),
    },
    { header: 'COMPONENTS', align: 'right', render: (s) => <ComponentDots s={s} /> },
  ]

  return (
    <Page crumbs={[{ label: 'Environments', to: '/environments' }, { label: env.name }]}>
      <div className="flex items-end justify-between gap-4 pb-5 pt-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-[20px] font-semibold tracking-tight text-fg">{env.name}</h1>
            <Badge tone="accent">
              <Workflow size={11} /> auto-synthesized
            </Badge>
            <Badge>
              <ShieldCheck size={11} /> verifier-graded
            </Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <a
              href={`https://github.com/${env.repo}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[12px] text-dim transition-colors hover:text-accent"
            >
              {env.repo} <ExternalLink size={11} />
            </a>
            <span className="text-faint">·</span>
            <span className="text-[12px] text-dim">
              source <span className="font-mono text-mid">{env.sourceRunId}</span>
            </span>
            <span className="text-faint">·</span>
            <span className="text-[12px] text-dim">
              format <span className="font-mono text-mid">toolathlon_gym</span>
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(`/runs/${env.sourceRunId}`)}>
            View source trace <ArrowRight size={13} />
          </Button>
        </div>
      </div>

      <Tabs<Tab>
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'scenarios', label: 'Scenarios', count: env.scenarios.length },
          { id: 'rubric', label: 'Rubric', count: env.rubric.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="pt-4">
          <div className="grid grid-cols-5 gap-3">
            <StatCard
              label="Pass rate"
              value={
                <span>
                  {rate.pct.toFixed(1)}
                  <span className="text-[15px] text-dim">%</span>
                </span>
              }
              sub={<Progress pct={rate.pct} tone={rate.pct >= 80 ? 'ok' : 'warn'} />}
            />
            <StatCard label="Scenarios" value={rate.total} sub={`${rate.passed} implemented · ${rate.total - rate.passed} in progress`} />
            <StatCard label="Developers" value={byDev.length} sub="branches scanned for new tasks" />
            <StatCard label="Rubric checks" value={env.rubric.length} sub="applied to every scenario" />
            <StatCard
              label="Tools"
              value={sourceRun ? toolCallCounts(sourceRun).length : 0}
              sub="github · notion · local"
            />
          </div>

          <div className="mt-3 grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <Card title="Scenarios by developer">
                <StackedBars items={byDev} />
                <div className="mt-3.5 flex items-center gap-4 border-t border-line pt-3">
                  <span className="flex items-center gap-1.5 text-[11.5px] text-dim">
                    <span className="h-2 w-2 rounded-sm bg-ok/80" /> implemented
                  </span>
                  <span className="flex items-center gap-1.5 text-[11.5px] text-dim">
                    <span className="h-2 w-2 rounded-sm bg-warn/70" /> implementing
                  </span>
                </div>
              </Card>
            </div>
            <div className="col-span-2">
              <Card title="Synthesis report">
                <p className="text-[12.5px] leading-relaxed text-dim">
                  Generated automatically from the ingested trace: branches scanned, scenarios extracted and graded
                  against the rubric, passing tasks published to{' '}
                  <code className="rounded bg-raise px-1 py-0.5 text-[11px] text-mid">finalpool</code>.
                </p>
                <ul className="mt-3 space-y-2 border-t border-line pt-3">
                  {[
                    ['Source trace', env.sourceRunId],
                    ['Scenarios synthesized', String(rate.total)],
                    ['Published to finalpool', String(rate.passed)],
                    ['Flagged for revision', String(rate.total - rate.passed)],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between text-[12.5px]">
                      <span className="text-dim">{k}</span>
                      <span className="tnum font-mono font-medium text-fg">{v}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      )}

      {tab === 'scenarios' && (
        <div className="pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SearchInput value={query} onChange={setQuery} placeholder="Search tasks or developers…" width="w-64" />
              <FilterChips<StatusFilter>
                options={['all', 'implemented', 'implementing']}
                value={status}
                onChange={setStatus}
                counts={counts}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-dim">
              components:
              {COMPONENT_KEYS.map(({ key, label }) => (
                <span key={key} className="flex items-center gap-1">
                  <span className="h-[7px] w-[7px] rounded-sm bg-accent/80" />
                  <code className="text-[10.5px] text-dim">{label.replace('/', '')}</code>
                </span>
              ))}
            </div>
          </div>
          <Table
            columns={columns}
            rows={scenarioRows}
            onRowClick={(s) => navigate(`/environments/${env.id}/scenarios/${s.task}`)}
            empty="No scenarios match the current filters."
          />
        </div>
      )}

      {tab === 'rubric' && (
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Card title="Verifier checks" pad={false}>
            <ul className="divide-y divide-line">
              {env.rubric.map((r, i) => (
                <li key={r.id} className="flex gap-3 px-4 py-3">
                  <span className="tnum mt-0.5 font-mono text-[11px] font-medium text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-mono text-[12.5px] font-medium text-fg">{r.name}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-dim">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Task package format">
            <p className="text-[12.5px] leading-relaxed text-dim">
              Each scenario is an executable task package following the{' '}
              <a
                href="https://github.com/eigent-ai/toolathlon_gym"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-accent hover:underline"
              >
                toolathlon_gym <ExternalLink size={10} />
              </a>{' '}
              <code className="rounded bg-raise px-1 py-0.5 text-[11px] text-mid">tasks/finalpool/&lt;task&gt;/</code>{' '}
              convention:
            </p>
            <ul className="mt-3 space-y-2 border-t border-line pt-3">
              {PACKAGE_PARTS.map(([name, desc]) => (
                <li key={name} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-faint" />
                  <p className="text-[12px] leading-relaxed text-dim">
                    <code className="text-mid">{name}</code>: {desc}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </Page>
  )
}
