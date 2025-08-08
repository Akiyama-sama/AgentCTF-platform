import { Input } from "@/components/ui/input";
import ContentSection from "../components/content-section";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { showSuccessMessage } from "@/utils/show-submitted-data";

export default function SettingsAgent() {
  const [deepSeekApiKey, setDeepSeekApiKey] = useState("");
  useEffect(() => {
    // 从本地获取
    const deepSeekApiKey = localStorage.getItem("deepSeekApiKey");
    if (deepSeekApiKey) {
      setDeepSeekApiKey(deepSeekApiKey);
    }
  }, []);
  return (
    <ContentSection
      title='Agent密钥'
      desc='更新您的Agent密钥信息。'
    >
      <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>deepseek-api-key:</p>
        <Input type="text" value={deepSeekApiKey} onChange={(e) => {
          setDeepSeekApiKey(e.target.value);
        }} />
        
      </div>
      <Button
          className="w-fit"
          onClick={() => {
            // 保存到本地
            localStorage.setItem("deepSeekApiKey", deepSeekApiKey);
            showSuccessMessage("更新成功");
          }}
        >更新
        </Button>
      </div>
    </ContentSection>
  )
}