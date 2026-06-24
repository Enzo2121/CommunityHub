import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMe } from '../features/auth/authSlice';
import { fetchSkills, createSkill, clearSkillStatus } from '../features/skills/skillsSlice';
import { fetchPayments } from '../features/payments/paymentsSlice';
import {
  fetchContacts,
  fetchUsers,
  sendContactRequest,
  acceptContactRequest,
  clearContactStatus,
} from '../features/contacts/contactsSlice';
import {
  fetchReceivedMessages,
  sendMessage,
  clearMessageStatus,
} from '../features/messages/messagesSlice';
import {
  fetchMyRegistrations,
  fetchMyEvents,
  fetchEarnings,
  rateOrganizer,
  requestWithdrawal,
  clearUserStatus,
} from '../features/user/userSlice';
import { useForm } from 'react-hook-form';
import './DashboardPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { skills, isLoading: skillsLoading, success: skillSuccess, error: skillError } = useSelector((s) => s.skills);
  const { payments } = useSelector((s) => s.payments);
  const { contacts, users, success: contactSuccess, error: contactError } = useSelector((s) => s.contacts);
  const { received, success: msgSuccess, error: msgError, isLoading: msgLoading } = useSelector((s) => s.messages);
  const {
    registrations,
    myEvents,
    earnings,
    isLoading: userLoading,
    success: userSuccess,
    error: userError,
  } = useSelector((s) => s.user);

  const isPremium = user?.is_premium || user?.premium === 1 || user?.premium === true;
  const isOrganizer = user?.user_status_id === 2 || user?.status_id === 2;

  const mySkills = Array.isArray(skills) ? skills.filter((s) => s.user_id === user?.id || s.user?.id === user?.id) : [];

  // Contacts Lists
  const pendingContacts = Array.isArray(contacts) ? contacts.filter((c) => c.status === 'pending' && c.receiver_id === user?.id) : [];
  const acceptedContacts = Array.isArray(contacts) ? contacts.filter((c) => c.status === 'accepted') : [];

  // Exclude already contacted users from dropdown list
  const contactedIds = Array.isArray(contacts)
    ? contacts.flatMap((c) => [c.requester_id, c.receiver_id])
    : [];
  const addableUsers = Array.isArray(users) ? users.filter(
    (u) => u.id !== user?.id && !contactedIds.includes(u.id)
  ) : [];

  const [activeMsgContact, setActiveMsgContact] = useState(null);
  const [selectedAddUser, setSelectedAddUser] = useState('');
  const [messageFilter, setMessageFilter] = useState('');

  const { register, handleSubmit: handleAddSkillSubmit, reset: resetSkillForm, formState: { errors: skillErrors } } = useForm();
  const { register: registerMsg, handleSubmit: handleMsgSubmit, reset: resetMsgForm } = useForm();

  useEffect(() => {
    dispatch(fetchMe());
    if (isPremium) {
      dispatch(fetchSkills());
      dispatch(fetchPayments());
      dispatch(fetchContacts());
      dispatch(fetchUsers());
      dispatch(fetchReceivedMessages());
      dispatch(fetchMyRegistrations());
      dispatch(fetchMyEvents());
      dispatch(fetchEarnings());
    }
  }, [dispatch, isPremium]);

  useEffect(() => {
    if (skillSuccess) {
      resetSkillForm();
      setTimeout(() => dispatch(clearSkillStatus()), 3000);
    }
  }, [skillSuccess, dispatch, resetSkillForm]);

  useEffect(() => {
    if (userSuccess) {
      setTimeout(() => dispatch(clearUserStatus()), 3000);
    }
  }, [userSuccess, dispatch]);

  useEffect(() => {
    if (contactSuccess || msgSuccess) {
      setTimeout(() => {
        dispatch(clearContactStatus());
        dispatch(clearMessageStatus());
      }, 3000);
    }
  }, [contactSuccess, msgSuccess, dispatch]);

  const onAddSkill = (data) => {
    dispatch(createSkill({ ...data, daily_price: parseFloat(data.daily_price) }));
  };

  const onSendContactRequest = (e) => {
    e.preventDefault();
    if (!selectedAddUser) return;
    dispatch(sendContactRequest(parseInt(selectedAddUser))).then(() => {
      dispatch(fetchContacts());
    });
    setSelectedAddUser('');
  };

  const onSendPrivateMessage = (data) => {
    if (!activeMsgContact) return;
    dispatch(sendMessage({
      receiver_id: activeMsgContact.id,
      message: data.message,
    })).then(() => {
      // Fetch received messages to verify if the contact replied
      dispatch(fetchReceivedMessages());
    });
    resetMsgForm();
  };

  // Filter received messages
  const filteredMessages = Array.isArray(received)
    ? received.filter((msg) => {
        const text = msg.message?.toLowerCase() || '';
        const senderPseudo = (msg.sender_pseudo || '').toLowerCase();
        return text.includes(messageFilter.toLowerCase()) || senderPseudo.includes(messageFilter.toLowerCase());
      })
    : [];

  return (
    <div className="dashboard-page page-wrapper">
      <div className="container">
        {/* Profile Header */}
        <div className="dashboard-header card animate-fade-up">
          <div className="dashboard-profile">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.pseudo} className="avatar avatar-xl" />
            ) : (
              <span className="avatar-placeholder avatar-xl" style={{ fontSize: '2rem' }}>
                {user?.pseudo?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
            <div className="dashboard-profile-info">
              <div className="dashboard-profile-name-row">
                <h1>{user?.firstname} {user?.lastname}</h1>
                {isPremium && <span className="badge badge-premium">⭐ Premium</span>}
                {!isPremium && <span className="badge badge-muted">Membre</span>}
              </div>
              <p className="text-muted">@{user?.pseudo}</p>
              <p className="text-muted text-sm">{user?.email} · {user?.city}</p>
              {isOrganizer && <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>🎪 Organisateur</span>}
            </div>
          </div>

          {!isPremium && (
            <div className="premium-banner">
              <div className="premium-banner-text">
                <h3>⭐ Passez Premium</h3>
                <p>Accédez à toutes les fonctionnalités : compétences, contacts, messages, création d'événements…</p>
              </div>
              <Link to="/premium" className="btn btn-accent">Passer Premium – 19,99 €</Link>
            </div>
          )}
        </div>

        {isPremium && (
          <div className="dashboard-grid">
            {/* Column Left: Skills & Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* My Skills */}
              <section className="dashboard-section card animate-fade-up">
                <div className="section-header">
                  <div>
                    <h2 className="section-title" style={{ fontSize: '1.3rem' }}>🎯 Mes compétences</h2>
                    <p className="text-muted text-sm">Proposez vos expertises à la communauté</p>
                  </div>
                </div>

                {/* Add skill form */}
                <form onSubmit={handleAddSkillSubmit(onAddSkill)} className="skill-form">
                  <div className="form-group">
                    <label className="form-label">Titre de la compétence</label>
                    <input
                      className="form-control"
                      placeholder="Animation atelier React"
                      {...register('title', { required: 'Requis' })}
                    />
                    {skillErrors.title && <span className="form-error">{skillErrors.title.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Décrivez votre compétence..."
                      {...register('description', { required: 'Requis' })}
                    />
                    {skillErrors.description && <span className="form-error">{skillErrors.description.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prix journalier (€)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="250"
                      step="0.01"
                      {...register('daily_price', { required: 'Requis', min: { value: 0, message: 'Doit être positif' } })}
                    />
                    {skillErrors.daily_price && <span className="form-error">{skillErrors.daily_price.message}</span>}
                  </div>
                  {skillSuccess && <div className="alert alert-success">{skillSuccess}</div>}
                  {skillError && <div className="alert alert-danger">{skillError}</div>}
                  <button type="submit" className="btn btn-primary" disabled={skillsLoading}>
                    {skillsLoading ? '...' : '+ Ajouter'}
                  </button>
                </form>

                <hr className="divider" />

                {/* Skills list */}
                {mySkills.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🎯</div>
                    <h3>Aucune compétence</h3>
                    <p>Ajoutez votre première compétence ci-dessus.</p>
                  </div>
                ) : (
                  <div className="skills-list">
                    {mySkills.map((skill) => (
                      <div className="skill-item" key={skill.id}>
                        <div>
                          <strong>{skill.title}</strong>
                          <p className="text-muted text-sm">{skill.description}</p>
                        </div>
                        <span className="skill-price">{skill.daily_price} €/j</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Mes Messages */}
              <section className="dashboard-section card animate-fade-up">
                <div className="section-header">
                  <div>
                    <h2 className="section-title" style={{ fontSize: '1.3rem' }}>📥 Mes messages reçus</h2>
                    <p className="text-muted text-sm">Vos messages récents des autres membres</p>
                  </div>
                </div>

                {/* Search / Filter */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Filtrer les messages par expéditeur ou contenu..."
                    value={messageFilter}
                    onChange={(e) => setMessageFilter(e.target.value)}
                  />
                </div>

                {filteredMessages.length === 0 ? (
                  <div className="empty-state" style={{ paddingBlock: '1.5rem' }}>
                    <div className="empty-state-icon">💬</div>
                    <h3>Aucun message trouvé</h3>
                    <p>Vos messages reçus s'afficheront ici.</p>
                  </div>
                ) : (
                  <div className="skills-list" style={{ gap: '0.6rem' }}>
                    {filteredMessages.map((msg) => (
                      <div className="skill-item" style={{ flexDirection: 'column', alignItems: 'stretch' }} key={msg.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                            @{msg.sender_pseudo}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {formatDate(msg.created_at || msg.date)}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Column Right: Events, Contacts, Actions & Payments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Mes événements */}
              <section className="dashboard-section card animate-fade-up">
                <div className="section-header">
                  <div>
                    <h2 className="section-title" style={{ fontSize: '1.3rem' }}>📅 Mes événements</h2>
                    <p className="text-muted text-sm">Vos inscriptions et événements organisés</p>
                  </div>
                </div>

                {userSuccess && <div className="alert alert-success">{userSuccess}</div>}
                {userError && <div className="alert alert-danger">{userError}</div>}

                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🎟️ Mes inscriptions</h3>
                {registrations.length === 0 ? (
                  <div className="empty-state" style={{ paddingBlock: '1rem' }}>
                    <p className="text-muted text-sm">Vous n'êtes inscrit à aucun événement.</p>
                  </div>
                ) : (
                  <div className="skills-list" style={{ gap: '0.6rem', marginBottom: '1.5rem' }}>
                    {registrations.map((reg) => {
                      const evt = reg.event || reg;
                      const isEventPast = evt.end_date && new Date(evt.end_date) < new Date();
                      return (
                        <div className="skill-item" style={{ flexDirection: 'column', alignItems: 'stretch' }} key={reg.id || evt.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link to={`/events/${evt.id}`} style={{ fontSize: '0.9rem', fontWeight: '600' }}>{evt.name}</Link>
                            <span className={`badge ${isEventPast ? 'badge-muted' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                              {isEventPast ? 'Passé' : 'En cours'}
                            </span>
                          </div>
                          <span className="text-muted text-sm">{formatDate(evt.start_date)}</span>
                          {isEventPast && evt.organizer_id && evt.organizer_id !== user?.id && (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
                              onClick={() => dispatch(rateOrganizer({ event_id: evt.id, organizer_id: evt.organizer_id, vote: 1 }))}
                              disabled={userLoading}
                            >
                              👍 J'aime l'organisateur
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <hr className="divider" />

                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', marginTop: '1rem' }}>🎪 Mes événements organisés</h3>
                {myEvents.length === 0 ? (
                  <div className="empty-state" style={{ paddingBlock: '1rem' }}>
                    <p className="text-muted text-sm">Vous n'avez organisé aucun événement.</p>
                    <Link to="/events/create" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Créer un événement</Link>
                  </div>
                ) : (
                  <div className="skills-list" style={{ gap: '0.6rem' }}>
                    {myEvents.map((evt) => {
                      const isEventPast = evt.end_date && new Date(evt.end_date) < new Date();
                      return (
                        <div className="skill-item" style={{ flexDirection: 'column', alignItems: 'stretch' }} key={evt.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link to={`/events/${evt.id}`} style={{ fontSize: '0.9rem', fontWeight: '600' }}>{evt.name}</Link>
                            <span className={`badge ${isEventPast ? 'badge-muted' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                              {isEventPast ? 'Passé' : 'En cours'}
                            </span>
                          </div>
                          <span className="text-muted text-sm">{formatDate(evt.start_date)} · {evt.participants_count || 0} participant(s)</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Mes Contacts */}
              <section className="dashboard-section card animate-fade-up">
                <div className="section-header">
                  <div>
                    <h2 className="section-title" style={{ fontSize: '1.3rem' }}>🤝 Mes contacts</h2>
                    <p className="text-muted text-sm">Gérez votre réseau et discutez</p>
                  </div>
                </div>

                {/* Status feedbacks */}
                {contactSuccess && <div className="alert alert-success">{contactSuccess}</div>}
                {contactError && <div className="alert alert-danger">{contactError}</div>}
                {msgSuccess && <div className="alert alert-success">{msgSuccess}</div>}
                {msgError && <div className="alert alert-danger">{msgError}</div>}

                {/* Add new contact request */}
                <form onSubmit={onSendContactRequest} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <select
                    className="form-control"
                    value={selectedAddUser}
                    onChange={(e) => setSelectedAddUser(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">Sélectionner un membre à ajouter...</option>
                    {addableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstname} {u.lastname} (@{u.pseudo})
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ paddingInline: '1rem' }} disabled={!selectedAddUser}>
                    + Ajouter
                  </button>
                </form>

                {/* Pending requests incoming */}
                {pendingContacts.length > 0 && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '0.5rem' }}>⏳ Invitations reçues ({pendingContacts.length})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {pendingContacts.map((c) => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                            @{c.requester_pseudo}
                          </span>
                          <button
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              dispatch(acceptContactRequest(c.id)).then(() => {
                                dispatch(fetchContacts());
                              });
                            }}
                          >
                            ✓ Accepter
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Contacts list */}
                {acceptedContacts.length === 0 ? (
                  <div className="empty-state" style={{ paddingBlock: '1.5rem' }}>
                    <div className="empty-state-icon">👥</div>
                    <h3>Aucun contact</h3>
                    <p>Vos contacts acceptés apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="skills-list">
                    {acceptedContacts.map((contact) => {
                      const isRequester = contact.requester_id === user?.id;
                      const contactPseudo = isRequester ? contact.receiver_pseudo : contact.requester_pseudo;
                      const contactUserId = isRequester ? contact.receiver_id : contact.requester_id;
                      const isActive = activeMsgContact?.id === contactUserId;
                      return (
                        <div
                          className={`skill-item ${isActive ? 'contact-card-active' : ''}`}
                          key={contact.id}
                          style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'pointer' }}
                          onClick={() => setActiveMsgContact(isActive ? null : { id: contactUserId, pseudo: contactPseudo })}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="avatar-placeholder avatar-sm">
                                {contactPseudo?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <strong style={{ fontSize: '0.85rem', margin: 0 }}>
                                  @{contactPseudo}
                                </strong>
                              </div>
                            </div>
                            <span style={{ fontSize: '1rem' }}>💬</span>
                          </div>

                          {/* Inline private message form on click */}
                          {isActive && (
                            <form
                              onSubmit={handleMsgSubmit(onSendPrivateMessage)}
                              onClick={(e) => e.stopPropagation()} // prevent toggle
                              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', width: '100%' }}
                            >
                              <textarea
                                className="form-control"
                                rows={2}
                                placeholder={`Envoyer un message privé à @${contactPseudo}...`}
                                {...registerMsg('message', { required: true })}
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={msgLoading}>
                                  {msgLoading ? '...' : 'Envoyer →'}
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Quick links & payments history */}
              <section className="dashboard-section card animate-fade-up">
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>📋 Accès rapide</h2>
                <div className="quick-links" style={{ marginBottom: '1.25rem' }}>
                  <Link to="/events/create" className="quick-link-card">
                    <span className="quick-link-icon">🎉</span>
                    <div>
                      <strong>Créer un événement</strong>
                      <p className="text-muted text-sm">Organisez une rencontre</p>
                    </div>
                  </Link>
                  <Link to="/events" className="quick-link-card">
                    <span className="quick-link-icon">📅</span>
                    <div>
                      <strong>Tous les événements</strong>
                      <p className="text-muted text-sm">Explorer et s'inscrire</p>
                    </div>
                  </Link>
                </div>

                {payments.length > 0 && (
                  <>
                    <hr className="divider" />
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>💳 Historique paiements</h3>
                    <div className="payments-list">
                      {payments.map((p) => (
                        <div className="payment-item" key={p.id}>
                          <span>{p.label || 'Paiement'}</span>
                          <span className="badge badge-success">{p.amount} €</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>

              {/* Mes finances */}
              <section className="dashboard-section card animate-fade-up">
                <h2 className="section-title" style={{ fontSize: '1.3rem' }}>💰 Mes finances</h2>

                {earnings ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted">Argent généré</span>
                      <strong style={{ fontSize: '1.25rem' }}>{earnings.total || 0} €</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted text-sm">Inscriptions payantes</span>
                      <span className="badge badge-primary">{earnings.paid_count || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-muted text-sm">Commission prélevée (10 %)</span>
                      <span className="badge badge-warning">-{earnings.fees || 0} €</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-accent btn-full"
                      onClick={() => dispatch(requestWithdrawal())}
                      disabled={userLoading || (earnings.total || 0) <= 0}
                    >
                      {userLoading ? '...' : '💸 Demander le paiement'}
                    </button>
                  </div>
                ) : (
                  <div className="empty-state" style={{ paddingBlock: '1rem' }}>
                    <p className="text-muted text-sm">Aucune donnée financière disponible.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
