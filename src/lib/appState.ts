const ACTIVE_PROFILE_KEY = 'fpc.activeProfileId';

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(id: string) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}
