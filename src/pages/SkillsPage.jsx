import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../features/skills/skillsSlice';
import SkillCard from '../components/skills/SkillCard';
import './SkillsPage.css';

export default function SkillsPage() {
  const dispatch = useDispatch();
  const { skills, isLoading } = useSelector((s) => s.skills);

  useEffect(() => {
    dispatch(fetchSkills());
  }, [dispatch]);

  return (
    <div className="skills-page page-wrapper">
      <div className="container">
        <div className="skills-header animate-fade-up">
          <div>
            <h1>🎯 Compétences</h1>
            <p className="text-muted">Explorez les expertises proposées par la communauté</p>
          </div>
          <span className="badge badge-muted">{skills.length} compétence{skills.length !== 1 ? 's' : ''}</span>
        </div>

        {isLoading ? (
          <div className="spinner" />
        ) : skills.length === 0 ? (
          <div className="empty-state animate-fade-up">
            <div className="empty-state-icon">🎯</div>
            <h3>Aucune compétence disponible</h3>
            <p>Les membres premium peuvent proposer leurs compétences.</p>
          </div>
        ) : (
          <div className="skills-grid animate-fade-up">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
