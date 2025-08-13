"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TabItemType = {
  id: string;
  label: string;
};

type PillTabsProps = {
  tabs?: TabItemType[];
  defaultActiveId?: string;
  onTabChange?: (id: string) => void;
  className?: string;
  layoutId?: string; // 新增 layoutId prop
};

export const PillTabs = React.forwardRef<HTMLDivElement, PillTabsProps>(
  (props, ref) => {
    const {
      tabs = [],
      defaultActiveId = tabs[0]?.id,
      onTabChange,
      className,
      layoutId = "pill-tabs-active-pill", // 提供默认值
    } = props;

    const [activeTab, setActiveTab] = React.useState(defaultActiveId);

    const handleClick = React.useCallback(
      (id: string) => {
        setActiveTab(id);
        onTabChange?.(id);
      },
      [onTabChange]
    );

    React.useEffect(() => {
      if (defaultActiveId) {
        setActiveTab(defaultActiveId);
      }
    }, [defaultActiveId]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-1 rounded-md p-1 bg-background border",
          className
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleClick(tab.id)}
            className={cn(
              "relative px-3 py-1.5 rounded-md transition touch-none", // 调整 padding
              "text-2xs font-medium", // 调整字体大小
              activeTab === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId={layoutId} // 使用传入的 layoutId
                className="absolute inset-0 bg-primary rounded-md"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }
);

PillTabs.displayName = "PillTabs";


