import Badge from "react-bootstrap/Badge";
import { ASSIGNMENT_STATUS_META } from "../utils/constants";

function AssignmentStatusBadge({ status }) {
  const meta = ASSIGNMENT_STATUS_META[status] || ASSIGNMENT_STATUS_META.not_started;
  return <Badge bg={meta.bg}>{meta.label}</Badge>;
}

export default AssignmentStatusBadge;
