import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(projectRoot, 'index.html');

const localeInfo = {
  es: {
    htmlLang: 'es', languageTag: 'es-US', ogLocale: 'es_US', code: 'ES', dir: 'ltr', path: '/es/',
    iphonePath: '/es/reparacion-iphone-chicago/',
    title: 'Reparación de iPhone en Chicago | Pantallas y baterías | TecPro99',
    description: 'TecPro99 ofrece reparación de iPhone en Chicago para pantallas rotas, baterías, puertos de carga y vidrio trasero, además de Samsung, Pixel, Motorola, tabletas y PS5.'
  },
  ar: {
    htmlLang: 'ar', languageTag: 'ar-US', ogLocale: 'ar_US', code: 'AR', dir: 'rtl', path: '/ar/',
    iphonePath: '/ar/iphone-repair-chicago/',
    title: 'تصليح آيفون في شيكاغو | الشاشات والبطاريات | TecPro99',
    description: 'تقدم TecPro99 تصليح آيفون في شيكاغو للشاشات المكسورة والبطاريات ومنافذ الشحن والزجاج الخلفي، بالإضافة إلى Samsung وPixel وMotorola والأجهزة اللوحية وPS5.'
  },
  ru: {
    htmlLang: 'ru', languageTag: 'ru-US', ogLocale: 'ru_US', code: 'RU', dir: 'ltr', path: '/ru/',
    iphonePath: '/ru/remont-iphone-chicago/',
    title: 'Ремонт iPhone в Чикаго | Экраны и батареи | TecPro99',
    description: 'TecPro99 выполняет ремонт iPhone в Чикаго: замена разбитых экранов и батарей, ремонт разъемов зарядки и заднего стекла, а также Samsung, Pixel, Motorola, планшетов и PS5.'
  }
};

// Each entry is English, Spanish, Arabic, Russian. Keeping one source phrase per row
// makes it difficult for a localized page to quietly drift away from the main site.
const copyRows = [
  ['iPhone Repair Chicago | Screens, Batteries & More | TecPro99', 'Reparación de iPhone en Chicago | Pantallas y baterías | TecPro99', 'تصليح آيفون في شيكاغو | الشاشات والبطاريات | TecPro99', 'Ремонт iPhone в Чикаго | Экраны и батареи | TecPro99'],
  ['TecPro99 phone, electronics and game console repair in Chicago', 'Reparación de celulares, electrónicos y consolas de TecPro99 en Chicago', 'تصليح الهواتف والإلكترونيات وأجهزة الألعاب لدى TecPro99 في شيكاغو', 'Ремонт телефонов, электроники и игровых консолей в TecPro99 в Чикаго'],
  ['Chicago phone, tablet, electronics and game console repair shop specializing in screens, batteries, charging ports, back glass, HDMI ports, diagnostics and board repair.', 'Taller de reparación en Chicago para celulares, tabletas, electrónicos y consolas, especializado en pantallas, baterías, puertos de carga, vidrio trasero, puertos HDMI, diagnóstico y reparación de placas.', 'متجر تصليح في شيكاغو للهواتف والأجهزة اللوحية والإلكترونيات وأجهزة الألعاب، متخصص في الشاشات والبطاريات ومنافذ الشحن والزجاج الخلفي ومنافذ HDMI والفحص وتصليح اللوحات.', 'Сервисный центр в Чикаго по ремонту телефонов, планшетов, электроники и игровых консолей: экраны, батареи, разъемы зарядки, заднее стекло, HDMI, диагностика и ремонт плат.'],
  ['Chicago phone, tablet, computer, electronics and game console repair from TecPro99.', 'Reparación de celulares, tabletas, computadoras, electrónicos y consolas en Chicago por TecPro99.', 'تصليح الهواتف والأجهزة اللوحية والكمبيوتر والإلكترونيات وأجهزة الألعاب في شيكاغو من TecPro99.', 'Ремонт телефонов, планшетов, компьютеров, электроники и игровых консолей в Чикаго от TecPro99.'],
  ['Device repair services', 'Servicios de reparación de dispositivos', 'خدمات تصليح الأجهزة', 'Услуги по ремонту техники'],
  ['iPhone and smartphone screen repair', 'Reparación de pantallas de iPhone y smartphones', 'تصليح شاشات iPhone والهواتف الذكية', 'Ремонт экранов iPhone и смартфонов'],
  ['Phone screen replacement', 'Cambio de pantalla de celular', 'استبدال شاشة الهاتف', 'Замена экрана телефона'],
  ['Phone battery replacement', 'Cambio de batería de celular', 'استبدال بطارية الهاتف', 'Замена батареи телефона'],
  ['iPhone, Samsung, Google Pixel and Motorola battery replacement', 'Cambio de batería para iPhone, Samsung, Google Pixel y Motorola', 'استبدال بطارية iPhone وSamsung وGoogle Pixel وMotorola', 'Замена батарей iPhone, Samsung, Google Pixel и Motorola'],
  ['Charging port and back glass repair', 'Reparación de puerto de carga y vidrio trasero', 'تصليح منفذ الشحن والزجاج الخلفي', 'Ремонт разъема зарядки и заднего стекла'],
  ['Smartphone charging port and back glass repair', 'Reparación de puerto de carga y vidrio trasero de smartphones', 'تصليح منفذ الشحن والزجاج الخلفي للهواتف الذكية', 'Ремонт разъема зарядки и заднего стекла смартфона'],
  ['PS5 and game console HDMI repair', 'Reparación de HDMI de PS5 y consolas', 'تصليح HDMI لأجهزة PS5 وأجهزة الألعاب', 'Ремонт HDMI на PS5 и игровых консолях'],
  ['PlayStation 5 and game console HDMI port repair', 'Reparación del puerto HDMI de PlayStation 5 y consolas', 'تصليح منفذ HDMI في PlayStation 5 وأجهزة الألعاب', 'Ремонт разъема HDMI на PlayStation 5 и игровых консолях'],
  ['Electronics diagnostics and board repair', 'Diagnóstico de electrónicos y reparación de placas', 'فحص الإلكترونيات وتصليح اللوحات', 'Диагностика электроники и ремонт плат'],
  ['Phone, tablet, console and electronics diagnostics', 'Diagnóstico de celulares, tabletas, consolas y electrónicos', 'فحص الهواتف والأجهزة اللوحية وأجهزة الألعاب والإلكترونيات', 'Диагностика телефонов, планшетов, консолей и электроники'],
  ['Phone and electronics liquid damage assessment', 'Evaluación de daño por líquido en celulares y electrónicos', 'فحص أضرار السوائل في الهواتف والإلكترونيات', 'Диагностика повреждений от жидкости в телефонах и электронике'],
  ['Phone screen repair', 'Reparación de pantalla de celular', 'تصليح شاشة هاتف', 'Ремонт экрана телефона'],
  ['Phone back glass repair', 'Reparación de vidrio trasero de celular', 'تصليح الزجاج الخلفي للهاتف', 'Ремонт заднего стекла телефона'],
  ['Console HDMI repair', 'Reparación HDMI de consola', 'تصليح HDMI لجهاز ألعاب', 'Ремонт HDMI игровой консоли'],
  ['Device diagnostics and board repair', 'Diagnóstico de dispositivos y reparación de placas', 'فحص الأجهزة وتصليح اللوحات', 'Диагностика устройств и ремонт плат'],
  ['Water damaged phone repair', 'Reparación de celular con daño por agua', 'تصليح هاتف متضرر من الماء', 'Ремонт телефона после попадания воды'],
  ['Technician working on a device', 'Técnico trabajando en un dispositivo', 'فني يعمل على جهاز', 'Мастер ремонтирует устройство'],
  ['4.7 out of 5 average customer rating', 'Calificación promedio de clientes: 4.7 de 5', 'متوسط تقييم العملاء 4.7 من 5', 'Средняя оценка клиентов: 4,7 из 5'],
  ['5 out of 5 stars', '5 de 5 estrellas', '5 نجوم من 5', '5 звезд из 5'],
  ['Services', 'Servicios', 'الخدمات', 'Услуги'],
  ['iPhone repair Chicago', 'Reparación de iPhone en Chicago', 'تصليح آيفون في شيكاغو', 'Ремонт iPhone в Чикаго'],
  ['How it works', 'Cómo funciona', 'كيف نعمل', 'Как это работает'],
  ['Visit us', 'Visítanos', 'زورونا', 'Как нас найти'],
  ['FAQ', 'Preguntas', 'الأسئلة', 'Вопросы'],
  ['Request a Repair', 'Solicitar reparación', 'طلب إصلاح', 'Оставить заявку'],
  ['Chicago iPhone and device repair', 'Reparación de iPhone y dispositivos en Chicago', 'تصليح آيفون والأجهزة في شيكاغو', 'Ремонт iPhone и техники в Чикаго'],
  ['iPhone & electronics repair', 'Reparación de iPhone y electrónicos', 'تصليح آيفون والإلكترونيات', 'Ремонт iPhone и электроники'],
  ['in Chicago.', 'en Chicago.', 'في شيكاغو.', 'в Чикаго.'],
  ['From a cracked iPhone screen to a console that will not power on, TecPro99 gives you a clear repair path and careful service for the devices you use every day.', 'Desde una pantalla de iPhone rota hasta una consola que no enciende, TecPro99 te ofrece un proceso claro y un servicio cuidadoso para los dispositivos que usas todos los días.', 'من شاشة آيفون مكسورة إلى جهاز ألعاب لا يعمل، تقدم لك TecPro99 مسار إصلاح واضحًا وخدمة دقيقة للأجهزة التي تستخدمها يوميًا.', 'От разбитого экрана iPhone до игровой консоли, которая не включается: TecPro99 предлагает понятный план и аккуратный ремонт техники, которой вы пользуетесь каждый день.'],
  ['Call TecPro99', 'Llamar a TecPro99', 'اتصل بـ TecPro99', 'Позвонить в TecPro99'],
  ['Bring the device in, tell us what changed, and we will help you figure out the next right step.', 'Trae el dispositivo, cuéntanos qué pasó y te ayudaremos a elegir el siguiente paso.', 'أحضر الجهاز وأخبرنا بما حدث، وسنساعدك في اختيار الخطوة المناسبة.', 'Принесите устройство и расскажите, что произошло. Мы поможем определить следующий шаг.'],
  ['Phones', 'Celulares', 'هواتف', 'Телефоны'],
  ['Screen, battery, charging', 'Pantalla, batería y carga', 'الشاشة والبطارية والشحن', 'Экран, батарея, зарядка'],
  ['Consoles', 'Consolas', 'أجهزة ألعاب', 'Консоли'],
  ['HDMI and board repair', 'Reparación de HDMI y placa', 'تصليح HDMI واللوحة', 'Ремонт HDMI и платы'],
  ['More tech', 'Más dispositivos', 'أجهزة أخرى', 'Другая техника'],
  ['Tablets and electronics', 'Tabletas y electrónicos', 'أجهزة لوحية وإلكترونيات', 'Планшеты и электроника'],
  ['Quick repairs from $39', 'Reparaciones rápidas desde $39', 'إصلاحات سريعة ابتداءً من $39', 'Быстрый ремонт от $39'],
  ['Select repairs while you wait in as little as 20 minutes.', 'Algunas reparaciones pueden completarse mientras esperas, desde 20 minutos.', 'يمكن إتمام بعض الإصلاحات أثناء انتظارك خلال 20 دقيقة فقط.', 'Некоторые виды ремонта выполняются при вас всего от 20 минут.'],
  ['Free diagnostics', 'Diagnóstico gratuito', 'فحص مجاني', 'Бесплатная диагностика'],
  ['Get a clear look at the issue first.', 'Primero entendemos claramente el problema.', 'نحدد المشكلة بوضوح أولًا.', 'Сначала точно определим проблему.'],
  ['Professional technicians', 'Técnicos profesionales', 'فنيون محترفون', 'Профессиональные мастера'],
  ['Careful service for the devices you depend on.', 'Servicio cuidadoso para los dispositivos que necesitas.', 'خدمة دقيقة للأجهزة التي تعتمد عليها.', 'Бережный ремонт важных для вас устройств.'],
  ['Original-quality parts', 'Repuestos de calidad original', 'قطع بجودة أصلية', 'Запчасти оригинального качества'],
  ['Quality components for compatible repairs.', 'Componentes de calidad para reparaciones compatibles.', 'مكونات عالية الجودة للإصلاحات المتوافقة.', 'Качественные совместимые комплектующие.'],
  ['What we repair', 'Qué reparamos', 'ما الذي نصلحه', 'Что мы ремонтируем'],
  ['The fixes your day cannot wait for.', 'Reparaciones que no pueden esperar.', 'إصلاحات لا يمكنها الانتظار.', 'Ремонт, который не стоит откладывать.'],
  ['Select the repair you need to start a quote request. We will use the device model and symptom to point you in the right direction.', 'Selecciona la reparación que necesitas para solicitar una cotización. Usaremos el modelo y el problema para orientarte correctamente.', 'اختر الإصلاح المطلوب لبدء طلب عرض السعر. سنستخدم طراز الجهاز والعطل لتوجيهك بالشكل الصحيح.', 'Выберите нужный ремонт, чтобы запросить стоимость. Модель устройства и симптомы помогут нам предложить правильное решение.'],
  ['01 / PHONE', '01 / CELULAR', '01 / هاتف', '01 / ТЕЛЕФОН'],
  ['02 / PHONE', '02 / CELULAR', '02 / هاتف', '02 / ТЕЛЕФОН'],
  ['03 / PHONE', '03 / CELULAR', '03 / هاتف', '03 / ТЕЛЕФОН'],
  ['04 / CONSOLE', '04 / CONSOLA', '04 / جهاز ألعاب', '04 / КОНСОЛЬ'],
  ['05 / DIAGNOSTICS', '05 / DIAGNÓSTICO', '05 / فحص', '05 / ДИАГНОСТИКА'],
  ['06 / RECOVERY', '06 / RECUPERACIÓN', '06 / استعادة', '06 / ВОССТАНОВЛЕНИЕ'],
  ['iPhone screen repair', 'Reparación de pantalla de iPhone', 'تصليح شاشة آيفون', 'Ремонт экрана iPhone'],
  ['For cracks, display problems, touch issues, and broken glass.', 'Para grietas, fallas de imagen, problemas táctiles y vidrio roto.', 'للشقوق ومشاكل العرض واللمس والزجاج المكسور.', 'При трещинах, проблемах с изображением, сенсором и разбитом стекле.'],
  ['Battery replacement', 'Cambio de batería', 'تبديل البطارية', 'Замена батареи'],
  ['When your phone drains too fast, overheats, or will not hold a charge.', 'Cuando el celular se descarga rápido, se calienta o no conserva la carga.', 'عندما تنفد البطارية بسرعة أو ترتفع حرارة الهاتف أو لا يحتفظ بالشحن.', 'Если телефон быстро разряжается, перегревается или не держит заряд.'],
  ['Back glass repair', 'Reparación del vidrio trasero', 'تصليح الزجاج الخلفي', 'Ремонт заднего стекла'],
  ['Replace damaged back glass and get your device looking whole again.', 'Cambia el vidrio trasero dañado y recupera la apariencia de tu dispositivo.', 'استبدل الزجاج الخلفي التالف ليعود جهازك بمظهر متكامل.', 'Заменим поврежденное заднее стекло и вернем устройству аккуратный вид.'],
  ['HDMI & console repair', 'Reparación de HDMI y consolas', 'تصليح HDMI وأجهزة الألعاب', 'Ремонт HDMI и консолей'],
  ['For loose ports, no signal, damaged connectors, and display faults.', 'Para puertos flojos, falta de señal, conectores dañados y fallas de imagen.', 'للمنافذ المرتخية وانقطاع الإشارة والموصلات التالفة وأعطال العرض.', 'При расшатанных разъемах, отсутствии сигнала, поврежденных контактах и проблемах изображения.'],
  ['Board repair & diagnostics', 'Reparación de placa y diagnóstico', 'تصليح اللوحة والفحص', 'Ремонт плат и диагностика'],
  ['For issues that need a closer look beyond a simple part replacement.', 'Para problemas que requieren un análisis más profundo que un simple cambio de pieza.', 'للمشكلات التي تحتاج فحصًا أعمق من مجرد تبديل قطعة.', 'Для неисправностей, требующих более глубокой диагностики, чем простая замена детали.'],
  ['Water damage recovery', 'Recuperación por daño de líquido', 'معالجة أضرار السوائل', 'Восстановление после жидкости'],
  ['Bring it in quickly so we can assess moisture damage and recovery options.', 'Tráelo pronto para evaluar el daño por humedad y las opciones de recuperación.', 'أحضره بسرعة لنقيّم ضرر الرطوبة وخيارات الاستعادة.', 'Принесите устройство как можно скорее, чтобы мы оценили повреждение и варианты восстановления.'],
  ['Start with a clear quote', 'Comienza con una cotización clara', 'ابدأ بعرض سعر واضح', 'Начните с понятной оценки'],
  ['Start with a repair request.', 'Comienza con una solicitud de reparación.', 'ابدأ بطلب إصلاح.', 'Начните с заявки на ремонт.'],
  ['Tell us about the model and issue. TecPro99 will review the details, follow up with pricing, and help you choose a convenient time.', 'Cuéntanos el modelo y el problema. TecPro99 revisará los detalles, te informará el precio y te ayudará a elegir un horario conveniente.', 'أخبرنا بالطراز والمشكلة. ستراجع TecPro99 التفاصيل وتتواصل معك بالسعر والوقت المناسب.', 'Расскажите о модели и проблеме. TecPro99 изучит детали, сообщит стоимость и поможет выбрать удобное время.'],
  ['Cracked or black screen', 'Pantalla rota o negra', 'شاشة مكسورة أو سوداء', 'Разбитый или черный экран'],
  ['Phones, tablets, and selected laptops', 'Celulares, tabletas y algunas laptops', 'هواتف وأجهزة لوحية وبعض الكمبيوترات المحمولة', 'Телефоны, планшеты и некоторые ноутбуки'],
  ['Request repair', 'Solicitar reparación', 'طلب إصلاح', 'Оставить заявку'],
  ['Battery will not last', 'La batería dura poco', 'البطارية لا تدوم', 'Батарея быстро разряжается'],
  ['Fast drain, swelling, power issues', 'Descarga rápida, hinchazón y fallas de energía', 'نفاد سريع أو انتفاخ أو مشاكل طاقة', 'Быстрый разряд, вздутие, проблемы питания'],
  ['Phone will not charge', 'El celular no carga', 'الهاتف لا يشحن', 'Телефон не заряжается'],
  ['Port damage, cable connection, charging faults', 'Daño del puerto, conexión del cable y fallas de carga', 'تلف المنفذ أو توصيل الكابل أو أعطال الشحن', 'Повреждение разъема, кабеля или системы зарядки'],
  ['Console has no display', 'La consola no muestra imagen', 'جهاز الألعاب لا يعرض صورة', 'На консоли нет изображения'],
  ['HDMI, port, board, and power diagnosis', 'Diagnóstico de HDMI, puerto, placa y energía', 'فحص HDMI والمنفذ واللوحة والطاقة', 'Диагностика HDMI, разъема, платы и питания'],
  ['Something else happened', 'Ocurrió otro problema', 'حدثت مشكلة أخرى', 'Другая проблема'],
  ['Describe it and we will help sort it out', 'Descríbelo y te ayudaremos a resolverlo', 'صف المشكلة وسنساعدك في حلها', 'Опишите ее, и мы поможем разобраться'],
  ['A repair process built to stay simple.', 'Un proceso de reparación sencillo.', 'عملية إصلاح بسيطة وواضحة.', 'Простой и понятный процесс ремонта.'],
  ['No giant catalog to decode. A few good details from you make it easier to choose the right repair and a convenient time.', 'Sin catálogos complicados. Unos pocos datos nos ayudan a elegir la reparación correcta y un horario conveniente.', 'لا قوائم معقدة. بعض التفاصيل منك تساعدنا على اختيار الإصلاح والوقت المناسبين.', 'Без сложных каталогов. Несколько деталей помогут выбрать нужный ремонт и удобное время.'],
  ['Describe the issue', 'Describe el problema', 'صف المشكلة', 'Опишите проблему'],
  ['Pick a repair type and add your device model or the symptom you are seeing.', 'Elige el tipo de reparación y agrega el modelo o el síntoma que observas.', 'اختر نوع الإصلاح وأضف طراز الجهاز أو العطل الذي تلاحظه.', 'Выберите вид ремонта и укажите модель или симптомы.'],
  ['Confirm the plan', 'Confirma el plan', 'أكد الخطة', 'Согласуйте план'],
  ['We will use those details to help you understand the repair path and estimate.', 'Usaremos esos datos para explicarte el proceso y la estimación.', 'سنستخدم هذه التفاصيل لشرح مسار الإصلاح والتكلفة التقديرية.', 'По этим данным мы объясним план ремонта и предварительную стоимость.'],
  ['Request a repair', 'Solicita una reparación', 'اطلب إصلاحًا', 'Оставьте заявку'],
  ['Send your details and TecPro99 will follow up with the right repair path, pricing, and visit options.', 'Envía tus datos y TecPro99 te contactará con el proceso, el precio y las opciones de visita.', 'أرسل التفاصيل وستتواصل TecPro99 معك بخطة الإصلاح والسعر وخيارات الزيارة.', 'Отправьте данные, и TecPro99 сообщит план, стоимость и варианты визита.'],
  ['Care, not guesswork', 'Cuidado, no suposiciones', 'عناية لا تخمين', 'Точность без догадок'],
  ['Good repair starts with paying attention.', 'Una buena reparación comienza con atención.', 'الإصلاح الجيد يبدأ بالاهتمام.', 'Хороший ремонт начинается с внимания к деталям.'],
  ['A repair path that fits the actual device and issue', 'Un proceso adecuado para el dispositivo y el problema', 'مسار إصلاح يناسب الجهاز والمشكلة الفعلية', 'Решение, подходящее конкретному устройству и неисправности'],
  ['Clear communication before work begins', 'Comunicación clara antes de comenzar', 'تواصل واضح قبل بدء العمل', 'Понятное согласование до начала работ'],
  ['Careful handling of the devices you depend on', 'Manejo cuidadoso de los dispositivos que necesitas', 'تعامل دقيق مع الأجهزة التي تعتمد عليها', 'Бережное обращение с вашей техникой'],
  ['One local team in Chicago', 'Un equipo local en Chicago', 'فريق محلي واحد في شيكاغو', 'Одна местная команда в Чикаго'],
  ['Customer reviews', 'Opiniones de clientes', 'آراء العملاء', 'Отзывы клиентов'],
  ['More than 500 reasons Chicago trusts TecPro99.', 'Más de 500 razones por las que Chicago confía en TecPro99.', 'أكثر من 500 سبب يجعل شيكاغو تثق بـ TecPro99.', 'Более 500 причин, почему Чикаго доверяет TecPro99.'],
  ['Customers come to us for clear communication, careful repair work, and a faster way back to the devices they use every day.', 'Nuestros clientes valoran la comunicación clara, el trabajo cuidadoso y la rapidez para recuperar sus dispositivos.', 'يختارنا العملاء للتواصل الواضح والإصلاح الدقيق والعودة السريعة إلى أجهزتهم.', 'Клиенты выбирают нас за понятное общение, аккуратную работу и быстрое возвращение техники.'],
  ['Average customer rating', 'Calificación promedio', 'متوسط تقييم العملاء', 'Средняя оценка клиентов'],
  ['500+ customer reviews', 'Más de 500 opiniones', 'أكثر من 500 مراجعة', 'Более 500 отзывов'],
  ['"Fast repair, friendly service, and everything was explained clearly before work started."', '"Reparación rápida, atención amable y todo fue explicado claramente antes de comenzar."', '"إصلاح سريع وخدمة ودودة، وتم شرح كل شيء بوضوح قبل بدء العمل."', '«Быстрый ремонт, дружелюбное обслуживание, и все подробно объяснили до начала работы».'],
  ['TecPro99 customer feedback', 'Opinión de cliente de TecPro99', 'رأي أحد عملاء TecPro99', 'Отзыв клиента TecPro99'],
  ['"The team made the process easy. I knew what was happening with my device at every step."', '"El equipo hizo que todo fuera sencillo. Supe qué pasaba con mi dispositivo en cada paso."', '"جعل الفريق العملية سهلة، وكنت أعرف ما يحدث لجهازي في كل خطوة."', '«Команда сделала процесс простым. Я понимал, что происходит с устройством на каждом этапе».'],
  ['"Professional work and a quick turnaround. My device was back in my hands without the stress."', '"Trabajo profesional y entrega rápida. Recuperé mi dispositivo sin estrés."', '"عمل احترافي وإنجاز سريع. استعدت جهازي دون توتر."', '«Профессиональная работа и быстрый результат. Я получил устройство обратно без лишних переживаний».'],
  ['Chicago, Illinois', 'Chicago, Illinois', 'شيكاغو، إلينوي', 'Чикаго, Иллинойс'],
  ['Need to get there fast? We made that part easy.', '¿Necesitas llegar rápido? Lo hicimos sencillo.', 'هل تريد الوصول بسرعة؟ جعلنا الأمر سهلًا.', 'Нужно быстро добраться? Это просто.'],
  ['Call TecPro99 with your device issue, or use the map for directions. We will help you choose the right next step before you head out.', 'Llama a TecPro99 o usa el mapa para llegar. Te ayudaremos a elegir el siguiente paso antes de salir.', 'اتصل بـ TecPro99 أو استخدم الخريطة للوصول. سنساعدك في اختيار الخطوة المناسبة قبل أن تنطلق.', 'Позвоните в TecPro99 или откройте маршрут на карте. Мы поможем определить следующий шаг до вашего визита.'],
  ['Service location', 'Dirección del servicio', 'موقع المركز', 'Адрес сервиса'],
  ['Hours', 'Horario', 'ساعات العمل', 'Часы работы'],
  ['Sun-Thu & Sat: 9 AM-11 PM', 'Dom-Jue y Sáb: 9 AM-11 PM', 'الأحد-الخميس والسبت: 9 ص-11 م', 'Вс-Чт и Сб: 9:00-23:00'],
  ['Fri: 9-11:30 AM, 1:30-11 PM', 'Vie: 9-11:30 AM, 1:30-11 PM', 'الجمعة: 9-11:30 ص، 1:30-11 م', 'Пт: 9:00-11:30, 13:30-23:00'],
  ['Make your visit count', 'Aprovecha tu visita', 'اجعل زيارتك مفيدة', 'Подготовьтесь к визиту'],
  ['Start the repair request before you leave.', 'Envía la solicitud antes de salir.', 'ابدأ طلب الإصلاح قبل أن تنطلق.', 'Оставьте заявку перед визитом.'],
  ['Send the device and problem first so the repair conversation starts with the right details.', 'Envía primero el dispositivo y el problema para comenzar con la información correcta.', 'أرسل نوع الجهاز والمشكلة أولًا لنبدأ بالتفاصيل الصحيحة.', 'Сначала укажите устройство и проблему, чтобы разговор начался с нужных деталей.'],
  ["Serving Chicago's Northwest Side", 'Atendemos el noroeste de Chicago', 'نخدم شمال غرب شيكاغو', 'Обслуживаем северо-запад Чикаго'],
  ['Portage Park, Old Irving Park, Jefferson Park, Mayfair, Albany Park, Avondale, and nearby neighborhoods.', 'Portage Park, Old Irving Park, Jefferson Park, Mayfair, Albany Park, Avondale y vecindarios cercanos.', 'Portage Park وOld Irving Park وJefferson Park وMayfair وAlbany Park وAvondale والأحياء القريبة.', 'Portage Park, Old Irving Park, Jefferson Park, Mayfair, Albany Park, Avondale и соседние районы.'],
  ['Get directions', 'Cómo llegar', 'الاتجاهات', 'Маршрут'],
  ['Good to know', 'Información útil', 'معلومات مهمة', 'Полезная информация'],
  ['A few common questions.', 'Preguntas frecuentes.', 'بعض الأسئلة الشائعة.', 'Частые вопросы.'],
  ['The fastest way to get a precise answer is to call with your device model, but these are good places to begin.', 'La forma más rápida de obtener una respuesta precisa es llamar con el modelo, pero estas preguntas son un buen comienzo.', 'أسرع طريقة للحصول على إجابة دقيقة هي الاتصال مع ذكر طراز الجهاز، وهذه الأسئلة نقطة بداية جيدة.', 'Самый быстрый способ получить точный ответ — позвонить и назвать модель устройства. Ниже приведены основные вопросы.'],
  ['Can I get an estimate before I come in?', '¿Puedo recibir una cotización antes de ir?', 'هل يمكنني معرفة التكلفة قبل الزيارة؟', 'Можно узнать стоимость до визита?'],
  ['Yes. Send the device type, model, and what happened. We can then help you understand the likely repair path and what details matter for a quote.', 'Sí. Envía el tipo de dispositivo, el modelo y lo que ocurrió. Así podremos explicarte la reparación probable y preparar una cotización.', 'نعم. أرسل نوع الجهاز والطراز وما حدث، وسنشرح لك الإصلاح المتوقع والمعلومات اللازمة للسعر.', 'Да. Укажите тип устройства, модель и что произошло. Мы объясним возможный ремонт и подготовим оценку.'],
  ['What devices do you work on?', '¿Qué dispositivos reparan?', 'ما الأجهزة التي تصلحونها؟', 'Какие устройства вы ремонтируете?'],
  ['TecPro99 handles many common phone, tablet, console, and electronics issues. If your device is not listed above, call and tell us what it is.', 'TecPro99 repara muchos problemas de celulares, tabletas, consolas y electrónicos. Si tu dispositivo no aparece, llámanos y cuéntanos cuál es.', 'تعالج TecPro99 العديد من أعطال الهواتف والأجهزة اللوحية وأجهزة الألعاب والإلكترونيات. إذا لم تجد جهازك، اتصل بنا وأخبرنا عنه.', 'TecPro99 устраняет многие неисправности телефонов, планшетов, консолей и электроники. Если вашего устройства нет в списке, позвоните нам.'],
  ['What should I bring with my device?', '¿Qué debo traer con mi dispositivo?', 'ماذا أحضر مع الجهاز؟', 'Что принести вместе с устройством?'],
  ['Bring the device and any essential information about the issue. For charging problems, bringing the cable or accessory involved can also be helpful.', 'Trae el dispositivo y la información importante sobre el problema. Para fallas de carga, también puede ayudar traer el cable o accesorio relacionado.', 'أحضر الجهاز وأي معلومات مهمة عن المشكلة. وفي مشاكل الشحن، من المفيد إحضار الكابل أو الملحق المستخدم.', 'Принесите устройство и важную информацию о неисправности. При проблемах с зарядкой полезно взять кабель или аксессуар.'],
  ['What happens after I request a repair?', '¿Qué ocurre después de enviar la solicitud?', 'ماذا يحدث بعد طلب الإصلاح؟', 'Что произойдет после заявки?'],
  ['TecPro99 receives your details, reviews the device and issue, then contacts you with the next steps, pricing information, and available visit options.', 'TecPro99 recibe tus datos, revisa el dispositivo y el problema y luego te contacta con los siguientes pasos, el precio y las opciones de visita.', 'تستلم TecPro99 معلوماتك وتراجع الجهاز والمشكلة، ثم تتواصل معك بالخطوات التالية والسعر وأوقات الزيارة.', 'TecPro99 получит данные, изучит устройство и проблему, а затем свяжется с вами по поводу следующих шагов, стоимости и времени визита.'],
  ['Where is TecPro99 located?', '¿Dónde está TecPro99?', 'أين يقع TecPro99؟', 'Где находится TecPro99?'],
  ['TecPro99 is located at 4362 N Elston Ave, Chicago, Illinois 60641. Call (773) 628-7132 for repair assistance.', 'TecPro99 está en 4362 N Elston Ave, Chicago, Illinois 60641. Llama al (773) 628-7132 para recibir ayuda con una reparación.', 'يقع TecPro99 في 4362 N Elston Ave، شيكاغو، إلينوي 60641. اتصل على (773) 628-7132 للمساعدة في الإصلاح.', 'TecPro99 находится по адресу: 4362 N Elston Ave, Chicago, Illinois 60641. По вопросам ремонта звоните: (773) 628-7132.'],
  ['Your next step starts with a repair request.', 'Tu siguiente paso comienza con una solicitud.', 'خطوتك التالية تبدأ بطلب إصلاح.', 'Следующий шаг начинается с заявки.'],
  ['Tell TecPro99 about your device and issue, and we will follow up with the right next step.', 'Cuéntale a TecPro99 sobre tu dispositivo y el problema, y te indicaremos el siguiente paso.', 'أخبر TecPro99 عن جهازك والمشكلة وسنتواصل معك بالخطوة المناسبة.', 'Расскажите TecPro99 об устройстве и проблеме, и мы предложим следующий шаг.'],
  ['Chicago directions', 'Direcciones en Chicago', 'الاتجاهات في شيكاغو', 'Маршрут в Чикаго'],
  ['TecPro99. Chicago, IL.', 'TecPro99. Chicago, IL.', 'TecPro99، شيكاغو، إلينوي.', 'TecPro99. Чикаго, Иллинойс.'],
  ['Phone, tablet, console & electronics repair.', 'Reparación de celulares, tabletas, consolas y electrónicos.', 'تصليح الهواتف والأجهزة اللوحية وأجهزة الألعاب والإلكترونيات.', 'Ремонт телефонов, планшетов, консолей и электроники.'],
  ['Call now', 'Llamar ahora', 'اتصل الآن', 'Позвонить'],
  ['Limited booking offer', 'Oferta limitada con reserva', 'عرض حجز محدود', 'Ограниченное предложение'],
  ['Request your repair today and get 20% off.', 'Solicita tu reparación hoy y recibe 20% de descuento.', 'اطلب إصلاحك اليوم واحصل على خصم 20%.', 'Оставьте заявку сегодня и получите скидку 20%.'],
  ['Send TecPro99 your repair details now and take 20% off your repair service.', 'Envía ahora los datos de la reparación y recibe 20% de descuento en el servicio.', 'أرسل تفاصيل الإصلاح الآن واحصل على خصم 20% على خدمة الإصلاح.', 'Отправьте данные о ремонте и получите скидку 20% на услугу.'],
  ['20% OFF REPAIR SERVICE', '20% DE DESCUENTO EN REPARACIÓN', 'خصم 20% على خدمة الإصلاح', 'СКИДКА 20% НА РЕМОНТ'],
  ['Request 20% off', 'Solicitar 20% de descuento', 'اطلب خصم 20%', 'Получить скидку 20%'],
  ['Not now', 'Ahora no', 'ليس الآن', 'Не сейчас'],
  ['Offer availability and eligibility may vary. Confirm offer details before repair begins.', 'La disponibilidad y elegibilidad pueden variar. Confirma los detalles antes de comenzar la reparación.', 'قد يختلف توفر العرض وشروطه. أكد التفاصيل قبل بدء الإصلاح.', 'Доступность и условия предложения могут отличаться. Уточните детали до начала ремонта.'],
  ['TecPro99 repair request', 'Solicitud de reparación TecPro99', 'طلب إصلاح TecPro99', 'Заявка на ремонт TecPro99'],
  ['Request a repair.', 'Solicita una reparación.', 'اطلب إصلاحًا.', 'Оставьте заявку на ремонт.'],
  ['Share the essentials and TecPro99 will contact you shortly. Fields marked with an asterisk are required.', 'Comparte los datos esenciales y TecPro99 te contactará pronto. Los campos con asterisco son obligatorios.', 'أرسل المعلومات الأساسية وستتواصل معك TecPro99 قريبًا. الحقول المميزة بنجمة مطلوبة.', 'Укажите основные данные, и TecPro99 скоро свяжется с вами. Поля со звездочкой обязательны.'],
  ['Full Name', 'Nombre completo', 'الاسم الكامل', 'Полное имя'],
  ['Phone Number', 'Número de teléfono', 'رقم الهاتف', 'Номер телефона'],
  ['US phone numbers only.', 'Solo números de teléfono de EE. UU.', 'أرقام هواتف أمريكية فقط.', 'Только номера США.'],
  ['Add optional details', 'Agregar detalles opcionales', 'أضف تفاصيل اختيارية', 'Добавить необязательные данные'],
  ['Device, issue, email, and contact preference', 'Dispositivo, problema, correo y contacto preferido', 'الجهاز والمشكلة والبريد وطريقة التواصل', 'Устройство, проблема, почта и способ связи'],
  ['Email Address', 'Correo electrónico', 'البريد الإلكتروني', 'Электронная почта'],
  ['Device Type', 'Tipo de dispositivo', 'نوع الجهاز', 'Тип устройства'],
  ['Select a device', 'Selecciona un dispositivo', 'اختر جهازًا', 'Выберите устройство'],
  ['Phone', 'Celular', 'هاتف', 'Телефон'],
  ['Tablet', 'Tableta', 'جهاز لوحي', 'Планшет'],
  ['Laptop', 'Laptop', 'كمبيوتر محمول', 'Ноутбук'],
  ['Console', 'Consola', 'جهاز ألعاب', 'Консоль'],
  ['Other', 'Otro', 'أخرى', 'Другое'],
  ['Brand', 'Marca', 'العلامة التجارية', 'Бренд'],
  ['Model', 'Modelo', 'الطراز', 'Модель'],
  ['Problem Description', 'Descripción del problema', 'وصف المشكلة', 'Описание проблемы'],
  ['Preferred Contact Method', 'Método de contacto preferido', 'طريقة التواصل المفضلة', 'Предпочтительный способ связи'],
  ['No preference', 'Sin preferencia', 'لا تفضيل', 'Без предпочтений'],
  ['Phone Call', 'Llamada', 'مكالمة هاتفية', 'Телефонный звонок'],
  ['Text Message', 'Mensaje de texto', 'رسالة نصية', 'SMS'],
  ['Email', 'Correo electrónico', 'بريد إلكتروني', 'Электронная почта'],
  ['Company Website', 'Sitio web de la empresa', 'موقع الشركة', 'Сайт компании'],
  ['I agree that TecPro99 may contact me about this repair request.', 'Acepto que TecPro99 me contacte sobre esta solicitud de reparación.', 'أوافق على أن تتواصل معي TecPro99 بخصوص طلب الإصلاح.', 'Я согласен, чтобы TecPro99 связалась со мной по этой заявке.'],
  ['Submit Request', 'Enviar solicitud', 'إرسال الطلب', 'Отправить заявку'],
  ['Do not include a device passcode, payment information, or other sensitive account details.', 'No incluyas códigos del dispositivo, información de pago ni otros datos confidenciales.', 'لا ترسل رمز الجهاز أو معلومات الدفع أو أي بيانات حساسة.', 'Не указывайте пароль устройства, платежные данные или другую конфиденциальную информацию.'],
  ['Are you sure this is your phone number?', '¿Confirmas que este es tu número?', 'هل أنت متأكد أن هذا رقم هاتفك؟', 'Это ваш номер телефона?'],
  ['TecPro99 will use this number to contact you about the repair.', 'TecPro99 usará este número para contactarte sobre la reparación.', 'ستستخدم TecPro99 هذا الرقم للتواصل معك بشأن الإصلاح.', 'TecPro99 использует этот номер для связи по ремонту.'],
  ['Please check every digit before sending your request.', 'Revisa cada dígito antes de enviar la solicitud.', 'راجع كل رقم قبل إرسال الطلب.', 'Проверьте каждую цифру перед отправкой.'],
  ['Yes, submit request', 'Sí, enviar solicitud', 'نعم، أرسل الطلب', 'Да, отправить заявку'],
  ['Edit number', 'Editar número', 'تعديل الرقم', 'Изменить номер'],
  ['Thank you. TecPro99 received your repair request. We will contact you shortly.', 'Gracias. TecPro99 recibió tu solicitud y te contactará pronto.', 'شكرًا لك. استلمت TecPro99 طلب الإصلاح وسنتواصل معك قريبًا.', 'Спасибо. TecPro99 получила вашу заявку и скоро свяжется с вами.'],
  ['Close', 'Cerrar', 'إغلاق', 'Закрыть'],
  ['Choose language', 'Elegir idioma', 'اختر اللغة', 'Выбрать язык'],
  ['Primary navigation', 'Navegación principal', 'التنقل الرئيسي', 'Основная навигация'],
  ['Service benefits', 'Beneficios del servicio', 'مزايا الخدمة', 'Преимущества сервиса'],
  ['Popular estimate requests', 'Solicitudes de cotización populares', 'طلبات الأسعار الشائعة', 'Популярные запросы стоимости'],
  ['Customer feedback', 'Opiniones de clientes', 'آراء العملاء', 'Отзывы клиентов'],
  ['Back to top', 'Volver arriba', 'العودة للأعلى', 'Наверх'],
  ['Close special offer', 'Cerrar oferta especial', 'إغلاق العرض الخاص', 'Закрыть предложение'],
  ['Close repair request', 'Cerrar solicitud de reparación', 'إغلاق طلب الإصلاح', 'Закрыть заявку'],
  ['What is happening with the device?', '¿Qué sucede con el dispositivo?', 'ما المشكلة في الجهاز؟', 'Что происходит с устройством?']
];

const dynamicRows = [
  ["We couldn't submit your request right now. Please try again or call TecPro99 at (773) 628-7132.", 'No pudimos enviar tu solicitud. Inténtalo de nuevo o llama a TecPro99 al (773) 628-7132.', 'تعذر إرسال طلبك الآن. حاول مرة أخرى أو اتصل بـ TecPro99 على (773) 628-7132.', 'Не удалось отправить заявку. Попробуйте снова или позвоните в TecPro99: (773) 628-7132.'],
  ['Submitting...', 'Enviando...', 'جارٍ الإرسال...', 'Отправка...'],
  ['Spam protection is unavailable right now. Please call TecPro99 at (773) 628-7132.', 'La protección contra spam no está disponible. Llama a TecPro99 al (773) 628-7132.', 'حماية البريد المزعج غير متاحة الآن. اتصل بـ TecPro99 على (773) 628-7132.', 'Защита от спама сейчас недоступна. Позвоните в TecPro99: (773) 628-7132.'],
  ['Please complete the required fields before submitting your request.', 'Completa los campos obligatorios antes de enviar la solicitud.', 'أكمل الحقول المطلوبة قبل إرسال الطلب.', 'Заполните обязательные поля перед отправкой.'],
  ['Enter a valid 10-digit US phone number so TecPro99 can reach you.', 'Ingresa un número válido de EE. UU. de 10 dígitos.', 'أدخل رقم هاتف أمريكيًا صحيحًا من 10 أرقام.', 'Введите действующий 10-значный номер США.'],
  ['Please complete spam protection before submitting your request.', 'Completa la protección contra spam antes de enviar la solicitud.', 'أكمل التحقق من الحماية قبل إرسال الطلب.', 'Пройдите проверку от спама перед отправкой.'],
  ['Please check the highlighted information and try again.', 'Revisa la información resaltada e inténtalo de nuevo.', 'راجع المعلومات المحددة وحاول مرة أخرى.', 'Проверьте выделенные данные и попробуйте снова.'],
  ['Spam protection expired or could not verify the request. Please complete it again.', 'La protección contra spam venció o no pudo verificar la solicitud. Complétala nuevamente.', 'انتهت صلاحية التحقق أو تعذر تأكيد الطلب. يرجى إكمال التحقق مرة أخرى.', 'Проверка от спама истекла или не смогла подтвердить заявку. Пройдите ее еще раз.'],
  ['Too many requests were sent from this network. Please wait 30 minutes or call TecPro99 at (773) 628-7132.', 'Se enviaron demasiadas solicitudes desde esta red. Espera 30 minutos o llama a TecPro99 al (773) 628-7132.', 'تم إرسال طلبات كثيرة من هذه الشبكة. انتظر 30 دقيقة أو اتصل بـ TecPro99 على (773) 628-7132.', 'Из этой сети отправлено слишком много заявок. Подождите 30 минут или позвоните в TecPro99: (773) 628-7132.'],
  ['This phone number already has recent repair requests. Please wait one hour or call TecPro99 at (773) 628-7132.', 'Este número ya tiene solicitudes de reparación recientes. Espera una hora o llama a TecPro99 al (773) 628-7132.', 'يوجد لهذا الرقم طلب إصلاح حديث. انتظر ساعة أو اتصل بـ TecPro99 على (773) 628-7132.', 'С этого номера недавно уже отправлялись заявки. Подождите один час или позвоните в TecPro99: (773) 628-7132.']
];

function decodeHtml(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

function encodeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function mapFor(locale) {
  const index = locale === 'es' ? 1 : locale === 'ar' ? 2 : 3;
  return new Map(copyRows.map((row) => [row[0], row[index]]));
}

function translateVisibleHtml(source, translations) {
  const blocks = [];
  let html = source.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (block) => {
    const marker = `<!--TECPRO99_BLOCK_${blocks.length}-->`;
    blocks.push(block);
    return marker;
  });

  html = html.replace(/>([^<>]+)</g, (match, rawText) => {
    const leading = rawText.match(/^\s*/)?.[0] ?? '';
    const trailing = rawText.match(/\s*$/)?.[0] ?? '';
    const text = decodeHtml(rawText.trim());
    const translated = translations.get(text);
    return translated === undefined ? match : `>${leading}${encodeHtml(translated)}${trailing}<`;
  });

  html = html.replace(/\b(aria-label|alt|placeholder|title)="([^"]*)"/g, (match, attribute, rawValue) => {
    const value = decodeHtml(rawValue);
    const translated = translations.get(value);
    return translated === undefined ? match : `${attribute}="${encodeHtml(translated).replaceAll('"', '&quot;')}"`;
  });

  return html.replace(/<!--TECPRO99_BLOCK_(\d+)-->/g, (_, index) => blocks[Number(index)]);
}

function replaceMeta(html, selector, content) {
  const escaped = encodeHtml(content).replaceAll('"', '&quot;');
  const expression = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*(">)`, 'i');
  return html.replace(expression, `$1${escaped}$2`);
}

function localize(source, locale) {
  const info = localeInfo[locale];
  const translations = mapFor(locale);
  let html = translateVisibleHtml(source, translations);
  html = html.replace('<html lang="en">', `<html lang="${info.htmlLang}" dir="${info.dir}">`);
  html = html.replace('<body data-locale="en">', `<body data-locale="${locale}">`);
  html = html.replace('<link rel="canonical" href="https://techpro99.com/">', `<link rel="canonical" href="https://techpro99.com${info.path}">`);
  html = replaceMeta(html, 'name="description"', info.description);
  html = replaceMeta(html, 'property="og:title"', info.title);
  html = replaceMeta(html, 'property="og:description"', info.description);
  html = replaceMeta(html, 'property="og:url"', `https://techpro99.com${info.path}`);
  html = replaceMeta(html, 'property="og:locale"', info.ogLocale);
  const alternateOgLocales = ['en_US', ...Object.values(localeInfo).map((entry) => entry.ogLocale)]
    .filter((entry) => entry !== info.ogLocale)
    .map((entry) => `  <meta property="og:locale:alternate" content="${entry}">`)
    .join('\n');
  html = html.replace(/(?:  <meta property="og:locale:alternate" content="[^"]+">\r?\n?){3}/, `${alternateOgLocales}\n`);
  html = replaceMeta(html, 'name="twitter:title"', info.title);
  html = replaceMeta(html, 'name="twitter:description"', info.description);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${encodeHtml(info.title)}</title>`);
  html = html.replace(/ aria-current="page"/g, '');
  html = html.replace(new RegExp(`(<a href="${info.path.replaceAll('/', '\\/')}"[^>]*)(>)`), '$1 aria-current="page"$2');
  html = html.replace(/(<summary aria-label="[^"]+"><i[^>]+><\/i><span>)[A-Z]{2}(<\/span>)/, `$1${info.code}$2`);
  html = html.replaceAll('src="assets/', 'src="/assets/').replaceAll('href="assets/', 'href="/assets/').replaceAll('url("assets/', 'url("/assets/');
  html = html.replaceAll('href="/iphone-repair-chicago/"', `href="${info.iphonePath}"`);

  const jsonIndex = locale === 'es' ? 1 : locale === 'ar' ? 2 : 3;
  for (const row of copyRows) {
    const english = JSON.stringify(row[0]);
    const translated = JSON.stringify(row[jsonIndex]);
    html = html.replaceAll(english, translated);
  }
  html = html.replaceAll('"inLanguage": "en-US"', `"inLanguage": "${info.languageTag}"`);
  html = html.replaceAll('"https://techpro99.com/#webpage"', `"https://techpro99.com${info.path}#webpage"`);

  for (const row of dynamicRows) {
    const translated = row[jsonIndex];
    html = html.replaceAll(`'${row[0].replaceAll("'", "\\'")}'`, `'${translated.replaceAll("'", "\\'")}'`);
    html = html.replaceAll(`"${row[0].replaceAll('"', '\\"')}"`, `"${translated.replaceAll('"', '\\"')}"`);
  }
  html = html.replaceAll("'Submit Request'", `'${translations.get('Submit Request')}'`);
  html = html.replaceAll("'Yes, submit request'", `'${translations.get('Yes, submit request')}'`);
  html = html.replaceAll('`Selected service: ${repairRequestForm.dataset.service}`', locale === 'es'
    ? '`Servicio seleccionado: ${repairRequestForm.dataset.service}`'
    : locale === 'ar' ? '`الخدمة المختارة: ${repairRequestForm.dataset.service}`'
      : '`Выбранная услуга: ${repairRequestForm.dataset.service}`');
  html = html.replaceAll('`Reference: ${result.referenceNumber}`', locale === 'es'
    ? '`Referencia: ${result.referenceNumber}`'
    : locale === 'ar' ? '`الرقم المرجعي: ${result.referenceNumber}`'
      : '`Номер заявки: ${result.referenceNumber}`');
  html = html.replace('`A repair request was recently submitted from this browser. Please wait ${minutesRemaining} minute${minutesRemaining === 1 ? \'\' : \'s\'} or call TecPro99 at (773) 628-7132.`', locale === 'es'
    ? '`Se envió recientemente una solicitud desde este navegador. Espera ${minutesRemaining} minuto${minutesRemaining === 1 ? \'\' : \'s\'} o llama a TecPro99 al (773) 628-7132.`'
    : locale === 'ar' ? '`تم إرسال طلب إصلاح مؤخرًا من هذا المتصفح. يرجى الانتظار ${minutesRemaining} دقيقة أو الاتصال بـ TecPro99 على (773) 628-7132.`'
      : '`С этого браузера недавно уже отправлялась заявка. Подождите ${minutesRemaining} мин. или позвоните в TecPro99: (773) 628-7132.`');
  return html;
}

const source = fs.readFileSync(sourcePath, 'utf8');
for (const locale of Object.keys(localeInfo)) {
  const directory = path.join(projectRoot, locale);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), localize(source, locale), 'utf8');
}

console.log('Built localized TecPro99 pages: es, ar, ru');
