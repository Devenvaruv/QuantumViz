import {React}from 'react';
import { NavLink} from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Quantum Vis</div>
      <nav className={styles.nav}>
      <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : undefined)}>Home</NavLink>
        <NavLink to="/github" className={({ isActive }) => (isActive ? styles.active : undefined)}>Github</NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? styles.active : undefined)}>About</NavLink>
      </nav>
    </header>
  );
};

export default Header;
