'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { useAdmin } from '@/hooks/use-auth'
import { userRoles } from '../data/data'
import type { User } from '../data/schema'
import { Switch } from '@/components/ui/switch'

// 根据后端接口定义新的表单验证 schema
const formSchema = z
  .object({
    username: z.string().min(1, { message: '用户名不能为空。' }),
    password: z.string().transform(pwd => pwd.trim()),
    confirmPassword: z.string().transform(pwd => pwd.trim()),
    roles: z.array(z.number()).min(1, { message: '必须选择一个角色。' }),
    is_active: z.boolean(),
    isEdit: z.boolean(),
  })
  .superRefine(({ isEdit, password, confirmPassword }, ctx) => {
    // 仅在创建用户或在编辑模式下输入了新密码时，才进行密码校验
    if (!isEdit || (isEdit && password)) {
      if (!password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '密码不能为空。',
          path: ['password'],
        })
      }
      else if (password.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '密码长度不能少于4位。',
          path: ['password'],
        })
      }

      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '两次输入的密码不一致。',
          path: ['confirmPassword'],
        })
      }
    }
  })
type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const { createUserAsync, updateUserAsync, isCreatingUser, isUpdatingUser }
    = useAdmin()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          username: currentRow.username,
          is_active: currentRow.is_active,
          roles: currentRow.roles?.map(r => r.id) ?? [],
          password: '',
          confirmPassword: '',
          isEdit,
        }
      : {
          username: '',
          is_active: true,
          roles: [],
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    if (isEdit) {
      await updateUserAsync({
        userId: currentRow.id,
        data: {
          username: values.username,
          is_active: values.is_active,
          roles: values.roles,
          // 仅当用户输入新密码时才更新密码
          password: values.password || undefined,
        },
      })
    }
    else {
      await createUserAsync({
        data: {
          username: values.username,
          password: values.password,
          roles: values.roles,
        },
      })
    }
    onOpenChange(false)
  }

  const isLoading = isCreatingUser || isUpdatingUser

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? '编辑用户' : '添加新用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '在此处更新用户信息。' : '在此处创建新用户。'}
            完成后点击“保存”。
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 max-h-96 w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4'>
                    <FormLabel className='col-span-2 text-right'>
                      用户名
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='例如: zhangsan'
                        className='col-span-4'
                        autoComplete='off'
                        disabled={isEdit} // 编辑时不允许修改用户名
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roles'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4'>
                    <FormLabel className='col-span-2 text-right'>
                      角色
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value[0]?.toString()}
                      onValueChange={(value) => {
                        // 假设单选角色，所以直接设置为 [Number(value)]
                        field.onChange([Number(value)])
                      }}
                      placeholder='选择一个角色'
                      className='col-span-4'
                      items={userRoles.map(({ label, id }) => ({
                        label,
                        value: id.toString(),
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {isEdit && (
                <FormField
                  control={form.control}
                  name='is_active'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4'>
                      <FormLabel className='col-span-2 text-right'>
                        状态
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4'>
                    <FormLabel className='col-span-2 text-right'>
                      密码
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={isEdit ? '留空则不修改' : '请输入密码'}
                        className='col-span-4'
                        autoComplete='new-password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4'>
                    <FormLabel className='col-span-2 text-right'>
                      确认密码
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='再次输入密码'
                        className='col-span-4'
                        autoComplete='new-password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
