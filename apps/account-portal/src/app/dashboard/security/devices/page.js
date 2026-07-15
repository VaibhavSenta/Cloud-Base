import LoggedDevices from '@/features/security-settings/LoggedDevices';

export const metadata = {
  title: 'Logged Devices | Cloud-Base',
  description: 'Revoke active sessions and view logged terminal coordinates.',
};

export default function LoggedDevicesPage() {
  return <LoggedDevices />;
}
