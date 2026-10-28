import { IntroProvider } from '@/components/intro/IntroProvider';
import { IntroCurtain } from '@/components/intro/IntroCurtain';
import { FluidBackground } from '@/components/fluid/FluidBackground';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Projects } from '@/components/sections/Projects';
import { Journey } from '@/components/sections/Journey';
import { Skills } from '@/components/sections/Skills';
import { Education } from '@/components/sections/Education';
import { Contact } from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <IntroProvider>
      <FluidBackground />
      <IntroCurtain />
      <div className="page">
        <Header />
        <main>
          <div className="wrap">
            <Hero />
          </div>
          <Projects />
          <Journey />
          <div className="wrap">
            <Skills />
            <Education />
            <Contact />
          </div>
        </main>
        <Footer />
      </div>
    </IntroProvider>
  );
}
