### 项目概览

AgentCTF 平台前端采用以 React 为核心的现代化工程化方案，结合 Vite 构建、TypeScript 全量类型强化、文件式路由与自动代码分割，为复杂的智能攻防推演业务提供高性能、强扩展、可维护的应用基座。

- **核心目标**: 面向智能攻防推演的可视化编排、策略交互、任务治理与结果洞察。
- **关键特性**: 文件式路由、自动拆分、服务端状态与客户端状态分治、OpenAPI 自动生成数据层、主题与设计令牌统一管理、端到端开发体验优化。

## 整体架构

从运行时到工程化，整体架构层次清晰：

- **UI 层**: 基于 React 19，辅以 Radix UI、shadcn 风格体系与 Tailwind CSS 进行快速构建与一致性风格输出。
- **路由层**: 使用 TanStack Router（文件式路由），插件驱动生成 `routeTree.gen.ts`，默认按意图预加载与自动代码分割。
- **状态层**:
  - **服务端状态**: TanStack Query 5 负责数据获取、缓存、失效与乐观更新等。
  - **客户端状态**: Zustand 5 负责全局轻量状态与跨组件共享。
- **数据访问层**: Axios + Orval/OpenAPI 代码生成，按不同后端服务生成 typed hooks，默认集成 TanStack Query 客户端，统一接入自定义 `mutator`（统一拦截器、鉴权与基址）。
- **样式与主题**: Tailwind v4 + `@tailwindcss/vite` 插件；CSS 变量承载设计令牌，支持亮/暗色与多 UI 语义色；`tailwind-merge` 与 `class-variance-authority` 保障组件可组合性与一致性。
- **可视化与交互**: Recharts、@xyflow/react、framer-motion 组合，覆盖图表、流程/编排节点与动效增强。
- **工程与质量**: ESLint 9、Prettier 3、Knip 清理未使用资产；严格 TS 配置与别名；多端口代理联调；DevTools 支持。

## 目录结构（节选）

- `src/`
  - `routes/`: 文件式路由根目录，路由由插件生成到 `routeTree.gen.ts`
  - `components/`: 基础与复合 UI 组件
  - `features/`: 面向业务场景的特性模块聚合
  - `stores/`: Zustand 客户端状态
  - `context/`: 主题、字体等 React Context（如 `ThemeProvider`、`FontProvider`）
  - `utils/`: 工具方法与 API `mutator`（如 `backend-api.ts` 等）
  - `lib/`: 第三方封装或通用库集成
  - `api/`: 与后端交互的高阶封装（如需）
  - `types/`: Orval/OpenAPI 生成的强类型接口与 hooks
  - `assets/`: 静态资源
  - `config/`: 运行期配置（如常量、环境映射）
  - `index.css`: 设计令牌（CSS 变量）、主题、全局样式与自定义 utilities
- 根目录
  - `vite.config.ts`: 插件链、代理、多服务联调、路径别名
  - `orval.config.cjs`: 多后端服务 OpenAPI 代码生成配置与自定义 `mutator`
  - `tailwind.config.js`: Tailwind v4 配置与字体扩展
  - `tsconfig*.json`: 严格 TS 配置与路径别名 `@/*`
  - `openapi/`: 多服务 OpenAPI 文档源

## 路由与应用装配

- **文件式路由**: 借助 `@tanstack/router-plugin` 生成 `routeTree.gen.ts`，在入口处通过 `createRouter({ routeTree, ... })` 装配。
- **预加载策略**: `defaultPreload: 'intent'`，在用户表达导航意图时进行预加载，兼顾性能与体验。
- **代码分割**: 插件自动开启代码分割，按路由切片加载，提升首屏与按需渲染性能。
- **入口装配**: 在 `src/main.tsx` 中注册 `QueryClientProvider`、`ThemeProvider`、`FontProvider` 与 `RouterProvider`，实现数据、主题与路由的统一上下文。

## 状态管理与数据请求

- **TanStack Query 5**
  - 统一的 QueryClient 默认项：失败重试策略、窗口聚焦时刷新（生产开启）、`staleTime` 等。
  - 全局错误处理：对 `AxiosError` 的 401/403/500 等状态进行友好处理（如会话过期登出、跳转错误页面、全局 `sonner` 提示）。
- **Zustand 5**
  - 轻量客户端状态，关注 UI 局部状态与跨组件同步，避免与服务端状态混淆。
- **Axios + OpenAPI 代码生成（Orval）**
  - 多后端服务：`docker-manager`、`compose-agent`、`backend`、`automated-assessment`、`attacker-agent`、`defender-agent` 等。
  - 输出目标：至 `src/types/*.ts`，模式为 `client: 'react-query'` 与 `mode: 'single'`。
  - 自定义 `mutator`: 挂载在 `src/utils/*-api.ts`，统一鉴权、基址与拦截器，生成的 hooks 直接对接 TanStack Query。

## 样式系统与主题

- **Tailwind v4 + 插件链**: 使用 `@tailwindcss/vite`，`index.css` 直接 `@import 'tailwindcss'` 与 `tw-animate-css`。
- **设计令牌**: 通过 CSS 变量定义 `--background/--foreground/--primary/...` 等完整语义色，`@theme inline` 映射至 Tailwind 设计系统变量。
- **明暗主题**: 自定义 `@custom-variant dark` 与 `.dark` 变量覆盖，主题切换无缝覆盖组件。
- **字体与字重**: 引入 Inter/Manrope/ZCOOL（`tailwind.config.js` 中扩展 `chineseArtWord`），一致的排版与中英文混排体验。
- **组件生态**: Radix UI、`class-variance-authority`、`tailwind-merge` 协同，形成“无样式基础 + 设计令牌 + 变体系统”的稳定组合。

## 可视化与交互

- **Recharts**: 负责图表展示与数据洞察。
- **@xyflow/react**: 节点图/流程编排视图，适配攻防推演的可视化场景。
- **framer-motion**: 动效与过渡，增强交互质感。

## 构建与工程

- **Vite 7 配置要点**
  - 插件：`@tanstack/router-plugin`、`@vitejs/plugin-react-swc`、`@tailwindcss/vite`、`@vitejs/plugin-basic-ssl`。
  - 别名：`'@' -> './src'`，以及针对 `@tabler/icons-react` 的优化导入。
  - 代理：多服务本地联调——`/api -> 8888`、`/attacker -> 18888`、`/defender -> 17777`、`/backend -> 8000`、`/assessment -> 8002`、`/compose -> 8003`。
- **TypeScript**
  - 严格模式、Bundler 模式解析、`noUncheckedIndexedAccess` 等质量保障。
  - `paths` 映射 `@/*` 统一跨层引用。
- **代码质量**: ESLint 9 + `@tanstack/eslint-plugin-query`、Prettier 3、`prettier-plugin-tailwindcss`、Knip。

## 脚本与生成

- **开发/构建**: `pnpm dev`、`pnpm build`、`pnpm preview`。
- **规范**: `pnpm lint`、`pnpm format[:check]`。
- **OpenAPI 生成**: `pnpm generate`（或按项目分组的生成脚本），与 `openapi/*.json` 和 `orval.config.cjs` 配合产出强类型 API 层。

## 能力亮点

- **类型安全的端到端数据流**: OpenAPI → Orval → React Query hooks，减少手写样板，提升稳定性。
- **文件式路由 + 自动分割**: 快速扩展页面同时保障首屏性能。
- **统一的错误与会话管理**: 全局拦截与用户提示，提供稳健的异常体验。
- **设计令牌驱动的主题体系**: 亮/暗主题与语义色协同，便于跨页面统一风格与个性化扩展。
- **多后端服务并行联调**: 通过 Vite 代理与 `mutator` 策略，打通攻防、编排与评估等多域服务。
