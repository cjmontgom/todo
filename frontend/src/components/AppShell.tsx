interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 md:px-8">
        {children}
      </div>
    </div>
  )
}
