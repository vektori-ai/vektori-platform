import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'

const TRUNCATE_AT = 1200

export function CodeBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const isLong = text.length > TRUNCATE_AT
  const shown = expanded || !isLong ? text : text.slice(0, TRUNCATE_AT)

  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-bg">
      <div className="flex items-center justify-between border-b border-line px-2.5 py-1">
        {isLong ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-medium text-dim transition-colors hover:text-fg"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {expanded ? 'Collapse' : `Show full (${text.length.toLocaleString()} chars)`}
          </button>
        ) : (
          <span className="tnum text-[11px] text-faint">{text.length.toLocaleString()} chars</span>
        )}
        <button
          onClick={() => {
            navigator.clipboard?.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
          className="flex items-center gap-1 text-[11px] text-faint transition-colors hover:text-mid"
        >
          {copied ? <Check size={12} className="text-ok" /> : <Copy size={12} />}
        </button>
      </div>
      <pre
        className={`overflow-x-auto whitespace-pre-wrap break-words px-3 py-2 font-mono text-[11.5px] leading-relaxed text-mid ${
          !expanded && isLong ? 'max-h-64 overflow-y-hidden' : 'max-h-[32rem] overflow-y-auto'
        }`}
      >
        {shown}
        {!expanded && isLong && <span className="text-faint">…</span>}
      </pre>
    </div>
  )
}
