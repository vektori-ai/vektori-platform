import type { ReactNode } from 'react'

export interface Column<T> {
  header: string
  width?: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
}

const alignClass = (a?: 'left' | 'right' | 'center') =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

export function Table<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  empty = 'No records.',
}: {
  columns: Column<T>[]
  rows: T[]
  onRowClick?: (row: T) => void
  empty?: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.header}
                style={{ width: col.width }}
                className={`px-4 py-2 text-[11px] font-medium tracking-wide text-dim ${alignClass(col.align)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-line/60 transition-colors last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-hover' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 align-middle text-mid ${alignClass(col.align)}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-[13px] text-dim">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
