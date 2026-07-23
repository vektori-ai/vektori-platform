import type { ReactNode } from 'react'

type Tone = 'neutral' | 'ok' | 'info' | 'warn' | 'err' | 'accent'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-raise text-mid border-line-2',
  ok: 'bg-ok/10 text-ok border-ok/25',
  info: 'bg-info/10 text-info border-info/25',
  warn: 'bg-warn/10 text-warn border-warn/25',
  err: 'bg-err/10 text-err border-err/25',
  accent: 'bg-accent/10 text-accent border-accent/25',
}

const dotClasses: Record<Tone, string> = {
  neutral: 'bg-dim',
  ok: 'bg-ok',
  info: 'bg-info',
  warn: 'bg-warn',
  err: 'bg-err',
  accent: 'bg-accent',
}

export function Badge({
  tone = 'neutral',
  dot,
  mono,
  children,
}: {
  tone?: Tone
  dot?: boolean
  mono?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-[3px] text-[11px] font-medium leading-none ${
        mono ? 'font-mono' : ''
      } ${toneClasses[tone]}`}
    >
      {dot && <span className={`h-[5px] w-[5px] rounded-full ${dotClasses[tone]}`} />}
      {children}
    </span>
  )
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'success':
      return 'ok'
    case 'running':
      return 'info'
    case 'timeout':
      return 'warn'
    case 'failed':
    case 'error':
      return 'err'
    default:
      return 'neutral'
  }
}
