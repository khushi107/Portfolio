import { profile } from '@/data/profile';

export function Footer() {
  return (
    <footer className="foot wrap">
      <span>
        © {new Date().getFullYear()} {profile.fullName}
      </span>
    </footer>
  );
}
