import React, { useEffect } from 'react';
import { ChevronRight, CheckCircle2, AlertCircle, ArrowRight, Clock, HelpCircle, Shield, CheckCircle, Search, Target } from 'lucide-react';
import { servicesContent, ServiceContent } from '../../data/servicesContent';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import './ServiceDetailPage.css';

interface ServiceDetailPageProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigateService: (slug: string) => void;
  onAdminLogin?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ slug, onNavigateHome, onNavigateService, onAdminLogin, onNavigateSection }) => {
  const service: ServiceContent | undefined = servicesContent[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (service) {
      document.title = service.metaTitle;
      // In a real app we'd also set the meta description here
    }
  }, [slug, service]);

  if (!service) {
    return (
      <div className="service-not-found">
        <h2>Service not found</h2>
        <button className="btn-primary" onClick={onNavigateHome}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <PublicNavbar onAdminLogin={onAdminLogin} transparent={true} onNavigateSection={onNavigateSection} />

      {/* 1. HERO SECTION */}
      <section className="sd-hero">
        <div className="sd-hero-container">
          <div className="sd-hero-content">
            <div className="sd-breadcrumb">
              <span onClick={onNavigateHome}>Home</span>
              <ChevronRight size={14} />
              <span onClick={onNavigateHome}>Services</span>
              <ChevronRight size={14} />
              <span className="sd-breadcrumb-active">{service.title}</span>
            </div>
            <h1 className="sd-hero-title">{service.title}</h1>
            <p className="sd-hero-proposition">{service.shortProposition}</p>
            <p className="sd-hero-explanation">{service.explanation}</p>
            
            <div className="sd-hero-ctas">
              <button className="btn-primary">{service.primaryCTA}</button>
              {service.secondaryCTA && (
                <button className="btn-secondary">{service.secondaryCTA}</button>
              )}
            </div>
          </div>
          <div className="sd-hero-image-wrapper">
            <img src={service.heroImage} alt={service.title} className="sd-hero-image" />
          </div>
        </div>
      </section>

      {/* 2. THE FARMER PROBLEM */}
      <section className="sd-section sd-problem-section bg-gray-50">
        <div className="sd-container">
          <h2 className="sd-section-title text-center">{service.problemHeading}</h2>
          <div className="sd-problem-grid">
            {service.problems.map((problem, i) => (
              <div key={i} className="sd-problem-card">
                <AlertCircle className="sd-problem-icon" size={24} />
                <p>{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHAT IS THIS SERVICE */}
      <section className="sd-section">
        <div className="sd-container">
          <h2 className="sd-section-title">What is this service?</h2>
          <div className="sd-what-grid">
            <div className="sd-what-card">
              <h3 className="sd-what-label">What it is</h3>
              <p>{service.whatItIs}</p>
            </div>
            <div className="sd-what-card">
              <h3 className="sd-what-label">What it does</h3>
              <p>{service.whatItDoes}</p>
            </div>
            <div className="sd-what-card">
              <h3 className="sd-what-label">What is required</h3>
              <p>{service.whatIsRequired}</p>
            </div>
            <div className="sd-what-card">
              <h3 className="sd-what-label">What you get</h3>
              <p>{service.whatResult}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="sd-section bg-green-50">
        <div className="sd-container">
          <h2 className="sd-section-title text-center">How it works</h2>
          <div className="sd-timeline">
            {service.workflowSteps.map((step, i) => (
              <div key={i} className="sd-timeline-step">
                <div className="sd-timeline-number">0{i + 1}</div>
                <div className="sd-timeline-content">
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 & 6 & 7. OUTPUTS, AUDIENCE, TIMING */}
      <section className="sd-section">
        <div className="sd-container">
          <div className="sd-three-col-grid">
            
            <div className="sd-info-block">
              <h3 className="sd-info-title">What you get</h3>
              <ul className="sd-check-list">
                {service.outputs.map((out, i) => (
                  <li key={i}><CheckCircle2 size={18} className="text-green-600" /> {out}</li>
                ))}
              </ul>
            </div>

            <div className="sd-info-block">
              <h3 className="sd-info-title">Who is it for?</h3>
              <div className="sd-tags">
                {service.targetAudience.map((aud, i) => (
                  <span key={i} className="sd-tag">{aud}</span>
                ))}
              </div>
            </div>

            <div className="sd-info-block highlight-block">
              <h3 className="sd-info-title flex items-center gap-2">
                <Clock size={20} className="text-green-700" /> When to use it
              </h3>
              <p className="sd-timing-text">{service.timing}</p>
            </div>

          </div>
        </div>
      </section>

      {/* 8. BENEFITS */}
      <section className="sd-section bg-gray-50">
        <div className="sd-container">
          <h2 className="sd-section-title text-center">Why use this service?</h2>
          <div className="sd-benefits-grid">
            {service.benefits.map((benefit, i) => (
              <div key={i} className="sd-benefit-card">
                <CheckCircle size={24} className="sd-benefit-icon" />
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. REAL EXAMPLE */}
      <section className="sd-section">
        <div className="sd-container">
          <h2 className="sd-section-title">How a farmer uses it</h2>
          <div className="sd-example-card">
            <div className="sd-example-row">
              <div className="sd-example-step">
                <div className="sd-ex-label">The Problem</div>
                <p>{service.exampleProblem}</p>
              </div>
              <ArrowRight className="sd-ex-arrow" />
              <div className="sd-example-step">
                <div className="sd-ex-label">Action</div>
                <p>{service.exampleAction}</p>
              </div>
              <ArrowRight className="sd-ex-arrow" />
              <div className="sd-example-step">
                <div className="sd-ex-label">Kissan Mithar Assistance</div>
                <p>{service.exampleAssistance}</p>
              </div>
              <ArrowRight className="sd-ex-arrow" />
              <div className="sd-example-step sd-ex-success">
                <div className="sd-ex-label text-green-800">The Result</div>
                <p><strong>{service.exampleResult}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10, 11, 12. PROVIDER, REQUIREMENTS, TRUST */}
      <section className="sd-section bg-gray-50">
        <div className="sd-container">
          <div className="sd-three-col-grid">
            
            <div className="sd-info-block border-green">
              <h3 className="sd-info-title flex items-center gap-2">
                <Shield size={20} className="text-green-700" /> Who provides this?
              </h3>
              <p className="sd-provider-text">{service.provider}</p>
              
              <div className="sd-trust-list mt-4">
                {service.trustElements.map((trust, i) => (
                  <div key={i} className="sd-trust-item">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    <span>{trust}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sd-info-block col-span-2">
              <h3 className="sd-info-title">What you need to provide</h3>
              <ul className="sd-requirements-list">
                {service.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 13. FAQ */}
      <section className="sd-section">
        <div className="sd-container max-w-3xl mx-auto">
          <h2 className="sd-section-title text-center">Frequently Asked Questions</h2>
          <div className="sd-faq-list">
            {service.faqs.map((faq, i) => (
              <div key={i} className="sd-faq-item">
                <h4 className="sd-faq-q"><HelpCircle size={18} className="text-gray-400" /> {faq.q}</h4>
                <p className="sd-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. FINAL CTA */}
      <section className="sd-cta-section">
        <div className="sd-container text-center">
          <h2 className="sd-cta-title">Ready to get started?</h2>
          <button className="btn-primary btn-large">{service.primaryCTA}</button>
        </div>
      </section>

      {/* 15. RELATED SERVICES */}
      <section className="sd-section bg-gray-50">
        <div className="sd-container">
          <h2 className="sd-section-title">Related Services</h2>
          <div className="sd-related-grid">
            {service.relatedServices.map((relSlug, i) => {
              const rel = servicesContent[relSlug];
              if (!rel) return null;
              return (
                <div key={i} className="sd-related-card" onClick={() => onNavigateService(relSlug)}>
                  <div className="sd-related-img-wrap">
                    <img src={rel.heroImage} alt={rel.title} />
                  </div>
                  <div className="sd-related-content">
                    <h4>{rel.title}</h4>
                    <span className="sd-related-link">Explore <ArrowRight size={14} /></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
