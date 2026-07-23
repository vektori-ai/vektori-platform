import envRaw from './environment.json'
import type { Environment } from '../types'

export const environments: Environment[] = [envRaw as Environment]

export function getEnvironment(id: string): Environment | undefined {
  return environments.find((e) => e.id === id)
}

export function passRate(env: Environment): { passed: number; total: number; pct: number } {
  const passed = env.scenarios.filter((s) => s.status === 'implemented').length
  const total = env.scenarios.length
  return { passed, total, pct: total ? (passed / total) * 100 : 0 }
}

export function developerBreakdown(env: Environment): { developer: string; passed: number; total: number }[] {
  const map = new Map<string, { passed: number; total: number }>()
  for (const s of env.scenarios) {
    const entry = map.get(s.developer) ?? { passed: 0, total: 0 }
    entry.total += 1
    if (s.status === 'implemented') entry.passed += 1
    map.set(s.developer, entry)
  }
  return [...map.entries()].map(([developer, v]) => ({ developer, ...v }))
}
