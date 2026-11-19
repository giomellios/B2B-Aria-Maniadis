"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";

/**
 * Starts its children from scratch on every visit to the page.
 *
 * With `cacheComponents`, Next.js keeps recently visited pages alive in a hidden React <Activity>,
 * so their client state (quantities typed in, comments, selections) survives leaving and coming
 * back. A hidden Activity still runs effect cleanups, so this bumps a key when the page is hidden:
 * the children remount in the background and the next visit shows them in their initial state.
 */
export function ResetOnRevisit({ children }: { children: ReactNode }) {
  const [visit, setVisit] = useState(0);
  useEffect(() => () => setVisit((v) => v + 1), []);
  return <Fragment key={visit}>{children}</Fragment>;
}
