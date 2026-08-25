'use client'

import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'

import { withClassName } from '@/lib/sx'

const styles = stylex.create({
  root: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'var(--popover)',
    color: 'var(--popover-foreground)',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '0.5rem',
    height: '1rem',
    width: '1rem',
    flexShrink: 0,
    color: 'var(--muted-foreground)',
  },
  input: {
    display: 'flex',
    height: '2.75rem',
    width: '100%',
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'transparent',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outline: 'none',
    '::placeholder': {
      color: 'var(--muted-foreground)',
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  list: {
    maxHeight: '300px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  empty: {
    paddingTop: '1.5rem',
    paddingBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
  item: {
    position: 'relative',
    display: 'flex',
    cursor: 'default',
    userSelect: 'none',
    alignItems: 'center',
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: '0.5rem',
    paddingBlock: '0.375rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    outline: 'none',
    ':is([data-disabled="true"])': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
    ':is([data-selected="true"])': {
      backgroundColor: 'var(--accent)',
      color: 'var(--accent-foreground)',
    },
  },
})

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    {...withClassName(className, stylex.props(styles.root))}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div {...stylex.props(styles.inputWrap)} cmdk-input-wrapper="">
    <Search {...stylex.props(styles.icon)} />
    <CommandPrimitive.Input
      ref={ref}
      {...withClassName(className, stylex.props(styles.input))}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    {...withClassName(className, stylex.props(styles.list))}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    {...withClassName(className, stylex.props(styles.empty))}
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    {...withClassName(className, stylex.props(styles.item))}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

export { Command, CommandInput, CommandList, CommandEmpty, CommandItem }
