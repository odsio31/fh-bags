import './About.css'
import { Link } from 'react-router-dom'

export function About() {
  return (
    <main className="about-page page-enter" style={{ paddingTop: 'var(--nav-h)' }}>
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-img">
          <img src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1400&q=85" alt="Craftsmanship" />
          <div className="about-hero-overlay">
            <div className="container">
              <span className="eyebrow-tag">Est. 2018</span>
              <h1>Our Story</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container">
          <div className="story-grid">
            <div className="story-text">
              <span className="eyebrow">The F&amp;H Philosophy</span>
              <h2>Where Craft Meets Elegance</h2>
              <div className="divider" style={{ margin: '1.2rem 0' }} />
              <p>F&H Bags was founded in 2018 with a simple belief: every woman deserves a bag that feels as beautiful as it looks. We began as a small atelier, hand-selecting the finest leathers from Italian tanneries and collaborating with artisan craftspeople to bring our designs to life.</p>
              <p style={{ marginTop: '1rem' }}>Today, our collection spans totes, clutches, crossbody bags, and backpacks — each one a balance of timeless style and modern functionality. We believe in slow fashion: fewer, better pieces that last a lifetime.</p>
            </div>
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=85" alt="F&H bag" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">What We Stand For</span>
            <h2>Our Values</h2>
            <div className="divider" />
          </div>
          <div className="values-grid">
            {[
              { icon: '🌿', title: 'Sustainability', text: 'We source ethically-tanned leathers and use eco-conscious packaging. Less waste, more beauty.' },
              { icon: '🤝', title: 'Craftsmanship', text: 'Every bag is crafted by skilled artisans with decades of experience. No shortcuts, ever.' },
              { icon: '✨', title: 'Timelessness', text: "We design pieces that transcend trends — bags you'll carry with pride for years to come." },
              { icon: '💛', title: 'Community', text: 'Our customers are our inspiration. We listen, iterate, and grow together.' },
            ].map(v => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Ready to Find Your Perfect Bag?</h2>
          <p>Explore our curated collection — each piece waiting to become part of your story.</p>
          <Link to="/shop" className="btn btn-gold" style={{ marginTop: '1.5rem' }}>Shop Now</Link>
        </div>
      </section>
    </main>
  )
}

export function Contact() {
  return (
    <main className="contact-page page-enter" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <span className="eyebrow">Get in Touch</span>
            <h1>We'd Love to<br />Hear from You</h1>
            <div className="divider" style={{ margin: '1.2rem 0' }} />
            <p>Have a question about a product, your order, or just want to say hello? Our team is here for you.</p>
            <div className="contact-details">
              {[
                { label: 'Email',    value: 'hello@fhbags.com', icon: '✉️' },
                { label: 'Phone',   value: '+1 (555) 234-5678', icon: '📞' },
                { label: 'Hours',   value: 'Mon–Fri, 9am–6pm', icon: '🕐' },
                { label: 'Address', value: '24 Leather Lane, Paris 75001', icon: '📍' },
              ].map(d => (
                <div key={d.label} className="contact-detail-item">
                  <span className="detail-icon">{d.icon}</span>
                  <div>
                    <span className="detail-label">{d.label}</span>
                    <p className="detail-value">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="contact-form" onSubmit={e => { e.preventDefault(); alert('Message sent! We will reply within 24 hours.') }}>
            <h3>Send a Message</h3>
            <div className="form-row-2">
              <div className="form-group"><label>First Name</label><input required /></div>
              <div className="form-group"><label>Last Name</label><input required /></div>
            </div>
            <div className="form-group"><label>Email *</label><input type="email" required /></div>
            <div className="form-group"><label>Subject</label><input /></div>
            <div className="form-group">
              <label>Message *</label>
              <textarea rows={5} required style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
