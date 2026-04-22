import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import PageHeader from "../components/PageHeader";

const STORAGE_KEY = "learnflow-settings";

function SettingsPage() {
  const [settings, setSettings] = useState({
    compactCards: false,
    autoShuffle: true,
    reminderTone: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setSettings(JSON.parse(raw));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Study Experience Preferences"
        description="These local preferences help tailor the LearnFlow UI for your study habits."
      />

      {saved ? <Alert variant="success">Settings saved locally for this browser.</Alert> : null}

      <Card className="surface-card border-0">
        <Card.Body>
          <Form className="d-grid gap-4">
            <Form.Check
              type="switch"
              id="compactCards"
              label="Use compact flashcard spacing"
              checked={settings.compactCards}
              onChange={(event) =>
                setSettings((current) => ({ ...current, compactCards: event.target.checked }))
              }
            />
            <Form.Check
              type="switch"
              id="autoShuffle"
              label="Shuffle cards by default in learn mode"
              checked={settings.autoShuffle}
              onChange={(event) =>
                setSettings((current) => ({ ...current, autoShuffle: event.target.checked }))
              }
            />
            <Form.Check
              type="switch"
              id="reminderTone"
              label="Show reminder messaging for upcoming deadlines"
              checked={settings.reminderTone}
              onChange={(event) =>
                setSettings((current) => ({ ...current, reminderTone: event.target.checked }))
              }
            />
          </Form>

          <div className="mt-4">
            <Button className="rounded-pill px-4" onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SettingsPage;
