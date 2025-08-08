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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from '@tanstack/react-router'
import { showSuccessMessage } from '@/utils/show-submitted-data'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: 'Username must be at least 1 characters.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>


export default function ProfileForm() {
  const { updateUserAsync } = useAuth()
  const navigate = useNavigate()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: 'mio',
    },
    mode: 'onChange',
  })



  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          updateUserAsync({
            data: {
              username: data.username,
            },
          })
          showSuccessMessage('更新成功,请重新登录')
          navigate({
            to: '/sign-in-2',
          })
        })}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className='text-xs text-muted-foreground'>
                修改用户名后需要重新登录，以便刷新token
              </FormMessage>
            </FormItem>
          )}
        />
        
        <Button type='submit'>更新</Button>
      </form>
    </Form>
  )
}
