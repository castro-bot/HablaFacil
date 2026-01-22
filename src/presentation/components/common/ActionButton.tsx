import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: ReactNode;
  label?: string;
  ariaLabel: string;
  /** If true, renders as a square icon button */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Variant color mappings using Tailwind classes
 */
const VARIANT_STYLES: Record<ButtonVariant, { enabled: string; disabled: string }> = {
  primary: {
    enabled: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    disabled: 'bg-gray-200 text-gray-400',
  },
  secondary: {
    enabled: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    disabled: 'bg-gray-200 text-gray-400',
  },
  danger: {
    enabled: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    disabled: 'bg-gray-200 text-gray-400',
  },
  warning: {
    enabled: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    disabled: 'bg-gray-200 text-gray-400',
  },
};

/**
 * Reusable action button component with consistent styling
 * Supports icon-only and icon+label variants
 */
export function ActionButton({
  onClick,
  disabled = false,
  variant = 'primary',
  icon,
  label,
  ariaLabel,
  iconOnly = false,
  className = '',
}: ActionButtonProps) {
  const styles = VARIANT_STYLES[variant];
  const colorClass = disabled ? styles.disabled : styles.enabled;

  const baseClasses = `
    flex items-center justify-center
    rounded-xl font-bold
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${disabled ? 'cursor-not-allowed' : 'active:scale-95'}
    ${colorClass}
  `;

  const sizeClasses = iconOnly
    ? 'w-16 h-16 text-2xl'
    : 'flex-1 py-4 px-6 gap-2 text-lg';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${className}`}
      aria-label={ariaLabel}
    >
      {icon && <span className={iconOnly ? '' : 'text-2xl'}>{icon}</span>}
      {label && !iconOnly && <span>{label}</span>}
    </button>
  );
}
