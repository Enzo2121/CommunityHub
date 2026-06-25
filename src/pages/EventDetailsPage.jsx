import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  fetchEventById,
  registerToEvent,
  postEventMessage,
  moderateEventMessage,
  clearEventStatus,
} from '../features/events/eventsSlice';
import './EventDetailsPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentEvent: event, isLoading, error, success } = useSelector((s) => s.events);
  const { user, token } = useSelector((s) => s.auth);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const isPremium = user?.is_premium || user?.premium === 1 || user?.premium === true;
  const isAdmin = user?.role === 'admin' || user?.is_admin === true || user?.is_admin === 1;

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchEventById(id));
    return () => dispatch(clearEventStatus());
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      setTimeout(() => dispatch(clearEventStatus()), 3000);
    }
  }, [success, dispatch]);

  const handleRegister = () => {
    dispatch(registerToEvent({ event_id: parseInt(id), payment_method: paymentMethod }));
  };

  const onComment = (data) => {
    dispatch(postEventMessage({ event_id: parseInt(id), message: data.message }));
    reset();
  };

  if (isLoading) return <div className="container page-wrapper"><div className="spinner" /></div>;
  if (!event) return (
    <div className="container page-wrapper">
      <div className="empty-state"><h3>Événement introuvable</h3><Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Retour aux événements</Link></div>
    </div>
  );

  const isPaid = event.price_type === 'payant';
  const isDistanciel = event.event_type === 'distanciel';
  const isOrganizer = user && event.organizer && user.id === event.organizer.id;
  const isFull = event.max_participants != null && event.participants_count >= event.max_participants;
  const now = new Date();
  const isPast = event.end_date && new Date(event.end_date) < now;

  return (
    <div className="event-detail-page page-wrapper">
      <div className="container">
        <Link to="/events" className="back-link">← Tous les événements</Link>

        <div className="event-detail-layout">
          {/* Main */}
          <div className="event-detail-main animate-fade-up">
            {event.image && (
              <div className="event-detail-img-wrap">
                <img src={event.image} alt={event.name} className="event-detail-img" />
              </div>
            )}

            <div className="event-detail-content card">
              <div className="event-detail-badges">
                <span className={`badge ${isDistanciel ? 'badge-primary' : 'badge-success'}`}>
                  {isDistanciel ? 'Distanciel' : 'Présentiel'}
                </span>
                <span className={`badge ${isPaid ? 'badge-warning' : 'badge-muted'}`}>
                  {isPaid ? `${event.price} €` : 'Gratuit'}
                </span>
                {event.category?.name && (
                  <span className="badge badge-muted">{event.category.name}</span>
                )}
              </div>

              <h1 style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>{event.name}</h1>

              <div className="event-detail-dates">
                <div><span className="event-detail-label">Début</span> {formatDate(event.start_date)}</div>
                <div><span className="event-detail-label">Fin</span> {formatDate(event.end_date)}</div>
              </div>

              {event.introduction && (
                <p className="event-detail-intro">{event.introduction}</p>
              )}

              {event.organizer && (
                <div className="event-organizer">
                  <span className="event-detail-label">Organisateur</span>
                  <span>{event.organizer.firstname} {event.organizer.lastname} (@{event.organizer.pseudo})</span>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="event-comments card animate-fade-up">
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Commentaires</h2>

              {event.messages && event.messages.length > 0 ? (
                <div className="comments-list">
                  {event.messages.map((msg, i) => {
                    const isPending = msg.status === 'pending_deletion';
                    return (
                      <div className="comment-item" key={msg.id || i}>
                        <div className="avatar-placeholder avatar-sm">
                          {msg.user?.pseudo?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="comment-body" style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                            <strong>{msg.user?.pseudo || 'Anonyme'}</strong>
                            {isOrganizer && !isPending && (
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => dispatch(moderateEventMessage({ message_id: msg.id, action: 'request_delete' }))}
                                disabled={isLoading}
                              >
                                Modérer
                              </button>
                            )}
                          </div>
                          {isPending ? (
                            <p className="text-muted text-sm" style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>
                              Ce message est en attente de validation admin.
                            </p>
                          ) : (
                            <p style={{ marginTop: '0.25rem' }}>{msg.message}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-sm">Soyez le premier à commenter !</p>
              )}

              {token && (
                <form onSubmit={handleSubmit(onComment)} className="comment-form">
                  <input
                    className="form-control"
                    placeholder="Votre commentaire..."
                    {...register('message', { required: true })}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">Envoyer</button>
                </form>
              )}
              {!token && (
                <p className="text-muted text-sm"><Link to="/login" className="auth-link">Connectez-vous</Link> pour commenter.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="event-detail-sidebar animate-fade-up">
            <div className="event-register-card card">
              {(isOrganizer || isAdmin) && (
                <Link to={`/events/${id}/edit`} className="btn btn-outline btn-full" style={{ marginBottom: '1rem' }}>
                  Modifier l'événement
                </Link>
              )}

              <div className="event-capacity">
                <span className="event-detail-label">Participants</span>
                <div className="capacity-bar-wrap">
                  <div
                    className="capacity-bar"
                    style={{ width: `${Math.min(((event.participants_count || 0) / (event.max_participants || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-muted">
                  {event.participants_count || 0} / {event.max_participants || '∞'} places
                </span>
              </div>

              {isPaid && (
                <div className="register-price">
                  <span>Prix :</span>
                  <strong>{event.price} €</strong>
                </div>
              )}

              {success && <div className="alert alert-success text-sm">{success}</div>}
              {error && <div className="alert alert-danger text-sm">{error}</div>}

              {token && isPremium ? (
                <>
                  {isFull ? (
                    <div className="alert alert-warning text-sm">Cet événement est complet.</div>
                  ) : isPast ? (
                    <div className="alert alert-muted text-sm">Cet événement est terminé.</div>
                  ) : (
                    <>
                      {isPaid && (
                        <>
                          <select
                            className="form-control"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option value="stripe">Stripe</option>
                            <option value="cheque">Chèque</option>
                          </select>
                          <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
                            Une commission de 10 % est prélevée sur chaque inscription payante.
                          </p>
                        </>
                      )}
                      <button
                        className="btn btn-primary btn-full"
                        onClick={handleRegister}
                        disabled={isLoading}
                      >
                        {isLoading ? '...' : "S'inscrire à l'événement"}
                      </button>
                    </>
                  )}
                </>
              ) : token && !isPremium ? (
                <div className="register-premium-cta">
                  <p className="text-muted text-sm">Les inscriptions sont réservées aux membres premium.</p>
                  <Link to="/premium" className="btn btn-accent btn-full btn-sm">Passer Premium</Link>
                </div>
              ) : (
                <Link to="/login" className="btn btn-outline btn-full">Se connecter pour s'inscrire</Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
