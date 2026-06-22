import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../features/auth/authSlice';
import './AuthPages.css';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ defaultValues: { user_status_id: '1' } });

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
    return () => dispatch(clearError());
  }, [token, navigate, dispatch]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      user_status_id: parseInt(data.user_status_id, 10),
    };
    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      navigate('/login', { state: { registered: true } });
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="container auth-container">
        <div className="auth-card card animate-fade-up">
          <div className="auth-header">
            <h1 className="auth-title">Créer un compte</h1>
            <p className="text-muted">Rejoignez la communauté en quelques secondes</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            {/* Identity */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  className="form-control"
                  placeholder="Jean"
                  {...register('firstname', { required: 'Le prénom est requis' })}
                />
                {errors.firstname && <span className="form-error">{errors.firstname.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  className="form-control"
                  placeholder="Dupont"
                  {...register('lastname', { required: 'Le nom est requis' })}
                />
                {errors.lastname && <span className="form-error">{errors.lastname.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pseudo *</label>
              <input
                className="form-control"
                placeholder="jean_dupont"
                {...register('pseudo', { required: 'Le pseudo est requis' })}
              />
              {errors.pseudo && <span className="form-error">{errors.pseudo.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="jean@exemple.fr"
                {...register('email', {
                  required: "L'email est requis",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide' },
                })}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' },
                })}
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Date de naissance *</label>
              <input
                type="date"
                className="form-control"
                {...register('birthdate', { required: 'La date de naissance est requise' })}
              />
              {errors.birthdate && <span className="form-error">{errors.birthdate.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Avatar (URL)</label>
              <input
                className="form-control"
                placeholder="https://exemple.com/avatar.png"
                {...register('avatar')}
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Adresse *</label>
              <input
                className="form-control"
                placeholder="10 rue de Paris"
                {...register('address', { required: "L'adresse est requise" })}
              />
              {errors.address && <span className="form-error">{errors.address.message}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Code postal *</label>
                <input
                  className="form-control"
                  placeholder="75000"
                  {...register('postal_code', { required: 'Le code postal est requis' })}
                />
                {errors.postal_code && <span className="form-error">{errors.postal_code.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Ville *</label>
                <input
                  className="form-control"
                  placeholder="Paris"
                  {...register('city', { required: 'La ville est requise' })}
                />
                {errors.city && <span className="form-error">{errors.city.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone (optionnel)</label>
              <input
                type="tel"
                className="form-control"
                placeholder="0600000000"
                {...register('phone')}
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Statut *</label>
              <div className="status-radio-group">
                <label className={`status-radio ${watch('user_status_id') === '1' ? 'selected' : ''}`}>
                  <input type="radio" value="1" {...register('user_status_id')} />
                  <span className="status-radio-icon">👤</span>
                  <div>
                    <strong>Membre</strong>
                    <p>Participez aux événements et à la communauté</p>
                  </div>
                </label>
                <label className={`status-radio ${watch('user_status_id') === '2' ? 'selected' : ''}`}>
                  <input type="radio" value="2" {...register('user_status_id')} />
                  <span className="status-radio-icon">🎪</span>
                  <div>
                    <strong>Organisateur</strong>
                    <p>Créez et gérez des événements (statut premium requis)</p>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? <><span className="spinner spinner-sm" /> Inscription...</> : "Créer mon compte →"}
            </button>
          </form>

          <p className="auth-footer-text">
            Déjà membre ? <Link to="/login" className="auth-link">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
