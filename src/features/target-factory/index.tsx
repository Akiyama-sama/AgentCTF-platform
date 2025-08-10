import { SearchProvider } from '@/context/search-context'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export default function TargetFactory() {
  return (
    <SearchProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='container mx-auto p-4 md:p-8'>
          <h1 className='text-4xl font-bold tracking-tight'>Target Factory</h1>
        </div>
      </Main>
    </SearchProvider>
  )
}
