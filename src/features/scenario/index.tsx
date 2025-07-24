
import { useScenario, useScenarioBuildLogs } from '@/hooks/use-scenario';
import { Header } from '@/components/layout/header';
import { ThemeSwitch } from '@/components/theme-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Main } from '@/components/layout/main';
import TopologyMap from '@/components/topology-map';
import { useSidebar } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { ScenarioCardActions } from './components/scenario-card';
import { useScenarioActions } from '../scenarios/hooks/useScenarioActions';
import { ScenarioState } from '@/types/docker-manager';

import { ScenarioFileDialogs } from '../scenarios/components/scenario-file-dialogs';
import { ScenariosDialogs } from '../scenarios/components/scenarios-dialogs';
import ScenariosDialogProvider from '../scenarios/context/scenarios-context';
import { Card } from '@/components/ui/card';
import { TextScroll } from '@/components/ui/text-scroll';
import { ChatBot } from './components/chat-bot';
interface ScenarioDetailProps {
  scenarioId: string;
}

const ScenarioView = ({ scenarioId }: { scenarioId: string }) => {
  const { scenario } = useScenario(scenarioId);
  const { status } = useScenario(scenarioId)
  const { startBuild, stopBuild } = useScenarioBuildLogs()
  const { handleAction,pendingAction } = useScenarioActions(scenarioId, {startBuild,stopBuild})
  
  if (!scenario) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        场景加载中...
      </div>
    );
  }

  if(status) scenario.state=status.state as ScenarioState

  return (
    <div className='flex flex-col'>
      {/* ===== Top Heading ===== */}
      <Header>
        <h1 className='text-2xl font-bold tracking-tight'>
            {scenario.name}
        </h1>
        <div className='ml-auto flex items-center gap-4'>
          <ScenarioCardActions 
            state={scenario.state} 
            pendingAction={pendingAction} 
            onAction={handleAction} 
          />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed >
        <div className='w-full h-dvh grid grid-cols-5 gap-2'>
         <div className='col-span-1'>
          <ChatBot
            className='w-full h-3/5 pt-0'
          />
          <Card className='w-full h-2/5'/>
         </div>
         <Card className='col-span-3 flex flex-col p-4'>
          <div className='w-full h-1/2'>
          <TextScroll
            text='SAFE'
            className='w-full font-display text-center text-4xl font-semibold tracking-tighter  text-green-600 dark:text-white md:text-7xl md:leading-[5rems'
           />
          <TopologyMap/>
          </div>
          
         </Card>
         <Card className='col-span-1'>

          
         </Card>
         
        </div>
      
      </Main>
    
    </div>
  )
}

const ScenarioDetail = ({ scenarioId }: ScenarioDetailProps) => {
  const { scenario } = useScenario(scenarioId);
  const {open,setOpen} = useSidebar();

  useEffect(() => {
     if (open) {
      setOpen(false)
     }
    return () => {
      if (!open) {
        setOpen(true)
      }
    }
  }, [open, setOpen]);

  if (!scenario) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        场景未找到。
      </div>
    );
  }

  return (
    <ScenariosDialogProvider>
      <ScenarioView scenarioId={scenarioId} />
      <ScenariosDialogs />
      <ScenarioFileDialogs />
    </ScenariosDialogProvider>
  );
};

export default ScenarioDetail;

