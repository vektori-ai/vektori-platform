export type TurnRole = 'user' | 'assistant' | 'tool'

export interface ToolCall {
  id: string
  name: string
  args: unknown
}

export interface Turn {
  index: number
  role: TurnRole
  thinking?: string
  content?: string
  toolCalls?: ToolCall[]
  toolCallId?: string
}

export interface KeyStats {
  interaction_turns: number
  tool_calls: number
  agent_llm_requests: number
  total_tokens: number
  input_tokens: number
  output_tokens: number
  cached_input_tokens: number
  non_cached_input_tokens: number
  max_sequence_tokens: number
  max_sequence_input_tokens: number
  max_sequence_output_tokens: number
  max_input_tokens: number
  max_output_tokens: number
  total_turns: number
  total_messages: number
  truncations: number
  user_input_turns: number
  assistant_turns: number
}

export interface Run {
  runId: string
  status: string
  keyStats: KeyStats
  turns: Turn[]
}

export type ScenarioStatus = 'implemented' | 'implementing'

export interface Scenario {
  developer: string
  task: string
  status: ScenarioStatus
  issues: string[]
  hasEvaluation: boolean
  hasPreprocess: boolean
  hasGroundtruthWorkspace: boolean
  hasInitialWorkspace: boolean
  hasTaskConfig: boolean
}

export interface RubricCheck {
  id: string
  name: string
  detail: string
}

export interface Environment {
  id: string
  name: string
  sourceRunId: string
  repo: string
  description: string
  rubric: RubricCheck[]
  scenarios: Scenario[]
}
