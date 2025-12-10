import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
  collapsed,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <Image
        src="/images/mergemint-icon.png"
        alt="MergeMint"
        width={32}
        height={32}
        className={cn('h-8 w-8', className)}
        priority
      />
    );
  }

  return (
    <Image
      src="/images/mergemint-logo.png"
      alt="MergeMint"
      width={180}
      height={40}
      className={cn('h-8 w-auto lg:h-9', className)}
      priority
    />
  );
}

export function AppLogo({
  href,
  label,
  className,
  collapsed,
}: {
  href?: string | null;
  className?: string;
  label?: string;
  collapsed?: boolean;
}) {
  if (href === null) {
    return <LogoImage className={className} collapsed={collapsed} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} collapsed={collapsed} />
    </Link>
  );
}
