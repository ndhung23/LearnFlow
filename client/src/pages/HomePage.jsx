import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import useLanguage from "../hooks/useLanguage";

function HomePage() {
  const { t } = useLanguage();
  const features = [
    {
      title: t("home.feature1Title"),
      description: t("home.feature1Description"),
    },
    {
      title: t("home.feature2Title"),
      description: t("home.feature2Description"),
    },
    {
      title: t("home.feature3Title"),
      description: t("home.feature3Description"),
    },
  ];

  return (
    <div className="home-hero">
      <div className="hero-panel surface-card">
        <div className="eyebrow mb-2">{t("home.eyebrow")}</div>
        <h1 className="display-5 fw-bold mb-3">{t("home.title")}</h1>
        <p className="lead text-muted mb-4">{t("home.description")}</p>
        <div className="d-flex flex-wrap gap-3">
          <Button as={Link} to="/register" size="lg" className="rounded-pill px-4">
            {t("home.primaryCta")}
          </Button>
          <Button as={Link} to="/login" size="lg" variant="outline-dark" className="rounded-pill px-4">
            {t("home.secondaryCta")}
          </Button>
        </div>
      </div>

      <Row className="g-4 mt-2">
        {features.map((feature) => (
          <Col key={feature.title} md={4}>
            <Card className="surface-card border-0 h-100">
              <Card.Body>
                <div className="eyebrow mb-2">{t("home.featureEyebrow")}</div>
                <Card.Title>{feature.title}</Card.Title>
                <Card.Text className="text-muted">{feature.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default HomePage;
