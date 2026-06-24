import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  fetchContacts,
  fetchUsers,
  sendContactRequest,
  acceptContactRequest,
  clearContactStatus,
} from '../features/contacts/contactsSlice';
import { sendMessage, clearMessageStatus } from '../features/messages/messagesSlice';
import './ContactsPage.css';

export default function ContactsPage() {
  const dispatch = useDispatch();
  const { contacts, users, isLoading, success: contactSuccess, error: contactError } = useSelector((s) => s.contacts);
  const { success: msgSuccess, error: msgError, isLoading: msgLoading } = useSelector((s) => s.messages);
  const { user } = useSelector((s) => s.auth);

  const [tab, setTab] = useState('contacts');
  const [activeMsgContact, setActiveMsgContact] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const pendingContacts = Array.isArray(contacts) ? contacts.filter((c) => c.status === 'pending' && c.receiver_id === user?.id) : [];
  const acceptedContacts = Array.isArray(contacts) ? contacts.filter((c) => c.status === 'accepted') : [];

  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (contactSuccess || msgSuccess) {
      setTimeout(() => {
        dispatch(clearContactStatus());
        dispatch(clearMessageStatus());
      }, 3000);
    }
  }, [contactSuccess, msgSuccess, dispatch]);

  const onSendMessage = (data) => {
    if (!activeMsgContact) return;
    dispatch(sendMessage({ receiver_id: activeMsgContact.id, message: data.message }));
    reset();
  };

  // Exclude already contacted users from addable list
  const contactedIds = Array.isArray(contacts)
    ? contacts.flatMap((c) => [c.requester_id, c.receiver_id])
    : [];
  const addableUsers = Array.isArray(users) ? users.filter(
    (u) => u.id !== user?.id && !contactedIds.includes(u.id)
  ) : [];

  return (
    <div className="contacts-page page-wrapper">
      <div className="container">
        <div className="contacts-header">
          <h1>Contacts</h1>
          <p className="text-muted">Gérez votre réseau professionnel</p>
        </div>

        {/* Status messages */}
        {contactSuccess && <div className="alert alert-success">{contactSuccess}</div>}
        {contactError && <div className="alert alert-danger">{contactError}</div>}
        {msgSuccess && <div className="alert alert-success">{msgSuccess}</div>}
        {msgError && <div className="alert alert-danger">{msgError}</div>}

        {/* Pending requests */}
        {pendingContacts.length > 0 && (
          <div className="pending-section card animate-fade-up">
            <h3>Demandes en attente ({pendingContacts.length})</h3>
            <div className="pending-list">
              {pendingContacts.map((c) => (
                <div className="pending-item" key={c.id}>
                  <div className="flex items-center gap-2">
                    <div className="avatar-placeholder avatar-sm">
                      {c.requester_pseudo?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <strong>@{c.requester_pseudo}</strong>
                    </div>
                  </div>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      dispatch(acceptContactRequest(c.id)).then(() => {
                        dispatch(fetchContacts());
                      });
                    }}
                  >
                    Accepter
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab-btn ${tab === 'contacts' ? 'active' : ''}`} onClick={() => setTab('contacts')}>
            Mes contacts ({acceptedContacts.length})
          </button>
          <button className={`tab-btn ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
            Ajouter un contact
          </button>
        </div>

        {tab === 'contacts' && (
          <div className="contacts-grid animate-fade-up">
            {acceptedContacts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">C</div>
                <h3>Aucun contact pour l'instant</h3>
                <p>Ajoutez des membres à votre réseau depuis l'onglet "Ajouter un contact".</p>
              </div>
            ) : (
              acceptedContacts.map((contact) => {
                const isRequester = contact.requester_id === user?.id;
                const contactPseudo = isRequester ? contact.receiver_pseudo : contact.requester_pseudo;
                const contactUserId = isRequester ? contact.receiver_id : contact.requester_id;
                const isActive = activeMsgContact?.id === contactUserId;
                return (
                  <div className={`contact-card card ${isActive ? 'contact-card-active' : ''}`} key={contact.id}>
                    <div className="contact-info">
                      <div className="avatar-placeholder avatar-md">
                        {contactPseudo?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <strong>@{contactPseudo}</strong>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveMsgContact(isActive ? null : { id: contactUserId, pseudo: contactPseudo })}
                    >
                      {isActive ? 'Fermer' : 'Message'}
                    </button>

                    {isActive && (
                      <form onSubmit={handleSubmit(onSendMessage)} className="inline-msg-form">
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder={`Écrire à @${contactPseudo}...`}
                          {...register('message', { required: true })}
                        />
                        <button type="submit" className="btn btn-primary btn-sm" disabled={msgLoading}>
                          {msgLoading ? '...' : 'Envoyer →'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'add' && (
          <div className="add-contacts animate-fade-up">
            {isLoading ? <div className="spinner" /> : addableUsers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">M</div>
                <h3>Aucun membre disponible</h3>
                <p>Vous êtes déjà en contact avec tous les membres !</p>
              </div>
            ) : (
              <div className="users-list">
                {addableUsers.map((u) => (
                  <div className="user-row card" key={u.id}>
                    <div className="flex items-center gap-2">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.pseudo} className="avatar avatar-md" />
                      ) : (
                        <div className="avatar-placeholder avatar-md">
                          {u.pseudo?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <strong>{u.firstname} {u.lastname}</strong>
                        <p className="text-muted text-sm">@{u.pseudo} · {u.city}</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        dispatch(sendContactRequest(u.id)).then(() => {
                          dispatch(fetchContacts());
                        });
                      }}
                    >
                      + Ajouter
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
