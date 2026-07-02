import TwoFactorSettings from '@/components/TwoFactorSettings/TwoFactorSettings';

export const metadata = {
  title: 'Two-Factor Authentication | Cloud-Base',
  description: 'Manage account security keys, authentication channels, and Multi-factor options.',
};

export default function TwoFactorPage() {
  return <TwoFactorSettings />;
}
