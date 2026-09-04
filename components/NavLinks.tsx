"use client";

import { Menu } from "@base-ui/react/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  activeSiteSection,
  isExactNavigationPath,
  MORE_NAV_GROUPS,
  PICKS_NAV,
  PRIMARY_NAV,
  type SiteDestination,
} from "@/lib/site-navigation";

function NavLink({
  href,
  label,
  ariaLabel,
  on,
  current,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  on: boolean;
  current: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={current ? "page" : undefined}
      className={on ? "on" : undefined}
    >
      {label}
    </Link>
  );
}

function MoreLink({ item, pathname }: { item: SiteDestination; pathname: string }) {
  const current = isExactNavigationPath(pathname, item.href);
  const className = current ? "site-menu-item on" : "site-menu-item";
  const shared = {
    "aria-current": current ? ("page" as const) : undefined,
    className,
    closeOnClick: true,
  };

  if (item.external) {
    return (
      <Menu.LinkItem href={item.href} {...shared}>
        {item.label}
      </Menu.LinkItem>
    );
  }

  return (
    <Menu.LinkItem render={<Link href={item.href} />} {...shared}>
      {item.label}
    </Menu.LinkItem>
  );
}

function PicksMenu({ on, pathname }: { on: boolean; pathname: string }) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className={`site-nav-picks${on ? " on" : ""}`}
        aria-label="Picks — choose league"
      >
        Picks
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          className="site-menu-positioner"
          side="bottom"
          align="center"
          sideOffset={8}
        >
          <Menu.Popup className="site-menu-popup site-menu-popup-compact">
            {PICKS_NAV.map((item) => (
              <MoreLink key={item.href} item={item} pathname={pathname} />
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function NavLinks() {
  const path = usePathname() || "/";
  const activeSection = activeSiteSection(path);

  return (
    <nav className="site-nav" aria-label="Primary">
      {PRIMARY_NAV.map((item) =>
        item.section === "picks" ? (
          <PicksMenu
            key={item.href}
            on={activeSection === item.section}
            pathname={path}
          />
        ) : (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            ariaLabel={item.ariaLabel}
            on={activeSection === item.section}
            current={isExactNavigationPath(path, item.href)}
          />
        )
      )}
      <Menu.Root>
        <Menu.Trigger className="site-nav-more" aria-label="More site navigation">
          More
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="site-menu-positioner" side="bottom" align="end" sideOffset={8}>
            <Menu.Popup className="site-menu-popup">
              {MORE_NAV_GROUPS.map((group) => (
                <Menu.Group key={group.id} className="site-menu-group">
                  <Menu.GroupLabel className="site-menu-label">{group.label}</Menu.GroupLabel>
                  {group.items.map((item) => (
                    <MoreLink key={item.href} item={item} pathname={path} />
                  ))}
                </Menu.Group>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </nav>
  );
}
