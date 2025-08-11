import { SSELogLevel } from '@/types/sse'

export const containerTabs = [
  { id: 'attacker', label: '攻击机' },
  { id: 'defender', label: '防御机' },
  { id: 'target', label: '靶机' },
] as const

export type ContainerType = (typeof containerTabs)[number]['id']

export const logLevelOptions: { label: string; value: SSELogLevel | 'ALL' }[] = [
  { label: '全部', value: 'ALL' },
  { label: 'Info', value: SSELogLevel.INFO },
  { label: 'Warning', value: SSELogLevel.WARNING },
  { label: 'Error', value: SSELogLevel.ERROR },
  { label: 'Debug', value: SSELogLevel.DEBUG },
  { label: 'Critical', value: SSELogLevel.CRITICAL },
]

export const mermaidContent =`graph TD
    subgraph 攻击区
        kali[Kali Linux攻击机]
    end
    
    subgraph DMZ区
        web[Web服务器]
    end
    
    subgraph 内网区
        mysql[MySQL数据库]
        samba[文件服务器]
        ad[域控制器]
    end
    
    subgraph 办公区
        office1[办公PC1]
        office2[办公PC2]
    end
    
    kali -->|访问端口80| web
    web -->|内网连接| mysql
    web -->|内网连接| samba
    samba -->|共享文件| office1
    samba -->|共享文件| office2
    office1 -->|加入域| ad
    office2 -->|加入域| ad`