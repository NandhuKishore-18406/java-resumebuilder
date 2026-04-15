"use client";

import { useState, useEffect, useCallback } from "react";
import { getState, saveState, type AppState, type Profile } from "@/lib/storage";

export function useAppState() {
  const [state, setState] = useState<AppState>({ profile: {}, savedCertificates: [], seminars: { completed: [], queue: [] } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getState().then(setState).finally(() => setLoading(false));
  }, []);

  const updateState = useCallback(async (patch: Partial<AppState>) => {
    setState((prev) => {
      const updated = { ...prev, ...patch };
      return updated;
    });
    await saveState(patch);
  }, []);

  return { state, updateState, loading };
}

export function useProfile() {
  const { state, updateState, loading } = useAppState();
  const [profile, setProfile] = useState<Profile>(state.profile);

  useEffect(() => {
    setProfile(state.profile);
  }, [state.profile]);

  const updateProfile = async (patch: Partial<Profile>) => {
    const updated = { ...profile, ...patch };
    setProfile(updated);
    await updateState({ profile: updated });
  };

  return { profile, updateProfile, loading };
}