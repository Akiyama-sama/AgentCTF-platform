### 关键功能（@/scenario 场景详情）

前端可视化交互与控制系统围绕“演练全流程可见、可控、可回溯”的目标，`@/scenario` 场景详情页聚焦“推演指挥、过程可视化、实时可观测、复盘”四个维度，提供以下核心功能与相应实现思路概览。

## 1) 推演指挥与会话交互（ChatBot）
- **目标**: 将人类指令转为可执行的攻防行动，推动场景从准备态进入对抗态。
- **主要交互**: 通过 `ChatBot` 进行自然语言指挥，支持连续对话、状态联动与回显。
- **实现思路**:
  - 会话状态：由 `useAttackerAgentChat` 管理消息流、输入与流式状态（`idle/connecting/streaming/...`）。
  - 流式通信：使用 `agentSSEManager.createChatStream` 基于 fetch 流式解析（`event: start/message/end/error`），在 `onMessage` 中增量更新 UI。
  - Agent 会话初始化/回收：`useAttackerAgentSession` 提供初始化（init）与清理（cleanup）接口，借助 TanStack Query 缓存用户会话态。

## 2) 推演过程可视化（ScenarioProcessLine）
- **目标**: 将关键阶段（准备/部署/对抗/收尾）与实时状态在单屏串联展示，营造“过程可感”。
- **主要交互**: 进度线路、阶段文案（如 `TextScroll: TARGET SAFE`）与关键节点动画。
- **实现思路**:
  - 流程态：由 `useProcess`（Zustand）统一管理，如 `isAttackStarted/isAttackFinished` 等，用于驱动页面高度切换、日志面板显隐。
  - 场景态：`useScenario(scenarioId)` 轮询后端 state（building/running/...），由状态变化触发流程推进与 UI 反馈。

## 3) 容器运行态与构建日志（LogController）— 可见与可回溯
- **目标**: 将底层容器的构建/运行态日志实时呈现，支持历史回放与状态追踪，构建“可回溯”证据链。
- **主要交互**: 
  - 构建日志：列表页与详情页均可一键显示/隐藏构建日志。
  - 容器日志：分容器维度查看，按时间顺序聚合展示。
- **实现思路**:
  - 构建日志（EventSource SSE）
    - Hook：`useModelBuildLogs('scenario')` 通过 `sseConnectionManager.createConnection` 创建连接到 `.../logs/stream/model/:id/build`。
    - 连接管理：`SSEConnection` 封装连接生命周期（`CONNECTING/CONNECTED/ERROR/ENDED`）、自动重连与 `onHistoryEnd` 通知。
    - 消息转换：`convertSSEMessageToLogItem` 标准化为 `LogDisplayItem`，并使用 `sessionStorage` 持久化最近一次构建日志，支撑“回溯”。
  - 容器日志（EventSource SSE）
    - Hook：`useContainerLogs`（定义于 `use-log.tsx`）按 `modelId + containerName` 分连接管理，复用 `sseConnectionManager`。
    - 单例状态：模块级 `containerLogsState` 与订阅机制，确保多组件共享同一条连接与日志缓存，避免重复订阅。

## 4) Agent 行为与对抗日志（AgentLogController）— 可控与可见
- **目标**: 将攻击/防御 Agent 的推演行为、事件与系统响应以流式方式呈现，形成立体可观测面。
- **主要交互**: 对抗开始后自动展开 Agent 日志区，支持持续滚动与错误提示。
- **实现思路**:
  - 流式日志（fetch + SSE 协议）
    - 工具：`agent-sse-connections.ts` 使用 `fetch` 并手工解析流（`processFetchStream`），兼容自定义 `event:`/`data:` 格式。
    - 连接管理：`AgentSSEManager` 对每条流维护 `AbortController` 与 `status`（`connecting/streaming/error/success`），统一 `onStart/onMessage/onEnd/onError/onFinally` 生命周期回调。
    - 攻击侧日志：`createAttackerLogStream(modelId, request, callbacks)`；防御侧日志：`createDefenderLogStream(modelId, request, callbacks)`。
  - 显示侧：`AgentLogController` 订阅上述流回调，按时间轴渲染，配合 `useProcess` 的阶段标记，实现“对抗开始后展开、结束后固化”。

## 5) 资源/文件对话框与场景资产管理（Dialogs）
- **目标**: 在推演过程中无缝管理场景相关文件与资源。
- **主要交互**: `ScenariosDialogs`、`ScenarioFileDialogs` 用于创建、查看与更新场景文件、配置等。
- **实现思路**:
  - 数据来源：`use-scenario.tsx` 内封装 Orval 生成的文件 API hooks（文件树、内容增删改、目录管理、上传等）。
  - 一致性：操作成功后通过 `invalidateQueries` 使 TanStack Query 自动刷新，保证 UI 与服务端一致。

## 6) 场景状态同步与联动控制（TanStack Query + Zustand）
- **目标**: 打通“服务端状态（模型/容器）”与“本地流程态（UI 展示）”，实现“可控”。
- **实现思路**:
  - 服务端状态：`useScenario` 聚合场景详情与 state，并在启动/停止/构建等 `mutation` 成功后进行 `invalidateQueries`，必要时开启轮询（`refetchInterval`）。
  - 本地流程态：`useProcess` 管理页面级 UI 行为（如展开高度、显示 Agent 区域等），通过判断 `isAttackStarted` 控制布局与日志展现。
  - 侧边栏联动：`useSidebar` 在进入详情时自动折叠，退出时恢复，确保沉浸式推演视野。

## 7) 异常处理与回收（可回溯保障）
- **目标**: 遇到网络/服务异常时具备明确的 UI 反馈与自动恢复，且连接与内存能被正确回收。
- **实现思路**:
  - 事件源异常：`SSEConnection` 在 `onerror` 时进入 `ERROR`，并按最大重试次数调度重连；手动关闭时清理计时器与事件源。
  - fetch 流异常：`AgentSSEManager` 捕获非 `AbortError` 的异常并回调 `onError`，在 `finally` 中统一做连接状态清理，防止泄漏。
  - 持久化：构建日志在 `END` 事件写入 `sessionStorage`，保证刷新后仍可回溯。

## 8) 安全与权限（概览）
- **目标**: 在对抗过程中确保用户态一致、资源受控、操作可追踪。
- **实现思路**:
  - 会话态：全局 `QueryClient` 的 `onError` 对 401/403/500 做统一处理（如自动跳转登录、错误页、提示），与 Clerk 集成保障用户态。
  - 操作反馈：所有关键 `mutation` 成功/失败均通过统一的 `showSuccessMessage/showErrorMessage` 反馈。

---

- **技术要点回顾**
  - SSE 双通道：
    - EventSource 通道（`sseConnection.ts`）用于 Docker/构建/容器日志，具备自动重连与消息标准化能力。
    - fetch + 流解析通道（`agent-sse-connections.ts`）用于 Agent 聊天与对抗日志，支持自定义事件语义与并行流管理。
  - 状态分治与协作：TanStack Query 管理服务端数据一致性，Zustand 管理 UI/流程态，Context/Provider 在模块内解耦通信。
  - 可见/可控/可回溯一体化：对话驱动 → 过程可视 → 日志沉淀与持久化 → 报告复盘（与 `use-report.tsx` 打通）。 