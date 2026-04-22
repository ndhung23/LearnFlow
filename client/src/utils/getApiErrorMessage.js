export default function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach the backend API. Make sure the LearnFlow server is running.";
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
}
