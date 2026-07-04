// Turn a DRF error response into a single user-facing message.
// DRF shapes handled:
//   { "detail": "No active account found with the given credentials" }
//   { "email": ["user with this email address already exists."] }
//   { "password": ["This password is too short.", "This password is too common."] }
//   { "non_field_errors": ["..."] }
export const parseApiError = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") {
    // Guard against HTML bodies (e.g. a Django 404/500 debug page): don't dump
    // markup into the UI — fall back to a clean message.
    const trimmed = data.trim();
    if (trimmed.startsWith("<") || trimmed.length > 300) return fallback;
    return trimmed || fallback;
  }
  if (data.detail) return data.detail;

  const messages = [];
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) messages.push(value.join(" "));
    else if (value) messages.push(String(value));
  }
  return messages.join(" ") || fallback;
};
