export default function SkillCard({ skill }) {
  return (
    <article className="skill-card card">
      <div className="skill-card-header">
        <div className="skill-card-icon">{skill.title?.[0]?.toUpperCase() || '?'}</div>
        <span className="skill-price-tag">{skill.daily_price} €/j</span>
      </div>
      <h3 className="skill-card-title">{skill.title}</h3>
      <p className="skill-card-desc text-muted text-sm">{skill.description}</p>
      {skill.user && (
        <div className="skill-card-user">
          <div className="avatar-placeholder" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
            {skill.user.pseudo?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm text-muted">@{skill.user.pseudo}</span>
        </div>
      )}
    </article>
  );
}
