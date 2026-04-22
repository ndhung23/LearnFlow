import { Outlet, Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import useAuth from "../hooks/useAuth";
import useLanguage from "../hooks/useLanguage";
import SidebarNav from "../components/SidebarNav";
import NotificationDropdown from "../components/NotificationDropdown";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { formatRole } from "../utils/formatters";

function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="topbar" sticky="top">
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/" className="brand-mark">
            {t("common.brand")}
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center gap-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <NotificationDropdown />
                <div className="topbar-user d-none d-md-block">
                  <div className="fw-semibold">{user.full_name}</div>
                  <div className="small text-muted">{formatRole(user.role)}</div>
                </div>
                <Button variant="outline-dark" className="rounded-pill" onClick={handleLogout}>
                  {t("topbar.logOut")}
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-dark" className="rounded-pill">
                  {t("topbar.logIn")}
                </Button>
                <Button as={Link} to="/register" className="rounded-pill px-4">
                  {t("topbar.getStarted")}
                </Button>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container fluid className="px-4 py-4">
        {isAuthenticated ? (
          <div className="dashboard-grid">
            <SidebarNav role={user.role} />
            <main className="page-panel">
              <Outlet />
            </main>
          </div>
        ) : (
          <main className="public-panel">
            <Outlet />
          </main>
        )}
      </Container>
    </div>
  );
}

export default AppLayout;
