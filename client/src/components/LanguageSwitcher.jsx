import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import useLanguage from "../hooks/useLanguage";

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="language-switcher" aria-label={t("common.language")}>
      <span className="language-switcher-label">{t("common.language")}</span>
      <ButtonGroup size="sm" aria-label={t("common.language")}>
        <Button
          variant={language === "vi" ? "dark" : "outline-dark"}
          onClick={() => setLanguage("vi")}
        >
          VI
        </Button>
        <Button
          variant={language === "en" ? "dark" : "outline-dark"}
          onClick={() => setLanguage("en")}
        >
          EN
        </Button>
      </ButtonGroup>
    </div>
  );
}

export default LanguageSwitcher;
