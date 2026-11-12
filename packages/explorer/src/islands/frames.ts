/**
 * Light/dark for same-origin preview frames (a design language's gallery and recipes): sets
 * `data-mode` on each `iframe[data-x-mode-frame]`'s root, from `[data-x-frame-mode]` buttons. The
 * first mode comes from `[data-x-frames]`.
 */
export function bindFrameModes(): void {
  const frames = [...document.querySelectorAll<HTMLIFrameElement>('iframe[data-x-mode-frame]')];
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-x-frame-mode]')];
  let mode = document.querySelector<HTMLElement>('[data-x-frames]')?.dataset.xFrames ?? 'light';
  const paint = (frame: HTMLIFrameElement) => {
    const root = frame.contentDocument?.documentElement;
    // Before the frame loads its document is about:blank; the load listener paints it then.
    if (root && frame.contentDocument?.URL !== 'about:blank') root.dataset.mode = mode;
  };
  for (const frame of frames) {
    frame.addEventListener('load', () => paint(frame));
    paint(frame);
  }
  for (const button of buttons) {
    button.addEventListener('click', () => {
      mode = button.dataset.xFrameMode ?? 'light';
      for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.xFrameMode === mode));
      for (const frame of frames) paint(frame);
    });
  }
}
