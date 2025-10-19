#!/bin/bash

# Agent-CTF 环境一键部署脚本
# 该脚本会自动检查依赖、克隆代码、配置环境并启动所有相关服务。

# --- 配置 ---
# 设置脚本在遇到错误时立即退出
set -e

# 定义颜色输出，用于美化提示信息
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- 辅助函数 ---
# 打印普通信息
info() {
    echo -e "${YELLOW}[INFO] $1${NC}"
}

# 打印成功信息
success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

# 打印错误信息并退出
error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# 捕获Ctrl+C中断信号，并杀死所有后台子进程
trap 'trap - SIGINT && kill -- -$$' SIGINT

# --- 1. 权限与环境检查 ---
info "脚本启动，首先请求 sudo 权限..."
# 预先请求sudo权限，避免中途输入密码
if ! sudo -v; then
    error "无法获取 sudo 权限，脚本终止。"
fi
success "Sudo 权限已获取。"

info "开始检查系统环境和软件依赖..."
# 定义需要的命令列表
dependencies=("docker" "pnpm" "node" "uv" "git" "python" "pip")
for cmd in "${dependencies[@]}"; do
    if ! command -v "$cmd" &> /dev/null; then
        error "必需的软件 '$cmd' 未安装。请先安装后再运行此脚本。"
    fi
    success "✓ $cmd 已安装。"
done

# 检查 Docker 服务是否正在运行
if ! docker info &> /dev/null; then
    error "Docker 服务未运行。请启动 Docker后再运行此脚本。"
fi
success "✓ Docker 服务正在运行。"
info "所有环境依赖检查通过！"

# --- 2. 项目设置与代码克隆 ---
# 检查 Agent-CTF 文件夹是否存在
if [ -d "Agent-CTF" ]; then
    info "文件夹 'Agent-CTF' 已存在，将跳过创建和克隆步骤。"
else
    info "创建 'Agent-CTF' 文件夹..."
    mkdir Agent-CTF
    success "文件夹 'Agent-CTF' 创建成功。"
fi

cd Agent-CTF

# 定义需要克隆的 git 仓库列表
repos=(
    "https://github.com/Akiyama-sama/AgentCTF-platform.git"
    "https://github.com/FJNU-AI-Hacker/docker-manager.git"
    "https://github.com/FJNU-AI-Hacker/agent_attacker.git"
    "https://github.com/FJNU-AI-Hacker/agent_defender.git"
    "https://github.com/FJNU-AI-Hacker/compose-agent.git"
    "https://github.com/FJNU-AI-Hacker/Automated-assessment.git"
    "https://github.com/FJNU-AI-Hacker/Backend.git"
)

info "开始克隆所有项目仓库..."
for repo in "${repos[@]}"; do
    # 从URL中提取项目名称
    dir_name=$(basename "$repo" .git)
    if [ -d "$dir_name" ]; then
        info "仓库 '$dir_name' 已存在，跳过克隆。"
    else
        info "正在克隆 $repo..."
        git clone "$repo"
    fi
done
success "所有仓库克隆完毕。"


# --- 3. 获取 API Token ---
info "请输入您的 DEEPSEEK_API_TOKEN:"
# 使用 -s 标志来隐藏输入内容
read -sp "Token: " DEEPSEEK_API_TOKEN
echo "" # 换行
if [ -z "$DEEPSEEK_API_TOKEN" ]; then
    error "未输入有效的 API Token，脚本终止。"
fi
success "API Token 已保存。"


# --- 4. 部署各个服务 ---
info "开始自动化部署所有服务，请稍候..."

# 1. AgentCTF-platform (前端)
info "部署 AgentCTF-platform..."
(
    cd AgentCTF-platform
    cp .env.example .env
    # 使用不同的sed分隔符，以避免token中的特殊字符导致错误
    sed -i.bak "s|VITE_DEEPSEEK_API_KEY=.*|VITE_DEEPSEEK_API_KEY=${DEEPSEEK_API_TOKEN}|" .env
    pnpm install
    pnpm run dev &
)
success "AgentCTF-platform 已在后台启动 (端口: 5173)。"

# 2. docker-manager
info "部署 docker-manager..."
(
    cd docker-manager
    uv sync
    uv run start_api.py &
)
success "docker-manager 已在后台启动。"

# 3. agent_attacker
info "部署 agent_attacker..."
(
    cd agent_attacker
    uv sync
    cp .env.development .env
    sed -i.bak "s|DEEPSEEK_API_KEY=.*|DEEPSEEK_API_KEY=${DEEPSEEK_API_TOKEN}|" .env
    uv run start_api.py &
)
success "agent_attacker 已在后台启动。"

# 4. agent_defender
info "部署 agent_defender..."
(
    cd agent_defender
    uv sync
    echo "DEEPSEEK_API_KEY=${DEEPSEEK_API_TOKEN}" > .env
    uv run start_api.py &
)
success "agent_defender 已在后台启动。"

# 5. compose-agent
info "部署 compose-agent..."
(
    cd compose-agent
    uv sync
    cp .env.example .env
    # 使用追加的方式确保变量被添加
    echo -e "\nDEEPSEEK_API_KEY=${DEEPSEEK_API_TOKEN}" >> .env
    if [ ! -d "data/vulhub" ]; then
        info "正在为 compose-agent 准备 Vulhub 数据..."
        git clone --depth 1 https://github.com/vulhub/vulhub.git data/vulhub
    else
        info "Vulhub 数据已存在，跳过下载。"
    fi
    uv run server.py &
)
success "compose-agent 已在后台启动。"

# 6. Automated-assessment
info "部署 Automated-assessment..."
(
    cd Automated-assessment
    cp config.example.env .env
    echo -e "\nDEEPSEEK_API_KEY=${DEEPSEEK_API_TOKEN}" >> .env
    pip install -r requirements.txt
    # 脚本将在端口15555上运行
    python run.py --port 15555 &
)
success "Automated-assessment 已在后台启动 (端口: 15555)。"

# 7. Backend
info "部署 Backend..."
(
    cd Backend
    uv sync
    uvicorn app.main:app --reload --host 0.0.0.0 --port 16666 &
)
success "Backend 已在后台启动 (端口: 16666)。"


# --- 5. 完成提示 ---
echo ""
success "所有服务均已成功启动！"
info "请用浏览器访问前端界面: http://localhost:5173"
info "您可以通过 'jobs' 命令查看所有后台进程，使用 'fg %job_number' 或 'kill %job_number' 来管理它们。"
info "要一次性停止所有由本脚本启动的服务，请直接关闭此终端窗口或按 Ctrl+C。"

# 等待所有后台任务，以便trap可以工作
wait

