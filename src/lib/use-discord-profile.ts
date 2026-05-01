"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { DISCORD_PROFILE_REFRESH_MS, type DiscordApiUser } from "@/lib/discord-profile";

interface ProfileEntry {
  user: DiscordApiUser | null;
  loading: boolean;
  error: boolean;
  fetchedAt: number;
  snapshot: ProfileSnapshot;
  promise: Promise<void> | null;
  listeners: Set<() => void>;
}

interface ProfileSnapshot {
  user: DiscordApiUser | null;
  loading: boolean;
  error: boolean;
  fetchedAt: number;
}

const profileStore = new Map<string, ProfileEntry>();
const EMPTY_SNAPSHOT: ProfileSnapshot = { user: null, loading: false, error: false, fetchedAt: 0 };

function ensureEntry(id: string): ProfileEntry {
  let entry = profileStore.get(id);
  if (!entry) {
    entry = {
      user: null,
      loading: false,
      error: false,
      fetchedAt: 0,
      snapshot: EMPTY_SNAPSHOT,
      promise: null,
      listeners: new Set(),
    };
    profileStore.set(id, entry);
  }
  return entry;
}

function updateSnapshot(entry: ProfileEntry) {
  entry.snapshot = {
    user: entry.user,
    loading: entry.loading,
    error: entry.error,
    fetchedAt: entry.fetchedAt,
  };
}

function notify(entry: ProfileEntry) {
  entry.listeners.forEach((listener) => listener());
}

function getSnapshot(id?: string | null): ProfileSnapshot {
  if (!id) {
    return EMPTY_SNAPSHOT;
  }

  return ensureEntry(id).snapshot;
}

async function loadDiscordProfile(id: string, forceRefresh = false) {
  const entry = ensureEntry(id);
  const isFresh = Date.now() - entry.fetchedAt < DISCORD_PROFILE_REFRESH_MS;

  if (!forceRefresh && entry.user && isFresh) {
    return;
  }

  if (entry.promise) {
    return entry.promise;
  }

  entry.loading = true;
  entry.error = false;
  updateSnapshot(entry);
  notify(entry);

  entry.promise = fetch(`/api/discord/${id}${forceRefresh ? "?refresh=1" : ""}`, {
    cache: forceRefresh ? "no-store" : "default",
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }

      const data = await res.json();
      if (!data?.user) {
        throw new Error("Missing Discord user payload");
      }

      entry.user = data.user;
      entry.error = false;
      entry.fetchedAt = Date.now();
    })
    .catch(() => {
      entry.error = true;
    })
    .finally(() => {
      entry.loading = false;
      entry.promise = null;
      updateSnapshot(entry);
      notify(entry);
    });

  return entry.promise;
}

export function useDiscordProfile(discordId?: string | null) {
  const subscribe = useCallback((listener: () => void) => {
    if (!discordId) {
      return () => {};
    }

    const entry = ensureEntry(discordId);
    entry.listeners.add(listener);

    return () => {
      entry.listeners.delete(listener);
    };
  }, [discordId]);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getSnapshot(discordId),
    () => getSnapshot(discordId)
  );

  useEffect(() => {
    if (!discordId) {
      return;
    }

    loadDiscordProfile(discordId);
  }, [discordId]);

  useEffect(() => {
    if (!discordId) {
      return;
    }

    const refresh = () => loadDiscordProfile(discordId, true);
    const interval = window.setInterval(refresh, DISCORD_PROFILE_REFRESH_MS);
    const onFocus = () => refresh();

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [discordId]);

  const refresh = useCallback(() => {
    if (!discordId) {
      return Promise.resolve();
    }
    return loadDiscordProfile(discordId, true);
  }, [discordId]);

  return {
    ...snapshot,
    refresh,
  };
}
