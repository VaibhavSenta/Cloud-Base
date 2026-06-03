'use client';

import React from 'react';

/**
 * Flexible Skeleton Loader Component
 * @param {string} width - Width of the skeleton
 * @param {string} height - Height of the skeleton
 * @param {string} borderRadius - Border radius (e.g., '50%' for circles)
 * @param {string} className - Extra classes
 */
const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '', style = {} }) => {
  return (
    <div 
      className={`skeleton-base ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius,
        ...style 
      }}
    />
  );
};

export default Skeleton;
