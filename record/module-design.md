### 4.1 模块设计

前端可视化交互与控制系统按照使用流程划分为五个主要模块：主页导航、动态场景生成、Agent 动态攻防推演、个人演练推演、自动化评估报告。以下逐一说明模块的功能与大致设计。

## ① 主页导航模块（`@/dashboard`）
- **功能定位**: 提供系统总览、快速上手引导、全局入口与常用操作聚合。
- **主要能力**:
  - 系统状态概览与运行态监控（`StatusOverview`）。
  - 快速操作（创建场景/演练、导入配置、查看日志等，`QuickActions`）。
  - 新手教程引导与快速开始（`TutorialLine`）。
  - 团队与项目信息展示（`EnhancedProjectDescription`、团队卡片）。
- **核心组件**:
  - 布局与导航：`Header`、`TopNav`、`Main`、`ProfileDropdown`、`Search`、`ThemeSwitch`。
  - 展示与交互：`Card` 系列、`HoverCard`、词云展示区、`Separator`。
- **交互与设计要点**:
  - 渐变背景与卡片 hover 动效，响应式两列布局。
  - 顶部导航提供到 `@/scenarios`、`@/exercises` 等核心模块的直达入口。

## ② 动态场景生成模块（`@/target-factory`）
- **功能定位**: 面向“靶场/目标”资源的动态生成与管理，支撑后续攻防场景编排。
- **主要能力**:
  - 目标列表与选中（`TargetsContainer`）。
  - 操作日志与运行态查看（`TargetLog`）。
  - 目标创建/编辑/操作弹窗（`TargetDialog`）。
- **核心组件与结构**:
  - 上下文：`TargetDialogProvider` 提供跨组件状态/动作分发。
  - 布局：左侧可调整宽度的 `Resizable` 目标面板（默认 400，范围 300–600），右侧为日志区。
- **交互与设计要点**:
  - 选中某个目标后，可通过对话框执行创建、更新、生成等动作。
  - 保持列表区与日志区的并行可视，便于实时反馈与溯源。

## ③ Agent 动态攻防推演模块（`@/scenarios`、`@/scenario`）
- **场景列表页（`@/scenarios`）**
  - **功能定位**: 管理与浏览由 AI Agent 驱动的攻防场景，支持创建、筛选、排序、搜索与构建日志查看。
  - **主要能力**:
    - 场景检索与筛选：按名称关键字、状态（基于 `scenarioStateConfig`）过滤；升序/降序排序。
    - 运行态与构建日志：`useModelBuildLogs('scenario')` 管理日志连接、显示/隐藏与构建状态。
    - 场景操作：`ScenarioCard` 结合 `useScenario`（拉取状态）与 `useScenarioActions`（启动/停止/构建等）。
    - 资源/文件对话框：`ScenariosDialogs`、`ScenarioFileDialogs`。
  - **核心组件**: `Header`、`Main`、`ScenariosPrimaryButtons`、`ScenarioCard`、`BuildLog`、`Select`/`Input` 过滤控件。

- **场景详情页（`@/scenario`）**
  - **功能定位**: 单个场景的实时推演与观测，承载对话指挥、过程可视化与容器/Agent 日志。
  - **主要能力**:
    - 对话引导与指令交互：`ChatBot`。
    - 推演过程可视化：`ScenarioProcessLine` + `TextScroll`（如 “TARGET SAFE”）。
    - 容器日志与 Agent 日志：`LogController`、`AgentLogController`（根据 `isAttackStarted` 展开）。
  - **状态与协作**:
    - `useScenario` 同步场景状态；`useProcess` 管理流程态（如 `isAttackStarted`）。
    - 首屏高度与扩展高度在推演开始后动态切换，侧边栏通过 `useSidebar` 自动折叠以沉浸式展示。
    - 复用列表页的对话框能力：`ScenariosDialogProvider`、`ScenariosDialogs`、`ScenarioFileDialogs`。

## ④ 个人演练推演模块（`@/exercise`）
- **功能定位**: 面向个人演练的“创建-运行-观察-管理”全流程，逻辑与场景列表相近，聚焦个体任务与训练闭环。
- **主要能力**:
  - 演练检索/筛选/排序，列表卡片展示（`ExerciseCard`）。
  - 构建与运行日志（`useModelBuildLogs('exercise')`、`BuildLog`）。
  - 操作动作封装（`useExerciseActions`），并与 `useExercise` 同步实时状态。
- **核心组件**: `ExercisesPrimaryButtons`、`ExercisesDialogs`、`ExerciseCard`、筛选/排序控件、日志面板。
- **交互要点**: 支持显示/隐藏日志、过滤“所有/特定状态”，提供新建演练的快捷入口。

## ⑤ 自动化评估报告模块（`@/exercise-report`、`@/scenario-report`）
- **演练评估报告（`@/exercise-report`）**
  - **功能定位**: 针对个人演练过程与结果的量化与结构化呈现，辅助复盘与能力提升。
  - **主要能力**:
    - 综合得分与雷达图（`ScoreRadarChart`）。
    - AI 综合评估（结论、优势/待改进项、建议）。
    - 推荐学习路径（相关技术徽章、实践技能、学习资源）。
  - **核心组件**: `Header`、`Main`、`Badge`、`Card*` 系列、`ScoreRadarChart`、`AiEvaluationCard`、`LearningPathCard`。

- **场景评估报告（`@/scenario-report`）**
  - **功能定位**: 面向场景级攻防推演的全景化复盘，覆盖攻击链、威胁、修复、归因、风险与响应效果等维度。
  - **主要能力**:
    - 报告头与元信息（`ReportHeader`）。
    - 执行摘要（`ExecutiveSummary`）与攻击链（`AttackChain`）。
    - 威胁与拦截分析（`ThreatAnalysis`）。
    - 漏洞修复与归因摘要（`RemediationAnalysis`、`AttributionSummary`）。
    - 侧栏度量：风险评估（`RiskAssessment`）、威胁统计（`ThreatStatistics`）、响应效果（`ResponseEffectiveness`）。
    - 安全建议与后续行动（`Recommendations`）。
  - **数据来源**: 页面集成 `SearchProvider`；接口层支持 `useScenarioReport`（当前示例以 `mockDefenseReport1` 演示结构）。

---

- **跨模块协作**:
  - 统一的 `Header`/`Main` 布局、`Search`、`ThemeSwitch`、`ProfileDropdown` 保障一致体验。
  - 通过 TanStack Query 管理服务端状态，Zustand 管理本地 UI/流程态；组件间通过 Context/Provider 实现低耦合通信。
  - 构建/运行日志在列表与详情中贯穿，保证操作反馈与可观测性。 