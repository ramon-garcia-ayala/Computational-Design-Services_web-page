export type Founder = {
  id: string;
  name: string;
  /** First name alone, for Home's panel, where the caption is a small mono
      label under a portrait and a full legal name would wrap. */
  short: string;
  title: string;
  bio: string;
  /** Square source, so the slots that hold these are square too. */
  photo: string;
};

/**
 * The two founders, in one place.
 *
 * Shared rather than duplicated: Home's About panel shows the names and the
 * portraits, `/about` shows all of it. Two copies would drift the moment a
 * title changed on one page and not the other.
 */
export const founders: Founder[] = [
  {
    id: "ramy",
    name: "Ramy Ayoub",
    short: "Ramy",
    title: "Co-founder, Architect & Computational Design",
    bio: "An architect and computational designer working across parametric design, AI-driven workflows, and sustainable design for the built environment. His experience spans large-scale architectural projects and international events across Lebanon, the UAE, and Qatar. He holds degrees in Architecture from USEK, a Master's in Advanced Computational Design from IAAC Barcelona, and a specialization in AI for Construction from Zigurat, alongside LEED Green Associate accreditation.",
    photo: "/founders/ramy.jpg",
  },
  {
    id: "ramon",
    name: "Ramón García Ayala",
    short: "Ramón",
    title: "Co-founder, Architect & Design Technology Specialist",
    bio: "An architect and computational designer working across parametric design, BIM interoperability, and machine learning. His work has been exhibited at the Venice Biennale and Mextropoli, and he has led biomimicry and automation research at Tecnológico de Monterrey. He holds a Master's in Computational Design from IAAC Barcelona and currently works as a Design Technology Specialist at Gensler LATAM.",
    photo: "/founders/ramon.jpg",
  },
];
