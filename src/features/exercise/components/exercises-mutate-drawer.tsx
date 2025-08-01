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
import { ModelResponse } from '@/types/docker-manager'
import { useExercise, useExercises } from '@/hooks/use-exercise'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ModelResponse
}

const updateSchema = z.object({
  name: z.string().min(1, '演练名称必填'),
  description: z.string().min(1, '演练描述必填')
})

const createSchema = z.object({
  name: z.string().min(1, '演练名称必填'),
  description: z.string().min(1, '演练描述必填'),
  target_file: z
    .instanceof(Blob, { message: '请上传靶机压缩包' })
    .refine(file => file.size > 0, '请上传靶机压缩包')
})

type ExercisesUpdateForm = z.infer<typeof updateSchema>
type ExercisesCreateForm = z.infer<typeof createSchema>

export function ExercisesMutateDrawer({
  open,
  onOpenChange,
  currentRow
}: Props) {
  const isUpdate = !!currentRow
  const { createExerciseAsync } = useExercises()
  // 在组件顶层有条件地获取更新函数
  const { updateExerciseAsync } = useExercise(isUpdate ? currentRow.uuid : '')

  const form = useForm<ExercisesCreateForm | ExercisesUpdateForm>({
    resolver: zodResolver(isUpdate ? updateSchema : createSchema),
    defaultValues: isUpdate
      ? { name: currentRow.name, description: currentRow.description }
      : {
          name: '',
          description: '',
          target_file: undefined,
        }
  })

  const onSubmit =  (data: ExercisesCreateForm | ExercisesUpdateForm) => {
    if (isUpdate && currentRow) {
      // Type guard for update
      updateExerciseAsync({
        modelId: currentRow.uuid,
        data: data as ExercisesUpdateForm
      })
    } else {
      const createData = data as ExercisesCreateForm;

       createExerciseAsync(createData)
    }
    onOpenChange(false)
    form.reset()
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
          <SheetTitle>{isUpdate ? '更新' : '创建'} 演练</SheetTitle>
          <SheetDescription>
            {isUpdate ? '更新演练信息' : '添加新演练信息'}
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
                  <FormLabel>演练名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入本次演练名称' />
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
                  <FormLabel>演练描述</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入演练描述' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            

            {!isUpdate && (
              <>
                <FormField
                  control={form.control}
                  name='target_file'
                  render={({ field }) => (
                    <FormItem className='space-y-1'>
                      <FormLabel>演练靶机压缩包</FormLabel>
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
