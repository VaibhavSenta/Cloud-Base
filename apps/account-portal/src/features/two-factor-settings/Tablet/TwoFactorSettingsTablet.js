/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import TwoFactorSettingsDesktop from '../Desktop/TwoFactorSettingsDesktop';

export default function TwoFactorSettingsTablet(props) {
  // Reuse Desktop layout with tablet styles (responsive container padding is handled by CSS)
  return <TwoFactorSettingsDesktop {...props} />;
}
