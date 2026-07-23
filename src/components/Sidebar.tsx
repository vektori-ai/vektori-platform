import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  ListTree,
  Wrench,
  BookOpen,
  ArrowUpRight,
  ChevronsUpDown,
  SquareTerminal,
  Microscope,
  GraduationCap,
} from 'lucide-react'

const platformNav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/synthesize', label: 'Synthesizer', icon: SquareTerminal, end: false },
  { to: '/environments', label: 'Environments', icon: Boxes, end: false },
  { to: '/capability-deficits', label: 'Capability deficits', icon: Microscope, end: false },
  { to: '/train', label: 'Train', icon: GraduationCap, end: false },
  { to: '/runs', label: 'Runs', icon: ListTree, end: false },
  { to: '/tools', label: 'Tools', icon: Wrench, end: false },
]

function Logomark() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black">
      <img src="/logo.png" alt="" className="h-full w-full object-cover" />
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <p className="px-2.5 pb-1.5 pt-5 text-[10.5px] font-semibold tracking-[0.08em] text-faint">{children}</p>
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-[232px] shrink-0 flex-col border-r border-line bg-bg">
      <div className="flex items-center gap-2.5 px-4 pb-2 pt-4">
        <Logomark />
        <div className="leading-tight">
          <div className="text-[13.5px] font-semibold tracking-tight text-fg">Vektori</div>
          <div className="text-[10.5px] text-dim">synthetic RL environments</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <SectionLabel>PLATFORM</SectionLabel>
        <nav className="space-y-px">
          {platformNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-raise text-fg' : 'text-mid hover:bg-surface hover:text-fg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} strokeWidth={2} className={isActive ? 'text-accent' : 'text-dim group-hover:text-mid'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <SectionLabel>RESOURCES</SectionLabel>
        <nav className="space-y-px">
          <a
            href="https://github.com/eigent-ai/toolathlon_gym"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium text-mid transition-colors hover:bg-surface hover:text-fg"
          >
            <BookOpen size={15} strokeWidth={2} className="text-dim group-hover:text-mid" />
            Task format spec
            <ArrowUpRight size={12} className="ml-auto text-faint" />
          </a>
        </nav>
      </div>

      <div className="space-y-2 border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-2">
          <span className="relative flex h-[7px] w-[7px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok/50" />
            <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-ok" />
          </span>
          <div className="leading-tight">
            <p className="text-[11.5px] font-medium text-mid">Synthesizer online</p>
            <p className="text-[10.5px] text-dim">run8 · 1 env generated</p>
          </div>
        </div>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-raise text-[10px] font-semibold text-mid">
            L
          </div>
          <span className="flex-1 truncate text-[12.5px] font-medium text-mid">Laxman</span>
          <ChevronsUpDown size={13} className="text-faint" />
        </button>
      </div>
    </aside>
  )
}
