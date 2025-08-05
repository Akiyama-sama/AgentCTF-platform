export const report = {
  ai_evaluation: {
    richness:
      '攻击手段较为单一，仅涉及SQL注入和WebShell植入两种技术，缺乏多样化的TTP（战术、技术和程序）。',
    depth:
      '攻击链深度有限，仅包含初始访问和持久化两个阶段，未涉及横向移动、权限提升、数据窃取等更深层次的攻击阶段。',
    breadth:
      '攻击链广度不足，仅覆盖了MITRE ATT&CK框架中的两个技术（T1190和T1505.003），未涉及其他广泛的技术领域。',
    weaknesses: [
      '攻击手段单一，缺乏多样化TTP',
      '攻击链深度不足，未涉及多个关键阶段',
      '攻击链广度有限，未覆盖更多技术领域',
      '缺乏横向移动、权限提升和数据窃取等关键攻击技术',
    ],
    recommendations: [
      '增加攻击手段的多样性，尝试使用更多TTP',
      '扩展攻击链深度，加入横向移动、权限提升等阶段',
      '扩大攻击链广度，覆盖更多MITRE ATT&CK技术',
      '模拟更复杂的攻击场景，提升实战能力',
    ],
    learning_path: {
      related_technologies: [
        '渗透测试',
        '漏洞利用',
        '横向移动技术',
        '权限提升技术',
        '数据窃取技术',
        'MITRE ATT&CK框架',
      ],
      practice_and_skills: [
        '参与CTF比赛',
        '搭建实验环境进行实战演练',
        '学习并模拟复杂攻击链',
        '深入研究MITRE ATT&CK框架',
        '学习横向移动和权限提升技术',
      ],
      learning_resources: [
        '《Metasploit渗透测试指南》',
        '《红队行动指南》',
        'MITRE ATT&CK官方文档',
        'Offensive Security课程（如PWK）',
        'Hack The Box和TryHackMe平台',
      ],
    },
    conclusion:
      '整体来看，攻击链的深度和广度有待提升，攻击手段也较为单一。建议学生深入学习MITRE ATT&CK框架，扩展攻击技术范围，并模拟更复杂的攻击场景。通过参与CTF比赛和搭建实验环境进行实战演练，可以显著提升实战能力。继续努力，未来可期！',
  },
  final_score: 33.0,
  score_details: {
    depth_score: 6.0,
    breadth_score: 5.0,
    mitre_score: 4.0,
    richness_score: 3.0,
    ai_score: 15.0,
    total_score: 33.0,
    max_possible_score: 100,
  },
}
