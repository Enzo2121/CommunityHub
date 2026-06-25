import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMe } from '../features/auth/authSlice';
import { fetchSkills, clearSkillStatus } from '../features/skills/skillsSlice';
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
  likeOrganizer,
  clearUserStatus,
} from '../features/user/userSlice';
import { useForm } from 'react-hook-form';
import './DashboardPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function initials(name) {
  return name?.[0]?.toUpperCase() || '?';
}

function isPast(dateStr) {
  return dateStr && new Date(dateStr) < new Date();
}

function DashStat({ value, label }) {
  return (
    <div className="dash-stat-card">
      <span className="dash-stat-value">{value}</span>
      <span className="dash-stat-label">{label}</span>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="dash-empty">
      <p className="dash-empty-title">{title}</p>
      {subtitle && <p className="dash-empty-subtitle">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { skills, success: skillSuccess, error: skillError } = useSelector((s) => s.skills);
  const { payments } = useSelector((s) => s.payments);
  const { contacts, users, success: contactSuccess, error: contactError } = useSelector((s) => s.contacts);
  const { received, success: msgSuccess, error: msgError, isLoading: msgLoading } = useSelector((s) => s.messages);
  const {
    registrations,
    myEvents,
    isLoading: userLoading,
    success: userSuccess,
    error: userError,
  } = useSelector((s) => s.user);

  const isPremium = user?.is_premium || user?.premium === 1 || user?.premium === true;

  const mySkills = Array.isArray(skills) ? skills.filter((s) => s.user_id === user?.id || s.user?.id === user?.id) : [];
  const pendingContacts = Array.isArray(contacts) ? contacts.filter((c) => c.status === 'pending' && c.receiver_id === user?.id) : [];
  const acceptedContacts = Array.isArray(contacts) ? contacts.filter((c) => c.status === 'accepted') : [];

  const contactedIds = Array.isArray(contacts) ? contacts.flatMap((c) => [c.requester_id, c.receiver_id]) : [];
  const addableUsers = Array.isArray(users)
    ? users.filter((u) => u.id !== user?.id && !contactedIds.includes(u.id))
    : [];

  const [eventTab, setEventTab] = useState('registrations');
  const [activeMsgContact, setActiveMsgContact] = useState(null);
  const [selectedAddUser, setSelectedAddUser] = useState('');

  const { register: registerMsg, handleSubmit: handleMsgSubmit, reset: resetMsgForm } = useForm();

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchPayments());
    if (isPremium) {
      dispatch(fetchSkills());
      dispatch(fetchContacts());
      dispatch(fetchUsers());
      dispatch(fetchReceivedMessages());
      dispatch(fetchMyRegistrations());
      dispatch(fetchMyEvents());
    }
  }, [dispatch, isPremium]);

  useEffect(() => {
    if (skillSuccess) {
      setTimeout(() => dispatch(clearSkillStatus()), 3000);
    }
  }, [skillSuccess, dispatch]);

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
    dispatch(sendMessage({ receiver_id: activeMsgContact.id, message: data.message })).then(() => {
      dispatch(fetchReceivedMessages());
    });
    resetMsgForm();
  };

  return (
    <div className="dashboard-page-modern page-wrapper">
      <div className="container">
        {/* Header */}
        <header className="dash-header card">
          <div className="dash-header-user">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.pseudo} className="dash-avatar-img" />
            ) : (
              <div className="dash-avatar">{initials(user?.pseudo)}</div>
            )}
            <div>
              <h1>{user?.firstname} {user?.lastname}</h1>
              <p className="text-muted">@{user?.pseudo}</p>
            </div>
          </div>
          <div className="dash-header-actions">
            {isPremium ? (
              <span className="dash-badge-premium">Premium</span>
            ) : (
              <Link to="/premium" className="btn btn-primary btn-sm">Passer Premium</Link>
            )}
            <Link to="/profile" className="btn btn-ghost btn-sm">Modifier le profil</Link>
          </div>
        </header>

        {!isPremium && (
          <div className="dash-premium-cta card">
            <div>
              <h2>Passez Premium</h2>
              <p className="text-muted text-sm">Accédez aux événements, compétences, contacts et messages privés.</p>
            </div>
            <Link to="/premium" className="btn btn-primary">Passer Premium — 19,99 €</Link>
          </div>
        )}

        {isPremium && (
          <>
            {/* Stats */}
            <div className="dash-stats">
              <DashStat value={registrations.length} label="Inscriptions" />
              <DashStat value={myEvents.length} label="Événements créés" />
              <DashStat value={mySkills.length} label="Compétences" />
              <DashStat value={acceptedContacts.length} label="Contacts" />
            </div>

            {/* Main grid */}
            <div className="dash-grid">
              <div className="dash-main-col">
                {/* Events */}
                <section className="dash-section card">
                  <div className="dash-section-header">
                    <h2>Mes événements</h2>
                    <Link to="/events/create" className="btn btn-primary btn-sm">Créer</Link>
                  </div>

                  {userSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{userSuccess}</div>}
                  {userError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{userError}</div>}

                  <div className="dash-tabs">
                    <button className={eventTab === 'registrations' ? 'active' : ''} onClick={() => setEventTab('registrations')}>
                      Mes inscriptions
                    </button>
                    <button className={eventTab === 'organized' ? 'active' : ''} onClick={() => setEventTab('organized')}>
                      Mes événements
                    </button>
                  </div>

                  {eventTab === 'registrations' ? (
                    registrations.length === 0 ? (
                      <EmptyState title="Aucune inscription" subtitle="Vous n'êtes inscrit à aucun événement." />
                    ) : (
                      <div className="dash-list">
                        {registrations.map((reg) => {
                          const evt = reg.event || reg;
                          return (
                            <div className="dash-list-item" key={reg.id || evt.id}>
                              <div className="dash-list-body">
                                <Link to={`/events/${evt.id}`} className="dash-list-title">{evt.name}</Link>
                                <span className="dash-list-meta">{formatDate(evt.start_date)}</span>
                              </div>
                              <span className={`dash-status ${isPast(evt.end_date) ? 'muted' : 'active'}`}>
                                {isPast(evt.end_date) ? 'Passé' : 'À venir'}
                              </span>
                              {isPast(evt.end_date) && evt.organizer_id && evt.organizer_id !== user?.id && (
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => dispatch(likeOrganizer(evt.organizer_id))}
                                  disabled={userLoading}
                                >
                                  Apprécier
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : myEvents.length === 0 ? (
                    <EmptyState title="Aucun événement créé" subtitle="Créez votre premier événement pour la communauté." />
                  ) : (
                    <div className="dash-list">
                      {myEvents.map((evt) => (
                        <div className="dash-list-item" key={evt.id}>
                          <div className="dash-list-body">
                            <Link to={`/events/${evt.id}`} className="dash-list-title">{evt.name}</Link>
                            <span className="dash-list-meta">{formatDate(evt.start_date)} · {evt.participants_count || 0} participant(s)</span>
                          </div>
                          <span className={`dash-status ${isPast(evt.end_date) ? 'muted' : 'active'}`}>
                            {isPast(evt.end_date) ? 'Passé' : 'À venir'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Skills */}
                <section className="dash-section card">
                  <div className="dash-section-header">
                    <h2>Mes compétences</h2>
                    <Link to="/my-skills" className="btn btn-ghost btn-sm">Gérer</Link>
                  </div>
                  {skillSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{skillSuccess}</div>}
                  {skillError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{skillError}</div>}

                  {mySkills.length === 0 ? (
                    <EmptyState title="Aucune compétence" subtitle="Ajoutez vos expertises depuis la page Mes compétences." />
                  ) : (
                    <div className="dash-list">
                      {mySkills.map((skill) => (
                        <div className="dash-list-item" key={skill.id}>
                          <div className="dash-list-body">
                            <span className="dash-list-title">{skill.title}</span>
                            <span className="dash-list-meta">{skill.description}</span>
                          </div>
                          <span className="dash-price">{skill.daily_price} €/j</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="dash-side-col">
                {/* Contacts */}
                <section className="dash-section card">
                  <div className="dash-section-header">
                    <h2>Contacts</h2>
                  </div>

                  {contactSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{contactSuccess}</div>}
                  {contactError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{contactError}</div>}

                  <form onSubmit={onSendContactRequest} className="dash-add-contact">
                    <select
                      className="form-control"
                      value={selectedAddUser}
                      onChange={(e) => setSelectedAddUser(e.target.value)}
                    >
                      <option value="">Ajouter un membre...</option>
                      {addableUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.firstname} {u.lastname} (@{u.pseudo})</option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!selectedAddUser}>Ajouter</button>
                  </form>

                  {pendingContacts.length > 0 && (
                    <div className="dash-pending">
                      <h3>Demandes en attente</h3>
                      {pendingContacts.map((c) => (
                        <div className="dash-pending-item" key={c.id}>
                          <span>@{c.requester_pseudo}</span>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => dispatch(acceptContactRequest(c.id)).then(() => dispatch(fetchContacts()))}
                          >
                            Accepter
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {acceptedContacts.length === 0 ? (
                    <EmptyState title="Aucun contact" subtitle="Votre réseau apparaîtra ici." />
                  ) : (
                    <div className="dash-contacts">
                      {acceptedContacts.map((contact) => {
                        const isRequester = contact.requester_id === user?.id;
                        const contactPseudo = isRequester ? contact.receiver_pseudo : contact.requester_pseudo;
                        const contactUserId = isRequester ? contact.receiver_id : contact.requester_id;
                        const isActive = activeMsgContact?.id === contactUserId;
                        return (
                          <div key={contact.id} className="dash-contact">
                            <div
                              className="dash-contact-row"
                              onClick={() => setActiveMsgContact(isActive ? null : { id: contactUserId, pseudo: contactPseudo })}
                            >
                              <div className="dash-contact-name">@{contactPseudo}</div>
                              <span className="dash-contact-action">{isActive ? 'Fermer' : 'Message'}</span>
                            </div>
                            {isActive && (
                              <form
                                onSubmit={handleMsgSubmit(onSendPrivateMessage)}
                                onClick={(e) => e.stopPropagation()}
                                className="dash-contact-form"
                              >
                                <textarea
                                  className="form-control"
                                  rows={2}
                                  placeholder={`Message à @${contactPseudo}`}
                                  {...registerMsg('message', { required: true })}
                                />
                                <button type="submit" className="btn btn-primary btn-sm" disabled={msgLoading}>Envoyer</button>
                              </form>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Messages */}
                <section className="dash-section card">
                  <div className="dash-section-header">
                    <h2>Messages récents</h2>
                    <Link to="/messages" className="btn btn-ghost btn-sm">Voir tout</Link>
                  </div>
                  {msgSuccess && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{msgSuccess}</div>}
                  {msgError && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{msgError}</div>}

                  {received.length === 0 ? (
                    <EmptyState title="Aucun message" subtitle="Vos messages reçus apparaîtront ici." />
                  ) : (
                    <div className="dash-messages">
                      {received.slice(0, 5).map((msg) => (
                        <div className="dash-message" key={msg.id}>
                          <div className="dash-message-header">
                            <span className="dash-message-sender">@{msg.sender_pseudo}</span>
                            <span className="dash-message-time">{formatDate(msg.created_at || msg.date)}</span>
                          </div>
                          <p className="dash-message-text">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Payments history */}
                {payments.length > 0 && (
                  <section className="dash-section card">
                    <div className="dash-section-header">
                      <h2>Paiements</h2>
                    </div>
                    <div className="dash-list">
                      {payments.map((p) => (
                        <div className="dash-list-item" key={p.id}>
                          <div className="dash-list-body">
                            <span className="dash-list-title">{p.label || 'Paiement'}</span>
                          </div>
                          <span className="dash-price">{p.amount} €</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
