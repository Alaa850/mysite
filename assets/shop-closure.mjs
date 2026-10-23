import { SHOP_CLOSURE, getShopClosure } from './shop-closure-config.mjs';

const copy = {
  en: { title: 'Closed for a holiday', body: 'Our shop is taking a short break. Online repair requests are temporarily paused.', reopen: 'Repair requests reopen', zone: '(Chicago time)', label: 'Temporary shop closure' },
  es: { title: 'Cerrado por descanso', body: 'Nuestra tienda está tomando un breve descanso. Las solicitudes de reparación están temporalmente suspendidas.', reopen: 'Las solicitudes se reanudan', zone: '(hora de Chicago)', label: 'Cierre temporal de la tienda' },
  ar: { title: 'المحل مغلق مؤقتاً للعطلة', body: 'نأخذ استراحة قصيرة. استقبال طلبات الإصلاح عبر الموقع متوقف مؤقتاً.', reopen: 'يُستأنف استقبال الطلبات في', zone: '(بتوقيت شيكاغو)', label: 'إشعار عطلة المحل' },
  ru: { title: 'Магазин временно закрыт на выходной', body: 'У нас небольшой перерыв. Приём заявок на ремонт временно приостановлен.', reopen: 'Приём заявок возобновится', zone: '(по времени Чикаго)', label: 'Временное закрытие магазина' }
};
const language = (document.documentElement.lang || 'en').split('-')[0];
const text = copy[language] || copy.en;
const locales = { en: 'en-US', es: 'es-US', ar: 'ar', ru: 'ru-RU' };
const controls = new Map();
let notice;
let timer;
let observer;

function requestControl(element) {
  if (!(element instanceof Element)) return null;
  const candidate = element.closest('[data-repair-request], #claimPromo, #repairSubmitButton, #confirmRepairSubmit, a[href*="request=repair"]');
  if (!candidate) return null;
  if (candidate.tagName === 'A') {
    const url = new URL(candidate.href, location.href);
    if (url.origin !== location.origin || url.searchParams.get('request') !== 'repair') return null;
  }
  return candidate;
}

function blockRequests(event) {
  if (!getShopClosure()) return;
  if (!requestControl(event.target) && !(event.type === 'submit' && event.target.id === 'repairRequestForm')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  notice?.focus({ preventScroll: false });
}

function pauseControls() {
  for (const control of document.querySelectorAll('[data-repair-request], #claimPromo, #repairSubmitButton, #confirmRepairSubmit, a[href*="request=repair"]')) {
    if (!controls.has(control)) controls.set(control, { disabled: control.disabled, aria: control.getAttribute('aria-disabled'), describedBy: control.getAttribute('aria-describedby') });
    if ('disabled' in control) control.disabled = true;
    control.setAttribute('aria-disabled', 'true');
    const description = controls.get(control).describedBy;
    control.setAttribute('aria-describedby', [description, 'shop-closure-description'].filter(Boolean).join(' '));
  }
  for (const id of ['promoModal', 'repairRequestModal']) {
    const modal = document.getElementById(id);
    if (modal?.classList.contains('is-open')) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
  }
}

function update() {
  clearTimeout(timer);
  const active = getShopClosure();
  if (!active) {
    observer?.disconnect();
    observer = null;
    delete document.documentElement.dataset.shopClosed;
    document.querySelector('.shop-closure-header')?.classList.remove('shop-closure-header');
    notice?.remove();
    notice = null;
    for (const [control, original] of controls) {
      if ('disabled' in control) control.disabled = original.disabled;
      for (const [name, value] of [['aria-disabled', original.aria], ['aria-describedby', original.describedBy]]) {
        value === null ? control.removeAttribute(name) : control.setAttribute(name, value);
      }
    }
    controls.clear();
    const untilStart = Date.parse(SHOP_CLOSURE.startsAt) - Date.now();
    if (untilStart > 0) timer = setTimeout(update, Math.min(untilStart + 10, 2147483647));
    return;
  }
  document.documentElement.dataset.shopClosed = 'true';
  if (!notice) {
    notice = document.createElement('section');
    notice.className = 'shop-closure-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-label', text.label);
    notice.tabIndex = -1;
    const inner = document.createElement('div');
    inner.className = 'shop-closure-inner';
    const heading = document.createElement('strong');
    heading.textContent = text.title;
    const description = document.createElement('p');
    description.id = 'shop-closure-description';
    description.textContent = text.body;
    const reopening = document.createElement('p');
    const time = document.createElement('time');
    time.dateTime = active.reopensAt;
    time.textContent = new Intl.DateTimeFormat(locales[language] || 'en-US', {
      timeZone: active.timeZone, weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(new Date(active.reopensAt));
    reopening.append(`${text.reopen} `, time, ` ${text.zone}`);
    inner.append(heading, description, reopening);
    notice.append(inner);
    const header = document.querySelector('header');
    if (header && getComputedStyle(header).position === 'absolute') header.classList.add('shop-closure-header');
    header ? header.insertAdjacentElement('afterend', notice) : document.body.prepend(notice);
    observer = new MutationObserver(() => pauseControls());
    for (const id of ['promoModal', 'repairRequestModal']) {
      const modal = document.getElementById(id);
      if (modal) observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
  }
  pauseControls();
  timer = setTimeout(update, Math.min(Date.parse(active.reopensAt) - Date.now() + 25, 2147483647));
}

document.addEventListener('click', blockRequests, true);
document.addEventListener('submit', blockRequests, true);
document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
window.addEventListener('pageshow', update);
update();
