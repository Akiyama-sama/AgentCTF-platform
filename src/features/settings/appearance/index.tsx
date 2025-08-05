import ContentSection from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export default function SettingsAppearance() {
  return (
    <ContentSection
      title='外观'
      desc='自定义应用程序的外观。自动切换日间和夜间主题。'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
