import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createCategory, clearEventStatus } from '../../features/events/eventsSlice';
import { useEffect } from 'react';

/**
 * Admin-only form to create event categories.
 */
export default function CategoryForm() {
  const dispatch = useDispatch();
  const { isLoading, success, error } = useSelector((s) => s.events);
  const { user } = useSelector((s) => s.auth);

  const isAdmin = user?.role === 'admin' || user?.is_admin === true || user?.is_admin === 1;

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (success) {
      reset();
      setTimeout(() => dispatch(clearEventStatus()), 3000);
    }
  }, [success, dispatch, reset]);

  if (!isAdmin) return null;

  const onSubmit = (data) => {
    dispatch(createCategory({ name: data.name }));
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🗂️ Créer une catégorie</h3>
      {success && <div className="alert alert-success" style={{ marginBottom: '0.75rem' }}>{success}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: '0.75rem' }}>{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="form-control"
          placeholder="Nom de la catégorie"
          {...register('name', { required: 'Requis' })}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading} style={{ whiteSpace: 'nowrap' }}>
          {isLoading ? '...' : '+ Créer'}
        </button>
      </form>
      {errors.name && <span className="form-error">{errors.name.message}</span>}
    </div>
  );
}
