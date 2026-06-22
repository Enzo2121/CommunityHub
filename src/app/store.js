import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventsSlice';
import contactsReducer from '../features/contacts/contactsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import skillsReducer from '../features/skills/skillsSlice';
import paymentsReducer from '../features/payments/paymentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    contacts: contactsReducer,
    messages: messagesReducer,
    skills: skillsReducer,
    payments: paymentsReducer,
  },
});

export default store;
