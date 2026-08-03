'use client'

import { createContext, useContext, useState, ReactNode, createElement } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'phone' | 'number' | 'file' | 'date'
export type DeviceView = 'desktop' | 'tablet' | 'mobile'
export type WidgetPosition = 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'fullscreen'
export type AnimationType = 'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'none'
export type TriggerType = 'time' | 'scroll' | 'exit' | 'click' | 'load' | 'manual'

export interface FieldOption {
  id: string
  label: string
  value: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder: string
  required: boolean
  options?: FieldOption[]
  helperText?: string
}

export interface BuilderState {
  // Content
  title: string
  subtitle: string
  buttonText: string
  successMessage: string
  // Fields
  fields: FormField[]
  // Theme
  primaryColor: string
  bgColor: string
  textColor: string
  borderRadius: number
  fontFamily: string
  // Behavior
  position: WidgetPosition
  animation: AnimationType
  showOverlay: boolean
  closeOnOverlay: boolean
  // Trigger
  trigger: TriggerType
  triggerDelay: number
  triggerScroll: number
  // Preview
  deviceView: DeviceView
  activeTab: string
}

// ─── Initial State ─────────────────────────────────────────────────────────────

const defaultFields: FormField[] = [
  { id: 'f1', type: 'text', label: 'Full Name', placeholder: 'John Doe', required: true },
  { id: 'f2', type: 'email', label: 'Work Email', placeholder: 'john@company.com', required: true },
  { id: 'f3', type: 'text', label: 'Company', placeholder: 'Acme Corp', required: false },
  { id: 'f4', type: 'textarea', label: 'Message', placeholder: 'How can we help you?', required: false },
]

const initialState: BuilderState = {
  title: 'Get in Touch',
  subtitle: 'Fill out the form below and we\'ll get back to you within 24 hours.',
  buttonText: 'Send Message',
  successMessage: 'Thanks! We\'ll be in touch soon.',
  fields: defaultFields,
  primaryColor: '#3b82f6',
  bgColor: '#ffffff',
  textColor: '#0f172a',
  borderRadius: 8,
  fontFamily: 'Inter',
  position: 'center',
  animation: 'fade',
  showOverlay: true,
  closeOnOverlay: true,
  trigger: 'load',
  triggerDelay: 3,
  triggerScroll: 50,
  deviceView: 'desktop',
  activeTab: 'content',
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface BuilderContextType {
  state: BuilderState
  update: (patch: Partial<BuilderState>) => void
  updateField: (id: string, patch: Partial<FormField>) => void
  addField: (type: FieldType) => void
  removeField: (id: string) => void
  reorderFields: (fromIndex: number, toIndex: number) => void
  resetToDefaults: () => void
}

const BuilderContext = createContext<BuilderContextType | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BuilderState>(initialState)

  const update = (patch: Partial<BuilderState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }

  const updateField = (id: string, patch: Partial<FormField>) => {
    setState(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...patch } : f),
    }))
  }

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `f${Date.now()}`,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1) + ' Field',
      placeholder: 'Enter value...',
      required: false,
    }
    setState(prev => ({ ...prev, fields: [...prev.fields, newField] }))
  }

  const removeField = (id: string) => {
    setState(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }))
  }

  const reorderFields = (fromIndex: number, toIndex: number) => {
    setState(prev => {
      const fields = [...prev.fields]
      const [moved] = fields.splice(fromIndex, 1)
      fields.splice(toIndex, 0, moved)
      return { ...prev, fields }
    })
  }

  const resetToDefaults = () => setState(initialState)

  return createElement(
    BuilderContext.Provider,
    { value: { state, update, updateField, addField, removeField, reorderFields, resetToDefaults } },
    children
  )
}

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used inside BuilderProvider')
  return ctx
}
