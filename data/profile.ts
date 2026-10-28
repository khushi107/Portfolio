/**
 * Every piece of text on the site lives here. Edit this file to update the
 * portfolio; the components only handle layout and animation.
 */
import type { ColorName } from '@/lib/sketch/geometry';

export interface Project {
  id: 'ehr' | 'doc' | 'maidan';
  title: string;
  meta: [string, string];
  badge?: { text: string; tone: 'award' | 'status' };
  summary: string;
  points: string[];
  stack: string[];
  accent: ColorName;
}

export interface Station {
  board: { name: string; note: string; upcoming?: boolean };
  when: string;
  title: string;
  text?: string;
  points?: string[];
  stack?: string[];
  accent?: ColorName;
  cta?: { label: string; href: string };
}

export interface SkillGroup {
  label: string;
  color: ColorName;
  items: string[];
}

export const profile = {
  name: 'Khushi',
  fullName: 'Khushi Modi',
  metaDescription:
    'Khushi Modi, full-stack engineer who builds workflow automations, web and mobile apps, and blockchain projects.',

  hero: {
    headline: 'New stack, new court. Give me a weekend to learn the game.',
    sub: 'Full-stack engineer at Zordial Technologies in Jaipur. By day I build workflow automations that connect client systems and clear out repetitive work. Along the way I have shipped React apps, a Flutter app and two blockchain projects.',
    caption: ['Fig. 1 · Websites, blocks and a very busy bot', 'Ink on paper'] as [string, string],
  },

  greetings: [
    ['Hello', 'English'],
    ['नमस्ते', 'Hindi'],
    ['Bonjour', 'French'],
    ['Hola', 'Spanish'],
    ['Ciao', 'Italian'],
    ['こんにちは', 'Japanese'],
    ['Olá', 'Portuguese'],
    ['안녕하세요', 'Korean'],
    ['Hallo', 'German'],
    ['Merhaba', 'Turkish'],
    ['Привет', 'Russian'],
    ['Hej', 'Swedish'],
  ] as [string, string][],

  projects: [
    {
      id: 'ehr',
      title: 'EHR and organ donation on the blockchain',
      meta: ['2025', 'Team of 4'],
      badge: { text: '2nd place, Techkriti 2025, IIT Kanpur', tone: 'award' },
      summary:
        'A GDPR-compliant system for health records and organ donation, where every allocation decision is recorded on-chain and can be audited. I owned most of the technical build.',
      points: [
        'Implemented PBFT consensus so organ-allocation decisions stay transparent and auditable.',
        'Built REST APIs into hospital systems, cutting simulated matching time from weeks to hours.',
        'Added OTP sign-in and real-time alerts for critical medical notifications.',
      ],
      stack: ['Solidity', 'Ethereum', 'Web3.js', 'React', 'IPFS'],
      accent: 'coral',
    },
    {
      id: 'doc',
      title: 'Document verification system',
      meta: ['2025', 'Completed'],
      summary:
        'A platform that proves a document is genuine. Files live on IPFS, their fingerprints on Ethereum, and a computer-vision pipeline reads what is inside them.',
      points: [
        'Built the text-extraction pipeline: 95.8% accuracy across more than 15 document types.',
        'Created the web interface with Web3.js and MetaMask wallet sign-in.',
      ],
      stack: ['Ethereum', 'IPFS', 'Computer vision', 'Web3.js', 'MetaMask'],
      accent: 'violet',
    },
    {
      id: 'maidan',
      title: 'Indian Maidan, a sports turf booking app',
      meta: ['2025', 'Ongoing'],
      badge: { text: 'UI complete, backend in progress', tone: 'status' },
      summary: 'A cross-platform app for iOS and Android that helps players find a turf nearby and book a slot.',
      points: [
        'Designed and built search, location filters, calendar booking, profiles and facility discovery.',
        'Next up: Firebase backend, payments, Google Maps and live slot availability.',
      ],
      stack: ['Flutter', 'Dart', 'Firebase', 'UI/UX'],
      accent: 'teal',
    },
  ] satisfies Project[],

  journey: [
    {
      board: { name: 'SPSU', note: '2022 – 2026' },
      when: '2022 – 2026 · Udaipur',
      title: 'B.Tech in Computer Science, Sir Padampat Singhania University',
      text: 'Specialised in full-stack development and graduated with a CGPA of 8.633. Along the way I built two blockchain projects, won 2nd place at Techkriti 2025 and captained the basketball team.',
      stack: ['React', 'Node.js', 'Solidity', 'Flutter'],
    },
    {
      board: { name: 'Zordial', note: 'Platform 1 · May 2025' },
      when: 'May 2025 – Jul 2025 · Jaipur',
      title: 'Salesforce Developer Intern, Zordial Technologies',
      points: [
        'Built an event networking and matchmaking platform with Apex triggers and Salesforce Flow, lifting simulated engagement by 40%.',
        'Built a Lightning Web Components frontend supporting more than 100 concurrent sessions.',
        'Completed the Salesforce Admin, Apex and Flow paths on Trailhead.',
      ],
      stack: ['Apex', 'Salesforce Flow', 'Lightning Web Components'],
      accent: 'sun',
    },
    {
      board: { name: 'Zordial', note: 'Platform 2 · Mar 2026' },
      when: 'Mar 2026 – Present · Jaipur',
      title: 'Associate Salesforce Consultant, DevRev Implementation',
      points: [
        'Build DevRev Snap-ins in TypeScript and workflow automations that connect client systems through APIs.',
        'Own each automation end to end, from testing to deploying it into live client workflows for ticket triage, routing and escalation.',
        'Write Python scripts that automate recurring operations work for business clients.',
        'Gather requirements directly from client stakeholders and turn them into working systems.',
      ],
      stack: ['TypeScript', 'DevRev Snap-ins', 'Workflow automation', 'Python', 'DevRev Certified'],
      accent: 'green',
    },
    {
      board: { name: 'Your team', note: 'Arriving soon', upcoming: true },
      when: 'Next stop',
      title: 'Your team?',
      text: 'Looking for full-stack, backend and automation engineering roles. Hand me a new stack and a weekend, and I will be shipping with it by Monday.',
      cta: { label: 'Get in touch', href: '#contact' },
    },
  ] satisfies Station[],

  skills: [
    { label: 'Languages', color: 'blue', items: ['Python', 'Java', 'TypeScript', 'JavaScript', 'C++', 'SQL', 'Dart', 'Solidity', 'Apex'] },
    { label: 'Frontend and mobile', color: 'coral', items: ['React', 'Lightning Web Components', 'Flutter', 'HTML5 / CSS3', 'Material UI'] },
    { label: 'Backend and APIs', color: 'green', items: ['Node.js', 'Express', 'REST APIs', 'Microservices', 'Spring Boot'] },
    { label: 'Data and cloud', color: 'violet', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Firebase', 'Salesforce CRM', 'Docker'] },
    { label: 'Automation', color: 'orange', items: ['Workflow automation', 'DevRev Snap-ins', 'Python automation', 'Salesforce Flow', 'Cursor'] },
    { label: 'Core CS', color: 'teal', items: ['Data structures', 'Algorithms', 'Object-oriented design', 'DBMS', 'Operating systems', 'PBFT consensus'] },
    { label: 'Tools', color: 'pink', items: ['Git', 'Postman', 'Selenium', 'Remix IDE', 'MetaMask'] },
    { label: 'Currently learning', color: 'sun', items: ['Anthropic certification', 'n8n', 'Clay'] },
  ] satisfies SkillGroup[],

  education: [
    { title: 'B.Tech, Computer Science and Engineering', detail: 'Full Stack specialisation · Sir Padampat Singhania University', score: '8.633', years: '2022 – 2026' },
    { title: 'Class XII, CBSE', detail: 'PCM and Computer Science · LK Singhania Public School', score: '89%', years: '2022' },
    { title: 'Class X, ICSE', detail: 'North Point School', score: '96.2%', years: '2020' },
  ],

  beyond: [
    { title: 'Captain, college basketball team', detail: 'Led the team to regional championships' },
    { title: 'Dean’s List', detail: 'Consistently in the top 10% of the Computer Science programme' },
    { title: 'DevRev Certified', detail: 'Learned the platform and its Snap-in SDK on the job' },
  ],

  contact: {
    note: 'Let’s build something',
    heading: 'Open to full-stack, backend and automation engineering roles.',
    email: 'khushi85449@gmail.com',
    location: 'Based in Jaipur, India',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/khushi-modi-1846b8309' },
      { label: 'GitHub', href: 'https://github.com/khushi107' },
    ],
  },
};
