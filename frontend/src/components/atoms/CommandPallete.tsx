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
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`absolute ${yPosition}-4 ${xPosition}-4 z-[1000] text-end`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-end gap-3 text-start">
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
      {isHovered && (
        <span className="bg-yellow-300 px-2 py-1 rounded">
          No podras interactuar con el mapa mientras estes en la paleta de
          filtros
        </span>
      )}
    </div>
  )
}

export default CommandPallete
