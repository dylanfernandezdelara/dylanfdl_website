'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'

import { withClassName } from '@/lib/sx'

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: 'var(--dialog-scrim)',
    backdropFilter: 'blur(10px)',
    ':is([data-state="open"])': {
      animationName: 'search-dialog-fade-in',
      animationDuration: '180ms',
      animationTimingFunction: 'ease-out',
    },
    ':is([data-state="closed"])': {
      animationName: 'search-dialog-fade-out',
      animationDuration: '120ms',
      animationTimingFunction: 'ease-in',
    },
  },
  content: {
    position: 'fixed',
    left: '50%',
    top: '16.667%',
    zIndex: 50,
    width: 'min(40rem, calc(100% - 2rem))',
    transform: 'translate(-50%, -50%)',
    gap: 0,
    overflow: 'hidden',
    borderRadius: '1rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundColor: 'var(--popover)',
    padding: 0,
    backdropFilter: 'blur(24px)',
    filter: 'saturate(130%)',
    ':is([data-state="open"])': {
      animationName: 'search-panel-materialize-in',
      animationDuration: '180ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    ':is([data-state="closed"])': {
      animationName: 'search-panel-materialize-out',
      animationDuration: '120ms',
      animationTimingFunction: 'ease-in',
    },
  },
  close: {
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    borderRadius: 'calc(var(--radius) - 4px)',
    opacity: 0.7,
    transitionProperty: 'opacity',
    ':hover': {
      opacity: 1,
    },
  },
  closeIcon: {
    height: '1rem',
    width: '1rem',
  },
})

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close
const DialogTitle = DialogPrimitive.Title
const DialogDescription = DialogPrimitive.Description

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    {...withClassName(className, stylex.props(styles.overlay))}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      {...withClassName(className, stylex.props(styles.content))}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close {...stylex.props(styles.close)}>
          <X {...stylex.props(styles.closeIcon)} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogContent,
}
