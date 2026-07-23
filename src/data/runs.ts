import run8Raw from './run8.json'
import type { Run, ToolCall } from '../types'

export const runs: Run[] = [run8Raw as Run]

export function getRun(runId: string): Run | undefined {
  return runs.find((r) => r.runId === runId)
}

export function taskPrompt(run: Run): string {
  return run.turns.find((t) => t.role === 'user')?.content ?? ''
}

export function toolCallCounts(run: Run): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const t of run.turns) {
    for (const tc of t.toolCalls ?? []) {
      counts.set(tc.name, (counts.get(tc.name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function toolCallIndex(run: Run): Map<string, ToolCall & { turnIndex: number }> {
  const index = new Map<string, ToolCall & { turnIndex: number }>()
  for (const t of run.turns) {
    for (const tc of t.toolCalls ?? []) {
      index.set(tc.id, { ...tc, turnIndex: t.index })
    }
  }
  return index
}

export function finalAssistantSummary(run: Run): string {
  const assistantTurns = run.turns.filter((t) => t.role === 'assistant' && t.content)
  return assistantTurns[assistantTurns.length - 1]?.content ?? ''
}

export function namespaceOf(toolName: string): string {
  const i = toolName.indexOf('_')
  if (toolName.startsWith('local_')) return 'local'
  if (toolName.startsWith('github_')) return 'github'
  if (toolName.startsWith('notion_')) return 'notion'
  return i === -1 ? toolName : toolName.slice(0, i)
}

const ERROR_PATTERNS = [/^error[:\s]/i, /not allowed/i, /access denied/i, /is required$/i, /failed to /i]

export function isToolError(content: string | undefined): boolean {
  if (!content) return false
  const text = content.length > 300 ? content.slice(0, 300) : content
  return ERROR_PATTERNS.some((p) => p.test(text))
}

export function namespaceBreakdown(run: Run): { namespace: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const t of run.turns) {
    for (const tc of t.toolCalls ?? []) {
      const ns = namespaceOf(tc.name)
      counts.set(ns, (counts.get(ns) ?? 0) + 1)
    }
  }
  return [...counts.entries()].map(([namespace, count]) => ({ namespace, count })).sort((a, b) => b.count - a.count)
}

export function toolErrors(run: Run): { turnIndex: number; toolName: string; content: string }[] {
  const idIndex = toolCallIndex(run)
  const errors: { turnIndex: number; toolName: string; content: string }[] = []
  for (const t of run.turns) {
    if (t.role === 'tool' && isToolError(t.content) && t.toolCallId) {
      const tc = idIndex.get(t.toolCallId)
      errors.push({ turnIndex: t.index, toolName: tc?.name ?? 'unknown', content: t.content ?? '' })
    }
  }
  return errors
}

export interface ToolStat {
  name: string
  namespace: string
  calls: number
  totalResultChars: number
  avgResultChars: number
  errors: number
  runIds: string[]
}

export function allToolStats(): ToolStat[] {
  const stats = new Map<string, ToolStat>()
  for (const run of runs) {
    const idIndex = toolCallIndex(run)
    for (const t of run.turns) {
      for (const tc of t.toolCalls ?? []) {
        const s = stats.get(tc.name) ?? {
          name: tc.name,
          namespace: namespaceOf(tc.name),
          calls: 0,
          totalResultChars: 0,
          avgResultChars: 0,
          errors: 0,
          runIds: [],
        }
        s.calls += 1
        if (!s.runIds.includes(run.runId)) s.runIds.push(run.runId)
        stats.set(tc.name, s)
      }
      if (t.role === 'tool' && t.toolCallId) {
        const tc = idIndex.get(t.toolCallId)
        if (tc) {
          const s = stats.get(tc.name)
          if (s) {
            s.totalResultChars += t.content?.length ?? 0
            if (isToolError(t.content)) s.errors += 1
          }
        }
      }
    }
  }
  return [...stats.values()]
    .map((s) => ({ ...s, avgResultChars: s.calls ? Math.round(s.totalResultChars / s.calls) : 0 }))
    .sort((a, b) => b.calls - a.calls)
}
