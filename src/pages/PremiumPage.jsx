import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { upgradeToPremium, clearPaymentStatus } from '../features/payments/paymentsSlice';
import { fetchMe } from '../features/auth/authSlice';
import './AuthPages.css';
import './PremiumPage.css';

export default function PremiumPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { isLoading, error, success } = useSelector((s) => s.payments);

  const { register, handleSubmit, watch } = useForm({ defaultValues: { payment_method: 'stripe' } });

  const isPremium = user?.is_premium || user?.premium === 1 || user?.premium === true;

  useEffect(() => {
    if (isPremium) navigate('/dashboard', { replace: true });
  }, [isPremium, navigate]);

  useEffect(() => {
    if (success) {
      dispatch(fetchMe());
      setTimeout(() => {
        dispatch(clearPaymentStatus());
        navigate('/dashboard');
      }, 2500);
    }
  }, [success, dispatch, navigate]);

  const onSubmit = (data) => {
    dispatch(upgradeToPremium({ payment_method: data.payment_method, amount: 19.99 }));
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="container auth-container">
        <div className="premium-page-card card animate-fade-up">
          {/* Header */}
          <div className="premium-page-header">
            <div className="premium-star">⭐</div>
            <h1>Passer Premium</h1>
            <p className="text-muted">Débloquez toutes les fonctionnalités de CommunityHub</p>
          </div>

          {/* Perks */}
          <div className="premium-perks">
            {[
              { icon: '🎯', text: 'Proposez vos compétences' },
              { icon: '🎉', text: 'Créez des événements' },
              { icon: '🤝', text: 'Ajoutez des contacts' },
              { icon: '💬', text: 'Messages privés illimités' },
            ].map((p) => (
              <div className="premium-perk" key={p.text}>
                <span>{p.icon}</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>

          <div className="premium-price-tag">
            <span className="premium-price">19,99 €</span>
            <span className="text-muted">/ accès à vie</span>
          </div>

          {success ? (
            <div className="alert alert-success" style={{ textAlign: 'center' }}>
              🎉 {success} Redirection en cours...
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="form-group">
                <label className="form-label">Méthode de paiement</label>
                <div className="payment-methods">
                  <label className={`payment-method-opt ${watch('payment_method') === 'stripe' ? 'selected' : ''}`}>
                    <input type="radio" value="stripe" {...register('payment_method')} />
                    <span>💳 Carte bancaire (Stripe)</span>
                    <span className="badge badge-success">Simulé</span>
                  </label>
                  <label className={`payment-method-opt ${watch('payment_method') === 'cheque' ? 'selected' : ''}`}>
                    <input type="radio" value="cheque" {...register('payment_method')} />
                    <span>📝 Chèque</span>
                  </label>
                </div>
              </div>

              <div className="premium-total-row">
                <span>Total à payer :</span>
                <strong className="text-gradient">19,99 €</strong>
              </div>

              <button type="submit" className="btn btn-accent btn-full btn-lg" disabled={isLoading}>
                {isLoading
                  ? <><span className="spinner spinner-sm" /> Traitement...</>
                  : '⭐ Passer Premium maintenant'}
              </button>

              <p className="text-muted text-sm text-center">
                Paiement 100% sécurisé · Accès immédiat après confirmation
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
