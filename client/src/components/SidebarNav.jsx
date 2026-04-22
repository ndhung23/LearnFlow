import Nav from "react-bootstrap/Nav";
import { NavLink } from "react-router-dom";
import useLanguage from "../hooks/useLanguage";
import { ROLES } from "../utils/constants";

function SidebarNav({ role }) {
  const { t } = useLanguage();
  const navigationByRole = {
    [ROLES.ADMIN]: [
      { to: "/admin", label: t("sidebar.adminDashboard") },
      { to: "/classes", label: t("sidebar.classes") },
      { to: "/study-sets", label: t("sidebar.studySets") },
      { to: "/assignments", label: t("sidebar.assignments") },
      { to: "/import", label: t("sidebar.import") },
      { to: "/profile", label: t("sidebar.profile") },
      { to: "/settings", label: t("sidebar.settings") },
    ],
    [ROLES.TEACHER]: [
      { to: "/teacher", label: t("sidebar.teacherDashboard") },
      { to: "/classes", label: t("sidebar.classes") },
      { to: "/study-sets", label: t("sidebar.studySets") },
      { to: "/assignments", label: t("sidebar.assignments") },
      { to: "/import", label: t("sidebar.import") },
      { to: "/profile", label: t("sidebar.profile") },
      { to: "/settings", label: t("sidebar.settings") },
    ],
    [ROLES.STUDENT]: [
      { to: "/student", label: t("sidebar.studentDashboard") },
      { to: "/classes", label: t("sidebar.classes") },
      { to: "/study-sets", label: t("sidebar.studySets") },
      { to: "/assignments", label: t("sidebar.assignments") },
      { to: "/profile", label: t("sidebar.profile") },
      { to: "/settings", label: t("sidebar.settings") },
    ],
  };
  const items = navigationByRole[role] || [];

  return (
    <aside className="sidebar-panel">
      <div className="sidebar-brand">LearnFlow</div>
      <p className="sidebar-copy text-muted">{t("sidebar.description")}</p>
      <Nav className="flex-column gap-2">
        {items.map((item) => (
          <Nav.Link
            key={item.to}
            as={NavLink}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    </aside>
  );
}

export default SidebarNav;
