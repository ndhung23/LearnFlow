import { useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import useLanguage from "../hooks/useLanguage";
import notificationService from "../services/notificationService";
import { formatDateTime } from "../utils/formatters";

function NotificationDropdown() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    notificationService
      .list()
      .then((items) => {
        if (active) {
          setNotifications(items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleRead = async (notificationId) => {
    try {
      await notificationService.markRead(notificationId);
      setNotifications((currentItems) =>
        currentItems.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
    } catch (error) {
      //
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="light" className="rounded-pill px-3 border-0">
        {t("topbar.notifications")} {unreadCount ? `(${unreadCount})` : ""}
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-lg border-0 p-2" style={{ minWidth: 320 }}>
        {loading ? (
          <div className="p-3 text-center">
            <Spinner size="sm" />
            <div className="small text-muted mt-2">{t("common.loading")}</div>
          </div>
        ) : notifications.length ? (
          notifications.map((notification) => (
            <Dropdown.Item
              key={notification.id}
              className="rounded-3 mb-1"
              onClick={() => handleRead(notification.id)}
            >
              <div className="fw-semibold">{notification.title}</div>
              <div className="small text-muted">{notification.message}</div>
              <div className="small text-muted mt-1">
                {formatDateTime(notification.created_at)}
              </div>
            </Dropdown.Item>
          ))
        ) : (
          <div className="p-3 text-muted small">{t("topbar.noNotifications")}</div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationDropdown;
