/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import useWindowSize from '../../../hooks/useWindowSize';
import AvatarCropperMobile from './Mobile/AvatarCropperMobile';
import AvatarCropperDesktop from './Desktop/AvatarCropperDesktop';
import AvatarCropperTablet from './Tablet/AvatarCropperTablet';

/**
 * AvatarCropper Component Wrapper (Controller)
 * Enforces the Component Wrapper Pattern for Nothing Box avatar cropping.
 */
const AvatarCropper = (props) => {
  const { width } = useWindowSize();

  // SSR / Hydration Fallback: Render Mobile view as default
  if (width === undefined) {
    return <AvatarCropperMobile {...props} />;
  }

  if (width >= 1024) {
    return <AvatarCropperDesktop {...props} />;
  }

  if (width >= 768) {
    return <AvatarCropperTablet {...props} />;
  }

  return <AvatarCropperMobile {...props} />;
};

export default AvatarCropper;
