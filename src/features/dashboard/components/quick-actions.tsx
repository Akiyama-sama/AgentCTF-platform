import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Target, 
  Users, 
  Settings, 
  Shield, 
  Zap,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  href: string
  badge?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  color?: string
}

const quickActions: QuickAction[] = [
  {
    title: '创建攻防场景',
    description: '启动新的AI Agent攻防推演',
    icon: Activity,
    href: '/scenarios',
    badge: '热门',
    variant: 'default',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: '靶场演练',
    description: '进入网络安全实训环境',
    icon: Target,
    href: '/exercises',
    badge: '推荐',
    variant: 'default',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: '用户管理',
    description: '管理系统用户和权限',
    icon: Users,
    href: '/users',
    variant: 'outline',
    color: 'from-green-500 to-green-600'
  },
  {
    title: '系统设置',
    description: '配置平台参数和偏好',
    icon: Settings,
    href: '/settings',
    variant: 'outline',
    color: 'from-gray-500 to-gray-600'
  }
]

export default function QuickActions() {
  return (
    <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            快速操作
          </CardTitle>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">常用功能</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="group">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-muted/30 to-muted/10 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group-hover:from-muted/50 group-hover:to-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg bg-gradient-to-r ${action.color} p-2 text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {action.title}
                          </h3>
                          {action.badge && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* 系统状态指示器 */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">系统运行正常</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">安全防护</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">AI引擎</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 