import { useState } from 'react'
import type { Turn, ToolCall } from '../types'
import { CodeBlock } from './CodeBlock'
import { prettyArgs, prettyToolContent } from '../lib/format'
import { ChevronDown, ChevronRight, Wrench, User, Cpu, CornerDownRight, AlertTriangle } from 'lucide-react'

function roleMeta(role: Turn['role']) {
  switch (role) {
    case 'user':
      return { label: 'User', icon: User, tone: 'border-line-2 bg-raise text-mid' }
    case 'assistant':
      return { label: 'Assistant', icon: Cpu, tone: 'border-accent/30 bg-accent/8 text-accent' }
    case 'tool':
      return { label: 'Result', icon: CornerDownRight, tone: 'border-info/30 bg-info/10 text-info' }
  }
}

function Thinking({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[11.5px] font-medium text-dim transition-colors hover:text-mid"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Reasoning
        <span className="tnum text-[10.5px] text-faint">{text.length.toLocaleString()} chars</span>
      </button>
      {open && (
        <p className="mt-1.5 whitespace-pre-wrap border-l-2 border-line-2 pl-3 text-[12.5px] leading-relaxed text-dim">
          {text}
        </p>
      )}
    </div>
  )
}

function ToolCallCard({ tc }: { tc: ToolCall }) {
  const args = prettyArgs(tc.args)
  const isLong = args.length > 240
  const [open, setOpen] = useState(!isLong)
  return (
    <div className="mt-2 overflow-hidden rounded-md border border-line bg-surface">
      <button
        onClick={() => isLong && setOpen(!open)}
        className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left ${isLong ? 'transition-colors hover:bg-hover' : 'cursor-default'}`}
      >
        <Wrench size={12} className="shrink-0 text-accent" />
        <span className="font-mono text-[11.5px] font-medium text-fg">{tc.name}</span>
        {isLong && (
          <span className="flex items-center gap-1 text-[10.5px] text-faint">
            {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            {args.length.toLocaleString()} chars
          </span>
        )}
        <span className="ml-auto truncate font-mono text-[10px] text-faint">{tc.id}</span>
      </button>
      {open && (
        <div className="border-t border-line px-2.5 pb-2.5 pt-2">
          <CodeBlock text={args} />
        </div>
      )}
    </div>
  )
}

function ToolResult({ content, isError }: { content: string; isError?: boolean }) {
  const [open, setOpen] = useState(false)
  const preview = content.replace(/\s+/g, ' ').slice(0, 180)
  return (
    <div className={`mt-1.5 overflow-hidden rounded-md border ${isError ? 'border-err/30' : 'border-line'} bg-surface`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-hover"
      >
        <span className="mt-0.5 shrink-0 text-dim">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
        {!open && (
          <span className={`min-w-0 flex-1 truncate font-mono text-[11.5px] ${isError ? 'text-err/90' : 'text-dim'}`}>
            {preview}
          </span>
        )}
        {open && <span className="flex-1 text-[11.5px] font-medium text-mid">Result</span>}
        <span className="tnum ml-auto shrink-0 font-mono text-[10.5px] text-faint">
          {content.length.toLocaleString()} chars
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-2.5 pb-2.5 pt-2">
          <CodeBlock text={prettyToolContent(content)} />
        </div>
      )}
    </div>
  )
}

export function TurnItem({
  turn,
  toolName,
  isError,
}: {
  turn: Turn
  toolName?: string
  isError?: boolean
}) {
  const meta = roleMeta(turn.role)
  const Icon = meta.icon

  return (
    <div id={`turn-${turn.index}`} className="relative flex scroll-mt-16 gap-3 py-2.5">
      <div className="relative flex flex-col items-center">
        <div
          className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
            isError ? 'border-err/40 bg-err/10 text-err' : meta.tone
          }`}
        >
          <Icon size={12} />
        </div>
        <div className="absolute top-6 h-full w-px bg-line" />
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[12px] font-semibold text-fg">{meta.label}</span>
          {turn.role === 'tool' && toolName && (
            <span className="rounded border border-line-2 bg-raise px-1.5 py-px font-mono text-[10.5px] text-mid">
              {toolName}
            </span>
          )}
          {isError && (
            <span className="inline-flex items-center gap-1 rounded border border-err/30 bg-err/10 px-1.5 py-px text-[10.5px] font-medium text-err">
              <AlertTriangle size={10} /> error
            </span>
          )}
          <span className="tnum font-mono text-[10.5px] text-faint">#{turn.index}</span>
        </div>

        {turn.thinking && <Thinking text={turn.thinking} />}

        {turn.content && turn.role !== 'tool' && (
          <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-mid">{turn.content}</p>
        )}

        {turn.role === 'tool' && turn.content && <ToolResult content={turn.content} isError={isError} />}

        {turn.toolCalls?.map((tc) => <ToolCallCard key={tc.id} tc={tc} />)}
      </div>
    </div>
  )
}
