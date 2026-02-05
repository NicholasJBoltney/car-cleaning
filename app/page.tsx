'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { VolumeX, Droplet, Car, Sparkles, Calendar, Check } from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative" style={{ background: '#07070A' }}>
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center py-32 w-full overflow-hidden" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/range-rover-hero.jpg"
            alt="Luxury Range Rover Professional Detailing"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85"></div>
        </div>

        <div className="max-w-7xl w-full text-center mx-auto relative z-10">
          {/* Main Headline */}
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 6vw, 4.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            color: '#F0F0F3',
            marginBottom: '1.5rem',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            Premium Rinsless Detailing<br />
            for <span style={{ color: '#E6B31E' }}>Luxury Vehicles</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
            fontWeight: 400,
            color: '#D4D6DB',
            marginBottom: '2rem',
            maxWidth: '48rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Whisper-Quiet | Waterless | HOA-Compliant | Saturday Service
          </p>

          {/* Primary CTA */}
          <div className="mb-8">
            <Link href="/book">
              <button style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                color: '#0A0A0F',
                padding: '1rem 3rem',
                fontSize: '1rem',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.02em',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(230,179,30,0.3)',
                transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,179,30,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,179,30,0.3)';
              }}>
                Book Your Saturday Slot
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="py-24 md:py-32 w-full" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="max-w-5xl text-center mx-auto">
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
            letterSpacing: '-0.02em',
            color: '#F0F0F3',
            marginBottom: '3rem',
          }}>
            Your Luxury Vehicle<br className="hidden md:block" /> Deserves Better
          </h2>

          <div style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            maxWidth: '56rem',
            margin: '0 auto',
          }}>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.8,
              color: '#D4D6DB',
              marginBottom: '1.5rem',
            }}>
              Your vehicle is more than transportation - it's a reflection of your success.
            </p>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              lineHeight: 1.8,
              color: '#D4D6DB',
              marginBottom: '1.5rem',
            }}>
              But maintaining that showroom shine is challenging. Drive-through car washes risk scratching your premium finish. Traditional mobile detailers arrive with noisy pressure washers that violate HOA rules. And finding time to visit a detail shop? Nearly impossible.
            </p>
            <div style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(230,179,30,0.2)',
            }}>
              <p style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                fontWeight: 600,
                color: '#E6B31E',
                lineHeight: 1.6,
              }}>
                You need a solution that's effective, discreet, and respects both your vehicle and your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE SOLUTION */}
      <section className="py-24 md:py-32 w-full" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
              letterSpacing: '-0.02em',
              color: '#F0F0F3',
              marginBottom: '1rem',
            }}>
              Introducing Waterless<br className="md:hidden" /> Luxury Detailing
            </h2>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              fontWeight: 300,
              color: '#6B6E75',
            }}>
              The modern approach to premium car care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[
              { icon: VolumeX, title: 'Whisper-Quiet Operation', desc: 'No pressure washers or loud equipment. We respect your community\'s peace and your HOA guidelines.' },
              { icon: Droplet, title: 'Completely Waterless', desc: 'Our advanced rinsless formula uses zero water runoff. Eco-friendly and HOA-compliant.' },
              { icon: Car, title: 'Exterior Perfection', desc: 'We specialize exclusively in exterior detailing, delivering a swirl-free, showroom finish every time.' },
              { icon: Sparkles, title: 'Premium Products Only', desc: 'Safe for ceramic coatings, PPF, and all luxury paint finishes. The same products used by high-end dealerships.' },
            ].map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  padding: '2.5rem',
                  transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,179,30,0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(230,179,30,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: '1.5rem', color: '#E6B31E', display: 'flex', justifyContent: 'center' }}>
                  <IconComponent size={48} strokeWidth={1.5} />
                </div>
                <h3 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                  color: '#E6B31E',
                  marginBottom: '1rem',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#D4D6DB',
                }}>
                  {feature.desc}
                </p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="py-24 md:py-32 w-full" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
              letterSpacing: '-0.02em',
              color: '#F0F0F3',
            }}>
              Simple, Convenient, Professional
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
            {[
              { num: '1', icon: Calendar, title: 'Book Online', desc: 'Select your preferred Saturday slot through our simple booking system. Choose your time, and you\'re set.' },
              { num: '2', icon: Car, title: 'We Come to You', desc: 'Our certified technician arrives at your home at the scheduled time. No need to disrupt your day.' },
              { num: '3', icon: Sparkles, title: 'Relax & Enjoy', desc: 'We handle everything quietly and efficiently. Service takes 60-90 minutes. You don\'t even need to be home.' },
            ].map((step) => {
              const StepIcon = step.icon;
              return (
              <div key={step.num} className="text-center">
                <div style={{
                  width: '6rem',
                  height: '6rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                  boxShadow: '0 8px 24px rgba(230,179,30,0.25)',
                  margin: '0 auto 2rem auto',
                }}>
                  <span style={{
                    fontSize: '2.25rem',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    color: '#0A0A0F',
                  }}>{step.num}</span>
                </div>
                <div style={{ marginBottom: '1rem', color: '#E6B31E', display: 'flex', justifyContent: 'center' }}>
                  <StepIcon size={48} strokeWidth={1.5} />
                </div>
                <h3 style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
                  color: '#E6B31E',
                  marginBottom: '1rem',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#D4D6DB',
                }}>
                  {step.desc}
                </p>
              </div>
              );
            })}
          </div>

          {/* Reassurances */}
          <div style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '2.5rem',
          }}>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {[
                'Fully insured and licensed',
                'Text notification 30 minutes before arrival',
                'Satisfaction guaranteed or we return',
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#E6B31E',
                    flexShrink: 0,
                  }}>
                    <Check size={20} strokeWidth={3} style={{ color: '#0A0A0F' }} />
                  </div>
                  <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#D4D6DB',
                  }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SOCIAL PROOF */}
      {/* <section className="py-24 md:py-32 px-6 md:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
            letterSpacing: '-0.02em',
            color: '#F0F0F3',
            textAlign: 'center',
            marginBottom: '5rem',
          }}>
            Trusted by Discerning<br className="md:hidden" /> Vehicle Owners
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { quote: 'Finally, a detailer who understands HOA restrictions. My Model S looks showroom-ready, and my neighbors didn\'t hear a thing.', name: 'Michael R.', location: 'Luxury Community' },
              { quote: 'I\'ve tried every mobile detailer in the area. This is the only one I trust with my BMW M5. The waterless method is incredible.', name: 'Jennifer K.', location: 'Estate Owner' },
              { quote: 'Professional, punctual, and the results speak for themselves. My Mercedes has never looked better.', name: 'David L.', location: 'HOA Community' },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  padding: '2.5rem',
                  transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(230,179,30,0.3)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  marginBottom: '1.5rem',
                  color: '#E6B31E',
                }}>⭐⭐⭐⭐⭐</div>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: '#D4D6DB',
                  fontStyle: 'italic',
                  marginBottom: '1.5rem',
                }}>
                  "{testimonial.quote}"
                </p>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  color: '#E6B31E',
                  marginBottom: '0.25rem',
                }}>
                  — {testimonial.name}
                </p>
                <p style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.875rem',
                  color: '#6B6E75',
                }}>
                  {testimonial.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* SECTION 8: LIMITED AVAILABILITY */}
      <section className="py-24 md:py-32 w-full" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="max-w-5xl text-center mx-auto">
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
            letterSpacing: '-0.02em',
            color: '#F0F0F3',
            marginBottom: '2.5rem',
          }}>
            Exclusive Saturday Service
          </h2>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
            lineHeight: 1.7,
            color: '#D4D6DB',
            marginBottom: '2rem',
            maxWidth: '48rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            To maintain our premium service standards, we limit availability to just <span style={{ fontWeight: 700, color: '#E6B31E' }}>4 appointments</span> each Saturday.
          </p>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            lineHeight: 1.7,
            color: '#D4D6DB',
            marginBottom: '4rem',
            maxWidth: '48rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            This ensures every vehicle receives the attention to detail it deserves—and that we can serve you during the most convenient time of your week.
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(230,179,30,0.3)',
            borderRadius: '18px',
            padding: '2.5rem 3rem',
            marginBottom: '3rem',
            display: 'inline-block',
            maxWidth: '32rem',
          }}>
            <div style={{ marginBottom: '1rem', color: '#E6B31E', display: 'flex', justifyContent: 'center' }}>
              <Calendar size={48} strokeWidth={1.5} />
            </div>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
              color: '#E6B31E',
              marginBottom: '0.75rem',
            }}>
              Book 2-3 weeks in advance
            </p>
            <p style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '1rem',
              color: '#D4D6DB',
            }}>Limited slots fill quickly</p>
          </div>

          <div>
            <Link href="/book">
              <button style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                color: '#0A0A0F',
                padding: '1.25rem 3.5rem',
                fontSize: '1.125rem',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.02em',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(230,179,30,0.3)',
                transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,179,30,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,179,30,0.3)';
              }}>
                Check Availability
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section className="py-24 md:py-32 w-full" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div className="max-w-4xl mx-auto">
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.75rem, 5vw, 3.5rem)',
            letterSpacing: '-0.02em',
            color: '#F0F0F3',
            textAlign: 'center',
            marginBottom: '5rem',
          }}>
            Common Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                q: "Will this work with my HOA's rules?",
                a: "Yes. Our waterless rinsless method produces zero runoff and uses no loud equipment. We've never had an HOA complaint in our years of service."
              },
              {
                q: "Is this safe for my ceramic coating / PPF?",
                a: "Absolutely. Our products are pH-neutral and specifically formulated for luxury finishes, including ceramic coatings and paint protection film."
              },
              {
                q: "Do you offer interior detailing?",
                a: "We specialize exclusively in exterior detailing to maintain our quiet operations and deliver exceptional results in our area of expertise."
              },
              {
                q: "What if it rains on my scheduled day?",
                a: "We'll reschedule at no charge. We monitor weather forecasts and will proactively reach out if conditions aren't ideal."
              },
              {
                q: "How long does the service take?",
                a: "Most vehicles take 60-90 minutes depending on size and condition. You don't need to be present during service."
              },
              {
                q: "What's included in the service?",
                a: "Full exterior hand wash, wheel and tire cleaning, window cleaning, and tire dressing. See our Services page for add-on options."
              },
              {
                q: "Do you service all car brands?",
                a: "We focus on luxury and premium vehicles (Tesla, Mercedes, BMW, Audi, Lexus, Porsche, etc.). Contact us if you're unsure about your vehicle."
              },
              {
                q: "What's your cancellation policy?",
                a: "We require 48 hours notice for cancellations or rescheduling. See our booking page for full terms."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(230,179,30,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '1.5rem 2rem',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#E6B31E',
                    paddingRight: '1.5rem',
                  }}>{faq.q}</span>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#E6B31E',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      color: '#0A0A0F',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                    }}>
                      {openFaq === idx ? '−' : '+'}
                    </span>
                  </div>
                </button>
                {openFaq === idx && (
                  <div style={{
                    padding: '1.5rem 2rem',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <p style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      color: '#D4D6DB',
                    }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section className="py-32 md:py-40 relative overflow-hidden w-full" style={{
        background: 'linear-gradient(135deg, rgba(230,179,30,0.15) 0%, rgba(230,179,30,0.05) 100%)',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      }}>
        <div className="max-w-5xl text-center relative z-10 mx-auto">
          <h2 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#F0F0F3',
            marginBottom: '2rem',
          }}>
            Ready for a<br className="md:hidden" /> Showroom Shine?
          </h2>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
            lineHeight: 1.7,
            color: '#D4D6DB',
            marginBottom: '3.5rem',
            maxWidth: '48rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Join hundreds of satisfied luxury vehicle owners who trust us with their investment.
          </p>

          <Link href="/book" className="inline-block mb-12">
            <button style={{
              background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
              color: '#0A0A0F',
              padding: '1.75rem 5rem',
              fontSize: '1.5rem',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.02em',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(230,179,30,0.4)',
              transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(230,179,30,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(230,179,30,0.4)';
            }}>
              Book Your Saturday Slot
            </button>
          </Link>

          <div style={{
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '2.5rem',
            maxWidth: '48rem',
            marginBottom: '2.5rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {[
                'Secure online booking',
                'Satisfaction guaranteed',
                'Fully insured & licensed',
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#E6B31E',
                    flexShrink: 0,
                  }}>
                    <Check size={20} strokeWidth={3} style={{ color: '#0A0A0F' }} />
                  </div>
                  <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#D4D6DB',
                  }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1rem',
            color: '#D4D6DB',
          }}>
            Have questions? <Link href="/contact" style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: '#E6B31E',
              textDecoration: 'underline',
              textDecorationThickness: '2px',
              textUnderlineOffset: '4px',
            }}>Send us a message</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
