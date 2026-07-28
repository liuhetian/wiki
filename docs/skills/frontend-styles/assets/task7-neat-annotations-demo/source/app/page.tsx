import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All effects",
  description: "Every neat-annotations effect on one compact page.",
};

const directions = [
  ["nw", "↖"], ["n", "↑"], ["ne", "↗"], ["w", "←"],
  ["e", "→"], ["sw", "↙"], ["s", "↓"], ["se", "↘"],
] as const;

const colors = [
  ["default", ""], ["amber", "ann-amber"], ["blue", "ann-blue"],
  ["green", "ann-green"], ["red", "ann-red"],
  ["purple", "ann-purple"], ["rainbow", "ann-rainbow"],
] as const;

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top"><b>✦</b> neat—annotations</a>
        <div className="top-meta"><span>PURE CSS</span><i /> <span>0 DEPENDENCIES</span></div>
        <a className="github" href="https://github.com/syabro/neat-annotations" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <section className="intro" id="top">
        <p className="kicker">THE COMPLETE SPECIMEN</p>
        <h1>Every effect.<br /><span className="ann ann-n ann-red hero-mark" data-note="all on one page">Nothing hidden.</span></h1>
        <p>Hand-drawn arrows and notes for inline content. Pick a direction, add a colour, ship it.</p>
        <code>&lt;span class=&quot;ann ann-n ann-blue&quot; data-note=&quot;your note&quot;&gt;target&lt;/span&gt;</code>
      </section>

      <section className="spec-grid">
        <article className="panel directions-panel">
          <PanelTitle number="01" title="Eight directions" code="ann-{direction}" />
          <div className="directions-grid">
            {directions.map(([direction, arrow]) => (
              <div className={`direction-cell cell-${direction}`} key={direction}>
                <span className={`ann ann-${direction} ann-blue`} data-note={`ann-${direction}`}>
                  <b>{arrow}</b><small>{direction.toUpperCase()}</small>
                </span>
              </div>
            ))}
            <div className="direction-center"><strong>8</strong><span>ways to point</span></div>
          </div>
        </article>

        <article className="panel colors-panel">
          <PanelTitle number="02" title="Built-in colours" code="ann-{color}" />
          <div className="color-stack">
            {colors.map(([name, className]) => (
              <div className="color-row" key={name}>
                <span className={`swatch swatch-${name}`} />
                <span className={`ann ${className}`}>important</span>
                <code>{name}</code>
              </div>
            ))}
          </div>
        </article>

        <article className="panel variants-panel">
          <PanelTitle number="03" title="Marks & combinations" code="small classes, big range" />
          <div className="variant-grid">
            <Demo label="Highlight only" code="ann ann-amber">
              Make the <span className="ann ann-amber">important part</span> visible.
            </Demo>

            <Demo label="No target mark" code="ann-no-mark">
              Status: <span className="ann ann-n ann-purple ann-no-mark" data-note="keeps its own fill"><b className="status-pill">stable</b></span>
            </Demo>

            <Demo label="Custom colour" code="--ann-color">
              This feels <span className="ann ann-n custom-pink" data-note="any CSS colour">very custom</span>.
            </Demo>

            <Demo label="Nested notes" code="nest annotations">
              <span className="ann ann-e ann-red" data-note="from the left">
                <span className="ann ann-w ann-blue" data-note="and the right">one target</span>
              </span>
            </Demo>

            <Demo label="Long note" code="--ann-label-max-width">
              Built for <span className="ann ann-n ann-green long-note" data-note="longer labels wrap automatically when they run out of space">real sentences</span>.
            </Demo>

            <Demo label="Position tuning" code="--ann-arrow-x / y">
              Nudge the <span className="ann ann-ne ann-amber tuned-note" data-note="moved by variables">small details</span>.
            </Demo>

            <Demo label="Label rotation" code="--ann-rotate">
              Make it feel <span className="ann ann-nw ann-red rotated-note" data-note="more energy!">more alive</span>.
            </Demo>

            <Demo label="Rainbow animation" code="ann-rainbow">
              One class gets <span className="ann ann-s ann-rainbow" data-note="respects reduced motion">all the colours</span>.
            </Demo>
          </div>
        </article>
      </section>

      <footer>
        <span>neat—annotations · MIT</span>
        <a href="https://cdn.jsdelivr.net/gh/syabro/neat-annotations/neat-annotations.css">Get the CSS ↗</a>
      </footer>
    </main>
  );
}

function PanelTitle({ number, title, code }: { number: string; title: string; code: string }) {
  return <div className="panel-title"><span>{number}</span><h2>{title}</h2><code>{code}</code></div>;
}

function Demo({ label, code, children }: { label: string; code: string; children: React.ReactNode }) {
  return (
    <div className="demo-cell">
      <div className="demo-meta"><span>{label}</span><code>{code}</code></div>
      <p>{children}</p>
    </div>
  );
}
