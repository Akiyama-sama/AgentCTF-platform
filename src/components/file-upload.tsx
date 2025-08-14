import React from 'react'
import {
  FileUpIcon,
  FileIcon,
  XIcon,
  FileTextIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  VideoIcon,
  HeadphonesIcon,
  ImageIcon,
  AlertCircleIcon
} from 'lucide-react'
import { useFileUpload, formatBytes } from '@/hooks/use-file-upload'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const getFileIcon = (file: File | null) => {
  if (!file) return <FileIcon className='size-4 opacity-60' />
  const fileType = file.type
  const fileName = file.name

  if (
    fileType.includes('pdf') ||
    fileName.endsWith('.pdf') ||
    fileType.includes('word') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return <FileTextIcon className='size-4 opacity-60' />
  } else if (
    fileType.includes('zip') ||
    fileType.includes('archive') ||
    fileName.endsWith('.zip') ||
    fileName.endsWith('.rar')
  ) {
    return <FileArchiveIcon className='size-4 opacity-60' />
  } else if (
    fileType.includes('excel') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsx')
  ) {
    return <FileSpreadsheetIcon className='size-4 opacity-60' />
  } else if (fileType.includes('video/')) {
    return <VideoIcon className='size-4 opacity-60' />
  } else if (fileType.includes('audio/')) {
    return <HeadphonesIcon className='size-4 opacity-60' />
  } else if (fileType.startsWith('image/')) {
    return <ImageIcon className='size-4 opacity-60' />
  }
  return <FileIcon className='size-4 opacity-60' />
}

export interface FileUploadProps {
  value: Blob | null | undefined
  onChange: (file: File | null) => void
  placeholder?: string
  className?: string
  accept?: string
  maxSize?: number // in bytes
}

export default function FileUpload({
  value,
  onChange,
  placeholder = '拖拽或点击上传',
  className,
  accept,
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) {
  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps
    }
  ] = useFileUpload({
    multiple: false,
    maxSize,
    accept,
    onFilesChange: files => {
      onChange(files[0]?.file instanceof File ? (files[0].file as File) : null)
    }
  })

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // prevent opening file dialog
    onChange(null)
  }

  const fileName = value instanceof File && value.size > 0 ? value.name : null
  const fileSize = value instanceof Blob && value.size > 0 ? value.size : null

  return (
    <div className='flex flex-col gap-2'>
      <div
        role='button'
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className={cn(
          'border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]',
          className
        )}
      >
        <input
          {...getInputProps()}
          className='sr-only'
          aria-label='Upload files'
        />
        {!fileName && (
          <div className='flex flex-col items-center justify-center text-center'>
            <div
              className='bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border'
              aria-hidden='true'
            >
              <FileUpIcon className='size-4 opacity-60' />
            </div>
            <p className='mb-1.5 text-sm font-medium'>{placeholder}</p>
            <p className='text-muted-foreground text-xs'>
              最大 {formatBytes(maxSize)}
            </p>
          </div>
        )}

        {fileName && (
          <div className='bg-background flex w-full items-center justify-between gap-2 rounded-lg border p-2 pe-3'>
            <div className='flex items-center gap-3 overflow-hidden'>
              <div className='flex aspect-square size-10 shrink-0 items-center justify-center rounded border'>
                {getFileIcon(value instanceof File ? value : null)}
              </div>
              <div className='flex min-w-0 flex-col gap-0.5'>
                <p className='truncate text-[13px] font-medium'>{fileName}</p>
                {fileSize && (
                  <p className='text-muted-foreground text-xs'>
                    {formatBytes(fileSize)}
                  </p>
                )}
              </div>
            </div>

            <Button
              size='icon'
              variant='ghost'
              className='text-muted-foreground/80 hover:text-foreground -me-2 size-8 shrink-0 hover:bg-transparent'
              onClick={handleRemove}
              aria-label='Remove file'
            >
              <XIcon className='size-4' aria-hidden='true' />
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className='text-destructive flex items-center gap-1 text-xs'
          role='alert'
        >
          <AlertCircleIcon className='size-3 shrink-0' />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}
