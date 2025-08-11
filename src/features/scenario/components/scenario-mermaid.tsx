import { useState, useEffect } from 'react'
import { Mermaid } from '@/components/mermaid'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

type ScenarioMermaidProps = {
  initialContent: string
  className?: string
}

const ScenarioMermaid = ({ initialContent, className }: ScenarioMermaidProps) => {
  const [content, setContent] = useState(initialContent)
  const [inputContent, setInputContent] = useState(initialContent)
  const [error, setError] = useState<unknown | null>(null)

  useEffect(() => {
    setContent(initialContent)
    setInputContent(initialContent)
    setError(null)
  }, [initialContent])

  const handleParseError = (err: unknown) => {
    setError(err)
  }

  const handleRetry = () => {
    setError(null)
    setContent(inputContent)
  }

  return (
    <div className={className}>
      {error ? (
        <Card className="h-full w-full">
          <CardContent className="p-4">
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>渲染错误</AlertTitle>
              <AlertDescription>
                有些语法错误，请手动上传Mermaid语法进行拓补图渲染
              </AlertDescription>
            </Alert>
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="h-64 font-mono"
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleRetry}>Retry</Button>
          </CardFooter>
        </Card>
      ) : (
        <Mermaid content={content} onParseError={handleParseError} className="h-full w-full" />
      )}
    </div>
  )
}

export { ScenarioMermaid }
