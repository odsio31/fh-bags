import { Link } from 'react-router-dom'
import './Footer.css'
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-brand">
  <Link to="/" className="footer-logo">
    <span>F&amp;H</span> BAGS
  </Link>
  <p>Sacs en cuir premium faits a la main. Des designs intemporels pour la femme moderne.</p>
      <div className="footer-social">
        <a 
          href="https://facebook.com/sido.bhl" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-link"
          aria-label="Facebook"
        >
          <FaFacebookF />
        </a>
        <a 
          href="https://instagram.com/sido.bhl" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-link"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
        <a 
          href="https://tiktok.com/@sido.bhl" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-link"
          aria-label="TikTok"
        >
          <FaTiktok />
        </a>
      </div>
    </div>

        <div className="footer-col">
          <h4>Boutique</h4>
          <ul>
            <li><Link to="/shop">Toute la Collection</Link></li>
            <li><Link to="/shop?category=tote-bags">Sacs Tote</Link></li>
            <li><Link to="/shop?category=clutch-bags">Pochettes</Link></li>
            <li><Link to="/shop?category=crossbody-bags">Sacs Bandouliere</Link></li>
            <li><Link to="/shop?category=backpacks">Sacs a Dos</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Aide</h4>
          <ul>
            <li><Link to="/about">A Propos</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><a href="#">Livraison & Retours</a></li>
            <li><a href="#">Guide des Tailles</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Livraison</h4>
          <div className="footer-livraison">
            <div className="footer-liv-item">
              <span>🏠 A domicile</span>
              
            </div>
            <div className="footer-liv-item">
              <span>📦 Bureau Yallidine</span>
              
            </div>
            <p className="footer-liv-note">
              Livraison partout en Algerie. Confirmation par WhatsApp apres commande.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} F&amp;H Bags. Tous droits reserves.</p>
          <div className="footer-bottom-links">
            <a href="#">Confidentialite</a>
            <a href="#">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
