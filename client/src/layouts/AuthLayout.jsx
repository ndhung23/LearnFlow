import { Outlet } from "react-router-dom";
import Container from "react-bootstrap/Container";
import LanguageSwitcher from "../components/LanguageSwitcher";
import useLanguage from "../hooks/useLanguage";

function AuthLayout() {
  const { t } = useLanguage();

  return (
    <div className="auth-shell">
      <Container className="py-5">
        <div className="auth-toolbar">
          <LanguageSwitcher />
        </div>
        <div className="auth-card-wrap">
          <div className="auth-copy">
            <span className="eyebrow">{t("common.brand")}</span>
            <h1>{t("authLayout.heading")}</h1>
            <p>{t("authLayout.description")}</p>
          </div>
          <div className="auth-card">
            <Outlet />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default AuthLayout;
