import { DialogDescription } from '@radix-ui/react-dialog'
import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import type { ReactNode } from 'react'

type ModalType = 'Companies' | 'Lines'
type ModalProps = {
  trigger: ReactNode
  body: ReactNode
  type: ModalType
}

const getModalText = (type: ModalType) => {
  switch (type) {
    case 'Companies':
      return {
        header: 'Administrar empresas',
        description: '',
      }
    case 'Lines':
      return {
        header: 'Administrar lineas de transporte',
        description: '',
      }
  }
}

const Modal = ({ trigger, body, type }: ModalProps) => {
  const modalText = useMemo(() => getModalText(type), [type])
  return (
    <Dialog key={type}>
      <DialogOverlay className="bg-black/50 backdrop-blur-sm fixed inset-0 z-[2002]" />
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="z-[2005]">
        <DialogHeader>
          <DialogTitle>{modalText.header}</DialogTitle>
          <DialogDescription>{modalText.description}</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  )
}

export default Modal
