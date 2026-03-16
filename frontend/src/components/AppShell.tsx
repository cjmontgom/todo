interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <a
        href="#task-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-coral focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
      >
        Skip to task input
      </a>
      <main className="mx-auto max-w-[640px] px-4 sm:px-6 md:px-8">
        {children}
      </main>
    </div>
  )
}
