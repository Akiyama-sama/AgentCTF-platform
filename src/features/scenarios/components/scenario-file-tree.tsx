
import { Button } from '@/components/ui/button'
import FileTree, { Item } from '@/components/file-tree'
import { cn } from '@/lib/utils'
import {
  IconFilePlus,
  IconFolderPlus,
  IconPencil,
  IconTrash,
  IconUpload
} from '@tabler/icons-react'
import { useScenariosDialog } from '../context/scenarios-context'
import { useEffect } from 'react'

type ScenarioFileTreeProps = {
  scenarioId: string
  fileTreeItems: Record<string, Item>
  rootItemId: string
  className?: string
}

export function ScenarioFileTree({
  fileTreeItems,
  rootItemId,
  className
}: ScenarioFileTreeProps) {
  const { filePath, setFilePath, setIsFile,setOpen } = useScenariosDialog()

  const isFile =
    (filePath &&
    fileTreeItems[filePath] &&
    !fileTreeItems[filePath].children)?true:false
 
  useEffect(() => {
    setIsFile(isFile)
  
  }, [isFile, setIsFile])

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-2 *:nth-2:grow',
        className
      )}
    >
      <div className='flex items-center gap-2 px-4'>
        {isFile ? (
            <Button 
                variant='outline' 
                size='sm' 
                onClick={()=>setOpen('update_file')} 
                disabled={!isFile || !filePath}
            >
              <IconPencil className='mr-2 size-4' />
              编辑文件
            </Button>

        ) : (          
            <Button
              variant='outline'
              size='sm'
              onClick={()=>setOpen('create_directory')}
              disabled={!filePath}
            >
              <IconFolderPlus className='mr-2 size-4' />
              创建文件夹
            </Button> 
        )}
        <Button
          variant='outline'
          size='sm'
          onClick={()=>setOpen('create_file')}
          disabled={!filePath}
        >
          <IconFilePlus className='mr-2 size-4' />
          创建文件
        </Button>   
        <Button
          variant='destructive'
          size='sm'
          onClick={()=>setOpen('delete_file')}
          disabled={ !filePath}
        >
          <IconTrash className='mr-2 size-4' />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={()=>setOpen('upload_file')}
          disabled={ !filePath}
        >
          <IconUpload className='size-4' />
        </Button>


      </div>
      <FileTree
        className='flex-1 px-4'
        items={fileTreeItems}
        rootItemId={rootItemId}
        onSelectionChange={setFilePath}
      />
    </div>
  )
}
