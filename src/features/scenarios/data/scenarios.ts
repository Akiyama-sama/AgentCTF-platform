import { ScenarioResponse } from '@/types/docker-manager'

export const scenarios: ScenarioResponse[] = [
  {
    uuid: 'c4a2b8e3-5f0c-4e8a-9d6f-3b7c8e5a2d1f',
    name: 'Log4Shell (CVE-2021-44228) 漏洞利用与防御',
    description: '### 场景背景\n模拟一个使用了存在Log4j2漏洞的Java Web应用。\n### 漏洞类型\n- JNDI注入远程代码执行 (CVE-2021-44228)\n### 网络拓扑\n- 攻击机 (Kali) -> 靶机 (Vulnerable Web App)\n### 防护目标\n升级Log4j2版本或配置WAF规则阻止JNDI lookup。',
    state: 'running',
    file_path: '/data/scenarios/c4a2b8e3-5f0c-4e8a-9d6f-3b7c8e5a2d1f/',
  },
  {
    uuid: 'f2d8e1c9-6b3a-4f5e-8d7c-9a1b2c3d4e5f',
    name: 'WebLogic XMLDecoder (CVE-2017-10271) 渗透测试',
    description: '### 场景背景\n一个未打补丁的WebLogic中间件服务器暴露在公网。\n### 漏洞类型\n- XMLDecoder反序列化漏洞 (CVE-2017-10271)\n### 防护目标\n通过部署防御容器，监控并阻断恶意的XML请求。',
    state: 'running',
    file_path: '/data/scenarios/f2d8e1c9-6b3a-4f5e-8d7c-9a1b2c3d4e5f/',
  },
  {
    uuid: 'a1b9c8d7-e6f5-4a3b-9c2d-1e2f3a4b5c6d',
    name: 'Struts2 S2-045 远程代码执行复现',
    description: '### 场景背景\n基于Struts2框架构建的古老Web应用。\n### 漏洞类型\n- Struts2 S2-045 RCE\n### 技术细节\n- 攻击者可构造恶意的Content-Type头执行命令。\n### 防护目标\n升级Struts2版本或部署深度包检测。',
    state: 'stopped',
    file_path: '/data/scenarios/a1b9c8d7-e6f5-4a3b-9c2d-1e2f3a4b5c6d/',
  },
  {
    uuid: 'e5f6a7b8-c9d0-4e1f-8a2b-3c4d5e6f7a8b',
    name: 'Heartbleed (CVE-2014-0160) 内存信息泄露',
    description: '### 场景背景\n一个使用老旧OpenSSL版本的HTTPS服务。\n### 漏洞类型\n- OpenSSL "心脏出血"漏洞 (CVE-2014-0160)\n### 防护目标\n防御方需通过连接靶机Docker API，升级靶机内的OpenSSL组件并重启服务。',
    state: 'stopped',
    file_path: '/data/scenarios/e5f6a7b8-c9d0-4e1f-8a2b-3c4d5e6f7a8b/',
  },
  {
    uuid: 'd4c3b2a1-f9e8-4d7c-8b6a-5e4f3c2b1a9d',
    name: 'Redis 未授权访问漏洞利用',
    description: '### 场景背景\n一台配置不当的Redis服务器，绑定在0.0.0.0且无密码认证。\n### 漏洞类型\n- Redis未授权访问\n### 防护目标\n修改Redis配置文件，增加密码认证并重启服务。',
    state: 'running',
    file_path: '/data/scenarios/d4c3b2a1-f9e8-4d7c-8b6a-5e4f3c2b1a9d/',
  },
  {
    uuid: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    name: '内网渗透综合靶场 (Active Directory)',
    description: '### 场景背景\n模拟一个包含域控、邮件服务器和Web服务器的小型企业内网。\n### 漏洞类型\n- 包含永恒之蓝、密码喷洒、Kerberoasting等多种攻击向量。\n### 防护目标\n加固域内安全策略，检测并清除攻击者的横向移动行为。',
    state: 'running',
    file_path: '/data/scenarios/1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d/',
  },
  {
    uuid: 'f0e9d8c7-b6a5-4f3e-8d1c-9b8a7c6d5e4f',
    name: 'Docker in Docker 逃逸场景',
    description: '### 场景背景\n靶机环境自身是一个DinD容器，攻击者初始权限在最内层容器。\n### 漏洞类型\n- Docker Socket滥用导致容器逃逸。\n### 防护目标\n防御方需识别并切断攻击者对`/var/run/docker.sock`的恶意访问。',
    state: 'error',
    file_path: '/data/scenarios/f0e9d8c7-b6a5-4f3e-8d1c-9b8a7c6d5e4f/',
  },
  {
    uuid: 'b2c3d4e5-f6a7-4b8c-8d9e-0f1a2b3c4d5e',
    name: 'PHP-FPM 远程代码执行 (CVE-2019-11043)',
    description: '### 场景背景\n使用特定版本Nginx + PHP-FPM配置的Web服务器。\n### 漏洞类型\n- PHP-FPM由于`path_info`处理不当导致的RCE。\n### 防护目标\n更新PHP-FPM版本或修改Nginx配置。',
    state: 'stopped',
    file_path: '/data/scenarios/b2c3d4e5-f6a7-4b8c-8d9e-0f1a2b3c4d5e/',
  },
  {
    uuid: 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f',
    name: 'Shellshock (CVE-2014-6271) 破壳漏洞',
    description: '### 场景背景\n一个暴露了CGI脚本的古老Apache服务器。\n### 漏洞类型\n- Bash破壳漏洞，可通过CGI脚本触发。\n### 防护目标\n升级服务器上的Bash版本。',
    state: 'running',
    file_path: '/data/scenarios/c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f/',
  },
  {
    uuid: 'd4e5f6a7-b8c9-4d0e-8f1a-2b3c4d5e6f7a',
    name: 'WordPress 文件上传漏洞复现',
    description: '### 场景背景\n一个使用了某存在漏洞的WordPress插件的博客网站。\n### 漏洞类型\n- 插件任意文件上传漏洞，可导致getshell。\n### 防护目标\n禁用或更新问题插件，并清理已上传的webshell。',
    state: 'running',
    file_path: '/data/scenarios/d4e5f6a7-b8c9-4d0e-8f1a-2b3c4d5e6f7a/',
  },
  {
    uuid: 'a2b3c4d5-e6f7-4a8b-8c9d-0e1f2a3b4c5d',
    name: 'Dirty Cow (CVE-2016-5195) 提权演练',
    description: '### 场景背景\n攻击者已获得靶机低权限shell。\n### 漏洞类型\n- "脏牛"内核提权漏洞。\n### 防护目标\n内核版本升级或部署内核监控。',
    state: 'stopped',
    file_path: '/data/scenarios/a2b3c4d5-e6f7-4a8b-8c9d-0e1f2a3b4c5d/',
  },
  {
    uuid: 'b3c4d5e6-f7a8-4b9c-8d0e-1f2a3b4c5d6e',
    name: 'Elasticsearch RCE (CVE-2015-1427)',
    description: '### 场景背景\n一个早期版本的Elasticsearch集群，开启了动态脚本功能。\n### 漏洞类型\n- Groovy沙箱绕过导致远程代码执行。\n### 防护目标\n升级ES版本或禁用动态脚本功能。',
    state: 'running',
    file_path: '/data/scenarios/b3c4d5e6-f7a8-4b9c-8d0e-1f2a3b4c5d6e/',
  },
  {
    uuid: 'c4d5e6f7-a8b9-4ca0-8e1f-2a3b4c5d6e7f',
    name: 'Samba "永恒之红" (CVE-2017-7494)',
    description: '### 场景背景\nLinux服务器上运行着有漏洞的Samba服务。\n### 漏洞类型\n- Samba远程代码执行漏洞。\n### 防护目标\n升级Samba或修改smb.conf配置。',
    state: 'stopped',
    file_path: '/data/scenarios/c4d5e6f7-a8b9-4ca0-8e1f-2a3b4c5d6e7f/',
  },
  {
    uuid: 'd5e6f7a8-b9c0-4db1-8f2a-3b4c5d6e7f8a',
    name: 'GitLab任意文件读取 (CVE-2020-10977)',
    description: '### 场景背景\n存在漏洞的自建GitLab服务器。\n### 漏洞类型\n- 路径穿越导致任意文件读取。\n### 防护目标\n部署WAF或升级GitLab。',
    state: 'stopped',
    file_path: '/data/scenarios/d5e6f7a8-b9c0-4db1-8f2a-3b4c5d6e7f8a/',
  },
  {
    uuid: 'e6f7a8b9-c0d1-4ec2-8a3b-4c5d6e7f8a9b',
    name: 'XXE 攻击场景',
    description: '### 场景背景\n一个接受XML数据作为输入的Web服务，且未禁用外部实体解析。\n### 漏洞类型\n- XML外部实体注入 (XXE)。\n### 防护目标\n修复应用代码，禁用外部实体解析。',
    state: 'running',
    file_path: '/data/scenarios/e6f7a8b9-c0d1-4ec2-8a3b-4c5d6e7f8a9b/',
  },
  {
    uuid: 'f7a8b9c0-d1e2-4fd3-8b4c-5d6e7f8a9b0c',
    name: 'Jenkins RCE (CVE-2018-1000861)',
    description: '### 场景背景\n一个可匿名访问的Jenkins CI/CD 服务器。\n### 漏洞类型\n- 利用Stapler框架特性导致的远程代码执行。\n### 防护目标\n升级Jenkins或配置访问控制。',
    state: 'building',
    file_path: '/data/scenarios/f7a8b9c0-d1e2-4fd3-8b4c-5d6e7f8a9b0c/',
  },
  {
    uuid: 'a8b9c0d1-e2f3-4ae4-8c5d-6e7f8a9b0c1d',
    name: 'Confluence 路径穿越 (CVE-2019-3398)',
    description: '### 场景背景\nConfluence Server 实例。\n### 漏洞类型\n- 路径穿越与模板注入。\n### 防护目标\n升级Confluence版本。',
    state: 'pending',
    file_path: '/data/scenarios/a8b9c0d1-e2f3-4ae4-8c5d-6e7f8a9b0c1d/',
  },
  {
    uuid: 'b9c0d1e2-f3a4-4bf5-8d6e-7f8a9b0c1d2e',
    name: 'Apache Solr RCE (CVE-2019-0193)',
    description: '### 场景背景\nApache Solr 服务。\n### 漏洞类型\n- DataImportHandler 远程代码执行漏洞。\n### 防护目标\n升级Solr或禁用DataImportHandler。',
    state: 'error',
    file_path: '/data/scenarios/b9c0d1e2-f3a4-4bf5-8d6e-7f8a9b0c1d2e/',
  },
  {
    uuid: 'c0d1e2f3-a4b5-4cf6-8e7f-8a9b0c1d2e3f',
    name: 'ThinkPHP 5.x RCE 漏洞',
    description: '### 场景背景\n基于ThinkPHP 5.x 框架的网站。\n### 漏洞类型\n- 框架设计缺陷导致的远程代码执行。\n### 防护目标\n升级框架或手动修复漏洞代码。',
    state: 'removing',
    file_path: '/data/scenarios/c0d1e2f3-a4b5-4cf6-8e7f-8a9b0c1d2e3f/',
  },
];

export const testScenarioGraph1 = {
  "sceneId": "devops-pipeline-uuid",
  "sceneName": "企业级DevOps流水线",
  "nodes": [
    {
      "id": "attacker-kali-devops",
      "type": "attacker",
      "position": { "x": 50, "y": 200 },
      "data": {
        "label": "Attacker - Kali",
        "ipAddress": "192.168.20.5",
        "status": "running",
        "image": "kalilinux/kali-rolling",
        "ports": ["41001:5001", "42001:2222"],
        "vulnerabilities": [],
        "isCoreAsset": false,
        "info": "模拟外部攻击者，扫描并利用公开漏洞。"
      }
    },
    {
      "id": "defender-ubuntu-devops",
      "type": "defender",
      "position": { "x": 450, "y": 450 },
      "data": {
        "label": "Defender - Ubuntu",
        "ipAddress": "192.168.20.6",
        "status": "running",
        "image": "ubuntu:22.04",
        "ports": ["41002:5002", "42002:2223"],
        "vulnerabilities": [],
        "isCoreAsset": false,
        "info": "模拟防御方，监控异常并进行响应。"
      }
    },
    {
      "id": "dind-group-devops",
      "type": "dindGroup",
      "position": { "x": 400, "y": 50 },
      "data": {
        "label": "靶机环境 (DevOps Pipeline)",
        "ipAddress": "192.168.20.100",
        "status": "running",
        "image": "docker:dind",
        "info": "一个模拟企业软件开发与交付流程的环境。"
      }
    },
    {
      "id": "internal-jenkins-ci",
      "type": "ci-cd",
      "position": { "x": 50, "y": 50 },
      "parentNode": "dind-group-devops",
      "data": {
        "label": "Jenkins CI/CD",
        "ipAddress": "172.19.0.2",
        "status": "compromised",
        "image": "jenkins/jenkins:2.190-lts",
        "ports": ["48080:8080"],
        "vulnerabilities": ["远程命令执行(CVE-2019-1003000)"],
        "isCoreAsset": true,
        "info": "持续集成服务器，存在严重漏洞，是攻击入口。"
      }
    },
    {
      "id": "internal-gitea-repo",
      "type": "gitServer",
      "position": { "x": 300, "y": 100 },
      "parentNode": "dind-group-devops",
      "data": {
        "label": "Gitea Code Repo",
        "ipAddress": "172.19.0.3",
        "status": "compromised",
        "image": "gitea/gitea:1.14",
        "ports": ["40080:3000", "40022:22"],
        "vulnerabilities": ["弱口令(admin/admin123)"],
        "isCoreAsset": true,
        "info": "存储公司核心源代码。"
      }
    },
    {
      "id": "internal-nexus-artifact",
      "type": "repository",
      "position": { "x": 150, "y": 200 },
      "parentNode": "dind-group-devops",
      "data": {
        "label": "Nexus Artifacts",
        "ipAddress": "172.19.0.4",
        "status": "running",
        "image": "sonatype/nexus3",
        "ports": ["48081:8081"],
        "vulnerabilities": [],
        "isCoreAsset": false,
        "info": "存储编译好的软件包和依赖。"
      }
    }
  ],
  "edges": [
    { "id": "e-attacker-dind-devops", "source": "attacker-kali-devops", "target": "dind-group-devops", "type": "straight" },
    { "id": "e-defender-dind-devops", "source": "defender-ubuntu-devops", "target": "dind-group-devops", "type": "straight" },
    { "id": "e-jenkins-gitea", "source": "internal-jenkins-ci", "target": "internal-gitea-repo", "type": "straight" },
    { "id": "e-jenkins-nexus", "source": "internal-jenkins-ci", "target": "internal-nexus-artifact", "type": "straight"  },
    { "id": "attack-path-devops-1", "source": "attacker-kali-devops", "target": "internal-jenkins-ci", "type": "straight" },
    { "id": "attack-path-devops-2", "source": "internal-jenkins-ci", "target": "internal-gitea-repo", "type": "straight" },
  ]
}

const position = { x: 0, y: 0 };
const edgeType = 'straight';

export const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input' },
    position,
  },
  {
    id: '2',
    data: { label: 'node 2' },
    position,
  },
  {
    id: '2a',
    data: { label: 'node 2a' },
    position,
  },
  {
    id: '2b',
    data: { label: 'node 2b' },
    position,
  },
  {
    id: '2c',
    data: { label: 'node 2c' },
    position,
  },
  {
    id: '2d',
    data: { label: 'node 2d' },
    position,
  },
  {
    id: '3',
    data: { label: 'node 3' },
    position,
  },
  {
    id: '4',
    data: { label: 'node 4' },
    position,
  },
  {
    id: '5',
    data: { label: 'node 5' },
    position,
  },
  {
    id: '6',
    type: 'output',
    data: { label: 'output' },
    position,
  },
  { id: '7', type: 'output', data: { label: 'output' }, position },
];

export const initialEdges = [
  { id: 'e12', source: '1', target: '2', type: edgeType, animated: true },
  { id: 'e13', source: '1', target: '3', type: edgeType, animated: true },
  { id: 'e22a', source: '2', target: '2a', type: edgeType, animated: true },
  { id: 'e22b', source: '2', target: '2b', type: edgeType, animated: true },
  { id: 'e22c', source: '2', target: '2c', type: edgeType, animated: true },
  { id: 'e2c2d', source: '2c', target: '2d', type: edgeType, animated: true },
  { id: 'e45', source: '4', target: '5', type: edgeType, animated: true },
  { id: 'e56', source: '5', target: '6', type: edgeType, animated: true },
  { id: 'e57', source: '5', target: '7', type: edgeType, animated: true },
];
