// app/page.tsx  ➜  server entry (kept minimal)
import { Suspense } from 'react'
import Chatbot from '@/components/ui/chatbot' // move the big file to components

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
      <Chatbot />
    </Suspense>
  )
}