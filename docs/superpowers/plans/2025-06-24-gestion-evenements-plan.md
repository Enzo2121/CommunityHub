# Plan d'implémentation – Gestion des événements

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Compléter le module événements côté frontend (filtre date, validation création, gestion capacité/inscription/commission, modération commentaires).

**Architecture:** On enrichit `eventsSlice` avec un thunk de modération. On complète les pages existantes avec des validations client et des affichages conditionnels. Pas de refactor architectural majeur.

**Tech Stack:** React 19, Vite, Redux Toolkit, React Router 7, Tailwind 4.

---

## Task 1 : Ajouter la modération dans `eventsSlice.js`

**Files:**
- Modify: `src/features/events/eventsSlice.js`

- [ ] **Step 1: Ajouter le thunk `moderateEventMessage`**

```js
export const moderateEventMessage = createAsyncThunk(
  'events/moderateMessage',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/events/moderate-message.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
```

- [ ] **Step 2: Gérer le résultat dans `extraReducers`**

Ajouter après `postEventMessage.fulfilled` :

```js
.addCase(moderateEventMessage.fulfilled, (state, action) => {
  const updated = action.payload?.message || action.payload;
  if (state.currentEvent && updated && updated.id) {
    const idx = state.currentEvent.messages.findIndex((m) => m.id === updated.id);
    if (idx !== -1) {
      state.currentEvent.messages[idx] = { ...state.currentEvent.messages[idx], ...updated };
    }
  }
})
.addCase(moderateEventMessage.rejected, rejected)
```

- [ ] **Step 3: Commit**

```bash
git add src/features/events/eventsSlice.js
git commit -m "feat(events): add moderate message thunk"
```

---

## Task 2 : Filtre `date_filter` sur `EventsPage.jsx`

**Files:**
- Modify: `src/pages/EventsPage.jsx`

- [ ] **Step 1: Ajouter `date_filter` aux états et réinitialisation**

```js
const [filters, setFilters] = useState({ q: '', category_id: '', type: '', price_type: '', date_filter: '' });
```

Et dans le bouton reset :

```js
setFilters({ q: '', category_id: '', type: '', price_type: '', date_filter: '' });
```

- [ ] **Step 2: Ajouter le select dans l'UI**

Après le select `price_type` :

```jsx
<select
  className="form-control filter-select"
  value={filters.date_filter}
  onChange={(e) => handleFilter('date_filter', e.target.value)}
>
  <option value="">Toutes les dates</option>
  <option value="upcoming">📅 À venir</option>
  <option value="past">⌛ Passés</option>
</select>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/EventsPage.jsx
git commit -m "feat(events): add date_filter to events listing"
```

---

## Task 3 : Page détail – capacité, commission, modération

**Files:**
- Modify: `src/pages/EventDetailsPage.jsx`

- [ ] **Step 1: Importer `moderateEventMessage`**

```js
import {
  fetchEventById,
  registerToEvent,
  postEventMessage,
  moderateEventMessage,
  clearEventStatus,
} from '../features/events/eventsSlice';
```

- [ ] **Step 2: Calculer les états utiles**

Après `const isPaid = ...` :

```js
const isOrganizer = user && event.organizer && user.id === event.organizer.id;
const isFull = event.max_participants != null && event.participants_count >= event.max_participants;
const now = new Date();
const isPast = event.end_date && new Date(event.end_date) < now;
```

- [ ] **Step 3: Adapter l'affichage du bouton d'inscription**

Remplacer le bloc du bouton d'inscription par :

```jsx
{isFull ? (
  <div className="alert alert-warning text-sm">⚠️ Cet événement est complet.</div>
) : isPast ? (
  <div className="alert alert-muted text-sm">Cet événement est terminé.</div>
) : (
  <>
    {isPaid && (
      <>
        <select ...> ... </select>
        <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
          Une commission de 10 % est prélevée sur chaque inscription payante.
        </p>
      </>
    )}
    <button
      className="btn btn-primary btn-full"
      onClick={handleRegister}
      disabled={isLoading}
    >
      {isLoading ? '...' : "✅ S'inscrire à l'événement"}
    </button>
  </>
)}
```

- [ ] **Step 4: Ajouter la modération aux commentaires**

Dans le rendu des messages :

```jsx
{event.messages.map((msg, i) => {
  const isPending = msg.status === 'pending_deletion';
  const visibleToOthers = !isPending;
  return (
    <div className="comment-item" key={msg.id || i}>
      <div className="avatar-placeholder avatar-sm">
        {msg.user?.pseudo?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="comment-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{msg.user?.pseudo || 'Anonyme'}</strong>
          {isOrganizer && !isPending && (
            <button
              className="btn btn-danger btn-xs"
              onClick={() => dispatch(moderateEventMessage({ message_id: msg.id, action: 'request_delete' }))}
            >
              Modérer
            </button>
          )}
        </div>
        {isPending ? (
          <p className="text-muted text-sm" style={{ fontStyle: 'italic' }}>
            🕓 Ce message est en attente de validation admin.
          </p>
        ) : (
          <p>{msg.message}</p>
        )}
      </div>
    </div>
  );
})}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/EventDetailsPage.jsx
git commit -m "feat(events): capacity check, commission info and message moderation"
```

---

## Task 4 : Validation dates dans `CreateEventPage.jsx`

**Files:**
- Modify: `src/pages/CreateEventPage.jsx`

- [ ] **Step 1: Ajouter la validation dans `onSubmit`**

```js
const onSubmit = (data) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  if (end <= start) {
    alert('La date de fin doit être postérieure à la date de début.');
    return;
  }
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (+startDay === +endDay) {
    alert('La date de fin ne peut pas être le même jour que la date de début.');
    return;
  }

  const payload = {
    ...data,
    event_category_id: parseInt(data.event_category_id),
    price: data.price_type === 'gratuit' ? 0 : parseFloat(data.price),
    max_participants: parseInt(data.max_participants),
  };
  dispatch(createEvent(payload));
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CreateEventPage.jsx
git commit -m "feat(events): validate start/end dates on event creation"
```

---

## Task 5 : Vérification finale

**Files:** aucun

- [ ] **Step 1: Linter**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit si corrections**

```bash
git add .
git commit -m "chore(events): lint and build fixes"
```

---

## Spec coverage check

- Création événement premium : Task 4.
- Filtre `date_filter` upcoming/past : Task 2.
- Page détail inscription premium + capacité + commission Stripe : Task 3.
- Commentaires + modération organisateur : Task 1 + Task 3.
