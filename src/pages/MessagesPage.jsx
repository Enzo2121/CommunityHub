import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReceivedMessages,
  fetchSentMessages,
} from '../features/messages/messagesSlice';
import './MessagesPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { received, sent, isLoading } = useSelector((s) => s.messages);
  const [tab, setTab] = useState('received');

  useEffect(() => {
    dispatch(fetchReceivedMessages());
    dispatch(fetchSentMessages());
  }, [dispatch]);

  const messages = tab === 'received' ? received : sent;

  return (
    <div className="messages-page page-wrapper">
      <div className="container">
        <div className="messages-header">
          <h1>Messages privés</h1>
          <p className="text-muted">Vos conversations avec vos contacts</p>
        </div>

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab-btn ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
            Reçus ({received.length})
          </button>
          <button className={`tab-btn ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
            Envoyés ({sent.length})
          </button>
        </div>

        {isLoading ? (
          <div className="spinner" />
        ) : messages.length === 0 ? (
          <div className="empty-state animate-fade-up">
            <div className="empty-state-icon">{tab === 'received' ? 'R' : 'E'}</div>
            <h3>Aucun message {tab === 'received' ? 'reçu' : 'envoyé'}</h3>
            <p>Vos {tab === 'received' ? 'messages reçus' : 'messages envoyés'} apparaîtront ici.</p>
          </div>
        ) : (
          <div className="messages-list animate-fade-up">
            {messages.map((msg) => {
              const displayPseudo = tab === 'received' ? msg.sender_pseudo : msg.receiver_pseudo;
              return (
                <div className="message-item card" key={msg.id}>
                  <div className="message-avatar-col">
                    <div className="avatar-placeholder avatar-md">
                      {displayPseudo?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                  <div className="message-body">
                    <div className="message-meta">
                      <strong>
                        {tab === 'received'
                          ? `@${msg.sender_pseudo}`
                          : `À : @${msg.receiver_pseudo}`
                        }
                      </strong>
                      <span className="text-muted text-xs">{formatDate(msg.created_at || msg.date)}</span>
                    </div>
                    <p className="message-text">{msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
