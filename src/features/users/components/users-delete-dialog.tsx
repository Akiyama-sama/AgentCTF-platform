'use client'

import { useState } from 'react'

import { IconAlertTriangle } from '@tabler/icons-react'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdmin } from '@/hooks/use-auth'
import type { User } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { deleteUserAsync, isDeletingUser } = useAdmin()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) return

    await deleteUserAsync({ userId: currentRow.id })
    onOpenChange(false)
  }

  const userRole = currentRow.roles?.[0]?.name ?? '未知'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username || isDeletingUser}
      isLoading={isDeletingUser}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          删除用户
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            您确定要删除用户{' '}
            <span className='font-bold'>{currentRow.username}</span> 吗？
            <br />
            此操作将从系统中永久删除角色为{' '}
            <span className='font-bold'>
              {userRole.toUpperCase()}
            </span>{' '}
            的用户。此操作无法撤销。
          </p>

          <Label className='my-2'>
            用户名:
            <Input
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder='输入用户名以确认删除'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>
              请谨慎操作，此操作无法回滚。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
