interface RecoveryPromptProps {
  classTitle?: string;
  message: string;
  onResume?: () => void;
  onDiscard: () => void;
}

export function RecoveryPrompt({
  classTitle,
  message,
  onResume,
  onDiscard
}: RecoveryPromptProps) {
  return (
    <main className="page-shell recovery-page" id="main-content">
      <section className="recovery-card" aria-labelledby="recovery-title">
        <p className="eyebrow">Saved session</p>
        <h1 id="recovery-title">{classTitle ? `Resume ${classTitle}?` : "Session unavailable"}</h1>
        <p>{message}</p>
        <div className="recovery-actions">
          {onResume ? (
            <button className="primary-button" type="button" onClick={onResume}>
              Resume session
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
          <button className="secondary-button" type="button" onClick={onDiscard}>
            Discard saved session
          </button>
        </div>
      </section>
    </main>
  );
}
