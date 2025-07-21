
import { useScenario } from '@/hooks/use-scenario';
import { Header } from '@/components/layout/header';
import { ThemeSwitch } from '@/components/theme-switch';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Main } from '@/components/layout/main';
import TopologyMap from '@/components/topology-map';
interface ScenarioDetailProps {
  scenarioId: string;
}

const ScenarioDetail = ({ scenarioId }: ScenarioDetailProps) => {
  const { scenario } = useScenario(scenarioId);



  if (!scenario) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        场景未找到。
      </div>
    );
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <h1 className='text-2xl font-bold tracking-tight'>
            {scenario.name}
        </h1>
        <div className='flex flex-col gap-4'>
         <div className='flex flex-col gap-4'>
          <h2 className='text-lg font-bold tracking-tight'>场景拓扑图</h2>
         <TopologyMap />
        </div>
        </div>
        
        
        
      </Main>
    
    </>
  );
};

export default ScenarioDetail;

