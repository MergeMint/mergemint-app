export function AuthLayoutShell({
  children,
  Logo,
}: React.PropsWithChildren<{
  Logo?: React.ComponentType;
}>) {
  return (
    <div
      className={
        'flex h-screen flex-col items-center justify-center' +
        ' bg-background lg:bg-muted/30 gap-y-10 lg:gap-y-8' +
        ' animate-in fade-in slide-in-from-top-16 zoom-in-95 duration-1000'
      }
    >
      {Logo ? <Logo /> : null}

      <div
        className={`bg-background flex w-full max-w-[23rem] flex-col gap-y-6 rounded-lg px-6 md:w-8/12 md:px-8 md:py-6 lg:w-5/12 lg:px-8 xl:w-4/12 xl:gap-y-8 xl:py-8`}
      >
        {children}
      </div>
    </div>
  );
}
