let state = {
  products: [
    { id: 1, name: 'Кофе Колумбия', sku: 'COF-001', category: 'Напитки', stock: 124, min: 40, unit: 'упак.', icon: '☕' },
    { id: 2, name: 'Молоко 3.2%', sku: 'MLK-032', category: 'Молочные продукты', stock: 68, min: 30, unit: 'шт.', icon: '🥛' },
    { id: 3, name: 'Сахар-песок', sku: 'SUG-001', category: 'Бакалея', stock: 21, min: 25, unit: 'кг', icon: '◇' },
    { id: 4, name: 'Стакан бумажный 250 мл', sku: 'CUP-250', category: 'Расходники', stock: 850, min: 300, unit: 'шт.', icon: '▱' },
    { id: 5, name: 'Чай Earl Grey', sku: 'TEA-004', category: 'Напитки', stock: 42, min: 20, unit: 'упак.', icon: '♨' }
  ],
  movements: []
};

export default function handler(request, response) {
  if (request.method === 'GET') return response.status(200).json(state);
  if (request.method === 'PUT') {
    if (!Array.isArray(request.body?.products) || !Array.isArray(request.body?.movements)) {
      return response.status(400).json({ ok: false, error: 'Invalid state' });
    }
    state = request.body;
    return response.status(200).json({ ok: true });
  }
  response.setHeader('Allow', 'GET, PUT');
  return response.status(405).json({ ok: false, error: 'Method not allowed' });
}
