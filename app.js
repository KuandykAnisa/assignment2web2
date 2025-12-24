const btn = document.getElementById('getUser');
const status = document.getElementById('status');
const result = document.getElementById('result');

function showStatus(text) {
  status.textContent = text;
}

function clearResult() {
  result.innerHTML = '';
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function render(data) {
  clearResult();
  if (!data) return;

  const user = data.user || {};
  const country = data.country || {};
  const exchange = data.exchange || {};
  const news = data.news || [];

  const card = el('div', 'card');
  const img = el('img', 'avatar');
  img.src = user.picture || '';
  img.alt = `${user.firstName} ${user.lastName}`;
  card.appendChild(img);

  const info = el('div', 'info');
  info.appendChild(el('h2', '', `${user.firstName || ''} ${user.lastName || ''}`));
  info.appendChild(el('p', '', `<strong>Gender:</strong> ${user.gender || ''}`));
  info.appendChild(el('p', '', `<strong>Age:</strong> ${user.age || ''}`));
  info.appendChild(el('p', '', `<strong>DOB:</strong> ${new Date(user.dateOfBirth).toLocaleDateString() || ''}`));
  info.appendChild(el('p', '', `<strong>City:</strong> ${user.city || ''}`));
  info.appendChild(el('p', '', `<strong>Country:</strong> ${user.country || ''}`));
  info.appendChild(el('p', '', `<strong>Address:</strong> ${user.fullAddress || ''}`));
  card.appendChild(info);
  result.appendChild(card);

  const countryCard = el('div', 'card');
  countryCard.appendChild(el('h3', '', 'Country Info'));
  if (country.flag) countryCard.appendChild(el('img', 'flag', ''));
  if (country.flag) countryCard.querySelector('.flag').src = country.flag;
  countryCard.appendChild(el('p', '', `<strong>Country:</strong> ${country.name || ''}`));
  countryCard.appendChild(el('p', '', `<strong>Capital:</strong> ${country.capital || ''}`));
  countryCard.appendChild(el('p', '', `<strong>Languages:</strong> ${country.languages || ''}`));
  countryCard.appendChild(el('p', '', `<strong>Currency:</strong> ${country.currency || ''}`));
  if (exchange) {
    const r = el('p', '', `<strong>Exchange:</strong> 1 ${country.currencyCode || ''} = ${exchange.USD || 'N/A'} USD, ${exchange.KZT || 'N/A'} KZT`);
    countryCard.appendChild(r);
  }
  result.appendChild(countryCard);

  const newsCard = el('div', 'card');
  newsCard.appendChild(el('h3', '', 'News'));
  if (news.length === 0) newsCard.appendChild(el('p', '', 'No news available (or API key missing).'));
  news.forEach(n => {
    const it = el('div', 'news-item');
    if (n.image) {
      const ni = el('img', 'news-img');
      ni.src = n.image;
      it.appendChild(ni);
    }
    it.appendChild(el('a', '', `<strong>${n.title}</strong>`));
    it.querySelector('a').href = n.url;
    it.querySelector('a').target = '_blank';
    it.appendChild(el('p', '', n.description));
    newsCard.appendChild(it);
  });
  result.appendChild(newsCard);
}

btn.addEventListener('click', async () => {
  showStatus('Loading...');
  try {
    const res = await fetch('/api/random-user');
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    render(data);
    showStatus('Loaded');
  } catch (err) {
    showStatus('Error fetching data');
    console.error(err);
  }
});
