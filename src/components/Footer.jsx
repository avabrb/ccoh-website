import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Footer.css'

const Highlight = ({ children }) => {
    return <span className="highlight">{children}</span>;
  }; 

export default function Footer() {
    return (
      <footer className="footer">
        <div className="footer-top">
            <div className="statement">
                <p>Join the Consular Corps of Houston and <Highlight> become a leader </Highlight>in <Highlight> Houston’s international community! </Highlight></p>
            </div>
            <a href="/login" className="footer-link1">Become a member today!</a>
        </div>
        <div className="footer-lower">
            <div className="footer-container">
                {/* Branding Section */}
                <div className="footer-branding">
                    <p>© 2025 Consular Corps of Houston</p>
                    <a href="/legal-terms" className="footer-link2">Legal Terms</a>
                </div>

                {/* Social Media Icons */}
                <div className="footer-social">
                    <a href="https://facebook.com" aria-label="Facebook" className="social-icon" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-facebook"></i>
                    </a>
                    <a href="https://linkedin.com" aria-label="LinkedIn" className="social-icon" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="https://twitter.com" aria-label="Twitter" className="social-icon" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-twitter"></i>
                    </a>
                </div>

                {/* Credits */}
                <div className="footer-credits">
                    <p>Designed and developed by Ava Baraban, Nomin Rentsendorj, and Luisa Martinez.</p>
                </div>
            </div>
        </div>


      </footer>
    );
  }