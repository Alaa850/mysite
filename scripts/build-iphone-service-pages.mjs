import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const shared = {
  phone: '(773) 628-7132',
  phoneHref: 'tel:+17736287132',
  address: '4362 N Elston Ave, Chicago, IL 60641',
  directions: 'https://maps.app.goo.gl/kFwXAZ86dwTP5Ac9A',
  image: 'https://techpro99.com/assets/service-screen.jpg'
};

const locales = {
  en: {
    lang: 'en-US', htmlLang: 'en', dir: 'ltr', code: 'EN', path: '/iphone-repair-chicago/', home: '/',
    title: 'iPhone Repair Chicago | Screen, Battery & Charging Port | TecPro99',
    description: 'Local iPhone repair in Chicago for cracked screens, batteries, charging ports, back glass, cameras, water damage and diagnostics at TecPro99 on Elston Ave.',
    navServices: 'Repairs', navModels: 'iPhone models', navProcess: 'How it works', navFaq: 'FAQ',
    eyebrow: 'Local iPhone repair in Chicago', h1: 'iPhone repair in Chicago that gets your day moving again.',
    heroCopy: 'Cracked screen, fast-draining battery, charging trouble or damaged back glass? Bring your iPhone to TecPro99 for a clear diagnosis and repair plan.',
    request: 'Request an iPhone repair', call: 'Call TecPro99', directions: 'Get directions',
    facts: [['Chicago shop', '4362 N Elston Ave'], ['Repair options', 'Screen, battery, charging and more'], ['Before you visit', 'Ask us to confirm parts and timing']],
    repairsEyebrow: 'Common iPhone repairs', repairsTitle: 'Start with the problem you can see.',
    repairsCopy: 'The exact repair depends on the iPhone model and diagnosis. Contact us first and we will confirm the available path before work begins.',
    repairs: [
      ['Cracked screen repair', 'Broken glass, black display, lines, flicker or touch problems.', 'service-screen.jpg', 'Technician repairing a cracked iPhone screen'],
      ['Battery replacement', 'Fast drain, unexpected shutdowns, swelling or a battery that will not hold a charge.', 'service-battery.jpg', 'iPhone battery replacement service'],
      ['Back glass repair', 'Cracked or damaged rear glass that needs careful replacement.', 'service-backglass.jpg', 'iPhone back glass repair'],
      ['Charging and diagnostics', 'Loose charging connection, no power, camera trouble, liquid damage or a fault that needs testing.', 'service-board.jpg', 'iPhone charging and diagnostic repair']
    ],
    modelsEyebrow: 'Model coverage', modelsTitle: 'Repair support across iPhone generations.',
    modelsCopy: 'We work with many recent and earlier iPhone models. Part availability and the repair method vary, so send the exact model when possible.',
    modelGroups: [['Current generations', 'iPhone 17, iPhone 16 and iPhone 15 families'], ['Popular models', 'iPhone 14, 13, 12 and 11 families'], ['Earlier models', 'iPhone XS, XR, X, SE, 8, 7 and earlier compatible models']],
    processEyebrow: 'A clear repair process', processTitle: 'Know what happens before work begins.',
    steps: [['1', 'Tell us the model and issue', 'Send a repair request or call with the iPhone model and what happened.'], ['2', 'Confirm the repair plan', 'We check the symptoms, compatible part options, expected price and timing.'], ['3', 'Approve the work', 'Repair starts after the plan and estimate are clear to you.'], ['4', 'Test and pick up', 'The device is checked after service and you are contacted when it is ready.']],
    areaEyebrow: 'Northwest Chicago', areaTitle: 'A local iPhone repair shop near the neighborhoods you use every day.',
    areaCopy: 'TecPro99 is on Elston Avenue in Chicago, convenient for Portage Park, Old Irving Park, Mayfair, Jefferson Park, Albany Park and Avondale. Walk in or contact us before your visit so we can confirm the right repair option.',
    faqTitle: 'iPhone repair questions',
    faqs: [
      ['How much does iPhone repair cost in Chicago?', 'The price depends on the model, damaged component and compatible part option. Send the model and issue for a current estimate before repair begins.'],
      ['Can you fix an iPhone screen that is black or has no touch?', 'Often, but those symptoms can come from the display, connectors or board damage. We inspect the device before confirming the repair.'],
      ['How long will my iPhone repair take?', 'Timing depends on the model, diagnosis and part availability. Contact TecPro99 before visiting and we will give you the clearest available timing.'],
      ['Do you repair iPhone batteries, charging ports and back glass?', 'Yes, TecPro99 handles many battery, charging, back-glass and diagnostic repairs. Availability depends on the model and condition of the device.'],
      ['Where is TecPro99 located?', `TecPro99 is located at ${shared.address}. Call ${shared.phone} for repair assistance.`]
    ],
    finalTitle: 'Tell us what happened to your iPhone.', finalCopy: 'Send the model and symptoms. We will follow up with the next step, current options and visit details.',
    homeLabel: 'TecPro99 home', languageLabel: 'Choose language', independent: 'TecPro99 is an independent repair business and is not affiliated with Apple Inc. Apple and iPhone are trademarks of Apple Inc.',
    footer: 'iPhone, phone, tablet, console and electronics repair in Chicago.'
  },
  es: {
    lang: 'es-US', htmlLang: 'es', dir: 'ltr', code: 'ES', path: '/es/reparacion-iphone-chicago/', home: '/es/',
    title: 'Reparación de iPhone en Chicago | Pantalla y batería | TecPro99',
    description: 'Reparación local de iPhone en Chicago: pantallas rotas, baterías, puertos de carga, vidrio trasero, cámaras, daño por líquido y diagnóstico en TecPro99.',
    navServices: 'Reparaciones', navModels: 'Modelos de iPhone', navProcess: 'Cómo funciona', navFaq: 'Preguntas',
    eyebrow: 'Reparación local de iPhone en Chicago', h1: 'Reparación de iPhone en Chicago para que tu día siga adelante.',
    heroCopy: '¿Pantalla rota, batería que se descarga, problemas de carga o vidrio trasero dañado? Trae tu iPhone a TecPro99 para recibir un diagnóstico y un plan claros.',
    request: 'Solicitar reparación de iPhone', call: 'Llamar a TecPro99', directions: 'Cómo llegar',
    facts: [['Tienda en Chicago', '4362 N Elston Ave'], ['Opciones de reparación', 'Pantalla, batería, carga y más'], ['Antes de venir', 'Confirma con nosotros la pieza y el tiempo']],
    repairsEyebrow: 'Reparaciones comunes de iPhone', repairsTitle: 'Empieza por el problema que puedes ver.',
    repairsCopy: 'La reparación exacta depende del modelo y del diagnóstico. Contáctanos primero para confirmar las opciones antes de comenzar el trabajo.',
    repairs: [
      ['Reparación de pantalla rota', 'Vidrio roto, pantalla negra, líneas, parpadeo o problemas táctiles.', 'service-screen.jpg', 'Técnico reparando una pantalla de iPhone rota'],
      ['Cambio de batería', 'Descarga rápida, apagados inesperados, hinchazón o batería que no mantiene la carga.', 'service-battery.jpg', 'Servicio de cambio de batería de iPhone'],
      ['Reparación de vidrio trasero', 'Vidrio posterior roto o dañado que necesita un reemplazo cuidadoso.', 'service-backglass.jpg', 'Reparación del vidrio trasero de iPhone'],
      ['Carga y diagnóstico', 'Conexión floja, sin energía, problemas de cámara, líquido o una falla que necesita pruebas.', 'service-board.jpg', 'Diagnóstico y reparación de carga de iPhone']
    ],
    modelsEyebrow: 'Cobertura de modelos', modelsTitle: 'Soporte para distintas generaciones de iPhone.',
    modelsCopy: 'Trabajamos con muchos modelos recientes y anteriores. La disponibilidad de piezas y el método varían; envía el modelo exacto cuando sea posible.',
    modelGroups: [['Generaciones actuales', 'Familias iPhone 17, iPhone 16 y iPhone 15'], ['Modelos populares', 'Familias iPhone 14, 13, 12 y 11'], ['Modelos anteriores', 'iPhone XS, XR, X, SE, 8, 7 y modelos compatibles anteriores']],
    processEyebrow: 'Un proceso claro', processTitle: 'Sabrás qué ocurrirá antes de comenzar.',
    steps: [['1', 'Cuéntanos el modelo y el problema', 'Envía una solicitud o llama con el modelo y lo que ocurrió.'], ['2', 'Confirma el plan', 'Revisamos síntomas, piezas compatibles, precio estimado y tiempo.'], ['3', 'Aprueba el trabajo', 'La reparación comienza cuando el plan y el precio están claros.'], ['4', 'Prueba y recoge', 'Probamos el dispositivo y te avisamos cuando esté listo.']],
    areaEyebrow: 'Noroeste de Chicago', areaTitle: 'Una tienda local de reparación de iPhone cerca de tus vecindarios.',
    areaCopy: 'TecPro99 está en Elston Avenue, cerca de Portage Park, Old Irving Park, Mayfair, Jefferson Park, Albany Park y Avondale. Visítanos o contáctanos antes para confirmar la reparación adecuada.',
    faqTitle: 'Preguntas sobre reparación de iPhone',
    faqs: [
      ['¿Cuánto cuesta reparar un iPhone en Chicago?', 'El precio depende del modelo, la pieza dañada y la opción compatible. Envía el modelo y el problema para recibir un estimado actual antes de comenzar.'],
      ['¿Pueden reparar una pantalla negra o sin respuesta táctil?', 'Con frecuencia sí, pero esos síntomas también pueden venir de conectores o de la placa. Inspeccionamos el equipo antes de confirmar.'],
      ['¿Cuánto tarda una reparación de iPhone?', 'El tiempo depende del modelo, diagnóstico y disponibilidad de piezas. Contáctanos antes de venir para recibir el tiempo más claro disponible.'],
      ['¿Reparan baterías, puertos de carga y vidrio trasero?', 'Sí, TecPro99 realiza muchas reparaciones de batería, carga, vidrio trasero y diagnóstico. La disponibilidad depende del modelo y estado.'],
      ['¿Dónde está TecPro99?', `TecPro99 está en ${shared.address}. Llama al ${shared.phone} para recibir ayuda.`]
    ],
    finalTitle: 'Cuéntanos qué le ocurrió a tu iPhone.', finalCopy: 'Envía el modelo y los síntomas. Te responderemos con el siguiente paso, las opciones actuales y los detalles de la visita.',
    homeLabel: 'Inicio de TecPro99', languageLabel: 'Elegir idioma', independent: 'TecPro99 es un negocio de reparación independiente y no está afiliado con Apple Inc. Apple y iPhone son marcas comerciales de Apple Inc.',
    footer: 'Reparación de iPhone, celulares, tabletas, consolas y electrónicos en Chicago.'
  },
  ar: {
    lang: 'ar-US', htmlLang: 'ar', dir: 'rtl', code: 'AR', path: '/ar/iphone-repair-chicago/', home: '/ar/',
    title: 'تصليح آيفون في شيكاغو | الشاشة والبطارية والشحن | TecPro99',
    description: 'تصليح آيفون محلي في شيكاغو للشاشات المكسورة والبطاريات ومنافذ الشحن والزجاج الخلفي والكاميرات وأضرار السوائل والفحص لدى TecPro99.',
    navServices: 'الإصلاحات', navModels: 'طرازات آيفون', navProcess: 'كيف نعمل', navFaq: 'الأسئلة',
    eyebrow: 'تصليح آيفون محلي في شيكاغو', h1: 'تصليح آيفون في شيكاغو يعيد يومك إلى مساره.',
    heroCopy: 'شاشة مكسورة أو بطارية تفرغ بسرعة أو مشكلة شحن أو زجاج خلفي تالف؟ أحضر جهاز آيفون إلى TecPro99 للحصول على فحص وخطة إصلاح واضحين.',
    request: 'اطلب تصليح آيفون', call: 'اتصل بـ TecPro99', directions: 'احصل على الاتجاهات',
    facts: [['متجر في شيكاغو', '4362 N Elston Ave'], ['خيارات الإصلاح', 'الشاشة والبطارية والشحن والمزيد'], ['قبل الزيارة', 'اسألنا لتأكيد القطعة والوقت']],
    repairsEyebrow: 'أعطال آيفون الشائعة', repairsTitle: 'ابدأ بالمشكلة التي يمكنك رؤيتها.',
    repairsCopy: 'يعتمد الإصلاح الدقيق على طراز آيفون ونتيجة الفحص. تواصل معنا أولًا لتأكيد الخيارات المتاحة قبل بدء العمل.',
    repairs: [
      ['تصليح الشاشة المكسورة', 'زجاج مكسور أو شاشة سوداء أو خطوط أو وميض أو مشكلة في اللمس.', 'service-screen.jpg', 'فني يصلح شاشة آيفون مكسورة'],
      ['استبدال البطارية', 'نفاد سريع أو إيقاف مفاجئ أو انتفاخ أو بطارية لا تحتفظ بالشحن.', 'service-battery.jpg', 'خدمة استبدال بطارية آيفون'],
      ['تصليح الزجاج الخلفي', 'زجاج خلفي مكسور أو تالف يحتاج إلى استبدال دقيق.', 'service-backglass.jpg', 'تصليح الزجاج الخلفي لآيفون'],
      ['الشحن والفحص', 'منفذ شحن غير ثابت أو جهاز لا يعمل أو مشكلة كاميرا أو سوائل أو عطل يحتاج إلى اختبار.', 'service-board.jpg', 'فحص وتصليح شحن آيفون']
    ],
    modelsEyebrow: 'الطرازات التي نخدمها', modelsTitle: 'دعم الإصلاح عبر أجيال آيفون المختلفة.',
    modelsCopy: 'نعمل على العديد من طرازات آيفون الحديثة والقديمة. يختلف توفر القطع وطريقة الإصلاح، لذلك أرسل الطراز الدقيق عندما يكون ذلك ممكنًا.',
    modelGroups: [['الأجيال الحالية', 'عائلات iPhone 17 وiPhone 16 وiPhone 15'], ['الطرازات الشائعة', 'عائلات iPhone 14 و13 و12 و11'], ['الطرازات الأقدم', 'iPhone XS وXR وX وSE و8 و7 والطرازات الأقدم المتوافقة']],
    processEyebrow: 'عملية إصلاح واضحة', processTitle: 'اعرف ما سيحدث قبل بدء العمل.',
    steps: [['1', 'أخبرنا بالطراز والمشكلة', 'أرسل طلبًا أو اتصل واذكر طراز آيفون وما حدث.'], ['2', 'أكد خطة الإصلاح', 'نفحص الأعراض وخيارات القطع المتوافقة والسعر المتوقع والوقت.'], ['3', 'وافق على العمل', 'يبدأ الإصلاح بعد أن تصبح الخطة والتكلفة واضحتين لك.'], ['4', 'الاختبار والاستلام', 'نفحص الجهاز بعد الخدمة ونتواصل معك عندما يصبح جاهزًا.']],
    areaEyebrow: 'شمال غرب شيكاغو', areaTitle: 'متجر محلي لتصليح آيفون قريب من أحياء شيكاغو.',
    areaCopy: 'يقع TecPro99 على شارع Elston في شيكاغو بالقرب من Portage Park وOld Irving Park وMayfair وJefferson Park وAlbany Park وAvondale. زرنا أو تواصل معنا قبل الزيارة لتأكيد خيار الإصلاح المناسب.',
    faqTitle: 'أسئلة عن تصليح آيفون',
    faqs: [
      ['كم يكلف تصليح آيفون في شيكاغو؟', 'يعتمد السعر على الطراز والقطعة التالفة وخيار القطعة المتوافق. أرسل الطراز والمشكلة للحصول على تقدير حالي قبل بدء الإصلاح.'],
      ['هل يمكنكم تصليح شاشة آيفون السوداء أو التي لا تستجيب للمس؟', 'غالبًا نعم، لكن هذه الأعراض قد تنتج أيضًا عن الموصلات أو عطل في اللوحة. نفحص الجهاز قبل تأكيد الإصلاح.'],
      ['كم يستغرق تصليح آيفون؟', 'يعتمد الوقت على الطراز ونتيجة الفحص وتوفر القطع. تواصل معنا قبل الزيارة للحصول على أوضح وقت متاح.'],
      ['هل تصلحون البطاريات ومنافذ الشحن والزجاج الخلفي؟', 'نعم، يقدم TecPro99 العديد من خدمات البطارية والشحن والزجاج الخلفي والفحص. يعتمد التوفر على الطراز وحالة الجهاز.'],
      ['أين يقع TecPro99؟', `يقع TecPro99 في ${shared.address}. اتصل على ${shared.phone} للمساعدة في الإصلاح.`]
    ],
    finalTitle: 'أخبرنا بما حدث لجهاز آيفون.', finalCopy: 'أرسل الطراز والأعراض، وسنتواصل معك بالخطوة التالية والخيارات الحالية وتفاصيل الزيارة.',
    homeLabel: 'الصفحة الرئيسية لـ TecPro99', languageLabel: 'اختر اللغة', independent: 'TecPro99 متجر إصلاح مستقل وغير تابع لشركة Apple Inc. علامتا Apple وiPhone التجاريتان مملوكتان لشركة Apple Inc.',
    footer: 'تصليح آيفون والهواتف والأجهزة اللوحية وأجهزة الألعاب والإلكترونيات في شيكاغو.'
  },
  ru: {
    lang: 'ru-US', htmlLang: 'ru', dir: 'ltr', code: 'RU', path: '/ru/remont-iphone-chicago/', home: '/ru/',
    title: 'Ремонт iPhone в Чикаго | Экран, батарея и зарядка | TecPro99',
    description: 'Ремонт iPhone в Чикаго: разбитые экраны, батареи, разъемы зарядки, заднее стекло, камеры, последствия влаги и диагностика в TecPro99.',
    navServices: 'Ремонт', navModels: 'Модели iPhone', navProcess: 'Как это работает', navFaq: 'Вопросы',
    eyebrow: 'Локальный ремонт iPhone в Чикаго', h1: 'Ремонт iPhone в Чикаго, который возвращает ваш день в норму.',
    heroCopy: 'Разбитый экран, быстро разряжающаяся батарея, проблемы с зарядкой или поврежденное заднее стекло? Принесите iPhone в TecPro99 для понятной диагностики и плана ремонта.',
    request: 'Оставить заявку на ремонт iPhone', call: 'Позвонить в TecPro99', directions: 'Построить маршрут',
    facts: [['Сервис в Чикаго', '4362 N Elston Ave'], ['Варианты ремонта', 'Экран, батарея, зарядка и другое'], ['Перед визитом', 'Уточните наличие детали и сроки']],
    repairsEyebrow: 'Частые ремонты iPhone', repairsTitle: 'Начните с проблемы, которую можно увидеть.',
    repairsCopy: 'Точный ремонт зависит от модели iPhone и диагностики. Сначала свяжитесь с нами, чтобы уточнить доступные варианты до начала работ.',
    repairs: [
      ['Замена разбитого экрана', 'Разбитое стекло, черный экран, полосы, мерцание или проблемы с сенсором.', 'service-screen.jpg', 'Мастер ремонтирует разбитый экран iPhone'],
      ['Замена батареи', 'Быстрая разрядка, внезапные выключения, вздутие или батарея не держит заряд.', 'service-battery.jpg', 'Услуга замены батареи iPhone'],
      ['Ремонт заднего стекла', 'Разбитое или поврежденное заднее стекло, требующее аккуратной замены.', 'service-backglass.jpg', 'Ремонт заднего стекла iPhone'],
      ['Зарядка и диагностика', 'Нестабильный разъем, нет питания, проблемы с камерой, влага или неисправность для проверки.', 'service-board.jpg', 'Диагностика и ремонт зарядки iPhone']
    ],
    modelsEyebrow: 'Поддерживаемые модели', modelsTitle: 'Ремонт разных поколений iPhone.',
    modelsCopy: 'Мы работаем со многими новыми и ранними моделями iPhone. Наличие деталей и способ ремонта различаются, поэтому по возможности укажите точную модель.',
    modelGroups: [['Текущие поколения', 'Линейки iPhone 17, iPhone 16 и iPhone 15'], ['Популярные модели', 'Линейки iPhone 14, 13, 12 и 11'], ['Ранние модели', 'iPhone XS, XR, X, SE, 8, 7 и более ранние совместимые модели']],
    processEyebrow: 'Понятный процесс', processTitle: 'Вы знаете, что произойдет до начала работ.',
    steps: [['1', 'Сообщите модель и проблему', 'Отправьте заявку или позвоните, указав модель iPhone и что произошло.'], ['2', 'Подтвердите план', 'Мы проверяем симптомы, совместимые детали, ожидаемую цену и сроки.'], ['3', 'Одобрите работу', 'Ремонт начинается после согласования плана и стоимости.'], ['4', 'Проверка и выдача', 'После ремонта устройство тестируется, и мы сообщаем о готовности.']],
    areaEyebrow: 'Северо-запад Чикаго', areaTitle: 'Местный сервис iPhone рядом с районами, где вы живете и работаете.',
    areaCopy: 'TecPro99 находится на Elston Avenue в Чикаго, рядом с Portage Park, Old Irving Park, Mayfair, Jefferson Park, Albany Park и Avondale. Приходите или свяжитесь с нами заранее, чтобы уточнить подходящий вариант ремонта.',
    faqTitle: 'Вопросы о ремонте iPhone',
    faqs: [
      ['Сколько стоит ремонт iPhone в Чикаго?', 'Цена зависит от модели, поврежденного компонента и совместимой детали. Сообщите модель и проблему, чтобы получить актуальную оценку до начала ремонта.'],
      ['Можно ли починить черный экран iPhone или неработающий сенсор?', 'Часто можно, но такие симптомы могут быть связаны с дисплеем, разъемами или платой. Сначала мы осматриваем устройство.'],
      ['Сколько времени занимает ремонт iPhone?', 'Срок зависит от модели, диагностики и наличия детали. Свяжитесь с TecPro99 перед визитом, чтобы уточнить доступное время.'],
      ['Вы ремонтируете батареи, разъемы зарядки и заднее стекло?', 'Да, TecPro99 выполняет многие ремонты батарей, зарядки, заднего стекла и диагностику. Доступность зависит от модели и состояния устройства.'],
      ['Где находится TecPro99?', `TecPro99 находится по адресу: ${shared.address}. По вопросам ремонта звоните: ${shared.phone}.`]
    ],
    finalTitle: 'Расскажите, что произошло с вашим iPhone.', finalCopy: 'Укажите модель и симптомы. Мы ответим, предложим следующий шаг, актуальные варианты и время визита.',
    homeLabel: 'Главная TecPro99', languageLabel: 'Выбрать язык', independent: 'TecPro99 является независимым сервисом и не связан с Apple Inc. Apple и iPhone являются товарными знаками Apple Inc.',
    footer: 'Ремонт iPhone, телефонов, планшетов, консолей и электроники в Чикаго.'
  }
};

const languageLinks = Object.values(locales);

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function serviceSchema(locale) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'ElectronicsStore'],
        '@id': 'https://techpro99.com/#business',
        name: 'TecPro99',
        url: 'https://techpro99.com/',
        telephone: '+1-773-628-7132',
        image: shared.image,
        address: { '@type': 'PostalAddress', streetAddress: '4362 N Elston Ave', addressLocality: 'Chicago', addressRegion: 'IL', postalCode: '60641', addressCountry: 'US' },
        geo: { '@type': 'GeoCoordinates', latitude: 41.9599235, longitude: -87.7285934 },
        hasMap: shared.directions,
        priceRange: '$$'
      },
      {
        '@type': 'Service',
        '@id': `https://techpro99.com${locale.path}#service`,
        name: locale.title.split('|')[0].trim(),
        description: locale.description,
        serviceType: 'iPhone repair',
        provider: { '@id': 'https://techpro99.com/#business' },
        areaServed: { '@type': 'City', name: 'Chicago', containedInPlace: { '@type': 'State', name: 'Illinois' } },
        availableChannel: { '@type': 'ServiceChannel', serviceUrl: `https://techpro99.com${locale.home}?request=repair&service=iPhone%20repair`, servicePhone: { '@type': 'ContactPoint', telephone: '+1-773-628-7132' } }
      },
      {
        '@type': 'WebPage',
        '@id': `https://techpro99.com${locale.path}#webpage`,
        url: `https://techpro99.com${locale.path}`,
        name: locale.title,
        description: locale.description,
        inLanguage: locale.lang,
        about: { '@id': `https://techpro99.com${locale.path}#service` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'TecPro99', item: `https://techpro99.com${locale.home}` },
          { '@type': 'ListItem', position: 2, name: locale.title.split('|')[0].trim(), item: `https://techpro99.com${locale.path}` }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: locale.faqs.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }))
      }
    ]
  }, null, 2).replaceAll('<', '\\u003c');
}

function page(locale) {
  const requestUrl = `${locale.home}?request=repair&service=iPhone%20repair`;
  const alternateLocales = languageLinks.map((entry) => `  <link rel="alternate" hreflang="${entry.lang}" href="https://techpro99.com${entry.path}">`).join('\n');
  const languageMenu = languageLinks.map((entry) => `<a href="${entry.path}" lang="${entry.htmlLang}"${entry.dir === 'rtl' ? ' dir="rtl"' : ''}${entry === locale ? ' aria-current="page"' : ''}><span>${entry.htmlLang === 'en' ? 'English' : entry.htmlLang === 'es' ? 'Español' : entry.htmlLang === 'ar' ? 'العربية' : 'Русский'}</span><small>${entry.code}</small></a>`).join('');
  const repairs = locale.repairs.map(([title, text, image, alt]) => `<article class="repair-card"><img src="/assets/${image}" alt="${escapeHtml(alt)}" loading="lazy"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div></article>`).join('');
  const models = locale.modelGroups.map(([title, text]) => `<article><span data-lucide="smartphone" aria-hidden="true"></span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join('');
  const steps = locale.steps.map(([number, title, text]) => `<li><span>${number}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div></li>`).join('');
  const faqs = locale.faqs.map(([question, answer], index) => `<details${index === 0 ? ' open' : ''}><summary>${escapeHtml(question)}<span data-lucide="plus" aria-hidden="true"></span></summary><p>${escapeHtml(answer)}</p></details>`).join('');
  const facts = locale.facts.map(([title, text]) => `<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></div>`).join('');

  return `<!doctype html>
<html lang="${locale.htmlLang}" dir="${locale.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(locale.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="geo.region" content="US-IL">
  <meta name="geo.placename" content="Chicago">
  <link rel="icon" href="/assets/logo.jpg">
  <link rel="preload" as="image" href="/assets/service-screen.jpg" fetchpriority="high">
  <link rel="canonical" href="https://techpro99.com${locale.path}">
${alternateLocales}
  <link rel="alternate" hreflang="x-default" href="https://techpro99.com/iphone-repair-chicago/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TecPro99">
  <meta property="og:title" content="${escapeHtml(locale.title)}">
  <meta property="og:description" content="${escapeHtml(locale.description)}">
  <meta property="og:url" content="https://techpro99.com${locale.path}">
  <meta property="og:image" content="${shared.image}">
  <meta property="og:locale" content="${locale.lang.replace('-', '_')}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(locale.title)}">
  <meta name="twitter:description" content="${escapeHtml(locale.description)}">
  <meta name="twitter:image" content="${shared.image}">
  <title>${escapeHtml(locale.title)}</title>
  <script type="application/ld+json">${serviceSchema(locale)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PWLSS3VE8R"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-PWLSS3VE8R');</script>
  <script defer src="/assets/site-analytics.js"></script>
  <style>
    :root{--ink:#171714;--muted:#5d5b54;--paper:#f7f4ee;--paper2:#ebe6dc;--white:#fffdf9;--line:#d7d1c5;--acid:#d6f354;--blue:#2d63ee;--orange:#f4774f;--max:1180px;--radius:8px}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Manrope",Arial,sans-serif;line-height:1.55}body[dir="rtl"],html[dir="rtl"] body{font-family:"Noto Sans Arabic","Manrope",Arial,sans-serif}a{color:inherit}img{display:block;max-width:100%}.container{width:min(calc(100% - 40px),var(--max));margin-inline:auto}.eyebrow{margin:0 0 12px;color:#1748b5;font-family:"DM Mono",monospace;font-size:12px;font-weight:600;text-transform:uppercase}.button{display:inline-flex;min-height:48px;align-items:center;justify-content:center;gap:9px;padding:0 18px;border:1px solid var(--ink);border-radius:6px;font-weight:800;text-decoration:none}.button-primary{background:var(--acid);color:var(--ink)}.button-light{background:rgba(255,255,255,.94);color:var(--ink)}.button svg{width:18px;height:18px}
    .site-header{position:sticky;z-index:20;top:0;border-bottom:1px solid rgba(23,23,20,.14);background:rgba(247,244,238,.94);backdrop-filter:blur(16px)}.header-inner{display:flex;min-height:70px;align-items:center;gap:28px}.brand{display:flex;align-items:center;gap:10px;font-weight:800;text-decoration:none}.brand img{width:38px;height:38px;border-radius:7px}.brand span span{color:var(--blue)}nav{display:flex;gap:24px;margin-inline:auto}nav a{font-size:13px;font-weight:700;text-decoration:none}.header-actions{display:flex;align-items:center;gap:10px}.language{position:relative}.language summary{display:flex;min-width:50px;height:42px;align-items:center;justify-content:center;gap:5px;border:1px solid var(--line);border-radius:6px;background:var(--white);font-size:12px;font-weight:800;cursor:pointer;list-style:none}.language summary::-webkit-details-marker{display:none}.language summary svg{width:15px}.language-menu{position:absolute;top:49px;inset-inline-end:0;width:180px;padding:6px;border:1px solid var(--line);border-radius:8px;background:var(--white);box-shadow:0 20px 44px rgba(0,0,0,.14)}.language-menu a{display:flex;justify-content:space-between;padding:10px 11px;border-radius:5px;text-decoration:none}.language-menu a:hover,.language-menu a[aria-current="page"]{background:var(--paper2)}
    .hero{position:relative;display:flex;min-height:min(720px,78svh);align-items:flex-end;overflow:hidden;color:white}.hero::after{position:absolute;z-index:1;inset:0;background:linear-gradient(90deg,rgba(9,10,11,.9) 0%,rgba(9,10,11,.68) 48%,rgba(9,10,11,.2) 100%);content:""}.hero-media{position:absolute;z-index:0;inset:0;width:100%;height:100%;object-fit:cover}.hero-inner{position:relative;z-index:2;padding:92px 0 78px}.hero .eyebrow{color:var(--acid)}h1{max-width:800px;margin:0;font-size:clamp(44px,7vw,86px);line-height:.98;letter-spacing:0}.hero-copy{max-width:680px;margin:24px 0 0;color:rgba(255,255,255,.86);font-size:18px}.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.fact-band{background:var(--white);border-bottom:1px solid var(--line)}.facts{display:grid;grid-template-columns:repeat(3,1fr)}.facts div{display:grid;gap:3px;padding:24px;border-inline-start:1px solid var(--line)}.facts div:last-child{border-inline-end:1px solid var(--line)}.facts strong{font-size:13px}.facts span{color:var(--muted);font-size:12px}
    section{padding:92px 0}.section-head{display:grid;grid-template-columns:1.15fr .85fr;gap:50px;align-items:end;margin-bottom:34px}.section-head h2,.area h2,.final h2{max-width:720px;margin:0;font-size:clamp(34px,5vw,60px);line-height:1.02;letter-spacing:0}.section-head>p{margin:0;color:var(--muted)}.repair-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.repair-card{display:grid;grid-template-columns:190px 1fr;min-height:210px;overflow:hidden;border:1px solid var(--line);border-radius:var(--radius);background:var(--white)}.repair-card img{width:100%;height:100%;object-fit:cover}.repair-card div{align-self:center;padding:24px}.repair-card h3,.models h3,.steps h3{margin:0 0 8px;font-size:19px}.repair-card p,.models p,.steps p{margin:0;color:var(--muted);font-size:14px}
    .models-band{background:var(--ink);color:white}.models-band .eyebrow{color:var(--acid)}.models-band .section-head>p{color:rgba(255,255,255,.68)}.models{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.models article{padding:26px;border:1px solid rgba(255,255,255,.2);border-radius:var(--radius);background:#23231f}.models svg{width:24px;color:var(--acid)}.models h3{margin-top:30px}.models p{color:rgba(255,255,255,.68)}
    .process{background:var(--paper2)}.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0;padding:0;list-style:none}.steps li{min-height:235px;padding:22px;border-top:3px solid var(--blue);background:var(--white)}.steps>li>span{display:flex;width:38px;height:38px;align-items:center;justify-content:center;border-radius:50%;background:var(--blue);color:white;font-weight:800}.steps div{margin-top:48px}
    .area{color:white;background:linear-gradient(100deg,#1d4bc3,#2d63ee 62%,#f4774f)}.area p:last-child{max-width:760px;margin:22px 0 0;color:rgba(255,255,255,.83);font-size:17px}.area .eyebrow{color:var(--acid)}.area-actions{display:flex;gap:12px;margin-top:28px}.faq-layout{display:grid;grid-template-columns:.7fr 1.3fr;gap:70px}.faq-layout h2{margin:0;font-size:clamp(34px,5vw,56px);line-height:1.04}.faq-list{border-top:1px solid var(--line)}details{border-bottom:1px solid var(--line)}details summary{display:flex;min-height:70px;align-items:center;justify-content:space-between;gap:20px;font-weight:800;cursor:pointer;list-style:none}details summary::-webkit-details-marker{display:none}details summary svg{width:18px;flex:0 0 auto}details[open] summary svg{transform:rotate(45deg)}details p{margin:0;padding:0 38px 23px 0;color:var(--muted)}html[dir="rtl"] details p{padding:0 0 23px 38px}
    .final{padding:80px 0;background:var(--acid)}.final-inner{display:grid;grid-template-columns:1fr auto;gap:42px;align-items:center}.final p{max-width:690px;margin:16px 0 0}.final-actions{display:grid;gap:10px}.final .button{min-width:230px}.disclaimer{padding:24px 0;border-bottom:1px solid var(--line);color:var(--muted);font-size:12px}footer{padding:38px 0 70px;background:var(--ink);color:white}.footer-inner{display:flex;justify-content:space-between;gap:30px}.footer-inner p{margin:7px 0 0;color:rgba(255,255,255,.63);font-size:13px}.footer-links{display:flex;gap:18px;align-items:center}.footer-links a{font-size:13px;font-weight:700}
    @media(max-width:860px){nav{display:none}.header-actions>.button{display:none}.hero{min-height:670px;background-position:58% center}.hero-inner{padding:78px 0 58px}h1{font-size:48px}.facts{grid-template-columns:1fr}.facts div{border-inline-end:1px solid var(--line);border-bottom:1px solid var(--line)}.section-head,.faq-layout,.final-inner{grid-template-columns:1fr;gap:24px}.repair-grid,.models,.steps{grid-template-columns:1fr}.repair-card{grid-template-columns:130px 1fr;min-height:175px}.steps li{min-height:190px}.steps div{margin-top:30px}.footer-inner{display:grid}.footer-links{flex-wrap:wrap}}
    @media(max-width:520px){.container{width:min(calc(100% - 28px),var(--max))}.header-inner{min-height:62px}.brand img{width:34px;height:34px}.hero{min-height:620px}.hero-inner{padding-bottom:42px}h1{font-size:41px}.hero-copy{font-size:16px}.hero-actions,.area-actions{display:grid}.hero-actions .button,.area-actions .button{width:100%}section{padding:68px 0}.repair-card{grid-template-columns:1fr}.repair-card img{height:180px}.models{grid-template-columns:1fr}.final .button{min-width:0}.footer-links{display:grid}}
  </style>
</head>
<body>
  <header class="site-header"><div class="container header-inner">
    <a class="brand" href="${locale.home}" aria-label="${escapeHtml(locale.homeLabel)}" data-track="service_header_home"><img src="/assets/logo.jpg" alt="TecPro99"><span>TEC<span>PRO</span>99</span></a>
    <nav aria-label="${escapeHtml(locale.navServices)}"><a href="#repairs" data-track="service_nav_repairs">${escapeHtml(locale.navServices)}</a><a href="#models" data-track="service_nav_models">${escapeHtml(locale.navModels)}</a><a href="#process" data-track="service_nav_process">${escapeHtml(locale.navProcess)}</a><a href="#faq" data-track="service_nav_faq">${escapeHtml(locale.navFaq)}</a></nav>
    <div class="header-actions"><details class="language"><summary aria-label="${escapeHtml(`${locale.languageLabel}: ${locale.code}`)}" data-track="service_language_menu"><i data-lucide="languages" aria-hidden="true"></i>${locale.code}</summary><div class="language-menu">${languageMenu}</div></details><a class="button button-primary" href="${requestUrl}" data-track="service_header_repair_request">${escapeHtml(locale.request)}</a></div>
  </div></header>
  <main>
    <section class="hero"><img class="hero-media" src="/assets/service-screen.jpg" alt="${escapeHtml(locale.title.split('|')[0].trim())}" fetchpriority="high"><div class="container hero-inner"><p class="eyebrow">${escapeHtml(locale.eyebrow)}</p><h1>${escapeHtml(locale.h1)}</h1><p class="hero-copy">${escapeHtml(locale.heroCopy)}</p><div class="hero-actions"><a class="button button-primary" href="${requestUrl}" data-track="service_hero_repair_request"><i data-lucide="clipboard-list" aria-hidden="true"></i>${escapeHtml(locale.request)}</a><a class="button button-light" href="${shared.phoneHref}" data-track="service_hero_call"><i data-lucide="phone" aria-hidden="true"></i>${escapeHtml(locale.call)}</a></div></div></section>
    <div class="fact-band"><div class="container facts">${facts}</div></div>
    <section id="repairs"><div class="container"><div class="section-head"><div><p class="eyebrow">${escapeHtml(locale.repairsEyebrow)}</p><h2>${escapeHtml(locale.repairsTitle)}</h2></div><p>${escapeHtml(locale.repairsCopy)}</p></div><div class="repair-grid">${repairs}</div></div></section>
    <section class="models-band" id="models"><div class="container"><div class="section-head"><div><p class="eyebrow">${escapeHtml(locale.modelsEyebrow)}</p><h2>${escapeHtml(locale.modelsTitle)}</h2></div><p>${escapeHtml(locale.modelsCopy)}</p></div><div class="models">${models}</div></div></section>
    <section class="process" id="process"><div class="container"><div class="section-head"><div><p class="eyebrow">${escapeHtml(locale.processEyebrow)}</p><h2>${escapeHtml(locale.processTitle)}</h2></div></div><ol class="steps">${steps}</ol></div></section>
    <section class="area"><div class="container"><p class="eyebrow">${escapeHtml(locale.areaEyebrow)}</p><h2>${escapeHtml(locale.areaTitle)}</h2><p>${escapeHtml(locale.areaCopy)}</p><div class="area-actions"><a class="button button-primary" href="${shared.directions}" target="_blank" rel="noopener" data-track="service_area_directions"><i data-lucide="navigation" aria-hidden="true"></i>${escapeHtml(locale.directions)}</a><a class="button button-light" href="${shared.phoneHref}" data-track="service_area_call"><i data-lucide="phone" aria-hidden="true"></i>${shared.phone}</a></div></div></section>
    <section id="faq"><div class="container faq-layout"><div><p class="eyebrow">${escapeHtml(locale.navFaq)}</p><h2>${escapeHtml(locale.faqTitle)}</h2></div><div class="faq-list">${faqs}</div></div></section>
    <section class="final"><div class="container final-inner"><div><h2>${escapeHtml(locale.finalTitle)}</h2><p>${escapeHtml(locale.finalCopy)}</p></div><div class="final-actions"><a class="button button-light" href="${requestUrl}" data-track="service_final_repair_request">${escapeHtml(locale.request)}</a><a class="button" href="${shared.phoneHref}" data-track="service_final_call">${escapeHtml(locale.call)}</a></div></div></section>
    <div class="disclaimer"><div class="container">${escapeHtml(locale.independent)}</div></div>
  </main>
  <footer><div class="container footer-inner"><div><strong>TecPro99</strong><p>${escapeHtml(locale.footer)}</p><p>${shared.address} · ${shared.phone}</p></div><div class="footer-links"><a href="${locale.home}" data-track="service_footer_home">${escapeHtml(locale.homeLabel)}</a><a href="${shared.directions}" target="_blank" rel="noopener" data-track="service_footer_directions">${escapeHtml(locale.directions)}</a><a href="${shared.phoneHref}" data-track="service_footer_call">${shared.phone}</a></div></div></footer>
  <script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js"></script><script>lucide.createIcons();document.querySelectorAll('.language').forEach((menu)=>document.addEventListener('click',(event)=>{if(!menu.contains(event.target))menu.removeAttribute('open')}));</script>
</body>
</html>`;
}

for (const locale of Object.values(locales)) {
  const directory = path.join(projectRoot, locale.path);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), page(locale), 'utf8');
}

console.log('Built TecPro99 iPhone service pages: en, es, ar, ru');
