
import { Link, useLocation } from "react-router-dom";
import "./Styles/Navbar.css";

export default function Navbar() {
    const location = useLocation();

    const isActive = (pathname: string) => {
        return location.pathname === pathname ? 'isActive' : '';
    }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-header">
          <span className="navbar-title">Expense Track</span>
        </div>
        <div className="navbar-buttons">
          <Link to="/Home" className={`navbar-link ${isActive('/Home')}`}>
            Home
          </Link>
          <Link to="/GraphsPage" className={`navbar-link ${isActive('/GraphsPage')}`}>
            Visualization
          </Link>
          <Link to="/AccountPage" className={`navbar-link ${isActive('/AccountPage')}`}>
            Account
          </Link>
        </div>
      </nav>
    </>
  );
}
