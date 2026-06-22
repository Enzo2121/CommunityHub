import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './HomePage.css';

const features = [
  { icon: '🎉', title: 'Événements', desc: 'Participez à des événements exclusifs organisés par la communauté, en présentiel ou à distance.' },
  { icon: '🎯', title: 'Compétences', desc: 'Proposez vos expertises et trouvez des professionnels qualifiés dans votre domaine.' },
  { icon: '🤝', title: 'Réseau', desc: 'Développez votre réseau, ajoutez des contacts et échangez en privé avec les membres.' },
  { icon: '⭐', title: 'Premium', desc: "Débloquez toutes les fonctionnalités pour 19,99 € : événements, contacts, messages privés." },
];

export default function HomePage() {
  const { token } = useSelector((s) => s.auth);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="container hero-content animate-fade-up">
          <div className="hero-badge">
            <span>✨</span> La plateforme communautaire premium
          </div>
          <h1>
            Connectez-vous,<br />
            <span className="text-gradient">Collaborez, Grandissez.</span>
          </h1>
          <p className="hero-desc">
            CommunityHub réunit des professionnels passionnés. Créez des événements,
            partagez vos compétences et construisez un réseau solide.
          </p>
          <div className="hero-cta">
            {token ? (
              <>
                <Link to="/events" className="btn btn-primary btn-lg">Explorer les événements</Link>
                <Link to="/dashboard" className="btn btn-outline btn-lg">Mon dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Rejoindre gratuitement</Link>
                <Link to="/events" className="btn btn-outline btn-lg">Voir les événements</Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>500+</strong><span>Membres</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>120+</strong><span>Événements</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>80+</strong><span>Compétences</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <p className="section-subtitle text-center">Tout ce dont vous avez besoin</p>
          <h2 className="section-title text-center">Une plateforme complète</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card card animate-fade-up" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p className="text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!token && (
        <section className="cta-section">
          <div className="container cta-inner">
            <div className="cta-glow" />
            <div className="cta-text">
              <h2>Prêt à rejoindre la communauté ?</h2>
              <p className="text-muted">Inscription gratuite · Accès immédiat · Premium disponible</p>
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">Commencer maintenant →</Link>
          </div>
        </section>
      )}
    </div>
  );
}
