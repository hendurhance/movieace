// ============================================================================
// useReveal — App-level IntersectionObserver that flips `data-reveal` from
// its initial blank state to `"in"` when an element enters the viewport.
//
// Applied via the `[data-reveal]` selector in `_utilities.scss` — pages and
// components opt-in by adding `data-reveal` to any element they want to
// fade-up on scroll. Reduced-motion preference short-circuits to immediate.
// ============================================================================

const REVEALED = 'in';

let observer: IntersectionObserver | null = null;
let mutation: MutationObserver | null = null;

const reveal = (el: Element) => {
    (el as HTMLElement).setAttribute('data-reveal', REVEALED);
};

const observe = (root: ParentNode = document) => {
    if (!observer) return;
    const candidates = root.querySelectorAll('[data-reveal=""], [data-reveal]:not([data-reveal="in"])');
    candidates.forEach(el => observer!.observe(el));
};

export const startReveal = (): void => {
    if (typeof window === 'undefined' || observer) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
        document.querySelectorAll('[data-reveal]').forEach(reveal);
        // Keep new elements revealed too
        mutation = new MutationObserver(() => {
            document.querySelectorAll('[data-reveal]:not([data-reveal="in"])').forEach(reveal);
        });
        mutation.observe(document.body, { childList: true, subtree: true });
        return;
    }

    observer = new IntersectionObserver(
        entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                reveal(entry.target);
                observer!.unobserve(entry.target);
            }
        },
        {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.05
        }
    );

    observe(document);

    mutation = new MutationObserver(records => {
        for (const r of records) {
            r.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;
                if (node.matches?.('[data-reveal]')) observer!.observe(node);
                observe(node);
            });
        }
    });
    mutation.observe(document.body, { childList: true, subtree: true });
};

export const stopReveal = (): void => {
    observer?.disconnect();
    mutation?.disconnect();
    observer = null;
    mutation = null;
};
