import { addSeconds, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";

export const QR_TOKEN_TTL_SECONDS = 5;

export function buildNextQrWindow() {
  const now = new Date();
  return {
    activeQrToken: crypto.randomUUID(),
    qrUpdatedAt: now,
    qrExpiresAt: addSeconds(now, QR_TOKEN_TTL_SECONDS),
    lastSeenAt: now,
  };
}

export async function rotateDeviceQrToken(deviceId: string) {
  return prisma.device.update({
    where: { id: deviceId },
    data: buildNextQrWindow(),
  });
}

export function deviceQrExpired(device: {
  activeQrToken: string | null;
  qrExpiresAt: Date | null;
}) {
  if (!device.activeQrToken || !device.qrExpiresAt) {
    return true;
  }

  return isBefore(device.qrExpiresAt, new Date());
}
