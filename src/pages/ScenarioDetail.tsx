import { useParams, useNavigate } from 'react-router-dom'
import { Page, Card, Button } from '../components/ui'
import { TerminalCard, TLine, TDim } from '../components/TerminalCard'
import { getEnvironment } from '../data/environments'
import type { Scenario, RubricCheck } from '../types'
import { CheckCircle2, CircleDashed, ArrowRight, FileCode2 } from 'lucide-react'

const COMPONENT_KEYS: { key: keyof Scenario; path: string }[] = [
  { key: 'hasEvaluation', path: 'evaluation/main.py' },
  { key: 'hasPreprocess', path: 'preprocess/seed.py' },
  { key: 'hasGroundtruthWorkspace', path: 'groundtruth_workspace/' },
  { key: 'hasInitialWorkspace', path: 'initial_workspace/' },
  { key: 'hasTaskConfig', path: 'task_config.json' },
]

/** Renders a rubric's stated check as the literal assertion it describes — this environment's rubric text IS its verifier logic. */
function assertionFor(r: RubricCheck): string[] {
  const lines = [`# ${r.id}: ${r.name}`]
  if (/present/i.test(r.name)) {
    const file = r.name.split(':')[0].trim()
    lines.push(`assert exists("docs/${file}")`, `assert len(content.strip()) > 0`)
  }
  if (/english/i.test(r.name) || /CJK/i.test(r.detail)) {
    lines.push(`assert not contains_cjk(content)  # ${r.detail}`)
  }
  if (lines.length === 1) lines.push(`# ${r.detail}`)
  return lines
}

export function ScenarioDetail() {
  const { id, task } = useParams()
  const navigate = useNavigate()
  const env = id ? getEnvironment(id) : undefined
  const scenario = env?.scenarios.find((s) => s.task === task)

  if (!env || !scenario) {
    return (
      <Page crumbs={[{ label: 'Environments', to: '/environments' }, { label: 'Not found' }]}>
        <div className="py-16 text-center text-dim">Scenario not found.</div>
      </Page>
    )
  }

  const passed = scenario.status === 'implemented'

  return (
    <Page
      crumbs={[
        { label: 'Environments', to: '/environments' },
        { label: env.name, to: `/environments/${env.id}` },
        { label: scenario.task },
      ]}
    >
      <div className="flex items-end justify-between gap-4 pb-5 pt-7">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate font-mono text-[20px] font-medium tracking-tight text-fg">{scenario.task}</h1>
            {passed ? (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ok">
                <CheckCircle2 size={14} /> implemented
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-warn">
                <CircleDashed size={14} /> implementing
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[12.5px] text-dim">
            developer <span className="font-mono text-mid">{scenario.developer}</span> · package{' '}
            <span className="font-mono text-mid">tasks/finalpool/{scenario.task}/</span>
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/environments/${env.id}`)}>
          Back to environment <ArrowRight size={13} />
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3 space-y-3">
          <Card title="Task package contents">
            <ul className="divide-y divide-line">
              {COMPONENT_KEYS.map(({ key, path }) => (
                <li key={key} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className={`h-[7px] w-[7px] shrink-0 rounded-sm ${scenario[key] ? 'bg-accent/80' : 'bg-raise'}`} />
                  <span className="flex-1 font-mono text-[12.5px] text-mid">{path}</span>
                  <span className={`text-[11px] font-medium ${scenario[key] ? 'text-ok' : 'text-faint'}`}>
                    {scenario[key] ? 'present' : 'absent'}
                  </span>
                </li>
              ))}
              <li className="flex items-center gap-3 py-2.5">
                <span className="h-[7px] w-[7px] shrink-0 rounded-sm bg-accent/80" />
                <span className="flex-1 font-mono text-[12.5px] text-mid">docs/agent_system_prompt.md + task.md</span>
                <span className="text-[11px] font-medium text-ok">present</span>
              </li>
            </ul>
          </Card>

          {scenario.issues.length > 0 && (
            <Card title="Rubric issue">
              <p className="text-[12.5px] leading-relaxed text-warn">{scenario.issues.join('; ')}</p>
              <p className="mt-2 text-[11.5px] text-dim">
                Flagged automatically at synthesis time. This package was withheld from{' '}
                <code className="rounded bg-raise px-1 py-0.5 text-[11px] text-mid">finalpool</code> until fixed.
              </p>
            </Card>
          )}
        </div>

        <div className="col-span-2">
          <TerminalCard title={`${scenario.task} · verifier`}>
            <div className="flex items-center gap-2 pb-1">
              <FileCode2 size={13} className="text-[#8a8a86]" />
              <span className="text-[#eceae6]">evaluation/main.py</span>
            </div>
            {env.rubric.map((r) => (
              <div key={r.id} className="pt-2">
                {assertionFor(r).map((l, i) => (
                  <TLine key={i}>
                    {i === 0 ? <TDim>{l}</TDim> : <span className="text-[#c9c9c5]">{l}</span>}
                  </TLine>
                ))}
              </div>
            ))}
            <div className="mt-3 border-t border-[#242422] pt-2.5">
              <TLine>
                {passed ? (
                  <span className="text-[#82c29b]">✓ {env.rubric.length}/{env.rubric.length} checks passed</span>
                ) : (
                  <span className="text-[#c9a25a]">
                    ✗ {env.rubric.length - scenario.issues.length}/{env.rubric.length} checks passed
                  </span>
                )}
              </TLine>
            </div>
          </TerminalCard>
          <p className="mt-2.5 text-[11px] leading-relaxed text-faint">
            Rendered from this environment's rubric definition. Every scenario is graded against the same{' '}
            {env.rubric.length} executable checks, not a per-task LLM judgment call.
          </p>
        </div>
      </div>
    </Page>
  )
}
