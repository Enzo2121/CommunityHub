import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';

export default function MainNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const isPremium = user?.is_premium || user?.premium === 1 || user?.premium === true;
  const isAdmin = user?.role === 'admin' || user?.is_admin === true || user?.is_admin === 1;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `navbar-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div className="navbar-brand-icon">C</div>
          <span>Community<strong>Hub</strong></span>
        </Link>

        {/* Desktop nav */}
        <ul className="navbar-links">
          <li><NavLink to="/events" className={navLinkClass}>Événements</NavLink></li>
          <li><NavLink to="/skills" className={navLinkClass}>Compétences</NavLink></li>
          {token && (
            <>
              <li><NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink></li>
              {isAdmin && <li><NavLink to="/admin" className={navLinkClass}>Administration</NavLink></li>}
              {isPremium && (
                <>
                  <li><NavLink to="/contacts" className={navLinkClass}>Contacts</NavLink></li>
                  <li><NavLink to="/messages" className={navLinkClass}>Messages</NavLink></li>
                </>
              )}
            </>
          )}
        </ul>

        {/* Auth actions */}
        <div className="navbar-actions">
          {token ? (
            <div className="navbar-user">
              {isPremium && <span className="badge badge-premium">Premium</span>}
              <div className="navbar-user-menu">
                <button className="navbar-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.pseudo} className="avatar avatar-sm" />
                  ) : (
                    <span className="avatar-placeholder avatar-sm">
                      {user?.pseudo?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                  <span className="navbar-pseudo">{user?.pseudo}</span>
                  <span className="dropdown-arrow">{menuOpen ? '▴' : '▾'}</span>
                </button>
                {menuOpen && (
                  <div className="navbar-dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      Mon profil
                    </Link>
                    {isPremium && (
                      <>
                        <Link to="/my-skills" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                          Mes compétences
                        </Link>
                        <Link to="/events/create" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                          Créer un événement
                        </Link>
                      </>
                    )}
                    {!isPremium && (
                      <Link to="/premium" className="dropdown-item dropdown-item-premium" onClick={() => setMenuOpen(false)}>
                        Passer Premium
                      </Link>
                    )}
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Inscription</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
            <span className={`hamburger-line${menuOpen ? ' open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile">
          <NavLink to="/events" className="mobile-link" onClick={() => setMenuOpen(false)}>Événements</NavLink>
          <NavLink to="/skills" className="mobile-link" onClick={() => setMenuOpen(false)}>Compétences</NavLink>
          {token ? (
            <>
              <NavLink to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              {isAdmin && <NavLink to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Administration</NavLink>}
              {isPremium && (
                <>
                  <NavLink to="/contacts" className="mobile-link" onClick={() => setMenuOpen(false)}>Contacts</NavLink>
                  <NavLink to="/messages" className="mobile-link" onClick={() => setMenuOpen(false)}>Messages</NavLink>
                  <NavLink to="/my-skills" className="mobile-link" onClick={() => setMenuOpen(false)}>Mes compétences</NavLink>
                  <NavLink to="/events/create" className="mobile-link" onClick={() => setMenuOpen(false)}>Créer un événement</NavLink>
                </>
              )}
              {!isPremium && (
                <NavLink to="/premium" className="mobile-link mobile-link-premium" onClick={() => setMenuOpen(false)}>Passer Premium</NavLink>
              )}
              <button className="mobile-link mobile-link-danger" onClick={handleLogout}>Déconnexion</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Connexion</NavLink>
              <NavLink to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Inscription</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
