import { Link } from 'react-router-dom';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function EventCard({ event }) {
  const isPaid = event.price_type === 'payant';
  const isDistanciel = event.event_type === 'distanciel';

  return (
    <Link to={`/events/${event.id}`} className="event-card-link">
      <article className="event-card card">
        {event.image && (
          <div className="event-card-img-wrap">
            <img src={event.image} alt={event.name} className="event-card-img" />
          </div>
        )}
        {!event.image && (
          <div className="event-card-img-placeholder">
            <span>🎉</span>
          </div>
        )}
        <div className="event-card-body">
          <div className="event-card-badges">
            <span className={`badge ${isDistanciel ? 'badge-primary' : 'badge-success'}`}>
              {isDistanciel ? '🌐 Distanciel' : '📍 Présentiel'}
            </span>
            <span className={`badge ${isPaid ? 'badge-warning' : 'badge-muted'}`}>
              {isPaid ? `💰 ${event.price} €` : '🆓 Gratuit'}
            </span>
          </div>

          <h3 className="event-card-title">{event.name}</h3>

          {event.introduction && (
            <p className="event-card-intro text-muted text-sm">{event.introduction}</p>
          )}

          <div className="event-card-meta">
            <span>📅 {formatDate(event.start_date)}</span>
            {event.max_participants && (
              <span>👥 {event.participants_count || 0} / {event.max_participants}</span>
            )}
          </div>

          {event.category?.name && (
            <span className="badge badge-muted" style={{ marginTop: '0.5rem' }}>
              {event.category.name}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
