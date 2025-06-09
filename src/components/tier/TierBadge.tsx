import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, GraduationCap, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
interface TierBadgeProps {
  tier: 'free' | 'premium' | 'university' | 'demo';
  size?: 'sm' | 'md' | 'lg';
}
export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md'
}) => {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          label: 'Free',
          icon: User,
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800'
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: Crown,
          variant: 'default' as const,
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 'university':
        return {
          label: 'University',
          icon: GraduationCap,
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800'
        };
      case 'demo':
        return {
          label: 'Demo',
          icon: Zap,
          variant: 'outline' as const,
          className: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          label: 'Free',
          icon: User,
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };
  const config = getTierConfig(tier);
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, textSize, 'flex items-center gap-1')}
    >
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
};