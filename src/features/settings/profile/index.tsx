import ContentSection from '../components/content-section'
import ProfileForm from './profile-form'

export default function SettingsProfile() {
  return (
    <ContentSection
      title='个人信息'
      desc='这是您在网站上的个人信息。'
    >
      <ProfileForm />
    </ContentSection>
  )
}
