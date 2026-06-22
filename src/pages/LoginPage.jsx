import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, clearError } from '../features/auth/authSlice';
import './AuthPages.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error, token } = useSelector((s) => s.auth);
  const justRegistered = location.state?.registered;

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
    return () => dispatch(clearError());
  }, [token, navigate, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="container auth-container">
        <div className="auth-card card animate-fade-up" style={{ maxWidth: 460 }}>
          <div className="auth-header">
            <h1 className="auth-title">Connexion</h1>
            <p className="text-muted">Bon retour parmi nous 👋</p>
          </div>

          {justRegistered && (
            <div className="alert alert-success">
              ✅ Compte créé ! Vérifiez votre email puis connectez-vous.
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Pseudo ou Email *</label>
              <input
                className="form-control"
                placeholder="jean_dupont ou jean@exemple.fr"
                {...register('login', { required: 'Ce champ est requis' })}
              />
              {errors.login && <span className="form-error">{errors.login.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                {...register('password', { required: 'Le mot de passe est requis' })}
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? <><span className="spinner spinner-sm" /> Connexion...</> : 'Se connecter →'}
            </button>
          </form>

          <p className="auth-footer-text">
            Pas encore membre ? <Link to="/register" className="auth-link">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
