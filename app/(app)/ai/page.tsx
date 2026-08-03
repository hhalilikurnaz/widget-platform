"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Sparkles, Send, ArrowUp, Zap, RotateCcw,
  Copy, ThumbsUp, ThumbsDown, Code2,
  LayoutTemplate, Palette, TrendingUp, MessageSquare
} from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isLoading?: boolean
}

const SUGGESTIONS = [
  { icon: LayoutTemplate, text: "Generate a contact form widget for a SaaS product", color: "text-blue-400" },
  { icon: Palette, text: "Create a feedback widget with a dark theme and star rating", color: "text-purple-400" },
  { icon: TrendingUp, text: "Suggest ways to improve my widget conversion rate", color: "text-emerald-400" },
  { icon: Code2, text: "Write the embed code for my lead capture popup", color: "text-amber-400" },
  { icon: MessageSquare, text: "Draft a welcome message for my onboarding survey", color: "text-cyan-400" },
  { icon: Zap, text: "Build a quiz widget to qualify leads for my agency", color: "text-rose-400" },
]

const MOCK_RESPONSES: Record<string, string> = {
  default: `I can help you build, optimise, and configure your widgets. Here are some things I can do:

**Widget Generation** — Describe what you need and I'll scaffold a fully configured widget with fields, themes, and behaviour settings ready to publish.

**Conversion Optimisation** — Share your current metrics and I'll suggest copy, layout, and trigger improvements backed by data.

**Embed Code** — Generate platform-specific snippets for React, Next.js, Vue, WordPress, Webflow, and plain HTML.

**A/B Test Ideas** — Propose variants to test on your highest-traffic widgets.

What would you like to work on?`,
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="w-7 h-7 shrink-0 mt-1">
        <AvatarFallback className={cn("text-xs", isUser
          ? "bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-300"
          : "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-300"
        )}>
          {isUser ? "AK" : <Sparkles className="w-3.5 h-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex-1 max-w-[80%]", isUser && "items-end flex flex-col")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border/40 rounded-tl-sm"
        )}>
          {message.isLoading ? (
            <TypingIndicator />
          ) : (
            <div className="whitespace-pre-wrap">
              {message.content.split("\n").map((line, i) => {
                const bold = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
                return (
                  <p key={i} className={i > 0 ? "mt-2" : ""}
                    dangerouslySetInnerHTML={{ __html: bold }} />
                )
              })}
            </div>
          )}
        </div>

        {!message.isLoading && !isUser && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <button className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
              <Copy className="w-3 h-3" />
            </button>
            <button className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
              <ThumbsUp className="w-3 h-3" />
            </button>
            <button className="w-6 h-6 rounded hover:bg-white/5 flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors">
              <ThumbsDown className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput("")
    setIsLoading(true)

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

    setMessages(prev => prev.map(m =>
      m.id === loadingMsg.id
        ? { ...m, isLoading: false, content: MOCK_RESPONSES.default }
        : m
    ))
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 border-b border-border/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-300" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Widget AI</h1>
            <p className="text-xs text-foreground/40">Powered by GPT-4o</p>
          </div>
          <Badge className="ml-1 text-xs px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Online</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5 text-foreground/40 hover:text-foreground"
          onClick={() => setMessages([])}
        >
          <RotateCcw className="w-3.5 h-3.5" /> New Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isEmpty ? (
          <div className="max-w-2xl mx-auto">
            {/* Welcome */}
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-sm text-foreground/40 max-w-sm mx-auto">
                I can generate widgets, optimise conversions, write embed code, and more.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="grid grid-cols-2 gap-2.5">
              {SUGGESTIONS.map(({ icon: Icon, text, color }) => (
                <button
                  key={text}
                  onClick={() => sendMessage(text)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card hover:border-border/60 hover:bg-card/80 text-left transition-colors group"
                >
                  <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", color)} />
                  <p className="text-xs text-foreground/60 leading-relaxed group-hover:text-foreground/80 transition-colors">{text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 pb-6 shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl border border-border/40 bg-card focus-within:border-primary/40 transition-colors">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to generate a widget, improve conversions, or write embed code..."
              className="min-h-[56px] max-h-32 resize-none border-0 bg-transparent rounded-2xl px-4 py-3.5 pr-12 text-sm focus-visible:ring-0 placeholder:text-foreground/25"
              rows={1}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-foreground/25 mt-2">
            AI can make mistakes. Review generated widgets before publishing.
          </p>
        </div>
      </div>
    </div>
  )
}
