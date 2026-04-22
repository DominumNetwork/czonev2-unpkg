const links = [
  { label: 'Movies', href: '#movies', desc: 'Browse movie list' },
  { label: 'TV Shows', href: '#tv-shows', desc: 'Browse TV catalog' },
  { label: 'Anime', href: '#anime', desc: 'Anime section' },
  { label: 'Manga', href: '#manga', desc: 'Manga section' },
  { label: 'Games', href: '#games', desc: 'Games hub' },
  { label: 'Settings', href: '#settings', desc: 'Local preferences' }
];

const status = document.getElementById('status');
const linksEl = document.getElementById('links');

if (status) {
  status.textContent = '✅ Static bundle loaded successfully.';
}

if (linksEl) {
  links.forEach((item) => {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = item.href;
    a.innerHTML = `<strong>${item.label}</strong><div class="muted">${item.desc}</div>`;
    linksEl.appendChild(a);
  });
}
