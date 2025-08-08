import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

import { useAdmin } from '@/hooks/use-auth'
import { useMemo } from 'react'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { userListSchema } from './data/schema'
import { SearchProvider } from '@/context/search-context'

export default function UsersPage() {
  const { users, usersQuery } = useAdmin()

  // 使用 useMemo 对从后端获取的用户数据进行转换和验证
  // 1. 将 created_time 从 string 转换为 Date 对象
  // 2. 使用 Zod schema 验证数据结构，确保传递给 Table 的数据符合预期
  const safeParsedUsers = useMemo(() => {
    return userListSchema.safeParse(users)
  }, [users])

  if (!safeParsedUsers.success) {
    // 你也可以在这里返回一个错误提示UI
    return <div>数据加载出错，请稍后再试。</div>
  }

  return (
    <UsersProvider>
      <SearchProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>用户管理</h2>
            <p className='text-muted-foreground'>在这里管理您的用户及其角色信息。</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable
            data={safeParsedUsers.data}
            columns={columns}
            isLoading={usersQuery.isLoading}
          />
        </div>
      </Main>

      <UsersDialogs />
      </SearchProvider>
    </UsersProvider>
  )
}
