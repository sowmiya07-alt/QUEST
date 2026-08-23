/**
 * Utility functions for user formatting and display helpers
 */

export function getDisplayName(nameInput, fallbackIdentity = "") {
  let nameStr = "";
  if (typeof nameInput === "string") {
    nameStr = nameInput;
  } else if (nameInput && typeof nameInput === "object") {
    nameStr = nameInput.name || nameInput.username || nameInput.user_code || nameInput.email || "";
  }

  let fallbackStr = "";
  if (typeof fallbackIdentity === "string") {
    fallbackStr = fallbackIdentity;
  } else if (fallbackIdentity && typeof fallbackIdentity === "object") {
    fallbackStr = fallbackIdentity.email || fallbackIdentity.name || fallbackIdentity.user_code || "";
  }

  if (nameStr && typeof nameStr === "string" && nameStr.trim()) {
    const trimmed = nameStr.trim();
    if (trimmed.includes("@")) {
      const handle = trimmed.split("@")[0];
      const cleaned = handle.replace(/[0-9]/g, "");
      const formatted = cleaned || handle;
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  if (fallbackStr && typeof fallbackStr === "string" && fallbackStr.trim()) {
    const trimmed = fallbackStr.trim();
    if (trimmed.includes("@")) {
      const handle = trimmed.split("@")[0];
      const cleaned = handle.replace(/[0-9]/g, "");
      const formatted = cleaned || handle;
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  return "User";
}
