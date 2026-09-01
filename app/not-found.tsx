export default function NotFound() {
  return (
    <main id="main" className="shell">
      <div className="eyebrow type-broadcast">404</div>
      <h1 className="mb-2 mt-1 text-[clamp(36px,6vw,64px)] leading-[0.92]">
        No page here.
      </h1>
      <p className="lede">
        That URL is not a Pundits receipt. Try picks, takes, or the table.
      </p>
      <p className="flex flex-wrap gap-4">
        <a className="see" href="/">
          Picks →
        </a>
        <a className="see" href="/stories/">
          Takes →
        </a>
        <a className="see" href="/leaderboard/">
          Pundits →
        </a>
      </p>
    </main>
  );
}
