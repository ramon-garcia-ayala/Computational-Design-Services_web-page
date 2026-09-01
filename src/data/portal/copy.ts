/** Every word in the client portal's chrome — the login, the panel shell,
 *  the section labels and their empty states. Project-specific copy (a
 *  project's own summary, KPI labels, to-do titles…) lives in that client's
 *  own file instead, the same split proposals make between `data/proposals`
 *  and this file's sibling. */
export const portalCopy = {
  login: {
    kicker: "Client access",
    title: "Track your project",
    lead: "Enter the email we have on file and we'll send you a link to your project panel — no password to remember.",
    fields: { email: "Email" },
    placeholders: { email: "you@company.com" },
    submit: "Send link",
    sending: "Sending…",
    sent: {
      title: "Check your inbox.",
      body: "If that address is on file, a sign-in link is on its way. It expires in 15 minutes.",
    },
    errors: {
      emailRequired: "Please add your email.",
      emailInvalid: "That email address does not look right.",
      unavailable: "Sign-in is temporarily unavailable. Please contact us directly.",
    },
    backToSite: "Back to the site",
  },

  enter: {
    invalidTitle: "This link has expired",
    invalidBody:
      "Sign-in links last 15 minutes. Request a new one and we'll send it straight over.",
    retry: "Request a new link",
  },

  chrome: {
    signOut: "Sign out",
    projectSwitcherLabel: "Project",
  },

  hero: {
    startedLabel: "Started",
    nextMilestoneLabel: "Next milestone",
  },

  sections: {
    overview: {
      kicker: "Overview",
      title: "Performance",
      empty: "KPIs will appear here once the project reaches its first milestone.",
    },
    timeline: {
      kicker: "Timeline",
      title: "Where things stand",
      empty: "The project timeline is being set up. Check back soon.",
    },
    scope: {
      kicker: "Scope",
      title: "What's included",
      empty: "Scope details are being finalised.",
    },
    todos: {
      kicker: "To-do",
      title: "Outstanding items",
      empty: "Nothing outstanding on either side right now.",
      counts: { client: "Waiting on you", studio: "Waiting on us" },
    },
    documents: {
      kicker: "Documents",
      title: "Files & proposals",
      empty: "Documents will appear here as they're ready to share.",
      download: "Download",
      openProposal: "Open proposal",
    },
    budget: {
      kicker: "Budget",
      title: "Investment",
      empty: "Budget details will appear once a scope is agreed.",
      paidLabel: "Paid to date",
      totalLabel: "Total",
    },
    updates: {
      kicker: "Updates",
      title: "Project log",
      empty: "No updates logged yet.",
    },
  },

  kpiState: {
    "on-track": "On track",
    "at-risk": "At risk",
    "off-track": "Off track",
  },

  phaseState: {
    done: "Complete",
    active: "In progress",
    next: "Planned",
  },

  projectState: {
    active: "Active",
    paused: "Paused",
    complete: "Complete",
  },
} as const;
