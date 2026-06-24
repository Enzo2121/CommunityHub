import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMe, updateUser, clearError } from '../features/auth/authSlice';
import './AuthPages.css';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading, error } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    dispatch(fetchMe());
    return () => dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      reset({
        pseudo: user.pseudo || '',
        email: user.email || '',
        avatar: user.avatar || '',
        lastname: user.lastname || '',
        firstname: user.firstname || '',
        birthdate: user.birthdate || '',
        address: user.address || '',
        postal_code: user.postal_code || '',
        city: user.city || '',
        password: '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    const payload = { ...data };
    if (!payload.password) {
      delete payload.password;
    }
    dispatch(updateUser(payload));
  };

  if (!user) {
    return (
      <div className="page-wrapper container text-center">
        <div className="spinner" style={{ marginTop: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <Link to="/dashboard" className="back-link">← Retour au dashboard</Link>

        <div className="auth-card card animate-fade-up" style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1>Modifier mon profil</h1>
            <p className="text-muted">Mettez à jour vos informations personnelles</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Pseudo *</label>
                <input
                  className="form-control"
                  {...register('pseudo', { required: 'Requis' })}
                />
                {errors.pseudo && <span className="form-error">{errors.pseudo.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  {...register('email', { required: 'Requis' })}
                />
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input
                  className="form-control"
                  {...register('firstname')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  className="form-control"
                  {...register('lastname')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Avatar (URL)</label>
              <input
                className="form-control"
                placeholder="https://exemple.com/avatar.png"
                {...register('avatar')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date de naissance</label>
              <input
                type="date"
                className="form-control"
                {...register('birthdate')}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse</label>
              <input
                className="form-control"
                {...register('address')}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Code postal</label>
                <input
                  className="form-control"
                  {...register('postal_code')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ville</label>
                <input
                  className="form-control"
                  {...register('city')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <input
                type="password"
                className="form-control"
                placeholder="Laisser vide pour ne pas modifier"
                {...register('password')}
              />
              <span className="text-muted text-sm">Remplissez ce champ uniquement si vous souhaitez changer de mot de passe.</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading || !isDirty}
            >
              {isLoading ? <><span className="spinner spinner-sm" /> Enregistrement...</> : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
