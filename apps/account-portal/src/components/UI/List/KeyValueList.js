'use client';
import useWindowSize from '../../../hooks/useWindowSize';
import KeyValueListMobile from './Mobile/KeyValueListMobile/KeyValueListMobile';
import KeyValueListDesktop from './Desktop/KeyValueListDesktop/KeyValueListDesktop';
import KeyValueListTablet from './Tablet/KeyValueListTablet/KeyValueListTablet';

/**
 * KeyValueList Component Wrapper (Controller)
 * Displays a styled title card containing key-value metadata list rows.
 * Complies with the Component Wrapper Pattern for Cloud-Base.
 *
 * @param {String} title - The section/card title (e.g. 'Basic Info')
 * @param {Array} fields - Array of field objects [{ key, label, value, isEditable }]
 * @param {Function} onEditClick - Callback when an editable item is clicked
 */
const KeyValueList = ({ title, fields = [], onEditClick }) => {
  const { width } = useWindowSize();

  const sharedProps = {
    title,
    fields,
    onEditClick
  };

  // SSR / Hydration Fallback: Render Mobile view as default
  if (width === undefined) {
    return <KeyValueListMobile {...sharedProps} />;
  }

  if (width >= 1024) {
    return <KeyValueListDesktop {...sharedProps} />;
  }

  if (width >= 768) {
    return <KeyValueListTablet {...sharedProps} />;
  }

  return <KeyValueListMobile {...sharedProps} />;
};

export default KeyValueList;
