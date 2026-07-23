import { useState } from 'react'
import { Page, Card, FilterChips } from '../components/ui'
import { environments } from '../data/environments'
import { Cpu, ShieldCheck } from 'lucide-react'

const DEFICITS = [
  'Precondition verification before acting',
  'Tool-call argument completeness',
  'Spec-language compliance',
]

const MODELS = ['Qwen3-4B', 'Qwen3-8B', 'Qwen3-30B-A3B'] as const
const ALGORITHMS = ['GRPO', 'PPO', 'DPO'] as const

const STATIC_ROWS: [string, string][] = [
  ['Adapter', 'LoRA · rank 16 (~5% of params)'],
  ['Rollout budget', '150 steps / capability'],
]

export function Train() {
  const env = environments[0]
  const [selected, setSelected] = useState(DEFICITS[0])
  const [model, setModel] = useState<(typeof MODELS)[number]>('Qwen3-8B')
  const [algorithm, setAlgorithm] = useState<(typeof ALGORITHMS)[number]>('GRPO')

  return (
    <Page crumbs={[{ label: 'Train' }]}>
      <div className="flex items-start justify-between gap-4 pb-5 pt-7">
        <h1 className="text-[22px] font-semibold tracking-tight text-fg">Train</h1>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2">
          <Card title="Select deficit" pad={false}>
            <ul className="divide-y divide-line">
              {DEFICITS.map((d) => (
                <li key={d}>
                  <button
                    onClick={() => setSelected(d)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-[12.5px] transition-colors ${
                      selected === d ? 'bg-raise text-fg' : 'text-mid hover:bg-hover'
                    }`}
                  >
                    {d}
                    {selected === d && <span className="h-[6px] w-[6px] rounded-full bg-accent" />}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="col-span-3 space-y-3">
          <Card title="Environment attached">
            <div className="flex items-center gap-2.5">
              <Cpu size={14} className="text-accent" />
              <span className="font-mono text-[12.5px] font-medium text-fg">{env.name}</span>
              <span className="tnum ml-auto font-mono text-[11.5px] text-dim">{env.scenarios.length} scenarios</span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-dim">
              Targeting: <span className="text-mid">{selected}</span>
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-line pt-2.5 text-[12px] text-dim">
              <ShieldCheck size={12} className="text-dim" />
              Verifier: <span className="font-mono text-mid">{env.rubric.length} rubric checks</span> from this
              environment, used directly as the reward signal
            </div>
          </Card>

          <Card title="Run configuration" pad={false}>
            <ul className="divide-y divide-line">
              <li className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
                <span className="text-dim">Base model</span>
                <FilterChips options={MODELS} value={model} onChange={setModel} />
              </li>
              <li className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
                <span className="text-dim">Algorithm</span>
                <FilterChips options={ALGORITHMS} value={algorithm} onChange={setAlgorithm} />
              </li>
              {STATIC_ROWS.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
                  <span className="text-dim">{k}</span>
                  <span className="font-mono font-medium text-fg">{v}</span>
                </li>
              ))}
              <li className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
                <span className="text-dim">Environment source</span>
                <span className="font-mono font-medium text-fg">
                  {env.repo.split('/')[1].toLowerCase()} (this synthesized env)
                </span>
              </li>
            </ul>
          </Card>

        </div>
      </div>
    </Page>
  )
}
