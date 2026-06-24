import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state animate-fade-up" style={{ paddingBlock: '5rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', fontWeight: 200, color: 'var(--text-muted)' }}>404</div>
        <h1 style={{ fontSize: '5rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>404</h1>
        <h3 style={{ marginBottom: '0.5rem' }}>Page introuvable</h3>
        <p>Cette page n'existe pas ou a été déplacée.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">← Accueil</Link>
          <Link to="/events" className="btn btn-outline">Voir les événements</Link>
        </div>
      </div>
    </div>
  );
}
