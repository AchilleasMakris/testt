import React from 'react';

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon, title, subtitle, actions }) => {
  return (
    <div className="flex items-center justify-between mb-6 mt-2">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-100 via-blue-200 to-purple-200 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1 text-base">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}; 