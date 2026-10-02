import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { LiquiGlass, type LiquiGlassProps } from '@liqui-design/glass';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * liqui Button — one component, two materials, chosen by what the button means.
 *
 * **`glass`** (the default) is a Base UI button rendered as a LiquiGlass
 * surface. The glass anatomy (backdrop/tint/specular layers + a content
 * wrapper) can't live inside a native `<button>`: its content model is phrasing
 * content, so the wrapper div would be invalid HTML. `nativeButton={false}` is
 * Base UI's supported escape — useButton then supplies `role="button"`,
 * `tabIndex`, and the Enter/Space handlers itself.
 *
 * **`accent` and `danger`** are flat: a solid fill, a real `<button>`, nothing
 * stacked behind the label.
 */

const glassButtonVariants = cva(
  'group inline-flex cursor-pointer select-none outline-none transition-[transform,box-shadow] duration-150 data-[pressed]:scale-[0.97] active:scale-[0.97] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--lq-accent)_40%,transparent)]',
);

const glassButtonContentVariants = cva(
  'inline-flex items-center justify-center rounded-[inherit] font-semibold leading-tight whitespace-nowrap group-hover:bg-[color-mix(in_srgb,var(--lq-highlight)_40%,transparent)] group-data-[disabled]:bg-transparent',
  {
    variants: {
      size: {
        sm: 'gap-1.5 px-3 py-1.5 text-xs',
        md: 'gap-[7px] px-4 py-[9px] text-[13.5px]',
        lg: 'gap-2 px-5 py-3 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const solidButtonVariants = cva(
  cn(
    'inline-flex cursor-pointer select-none items-center justify-center',
    'border-none font-semibold whitespace-nowrap text-white',
    'outline-none transition-[background-color,transform] duration-150',
    'data-[pressed]:scale-[0.97] active:scale-[0.97]',
    'focus-visible:outline-2 focus-visible:outline-offset-[3px]',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  ),
  {
    variants: {
      variant: {
        glass: '',
        accent: cn(
          'bg-[var(--lq-accent)]',
          'hover:not-data-disabled:bg-[color-mix(in_srgb,white_14%,var(--lq-accent))]',
          'focus-visible:outline-[color-mix(in_srgb,var(--lq-accent)_70%,transparent)]',
        ),
        danger: cn(
          'bg-[var(--lq-danger)]',
          'hover:not-data-disabled:bg-[color-mix(in_srgb,white_14%,var(--lq-danger))]',
          'focus-visible:outline-[color-mix(in_srgb,var(--lq-danger)_70%,transparent)]',
        ),
      },
      size: {
        sm: 'gap-1.5 px-3 py-1.5 text-xs leading-tight',
        md: 'gap-[7px] px-4 py-[9px] text-[13.5px] leading-tight',
        lg: 'gap-2 px-5 py-3 text-base leading-tight',
      },
    },
    defaultVariants: { variant: 'accent', size: 'md' },
  },
);

const BUTTON_GLASS = {
  radius: 12,
  blur: 1,
  refraction: 45,
  bezel: 11,
} satisfies Partial<LiquiGlassProps>;

export interface ButtonProps
  extends BaseButton.Props,
    VariantProps<typeof solidButtonVariants> {
  /**
   * Overrides for the underlying glass surface (radius, refraction, bezel…).
   */
  glass?: Partial<LiquiGlassProps>;
}

export function Button({
  variant = 'glass',
  size = 'md',
  glass,
  className,
  style,
  children,
  ...props
}: ButtonProps) {
  if (variant !== 'glass') {
    return (
      <BaseButton
        {...props}
        style={{ borderRadius: glass?.radius ?? BUTTON_GLASS.radius, ...style }}
        className={cn(solidButtonVariants({ variant, size }), className)}
      >
        {children}
      </BaseButton>
    );
  }

  return (
    <BaseButton
      {...props}
      style={style}
      nativeButton={false}
      className={cn(glassButtonVariants(), className)}
      render={
        <LiquiGlass
          {...BUTTON_GLASS}
          {...glass}
          contentClassName={glassButtonContentVariants({ size })}
        />
      }
    >
      {children}
    </BaseButton>
  );
}

export { solidButtonVariants as buttonVariants };
