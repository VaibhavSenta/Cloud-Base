import TwoFactorSettings from '@/features/two-factor-settings/TwoFactorSettings';

export const metadata = {
  title: 'Two-Factor Authentication | Nothing Box',
  description: 'Manage account security keys, authentication channels, and Multi-factor options.',
};

export default function TwoFactorPage() {
  return <TwoFactorSettings />;
}
