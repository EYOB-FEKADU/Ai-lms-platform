import React from 'react';

const roleConfig = {
  student: { color: 'from-blue-500 to-blue-600', icon: '📚', label: 'Student' },
  instructor: { color: 'from-green-500 to-green-600', icon: '👨‍🏫', label: 'Teacher' },
  parent: { color: 'from-purple-500 to-purple-600', icon: '👪', label: 'Parent' },
  super_admin: { color: 'from-red-500 to-red-600', icon: '⚙️', label: 'Admin' },
};

const RoleCard = ({ role, onSelect, isSelected }) => {
  const config = roleConfig[role];
  return (
    <button
      onClick={() => onSelect(role)}
      className={`relative p-4 rounded-xl text-white transition-all transform hover:scale-105 bg-gradient-to-br ${config.color} ${isSelected ? 'ring-4 ring-yellow-400 scale-105 shadow-lg' : 'shadow-md'}`}
    >
      <div className="text-3xl mb-2">{config.icon}</div>
      <div className="font-semibold text-lg">{config.label}</div>
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black text-xs font-bold">✓</div>
      )}
    </button>
  );
};

export default RoleCard;
