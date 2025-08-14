## 部署项目
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


## 注意事项
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