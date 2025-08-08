import '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import FlipLink from '@/components/text-effect-flipper'
import { ThemeSwitch } from '@/components/theme-switch'
import { Icons, statsCards } from './data/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main className="h-screen">
        <div className="mb-8 flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              欢迎来到 AI Agent 驱动的动态攻防推演靶场平台
            </h1>
            <p className="text-muted-foreground">
              在这里，我们将通过 AI 技术重塑网络安全实训模式，构建安全可信的数字世界。
            </p>
            
          </div>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => (
            <Card key={index} className="bg-card/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.iconClassName}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${card.valueClassName}`}>
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="group flex items-center gap-2">
          <Icons.github />
          <FlipLink href="https://github.com/FJNU-AI-Hacker">
            FJNU-AI-Hacker
          </FlipLink>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          

          {/* Other Info */}
          {/* <div className="space-y-4">
            <Card className="bg-card/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>关于我们</CardTitle>
              </CardHeader>
              <CardContent>
                
                <p className="mt-2 text-sm text-muted-foreground">
                  我们是一个专注于 AI 安全研究的团队，致力于探索前沿的攻防技术。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>平台特色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>🚀 智能化、自动化、精准化的攻防演练</p>
                <p>💡 前瞻性的技术解决方案</p>
              </CardContent>
            </Card>
            
          </div> */}
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
