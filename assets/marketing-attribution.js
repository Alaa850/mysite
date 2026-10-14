(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.install(root);
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const contextKey = 'tecpro99_ad_attribution_v1';
  const consentKey = 'tecpro99_ad_measurement_consent_v1';
  const contextLifetime = 30 * 24 * 60 * 60 * 1000;
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const labels = {
    en: { title: 'Advertising measurement', text: 'May we share your ad click reference, event times, reservations and paid repair value with OpenAI to measure ad results? No names, phone numbers or emails. Declining does not affect your request.', allow: 'Allow', decline: 'Decline', choices: 'Privacy choices', optional: 'Allow advertising measurement (optional)' },
    es: { title: 'Medición publicitaria', text: '¿Podemos compartir con OpenAI la referencia del clic, las fechas de los eventos, las reservas y el importe del servicio pagado para medir anuncios? Sin nombres, teléfonos ni correos. Rechazar no afecta su solicitud.', allow: 'Permitir', decline: 'Rechazar', choices: 'Opciones de privacidad', optional: 'Permitir medición publicitaria (opcional)' },
    ar: { title: 'قياس نتائج الإعلانات', text: 'هل تسمح بمشاركة مرجع نقرة الإعلان ووقت الأحداث والحجوزات وقيمة الإصلاح المدفوع مع OpenAI لقياس النتائج؟ دون أسماء أو أرقام هواتف أو بريد إلكتروني. الرفض لا يؤثر في طلبك.', allow: 'السماح', decline: 'الرفض', choices: 'خيارات الخصوصية', optional: 'السماح بقياس نتائج الإعلانات (اختياري)' },
    ru: { title: 'Измерение рекламы', text: 'Разрешаете передавать OpenAI идентификатор клика, время событий, бронирования и сумму оплаченного ремонта для измерения рекламы? Без имён, телефонов и почты. Отказ не влияет на заявку.', allow: 'Разрешить', decline: 'Отклонить', choices: 'Настройки приватности', optional: 'Разрешить измерение рекламы (необязательно)' }
  };

  function label(value) {
    return typeof value === 'string' && /^[a-z0-9_.-]{1,128}$/i.test(value) ? value : '';
  }

  function normalizeContext(input, now) {
    if (!input || typeof input !== 'object' || !Number.isFinite(input.at)
      || input.at > now + 300000 || now - input.at >= contextLifetime) return null;
    const output = { at: input.at };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
      const value = label(input[key]);
      if (value) output[key] = value;
    });
    const reference = input.oppref;
    if (typeof reference === 'string' && /^[a-z0-9._~+\/=\-]{1,1024}$/i.test(reference)) output.oppref = reference;
    return ['chatgpt', 'openai'].includes((output.utm_source || '').toLowerCase()) ? output : null;
  }

  function fromUrl(value, now) {
    try {
      const url = new URL(value);
      const input = { at: now, oppref: url.searchParams.get('oppref') || url.searchParams.get('click_id') || '' };
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => { input[key] = url.searchParams.get(key); });
      return normalizeContext(input, now);
    } catch (_) { return null; }
  }

  function normalizeConsent(input, now) {
    return input && input.version === 1 && typeof input.allowed === 'boolean'
      && Number.isFinite(input.at) && input.at <= now + 300000 && now - input.at < consentLifetime ? input : null;
  }

  function requestPageUrl(value, consent, context, now) {
    try {
      const url = new URL(value);
      url.search = '';
      url.hash = '';
      const approved = normalizeConsent(consent, now);
      const attribution = normalizeContext(context, now);
      if (approved && approved.allowed && attribution) {
        Object.entries(attribution).forEach(([key, item]) => { if (key !== 'at') url.searchParams.set(key, item); });
        url.searchParams.set('tp_measurement', '1');
        url.searchParams.set('tp_measurement_at', new Date(approved.at).toISOString());
      }
      if (url.toString().length > 2048) { url.search = ''; }
      return url.toString();
    } catch (_) { return ''; }
  }

  function install(win) {
    if (win.TecPro99Measurement) return;
    let consent = null;
    let context = null;
    let panel;
    let formChoice;
    const language = (win.document.documentElement.lang || 'en').split('-')[0];
    const copy = labels[language] || labels.en;
    function read(key) { try { return JSON.parse(win.localStorage.getItem(key) || 'null'); } catch (_) { return null; } }
    function write(key, value) { try { value ? win.localStorage.setItem(key, JSON.stringify(value)) : win.localStorage.removeItem(key); } catch (_) { /* In-memory consent still works. */ } }
    function capture() {
      if (!consent || !consent.allowed) return;
      context = fromUrl(win.location.href, Date.now()) || normalizeContext(read(contextKey), Date.now());
      if (context) write(contextKey, context);
    }
    function choose(allowed) {
      consent = { version: 1, allowed, at: Date.now() };
      write(consentKey, consent);
      if (allowed) capture();
      else { context = null; write(contextKey, null); }
      if (panel) panel.hidden = true;
      if (formChoice) formChoice.checked = allowed;
    }
    consent = normalizeConsent(read(consentKey), Date.now());
    if (consent && consent.allowed) capture();
    else write(contextKey, null);
    win.TecPro99Measurement = { requestPageUrl: () => requestPageUrl(win.location.href, consent, context, Date.now()) };

    function mount() {
      panel = win.document.createElement('section');
      panel.className = 'marketing-consent';
      panel.setAttribute('aria-label', copy.title);
      panel.hidden = !!consent || !fromUrl(win.location.href, Date.now());
      const title = win.document.createElement('strong');
      title.textContent = copy.title;
      const text = win.document.createElement('p');
      text.textContent = copy.text;
      const actions = win.document.createElement('div');
      actions.className = 'marketing-consent-actions';
      [ [copy.allow, true], [copy.decline, false] ].forEach(([name, allowed]) => {
        const button = win.document.createElement('button');
        button.type = 'button'; button.textContent = name;
        button.className = allowed ? 'marketing-consent-primary' : '';
        button.addEventListener('click', () => choose(allowed));
        actions.append(button);
      });
      panel.append(title, text, actions);
      const choices = win.document.createElement('button');
      choices.type = 'button'; choices.className = 'marketing-privacy-choices'; choices.textContent = copy.choices;
      choices.addEventListener('click', () => { panel.hidden = false; panel.querySelector('button').focus(); });
      win.document.body.append(panel, choices);
      const form = win.document.getElementById('repairRequestForm');
      if (form) {
        const wrapper = win.document.createElement('label');
        wrapper.className = 'marketing-form-choice';
        formChoice = win.document.createElement('input');
        formChoice.type = 'checkbox'; formChoice.checked = !!(consent && consent.allowed);
        formChoice.addEventListener('change', () => choose(formChoice.checked));
        const labelText = win.document.createElement('span'); labelText.textContent = copy.optional;
        const notice = win.document.createElement('small'); notice.textContent = copy.text;
        wrapper.append(formChoice, labelText, notice);
        const contactConsent = form.querySelector('.consent-field');
        if (contactConsent) contactConsent.before(wrapper); else form.append(wrapper);
      }
    }
    if (win.document.readyState === 'loading') win.document.addEventListener('DOMContentLoaded', mount, { once: true });
    else mount();
  }

  return { normalizeContext, normalizeConsent, fromUrl, requestPageUrl, install };
});
