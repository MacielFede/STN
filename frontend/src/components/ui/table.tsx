// components/ui/table.tsx

import * as React from 'react'
import type { TableHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils' // Asegurate de tener esta función o reemplazala con clsx o directamente quitá el cn() si no la usás

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  children: ReactNode
}

function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement> & {
  children: ReactNode
}

function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead className={cn('[&_tr]:border-b', className)} {...props}>
      {children}
    </thead>
  )
}

type TableBodyProps = HTMLAttributes<HTMLTableSectionElement> & {
  children: ReactNode
}

function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
      {children}
    </tbody>
  )
}

type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode
}

function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)} {...props}>
      {children}
    </tr>
  )
}

type TableCellProps = HTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode
}

function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props}>
      {children}
    </td>
  )
}

type TableHeadProps = HTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode
}

function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        'h-8 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
}
