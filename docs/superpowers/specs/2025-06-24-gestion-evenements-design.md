# Design – Gestion des événements (frontend)

## Contexte
Projet **CommunityHub** : React 19 + Vite + Redux Toolkit + React Router 7 + Tailwind 4. Le backend PHP existe déjà ailleurs ; le frontend consomme ses endpoints via `src/services/api.js`.

## Objectif
Compléter le module "Gestion des événements" côté frontend pour couvrir :
1. Création d'événement (premium) avec validation des dates.
2. Liste des événements avec filtres, dont `date_filter=upcoming|past`.
3. Page détail : inscription, gestion capacité, paiement Stripe, commentaires et modération par l'organisateur.

## Périmètre
- `src/features/events/eventsSlice.js`
- `src/pages/EventsPage.jsx`
- `src/pages/EventDetailsPage.jsx`
- `src/pages/CreateEventPage.jsx`
- Création de petits composants si nécessaire pour alléger les pages.

Hors périmètre : dashboard utilisateur, édition de profil, historique paiements complet, demande de reversement organisateur.

## Architecture
On enrichit le slice `events` avec les nouveaux thunks nécessaires. Les pages existantes sont complétées sans refactor majeur. Les validations métier (dates, capacité) sont faites côté client en complément du backend.

## Endpoints attendus (backend existant)
- `GET /events/index.php?date_filter=upcoming|past&...`
- `GET /events/show.php?id=...`
- `POST /events/store.php`
- `POST /events/register.php` (payload `{ event_id, payment_method }`)
- `POST /events/message.php` (payload `{ event_id, message }`)
- `POST /events/moderate-message.php` (payload `{ message_id, action: 'request_delete' }`)
- `GET /categories/index.php`

## Détails fonctionnels

### Création d'événement (`CreateEventPage.jsx`)
- Formulaire déjà en place.
- Ajouter validation `end_date` > `start_date` et non le même jour calendaire.
- Si `price_type === 'gratuit'`, envoyer `price: 0`.
- Image optionnelle (URL).

### Liste des événements (`EventsPage.jsx`)
- Filtres existants conservés : recherche, catégorie, type, tarif.
- Ajouter un filtre `date_filter` : "Tous / À venir / Passés".
- Passer ce filtre à `fetchEvents`.

### Page détail (`EventDetailsPage.jsx`)
- Affichage existant conservé.
- **Capacité** : si `participants_count >= max_participants`, remplacer le bouton d'inscription par "Événement complet".
- **Inscription** : réservée aux utilisateurs premium. Si payant, passage par Stripe via `payment_method: 'stripe'`.
- **Commission** : afficher un texte informatif sur la taxe de 10 % prélevée par la plateforme.
- **Commentaires** : tout utilisateur connecté peut poster.
- **Modération** : si l'utilisateur connecté est l'organisateur (`user.id === event.organizer.id`), afficher un bouton "Demander la suppression" sur chaque message. Le message est alors marqué `status === 'pending_deletion'` et n'est plus visible pour les autres, mais l'organisateur voit un indicateur "En attente de validation admin".

## Tests
- Vérifier manuellement les parcours : création, filtre date, inscription gratuite, inscription payante, commentaire, modération.
- Vérifier que `npm run lint` et `npm run build` passent.
