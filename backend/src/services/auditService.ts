import type { Types } from "mongoose";
import { AuditLog } from "../models/AuditLog.js";

export async function recordAudit(input: {
  actorId: Types.ObjectId | string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await AuditLog.create({
    actor: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
  });
}
