"use client";

import { useState, useEffect, useCallback } from "react";
import { getState, saveState, type AppState, type Profile } from "@/lib/storage";

export function useAppState() {
  const [state, setState] = useState<AppState>(() => getState());

  // Rehydrate on mount
  useEffect(() => {
    setState(getState());
  }, []);

  const updateState = useCallback((patch: Partial<AppState>) => {
    setState((prev) => {
      const updated = { ...prev, ...patch };
      saveState(patch);
      return updated;
    });
  }, []);

  return { state, updateState };
}

export function useProfile() {
  const { state, updateState } = useAppState();
  const [profile, setProfile] = useState<Profile>(() => state.profile);

  useEffect(() => {
    setProfile(state.profile);
  }, [state.profile]);

  const updateProfile = (patch: Partial<Profile>) => {
    const updated = { ...profile, ...patch };
    setProfile(updated);
    updateState({ profile: updated });
  };

  return { profile, updateProfile };
}