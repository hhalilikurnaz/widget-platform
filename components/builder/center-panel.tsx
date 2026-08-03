'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuilder } from '@/lib/builder-store'
import { cn } from '@/lib/utils'
import { Monitor, Tablet, Smartphone, RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react'
import type { DeviceView } from '@/lib/builder-store'

const deviceDimensions: Record<DeviceView, { w: number; h: number; label: string; icon: typeof Monitor }> = {
  desktop: { w: 480, h: 520, label: 'Desktop', icon: Monitor },
  tablet:  { w: 380, h: 520, label: 'Tablet',  icon: Tablet   },
  mobile:  { w: 340, h: 560, label: 'Mobile',  icon: Smartphone },
}

export function CenterPanel() {
  const { state, update, resetToDefaults } = useBuilder()
  const [zoom, setZoom] = useState(90)
  const dims = deviceDimensions[state.deviceView]

  const animVariants = {
    fade:       { initial: { opacity: 0 },               animate: { opacity: 1 } },
    'slide-up': { initial: { opacity: 0, y: 20 },         animate: { opacity: 1, y: 0 } },
    'slide-down':{ initial: { opacity: 0, y: -20 },       animate: { opacity: 1, y: 0 } },
    zoom:       { initial: { opacity: 0, scale: 0.85 },   animate: { opacity: 1, scale: 1 } },
    none:       { initial: { opacity: 1 },                animate: { opacity: 1 } },
  }
  const anim = animVariants[state.animation] ?? animVariants.fade

  return (
    <div className="flex flex-col h-full bg-[#111113]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0 bg-[#0d0d0f]">
        {/* Device switcher */}
        <div className="flex items-center gap-1 bg-muted/20 border border-border rounded-lg p-0.5">
          {(Object.keys(deviceDimensions) as DeviceView[]).map(dev => {
            const { icon: Icon, label } = deviceDimensions[dev]
            return (
              <button
                key={dev}
                onClick={() => update({ deviceView: dev })}
                title={label}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors',
                  state.deviceView === dev
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Center label */}
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Live Preview</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-400 border border-emerald-400/20 font-medium">Live</span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(120, z + 10))} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border" />
          <button onClick={resetToDefaults} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}>
        <motion.div
          key={state.deviceView}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            width: dims.w,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Widget card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${state.title}-${state.primaryColor}-${state.borderRadius}`}
              {...anim}
              transition={{ duration: 0.3 }}
              style={{
                backgroundColor: state.bgColor,
                color: state.textColor,
                borderRadius: state.borderRadius,
                fontFamily: state.fontFamily,
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
              className="overflow-hidden"
            >
              {/* Header */}
              <div
                className="px-6 py-5"
                style={{ borderBottom: `1px solid ${state.primaryColor}20` }}
              >
                <h2 className="text-lg font-bold" style={{ color: state.textColor }}>{state.title}</h2>
                <p className="text-sm mt-1 opacity-70" style={{ color: state.textColor }}>{state.subtitle}</p>
              </div>

              {/* Form */}
              <div className="px-6 py-5 space-y-4">
                {state.fields.map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1" style={{ color: state.textColor }}>
                      {field.label}
                      {field.required && <span style={{ color: state.primaryColor }}>*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        rows={3}
                        readOnly
                        className="w-full text-sm px-3 py-2 outline-none resize-none"
                        style={{
                          background: `${state.textColor}08`,
                          border: `1px solid ${state.textColor}20`,
                          borderRadius: Math.min(state.borderRadius, 8),
                          color: state.textColor,
                          fontFamily: state.fontFamily,
                        }}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className="w-full text-sm px-3 py-2 outline-none"
                        style={{
                          background: `${state.textColor}08`,
                          border: `1px solid ${state.textColor}20`,
                          borderRadius: Math.min(state.borderRadius, 8),
                          color: state.textColor,
                          fontFamily: state.fontFamily,
                        }}
                      >
                        <option>{field.placeholder}</option>
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: state.textColor }}>
                        <input type="checkbox" className="rounded" style={{ accentColor: state.primaryColor }} />
                        {field.placeholder}
                      </label>
                    ) : (
                      <input
                        type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                        placeholder={field.placeholder}
                        readOnly
                        className="w-full text-sm px-3 py-2 outline-none"
                        style={{
                          background: `${state.textColor}08`,
                          border: `1px solid ${state.textColor}20`,
                          borderRadius: Math.min(state.borderRadius, 8),
                          color: state.textColor,
                          fontFamily: state.fontFamily,
                        }}
                      />
                    )}
                  </div>
                ))}

                {/* Submit button */}
                <button
                  className="w-full py-2.5 text-sm font-semibold mt-2 transition-opacity hover:opacity-90"
                  style={{
                    background: state.primaryColor,
                    color: '#ffffff',
                    borderRadius: Math.min(state.borderRadius, 10),
                    fontFamily: state.fontFamily,
                  }}
                >
                  {state.buttonText}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
