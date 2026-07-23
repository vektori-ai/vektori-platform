import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Page, Card, Button, FilterChips } from '../components/ui'
import { Badge, statusTone } from '../components/Badge'
import { StatInline } from '../components/StatCard'
import { UsageBars } from '../components/Bars'
import { TurnItem } from '../components/TurnItem'
import { TerminalCard } from '../components/TerminalCard'
import { getRun, taskPrompt, toolCallCounts, finalAssistantSummary, isToolError } from '../data/runs'
import { environments } from '../data/environments'
import { formatTokens } from '../lib/format'
import type { Turn } from '../types'
import { AlertTriangle, Workflow, ChevronDown, ChevronRight } from 'lucide-react'

type TurnFilter = 'all' | 'assistant' | 'tools' | 'errors'

export function RunDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const run = id ? getRun(id) : undefined
  const [filter, setFilter] = useState<TurnFilter>('all')
  const [taskOpen, setTaskOpen] = useState(false)

  const toolNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const t of run?.turns ?? []) {
      for (const tc of t.toolCalls ?? []) m.set(tc.id, tc.name)
    }
    return m
  }, [run])

  const visibleTurns = useMemo(() => {
    if (!run) return []
    const isErr = (t: Turn) => t.role === 'tool' && isToolError(t.content)
    switch (filter) {
      case 'assistant':
        return run.turns.filter((t) => t.role === 'assistant')
      case 'tools':
        return run.turns.filter((t) => t.role === 'tool' || (t.toolCalls?.length ?? 0) > 0)
      case 'errors':
        return run.turns.filter(isErr)
      default:
        return run.turns
    }
  }, [run, filter])

  if (!run) {
    return (
      <Page crumbs={[{ label: 'Runs', to: '/runs' }, { label: 'Not found' }]}>
        <div className="py-16 text-center text-dim">Run not found.</div>
      </Page>
    )
  }

  const k = run.keyStats
  const usage = toolCallCounts(run)
  const errors = run.turns.filter((t) => t.role === 'tool' && isToolError(t.content))
  const derivedEnv = environments.find((e) => e.sourceRunId === run.runId)
  const task = taskPrompt(run)

  return (
    <Page crumbs={[{ label: 'Runs', to: '/runs' }, { label: run.runId }]}>
      <div className="flex items-end justify-between gap-4 pb-4 pt-7">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-[20px] font-medium tracking-tight text-fg">{run.runId}</h1>
            <Badge tone={statusTone(run.status)} dot>
              {run.status}
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl truncate text-[13px] text-dim">{task}</p>
        </div>
        {derivedEnv && (
          <Button variant="secondary" onClick={() => navigate(`/environments/${derivedEnv.id}`)}>
            <Workflow size={13} className="text-accent" /> Synthesized env · {derivedEnv.scenarios.length} scenarios
          </Button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-x-6 gap-y-3 rounded-lg border border-line bg-surface shadow-xs px-4 py-3">
        <StatInline label="Tool calls" value={k.tool_calls} />
        <StatInline label="LLM requests" value={k.agent_llm_requests} />
        <StatInline label="Messages" value={k.total_messages} />
        <StatInline label="Total tokens" value={formatTokens(k.total_tokens)} />
        <StatInline label="Errors" value={<span className={errors.length ? 'text-err' : undefined}>{errors.length}</span>} />
        <StatInline label="Input tokens" value={formatTokens(k.input_tokens)} />
        <StatInline label="Output tokens" value={formatTokens(k.output_tokens)} />
        <StatInline label="Cached input" value={formatTokens(k.cached_input_tokens)} />
        <StatInline label="Max request" value={formatTokens(k.max_input_tokens)} />
        <StatInline label="Truncations" value={k.truncations} />
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
        <button
          onClick={() => setTaskOpen(!taskOpen)}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-hover"
        >
          {taskOpen ? <ChevronDown size={13} className="text-dim" /> : <ChevronRight size={13} className="text-dim" />}
          <span className="text-[12.5px] font-semibold text-fg">Task prompt</span>
          {!taskOpen && <span className="min-w-0 flex-1 truncate text-[12px] text-dim">{task}</span>}
        </button>
        {taskOpen && (
          <p className="whitespace-pre-wrap border-t border-line px-4 py-3 text-[13px] leading-relaxed text-mid">{task}</p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-3">
        <div className="rounded-lg border border-line bg-surface shadow-xs">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="text-[12.5px] font-semibold text-fg">Transcript</h2>
            <div className="flex items-center gap-2.5">
              <span className="tnum text-[11.5px] text-dim">
                {visibleTurns.length} of {run.turns.length} turns
              </span>
              <FilterChips<TurnFilter> options={['all', 'assistant', 'tools', 'errors']} value={filter} onChange={setFilter} />
            </div>
          </div>
          <div className="px-4 py-2">
            {visibleTurns.map((t) => (
              <TurnItem
                key={t.index}
                turn={t}
                toolName={t.toolCallId ? toolNameById.get(t.toolCallId) : undefined}
                isError={t.role === 'tool' && isToolError(t.content)}
              />
            ))}
            {visibleTurns.length === 0 && (
              <p className="py-10 text-center text-[12.5px] text-dim">No turns match this filter.</p>
            )}
          </div>
        </div>

        <div className="sticky top-16 space-y-3">
          <Card title="Tool usage">
            <UsageBars items={usage.slice(0, 10)} labelWidth="w-[132px]" />
            {usage.length > 10 && (
              <p className="tnum mt-2.5 border-t border-line pt-2 text-[11px] text-faint">
                +{usage.length - 10} more tools
              </p>
            )}
          </Card>

          {errors.length > 0 && (
            <div className="rounded-lg border border-err/25 bg-surface shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-err/20 px-4 py-2.5 text-[12.5px] font-semibold text-err">
                <AlertTriangle size={13} /> Errors ({errors.length})
              </div>
              <ul className="divide-y divide-line px-4">
                {errors.map((e) => (
                  <li key={e.index} className="py-2.5">
                    <a
                      href={`#turn-${e.index}`}
                      onClick={() => setFilter('all')}
                      className="font-mono text-[11.5px] font-medium text-err hover:underline"
                    >
                      #{e.index} · {toolNameById.get(e.toolCallId ?? '') ?? 'unknown'}
                    </a>
                    <p className="mt-0.5 truncate text-[11.5px] text-dim">{e.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <TerminalCard title={`${run.runId} · final summary`}>
            <p className="max-h-72 overflow-y-auto whitespace-pre-wrap text-[11.5px] leading-relaxed text-[#c9c9c5]">
              {finalAssistantSummary(run)}
            </p>
          </TerminalCard>
        </div>
      </div>
    </Page>
  )
}
