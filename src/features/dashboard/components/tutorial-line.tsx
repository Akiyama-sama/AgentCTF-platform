import {
    Timeline,
    TimelineHeader,
    TimelineIndicator,
    TimelineItem,
    TimelineSeparator,
    TimelineTitle,
  } from "@/components/ui/timeline"
  
  const items = [
    {
      id: 1,
      date: "Mar 15, 2024",
      title: "在DeepSeek官网生成密钥",
      description:
        "并保存到本地",
    },
    {
      id: 2,
      date: "Mar 22, 2024",
      title: "在靶机工程中创建符合您需求的靶机",
      description:
        "靶机工程中创建符合您需求的靶机",
    },
    {
      id: 3,
      date: "Apr 5, 2024",
      title: "将靶机放在Agent攻防场景当中",
      description:
        "将靶机放在Agent攻防场景当中",
    },
    {
      id: 4,
      date: "Apr 19, 2024",
      title: "通过靶机来进行试炼",
      description:
        "通过靶机来进行试炼",
    },
    {
        id: 5,
        date: "Apr 19, 2024",
        title: "查看评估报告弥补不足",
        description:
          "查看评估报告弥补不足",
      },
  ]
  
  export default function TutorialLine() {
    return (
      <Timeline defaultValue={5}>
        {items.map((item) => (
          <TimelineItem key={item.id} step={item.id}>
            <TimelineHeader>
              <TimelineSeparator />
              <TimelineTitle className="-mt-0.5">{item.title}</TimelineTitle>
              <TimelineIndicator />
            </TimelineHeader>
          </TimelineItem>
        ))}
      </Timeline>
    )
  }
  