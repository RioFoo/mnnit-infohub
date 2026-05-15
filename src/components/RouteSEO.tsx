import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://mnnitinfohub.lovable.app";

type Meta = { title: string; description: string };

const ROUTE_META: Record<string, Meta> = {
  "/": {
    title: "MNNIT InfoHub — Social platform for MNNIT students",
    description:
      "The social hub for MNNIT Allahabad: live feed, campus info, timetables, grades, and shared resources.",
  },
  "/explore": {
    title: "Explore students & posts — MNNIT InfoHub",
    description:
      "Discover MNNIT students, trending posts, and active communities across branches and batches.",
  },
  "/campus": {
    title: "Campus info & directory — MNNIT InfoHub",
    description:
      "Hostels, departments, faculty contacts, and essential MNNIT campus information in one place.",
  },
  "/calendar": {
    title: "Academic calendar — MNNIT InfoHub",
    description:
      "MNNIT academic calendar: exams, holidays, deadlines, and key institute events.",
  },
  "/timetable": {
    title: "Class timetable — MNNIT InfoHub",
    description:
      "Branch-wise and semester-wise MNNIT class timetables with attendance tracking.",
  },
  "/grades": {
    title: "CPI / SPI calculator — MNNIT InfoHub",
    description:
      "Track grades and compute CPI and SPI using the official MNNIT grading scheme.",
  },
  "/resources": {
    title: "Notes & resources vault — MNNIT InfoHub",
    description:
      "Shared MNNIT notes, previous year papers, and study resources by branch and semester.",
  },
  "/notifications": {
    title: "Notifications — MNNIT InfoHub",
    description: "Likes, comments, follows, and updates from your MNNIT InfoHub network.",
  },
  "/profile": {
    title: "Your profile — MNNIT InfoHub",
    description: "Your MNNIT InfoHub profile, posts, followers, skills, and linked GitHub.",
  },
  "/settings": {
    title: "Settings — MNNIT InfoHub",
    description: "Manage your MNNIT InfoHub account, theme, and notification preferences.",
  },
  "/auth": {
    title: "Sign in — MNNIT InfoHub",
    description: "Sign in to MNNIT InfoHub with your @mnnit.ac.in account.",
  },
};

const FALLBACK: Meta = {
  title: "MNNIT InfoHub",
  description: "The social platform for MNNIT students.",
};

const RouteSEO = () => {
  const { pathname } = useLocation();
  const key = Object.keys(ROUTE_META).find(
    (k) => k === pathname || (k !== "/" && pathname.startsWith(k))
  );
  const meta = (key && ROUTE_META[key]) || FALLBACK;
  const url = `${SITE}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  );
};

export default RouteSEO;
