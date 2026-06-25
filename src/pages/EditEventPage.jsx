import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchEventById,
  updateEvent,
  fetchCategories,
  clearEventStatus,
} from '../features/events/eventsSlice';
import './AuthPages.css';
import './CreateEventPage.css';

function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentEvent, categories, isLoading, error, success } = useSelector((s) => s.events);
  const { user } = useSelector((s) => s.auth);

  const isAdmin = user?.role === 'admin' || user?.is_admin === true || user?.is_admin === 1;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const priceType = watch('price_type');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchEventById(id));
    return () => dispatch(clearEventStatus());
  }, [dispatch, id]);

  useEffect(() => {
    if (currentEvent) {
      reset({
        event_category_id: currentEvent.event_category_id || currentEvent.category?.id || '',
        name: currentEvent.name || '',
        event_type: currentEvent.event_type || 'presentiel',
        price_type: currentEvent.price_type || 'gratuit',
        price: currentEvent.price || 0,
        max_participants: currentEvent.max_participants || '',
        start_date: toDatetimeLocal(currentEvent.start_date),
        end_date: toDatetimeLocal(currentEvent.end_date),
        image: currentEvent.image || '',
        introduction: currentEvent.introduction || '',
      });
    }
  }, [currentEvent, reset]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearEventStatus());
        navigate(`/events/${id}`);
      }, 1500);
    }
  }, [success, dispatch, navigate, id]);

  if (!currentEvent && !isLoading) {
    return (
      <div className="page-wrapper container text-center">
        <div className="empty-state">
          <h3>Événement introuvable</h3>
          <Link to="/events" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const isOrganizer = currentEvent && user && currentEvent.organizer_id === user.id;
  const canEdit = isOrganizer || isAdmin;

  if (currentEvent && !canEdit) {
    return (
      <div className="page-wrapper container text-center">
        <div className="empty-state">
          <h3>Accès refusé</h3>
          <p className="text-muted">Vous ne pouvez modifier que vos propres événements.</p>
          <Link to={`/events/${id}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Retour à l'événement
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return;
    }

    if (end <= start) {
      alert('La date de fin doit être postérieure à la date de début.');
      return;
    }

    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (+startDay === +endDay) {
      alert('La date de fin ne peut pas être le même jour que la date de début.');
      return;
    }

    const payload = {
      event_id: parseInt(id),
      event_category_id: parseInt(data.event_category_id),
      name: data.name,
      event_type: data.event_type,
      price_type: data.price_type,
      price: data.price_type === 'gratuit' ? 0 : parseFloat(data.price),
      max_participants: parseInt(data.max_participants),
      start_date: data.start_date,
      end_date: data.end_date,
      image: data.image || null,
      introduction: data.introduction,
    };
    dispatch(updateEvent(payload));
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to={`/events/${id}`} className="back-link">← Retour à l'événement</Link>

        <div className="create-event-card card animate-fade-up">
          <div style={{ marginBottom: '2rem' }}>
            <h1>Modifier l'événement</h1>
            <p className="text-muted">Mettez à jour les informations de l'événement</p>
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
              {isLoading && categories.length === 0 ? (
                <div className="text-muted text-sm">Chargement des catégories…</div>
              ) : categories.length === 0 ? (
                <div className="alert alert-warning text-sm">
                  Aucune catégorie disponible.
                </div>
              ) : (
                <select
                  className="form-control"
                  {...register('event_category_id', { required: 'Requis' })}
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              {errors.event_category_id && <span className="form-error">{errors.event_category_id.message}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Type *</label>
                <div className="type-toggle">
                  {['presentiel', 'distanciel'].map((t) => (
                    <label key={t} className={`type-option ${watch('event_type') === t ? 'selected' : ''}`}>
                      <input type="radio" value={t} {...register('event_type')} />
                      {t === 'presentiel' ? 'Présentiel' : 'Distanciel'}
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
                      {t === 'gratuit' ? 'Gratuit' : 'Payant'}
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
              {isLoading ? <><span className="spinner spinner-sm" /> Enregistrement...</> : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
