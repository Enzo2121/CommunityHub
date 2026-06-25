import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  fetchReceivedMessages,
  fetchSentMessages,
  sendMessage,
} from '../features/messages/messagesSlice';
import './MessagesPage.css';

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function getInitials(name) {
  return name?.[0]?.toUpperCase() || '?';
}

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { received, sent, isLoading } = useSelector((s) => s.messages);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchReceivedMessages());
    dispatch(fetchSentMessages());
  }, [dispatch]);

  const conversations = useMemo(() => {
    const map = new Map();

    const addMessage = (msg, otherId, otherPseudo) => {
      if (!otherId) return;
      if (!map.has(otherId)) {
        map.set(otherId, {
          contact: {
            id: otherId,
            pseudo: otherPseudo || 'Utilisateur',
            avatar: msg.contact_avatar || null,
            city: msg.contact_city || null,
            firstname: msg.contact_firstname || null,
            lastname: msg.contact_lastname || null,
          },
          messages: [],
        });
      }
      map.get(otherId).messages.push(msg);
    };

    received.forEach((msg) => {
      const isFromMe = msg.sender_id === user?.id;
      const otherId = isFromMe ? msg.receiver_id : msg.sender_id;
      const otherPseudo = isFromMe ? msg.receiver_pseudo : msg.sender_pseudo;
      addMessage({ ...msg, _type: 'received' }, otherId, otherPseudo);
    });

    sent.forEach((msg) => {
      const isToMe = msg.receiver_id === user?.id;
      const otherId = isToMe ? msg.sender_id : msg.receiver_id;
      const otherPseudo = isToMe ? msg.sender_pseudo : msg.receiver_pseudo;
      addMessage({ ...msg, _type: 'sent' }, otherId, otherPseudo);
    });

    return Array.from(map.values())
      .map((conv) => ({
        ...conv,
        messages: conv.messages.sort(
          (a, b) => new Date(a.created_at || a.date) - new Date(b.created_at || b.date)
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.messages[b.messages.length - 1]?.created_at || b.messages[b.messages.length - 1]?.date || 0) -
          new Date(a.messages[a.messages.length - 1]?.created_at || a.messages[a.messages.length - 1]?.date || 0)
      );
  }, [received, sent, user?.id]);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].contact.id);
    }
  }, [conversations, selectedId]);

  const selectedConversation = conversations.find((c) => c.contact.id === selectedId);

  const filteredConversations = conversations.filter((c) =>
    c.contact.pseudo?.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = (data) => {
    if (!selectedId || !data.message.trim()) return;
    dispatch(sendMessage({ receiver_id: selectedId, message: data.message.trim() })).then(() => {
      dispatch(fetchReceivedMessages());
      dispatch(fetchSentMessages());
      reset();
    });
  };

  return (
    <div className="messages-page-modern page-wrapper">
      <div className="messages-layout">
        {/* Sidebar */}
        <aside className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h2>Messages</h2>
            <div className="messages-search">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher une conversation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="conversations-list">
            {isLoading && filteredConversations.length === 0 ? (
              <div className="spinner" />
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <p className="text-muted text-sm">Aucune conversation.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const last = conv.messages[conv.messages.length - 1];
                const isActive = conv.contact.id === selectedId;
                return (
                  <button
                    key={conv.contact.id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedId(conv.contact.id)}
                  >
                    <div className="conversation-avatar">
                      {conv.contact.avatar ? (
                        <img src={conv.contact.avatar} alt={conv.contact.pseudo} />
                      ) : (
                        <span>{getInitials(conv.contact.pseudo)}</span>
                      )}
                    </div>
                    <div className="conversation-body">
                      <div className="conversation-top">
                        <strong className="conversation-name">{conv.contact.pseudo}</strong>
                        <span className="conversation-time">{formatTime(last?.created_at || last?.date)}</span>
                      </div>
                      <p className="conversation-preview">{last?.message}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat */}
        <main className="messages-chat">
          {selectedConversation ? (
            <>
              <div className="messages-chat-header">
                <div className="messages-chat-header-info">
                  <div className="messages-chat-avatar">
                    {selectedConversation.contact.avatar ? (
                      <img src={selectedConversation.contact.avatar} alt={selectedConversation.contact.pseudo} />
                    ) : (
                      <span>{getInitials(selectedConversation.contact.pseudo)}</span>
                    )}
                  </div>
                  <div>
                    <strong>{selectedConversation.contact.pseudo}</strong>
                    <p className="text-muted text-xs">En ligne</p>
                  </div>
                </div>
              </div>

              <div className="messages-chat-body">
                {selectedConversation.messages.map((msg, idx) => {
                  const isMe = msg.sender_id === user?.id || msg._type === 'sent';
                  const showDate =
                    idx === 0 ||
                    formatDate(msg.created_at || msg.date) !==
                      formatDate(selectedConversation.messages[idx - 1].created_at || selectedConversation.messages[idx - 1].date);

                  return (
                    <div key={msg.id || idx}>
                      {showDate && (
                        <div className="message-date-separator">
                          <span>{formatDate(msg.created_at || msg.date)}</span>
                        </div>
                      )}
                      <div className={`message-bubble-row ${isMe ? 'me' : 'other'}`}>
                        <div className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                          <p>{msg.message}</p>
                          <span className="message-bubble-time">{formatTime(msg.created_at || msg.date)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className="messages-chat-input" onSubmit={handleSubmit(onSubmit)}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ecrire un message..."
                  {...register('message', { required: true })}
                />
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <p className="text-muted">Selectionnez une conversation pour commencer.</p>
            </div>
          )}
        </main>

        {/* Profile */}
        <aside className="messages-profile">
          {selectedConversation ? (
            <div className="messages-profile-card">
              <div className="messages-profile-avatar">
                {selectedConversation.contact.avatar ? (
                  <img src={selectedConversation.contact.avatar} alt={selectedConversation.contact.pseudo} />
                ) : (
                  <span>{getInitials(selectedConversation.contact.pseudo)}</span>
                )}
              </div>
              <h3>{selectedConversation.contact.pseudo}</h3>
              {(selectedConversation.contact.firstname || selectedConversation.contact.lastname) && (
                <p className="text-muted text-sm">
                  {selectedConversation.contact.firstname} {selectedConversation.contact.lastname}
                </p>
              )}
              {selectedConversation.contact.city && (
                <p className="text-muted text-sm">{selectedConversation.contact.city}</p>
              )}
              <hr className="divider" />
              <div className="messages-profile-stats">
                <div>
                  <strong>{selectedConversation.messages.length}</strong>
                  <span className="text-muted text-xs">Messages</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p className="text-muted text-sm">Profil du contact</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
