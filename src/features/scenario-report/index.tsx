import { SearchProvider } from '@/context/search-context'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import AttackChain from './components/attack-chain'
import AttributionSummary from './components/attribution-summary'
import ExecutiveSummary from './components/executive-summary'
import Recommendations from './components/recommendations'
import RemediationAnalysis from './components/remediation-analysis'
import ReportHeader from './components/report-header'
import ResponseEffectiveness from './components/response-effectiveness'
import RiskAssessment from './components/risk-assessment'
import ThreatAnalysis from './components/threat-analysis'
import ThreatStatistics from './components/threat-statistics'
import { mockDefenseReport } from './data/data'

export default function ScenarioReport() {
  const report = mockDefenseReport

  if (!report) {
    return <div>Loading report...</div>
  }

  return (
    <SearchProvider>
        
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='bg-background text-foreground min-h-screen font-sans'>
          <div className='container mx-auto p-4 sm:p-6 lg:p-8'>
            <main className='space-y-8'>
              <ReportHeader
                modelId={report.model_id}
                timestamp={report.timestamp}
                reportFile={report.report_file}
              />

              <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                <div className='space-y-8 lg:col-span-2'>
                  <ExecutiveSummary
                    data={report.report_data.executive_summary}
                  />
                  <AttackChain
                    data={report.report_data.attack_chain_analysis}
                  />
                  <ThreatAnalysis
                    attackTypes={report.report_data.attack_types}
                    threatBlocking={report.report_data.threat_blocking_analysis}
                  />
                  <RemediationAnalysis
                    data={report.report_data.vulnerability_remediation_analysis}
                  />
                  <AttributionSummary
                    data={report.report_data.attribution_summary}
                  />
                </div>

                <aside className='space-y-8 self-start lg:sticky lg:top-8'>
                  <RiskAssessment data={report.report_data.risk_assessment} />
                  <ThreatStatistics
                    data={report.report_data.threat_statistics}
                  />
                  <ResponseEffectiveness
                    data={report.report_data.response_effectiveness}
                  />
                </aside>
              </div>

              <Recommendations
                emergencyPlan={report.report_data.emergency_response_plan}
                recommendations={report.report_data.security_recommendations}
                nextSteps={report.report_data.next_steps}
              />
            </main>
          </div>
        </div>
      </Main>
    </SearchProvider>
  )
}
