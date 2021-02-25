/**
 * Performs a transition on an element
 * @param {HTMLElement} element
 * @param {Function} transition
 * @param {{
 * init: (element: HTMLElement) => void,
 * transition: (element: HTMLElement) => void,
 * onStart: (element: HTMLElement) => void,
 * beforeTransition: (element: HTMLElement) => void,
 * afterTransition: (element: HTMLElement) => void
 * }} param2
 */
export const aroundTransition = (
  element,
  { init, transition, onStart, beforeTransition, afterTransition } = {}
) => {
  return new Promise((resolve) => {
    init?.(element);

    const onTransitionStarted = () => {
      onStart?.(element);
    };

    const onTransitionEnded = () => {
      afterTransition?.(element);

      element.removeEventListener("transitionstart", onTransitionStarted);
      element.removeEventListener("transitionend", onTransitionEnded);
      resolve();
    };

    element.addEventListener("transitionstart", onTransitionStarted);
    element.addEventListener("transitionend", onTransitionEnded);

    beforeTransition?.();

    setTimeout(() => transition(element), 50);
  });
};
