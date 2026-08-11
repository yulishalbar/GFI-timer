interface PwaUpdatePromptProps {
  isApplying: boolean;
  isDeferred: boolean;
  isVisible: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
}

export function PwaUpdatePrompt({
  isApplying,
  isDeferred,
  isVisible,
  onDismiss,
  onUpdate
}: PwaUpdatePromptProps) {
  if (!isVisible || isDeferred) {
    return null;
  }

  return (
    <aside className="update-prompt" aria-labelledby="update-prompt-title" role="status">
      <div>
        <strong id="update-prompt-title">A new version is ready</strong>
        <span>Update now while no class is running.</span>
      </div>
      <div className="update-prompt__actions">
        <button type="button" className="secondary-button" onClick={onDismiss}>
          Later
        </button>
        <button type="button" className="primary-button" disabled={isApplying} onClick={onUpdate}>
          {isApplying ? "Updating…" : "Update now"}
        </button>
      </div>
    </aside>
  );
}
