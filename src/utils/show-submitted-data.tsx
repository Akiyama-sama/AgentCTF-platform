
import { toast } from 'sonner'

export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  toast.message(title, {
    description: (
      // w-[340px]
      <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
    duration:3000
  })
}
export function showSuccessMessage(message: string) {
  toast.success(
    message,
    {duration:3000}
  )
}
export function showErrorMessage(
  message: string,
  data?: unknown
) {
  toast.error(
    <div className='mt-2 w-full overflow-x-auto rounded-md bg-red-800 p-4'>
        {message}
        {data?<code className='text-white'>{JSON.stringify(data, null, 2)}</code>:null}
    </div>,
    {duration:3000}
  )
}