import React, { useRef, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import styles from "./NavBar.module.css";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Economics", href: "#economics" },
  { label: "Security", href: "#security" },
  { label: "Audit Contract", href: "https://github.com/Tossd-Org/Tossd" },
];

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = () => setMenuOpen(true);
  const close = () => setMenuOpen(false);

  return (
    <header className={styles.header} role="banner">
      <a href="/" className={styles.logo} aria-label="Tossd home">
        Tossd
      </a>

      {/* Desktop nav */}
      <nav className={styles.desktopNav} aria-label="Primary navigation">
        {NAV_LINKS.map((l) => (
          <a key={l.href} href={l.href} className={styles.navLink}>
            {l.label}
          </a>
        ))}
        <a href="#play" className={styles.ctaBtn}>Launch App</a>
      </nav>

      {/* Mobile hamburger */}
      <button
        ref={triggerRef}
        className={styles.hamburger}
        aria-label="Open navigation menu"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={open}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {/* Mobile menu */}
      <MobileMenu open={menuOpen} onClose={close} triggerRef={triggerRef}>
        <div id="mobile-menu">
          <button
            className={styles.closeBtn}
            aria-label="Close navigation menu"
            onClick={close}
          >
            ✕
          </button>
          <nav aria-label="Mobile navigation">
            <ul className={styles.mobileNavList} role="list">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={styles.mobileNavLink} onClick={close}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href="#play" className={styles.mobileCta} onClick={close}>
            Launch App
          </a>
        </div>
      </MobileMenu>
    </header>
  );
}
