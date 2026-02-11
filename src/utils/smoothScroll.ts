/**
 * Smooth scroll to element or position
 */
export function smoothScrollTo(target: HTMLElement | number, options: ScrollIntoViewOptions = {}) {
  if (typeof target === 'number') {
    window.scrollTo({
      top: target,
      behavior: 'auto',
    });
  } else {
    target.scrollIntoView({
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
      ...options,
    });
  }
}

/**
 * Scroll to top with smooth animation
 */
export function scrollToTop() {
  smoothScrollTo(0);
}

/**
 * Scroll to element by ID
 */
export function scrollToElement(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    smoothScrollTo(top);
  }
}

/**
 * Initialize smooth scroll behavior for anchor links
 */
export function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a[href^="#"]');
    if (!target) return;

    const href = target.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    const element = document.querySelector(href);
    if (element instanceof HTMLElement) {
      smoothScrollTo(element);
    }
  });
}

/**
 * Add normal scroll behavior (disabled smooth scroll)
 */
export function enableSmoothScrollCSS() {
  // Smooth scroll disabled - using normal scroll behavior
}
