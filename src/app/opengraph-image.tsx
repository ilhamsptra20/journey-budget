import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #f8fafc 0%, #ecfeff 45%, #ecfdf5 100%)",
          color: "#0f172a",
          fontFamily: "system-ui, sans-serif",
          padding: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            borderRadius: "24px",
            border: "1px solid #cbd5e1",
            background: "rgba(255,255,255,0.86)",
            padding: "44px",
            gap: "40px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              width: "180px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "120px",
                height: "120px",
                borderRadius: "999px",
                border: "8px solid #10b981",
                top: "38px",
                left: "10px",
                opacity: 0.2,
              }}
            />
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
              <path
                d="M20 104C38 82 58 79 72 90C90 104 108 95 120 68"
                stroke="#059669"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 10"
              />
              <circle cx="20" cy="104" r="10" fill="#10b981" />
              <circle cx="120" cy="68" r="10" fill="#0f172a" />
              <path d="M104 44V84" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
              <path d="M104 44H130L118 54L130 64H104V44Z" fill="#0f172a" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  border: "1px solid #cbd5e1",
                  color: "#334155",
                  fontSize: "20px",
                  fontWeight: 600,
                  alignSelf: "flex-start",
                }}
              >
                Journey Finance
              </div>
              <div
                style={{
                  fontSize: "72px",
                  lineHeight: 1.02,
                  fontWeight: 800,
                  letterSpacing: "-1px",
                }}
              >
                Trip Budgeting
              </div>
              <div
                style={{
                  fontSize: "30px",
                  lineHeight: 1.35,
                  color: "#334155",
                  maxWidth: "760px",
                }}
              >
                Rencanakan perjalanan, catat biaya bersama, dan pantau saldo trip secara transparan.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                color: "#475569",
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#10b981" }}>•</span>
              <span>Shared Expenses</span>
              <span style={{ color: "#10b981" }}>•</span>
              <span>Trip Summary</span>
              <span style={{ color: "#10b981" }}>•</span>
              <span>Public Report</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
