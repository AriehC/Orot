"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6F1",
          fontFamily: "'Noto Sans Hebrew', sans-serif",
          color: "#2D2A26",
          direction: "rtl",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 480 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #D4A04A, #F0C87A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 36,
              color: "white",
              opacity: 0.7,
            }}
          >
            ✦
          </div>
          <h1
            style={{
              fontFamily: "'Secular One', sans-serif",
              fontSize: 28,
              marginBottom: 8,
            }}
          >
            משהו השתבש
          </h1>
          <p
            style={{
              color: "#7A7267",
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            אירעה שגיאה בלתי צפויה. אנחנו מצטערים על אי הנוחות.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 32px",
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg, #C17B4A, #D4935E)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Noto Sans Hebrew', sans-serif",
              cursor: "pointer",
            }}
          >
            נסו שוב
          </button>
        </div>
      </body>
    </html>
  );
}
