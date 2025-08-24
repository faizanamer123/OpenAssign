import React from 'react';

interface GemIconProps {
  type: 'ruby' | 'emerald';
  size?: number;
  className?: string;
}

export const GemIcon: React.FC<GemIconProps> = ({ type, size = 16, className = '' }) => {
  const iconProps = {
    width: size,
    height: size,
    className: `gem-icon ${className}`,
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  };

  if (type === 'ruby') {
    return (
      <svg {...iconProps}>
        {/* Ruby gem with facets */}
        <path d="M12 2L3 8L12 14L21 8L12 2Z" fill="#dc2626" />
        <path d="M3 16L12 22L21 16V8L12 14L3 8V16Z" fill="#b91c1c" />
        <path d="M12 14L12 22" stroke="#dc2626" strokeWidth="0.5" fill="none" />
        <path d="M3 8L12 14L21 8" stroke="#dc2626" strokeWidth="0.5" fill="none" />
        {/* Facet lines */}
        <path d="M7 10L12 13L17 10" stroke="#dc2626" strokeWidth="0.3" fill="none" />
        <path d="M7 12L12 15L17 12" stroke="#dc2626" strokeWidth="0.3" fill="none" />
        {/* Highlight */}
        <path d="M8 9L10 10L8 11Z" fill="#ff6b6b" opacity="0.6" />
      </svg>
    );
  }

  if (type === 'emerald') {
    return (
      <svg {...iconProps}>
        {/* Emerald gem with facets */}
        <path d="M12 2L3 8L12 14L21 8L12 2Z" fill="#059669" />
        <path d="M3 16L12 22L21 16V8L12 14L3 8V16Z" fill="#047857" />
        <path d="M12 14L12 22" stroke="#059669" strokeWidth="0.5" fill="none" />
        <path d="M3 8L12 14L21 8" stroke="#059669" strokeWidth="0.5" fill="none" />
        {/* Facet lines */}
        <path d="M7 10L12 13L17 10" stroke="#059669" strokeWidth="0.3" fill="none" />
        <path d="M7 12L12 15L17 12" stroke="#059669" strokeWidth="0.3" fill="none" />
        {/* Highlight */}
        <path d="M8 9L10 10L8 11Z" fill="#10b981" opacity="0.6" />
      </svg>
    );
  }

  return null;
};

export default GemIcon;
