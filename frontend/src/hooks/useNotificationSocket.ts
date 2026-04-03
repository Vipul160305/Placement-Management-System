import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { listMyApplications } from "../services/api";

type AppStatus = "applied" | "shortlisted" | "offered" | "rejected" | "withdrawn";

interface ApplicationRow {
  id?: string;
  _id?: string;
  status: AppStatus;
  drive?: { title?: string; company?: { name?: string } };
}

const STATUS_MESSAGES: Partial<Record<AppStatus, string>> = {
  shortlisted: "You've been shortlisted",
  offered:     "Congratulations! You received an offer",
  rejected:    "Your application was not selected",
};

const TOAST_TYPE: Partial<Record<AppStatus, "success" | "error" | "info">> = {
  shortlisted: "info",
  offered:     "success",
  rejected:    "error",
};

const POLL_INTERVAL = 30_000; // 30 seconds

function appId(a: ApplicationRow) {
  return (a.id || a._id) as string;
}

/**
 * Polls /api/applications/me every 30s for students.
 * Compares statuses against a local snapshot and fires toast
 * notifications when a status changes.
 */
export const useNotificationSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const knownStatuses = useRef<Map<string, AppStatus>>(new Map());
  const initialized = useRef(false);

  const poll = useCallback(async () => {
    try {
      const res = (await listMyApplications()) as { applications?: ApplicationRow[] };
      const apps = res.applications || [];

      if (!initialized.current) {
        // Seed the map on first load — no notifications yet
        for (const app of apps) {
          const id = appId(app);
          if (id) knownStatuses.current.set(id, app.status);
        }
        initialized.current = true;
        return;
      }

      for (const app of apps) {
        const id = appId(app);
        if (!id) continue;
        const prev = knownStatuses.current.get(id);
        if (prev && prev !== app.status) {
          const msg = STATUS_MESSAGES[app.status];
          if (msg) {
            const company = app.drive?.company?.name || app.drive?.title || "a company";
            addToast(`${msg} at ${company}`, TOAST_TYPE[app.status] || "info");
          }
        }
        knownStatuses.current.set(id, app.status);
      }
    } catch {
      // Silently ignore poll errors — network may be temporarily unavailable
    }
  }, [addToast]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "student") return;
    // Reset on user change
    knownStatuses.current = new Map();
    initialized.current = false;

    poll();
    const timer = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [isAuthenticated, user?.role, user?.id, poll]);
};
