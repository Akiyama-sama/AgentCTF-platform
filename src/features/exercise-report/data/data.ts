export const exerciseReport = {
    "ai_evaluation": {
      "richness": "攻击手段较为单一，主要集中在服务探测和SQL注入攻击，缺乏多样化的TTP（战术、技术和程序）。",
      "depth": "攻击链深度不足，仅涉及初始访问和持久化两个阶段，缺乏横向移动、权限提升等更深层次的攻击行为。",
      "breadth": "攻击链广度有限，主要针对网络服务和Web应用，未涉及社会工程、恶意软件等其他攻击领域。",
      "weaknesses": [
        "攻击手段单一，缺乏多样化TTP",
        "攻击链深度不足，未覆盖完整攻击生命周期",
        "MITRE ATT&CK覆盖分析中大部分TTP为Unknown，缺乏明确的技术和战术"
      ],
      "recommendations": [
        "增加攻击手段的多样性，如社会工程、恶意软件、横向移动等技术",
        "深入攻击链的各个阶段，包括侦察、武器化、交付、利用、安装、命令与控制、目标达成等",
        "明确攻击步骤中的TTP，参考MITRE ATT&CK框架进行更详细的规划和实施"
      ],
      "learning_path": {
        "related_technologies": [
          "网络协议分析（如NTP、DHCP、LLMNR、SSDP等）",
          "Web安全（如SQL注入、WebShell等）",
          "MITRE ATT&CK框架",
          "渗透测试工具（如Metasploit、Burp Suite等）"
        ],
        "practice_and_skills": [
          "模拟完整攻击链的演练，包括侦察、初始访问、持久化、横向移动等",
          "学习使用渗透测试工具进行漏洞利用和攻击模拟",
          "分析真实攻击案例，理解攻击者的TTP"
        ],
        "learning_resources": [
          "《Metasploit渗透测试指南》",
          "MITRE ATT&CK官方网站（https://attack.mitre.org/）",
          "Offensive Security的Penetration Testing with Kali Linux（PWK）课程"
        ]
      },
      "conclusion": "当前攻击链的丰富性、深度和广度有待提升，建议学生深入学习MITRE ATT&CK框架，掌握多样化的攻击技术和工具，并通过实践模拟完整攻击链。鼓励学生继续学习和实践，逐步提升网络安全攻防能力。"
    },
    "final_score": 77.0,
    "score_details": {
      "depth_score": 30.0,
      "breadth_score": 20.0,
      "mitre_score": 6.0,
      "richness_score": 6.0,
      "ai_score": 15.0,
      "total_score": 77.0,
      "max_possible_score": 100
    }
  }