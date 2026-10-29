import type { ResumeContent } from "./schema";

// CV d'exemple CLAIREMENT FICTIF, uniquement pour la galerie et les tests.
// Ne jamais l'utiliser comme valeur par défaut d'un formulaire.
export const SAMPLE_RESUME: ResumeContent = {
  basics: {
    firstName: "Camille",
    lastName: "Exemple",
    jobTitle: "Chargée de communication",
    email: "camille@exemple.fr",
    phone: "06 00 00 00 00",
    city: "Bordeaux",
    website: "",
    linkedin: "linkedin.com/in/camille-exemple",
    extra: "Permis B",
  },
  summary:
    "Profil fictif de démonstration. Chargée de communication avec cinq ans d'expérience en agence et en collectivité, à l'aise avec les réseaux sociaux, la rédaction et l'organisation d'événements.",
  sections: [
    {
      id: "s-exp",
      type: "experience",
      title: "",
      visible: true,
      items: [
        {
          id: "e1",
          role: "Chargée de communication",
          company: "Agence Fictive",
          city: "Bordeaux",
          start: "2022",
          end: "",
          description:
            "Gestion des réseaux sociaux de 12 clients.\nCréation de campagnes et suivi des résultats.\nOrganisation de trois salons professionnels par an.",
        },
        {
          id: "e2",
          role: "Assistante communication",
          company: "Mairie Imaginaire",
          city: "Pessac",
          start: "2020",
          end: "2022",
          description: "Rédaction du journal municipal.\nMise à jour du site internet.",
        },
      ],
    },
    {
      id: "s-edu",
      type: "education",
      title: "",
      visible: true,
      items: [
        {
          id: "f1",
          degree: "Master Communication des organisations",
          school: "Université Exemple",
          city: "Bordeaux",
          start: "2018",
          end: "2020",
          description: "",
        },
      ],
    },
    {
      id: "s-skills",
      type: "skills",
      title: "",
      visible: true,
      items: [
        { id: "c1", name: "Rédaction web", level: 5 },
        { id: "c2", name: "Réseaux sociaux", level: 5 },
        { id: "c3", name: "Suite Adobe", level: 4 },
        { id: "c4", name: "Gestion de projet", level: 4 },
      ],
    },
    {
      id: "s-lang",
      type: "languages",
      title: "",
      visible: true,
      items: [
        { id: "l1", name: "Anglais", level: "Courant (C1)" },
        { id: "l2", name: "Espagnol", level: "Intermédiaire (B1)" },
      ],
    },
    {
      id: "s-int",
      type: "interests",
      title: "",
      visible: true,
      items: [
        { id: "i1", name: "Photographie" },
        { id: "i2", name: "Course à pied" },
      ],
    },
  ],
};
