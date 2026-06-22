import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { fetchSkills, createSkill, clearSkillStatus } from '../features/skills/skillsSlice';
import SkillCard from '../components/skills/SkillCard';
import './SkillsPage.css';

export default function MySkillPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { skills, isLoading, success, error } = useSelector((s) => s.skills);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const isPremium = user?.is_premium || user?.premium === 1 || user?.premium === true;
  const mySkills = skills.filter((s) => s.user_id === user?.id || s.user?.id === user?.id);

  useEffect(() => {
    dispatch(fetchSkills());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      reset();
      setTimeout(() => dispatch(clearSkillStatus()), 3000);
    }
  }, [success, dispatch, reset]);

  const onSubmit = (data) => {
    dispatch(createSkill({ ...data, daily_price: parseFloat(data.daily_price) }));
  };

  if (!isPremium) {
    return (
      <div className="page-wrapper container text-center">
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>Réservé aux membres premium</h3>
          <Link to="/premium" className="btn btn-accent" style={{ marginTop: '1rem' }}>Passer Premium</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="skills-header animate-fade-up">
          <div>
            <h1>🎯 Mes compétences</h1>
            <p className="text-muted">Proposez vos expertises à la communauté</p>
          </div>
        </div>

        {/* Add skill form */}
        <div className="card animate-fade-up" style={{ padding: '1.75rem', marginBottom: '2rem', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>+ Ajouter une compétence</h2>

          {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}
          {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
            <div className="form-group">
              <label className="form-label">Titre *</label>
              <input
                className="form-control"
                placeholder="Animation atelier React"
                {...register('title', { required: 'Requis' })}
              />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Décrivez ce que vous proposez..."
                {...register('description', { required: 'Requis' })}
              />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Prix journalier (€) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="250"
                {...register('daily_price', { required: 'Requis', min: 0 })}
              />
              {errors.daily_price && <span className="form-error">{errors.daily_price.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? '...' : '+ Publier la compétence'}
            </button>
          </form>
        </div>

        {/* My skills grid */}
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Mes compétences ({mySkills.length})</h2>
        {mySkills.length === 0 ? (
          <div className="empty-state animate-fade-up">
            <div className="empty-state-icon">🎯</div>
            <h3>Aucune compétence publiée</h3>
            <p>Utilisez le formulaire ci-dessus pour ajouter votre première compétence.</p>
          </div>
        ) : (
          <div className="skills-grid animate-fade-up">
            {mySkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        )}
      </div>
    </div>
  );
}
