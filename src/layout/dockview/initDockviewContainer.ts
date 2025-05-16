export function initDockviewContainer(containerId: string) {
  const updateSize = () => {
    const container = document.getElementById(containerId);
    if (!container || !container.parentElement) return;

    const parent = container.parentElement;
    const rect = parent.getBoundingClientRect();

    requestAnimationFrame(() => {
      container.style.position = "absolute";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = `${Math.floor(rect.width)}px`;
      container.style.height = `${Math.floor(rect.height)}px`;
    });
  };

  // Initial size
  updateSize();

  const observer = new ResizeObserver(updateSize);
  const container = document.getElementById(containerId);
  if (container?.parentElement) {
    observer.observe(container.parentElement);
  }

  return () => observer.disconnect();
}
