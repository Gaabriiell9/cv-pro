import type { Metadata } from "next";
import { EditorApp } from "@/components/editor/editor-app";

export const metadata: Metadata = {
  title: "Créer mon CV",
  description: "Remplissez votre CV section par section, voyez l'aperçu en direct et téléchargez un PDF prêt à envoyer.",
};

export default function EditeurPage() {
  return <EditorApp />;
}
