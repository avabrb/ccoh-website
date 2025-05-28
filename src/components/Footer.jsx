import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Footer.css'
import FacebookIcon from './facebook.svg';
import LinkedInIcon from './linkedIn.svg';
import TwitterIcon from './twitter.svg';

const Highlight = ({ children }) => {
    return <span className="highlight">{children}</span>;
  }; 

export default function Footer() {
    return (
      <footer id="Footer" className="footer">
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
                </div>
                <div className='other'>
                    <a href="/legal-terms" className="footer-link2">Legal Terms</a>

                    <div className="footer-social">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <img src={FacebookIcon} alt="Icon" width="38" height="39" />
                        </a>
                        <a href="https://linkedin.com" aria-label="LinkedIn" className="social-icon" target="_blank" rel="noopener noreferrer">
                            <img src={LinkedInIcon} alt="Icon" width="38" height="39" />
                        </a>
                        <a href="https://twitter.com" aria-label="Twitter" className="social-icon" target="_blank" rel="noopener noreferrer">
                            <img src={TwitterIcon} alt="Icon" width="38" height="39" />
                        </a>
                    </div>
                </div>

                {/* Credits */}
                <div className="footer-credits">
                    <p>Designed and developed by Ava Baraban and Nomin Rentsendorj.</p>
                </div>
            </div>
        </div>


      </footer>
    );
  }