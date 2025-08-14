import { type DefenseReportResponse } from '@/types/defender-agent'

export const mockDefenseReport: DefenseReportResponse = {
  model_id: 'defender-alpha-007',
  report_file: '/reports/defender-alpha-007-20240729.json',
  timestamp: new Date().toISOString(),
  file_size: 15728,
  last_modified: new Date(new Date().getTime() - 3600 * 1000).toISOString(),
  report_data: {
    executive_summary: {
      threat_overview:
        '本次演练模拟了一起针对Web服务器的复合式攻击，攻击者利用已知漏洞获取初步访问权限，并通过横向移动和权限提升，最终试图窃取核心数据。防御代理成功识别并阻断了关键攻击路径，有效遏制了威胁。',
      main_findings: [
        '成功识别并阻止了SQL注入攻击尝试。',
        '检测到并隔离了恶意的反向Shell脚本。',
        '攻击者利用了过时的Apache Struts漏洞（CVE-2017-5638）。',
        '在数据外泄阶段前成功切断了攻击链。',
      ],
    },
    risk_assessment: {
      risk_level: '高',
      details:
        '尽管攻击被成功防御，但暴露出的初始接入点漏洞（Apache Struts）表明系统存在严重安全隐患。若非代理及时干预，可能导致大规模数据泄露和核心业务中断。',
    },
    threat_statistics: {
      total_threats: 128,
      type_distribution: {
        'SQL注入': 45,
        '跨站脚本 (XSS)': 32,
        '远程代码执行': 15,
        '权限提升': 10,
        '数据侦察': 26,
      },
      severity_distribution: {
        严重: 25,
        高: 40,
        中: 55,
        低: 8,
      },
    },
    attack_chain_analysis: {
      attack_path: '外部侦察 -> 利用公共漏洞 -> 执行恶意代码 -> 安装后门 -> 横向移动 -> 权限提升 -> 数据收集',
      attack_stages: [
        '初始访问',
        '执行',
        '持久化',
        '权限提升',
        '防御规避',
        '凭证访问',
        '发现',
        '横向移动',
        '收集',
        '命令与控制',
        '影响',
      ],
      attack_techniques: [
        '利用面向公众应用的漏洞 (T1190)',
        '命令和脚本解释器 (T1059)',
        '创建或修改系统进程 (T1543)',
        '利用权限提升漏洞 (T1068)',
        '文件和目录发现 (T1083)',
      ],
    },
    attack_types: {
      'SQL注入': {
        description:
          '攻击者尝试通过Web表单向数据库注入恶意SQL代码，以绕过认证或提取敏感信息。',
        examples: [
          `' OR '1'='1`,
          `' UNION SELECT user, password FROM users--`,
        ],
      },
      '远程代码执行': {
        description:
          '利用Apache Struts (CVE-2017-5638) 漏洞，通过构造恶意的Content-Type头来执行服务器命令。',
        examples: [`Content-Type: %{(#_='multipart/form-data')...}`],
      },
    },
    threat_blocking_analysis: {
      blocked_ips: ['185.191.205.10', '45.134.25.88', '103.208.220.241'],
      blocked_ports: ['8080', '4444', '9001'],
      firewall_rules: [
        'DROP in:eth0 out:any src:185.191.205.10 sport:any dst:any dport:80 proto:tcp',
        'BLOCK out:any in:any src:any sport:any dst:any dport:4444 proto:tcp',
      ],
      blocking_effectiveness:
        '98% 的已知恶意流量被成功阻断。剩余2%为低风险侦察活动，未造成实质影响。',
    },
    vulnerability_remediation_analysis: {
      restarted_services: ['apache2', 'mysql'],
      web_config_changes: [
        '更新了 mod_security 规则集以增强对SQL注入的过滤。',
        '禁用了不必要的HTTP方法，如PUT、DELETE。',
      ],
      applied_patches: ['Apache Struts 2.5.13 (紧急)'],
      remediation_success_rate: '100%',
      remediation_actions: [
        '对存在漏洞的Apache Struts组件进行了紧急升级。',
        '清理了/tmp目录下的恶意负载文件。',
        '重置了被泄露风险的数据库用户密码。',
      ],
    },
    attribution_summary: {
      attacker_attribution: '归属于 "APT-C-36" (魔鼠) 组织的可能性为中等。',
      attack_motivation: '主要动机为数据窃取，用于后续的商业勒索或情报售卖。',
      attack_impact: '由于防御成功，实际影响被控制在最低水平，仅造成短暂的系统性能下降。',
      attribution_confidence: '中等',
      attribution_reasoning:
        '攻击中使用的TTPs (战术、技术和程序) 与已知的 "APT-C-36" 组织高度相似，特别是其对特定版本Apache Struts的偏好和独特的命令混淆技巧。',
    },
    response_effectiveness: {
      effectiveness: '非常有效',
      details:
        '防御代理在攻击链的关键节点（执行和持久化阶段）做出了快速响应，阻止了攻击的深入。从首次检测到威胁被遏制，总耗时小于5分钟。',
    },
    emergency_response_plan: {
      immediate_actions: [
        '隔离受感染的主机。',
        '阻止恶意IP地址的访问。',
        '分析日志以确定攻击范围。',
      ],
      short_term_measures: [
        '对所有面向公众的系统进行漏洞扫描。',
        '审查并加强防火墙和WAF规则。',
        '强制所有特权账户轮换密码。',
      ],
      long_term_improvements: [
        '建立常态化的补丁管理流程。',
        '引入威胁情报平台以增强预警能力。',
        '定期进行安全意识培训和红蓝对抗演练。',
      ],
      personnel_assignments: [
        '安全团队A: 负责漏洞修复和系统加固。',
        '安全团队B: 负责事件调查和攻击溯源。',
      ],
      communication_mechanisms: [
        '每小时向管理层同步事件进展。',
        '通过安全事件响应平台（如Jira）跟踪任务。',
      ],
    },
    security_recommendations: {
      recommendations: [
        '**高优先级**: 立即对所有服务器上的Apache Struts版本进行排查和升级。',
        '**中优先级**: 部署最小权限原则，限制Web应用服务器的数据库访问权限。',
        '**低优先级**: 考虑引入API网关以统一管理和保护API端点。',
      ],
    },
    next_steps: {
      steps: [
        '完成对本次演练的全面复盘，并将经验教训纳入知识库。',
        '安排下一次演练，重点测试针对容器化环境的攻击场景。',
        '向相关开发团队通报漏洞详情，推动源代码级别的安全修复。',
      ],
    },
  },
}

export const mockDefenseReport1:DefenseReportResponse={
  "model_id": "defender-alpha-007",
  "report_file": "/reports/defender-alpha-007-20250813.json",
  "timestamp": "2025-08-13T13:06:43.123Z",
  "file_size": 16254,
  "last_modified": "2025-08-13T12:06:43.123Z",
  "report_data": {
    "executive_summary": {
      "threat_overview": "本次演练模拟了一起针对Web服务和数据库的复合式攻击。攻击者首先利用Web应用中的SQL注入漏洞（CVE-2022-XXXXX的变种）获取初步访问权限和信息，并成功植入WebShell。同时，攻击者还利用了暴露在公网的数据库服务的弱口令。防御代理成功检测到两条攻击路径，并在攻击者造成实质性破坏前阻断了关键行为。",
      "main_findings": [
        "成功识别并阻止了针对'id'参数的SQL注入联合查询（UNION SELECT）攻击。",
        "检测到利用数据库文件函数（INTO OUTFILE）向Web目录写入恶意PHP WebShell的企图并进行了隔离。",
        "发现并告警了从外部IP直接登录MySQL root账户的异常行为，该行为利用了'root/root'弱口令。",
        "在WebShell被用于执行大规模系统命令之前，成功切断了其与C2的回连。"
      ]
    },
    "risk_assessment": {
      "risk_level": "严重",
      "details": "尽管攻击被成功防御，但暴露出的两个核心漏洞——Web层SQL注入和数据层弱口令，表明系统存在基础安全架构的严重缺陷。任何一个漏洞被成功利用，都可能导致服务器完全沦陷、数据被窃取或篡改，对业务造成灾难性影响。"
    },
    "threat_statistics": {
      "total_threats": 215,
      "type_distribution": {
        "SQL注入": 155,
        "恶意文件上传": 10,
        "远程命令执行": 25,
        "数据库弱口令访问": 5,
        "敏感文件读取": 20
      },
      "severity_distribution": {
        "严重": 35,
        "高": 90,
        "中": 85,
        "低": 5
      }
    },
    "attack_chain_analysis": {
      "attack_path": "外部侦察 -> 利用Web应用SQL注入 -> 读取敏感文件/信息搜集 -> 植入WebShell后门 -> 尝试执行系统命令。并行路径: 外部侦察 -> 直接利用数据库弱口令登录 -> 完全控制数据库",
      "attack_stages": [
        "初始访问",
        "执行",
        "持久化",
        "凭证访问",
        "发现",
        "收集",
        "命令与控制"
      ],
      "attack_techniques": [
        "利用面向公众应用的漏洞 (T1190)",
        "有效账户: 默认账户 (T1078.001)",
        "服务器软件组件: WebShell (T1505.003)",
        "命令和脚本解释器: Unix Shell (T1059.004)",
        "从信息库中窃取数据 (T1213)"
      ]
    },
    "attack_types": {
      "SQL注入": {
        "description": "攻击者通过Web应用的'id'参数注入恶意的SQL联合查询语句，以窃取数据库元数据、读取服务器文件并最终写入后门程序。",
        "examples": [
          "/?id=1' union select 1,version() --",
          "/?id=1' union select 1,group_concat(table_name) from information_schema.tables where table_schema=database()--",
          "/?id=1' union select 1,'<?php system($_GET[\\'cmd\\']); ?>' into outfile '/var/www/html/shell.php'--"
        ]
      },
      "数据库弱口令": {
        "description": "攻击者直接通过公网IP连接到MySQL数据库服务（端口3306），并使用默认的、极易被猜解的'root/root'凭证成功登录，获取了数据库的最高管理权限。",
        "examples": [
          "mysql -h 127.0.0.1 -P 3306 -u root -proot"
        ]
      }
    },
    "threat_blocking_analysis": {
      "blocked_ips": ["192.0.2.101"],
      "blocked_ports": ["3306"],
      "firewall_rules": [
        "DROP in:eth0 out:any src:192.0.2.101 sport:any dst:any dport:8080 proto:tcp -m string --string 'union select' --algo bm -j LOG_AND_DROP",
        "REJECT in:eth0 out:any src:any sport:any dst:any dport:3306 proto:tcp"
      ],
      "blocking_effectiveness": "100% 的已知攻击行为被成功阻断。SQL注入在利用阶段被WAF规则拦截，弱口令登录被网络访问控制策略阻止。"
    },
    "vulnerability_remediation_analysis": {
      "restarted_services": ["apache2", "mysql"],
      "web_config_changes": [
        "在PHP应用层面对id参数的获取进行了重构，强制使用参数化查询（PDO）。",
        "修改了PHP配置文件php.ini，禁用了'system', 'exec'等高危函数。"
      ],
      "applied_patches": [],
      "remediation_success_rate": "100%",
      "remediation_actions": [
        "已从/var/www/html/目录中清理了攻击者上传的'shell.php'文件。",
        "已重置MySQL的root账户密码，并配置其只允许本地（localhost）登录。",
        "已为Web应用创建了专用的低权限数据库用户。"
      ]
    },
    "attribution_summary": {
      "attacker_attribution": "归属于特定APT组织的可能性低。攻击手法为广为人知的经典技术，更符合机会主义攻击者或脚本小子（Script Kiddie）的行为模式。",
      "attack_motivation": "主要动机推测为获取服务器控制权，可能用于后续的挖矿、DDoS僵尸网络或作为进一步攻击的跳板。",
      "attack_impact": "由于防御代理和策略的有效介入，实际影响被限制在极小范围内，未造成数据泄露和业务中断。",
      "attribution_confidence": "低",
      "attribution_reasoning": "攻击中使用的TTPs非常普遍，缺乏独特性和高级技巧，是各类安全教程和自动化工具中的常见payload，不具备指向性。"
    },
    "response_effectiveness": {
      "effectiveness": "非常有效",
      "details": "防御系统在攻击的初始访问阶段即发出告警，并在持久化（写入WebShell）的关键节点进行了实时阻断。数据库弱口令登录行为也被访问控制策略成功拦截，防止了第二攻击路径的形成。"
    },
    "emergency_response_plan": {
      "immediate_actions": [
        "隔离受影响的Web服务器容器。",
        "在边界防火墙上阻止攻击源IP。",
        "分析Web和数据库日志以确认攻击的全部范围。"
      ],
      "short_term_measures": [
        "对所有代码库进行安全审计，排查是否存在类似的SQL注入漏洞。",
        "对所有数据库实例进行安全基线检查，确保无弱口令、未授权访问等问题。",
        "审查网络访问控制策略，收紧不必要的服务端口暴露。"
      ],
      "long_term_improvements": [
        "建立强制性的安全编码规范，并将参数化查询作为标准开发实践。",
        "实施定期的自动化安全扫描和渗透测试。",
        "将数据库等核心服务置于内网，不直接对公网暴露。"
      ],
      "personnel_assignments": [
        "应用开发团队: 负责源代码层面的漏洞修复。",
        "系统运维团队: 负责数据库密码和网络访问策略的加固。"
      ],
      "communication_mechanisms": [
        "通过内部工单系统跟踪漏洞修复进度。",
        "在安全周会上向所有技术人员通报此次事件的经验教训。"
      ]
    },
    "security_recommendations": {
      "recommendations": [
        "**最高优先级**: 立即在代码层面修复SQL注入漏洞，对所有用户输入进行严格的参数化处理。",
        "**最高优先级**: 立即修改MySQL root弱口令，并配置网络ACL，禁止数据库端口对公网暴露。",
        "**中优先级**: 为Web应用配置专用的、权限最小化的数据库账户。",
        "**低优先级**: 部署文件完整性监控系统，对Web目录下的任何文件变更进行实时告警。"
      ]
    },
    "next_steps": {
      "steps": [
        "完成本次演练的全面复盘，将防御SQL注入和弱口令的最佳实践更新到公司安全知识库。",
        "安排一次针对开发人员的安全编码专项培训。",
        "验证所有修复措施是否已正确部署并生效。"
      ]
    }
  }
}
