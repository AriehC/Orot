/** Maps Firebase Auth error codes to user-friendly Hebrew messages. */
export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    // Sign-in errors
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "אימייל או סיסמה שגויים";
    case "auth/user-not-found":
      return "לא נמצא חשבון עם כתובת אימייל זו";
    case "auth/user-disabled":
      return "חשבון זה הושבת. פנו לתמיכה.";
    case "auth/invalid-email":
      return "כתובת האימייל אינה תקינה";
    case "auth/too-many-requests":
      return "יותר מדי ניסיונות. נסו שוב מאוחר יותר.";

    // Sign-up errors
    case "auth/email-already-in-use":
      return "כתובת האימייל כבר בשימוש. נסו להתחבר.";
    case "auth/weak-password":
      return "הסיסמה חלשה מדי. בחרו סיסמה חזקה יותר.";
    case "auth/operation-not-allowed":
      return "שיטת ההתחברות אינה מופעלת";

    // Google sign-in errors
    case "auth/popup-closed-by-user":
      return "חלון ההתחברות נסגר. נסו שוב.";
    case "auth/popup-blocked":
      return "החלון נחסם. אפשרו חלונות קופצים ונסו שוב.";
    case "auth/cancelled-popup-request":
      return "";  // Silent — user cancelled

    // Network errors
    case "auth/network-request-failed":
      return "שגיאת רשת. בדקו את החיבור לאינטרנט.";

    default:
      return "שגיאה בהתחברות. נסו שוב.";
  }
}

/** Extracts the Firebase error code from an error object. */
export function getFirebaseErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return "unknown";
}
