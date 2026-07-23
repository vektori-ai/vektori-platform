import type { ReactNode } from 'react'

/**
 * Dark terminal panel — the one deliberately dark island on the light theme.
 * Lines are composed by callers from the exported span helpers.
 */
export function TerminalCard({
  title,
  meta,
  footer,
  children,
}: {
  title: string
  meta?: ReactNode
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-[#242422] bg-[#161615] shadow-xs">
      <div className="flex items-center gap-2 border-b border-[#242422] px-3.5 py-2">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3a3a38]" />
          <span className="h-2 w-2 rounded-full bg-[#3a3a38]" />
          <span className="h-2 w-2 rounded-full bg-[#3a3a38]" />
        </span>
        <span className="ml-1 font-mono text-[11px] text-[#8a8a86]">{title}</span>
        {meta && <span className="ml-auto">{meta}</span>}
      </div>
      <div className="flex-1 space-y-1.5 px-4 py-3.5 font-mono text-[12px] leading-relaxed">{children}</div>
      {footer && (
        <div className="flex items-center justify-between gap-3 border-t border-[#242422] px-4 py-2.5 font-mono text-[11.5px]">
          {footer}
        </div>
      )}
    </div>
  )
}

export function TLine({ children }: { children: ReactNode }) {
  return <p className="whitespace-pre-wrap text-[#c9c9c5]">{children}</p>
}

export function TPrompt({ children }: { children: ReactNode }) {
  return (
    <p className="whitespace-pre-wrap text-[#eceae6]">
      <span className="select-none text-[#8a8a86]">$ </span>
      {children}
    </p>
  )
}

export function TOk({ children }: { children: ReactNode }) {
  return (
    <p className="whitespace-pre-wrap text-[#c9c9c5]">
      <span className="text-[#82c29b]">✓ </span>
      {children}
    </p>
  )
}

export function TDim({ children }: { children: ReactNode }) {
  return <span className="text-[#8a8a86]">{children}</span>
}

export function THi({ children }: { children: ReactNode }) {
  return <span className="font-medium text-[#eceae6]">{children}</span>
}
