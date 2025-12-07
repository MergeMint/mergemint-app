import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
}: {
  className?: string;
}) {
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
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
