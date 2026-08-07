import SecuritySettings from '@/features/security-settings/SecuritySettings';

export const metadata = {
  title: 'Signin & Security | Nothing Box',
  description: 'Manage account security credentials and verified devices.',
};

export default function SecurityPage() {
  return <SecuritySettings />;
}
