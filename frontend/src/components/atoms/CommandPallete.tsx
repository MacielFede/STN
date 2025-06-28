import { useState } from 'react'
import { Button } from '../ui/button'
import type { ReactNode } from 'react'

type CommandPalleteProps = {
  yPosition: 'top' | 'bottom' | 'center'
  xPosition: 'right' | 'left' | 'center'
  children: ReactNode
  displayToogle: boolean
}

const CommandPallete = ({
  children,
  xPosition,
  yPosition,
  displayToogle,
}: CommandPalleteProps) => {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <div
      className={`absolute ${yPosition}-4 ${xPosition}-4 z-[1000] flex justify-end gap-3`}
    >
      <div
        className={`flex justify-end gap-3  flex-wrap ${isVisible ? '' : 'hidden'}`}
      >
        {children}
      </div>
      {displayToogle && (
        <Button
          className="bg-white hover:bg-amber-50"
          onClick={() => setIsVisible(!isVisible)}
        >
          <img
            src="/filter_icon.png"
            alt="Ocultar filtros"
            height={36}
            width={36}
          />
        </Button>
      )}
    </div>
  )
}

export default CommandPallete
