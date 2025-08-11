import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/context/theme-context'

type MermaidProps = {
  content: string
  onParseError?: (error: unknown) => void
  className?: string
}

const Mermaid = ({ content, onParseError, className }: MermaidProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      // We can further customize the theme using themeVariables
      // to match your app's specific color palette from index.css
      themeVariables: {
        background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        primaryColor: theme === 'dark' ? '#a7f3d0' : '#16a34a',
        primaryTextColor: theme === 'dark' ? '#000000' : '#ffffff',
        lineColor: theme === 'dark' ? '#a3a3a3' : '#757575',
        textColor: theme === 'dark' ? '#ffffff' : '#000000',
        // ... and so on for other variables
      },
    })

    const renderMermaid = async () => {
      if (!mermaidRef.current) return
      try {
        // Clear previous render
        mermaidRef.current.innerHTML = ''
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, content)
        mermaidRef.current.innerHTML = svg
      } catch (error) {
        if (onParseError) {
          onParseError(error)
        }
        // Display a simple error message within the component itself
        // The parent component can decide to show a more complex UI
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML =
            '<div class="text-destructive">Error rendering diagram.</div>'
        }
      }
    }

    renderMermaid()
  }, [content, theme, onParseError])

  return (
    <ScrollArea className={className}>
      <div ref={mermaidRef} className="flex h-full w-full items-center justify-center" />
    </ScrollArea>
  )
}

export { Mermaid }







