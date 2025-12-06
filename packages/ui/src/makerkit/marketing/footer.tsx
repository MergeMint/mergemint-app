import { cn } from '../../lib/utils';

interface FooterSection {
  heading: React.ReactNode;
  links: Array<{
    href: string;
    label: React.ReactNode;
  }>;
}

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  logo: React.ReactNode;
  description: React.ReactNode;
  copyright: React.ReactNode;
  sections: FooterSection[];
}

export const Footer: React.FC<FooterProps> = ({
  className,
  logo,
  description,
  copyright,
  sections,
  ...props
}) => {
  return (
    <footer
      className={cn(
        'site-footer relative mt-auto w-full py-8 2xl:py-20',
        className,
      )}
      {...props}
    >
      <div className="container">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0">
          <div className="flex w-full gap-x-3 lg:w-4/12 xl:w-4/12 xl:space-x-6 2xl:space-x-8">
            <div className="flex flex-col gap-y-4">
              <div>{logo}</div>

              <div className="flex flex-col gap-y-4">
                <div>
                  <p className="text-muted-foreground text-sm tracking-tight">
                    {description}
                  </p>
                </div>

                <div className="text-muted-foreground flex text-xs">
                  <p>{copyright}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-y-4 lg:flex-row lg:justify-end lg:gap-x-6 lg:gap-y-0 xl:gap-x-12">
            {sections.map((section, index) => (
              <div key={index}>
                <div className="flex flex-col gap-y-2.5">
                  <FooterSectionHeading>{section.heading}</FooterSectionHeading>

                  <FooterSectionList>
                    {section.links.map((link, linkIndex) => (
                      <FooterLink key={linkIndex} href={link.href}>
                        {link.label}
                      </FooterLink>
                    ))}
                  </FooterSectionList>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

function FooterSectionHeading(props: React.PropsWithChildren) {
  return (
    <span className="font-heading text-sm font-semibold tracking-tight">
      {props.children}
    </span>
  );
}

function FooterSectionList(props: React.PropsWithChildren) {
  return <ul className="flex flex-col gap-y-2">{props.children}</ul>;
}

function FooterLink({
  href,
  children,
}: React.PropsWithChildren<{ href: string }>) {
  return (
    <li className="text-muted-foreground text-sm tracking-tight hover:underline [&>a]:transition-colors">
      <a href={href}>{children}</a>
    </li>
  );
}
