import type { ReactNode } from 'react'

type CommandPalleteProps = {
  yPosition: 'top' | 'bottom' | 'center'
  xPosition: 'right' | 'left' | 'center'
  children: ReactNode
}

const CommandPallete = ({
  children,
  xPosition,
  yPosition,
}: CommandPalleteProps) => {
  return (
    <div
      className={`absolute ${yPosition}-4 ${xPosition}-4 z-[1000] flex gap-3`}
    >
      {children}
    </div>
  )
}

export default CommandPallete
