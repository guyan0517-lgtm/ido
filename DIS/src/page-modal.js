const FOCUSABLE_SELECTOR = 'a[href], area[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';

// One reusable page layer hosts every game dialog with ordinary elements,
// without native <dialog> elements or blocking browser confirmation prompts.
export function createPageModal(element, { background = null } = {}) {
  const document = element.ownerDocument;
  const window = document.defaultView;
  const layer = element.parentElement;
  const backgrounds = (Array.isArray(background) ? background : [background]).filter(Boolean);
  let opened = false;
  let previousFocus = null;
  let lastModalFocus = null;
  let backgroundStates = [];
  let touchPosition = null;

  function isVisible(target) {
    if (!target?.isConnected || target.closest('[hidden], [inert]')) return false;
    const style = window.getComputedStyle(target);
    return style.visibility !== "hidden" && style.visibility !== "collapse" && target.getClientRects().length > 0;
  }

  function focusableElements() {
    return [...element.querySelectorAll(FOCUSABLE_SELECTOR)]
      .filter(target => target.tabIndex >= 0 && !target.matches(':disabled') && isVisible(target))
      // Positive tabindex entries precede the normal DOM-order tab sequence.
      .map((target, index) => ({ target, index, order: target.tabIndex || Infinity }))
      .sort((a, b) => a.order - b.order || a.index - b.index)
      .map(entry => entry.target);
  }

  function focusInside() {
    const target = lastModalFocus && element.contains(lastModalFocus) && !lastModalFocus.matches(':disabled') && isVisible(lastModalFocus)
      ? lastModalFocus
      : focusableElements()[0] ?? element;
    target.focus({ preventScroll: true });
  }

  function onFocus(event) {
    if (!opened) return;
    if (element.contains(event.target)) lastModalFocus = event.target;
    else focusInside();
  }

  function onKeyDown(event) {
    if (!opened) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      const cancel = new window.Event("cancel", { cancelable: true });
      if (element.dispatchEvent(cancel)) controller.close();
      return;
    }
    if (event.key !== "Tab") return;
    const targets = focusableElements();
    const current = document.activeElement;
    const index = targets.indexOf(current);
    if (!targets.length) {
      event.preventDefault();
      element.focus({ preventScroll: true });
    } else if (index < 0 || (!event.shiftKey && index === targets.length - 1) || (event.shiftKey && index === 0)) {
      event.preventDefault();
      targets[event.shiftKey ? targets.length - 1 : 0].focus({ preventScroll: true });
    }
  }

  function blockBackdrop(event) {
    if (opened && !element.contains(event.target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function canScroll(target, deltaX, deltaY) {
    const horizontal = Math.abs(deltaX) > Math.abs(deltaY);
    for (let current = target; current && layer.contains(current); current = current.parentElement) {
      const style = window.getComputedStyle(current);
      const overflow = horizontal ? style.overflowX : style.overflowY;
      if (!/(auto|scroll)/.test(overflow)) continue;
      const position = horizontal ? current.scrollLeft : current.scrollTop;
      const extent = horizontal ? current.scrollWidth - current.clientWidth : current.scrollHeight - current.clientHeight;
      const delta = horizontal ? deltaX : deltaY;
      if (extent > 0 && (delta < 0 ? position > 0 : position < extent - 1)) return true;
    }
    return false;
  }

  function onTouchStart(event) {
    const touch = event.touches.length === 1 ? event.touches[0] : null;
    touchPosition = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function onTouchMove(event) {
    if (!opened || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!element.contains(event.target)) {
      event.preventDefault();
    } else if (touchPosition) {
      const deltaX = touchPosition.x - touch.clientX;
      const deltaY = touchPosition.y - touch.clientY;
      if ((deltaX || deltaY) && !canScroll(event.target, deltaX, deltaY)) event.preventDefault();
    }
    touchPosition = { x: touch.clientX, y: touch.clientY };
  }

  function restoreBackground() {
    for (const saved of backgroundStates) {
      saved.target.inert = saved.inert;
      if (saved.inertAttribute === null) saved.target.removeAttribute("inert");
      else saved.target.setAttribute("inert", saved.inertAttribute);
      if (saved.ariaHidden === null) saved.target.removeAttribute("aria-hidden");
      else saved.target.setAttribute("aria-hidden", saved.ariaHidden);
    }
    backgroundStates = [];
  }

  const controller = {
    element,
    get open() { return opened; },
    get dataset() { return element.dataset; },
    querySelector(selector) { return element.querySelector(selector); },
    addEventListener(...args) { element.addEventListener(...args); },
    showModal() {
      if (opened) return;
      previousFocus = document.activeElement;
      lastModalFocus = null;
      opened = true;
      layer.hidden = false;
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
      document.addEventListener("keydown", onKeyDown, true);
      document.addEventListener("focusin", onFocus, true);
      // Move focus first: hiding a background that still contains the focused
      // control makes some browsers reject its aria-hidden state.
      focusInside();
      backgroundStates = backgrounds.map(target => ({
        target,
        inert: target.inert,
        inertAttribute: target.getAttribute("inert"),
        ariaHidden: target.getAttribute("aria-hidden")
      }));
      for (const target of backgrounds) {
        target.inert = true;
        target.setAttribute("inert", "");
        target.setAttribute("aria-hidden", "true");
      }
    },
    close() {
      if (!opened) return;
      opened = false;
      layer.hidden = true;
      touchPosition = null;
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocus, true);
      restoreBackground();
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
      const restoreFocus = previousFocus;
      previousFocus = null;
      lastModalFocus = null;
      if (restoreFocus?.isConnected && isVisible(restoreFocus) && !restoreFocus.matches(':disabled')) {
        restoreFocus.focus({ preventScroll: true });
      }
      element.dispatchEvent(new window.Event("close"));
    }
  };

  layer.hidden = true;
  layer.addEventListener("pointerdown", blockBackdrop);
  layer.addEventListener("click", blockBackdrop);
  layer.addEventListener("wheel", blockBackdrop, { passive: false });
  layer.addEventListener("touchstart", onTouchStart, { passive: true });
  layer.addEventListener("touchmove", onTouchMove, { passive: false });
  return controller;
}
