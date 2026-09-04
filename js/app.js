const seedProducts = [
  { id: 1, name: 'Кофе Колумбия', sku: 'COF-001', category: 'Напитки', stock: 124, min: 40, unit: 'упак.', icon: '☕' },
  { id: 2, name: 'Молоко 3.2%', sku: 'MLK-032', category: 'Молочные продукты', stock: 68, min: 30, unit: 'шт.', icon: '🥛' },
  { id: 3, name: 'Сахар-песок', sku: 'SUG-001', category: 'Бакалея', stock: 21, min: 25, unit: 'кг', icon: '◇' },
  { id: 4, name: 'Стакан бумажный 250 мл', sku: 'CUP-250', category: 'Расходники', stock: 850, min: 300, unit: 'шт.', icon: '▱' },
  { id: 5, name: 'Чай Earl Grey', sku: 'TEA-004', category: 'Напитки', stock: 42, min: 20, unit: 'упак.', icon: '♨' }
];
const seedMovements = [];
let products = seedProducts;
let movements = seedMovements;
let currentView = 'overview';
let currentUser = JSON.parse(sessionStorage.getItem('stockroom-auth') || 'null');
let role = currentUser?.role || 'Оператор';
let language = localStorage.getItem('stockroom-language') || 'uz';
const apiBase = location.port === '5500' ? 'http://localhost:4173' : '';

const translations = {
  'Закрытая рабочая зона': 'Yopiq ish hududi', 'Вход сотрудника': 'Xodimlar uchun kirish', 'Введите рабочие данные, чтобы открыть склад.': 'Omborni ochish uchun ish maʼlumotlaringizni kiriting.', 'Рабочий email': 'Ish emaili', 'Пароль': 'Parol', 'Введите пароль': 'Parolni kiriting', 'Войти в систему': 'Tizimga kirish', 'Доступ только для сотрудников Stockroom': 'Kirish faqat Stockroom xodimlari uchun', 'Рабочая область': 'Ish maydoni', 'Обзор': 'Umumiy ko‘rinish', 'Товары': 'Mahsulotlar', 'Движения': 'Harakatlar', 'Отчёты': 'Hisobotlar', 'Сотрудники': 'Xodimlar', 'Последняя синхронизация': 'So‘nggi sinxronizatsiya', 'сегодня, 11:06': 'bugun, 11:06', 'оператор': 'operator', 'администратор': 'administrator', 'Склад': 'Ombor', 'Добрый день, Анна': 'Assalomu alaykum, Anna', 'Вот что происходит на складе сегодня.': 'Bugun omborda sodir bo‘layotganlar.', 'Новый товар': 'Yangi mahsulot', 'Всего товаров': 'Jami mahsulotlar', 'Общая стоимость': 'Umumiy qiymat', 'Низкий остаток': 'Qoldiq kam', 'Требуют внимания': 'Eʼtibor talab qiladi', 'Операций сегодня': 'Bugungi amaliyotlar', 'За текущий день': 'Bugungi kun uchun', 'Остатки товаров': 'Mahsulot qoldiqlari', 'Контроль доступных позиций на складе': 'Ombordagi mavjud mahsulotlar nazorati', 'Все товары': 'Barcha mahsulotlar', 'Последние операции': 'So‘nggi amaliyotlar', 'Журнал за сегодня': 'Bugungi jurnal', 'Весь журнал': 'To‘liq jurnal', 'Каталог склада': 'Ombor katalogi', 'позиций в системе': 'ta mahsulot tizimda', 'Поиск по названию или SKU': 'Nom yoki SKU bo‘yicha qidirish', 'Экспорт CSV': 'CSV eksporti', 'Нажмите «Операция», чтобы изменить остаток': 'Qoldiqni o‘zgartirish uchun «Amaliyot»ni bosing', 'Операция': 'Amaliyot', 'Удалить': 'O‘chirish', 'В наличии': 'Mavjud', 'Низкий остаток': 'Qoldiq kam', 'История склада': 'Ombor tarixi', 'Все приходы и расходы в одном журнале': 'Barcha kirim va chiqimlar bir jurnalda', 'Новая операция': 'Yangi amaliyot', 'Приход увеличивает остаток, расход уменьшает его.': 'Kirim qoldiqni oshiradi, chiqim esa kamaytiradi.', 'Приход': 'Kirim', 'Расход': 'Chiqim', 'Количество': 'Miqdor', 'Провести операцию': 'Amaliyotni o‘tkazish', 'Отмена': 'Bekor qilish', 'Данные и аналитика': 'Maʼlumotlar va tahlil', 'Сводка по состоянию склада на сегодня': 'Bugungi ombor holati bo‘yicha jamlanma', 'Скачать отчёт': 'Hisobotni yuklab olish', 'Сводный отчёт': 'Yakuniy hisobot', 'Готов к выгрузке в Excel или CSV': 'Excel yoki CSV ga eksport qilishga tayyor', 'Доступ к системе': 'Tizimga kirish', 'Управление аккаунтами команды': 'Jamoa akkauntlarini boshqarish', 'Новый аккаунт': 'Yangi akkaunt', 'Аккаунты': 'Akkauntlar', 'Пароли не отображаются после создания': 'Parollar yaratilgandan so‘ng ko‘rsatilmaydi', 'Имя сотрудника': 'Xodim nomi', 'Имя Фамилия': 'Ism Familiya', 'Создать аккаунт': 'Akkaunt yaratish', 'Администратор': 'Administrator', 'Оператор': 'Operator', 'Выйти': 'Chiqish', 'Товар добавлен в каталог': 'Mahsulot katalogga qo‘shildi', 'Аккаунт добавлен в базу': 'Akkaunt bazaga qo‘shildi', 'Неверный email или пароль': 'Email yoki parol noto‘g‘ri', 'Товар удалён': 'Mahsulot o‘chirildi', 'Операций за выбранную дату нет': 'Tanlangan sanada amaliyotlar yo‘q', 'Фильтр применён: ': 'Filtr qo‘llandi: '
};

translations['Сегодня'] = 'Bugun';
translations['Вчера'] = 'Kecha';
translations['Товар'] = 'Mahsulot';
translations['Остаток'] = 'Qoldiq';
translations['Минимум'] = 'Minimum';
translations['Статус'] = 'Holat';
translations['Уведомления'] = 'Bildirishnomalar';
translations['Новых предупреждений нет'] = 'Yangi ogohlantirishlar yo‘q';
translations['Последние операции: '] = 'So‘nggi amaliyotlar: ';
translations['Сервер вернул некорректный ответ'] = 'Server noto‘g‘ri javob qaytardi';
translations['Сервер недоступен'] = 'Server mavjud emas';
translations['Экспорт журнала'] = 'Jurnal eksporti';
translations['Журнал операций'] = 'Amaliyotlar jurnali';
translations['Последние изменения остатков'] = 'Qoldiqdagi so‘nggi o‘zgarishlar';
translations['Ничего не найдено'] = 'Hech narsa topilmadi';
translations['Удалить аккаунт'] = 'Akkauntni o‘chirish';
translations['Аккаунт удалён'] = 'Akkaunt o‘chirildi';
translations['Нельзя удалить свой аккаунт'] = 'O‘z akkauntingizni o‘chirib bo‘lmaydi';
const locale = () => language === 'uz' ? 'uz-UZ' : 'ru-RU';
const currency = () => language === 'uz' ? 'UZS' : 'RUB';
const formatMoney = amount => new Intl.NumberFormat(locale(), { style: 'currency', currency: currency(), maximumFractionDigits: 0 }).format(amount);
const formatDateTime = date => new Intl.DateTimeFormat(locale(), { dateStyle: 'short', timeStyle: 'medium' }).format(date);
const parseResponse = async response => { const raw = await response.text(); try { return raw ? JSON.parse(raw) : {}; } catch { return { ok: false, error: 'Сервер вернул некорректный ответ' }; } };
const authHeaders = () => currentUser?.access_token ? { Authorization: `Bearer ${currentUser.access_token}` } : {};
const translatePage = () => {
  const dictionary = language === 'uz' ? translations : Object.fromEntries(Object.entries(translations).map(([from, to]) => [to, from]));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) { let value = walker.currentNode.nodeValue; Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length).forEach(([from, to]) => { value = value.replaceAll(from, to); }); walker.currentNode.nodeValue = value; }
  document.querySelectorAll('input[placeholder]').forEach(input => { if (dictionary[input.placeholder]) input.placeholder = dictionary[input.placeholder]; });
  document.querySelectorAll('#language-toggle, #auth-language-toggle').forEach(button => { button.textContent = language === 'uz' ? 'RU' : 'UZ'; });
  const currencyIcon = document.querySelector('#overview-view .stat-icon:nth-child(2)');
  if (currencyIcon) currencyIcon.textContent = currency();
};

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="auth-gate" id="auth-gate">
    <div class="auth-card">
      <div class="auth-topline"><img class="auth-logo" src="/favicon.svg" alt="Stockroom" /><button class="language-toggle auth-language" id="auth-language-toggle">RU</button></div>
      <div class="eyebrow">Закрытая рабочая зона</div>
      <h1>Вход сотрудника</h1>
      <p>Введите рабочие данные, чтобы открыть склад.</p>
      <form id="login-form">
        <div class="field"><label for="login-email">Рабочий email</label><input id="login-email" name="email" type="email" placeholder="worker@stockroom.local" required /></div>
        <div class="field"><label for="login-password">Пароль</label><div class="password-wrap"><input id="login-password" name="password" type="password" placeholder="Введите пароль" required /><button class="password-toggle" type="button" data-password-target="login-password" aria-label="Показать пароль" title="Показать пароль">◉</button></div></div>
        <div class="login-error" id="login-error"></div>
        <button class="primary auth-submit">Войти в систему <span>→</span></button>
      </form>
      <small>Доступ только для сотрудников Stockroom</small>
    </div>
  </div>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand"><img class="brand-mark" src="/favicon.svg" alt="Stockroom" /> stockroom</div>
      <div class="nav-label">Рабочая область</div>
      <nav class="nav">
        <button class="active" data-view="overview"><span class="nav-icon">⌂</span>Обзор</button>
        <button data-view="products"><span class="nav-icon">▦</span>Товары</button>
        <button data-view="movements"><span class="nav-icon">↕</span>Движения</button>
        <button data-view="reports"><span class="nav-icon">▤</span>Отчёты</button>
        <button data-view="accounts" class="admin-only"><span class="nav-icon">♙</span>Сотрудники</button>
      </nav>
      <div class="sidebar-footer">Последняя синхронизация<br><strong>сегодня, 11:06</strong><div class="user-pill"><span class="avatar">СП</span><span>Сотрудник склада<br><small>оператор</small></span></div></div>
    </aside>
    <main class="main">
      <header class="topbar"><div class="crumb">Склад / <strong id="crumb-title">Обзор</strong></div><div class="top-actions"><button class="language-toggle" id="language-toggle">RU</button><button class="icon-button" id="notifications-button" title="Уведомления">♧<span class="notice-dot"></span></button><div class="top-user" id="top-user"><span class="top-user-name">Сотрудник</span><span class="top-user-role">Оператор</span></div><button class="logout" id="logout">Выйти</button></div></header>
      <div class="notifications-panel" id="notifications-panel"></div>
      <section class="view active" id="overview-view"></section>
      <section class="view" id="products-view"></section>
      <section class="view" id="movements-view"></section>
      <section class="view" id="reports-view"></section>
      <section class="view" id="accounts-view"></section>
    </main>
  </div>
  <div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2 id="modal-title">Новый товар</h2><p id="modal-subtitle">Добавьте позицию в каталог склада.</p></div><button class="icon-button" id="close-modal">×</button></div><form id="modal-form"></form></div></div>
  <div class="toast" id="toast"></div>
`;

const save = async () => {
  try {
    await fetch(`${apiBase}/api/state`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ products, movements }) });
  } catch {
    localStorage.setItem('stockroom-products', JSON.stringify(products));
    localStorage.setItem('stockroom-movements', JSON.stringify(movements));
  }
};
const money = n => new Intl.NumberFormat('ru-RU').format(n);
const lowCount = () => products.filter(p => p.stock < p.min).length;
const toast = message => { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2600); };
const productRows = (items = products) => items.map(p => `<tr><td><div class="product"><span class="product-symbol">${p.icon}</span><span>${p.name}<small>${p.sku} · ${p.category}</small></span></div></td><td class="stock ${p.stock < p.min ? 'low' : ''}">${money(p.stock)} ${p.unit}</td><td>${p.min} ${p.unit}</td><td><span class="badge ${p.stock < p.min ? 'low' : 'ok'}">${p.stock < p.min ? 'Низкий остаток' : 'В наличии'}</span></td><td><div class="actions"><button class="small-btn" data-move="${p.id}">Операция</button><button class="small-btn" data-delete="${p.id}" ${role === 'Оператор' ? 'disabled title="Недоступно оператору"' : ''}>Удалить</button></div></td></tr>`).join('');
const table = (items = products) => `<div class="table-wrap"><table><thead><tr><th>Товар</th><th>Остаток</th><th>Минимум</th><th>Статус</th><th></th></tr></thead><tbody>${items.length ? productRows(items) : '<tr><td colspan="5"><div class="empty">Ничего не найдено</div></td></tr>'}</tbody></table></div>`;
const activity = (items = movements) => items.slice(0, 20).map(m => `<div class="activity-row"><span class="activity-dot ${m.type === 'out' ? 'out' : ''}"></span><div><p class="activity-text"><strong>${m.type === 'in' ? 'Приход' : 'Расход'}</strong> · ${m.product} <strong>${m.type === 'in' ? '+' : '-'}${m.amount}</strong></p><span class="activity-time">${m.date} · ${m.person}</span></div></div>`).join('') || '<div class="empty">Операций за выбранную дату нет</div>';

function renderOverview() {
  const userName = currentUser?.name || 'Сотрудник';
  const greeting = language === 'uz' ? `Assalomu alaykum, ${userName}` : `Добрый день, ${userName}`;
  document.querySelector('#overview-view').innerHTML = `<div class="page-head"><div><div class="eyebrow">Среда, 14 мая 2025</div><h1>${greeting}</h1><p class="subtitle">Вот что происходит на складе сегодня.</p></div><button class="primary" id="add-product">＋ Новый товар</button></div><div class="stats"><article class="stat"><div class="stat-top"><span>Всего товаров</span><span class="stat-icon">▦</span></div><div class="stat-value">${products.length}</div><span class="stat-meta up">↑ 2 за месяц</span></article><article class="stat"><div class="stat-top"><span>Общая стоимость</span><span class="stat-icon">₽</span></div><div class="stat-value">₽ 284 650</div><span class="stat-meta up">↑ 8.4% к апрелю</span></article><article class="stat"><div class="stat-top"><span>Низкий остаток</span><span class="stat-icon">!</span></div><div class="stat-value">${lowCount()}</div><span class="stat-meta warn">Требуют внимания</span></article><article class="stat"><div class="stat-top"><span>Операций сегодня</span><span class="stat-icon">↕</span></div><div class="stat-value">${movements.filter(m => m.date.startsWith('Сегодня')).length}</div><span class="stat-meta">За текущий день</span></article></div><div class="grid"><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Остатки товаров</h2><p class="panel-caption">Контроль доступных позиций на складе</p></div><button class="text-link" data-view-link="products">Все товары →</button></div>${table(products.slice(0, 5))}</section><section class="panel activity-panel"><div class="panel-head"><div><h2 class="panel-title">Последние операции</h2><p class="panel-caption">Журнал за сегодня</p></div><button class="text-link" data-view-link="movements">Весь журнал →</button></div><div class="activity">${activity()}</div></section></div>`;
}
function renderProducts() { document.querySelector('#products-view').innerHTML = `<div class="page-head"><div><div class="eyebrow">Каталог склада</div><h1>Товары</h1><p class="subtitle">${products.length} позиций в системе</p></div><button class="primary" id="add-product">＋ Новый товар</button></div><div class="toolbar"><div class="search"><input id="product-search" placeholder="Поиск по названию или SKU" /></div><button class="ghost" id="export-products">↧ Экспорт CSV</button></div><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Все товары</h2><p class="panel-caption">Нажмите «Операция», чтобы изменить остаток</p></div></div><div id="products-table">${table()}</div></section>`; }
function renderMovements() { document.querySelector('#movements-view').innerHTML = `<div class="page-head"><div><div class="eyebrow">История склада</div><h1>Движения</h1><p class="subtitle">Все приходы и расходы в одном журнале</p></div><button class="primary" id="add-movement">＋ Новая операция</button></div><div class="toolbar"><input class="ghost" type="date" id="date-filter" /><button class="ghost" id="export-movements">↧ Экспорт журнала</button></div><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Журнал операций</h2><p class="panel-caption">Последние изменения остатков</p></div></div><div class="activity" id="movement-list">${activity()}</div></section>`; }
function renderReports() { document.querySelector('#reports-view').innerHTML = `<div class="page-head"><div><div class="eyebrow">Данные и аналитика</div><h1>Отчёты</h1><p class="subtitle">Сводка по состоянию склада на сегодня</p></div><button class="primary" id="export-report">↧ Скачать отчёт</button></div><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Сводный отчёт</h2><p class="panel-caption">Готов к выгрузке в Excel или CSV</p></div></div>${table(products)}</section>`; }
async function renderAccounts() {
  const view = document.querySelector('#accounts-view');
  if (role !== 'Администратор') { view.innerHTML = '<div class="empty">Раздел доступен только администратору</div>'; return; }
  let accounts = [];
  try { accounts = await fetch(`${apiBase}/api/accounts`, { headers: authHeaders() }).then(parseResponse); } catch { accounts = []; }
  view.innerHTML = `<div class="page-head"><div><div class="eyebrow">Доступ к системе</div><h1>Сотрудники</h1><p class="subtitle">Управление аккаунтами команды</p></div><button class="primary" id="add-account">＋ Новый аккаунт</button></div><section class="panel"><div class="panel-head"><div><h2 class="panel-title">Аккаунты</h2><p class="panel-caption">Пароли не отображаются после создания</p></div></div><div class="account-list">${accounts.map(account => `<div class="account-row"><span class="avatar">${account.name.split(' ').map(word => word[0]).slice(0, 2).join('')}</span><div><strong>${account.name}</strong><small>${account.email}</small></div><span class="badge ${account.role === 'Администратор' ? 'in' : 'ok'}">${account.role}</span><button class="small-btn account-delete" data-account-delete="${account.id}" ${account.id === currentUser?.id ? 'disabled title="Нельзя удалить свой аккаунт"' : ''}>Удалить</button></div>`).join('')}</div></section><section class="panel" id="telegram-panel"><div class="panel-head"><div><h2 class="panel-title">Telegram-уведомления</h2><p class="panel-caption">О низком остатке будет писать бот</p></div></div><div style="padding:20px">Загрузка…</div></section>`;
  document.querySelector('#add-account').onclick = () => openAccountModal();
  document.querySelectorAll('[data-account-delete]').forEach(button => button.onclick = async () => { if (button.disabled) return; if (!confirm('Удалить этот аккаунт?')) return; try { const response = await fetch(`${apiBase}/api/accounts`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ id: button.dataset.accountDelete }) }); const result = await parseResponse(response); if (!response.ok) return toast(result.error || 'Не удалось удалить аккаунт'); await renderAccounts(); toast('Аккаунт удалён'); } catch { toast('Сервер недоступен'); } });
  renderTelegramPanel();
}

async function renderTelegramPanel() {
  const box = document.querySelector('#telegram-panel > div');
  if (!box) return;
  try {
    const status = await fetch(`${apiBase}/api/telegram-link`, { headers: authHeaders() }).then(parseResponse);
    if (status.linked) {
      box.innerHTML = `<p>✅ Чат подключён — уведомления о низком остатке приходят в Telegram.</p><button class="ghost" id="telegram-unlink">Отключить</button>`;
      document.querySelector('#telegram-unlink').onclick = async () => {
        await fetch(`${apiBase}/api/telegram-link`, { method: 'DELETE', headers: authHeaders() });
        toast('Telegram отключён');
        renderTelegramPanel();
      };
    } else if (status.deepLink) {
      box.innerHTML = `<p>Нажмите кнопку и отправьте боту команду <code>/start</code> — привяжется автоматически.</p><a class="primary" href="${status.deepLink}" target="_blank" rel="noopener">Подключить Telegram</a>`;
    } else {
      box.innerHTML = `<p>Откройте бота в Telegram и отправьте: <code>/start ${status.code}</code></p>`;
    }
  } catch {
    box.innerHTML = '<p>Не удалось загрузить статус Telegram.</p>';
  }
}
function renderAll() { renderOverview(); renderProducts(); renderMovements(); renderReports(); renderAccounts(); bindViewEvents(); document.querySelectorAll('.admin-only').forEach(item => item.hidden = role !== 'Администратор'); const profile = document.querySelector('.user-pill span:last-child'); if (profile && currentUser) profile.innerHTML = `${currentUser.name}<br><small>${currentUser.role.toLowerCase()}${currentUser.companyName ? ' · ' + currentUser.companyName : ''}</small>`; const topUser = document.querySelector('#top-user'); if (topUser && currentUser) topUser.innerHTML = `<span class="top-user-name">${currentUser.name}</span><span class="top-user-role">${currentUser.role}</span>`; translatePage(); document.querySelector('#overview-view .eyebrow').textContent = new Intl.DateTimeFormat(locale(), { dateStyle: 'full' }).format(new Date()); document.querySelectorAll('#overview-view .stat-value')[1].textContent = formatMoney(284650); }
function openAccountModal() {
  const backdrop = document.querySelector('#modal-backdrop');
  const form = document.querySelector('#modal-form');
  document.querySelector('#modal-title').textContent = 'Новый аккаунт';
  document.querySelector('#modal-subtitle').textContent = 'Создайте отдельный доступ для сотрудника.';
  form.innerHTML = `<div class="field"><label>Имя сотрудника</label><input name="name" placeholder="Имя Фамилия" required /></div><div class="field"><label>Рабочий email</label><input name="email" type="email" placeholder="name@company.ru" required /></div><div class="field"><label>Пароль</label><div class="password-wrap"><input id="new-account-password" name="password" type="password" minlength="6" required /><button class="password-toggle" type="button" data-password-target="new-account-password" aria-label="Показать пароль" title="Показать пароль">◉</button></div></div><div class="field"><label>Роль</label><select name="role"><option>Оператор</option><option>Администратор</option></select></div><div class="modal-actions"><button type="button" class="ghost" id="cancel-modal">Отмена</button><button class="primary">Создать аккаунт</button></div>`;
  backdrop.classList.add('open');
  form.querySelector('.password-toggle').onclick = event => togglePassword(event.currentTarget);
  form.onsubmit = async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(form)); try { const response = await fetch(`${apiBase}/api/accounts`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(data) }); const result = await parseResponse(response); if (!response.ok) return toast(result.error || 'Не удалось создать аккаунт'); backdrop.classList.remove('open'); await renderAccounts(); toast('Аккаунт добавлен в базу'); } catch { toast('Сервер недоступен'); } };
  document.querySelector('#cancel-modal').onclick = () => backdrop.classList.remove('open');
}
function openModal(kind, productId = null) {
  const backdrop = document.querySelector('#modal-backdrop');
  const form = document.querySelector('#modal-form');
  document.querySelector('#modal-title').textContent = kind === 'product' ? 'Новый товар' : 'Новая операция';
  document.querySelector('#modal-subtitle').textContent = kind === 'product' ? 'Добавьте позицию в каталог склада.' : 'Приход увеличивает остаток, расход уменьшает его.';
  form.innerHTML = kind === 'product'
    ? `<div class="field"><label>Название товара</label><input name="name" placeholder="Например, Вода 0.5 л" required /></div><div class="field"><label>Артикул / SKU</label><input name="sku" placeholder="WTR-050" required /></div><div class="field"><label>Категория</label><input name="category" placeholder="Напитки" required /></div><div class="field"><label>Начальный остаток</label><input name="stock" type="number" min="0" value="0" required /></div><div class="field"><label>Минимальный остаток</label><input name="min" type="number" min="0" value="10" required /></div><div class="modal-actions"><button type="button" class="ghost" id="cancel-modal">Отмена</button><button class="primary">Добавить товар</button></div>`
    : `<div class="field"><label>Товар</label><select name="product">${products.map(p => `<option value="${p.id}" ${p.id == productId ? 'selected' : ''}>${p.name} · ${p.stock} ${p.unit}</option>`).join('')}</select></div><div class="field"><label>Тип операции</label><select name="type"><option value="in">Приход</option><option value="out">Расход</option></select></div><div class="field"><label>Количество</label><input name="amount" type="number" min="1" value="1" required /></div><div class="modal-actions"><button type="button" class="ghost" id="cancel-modal">Отмена</button><button class="primary">Провести операцию</button></div>`;
  backdrop.classList.add('open');
  form.onsubmit = async event => {
    event.preventDefault();
    const data = new FormData(form);
    if (kind === 'product') {
      products.push({ id: Date.now(), name: data.get('name'), sku: data.get('sku'), category: data.get('category'), stock: Number(data.get('stock')), min: Number(data.get('min')), unit: 'шт.', icon: '◈' });
      toast('Товар добавлен в каталог');
    } else {
      const product = products.find(item => item.id == data.get('product'));
      const amount = Number(data.get('amount'));
      const type = data.get('type');
      if (type === 'out' && amount > product.stock) { toast('Ошибка: нельзя списать больше остатка'); return; }
      product.stock += type === 'in' ? amount : -amount;
      movements.unshift({ type, product: product.name, amount, date: formatDateTime(new Date()), dateKey: new Date().toISOString().slice(0, 10), person: currentUser?.name || 'Сотрудник склада' });
      toast(type === 'in' ? 'Приход проведён' : 'Расход проведён');
    }
    await save();
    backdrop.classList.remove('open');
    renderAll();
  };
  document.querySelector('#cancel-modal').onclick = () => backdrop.classList.remove('open');
}
function exportCsv(rows, filename) { const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\n'); const blob = new Blob(['\\ufeff' + csv], { type: 'text/csv;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href); toast('Файл подготовлен к скачиванию'); }
function bindViewEvents() { document.querySelectorAll('[data-view], [data-view-link]').forEach(button => button.onclick = () => switchView(button.dataset.view || button.dataset.viewLink)); document.querySelectorAll('#add-product').forEach(button => button.onclick = () => openModal('product')); document.querySelector('#add-movement')?.addEventListener('click', () => openModal('movement')); document.querySelectorAll('[data-move]').forEach(button => button.onclick = () => openModal('movement', button.dataset.move)); document.querySelectorAll('[data-delete]').forEach(button => button.onclick = () => { if (role === 'Оператор') return toast('Оператор не может удалить товар'); const id = Number(button.dataset.delete); products = products.filter(p => p.id !== id); save(); renderAll(); toast('Товар удалён'); }); document.querySelector('#product-search')?.addEventListener('input', e => { const q = e.target.value.toLowerCase(); document.querySelector('#products-table').innerHTML = table(products.filter(p => `${p.name} ${p.sku}`.toLowerCase().includes(q))); bindViewEvents(); }); document.querySelector('#export-products')?.addEventListener('click', () => exportCsv([['Товар', 'SKU', 'Категория', 'Остаток', 'Минимум'], ...products.map(p => [p.name, p.sku, p.category, p.stock, p.min])], 'stockroom-products.csv')); document.querySelector('#export-report')?.addEventListener('click', () => exportCsv([['Товар', 'SKU', 'Категория', 'Остаток', 'Минимум'], ...products.map(p => [p.name, p.sku, p.category, p.stock, p.min])], 'stockroom-report.csv')); document.querySelector('#export-movements')?.addEventListener('click', () => exportCsv([['Тип', 'Товар', 'Количество', 'Дата', 'Ответственный'], ...movements.map(m => [m.type === 'in' ? 'Приход' : 'Расход', m.product, m.amount, m.date, m.person])], 'stockroom-movements.csv')); document.querySelector('#date-filter')?.addEventListener('change', e => { const date = e.target.value; if (date) toast('Фильтр применён: ' + date); }); }
function switchView(view) { currentView = view; document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === `${view}-view`)); document.querySelectorAll('[data-view]').forEach(el => el.classList.toggle('active', el.dataset.view === view)); const title = { overview: 'Обзор', products: 'Товары', movements: 'Движения', reports: 'Отчёты' }[view]; document.querySelector('#crumb-title').textContent = language === 'uz' ? translations[title] : title; }
document.querySelector('#close-modal').onclick = () => document.querySelector('#modal-backdrop').classList.remove('open');
function togglePassword(button) {
  const input = document.querySelector(`#${button.dataset.passwordTarget}`);
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  button.textContent = visible ? '◉' : '◌';
  button.title = visible ? 'Показать пароль' : 'Скрыть пароль';
  button.setAttribute('aria-label', button.title);
}
const toggleLanguage = () => { language = language === 'uz' ? 'ru' : 'uz'; localStorage.setItem('stockroom-language', language); renderAll(); };
document.querySelector('#language-toggle').onclick = toggleLanguage;
document.querySelector('#auth-language-toggle').onclick = toggleLanguage;
document.querySelector('.password-toggle').onclick = event => togglePassword(event.currentTarget);
document.querySelector('#notifications-button').onclick = () => {
  const panel = document.querySelector('#notifications-panel');
  const lowProducts = products.filter(product => product.stock < product.min);
  panel.innerHTML = `<div class="notifications-head"><strong>Уведомления</strong><button class="icon-button" id="close-notifications">×</button></div>${lowProducts.map(product => `<div class="notification-item"><span class="notification-icon">!</span><div><strong>Низкий остаток</strong><small>${product.name}: ${product.stock} ${product.unit}</small></div></div>`).join('') || '<div class="notification-empty">Новых предупреждений нет</div>'}<div class="notification-divider"></div><div class="notification-summary">Последние операции: ${movements.length}</div>`;
  translatePage();
  panel.classList.toggle('open');
  document.querySelector('#close-notifications').onclick = () => panel.classList.remove('open');
};
document.addEventListener('change', event => {
  if (event.target.id !== 'date-filter') return;
  const filtered = movements.filter(m => !event.target.value || m.dateKey === event.target.value || (!m.dateKey && event.target.value === '2025-05-14'));
  document.querySelector('#movement-list').innerHTML = activity(filtered);
});

document.querySelector('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const error = document.querySelector('#login-error');
  error.textContent = '';
  const credentials = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const response = await fetch(`${apiBase}/api/auth`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
    const raw = await response.text();
    let result;
    try { result = raw ? JSON.parse(raw) : {}; } catch { throw new Error('Сервер вернул некорректный ответ'); }
    if (!response.ok) throw new Error(result.error);
    currentUser = { ...result.user, access_token: result.access_token };
    role = currentUser.role;
    sessionStorage.setItem('stockroom-auth', JSON.stringify(currentUser));
    document.querySelector('#auth-gate').classList.add('hidden');
    await loadState();
    renderAll();
    toast('Добро пожаловать в Stockroom');
  } catch (loginError) { error.textContent = loginError.message || 'Не удалось выполнить вход'; }
});
document.querySelector('#logout').onclick = () => {
  sessionStorage.removeItem('stockroom-auth');
  currentUser = null;
  role = 'Оператор';
  products = [];
  movements = [];
  document.querySelector('#auth-gate').classList.remove('hidden');
};
if (sessionStorage.getItem('stockroom-auth')) document.querySelector('#auth-gate').classList.add('hidden');

async function loadState() {
  try {
    const response = await fetch(`${apiBase}/api/state`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Backend unavailable');
    const state = await parseResponse(response);
    if (state.products?.length) products = state.products;
    if (state.movements?.length) movements = state.movements;
    movements = movements.map(m => ({ ...m, dateKey: m.dateKey || (m.date.startsWith('Вчера') ? '2025-05-13' : '2025-05-14') }));
  } catch {
    products = JSON.parse(localStorage.getItem('stockroom-products')) || seedProducts;
    movements = JSON.parse(localStorage.getItem('stockroom-movements')) || seedMovements;
  }
}

async function boot() {
  if (currentUser?.access_token) await loadState();
  renderAll();
}

boot();
