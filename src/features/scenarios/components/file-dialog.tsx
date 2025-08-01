import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
  } from '@/components/ui/dialog'
  import { Input } from '@/components/ui/input'
  import { useScenarioFile } from '@/hooks/use-scenario'
  import { z } from 'zod'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { Button } from '@/components/ui/button'
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
  } from '@/components/ui/form'
import { showSuccessMessage } from '@/utils/show-submitted-data'
import FileUpload from '@/components/file-upload'
  
const getParentDirectory = (path: string) => {
  if (!path.includes('/')) return '.' // Root level
  return path.substring(0, path.lastIndexOf('/'))
}

  type CreateFileDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    scenarioId: string
    basePath: string
    isFileNode: boolean // Is the basePath pointing to a file or a directory
  }
  
  const createFileSchema = z.object({
    name: z.string().min(1, '名称不能为空')
  })
  
  export function CreateFileDialog({
    open,
    onOpenChange,
    scenarioId,
    basePath,
    isFileNode
  }: CreateFileDialogProps) {
    const form = useForm<z.infer<typeof createFileSchema>>({
      resolver: zodResolver(createFileSchema),
      defaultValues: { name: '' }
    })
    const { createFile } = useScenarioFile(scenarioId)
  
    const dialogTitle = '创建文件'
  
  
    const onSubmit = (values: z.infer<typeof createFileSchema>) => {
      const parentDir = isFileNode ? getParentDirectory(basePath) : basePath
      // Ensure root path is handled correctly
      const newPath = parentDir === '.' ? values.name : `${parentDir}/${values.name}`
      createFile({
          modelId: scenarioId,
          data: { file_path: newPath, content: '', file_type: 'text' }
        })
      showSuccessMessage(`创建文件成功: ${newPath}`)
      onOpenChange(false)
      form.reset()
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id='create-file-form' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input placeholder={ '新文件名'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button type='submit' form='create-file-form'>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  } 


  type CreateDirectoryDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    scenarioId: string
    basePath: string
    isFileNode: boolean // Is the basePath pointing to a file or a directory
  }
  
  const createDirectorySchema = z.object({
    name: z.string().min(1, '名称不能为空')
  })
  
  export function CreateDirectoryDialog({
    open,
    onOpenChange,
    scenarioId,
    basePath,
    isFileNode
  }: CreateDirectoryDialogProps) {
    const form = useForm<z.infer<typeof createDirectorySchema>>({
      resolver: zodResolver(createDirectorySchema),
      defaultValues: { name: '' }
    })
    const {  createDirectory } = useScenarioFile(scenarioId)
  
    const dialogTitle = '创建文件夹'

    const onSubmit = (values: z.infer<typeof createFileSchema>) => {
      const parentDir = isFileNode ? getParentDirectory(basePath) : basePath
      // Ensure root path is handled correctly
      const newPath = parentDir === '.' ? values.name : `${parentDir}/${values.name}`
      createDirectory({ modelId: scenarioId, data: { dir_path: newPath } })
      showSuccessMessage(`创建文件夹成功: ${newPath}`)
      onOpenChange(false)
      form.reset()
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id='create-file-form' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input placeholder={ '新文件夹名'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button type='submit' form='create-file-form'>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  type UploadFileDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    scenarioId: string
    basePath: string
    isFileNode: boolean // Is the basePath pointing to a file or a directory
  }
  
  const uploadFileSchema = z.object({
    file_name: z.string().min(1, '上传文件名不能为空'),
    file: z
    .instanceof(Blob, { message: '请上传文件' })
    .refine(file => file.size > 0, '请上传文件'),
  })
  type UploadFileDialogForm = z.infer<typeof uploadFileSchema>
  export function UploadFileDialog({
    open,
    onOpenChange,
    scenarioId,
    basePath,
    isFileNode
  }: UploadFileDialogProps) {
    const form = useForm<UploadFileDialogForm>({
      resolver: zodResolver(uploadFileSchema),
    })
    const { uploadFile } = useScenarioFile(scenarioId)
    const dialogTitle = '上传文件'

    const onSubmit = (values: UploadFileDialogForm) => {
      const newPath=isFileNode?getParentDirectory(basePath):basePath
      const file_path=newPath+'/'+values.file_name
      uploadFile({ modelId: scenarioId, data: { file: values.file, file_path: file_path } })
      showSuccessMessage(`在此目录下: ${newPath}上传文件成功`)
      onOpenChange(false)
      form.reset()
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[425px] gap-5'>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <Form {...form} >
            <form id='create-file-form'
            className='space-y-5'
            onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='file_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>文件名</FormLabel>
                    <FormControl>
                      <Input placeholder={ '请输入新的上传文件名'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name='file'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>文件</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value as File | null}
                          onChange={field.onChange}
                          placeholder='请上传文件'
                          accept='*'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button type='submit' form='create-file-form'>
              上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )



}