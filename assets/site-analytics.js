(function () {
  'use strict';

  const interactiveSelector = 'a[href], button, [role="button"], summary';

  function slug(value, fallback) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
    return normalized || fallback;
  }

  function visibleLabel(element) {
    return String(
      element.dataset.analyticsLabel ||
      element.getAttribute('aria-label') ||
      element.textContent ||
      ''
    ).replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  function sectionName(element) {
    const explicit = element.closest('[data-analytics-section]');
    if (explicit) return slug(explicit.dataset.analyticsSection, 'content');
    if (element.closest('[role="dialog"], .modal')) return 'modal';
    if (element.closest('header')) return 'header';
    if (element.closest('footer')) return 'footer';
    if (element.closest('nav')) return 'navigation';

    const section = element.closest('section[id]');
    if (section) return slug(section.id, 'content');

    const classedSection = element.closest('section');
    if (classedSection) {
      const className = typeof classedSection.className === 'string' ? classedSection.className : '';
      return slug(className.split(/\s+/)[0], 'content');
    }
    return 'content';
  }

  function safeDestination(element) {
    const href = element.getAttribute('href');
    if (!href) return { destination_type: 'action' };
    if (href.startsWith('tel:')) return { destination_type: 'phone' };
    if (href.startsWith('mailto:')) return { destination_type: 'email' };
    if (href.startsWith('#')) return { destination_type: 'section', destination_path: href.slice(0, 100) };

    try {
      const url = new URL(href, window.location.href);
      return {
        destination_type: url.hostname === window.location.hostname ? 'internal' : 'external',
        destination_host: url.hostname.slice(0, 100),
        destination_path: url.pathname.slice(0, 100)
      };
    } catch (error) {
      return { destination_type: 'action' };
    }
  }

  function classify(element, section) {
    const href = element.getAttribute('href') || '';
    const label = visibleLabel(element);
    const service = element.dataset.service || '';
    const pathname = safeDestination(element).destination_path || '';

    if (href.startsWith('tel:')) return { group: 'call', name: `call_${section}` };
    if (/google\.[^/]+\/maps|maps\.app\.goo\.gl/i.test(href)) {
      return { group: 'directions', name: `directions_${section}` };
    }
    if (element.hasAttribute('data-repair-request') || /request=repair/i.test(href)) {
      return { group: 'repair_request', name: `repair_request_${slug(service, section)}` };
    }
    if (element.closest('.language-menu') || /^\/(es|ar|ru)\/?$/.test(pathname)) {
      return { group: 'language', name: `language_${slug(pathname, 'en')}` };
    }
    if (element.closest('nav') || href.startsWith('#')) {
      return { group: 'navigation', name: `navigation_${slug(href || label, section)}` };
    }
    if (element.type === 'submit' || /submit/i.test(element.id || '')) {
      return { group: 'form', name: `form_${slug(element.id || label, 'submit')}` };
    }
    if (element.closest('[role="dialog"], .modal')) {
      return { group: 'modal', name: `modal_${slug(element.id || label, 'action')}` };
    }
    return { group: 'other', name: `${section}_${slug(element.id || label, 'action')}` };
  }

  function sendEvent(eventName, parameters) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, parameters);
        return;
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...parameters });
    } catch (error) {
      // Analytics must never interrupt the customer experience.
    }
  }

  function trackInteraction(element, event) {
    if (element.matches(':disabled, [aria-disabled="true"]')) return;

    const section = sectionName(element);
    const explicitName = element.dataset.analyticsId || element.dataset.track;
    const classification = classify(element, section);
    const buttonName = slug(explicitName || classification.name, 'unknown_action');
    const parameters = {
      button_name: buttonName,
      button_group: classification.group,
      button_section: section,
      button_text: visibleLabel(element) || buttonName,
      page_path: window.location.pathname,
      page_language: document.body.dataset.locale || document.documentElement.lang || 'en',
      interaction_method: event.detail === 0 ? 'keyboard' : 'pointer',
      ...safeDestination(element),
      transport_type: 'beacon'
    };

    sendEvent('button_click', parameters);

    const actionEvents = {
      call: 'click_to_call',
      directions: 'get_directions',
      repair_request: 'repair_request_click',
      language: 'language_change'
    };
    if (actionEvents[classification.group]) {
      sendEvent(actionEvents[classification.group], parameters);
    }
  }

  document.addEventListener('click', function (event) {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const element = target && target.closest(interactiveSelector);
    if (!element) return;
    trackInteraction(element, event);
  });
})();
