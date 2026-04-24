import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onSubmit: (username: string) => void
}

export function UsernamePrompt({ onSubmit }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 ring-1 ring-foreground/10 shadow-xl">
        <h2 className="text-lg font-semibold mb-1">Welcome to AI Dev Quiz</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter a username to track your progress.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Your username"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={40}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          <Button type="submit" disabled={!value.trim()}>
            Get started
          </Button>
        </form>
      </div>
    </div>
  )
}
