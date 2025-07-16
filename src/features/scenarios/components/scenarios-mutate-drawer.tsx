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
import { ScenarioResponse } from '@/types/docker-manager'
import FileUpload from '@/components/file-upload'
import { useScenario, useScenarios } from '@/hooks/use-scenario'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ScenarioResponse
}

const updateSchema = z.object({
  name: z.string().min(1, '场景名称必填'),
  description: z.string().min(1, '场景描述必填')
})

const createSchema = z.object({
  name: z.string().min(1, '场景名称必填'),
  description: z.string().min(1, '场景描述必填'),
  attacker_file: z
    .instanceof(Blob, { message: '请上传攻击端压缩包' })
    .refine(file => file.size > 0, '请上传攻击端压缩包'),
  defender_file: z
    .instanceof(Blob, { message: '请上传防守端压缩包' })
    .refine(file => file.size > 0, '请上传防守端压缩包'),
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

  const form = useForm<ScenariosCreateForm | ScenariosUpdateForm>({
    resolver: zodResolver(isUpdate ? updateSchema : createSchema),
    defaultValues: isUpdate
      ? { name: currentRow.name, description: currentRow.description }
      : {
          name: '',
          description: '',
          attacker_file: new File([], ''),
          defender_file: new File([], ''),
          target_file: new File([], '')
        }
  })

  const onSubmit = (data: ScenariosCreateForm | ScenariosUpdateForm) => {
    if (isUpdate && currentRow) {
      // Type guard for update
      updateScenarioAsync({
        scenarioId: currentRow.uuid,
        data: data as ScenariosUpdateForm
      })
    } else {
      // Type guard for create
      createScenarioAsync({ data: data as ScenariosCreateForm })
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
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? '更新' : '创建'} 场景</SheetTitle>
          <SheetDescription>
            {isUpdate ? '更新场景信息' : '添加新场景信息'}
            完成后点击保存.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='scenarios-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 px-4'
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
