import React, { memo } from 'react';

const AvatarBadge = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-[11px] lg:w-8 lg:h-8 lg:text-xs',
    md: 'w-9 h-9 text-sm lg:w-11 lg:h-11 lg:text-base',
    lg: 'w-14 h-14 text-lg lg:w-[68px] lg:h-[68px] lg:text-[22px]'
  };

  const sizeClass = sizes[size] || sizes.md;
  const initials = (user?.nome || '?').trim().charAt(0).toUpperCase();

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.nome}
        className={`${sizeClass} rounded-full border border-white/70 object-cover shadow-lg ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg border border-white/60 ${className}`}>
      {initials}
    </div>
  );
};

export default memo(AvatarBadge);
