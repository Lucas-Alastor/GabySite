import { db, isFirebaseConfigured } from "./firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const fallbackHomeContent = {
  brandName: 'Kawaii Assets',
  heroEyebrow: '✿ Roblox • Blender • Kawaii Assets',
  heroTitle: 'Game-ready assets crafted to enhance your experiences',
  heroHighlight: 'with creativity',
  heroDescription: 'Portfolio focused on creating Roblox assets using Blender, including hair, plushies, accessories, and custom items with a clean and polished style.',
  primaryButtonText: '♡ dm me',
  primaryButtonUrl: 'https://discordapp.com/users/779361077308817429',
  secondaryButtonText: 'View Assets',
  profileName: '♡ Gaby',
  profileRole: '3D Roblox Asset Creator',
  profileButtonText: '♡ dm me',
  profileButtonUrl: 'https://discordapp.com/users/779361077308817429',
  profileImageUrl: 'images/profile.png'
};

const fallbackAssetData = {
  hairs: [
    ['Soft Brown Straight Hair', 'Long brown hair with soft bangs and a smooth, polished finish.', 'Hair', 'Kawaii', 'images/hair.png'],
    ['Pastel Hair Color Pack', 'Collection of hairs in various colors for cute and stylish avatars.', 'Hair', 'Pack', 'images/hairs.png'],
    ['Pink Shadow Twin Tails', 'Black twin-tail hairstyle with pink highlights, bow details, and a soft gothic-kawaii style.', 'Hair', 'Kawaii', 'images/newhair.png']
  ],
  accessories: [
    ['Bunny Accessory', 'Accessory with bunny ears and a pink bow.', 'Accessory', 'Bunny', 'images/accessorie.png'],
    ['Animal Hood Set', 'Collection of cute hoods with themes of rabbit, bear and kitten.', 'Accessory', 'Set', 'images/headclothing.png'],
    ['Cow Plush Hood', 'Cow hood with rounded shape and super cute appearance.', 'Accessory', 'Cow', 'images/headcow.png'],
    ['Piggy Plush Hood', 'Piggy hood with soft details and pastel style.', 'Accessory', 'Piggy', 'images/headpig.png'],
    ['White Cat Hair Plushie', 'Small white kitten for decorating hair.', 'Accessory', 'Plushie', 'images/haircatwhite.png'],
    ['Black Cat Hair Plushie', 'Small black kitten with pink details for hair.', 'Accessory', 'Kawaii', 'images/haircatblack.png']
  ],
  plushies: [
    ['Black Cat Plush Companion', 'Mini cat plush with an adorable expression.', 'Plushie', 'Cat', 'images/haircatblack.png'],
    ['White Cat Plush Companion', 'Mini cat plush with a cute expression.', 'Plushie', 'Cat', 'images/haircatwhite.png'],
    ['Pig & Cow Hair Plushies', 'Hair accessories with mini plushies of a pig and a cow.', 'Plushie', 'Pack', 'images/hairaccessories2.png'],
    ['Penguin & Frog Hair Plushies', 'Hair accessories with mini plushies of a penguin and a frog.', 'Plushie', 'Cute', 'images/hairaccessories.png'],
    ['Chick Flower Plush Duo', 'A cute duo of chick plushies with soft flower details and a sweet pastel style.', 'Plushie', 'Duo', 'images/chicks.png'],
    ['Chick Couple Plush Duo', 'A charming pair of chick plushies with bow and top hat details for a soft kawaii look.', 'Plushie', 'Couple', 'images/cutelittlechicks.png']
  ],
  others: [
    ['Sweet Bunny & Bear Containers', 'Decorative containers with bunny and bear themes, featuring bows and a translucent finish.', 'Clothing', 'Kawaii', 'images/other2.png'],
    ['Kawaii Bunny Outfit Set', 'Rosy set with bunny theme, including ribbons.', 'Clothing', 'Kawaii', 'images/other.png'],
    ['Red Kitty Outfit Set', 'White and red outfit set with kitty-inspired details, bows, and a stylish kawaii look.', 'Clothing', 'Kitty', 'images/clothing.png'],
    ['Blue Puppy Outfit Set', 'Soft blue outfit set inspired by Cinnamoroll.', 'Clothing', 'Pastel', 'images/clothinginuse2.png'],
    ['Red Kitty Accessory Set', 'A coordinated red and white kitty-themed set with headband, top, skirt, and bow details.', 'Clothing', 'Set', 'images/clothinginuse.png']
  ]
};

const imageGradients = [
  'linear-gradient(135deg, #ffd1e4, #cdb4ff)',
  'linear-gradient(135deg, #ffc2dc, #fff1a8)',
  'linear-gradient(135deg, #ffb3d1, #bde0fe)',
  'linear-gradient(135deg, #ffe5ec, #ffc2d1)',
  'linear-gradient(135deg, #fbcfe8, #ddd6fe)',
  'linear-gradient(135deg, #ffd6ff, #c8b6ff)'
];

const assetData = createEmptyAssetData();
const grids = document.querySelectorAll('[data-grid]');
const links = document.querySelectorAll('[data-section-link]');
const sections = document.querySelectorAll('[data-section]');
const themeToggle = document.getElementById('themeToggle');
const rainLayer = document.getElementById('rainLayer');
const carouselImageCache = new Map();

function createEmptyAssetData() {
  return {
    hairs: [],
    accessories: [],
    plushies: [],
    others: []
  };
}

function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function safeUrl(value, fallback = '#') {
  const url = String(value || '').trim();

  if (!url) return fallback;

  try {
    const parsedUrl = new URL(url, window.location.href);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    return allowedProtocols.includes(parsedUrl.protocol) ? parsedUrl.href : fallback;
  } catch {
    return fallback;
  }
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setLink(selector, text, url) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.textContent = text;
  element.href = url;
}

function applyHomeContent(content = {}) {
  const home = { ...fallbackHomeContent, ...content };

  setText('[data-home="brandName"]', safeText(home.brandName, fallbackHomeContent.brandName));
  setText('[data-home="heroEyebrow"]', safeText(home.heroEyebrow, fallbackHomeContent.heroEyebrow));
  setText('[data-home="heroTitle"]', safeText(home.heroTitle, fallbackHomeContent.heroTitle));
  setText('[data-home="heroHighlight"]', safeText(home.heroHighlight, fallbackHomeContent.heroHighlight));
  setText('[data-home="heroDescription"]', safeText(home.heroDescription, fallbackHomeContent.heroDescription));
  setText('[data-home="profileName"]', safeText(home.profileName, fallbackHomeContent.profileName));
  setText('[data-home="profileRole"]', safeText(home.profileRole, fallbackHomeContent.profileRole));

  const primaryUrl = safeUrl(home.primaryButtonUrl, fallbackHomeContent.primaryButtonUrl);
  const profileButtonUrl = safeUrl(home.profileButtonUrl, home.primaryButtonUrl || fallbackHomeContent.profileButtonUrl);

  setLink('[data-home="primaryButton"]', safeText(home.primaryButtonText, fallbackHomeContent.primaryButtonText), primaryUrl);
  setLink('[data-home="profileButton"]', safeText(home.profileButtonText, fallbackHomeContent.profileButtonText), profileButtonUrl);
  setText('[data-home="secondaryButton"]', safeText(home.secondaryButtonText, fallbackHomeContent.secondaryButtonText));

  const profileImage = document.querySelector('[data-home="profileImage"]');
  if (profileImage) {
    profileImage.src = safeUrl(home.profileImageUrl, fallbackHomeContent.profileImageUrl);
    profileImage.alt = `Foto de perfil de ${safeText(home.profileName, 'Gaby')}`;
  }
}

async function loadHomeContent() {
  applyHomeContent(fallbackHomeContent);

  if (!isFirebaseConfigured) return;

  try {
    const snapshot = await getDoc(doc(db, 'siteContent', 'home'));

    if (snapshot.exists()) {
      applyHomeContent(snapshot.data());
    }
  } catch (error) {
    console.error('Could not load home content. Using fallback home content.', error);
  }
}

function normalizeAsset(asset) {
  const imageUrls = Array.isArray(asset.imageUrls) && asset.imageUrls.length
    ? asset.imageUrls
    : [asset.imageUrl || asset.image || ''].filter(Boolean);

  return {
    title: asset.title || '',
    description: asset.description || '',
    category: asset.category || 'others',
    tagOne: asset.tagOne || '',
    tagTwo: asset.tagTwo || '',
    imageUrl: imageUrls[0] || '',
    imageUrls
  };
}

function insertAsset(asset) {
  const normalizedAsset = normalizeAsset(asset);

  if (!assetData[normalizedAsset.category]) {
    assetData.others.push(normalizedAsset);
    return;
  }

  assetData[normalizedAsset.category].push(normalizedAsset);
}

function insertFallbackAssets() {
  Object.entries(fallbackAssetData).forEach(([category, assets]) => {
    assets.forEach(([title, description, tagOne, tagTwo, imageUrl]) => {
      insertAsset({ category, title, description, tagOne, tagTwo, imageUrl, imageUrls: [imageUrl] });
    });
  });
}

function getTimestampValue(timestamp) {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
  if (typeof timestamp.seconds === 'number') return timestamp.seconds * 1000;
  return Number(timestamp) || 0;
}

function getAssetOrder(asset, fallbackIndex = 0) {
  if (typeof asset.sortOrder === 'number') return asset.sortOrder;
  const createdAtValue = getTimestampValue(asset.createdAt);
  return createdAtValue ? -createdAtValue : fallbackIndex;
}

async function loadAssetsFromFirebase() {
  const snapshot = await getDocs(collection(db, 'assets'));
  const assets = [];

  snapshot.forEach((documentSnapshot) => {
    assets.push(documentSnapshot.data());
  });

  assets
    .sort((a, b) => getAssetOrder(a) - getAssetOrder(b))
    .forEach((asset) => insertAsset(asset));
}

async function loadAssets() {
  try {
    if (isFirebaseConfigured) {
      await loadAssetsFromFirebase();
    }

    const hasRemoteAssets = Object.values(assetData).some((items) => items.length > 0);

    if (!hasRemoteAssets) {
      insertFallbackAssets();
    }
  } catch (error) {
    console.error('Could not load Firebase assets. Using local fallback assets.', error);
    insertFallbackAssets();
  }

  renderAssets();
}

function renderAssets() {
  grids.forEach((grid) => {
    const key = grid.dataset.grid;
    const assets = assetData[key] || [];

    if (!assets.length) {
      grid.innerHTML = '<p class="empty-tip">No assets registered here yet.</p>';
      return;
    }

    grid.innerHTML = assets.map((item, index) => {
      const title = escapeHTML(item.title);
      const description = escapeHTML(item.description);
      const tagOne = escapeHTML(item.tagOne);
      const tagTwo = escapeHTML(item.tagTwo);
      const imageUrls = Array.isArray(item.imageUrls) && item.imageUrls.length ? item.imageUrls : [item.imageUrl];
      const safeImageUrls = imageUrls.map((imageUrl) => escapeHTML(imageUrl)).filter(Boolean);
      const hasMultipleImages = safeImageUrls.length > 1;
      const dots = safeImageUrls.map((_, dotIndex) => {
        return `<button class="carousel-dot ${dotIndex === 0 ? 'active' : ''}" data-dot="${dotIndex}" aria-label="Show image ${dotIndex + 1}"></button>`;
      }).join('');

      return `
        <article class="asset-card">
          <div
            class="asset-image asset-carousel"
            style="background: ${imageGradients[index % imageGradients.length]}"
            data-current-image="0"
          >
            <img
              src="${safeImageUrls[0]}"
              alt="${title}"
              loading="lazy"
              data-images='${JSON.stringify(safeImageUrls)}'
            />

            ${hasMultipleImages ? `
              <button class="carousel-btn carousel-btn-prev" type="button" aria-label="Previous image">‹</button>
              <button class="carousel-btn carousel-btn-next" type="button" aria-label="Next image">›</button>
              <div class="carousel-dots">${dots}</div>
            ` : ''}
          </div>

          <div class="asset-info">
            <h3>${title}</h3>
            <p>${description}</p>
            <div class="tag-row">
              ${tagOne ? `<span class="tag">${tagOne}</span>` : ''}
              ${tagTwo ? `<span class="tag">${tagTwo}</span>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');

    setupAssetCarousels(grid);
  });

  document.querySelectorAll('.asset-count').forEach((el) => {
    const section = el.closest('[data-section]').dataset.section;
    const total = assetData[section]?.length || 0;
    el.textContent = `${total} ${total === 1 ? 'card' : 'cards'}`;
  });
}

function preloadCarouselImages(images = []) {
  images.forEach((src) => {
    if (!src || carouselImageCache.has(src)) return;

    const preloadedImage = new Image();
    preloadedImage.decoding = 'async';
    preloadedImage.src = src;
    carouselImageCache.set(src, preloadedImage);
  });
}

function updateCarouselImage(carousel, newIndex) {
  const image = carousel.querySelector('img');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const images = JSON.parse(image.dataset.images || '[]');

  if (!images.length) return;

  const safeIndex = (newIndex + images.length) % images.length;

  carousel.dataset.currentImage = safeIndex;
  image.src = images[safeIndex];

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === safeIndex);
  });
}

function setupAssetCarousels(root = document) {
  root.querySelectorAll('.asset-carousel').forEach((carousel) => {
    const image = carousel.querySelector('img');
    const images = JSON.parse(image.dataset.images || '[]');

    if (images.length <= 1 || carousel.dataset.carouselReady === 'true') return;

    carousel.dataset.carouselReady = 'true';
    preloadCarouselImages(images);

    const prevButton = carousel.querySelector('.carousel-btn-prev');
    const nextButton = carousel.querySelector('.carousel-btn-next');
    const dots = carousel.querySelectorAll('.carousel-dot');

    prevButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const currentIndex = Number(carousel.dataset.currentImage);
      updateCarouselImage(carousel, currentIndex - 1);
    });

    nextButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const currentIndex = Number(carousel.dataset.currentImage);
      updateCarouselImage(carousel, currentIndex + 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', (event) => {
        event.stopPropagation();
        updateCarouselImage(carousel, Number(dot.dataset.dot));
      });
    });
  });
}

function showSection(sectionName) {
  sections.forEach((section) => {
    section.classList.toggle('active', section.dataset.section === sectionName);
  });

  links.forEach((link) => {
    link.classList.toggle('active', link.dataset.sectionLink === sectionName);
  });

  if (location.hash !== `#${sectionName}`) {
    history.replaceState(null, '', `#${sectionName}`);
  }
}

function setupNavigation() {
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showSection(link.dataset.sectionLink);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const initialSection = location.hash.replace('#', '') || 'home';
  if (document.querySelector(`[data-section="${initialSection}"]`)) {
    showSection(initialSection);
  }
}

function setupTheme() {
  const savedTheme = localStorage.getItem('kawaii-theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀';
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀' : '☾';
    localStorage.setItem('kawaii-theme', isDark ? 'dark' : 'light');
  });
}

function setupParticles() {
  const particleCount = window.matchMedia('(max-width: 640px)').matches ? 18 : 34;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('span');
    const isHeart = i % 2 === 0;
    particle.className = `particle ${isHeart ? 'heart' : 'flower'}`;
    particle.style.setProperty('--x', `${Math.random() * 100}%`);
    particle.style.setProperty('--size', `${Math.random() * 15 + 12}px`);
    particle.style.setProperty('--duration', `${Math.random() * 8 + 9}s`);
    particle.style.setProperty('--delay', `${Math.random() * -14}s`);
    particle.style.setProperty('--drift', `${Math.random() * 120 - 60}px`);
    particle.style.setProperty('--opacity', `${Math.random() * 0.34 + 0.18}`);
    rainLayer.appendChild(particle);
  }
}

setupNavigation();
setupTheme();
setupParticles();
loadHomeContent();
loadAssets();
