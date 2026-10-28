import { profile } from '@/data/profile';

const links = [
  { href: '#work', label: 'Work', optional: true },
  { href: '#experience', label: 'Experience', optional: true },
  { href: '#skills', label: 'Skills', optional: true },
  { href: '#contact', label: 'Contact', optional: false },
];

export function Header() {
  return (
    <header className="top wrap">
      <a className="mark" href="#top" id="top">
        <i />
        {profile.fullName}
      </a>
      <nav aria-label="Sections">
        {links.map((l) => (
          <a key={l.href} className={`navlink${l.optional ? ' opt' : ''}`} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
