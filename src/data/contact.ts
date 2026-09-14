/** Every word on `/contact` and in its form. */
export const contactCopy = {
  kicker: "Contact",
  title: "Tell us what should not be manual",
  lead: "Describe the workflow in three lines. We will tell you whether it is worth automating and what the first step looks like. No pitch deck, no discovery phase that never ends.",

  formKicker: "Send a message",

  fields: {
    name: "Name",
    email: "Email",
    message: "Message",
  },

  placeholders: {
    name: "Your name",
    email: "you@studio.com",
    message: "The task, how often it happens, and roughly how long it takes.",
  },

  submit: "Send message",
  sending: "Sending…",

  success: {
    title: "Message sent.",
    body: "We read everything that comes through here and reply from a real address, usually within a couple of days.",
    again: "Send another",
  },

  errors: {
    name: "Please add your name.",
    emailRequired: "Please add an email so we can reply.",
    emailInvalid: "That email address does not look right.",
    message: "Please tell us what you are working on.",
    send: "That did not send. Try again, or use the email link instead: it reaches the same place.",
  },

  /* The alternative path, for anyone who would rather use their own client.
     The address itself is never printed: `contactHref` is what the link
     carries, and the visible text stays a label. */
  direct: {
    kicker: "Prefer your own mail client?",
    body: "The same message reaches us either way.",
  },

  elsewhere: "Elsewhere",
};
