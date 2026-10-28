import { profile } from '@/data/profile';
import { CopyEmail } from './CopyEmail';

export function Contact() {
  const { note, heading, email, location, links } = profile.contact;
  return (
    <section className="contact" id="contact">
      <p className="hand-note">{note}</p>
      <h2>{heading}</h2>
      <CopyEmail email={email} />
      <div className="links">
        {links.map((l) => (
          <a key={l.href} className="btn" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label} ↗
          </a>
        ))}
        <span className="loc">{location}</span>
      </div>
    </section>
  );
}
