'use client';
import useWindowSize from '../../../hooks/useWindowSize';
import ActionListMobile from './Mobile/ActionListMobile/ActionListMobile';

/**
 * Universal ActionList Component
 * Card-based clickable list with optional indicators.
 *
 * @param {Array} items - [{ label, subtitle?, onClick?, variant?, indicator? }]
 * @param {Boolean} danger - Card-level danger border styling
 *
 * Currently Mobile-first. Desktop/Tablet variants can be added later
 * inside Desktop/ActionListDesktop/ and Tablet/ActionListTablet/.
 */
const ActionList = ({ items = [], danger = false }) => {
  // const { width } = useWindowSize();

  // Mobile-first: all devices render Mobile for now
  return <ActionListMobile items={items} danger={danger} />;
};

export default ActionList;
