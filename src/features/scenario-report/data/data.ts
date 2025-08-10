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
