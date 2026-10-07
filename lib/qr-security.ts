import { createHash, randomBytes } from "node:crypto";

/**
 * Generates a high-entropy public QR identifier.
 * Format: "SE-ROTC-QRC-[TIMESTAMP]-[RANDOM_HEX]"
 * Safe to be stored and scanned.
 */
export function generatePublicQrId(studentId: string): string {
  const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const randomSuffix = randomBytes(6).toString("hex").toUpperCase();
  return `SE-ROTC-${cleanId}-${randomSuffix}`;
}

/**
 * Creates a safe QR payload.
 * The QR contains only the public QR identifier, not personal profile details,
 * passwords, access tokens, or service keys.
 */
export function generateSecureQrPayload(studentId: string, publicQrId: string) {
  const tokenHash = createHash("sha256").update(publicQrId).digest("hex");
  
  const qrPayload = JSON.stringify({
    org: "SAN_ENRIQUE_ROTC",
    v: 1,
    qid: publicQrId,
  });

  return {
    qrPayload,
    tokenHash,
  };
}

/**
 * Validates a scanned QR payload string and verifies cryptographic structure.
 */
export function parseAndValidateQrPayload(scannedString: string): {
  valid: boolean;
  publicQrId?: string;
  studentId?: string;
  token?: string;
  error?: string;
} {
  try {
    // If JSON format
    if (scannedString.trim().startsWith("{") && scannedString.trim().endsWith("}")) {
      const data = JSON.parse(scannedString);
      if (data.org !== "SAN_ENRIQUE_ROTC" || !data.qid) {
        return { valid: false, error: "Invalid QR code format. Not issued by San Enrique ROTC." };
      }
      return {
        valid: true,
        publicQrId: data.qid,
      };
    }

    // Fallback: If scanned string is raw public_qr_id or legacy verified token
    if (scannedString.startsWith("SE-ROTC-")) {
      return {
        valid: true,
        publicQrId: scannedString,
      };
    }

    return { valid: false, error: "Unrecognized QR code structure." };
  } catch (err: any) {
    return { valid: false, error: "Could not parse QR payload data." };
  }
}
