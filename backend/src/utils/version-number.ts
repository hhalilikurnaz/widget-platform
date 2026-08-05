export function getNextVersionNumber(currentMaxVersion: number | null | undefined): number {
  return (currentMaxVersion ?? 0) + 1;
}

export function formatVersionLabel(version: number): string {
  return `v${String(version)}`;
}
