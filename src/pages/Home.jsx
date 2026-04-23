import HeroSection from '../components/HeroSection';
import TrustBadges from '../components/TrustBadges';
import FeaturedProducts from '../components/FeaturedProducts';
import CategoryBanner from '../components/CategoryBanner';
import ValueProps from '../components/ValueProps';
import CtaBanner from '../components/CtaBanner';
import LeadMagnetQuiz from '../components/LeadMagnetQuiz';
import SocialProof from '../components/SocialProof';
import StickyWhatsApp from '../components/StickyWhatsApp';
import ExitIntentBanner from '../components/ExitIntentBanner';
import ContactForm from '../components/ContactForm';
import InstallationsMap from '../components/InstallationsMap';
import FaqSection from '../components/FaqSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustBadges />
      <FeaturedProducts />
      <CategoryBanner />
      <SocialProof />
      <InstallationsMap />
      <LeadMagnetQuiz />
      <ValueProps />
      <FaqSection />
      <ContactForm />
      <CtaBanner />
      <StickyWhatsApp />
      <ExitIntentBanner />
    </div>
  );
}