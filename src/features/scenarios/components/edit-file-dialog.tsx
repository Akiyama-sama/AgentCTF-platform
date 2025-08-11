import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
  } from '@/components/ui/dialog'
  import { useScenarioFile } from '@/hooks/use-scenario'
  import { showSuccessMessage } from '@/utils/show-submitted-data'
  import CodeMirror from '@uiw/react-codemirror'
  import { useEffect, useState } from 'react'
  import { Button } from '@/components/ui/button'

import { ApiResponseGetDataFileContentResponse } from '@/types/docker-manager'
import Loading from '@/components/Loading'
import { useTheme } from '@/context/theme-context'

  
  interface EditFileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    scenarioId: string
    basePath: string
  }
  
  export default function EditFileDialog({
    open,
    onOpenChange,
    scenarioId,
    basePath
  }: EditFileDialogProps) {
    const [content, setContent] = useState('')
    const { theme } = useTheme()
    const { getFileContentAsync, updateFile, isUpdatingFile,isGettingContent } =
      useScenarioFile(scenarioId)
  
    useEffect(() => {
      if (open && basePath) {
        const fetchContent = async () => {
          
          try {
            const response = await getFileContentAsync({
              modelId: scenarioId,
              data: { file_path: basePath }
            }) as ApiResponseGetDataFileContentResponse 
            const fileContent = await response.data?.content
            if(fileContent) {
                setContent(fileContent)
            } 
          } catch (error) {
            setContent(` Failed to load file content error ${error}`)
          }
        }
        fetchContent()
      }
    }, [open, basePath, getFileContentAsync, scenarioId])
  
    const handleSave = () => {
      updateFile(
        {
          modelId: scenarioId,
          data: {
            file_path: basePath,
            content: content,
            file_type:'text'
          }
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            showSuccessMessage( '文件已成功更新:')
          }
        }
      )
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='flex !w-[100vw] h-[80vh] max-w-6xl flex-col' >
          <DialogHeader>
            <DialogTitle>编辑文件: {basePath}</DialogTitle>
          </DialogHeader>
          <div className='flex-grow overflow-auto rounded-md border'>
            {isGettingContent ? (
              <div className='flex h-full items-center justify-center'>
                <Loading />
              </div>
            ) : (
              <CodeMirror
                value={content}
                height='100%'
                className='h-full font-mono !bg-background !text-foreground'
                theme={theme === 'dark' ? 'dark' : 'light'}
                onChange={value => setContent(value)}
              />
            )}
          </div>
          <DialogFooter className='shrink-0 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isUpdatingFile || isGettingContent}
            >
              {(isUpdatingFile || isGettingContent) && (
                <Loading className='mr-2' />
              )}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  