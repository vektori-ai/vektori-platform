import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/ui'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { TerminalCard, TPrompt, TOk, TDim, THi } from '../components/TerminalCard'
import { environments, passRate } from '../data/environments'
import { runs, toolErrors, allToolStats } from '../data/runs'
import { formatTokens } from '../lib/format'
import { Boxes, ListTree, Cpu, FileCheck2, ArrowRight } from 'lucide-react'

function Stagger({ i, children }: { i: number; children: ReactNode }) {
  return (
    <div className="tline" style={{ animationDelay: `${i * 160}ms` }}>
      {children}
    </div>
  )
}

export function Overview() {
  const navigate = useNavigate()

  const env = environments[0]
  const run = runs[0]
  const rate = passRate(env)
  const totalScenarios = environments.reduce((a, e) => a + e.scenarios.length, 0)
  const totalPassed = environments.reduce((a, e) => a + passRate(e).passed, 0)
  const totalTokens = runs.reduce((a, r) => a + r.keyStats.total_tokens, 0)
  const totalDevs = new Set(environments.flatMap((e) => e.scenarios.map((s) => s.developer))).size
  const rubricChecks = environments.reduce((a, e) => a + e.rubric.length, 0)
  const toolCount = allToolStats().length

  const logLines: ReactNode[] = [
    <TPrompt key="cmd">
      vektori synthesize run8.trace <TDim>--repo {env.repo}</TDim>
    </TPrompt>,
    <TOk key="ingest">
      ingested <THi>run8</THi>{' '}
      <TDim>
        · {run.keyStats.total_messages} messages · {formatTokens(totalTokens)} tokens · {run.keyStats.tool_calls} tool
        calls
      </TDim>
    </TOk>,
    <TOk key="tools">
      mapped <THi>{toolCount} tools</THi> <TDim>across github · notion · local</TDim>
    </TOk>,
    <TOk key="extract">
      extracted <THi>{totalScenarios} scenarios</THi> <TDim>from {totalDevs} developer branches</TDim>
    </TOk>,
    <TOk key="grade">
      graded against <THi>{rubricChecks} verifier checks</THi>{' '}
      <TDim>
        · {totalPassed} passed · {totalScenarios - totalPassed} flagged
      </TDim>
    </TOk>,
    <TOk key="publish">
      published <THi>{totalPassed} task packages</THi> <TDim>→ finalpool</TDim>
    </TOk>,
  ]

  return (
    <Page crumbs={[{ label: 'Overview' }]}>
      <PageHeader title="Overview" />

      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Environments synthesized"
          value={environments.length}
          sub={`from ${runs.length} ingested trace · ${toolCount} tools`}
          icon={<Boxes size={15} />}
        />
        <StatCard
          label="Scenarios"
          value={totalScenarios}
          sub={
            <span>
              <span className="text-ok">{totalPassed} verified</span> · {totalDevs} developers
            </span>
          }
          icon={<FileCheck2 size={15} />}
        />
        <StatCard
          label="Runs ingested"
          value={runs.length}
          sub={`${formatTokens(totalTokens)} tokens · ${runs.reduce((a, r) => a + toolErrors(r).length, 0)} errors flagged`}
          icon={<ListTree size={15} />}
        />
        <StatCard
          label="Models evaluated"
          value={1}
          sub={`${rate.pct.toFixed(1)}% baseline pass rate`}
          icon={<Cpu size={15} />}
        />
      </div>

      <div className="mt-3">
        <TerminalCard
          title="vektori · synthesis log"
          meta={
            <span className="flex items-center gap-1.5 rounded border border-[#2c3b31] bg-[#182219] px-1.5 py-[3px] font-mono text-[10.5px] leading-none text-[#82c29b]">
              <span className="h-[5px] w-[5px] rounded-full bg-[#82c29b]" />
              run8 · completed
            </span>
          }
          footer={
            <>
              <span className="flex min-w-0 items-center gap-2 text-[#c9c9c5]">
                <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#82c29b]" />
                <span className="truncate">
                  environment ready: <span className="font-medium text-[#eceae6]">benchtaskscollv3</span>{' '}
                  <span className="text-[#8a8a86]">· {rate.pct.toFixed(1)}% baseline pass rate</span>
                </span>
              </span>
              <button
                onClick={() => navigate('/synthesize')}
                className="flex shrink-0 items-center gap-1 text-[#8a8a86] transition-colors hover:text-[#eceae6]"
              >
                ▶ replay in Synthesizer <ArrowRight size={11} />
              </button>
            </>
          }
        >
          {logLines.map((line, i) => (
            <Stagger key={i} i={i}>
              {line}
            </Stagger>
          ))}
        </TerminalCard>
      </div>
    </Page>
  )
}
