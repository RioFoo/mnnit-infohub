// Centralized lazy route prefetch map.
// Triggered on hover/touch to warm route chunks before navigation.

type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  "/explore": () => import("@/pages/Explore"),
  "/campus": () => import("@/pages/CampusInfo"),
  "/calendar": () => import("@/pages/Calendar"),
  "/timetable": () => import("@/pages/Timetable"),
  "/grades": () => import("@/pages/Grades"),
  "/resources": () => import("@/pages/Resources"),
  "/notifications": () => import("@/pages/Notifications"),
  "/profile": () => import("@/pages/Profile"),
  "/settings": () => import("@/pages/Settings"),
  "/auth": () => import("@/pages/Auth"),
};

const warmed = new Set<string>();

export const prefetchRoute = (path: string) => {
  // Match the longest registered prefix (e.g. /profile/:id -> /profile)
  const key = Object.keys(loaders)
    .filter((p) => path === p || path.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0];
  if (!key || warmed.has(key)) return;
  warmed.add(key);
  void loaders[key]().catch(() => warmed.delete(key));
};
