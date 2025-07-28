import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import FileUpload from '@/components/file-upload'
import { useScenario, useScenarioFile, useScenarios } from '@/hooks/use-scenario'
import { ScenarioFileTree } from './scenario-file-tree'
import { Label } from '@/components/ui/label'
import { ModelResponse } from '@/types/docker-manager'
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ModelResponse
}

const updateSchema = z.object({
  name: z.string().min(1, '场景名称必填'),
  description: z.string().min(1, '场景描述必填')
})

const createSchema = z.object({
  name: z.string().min(1, '场景名称必填'),
  description: z.string().min(1, '场景描述必填'),
  attacker_file: z
    .instanceof(Blob, { message: '请上传攻击端压缩包(可选)' })
    .optional(),
  defender_file: z
    .instanceof(Blob, { message: '请上传防守端压缩包(可选)' })
    .optional(),
  target_file: z
    .instanceof(Blob, { message: '请上传靶机压缩包' })
    .refine(file => file.size > 0, '请上传靶机压缩包')
})

type ScenariosUpdateForm = z.infer<typeof updateSchema>
type ScenariosCreateForm = z.infer<typeof createSchema>

export function ScenariosMutateDrawer({
  open,
  onOpenChange,
  currentRow
}: Props) {
  const isUpdate = !!currentRow
  const { createScenarioAsync } = useScenarios()
  // 在组件顶层有条件地获取更新函数
  const { updateScenarioAsync } = useScenario(isUpdate ? currentRow.uuid : null)
  const { fileTreeItems, rootItemId,fileTreeQuery } = useScenarioFile(isUpdate ? currentRow.uuid : null)
  const form = useForm<ScenariosCreateForm | ScenariosUpdateForm>({
    resolver: zodResolver(isUpdate ? updateSchema : createSchema),
    defaultValues: isUpdate
      ? { name: currentRow.name, description: currentRow.description }
      : {
          name: '',
          description: '',
          attacker_file: undefined,
          defender_file: undefined,
          target_file: undefined,
        }
  })

  const onSubmit = (data: ScenariosCreateForm | ScenariosUpdateForm) => {
    if (isUpdate && currentRow) {
      // Type guard for update
      updateScenarioAsync({
        modelId: currentRow.uuid,
        data: data as ScenariosUpdateForm
      })
    } else {
      const createData = data as ScenariosCreateForm;
      // 移除未选择的可选文件
      if (createData.attacker_file?.size === 0) {
        delete createData.attacker_file;
      }
      if (createData.defender_file?.size === 0) {
        delete createData.defender_file;
      }
      // Type guard for create
      createScenarioAsync(createData)
      
    }
    onOpenChange(false)
    form.reset()
    showSubmittedData(data, isUpdate ? '场景已更新' : '场景已创建')
  }

  return (
    <Sheet
      open={open}
      onOpenChange={v => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col h-full'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? '更新' : '创建'} 场景</SheetTitle>
          <SheetDescription>
            {isUpdate ? '更新场景信息' : '添加新场景信息'}
            完成后点击保存.
          </SheetDescription>
        </SheetHeader>
        <Form {...form} >
          <form
            id='scenarios-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 px-4 min-h-0  overflow-y-auto'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>场景名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入场景名称' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>场景描述</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入场景描述' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            

            {!isUpdate && (
              <>
                <FormField
                  control={form.control}
                  name='attacker_file'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>攻击端压缩包</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value as File | null}
                          onChange={field.onChange}
                          placeholder='请上传攻击端压缩包'
                          accept='.zip,.rar,.7z,.tar,.gz'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='defender_file'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>防守端压缩包</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value as File | null}
                          onChange={field.onChange}
                          placeholder='请上传防守端压缩包'
                          accept='.zip,.rar,.7z,.tar,.gz'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='target_file'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>靶机压缩包</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value as File | null}
                          onChange={field.onChange}
                          placeholder='请上传靶机压缩包'
                          accept='.zip,.rar,.7z,.tar,.gz'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>

          {isUpdate && (
            fileTreeQuery.isInitialLoading?<div className='flex-1 flex items-center justify-center px-4'>场景文件加载中...</div>:
            <>
            <Label className='text-lg font-bold px-4'>场景文件树</Label>
            <ScenarioFileTree
              className=' flex-1 '
              scenarioId={currentRow.uuid}
              fileTreeItems={fileTreeItems}
              rootItemId={rootItemId}
            />
            </>
          )}
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>取消</Button>
          </SheetClose>
          <Button form='scenarios-form' type='submit'>
            保存
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
