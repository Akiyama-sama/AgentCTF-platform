import { HoverCardPortal } from '@radix-ui/react-hover-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import FlipLink from '@/components/text-effect-flipper'
import { ThemeSwitch } from '@/components/theme-switch'
import { Icons, teamMates } from './data/data'
import ProjectDescription from './components/project-description'

export default function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main className='h-screen p-6'>
        {/* 顶部 */}
        <div className='mb-8 flex items-center justify-between space-y-2'>
          <div className='flex w-full flex-row'>
            <div className='text-chart-1 dark:text-chart-3 flex w-1/2 flex-col tracking-tight'>
              <p className='text-muted-foreground font-serif text-sm'>
                Intelligent Platform Powered by AI Agent
              </p>
              <h1 className='w-full text-left font-serif text-6xl font-bold'>
                你好，指挥官
              </h1>
            </div>

            <div className='flex w-1/2 flex-row gap-2 lg:gap-4'>
              <Separator orientation='vertical' className='h-fit' />
              <p className='text-muted-foreground mb-0 w-full text-start font-serif'>
                欢迎来到 AI Agent 驱动的动态攻防推演靶场平台
                <br />
                在这里，我们将通过AI 技术重塑网络安全实训模式
                <br />
                构建安全可信的数字世界。
              </p>
            </div>
          </div>
        </div>

        <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4'>
          <Card
            className='flex h-[150px] flex-row items-center justify-between space-y-0 pb-2 col-span-3'
          >
           
          </Card>
          <Card
            className='flex flex-row items-center justify-between space-y-0 pb-2 col-span-1'
          >
           
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* wordcloud: as a picture frame */}
          <div className='flex items-center justify-center'>
            <HoverCard>
              <HoverCardTrigger asChild>
                <img
                  src='/images/wordcloud.svg'
                  alt='wordcloud'
                  width={500}
                  height={500}
                  className='bg-chart-2 hover:bg-chart-1 p-3 shadow-2xl transition-all duration-300'
                />
              </HoverCardTrigger>
              <HoverCardPortal>
              <HoverCardContent className='w-fit'>
                <div className='flex justify-between gap-4 text-muted-foreground font-serif'>
                  <p>项目关键词画框</p>
                </div>
              </HoverCardContent>
            </HoverCardPortal>
            </HoverCard>
            
          </div>
        
          <Card className='transition-shadow duration-300 hover:shadow-lg'>
            <CardHeader>
              <CardTitle></CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-base'>
            <ProjectDescription />
            </CardContent>
          </Card>
        </div>

        <Separator className='my-10 border-1 shadow-sm' />
      </Main>

      <div className='py-6 text-center'>
        <div className='group flex items-center justify-center gap-2'>
          <Icons.github />
          <FlipLink href='https://github.com/FJNU-AI-Hacker'>
            FJNU-AI-Hacker
          </FlipLink>
        </div>
        <div className='mt-12'>
          <h2 className='mb-6 text-center font-serif text-3xl font-bold'>
            团队成员
          </h2>
          <div className='space-y-8'>
            {teamMates.map((role) => (
              <div key={role.responsibility}>
                <h3 className='text-muted-foreground mb-4 text-center text-xl font-semibold'>
                  {role.responsibility}
                </h3>
                <div className='flex flex-wrap justify-center gap-6'>
                  {role.members.map((mate) => (
                    <Card
                      key={mate.name}
                      className='w-64 transform transition-all duration-300 hover:scale-105 hover:shadow-xl'
                    >
                      <CardContent className='flex flex-col items-center p-6 text-center'>
                        <Avatar className='mb-4 h-24 w-24'>
                          <AvatarImage src={mate.avatar_url} alt={mate.name} />
                          <AvatarFallback>{mate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h4 className='text-lg font-bold'>{mate.name}</h4>
                        <a
                          href={mate.github_url}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-muted-foreground mt-2'
                          >
                            <Icons.github className='mr-2 h-4 w-4' />
                            GitHub
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className='text-muted-foreground mt-2 text-sm'>
          一个专注于 AI 安全研究的团队，致力于探索前沿的攻防技术。
        </p>
      </div>
    </>
  )
}

const topNav = [
  {
    title: '主页',
    href: '/',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Agent攻防',
    href: '/scenarios',
    isActive: true,
    disabled: false,
  },
  {
    title: '演练平台',
    href: '/exercises',
    isActive: true,
    disabled: false,
  },
  {
    title: '设置',
    href: '/settings',
    isActive: true,
    disabled: false,
  },
]
