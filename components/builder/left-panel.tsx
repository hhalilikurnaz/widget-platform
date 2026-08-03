'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useBuilder } from '@/lib/builder-store'
import type { FieldType, FormField } from '@/lib/builder-store'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Type, Mail, AlignLeft, ChevronDown, CheckSquare, Circle, Phone, Hash,
  Paperclip, Calendar, Plus, GripVertical, Trash2, Palette, MousePointer2,
  Zap, Globe, Settings2, FileText, LayoutTemplate, Layers
} from 'lucide-react'

const TABS = [
  { id: 'content',      label: 'Content',    icon: FileText      },
  { id: 'fields',       label: 'Fields',     icon: Layers        },
  { id: 'theme',        label: 'Theme',      icon: Palette       },
  { id: 'behavior',     label: 'Behavior',   icon: MousePointer2 },
  { id: 'trigger',      label: 'Trigger',    icon: Zap           },
  { id: 'templates',    label: 'Templates',  icon: LayoutTemplate },
  { id: 'localization', label: 'i18n',       icon: Globe         },
  { id: 'advanced',     label: 'Advanced',   icon: Settings2     },
]

const FIELD_TYPES: { type: FieldType; label: string; icon: typeof Type }[] = [
  { type: 'text',     label: 'Text',     icon: Type        },
  { type: 'email',    label: 'Email',    icon: Mail        },
  { type: 'textarea', label: 'Textarea', icon: AlignLeft   },
  { type: 'select',   label: 'Select',   icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio',    label: 'Radio',    icon: Circle      },
  { type: 'phone',    label: 'Phone',    icon: Phone       },
  { type: 'number',   label: 'Number',   icon: Hash        },
  { type: 'file',     label: 'File',     icon: Paperclip   },
  { type: 'date',     label: 'Date',     icon: Calendar    },
]

const FONT_OPTIONS = ['Inter', 'Geist', 'DM Sans', 'Sora', 'Nunito', 'Roboto', 'Poppins']
const POSITION_OPTIONS = ['center', 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'fullscreen']
const ANIMATION_OPTIONS = ['fade', 'slide-up', 'slide-down', 'zoom', 'none']
const TRIGGER_OPTIONS = [
  { value: 'load',   label: 'On page load' },
  { value: 'time',   label: 'After delay' },
  { value: 'scroll', label: 'On scroll' },
  { value: 'exit',   label: 'Exit intent' },
  { value: 'click',  label: 'On click' },
  { value: 'manual', label: 'Manual' },
]
const QUICK_TEMPLATES = [
  { name: 'Lead Capture',      title: 'Get in Touch',        subtitle: 'Fill out the form and we\'ll respond within 24h.',  btn: 'Send Message' },
  { name: 'Newsletter Signup', title: 'Stay in the Loop',    subtitle: 'Join 10,000+ readers. No spam, ever.',              btn: 'Subscribe Free' },
  { name: 'Book a Demo',       title: 'See it in Action',    subtitle: 'Schedule a 30-minute demo with our team.',           btn: 'Book Demo' },
  { name: 'Feedback Form',     title: 'Share Your Thoughts', subtitle: 'Your feedback helps us build a better product.',     btn: 'Submit Feedback' },
]

export function LeftPanel() {
  const { state, update, addField, removeField, updateField } = useBuilder()
  const [activeTab, setActiveTab] = useState('content')
  const [expandedField, setExpandedField] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] border-r border-border">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border shrink-0 scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0 border-b-2',
              activeTab === tab.id
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >

            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Widget Title</Label>
                  <Input value={state.title} onChange={e => update({ title: e.target.value })} className="h-8 text-sm bg-muted/20" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Subtitle</Label>
                  <Textarea value={state.subtitle} onChange={e => update({ subtitle: e.target.value })} className="text-sm bg-muted/20 resize-none" rows={3} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Button Text</Label>
                  <Input value={state.buttonText} onChange={e => update({ buttonText: e.target.value })} className="h-8 text-sm bg-muted/20" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Success Message</Label>
                  <Textarea value={state.successMessage} onChange={e => update({ successMessage: e.target.value })} className="text-sm bg-muted/20 resize-none" rows={2} />
                </div>
              </div>
            )}

            {/* FIELDS TAB */}
            {activeTab === 'fields' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Form Fields</span>
                  <span className="text-xs text-muted-foreground">{state.fields.length} fields</span>
                </div>

                {/* Add field row */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Add Field</Label>
                  <div className="grid grid-cols-5 gap-1">
                    {FIELD_TYPES.map(ft => (
                      <button
                        key={ft.type}
                        onClick={() => addField(ft.type)}
                        title={ft.label}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/20 hover:bg-brand/15 hover:border-brand/30 border border-transparent transition-all text-muted-foreground hover:text-brand"
                      >
                        <ft.icon className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-medium">{ft.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field list */}
                <Reorder.Group
                  axis="y"
                  values={state.fields}
                  onReorder={(fields) => update({ fields })}
                  className="space-y-1.5"
                >
                  {state.fields.map(field => (
                    <Reorder.Item
                      key={field.id}
                      value={field}
                      className={cn(
                        'bg-muted/20 border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing',
                        expandedField === field.id ? 'border-brand/40' : 'border-border'
                      )}
                    >
                      <div
                        className="flex items-center gap-2 px-3 py-2.5"
                        onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                        <span className="flex-1 text-xs font-medium text-foreground truncate">{field.label}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded capitalize',
                          'text-muted-foreground bg-muted/40')}>{field.type}</span>
                        {field.required && <span className="text-[10px] text-brand">*</span>}
                        <button
                          onClick={e => { e.stopPropagation(); removeField(field.id) }}
                          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <AnimatePresence>
                        {expandedField === field.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-border"
                          >
                            <div className="p-3 space-y-3">
                              <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Label</Label>
                                <Input value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} className="h-7 text-xs bg-background/50" />
                              </div>
                              <div>
                                <Label className="text-[10px] text-muted-foreground mb-1 block">Placeholder</Label>
                                <Input value={field.placeholder} onChange={e => updateField(field.id, { placeholder: e.target.value })} className="h-7 text-xs bg-background/50" />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] text-muted-foreground">Required</Label>
                                <Switch checked={field.required} onCheckedChange={v => updateField(field.id, { required: v })} className="scale-75" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}

            {/* THEME TAB */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={state.primaryColor}
                      onChange={e => update({ primaryColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer p-0.5"
                    />
                    <Input value={state.primaryColor} onChange={e => update({ primaryColor: e.target.value })} className="h-8 text-xs font-mono bg-muted/20 flex-1" />
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#6366f1'].map(c => (
                      <button key={c} onClick={() => update({ primaryColor: c })} style={{ background: c }} className={cn('w-6 h-6 rounded-full border-2 transition-all', state.primaryColor === c ? 'border-white scale-110' : 'border-transparent')} />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={state.bgColor} onChange={e => update({ bgColor: e.target.value })} className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer p-0.5" />
                    <Input value={state.bgColor} onChange={e => update({ bgColor: e.target.value })} className="h-8 text-xs font-mono bg-muted/20 flex-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={state.textColor} onChange={e => update({ textColor: e.target.value })} className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer p-0.5" />
                    <Input value={state.textColor} onChange={e => update({ textColor: e.target.value })} className="h-8 text-xs font-mono bg-muted/20 flex-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Border Radius: {state.borderRadius}px</Label>
                  <Slider
                    value={[state.borderRadius]}
                    onValueChange={([v]) => update({ borderRadius: v })}
                    min={0} max={24} step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Font Family</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FONT_OPTIONS.map(font => (
                      <button
                        key={font}
                        onClick={() => update({ fontFamily: font })}
                        className={cn('px-3 py-1.5 rounded-lg text-xs border transition-all',
                          state.fontFamily === font
                            ? 'bg-brand/15 border-brand/40 text-brand'
                            : 'bg-muted/20 border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BEHAVIOR TAB */}
            {activeTab === 'behavior' && (
              <div className="space-y-5">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Position</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {POSITION_OPTIONS.map(pos => (
                      <button
                        key={pos}
                        onClick={() => update({ position: pos as any })}
                        className={cn('px-3 py-2 rounded-lg text-xs border transition-all capitalize',
                          state.position === pos
                            ? 'bg-brand/15 border-brand/40 text-brand'
                            : 'bg-muted/20 border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Animation</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ANIMATION_OPTIONS.map(anim => (
                      <button
                        key={anim}
                        onClick={() => update({ animation: anim as any })}
                        className={cn('px-3 py-2 rounded-lg text-xs border transition-all capitalize',
                          state.animation === anim
                            ? 'bg-brand/15 border-brand/40 text-brand'
                            : 'bg-muted/20 border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {anim.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Show overlay</Label>
                    <Switch checked={state.showOverlay} onCheckedChange={v => update({ showOverlay: v })} className="scale-75" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Close on overlay click</Label>
                    <Switch checked={state.closeOnOverlay} onCheckedChange={v => update({ closeOnOverlay: v })} className="scale-75" />
                  </div>
                </div>
              </div>
            )}

            {/* TRIGGER TAB */}
            {activeTab === 'trigger' && (
              <div className="space-y-5">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Trigger Type</Label>
                  <div className="space-y-1.5">
                    {TRIGGER_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => update({ trigger: t.value as any })}
                        className={cn('w-full flex items-center px-3 py-2 rounded-lg text-xs border transition-all text-left',
                          state.trigger === t.value
                            ? 'bg-brand/15 border-brand/40 text-brand'
                            : 'bg-muted/20 border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                {state.trigger === 'time' && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Delay: {state.triggerDelay}s</Label>
                    <Slider value={[state.triggerDelay]} onValueChange={([v]) => update({ triggerDelay: v })} min={0} max={30} step={1} />
                  </div>
                )}
                {state.trigger === 'scroll' && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Scroll depth: {state.triggerScroll}%</Label>
                    <Slider value={[state.triggerScroll]} onValueChange={([v]) => update({ triggerScroll: v })} min={0} max={100} step={5} />
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Quick-start templates</p>
                {QUICK_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.name}
                    onClick={() => update({ title: tpl.title, subtitle: tpl.subtitle, buttonText: tpl.btn })}
                    className="w-full text-left p-3 rounded-lg border border-border bg-muted/20 hover:bg-brand/10 hover:border-brand/30 transition-all group"
                  >
                    <p className="text-xs font-semibold text-foreground group-hover:text-brand">{tpl.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{tpl.subtitle}</p>
                  </button>
                ))}
              </div>
            )}

            {/* LOCALIZATION TAB */}
            {activeTab === 'localization' && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Configure language and locale settings for this widget.</p>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Default Language</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['English', 'Spanish', 'French', 'German', 'Portuguese', 'Japanese'].map(lang => (
                      <button key={lang} className="px-3 py-2 rounded-lg text-xs border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-colors text-left">
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Auto-detect locale</Label>
                  <Switch defaultChecked className="scale-75" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">RTL support</Label>
                  <Switch className="scale-75" />
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Widget ID</Label>
                  <Input defaultValue="wgt_demo_001" className="h-8 text-xs font-mono bg-muted/20" readOnly />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Custom CSS</Label>
                  <Textarea defaultValue="/* Your custom styles */" className="text-xs font-mono bg-muted/20 resize-none" rows={5} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">GDPR mode</Label>
                    <Switch defaultChecked className="scale-75" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Honeypot spam filter</Label>
                    <Switch defaultChecked className="scale-75" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">reCAPTCHA v3</Label>
                    <Switch className="scale-75" />
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
