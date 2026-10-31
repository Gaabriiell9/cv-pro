import type { ReactNode } from "react";

// Bloc repliable animé (hauteur et fondu). Le contenu reste monté pour que
// l'animation de fermeture soit visible ; `inert` le retire du clavier et des
// lecteurs d'écran quand il est replié. Les marges intérieures sont posées sur
// le bloc le plus profond, sinon elles resteraient visibles une fois replié.
export function Collapse({ open, children, className = "" }: { open: boolean; children: ReactNode; className?: string }) {
  return (
    <div className="cv-collapse" data-open={open} inert={!open}>
      <div>
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}
