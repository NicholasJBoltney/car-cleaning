'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#07070A', borderTop: '1px solid rgba(230,179,30,0.1)' }} className="py-8 mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif' }}>
              Bespoke Preservation
            </h3>
            <p className="text-sm" style={{ color: '#D4D6DB' }}>
              Premium vehicle preservation services using advanced polymer technology. Silent, eco-friendly, estate-approved.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif' }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#services"
                  className="text-sm transition-colors footer-link"
                  style={{ color: '#D4D6DB' }}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/book"
                  className="text-sm transition-colors footer-link"
                  style={{ color: '#D4D6DB' }}
                >
                  Book Service
                </Link>
              </li>
              <li>
                <Link
                  href="/portal"
                  className="text-sm transition-colors footer-link"
                  style={{ color: '#D4D6DB' }}
                >
                  Client Portal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif' }}>
              Contact
            </h3>
            <p className="text-sm" style={{ color: '#D4D6DB' }}>
              Email: info@bespokepreservation.co.za<br />
              Phone: +27 123 456 789
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid rgba(230,179,30,0.1)' }}>
          <p className="text-sm" style={{ color: '#6B6E75' }}>
            © {new Date().getFullYear()} Bespoke Car Preservation. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        .footer-link:hover {
          color: #E6B31E !important;
        }
      `}</style>
    </footer>
  );
};
