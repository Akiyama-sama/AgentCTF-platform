# 项目演示

<img width="1688" height="1038" alt="屏幕截图 2025-10-19 131649" src="https://github.com/user-attachments/assets/5154b6ba-cb90-40dd-aeda-2cb79a507a5e" />
<img width="1692" height="1059" alt="屏幕截图 2025-10-19 130602" src="https://github.com/user-attachments/assets/541e40c7-4563-4414-b6cc-4ac4e0794999" />
<img width="1681" height="1035" alt="屏幕截图 2025-10-19 131117" src="https://github.com/user-attachments/assets/0f35e43c-7b9d-46bc-b525-6dfa6ee1869d" />
<img width="1689" height="1047" alt="屏幕截图 2025-10-19 124110" src="https://github.com/user-attachments/assets/2eb2baac-5ebf-41d3-8617-523e03803427" />
<img width="1682" height="1033" alt="屏幕截图 2025-10-19 123829" src="https://github.com/user-attachments/assets/ad97954d-13e6-4fc3-a7f8-16590f85e17c" />
<img width="1689" height="1057" alt="屏幕截图 2025-10-19 124410" src="https://github.com/user-attachments/assets/aa6ecd2d-278d-4cb5-b000-66cb2c8ac74c" />
<img width="1683" height="1044" alt="屏幕截图 2025-10-19 124952" src="https://github.com/user-attachments/assets/8c2f387c-8e8c-4ae2-9274-347d9d9ac201" />
<img width="1700" height="1056" alt="屏幕截图 2025-10-19 125009" src="https://github.com/user-attachments/assets/5e09f6c8-c40d-41de-b5b3-e2b0a6cae3bf" />
<img width="1689" height="1042" alt="屏幕截图 2025-10-19 131312" src="https://github.com/user-attachments/assets/1d62e231-5a23-478d-914d-8959c6f5970a" />

我自己博客中也记录了这个项目所遇到的困难挑战与反思：
https://akiyama-sama.github.io/Akiyama-blog/Project/%E6%8F%AD%E6%A6%9C%E6%8C%82%E5%B8%85%E6%AF%94%E8%B5%9B%E9%A1%B9%E7%9B%AE%E5%89%8D%E7%AB%AF


# 部署项目
```bash
#clone项目或者解压项目文件夹
git clone https://github.com/Akiyama-sama/AgentCTF-platform.git

进入到项目目录
cd AgentCTF-platform

```
之后在项目根目录中，找到.env.example,删去文件名中的.example，将文件命名为.env
填写.env里面的必要信息，例如VITE_DEEPSEEK_API_KEY


如果没有安装pnpm,请先安装pnpm，安装可以参考：`https://pnpm.io/zh/installation`

```bash
#安装依赖
pnpm install
#启动开发环境
pnpm run dev
```

浏览器访问地址localhost:5137


# 注意事项
后端服务一共有六个，每个后端服务都设置了默认端口号，每个服务对应着一个路由
docker-manager:8888         --'/api'
agent_attacker:18888        --'/attacker'
agent_defender:17777        --'/defender''
Backend:16666               --'/backend''
Automated-assessment:15555  --'/assessment'
compose-agent:14444         --'/compose'

如果你修改了某项后端服务的端口号，请前往根目录的vite.config.ts文件，配置对应后端路由服务的端口号

例如：你修改了docker-manager的端口号为7777，找到
```
'/api': {
  target: 'http://localhost:8888',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api/, ''),
},
```
这一项，修改8888为7777
