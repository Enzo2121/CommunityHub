import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, fetchCategories } from '../features/events/eventsSlice';
import EventCard from '../components/events/EventCard';
import './EventsPage.css';

export default function EventsPage() {
  const dispatch = useDispatch();
  const { events, categories, isLoading } = useSelector((s) => s.events);

  const [filters, setFilters] = useState({ q: '', category_id: '', type: '', price_type: '', date_filter: '' });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Remove empty values before fetching
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '')
    );
    dispatch(fetchEvents(activeFilters));
  }, [dispatch, filters]);

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="events-page page-wrapper">
      <div className="container">
        {/* Page header */}
        <div className="events-header animate-fade-up">
          <div>
            <h1>Événements</h1>
            <p className="text-muted">Découvrez les événements de la communauté</p>
          </div>
          <span className="badge badge-muted">{events.length} événement{events.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Filters */}
        <div className="events-filters card animate-fade-up">
          <div className="filter-search">
            <span className="filter-search-icon">🔍</span>
            <input
              className="form-control filter-input"
              placeholder="Rechercher un événement..."
              value={filters.q}
              onChange={(e) => handleFilter('q', e.target.value)}
            />
          </div>

          <select
            className="form-control filter-select"
            value={filters.category_id}
            onChange={(e) => handleFilter('category_id', e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className="form-control filter-select"
            value={filters.type}
            onChange={(e) => handleFilter('type', e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="presentiel">📍 Présentiel</option>
            <option value="distanciel">🌐 Distanciel</option>
          </select>

          <select
            className="form-control filter-select"
            value={filters.price_type}
            onChange={(e) => handleFilter('price_type', e.target.value)}
          >
            <option value="">Tous les tarifs</option>
            <option value="gratuit">🆓 Gratuit</option>
            <option value="payant">💰 Payant</option>
          </select>

          <select
            className="form-control filter-select"
            value={filters.date_filter}
            onChange={(e) => handleFilter('date_filter', e.target.value)}
          >
            <option value="">Toutes les dates</option>
            <option value="upcoming">📅 À venir</option>
            <option value="past">⌛ Passés</option>
          </select>

          {Object.values(filters).some((v) => v !== '') && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setFilters({ q: '', category_id: '', type: '', price_type: '', date_filter: '' })}
            >
              ✕ Réinitialiser
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="spinner" style={{ marginTop: '3rem' }} />
        ) : events.length === 0 ? (
          <div className="empty-state animate-fade-up">
            <div className="empty-state-icon">🎉</div>
            <h3>Aucun événement trouvé</h3>
            <p>Essayez de modifier vos filtres ou revenez plus tard.</p>
          </div>
        ) : (
          <div className="events-grid animate-fade-up">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
