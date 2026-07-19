const list = document.querySelector('#products');
const message = document.querySelector('#message');

async function loadProducts() {
  const response = await fetch('/api/products');
  const payload = await response.json();
  list.innerHTML = payload.data.map((product) => `<li><strong>${product.name}</strong> — ${product.category} — $${product.price.toFixed(2)}</li>`).join('');
}

document.querySelector('#refresh').addEventListener('click', loadProducts);
document.querySelector('#product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: form.get('name'), category: form.get('category'), price: form.get('price') })
  });
  const payload = await response.json().catch(() => ({}));
  message.textContent = response.ok ? `Created ${payload.name}` : payload.detail || 'Request failed';
  if (response.ok) {
    event.currentTarget.reset();
    await loadProducts();
  }
});

loadProducts().catch((error) => { message.textContent = error.message; });
