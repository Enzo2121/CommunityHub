import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createEvent, fetchCategories, clearEventStatus } from '../features/events/eventsSlice';
import './AuthPages.css';
import './CreateEventPage.css';

export default function CreateEventPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, isLoading, error, success } = useSelector((s) => s.events);
  const { user } = useSelector((s) => s.auth);

  const isPremium = user?.is_premium || user?.premium === 1 || user?.premium === true;

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { event_type: 'presentiel', price_type: 'gratuit', price: 0 },
  });

  const priceType = watch('price_type');

  useEffect(() => {
    dispatch(fetchCategories());
    return () => dispatch(clearEventStatus());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearEventStatus());
        navigate('/events');
      }, 2000);
    }
  }, [success, dispatch, navigate]);

  if (!isPremium) {
    return (
      <div className="page-wrapper container text-center">
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>Réservé aux membres premium</h3>
          <p>Pour créer un événement, vous devez avoir le statut premium.</p>
          <Link to="/premium" className="btn btn-accent" style={{ marginTop: '1rem' }}>Passer Premium</Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const payload = {
      ...data,
      event_category_id: parseInt(data.event_category_id),
      price: parseFloat(data.price),
      max_participants: parseInt(data.max_participants),
    };
    dispatch(createEvent(payload));
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/events" className="back-link">← Retour aux événements</Link>

        <div className="create-event-card card animate-fade-up">
          <div style={{ marginBottom: '2rem' }}>
            <h1>🎉 Créer un événement</h1>
            <p className="text-muted">Organisez un événement pour la communauté</p>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Nom de l'événement *</label>
              <input
                className="form-control"
                placeholder="Soirée jeux de rôle"
                {...register('name', { required: 'Requis' })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Catégorie *</label>
              <select
                className="form-control"
                {...register('event_category_id', { required: 'Requis' })}
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.event_category_id && <span className="form-error">{errors.event_category_id.message}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Type *</label>
                <div className="type-toggle">
                  {['presentiel', 'distanciel'].map((t) => (
                    <label key={t} className={`type-option ${watch('event_type') === t ? 'selected' : ''}`}>
                      <input type="radio" value={t} {...register('event_type')} />
                      {t === 'presentiel' ? '📍 Présentiel' : '🌐 Distanciel'}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tarif *</label>
                <div className="type-toggle">
                  {['gratuit', 'payant'].map((t) => (
                    <label key={t} className={`type-option ${watch('price_type') === t ? 'selected' : ''}`}>
                      <input type="radio" value={t} {...register('price_type')} />
                      {t === 'gratuit' ? '🆓 Gratuit' : '💰 Payant'}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {priceType === 'payant' && (
              <div className="form-group">
                <label className="form-label">Prix (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="15.00"
                  {...register('price', { required: 'Requis si payant', min: 0.01 })}
                />
                {errors.price && <span className="form-error">{errors.price.message}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nombre max de participants *</label>
              <input
                type="number"
                className="form-control"
                placeholder="10"
                {...register('max_participants', { required: 'Requis', min: 1 })}
              />
              {errors.max_participants && <span className="form-error">{errors.max_participants.message}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date de début *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...register('start_date', { required: 'Requis' })}
                />
                {errors.start_date && <span className="form-error">{errors.start_date.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...register('end_date', { required: 'Requis' })}
                />
                {errors.end_date && <span className="form-error">{errors.end_date.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image (URL)</label>
              <input
                className="form-control"
                placeholder="https://exemple.com/image.jpg"
                {...register('image')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Introduction *</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Décrivez votre événement..."
                {...register('introduction', { required: 'Requis' })}
              />
              {errors.introduction && <span className="form-error">{errors.introduction.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={isLoading}>
              {isLoading ? <><span className="spinner spinner-sm" /> Création...</> : '🎉 Créer l\'événement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
