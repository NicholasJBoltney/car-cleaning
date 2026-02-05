'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shared';
import { User, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigationLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/#about' },
    { label: 'Services', href: '/#services' },
    { label: 'Contact', href: '/#contact' },
    { label: 'Portal', href: '/portal' },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: 'rgba(7, 7, 10, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 relative">
            {/* Left Side - Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-1">
              {navigationLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link relative text-sm font-medium tracking-wide uppercase"
                  style={{
                    color: '#D4D6DB',
                    letterSpacing: '0.08em',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button - Left */}
            <div className="lg:hidden">
              <button
                className="transition-all duration-300 hover:scale-110 active:scale-95"
                style={{ color: '#F0F0F3' }}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center - Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
              <Link href="/" className="flex items-center group">
                <span
                  className="text-2xl lg:text-3xl font-bold tracking-widest logo-text"
                  style={{
                    color: '#F0F0F3',
                    letterSpacing: '0.15em',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  CURA
                </span>
              </Link>
            </div>

            {/* Right Side - Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
              {navigationLinks.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link relative text-sm font-medium tracking-wide uppercase"
                  style={{
                    color: '#D4D6DB',
                    letterSpacing: '0.08em',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/book">
                <button
                  className="btn-primary font-semibold text-sm tracking-wide uppercase shadow-lg transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                    color: '#0A0A0F',
                    padding: '0.625rem 1.5rem',
                    borderRadius: '10px',
                    letterSpacing: '0.08em',
                    fontFamily: 'Montserrat, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(230,179,30,0.3)',
                  }}
                >
                  Book Now
                </button>
              </Link>
            </div>

            {/* Right Side - User Icon (Mobile) */}
            <div className="lg:hidden">
              <Link href="/auth/login">
                <button
                  className="transition-all duration-300 p-2 rounded-full hover:bg-white/5"
                  style={{ color: '#F0F0F3' }}
                  aria-label="Account"
                >
                  <User size={24} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'rgba(7, 7, 10, 0.98)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-6 p-3 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95"
          style={{
            color: '#F0F0F3',
            background: 'rgba(230, 179, 30, 0.15)',
            borderRadius: '50%',
            border: '1px solid rgba(230, 179, 30, 0.3)',
          }}
          aria-label="Close menu"
        >
          <X size={28} strokeWidth={2.5} />
        </button>

        {/* Mobile Menu Content */}
        <div className="flex flex-col items-center justify-center h-full px-8">
          {/* Logo in Menu */}
          <div className="mb-16">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block"
            >
              <span
                className="text-5xl font-bold tracking-widest"
                style={{
                  color: '#F0F0F3',
                  letterSpacing: '0.2em',
                  fontFamily: 'Montserrat, sans-serif',
                  textShadow: '0 0 40px rgba(230, 179, 30, 0.3)',
                }}
              >
                CURA
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col items-center gap-5 mb-12 w-full max-w-sm">
            {navigationLinks.map((link, idx) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-nav-link w-full text-center py-4 px-8 rounded-xl transition-all duration-300"
                style={{
                  color: '#D4D6DB',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, sans-serif',
                  background: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <Link href="/book" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className="w-full py-5 rounded-xl font-bold text-base tracking-wide uppercase shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                  color: '#0A0A0F',
                  letterSpacing: '0.1em',
                  fontFamily: 'Montserrat, sans-serif',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(230, 179, 30, 0.4)',
                }}
              >
                Book Service
              </button>
            </Link>

            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <button
                className="w-full py-5 rounded-xl font-semibold text-base tracking-wide uppercase transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(230, 179, 30, 0.1)',
                  color: '#E6B31E',
                  border: '1px solid rgba(230, 179, 30, 0.3)',
                  letterSpacing: '0.1em',
                  fontFamily: 'Montserrat, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Login / Sign Up
              </button>
            </Link>
          </div>

          {/* Decorative Element */}
          <div className="mt-16 opacity-30">
            <div
              className="w-16 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, #E6B31E, transparent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .nav-link {
          position: relative;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, #E6B31E, #d4a017);
          transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .nav-link:hover {
          color: #E6B31E !important;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .logo-text {
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          text-shadow: 0 0 20px rgba(230, 179, 30, 0.2);
        }

        .logo-text:hover {
          color: #E6B31E !important;
          text-shadow: 0 0 30px rgba(230, 179, 30, 0.5);
          transform: scale(1.05);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(230, 179, 30, 0.4) !important;
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .mobile-nav-link {
          animation: slideInFromRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: ${isMobileMenuOpen ? '1' : '0'};
          transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(50px)'};
        }

        .mobile-nav-link:active {
          transform: scale(0.97);
          background: rgba(230, 179, 30, 0.1) !important;
        }

        @media (hover: hover) {
          .mobile-nav-link:hover {
            background: rgba(230, 179, 30, 0.08) !important;
            border-color: rgba(230, 179, 30, 0.3) !important;
            color: #E6B31E !important;
            transform: translateX(8px);
            box-shadow: 0 4px 16px rgba(230, 179, 30, 0.15);
          }
        }

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};
