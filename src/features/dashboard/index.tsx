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
import EnhancedProjectDescription from './components/enhanced-project-description'
import TutorialLine from './components/tutorial-line'
import StatusOverview from './components/status-overview'
import QuickActions from './components/quick-actions'

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
      <Main className='min-h-screen p-6 bg-gradient-to-br from-background via-background to-muted/20'>
        {/* 英雄区域 - 重新设计 */}
        <div className='mb-12'>
          <EnhancedProjectDescription />
        </div>

        {/* 系统状态概览 - 新增 */}
        <div className='mb-8'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-foreground mb-2'>系统状态</h2>
            <p className='text-muted-foreground'>实时监控攻防场景和靶场演练的运行状态</p>
          </div>
          <StatusOverview />
        </div>

        {/* 快速操作区域 - 新增 */}
        <div className='mb-8'>
          <QuickActions />
        </div>

        {/* 内容展示区域 - 重新布局 */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 mb-12'>
          {/* 词云展示 */}
          <div className='flex items-center justify-center'>
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className='group cursor-pointer'>
                  <img
                    src='/images/wordcloud.svg'
                    alt='wordcloud'
                    width={500}
                    height={500}
                    className='bg-gradient-to-br from-chart-2/20 to-chart-1/20 hover:from-chart-2/40 hover:to-chart-1/40 p-6 shadow-2xl transition-all duration-500 rounded-2xl border border-border/50 group-hover:scale-105 group-hover:shadow-3xl'
                  />
                  <div className='mt-4 text-center'>
                    <p className='text-sm text-muted-foreground font-medium'>项目技术关键词云</p>
                    <p className='text-xs text-muted-foreground'>点击查看详情</p>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardPortal>
                <HoverCardContent className='w-80 p-4'>
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-foreground'>技术关键词分析</h4>
                    <p className='text-sm text-muted-foreground'>
                      基于AI驱动的网络安全技术栈，涵盖攻防推演、智能编排、动态防御等核心领域
                    </p>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <div className='w-2 h-2 bg-primary rounded-full'></div>
                      <span>实时更新</span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCardPortal>
            </HoverCard>
          </div>
        
          {/* 教程引导 */}
          <Card className='transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-xl'>
                <Icons.github className='h-6 w-6 text-primary' />
                快速上手指南
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <TutorialLine />
            </CardContent>
          </Card>
        </div>

        <Separator className='my-12 border-1 shadow-sm' />

        {/* 团队成员展示 - 重新设计 */}
        <div className='py-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-foreground mb-4'>
              核心团队
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              一个专注于 AI 安全研究的精英团队，致力于探索前沿的攻防技术，构建安全可信的数字世界
            </p>
          </div>
          
          <div className='space-y-12'>
            {teamMates.map((role) => (
              <div key={role.responsibility}>
                <h3 className='text-muted-foreground mb-6 text-center text-xl font-semibold flex items-center justify-center gap-2'>
                  <div className='w-1 h-6 bg-primary rounded-full'></div>
                  {role.responsibility}
                  <div className='w-1 h-6 bg-primary rounded-full'></div>
                </h3>
                <div className='flex flex-wrap justify-center gap-6'>
                  {role.members.map((mate) => (
                    <Card
                      key={mate.name}
                      className='w-64 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm'
                    >
                      <CardContent className='flex flex-col items-center p-6 text-center'>
                        <Avatar className='mb-4 h-24 w-24 ring-4 ring-primary/20 transition-all duration-300 hover:ring-primary/40'>
                          <AvatarImage src={mate.avatar_url} alt={mate.name} />
                          <AvatarFallback className='text-2xl font-bold bg-primary/10 text-primary'>
                            {mate.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h4 className='text-lg font-bold text-foreground mb-2'>{mate.name}</h4>
                        <a
                          href={mate.github_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='group'
                        >
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-muted-foreground hover:text-primary transition-colors duration-300'
                          >
                            <Icons.github className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300' />
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

        {/* 页脚 */}
        <div className='py-8 text-center border-t border-border/50'>
          <div className='group flex items-center justify-center gap-2 mb-4'>
            <Icons.github className='transition-transform duration-300 group-hover:scale-110' />
            <FlipLink href='https://github.com/FJNU-AI-Hacker' >
              FJNU-AI-Hacker
            </FlipLink>
          </div>
          <p className='text-muted-foreground text-sm'>
            点击进入项目地址
          </p>
        </div>
      </Main>
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
