// Mise en pages de l'aperçu : reproduit à l'écran le découpage du PDF (Chromium).
// Le document du CV est une longue feuille ; on y insère des cales invisibles pour
// qu'aucun bloc insécable ne chevauche une fin de page, exactement comme à
// l'impression :
// - un bloc `break-inside: avoid` (expérience, formation...) qui dépasse passe en
//   entier sur la page suivante ;
// - un titre (`break-after: avoid`) part avec le bloc qui le suit ;
// - les marges des éléments en `box-decoration-break: clone` se répètent en haut et
//   en bas de chaque page.
// Chaque colonne (deux colonnes : .main et .side) se découpe indépendamment.
//
// ATTENTION : fonction autonome (aucune importation, aucune variable extérieure),
// car elle est aussi envoyée telle quelle dans Chromium par les tests
// (page.evaluate). Elle ne touche qu'à l'aperçu : le PDF est découpé par Chromium.

export type Pagination = { pages: number; pageHeight: number };

export function paginateResume(doc: Document): Pagination {
  const PAGE = (297 / 25.4) * 96; // hauteur A4 en px CSS (1122,5)
  const win = doc.defaultView;
  if (!win) return { pages: 1, pageHeight: PAGE };

  // On repart d'un document sans cales ni marges ajoutées (nouvel appel).
  doc.querySelectorAll("[data-cv-cale]").forEach((el) => el.remove());
  doc.querySelectorAll<HTMLElement>("[data-cv-mt]").forEach((el) => {
    el.style.marginTop = el.dataset.cvMt ?? "";
    delete el.dataset.cvMt;
  });

  const cv = doc.querySelector<HTMLElement>(".cv");
  if (!cv) return { pages: 1, pageHeight: PAGE };

  const css = (el: Element) => win.getComputedStyle(el);
  const top = (el: Element) => el.getBoundingClientRect().top + win.scrollY;
  const bottom = (el: Element) => el.getBoundingClientRect().bottom + win.scrollY;

  // Marges répétées sur chaque page : rembourrages des ancêtres en « clone ».
  function repeatedPadding(el: Element): { head: number; foot: number } {
    let head = 0;
    let foot = 0;
    for (let a = el.parentElement; a && a !== doc.body; a = a.parentElement) {
      const s = css(a);
      if (s.boxDecorationBreak === "clone" || s.getPropertyValue("-webkit-box-decoration-break") === "clone") {
        head += parseFloat(s.paddingTop) + parseFloat(s.borderTopWidth);
        foot += parseFloat(s.paddingBottom) + parseFloat(s.borderBottomWidth);
      }
    }
    return { head, foot };
  }

  // Blocs insécables d'une colonne, dans l'ordre de lecture. On descend dans les
  // conteneurs en bloc ; un élément insécable, une feuille, une grille ou une boîte
  // flexible (hors colonne) forment un bloc.
  function atoms(root: Element): HTMLElement[] {
    const out: HTMLElement[] = [];
    const visit = (el: Element) => {
      for (const child of Array.from(el.children)) {
        if (!(child instanceof win!.HTMLElement)) continue;
        const s = css(child);
        if (s.display === "none" || s.position === "absolute" || s.position === "fixed") continue;
        const blockChildren = Array.from(child.children).some((c) => {
          const d = css(c).display;
          return d === "block" || d === "list-item" || d === "flex" || d === "grid" || d === "table";
        });
        // Une grille se coupe entre ses rangées (on descend dedans) ; une boîte
        // flexible en ligne reste d'un seul tenant.
        const unbreakable =
          s.breakInside === "avoid" ||
          s.breakInside === "avoid-page" ||
          s.display === "flex" ||
          s.display === "inline-flex" ||
          child.tagName === "IMG" ||
          (!blockChildren && s.display !== "grid");
        if (unbreakable) out.push(child);
        else visit(child);
      }
    };
    visit(root);
    return out;
  }

  const keepsWithNext = (el: HTMLElement) => {
    const b = css(el).breakAfter;
    return b === "avoid" || b === "avoid-page" || /^H[1-6]$/.test(el.tagName);
  };

  // Décale un bloc vers le bas. Dans un flux normal : une cale invisible juste avant.
  // Dans une grille ou une boîte flexible, une cale casserait la disposition : on
  // pousse le conteneur entier si le bloc est son premier enfant, sinon on agrandit
  // la marge haute du bloc (sa rangée descend d'autant).
  function push(el: HTMLElement, amount: number) {
    const parent = el.parentElement!;
    const pd = css(parent).display;
    if (pd.includes("grid") || pd.includes("flex")) {
      if (parent.firstElementChild === el || parent.querySelector(":scope > *:not([data-cv-cale])") === el) {
        if (parent !== cv) return push(parent, amount);
      }
      if (el.dataset.cvMt === undefined) el.dataset.cvMt = el.style.marginTop;
      el.style.marginTop = `${parseFloat(css(el).marginTop) + amount}px`;
      return;
    }
    let cale = el.previousElementSibling as HTMLElement | null;
    if (!cale || !cale.hasAttribute("data-cv-cale")) {
      cale = doc.createElement("div");
      cale.setAttribute("data-cv-cale", "");
      cale.setAttribute("aria-hidden", "true");
      cale.style.cssText = "display:block;height:0;margin:0;padding:0;border:0;";
      parent.insertBefore(cale, el);
    }
    cale.style.height = `${Math.max(0, parseFloat(cale.style.height) + amount)}px`;
  }

  // Les colonnes qui se découpent chacune de leur côté.
  const columns: Element[] = [];
  const cols = cv.querySelector(".cols");
  if (cols) {
    for (const c of Array.from(cols.children)) columns.push(c);
    // En-tête au-dessus des colonnes (H-top) : il est en haut de la page 1, rien à faire.
  } else {
    columns.push(cv);
  }

  for (const column of columns) {
    const list = atoms(column);
    for (let i = 0; i < list.length; i++) {
      const el = list[i];
      // Un titre part avec le bloc qui le suit (s'il est dans la même colonne).
      let last = el;
      let j = i;
      while (keepsWithNext(list[j]) && j + 1 < list.length) {
        j += 1;
        last = list[j];
      }
      const { head, foot } = repeatedPadding(el);
      const usable = PAGE - head - foot;
      const t = top(el);
      const b = bottom(last);
      if (b - t > usable) continue; // trop grand pour une page : il sera coupé, comme au PDF
      const page = Math.floor(t / PAGE);
      const limit = (page + 1) * PAGE - foot;
      if (b <= limit + 0.5) continue;

      // On pousse le bloc pour poser le haut de sa boîte en haut de la page suivante
      // (à l'impression, sa marge haute disparaît en début de page). Quelques passes
      // absorbent les fusions de marges.
      const target = (page + 1) * PAGE + head;
      for (let pass = 0; pass < 3; pass++) {
        const delta = target - top(el);
        if (Math.abs(delta) < 0.5) break;
        push(el, delta);
      }
      i = j; // le groupe titre + bloc est traité
    }
  }

  // Nombre de pages : fin réelle du contenu (avec la marge basse de la dernière page).
  let end = 0;
  for (const column of columns) {
    const list = atoms(column);
    const lastAtom = list[list.length - 1];
    if (lastAtom) end = Math.max(end, bottom(lastAtom) + repeatedPadding(lastAtom).foot);
  }
  end = Math.max(end, bottom(cv) - 1);
  const pages = Math.max(1, Math.ceil((end - 1) / PAGE));
  return { pages, pageHeight: PAGE };
}
