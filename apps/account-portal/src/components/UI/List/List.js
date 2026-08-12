/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import useWindowSize from '../../../hooks/useWindowSize';
import ListMobile from './Mobile/ListMobile/ListMobile';
import ListDesktop from './Desktop/ListDesktop/ListDesktop';
import ListTablet from './Tablet/ListTablet/ListTablet';

/**
 * Universal List Component
 * @param {Array} items - [{ title, status, icon, onClick }]
 * @param {String} variant - 'link' (with arrow) or 'status' (read-only)
 */
const List = ({ items = [], variant = 'link' }) => {
  const { width } = useWindowSize();

  if (width < 768) {
    return <ListMobile items={items} variant={variant} />;
  }

  if (width >= 768 && width < 1024) {
    return <ListTablet items={items} variant={variant} />;
  }

  return <ListDesktop items={items} variant={variant} />;
};

export default List;
