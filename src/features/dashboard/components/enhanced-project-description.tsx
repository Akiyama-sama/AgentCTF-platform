import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Shield, 
  Zap, 
  Target, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { keyWords, descriptions } from '../data/data'

const features = [
  {
    icon: Brain,
    title: 'AI驱动编排',
    description: '智能化的攻防策略自动生成与优化',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Shield,
    title: '动态防御',
    description: '实时响应威胁的自适应安全策略',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Target,
    title: '精准靶向',
    description: '基于AI的精确攻击路径识别',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Zap,
    title: '实时推演',
    description: '毫秒级的攻防态势感知与决策',
    color: 'from-orange-500 to-orange-600'
  }
]

export default function EnhancedProjectDescription() {
  return (
    <div className="space-y-6">
      {/* 主要标题区域 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI安全研究前沿</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
          你好，指挥官
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          欢迎来到 AI Agent 驱动的动态攻防推演靶场平台
        </p>
      </div>

      {/* 核心特性展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-muted/30 to-muted/10 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardContent className="p-4 text-center space-y-3">
              <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 项目描述列表 */}
      <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            平台核心价值
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {descriptions.map((description, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-300">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 关键词云预览 */}
      <Card className="border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            技术关键词
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {keyWords.slice(0, 8).map((keyword, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-3 py-1 text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                {keyword.text}
              </Badge>
            ))}
            <Badge variant="outline" className="px-3 py-1 text-xs font-medium flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
              查看更多
              <ArrowRight className="h-3 w-3" />
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 