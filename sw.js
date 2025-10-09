// sw.js

const CACHE_NAME = 'controle-de-obra-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/ui.js',
  '/data.js',
  '/ico-192x192.png',
  '/ico-512x512.png'
];

// Evento de instalação: abre o cache e adiciona os arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: responde com os arquivos do cache se estiverem disponíveis
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se a resposta for encontrada no cache, retorna a versão em cache
        if (response) {
          return response;
        }
        // Caso contrário, busca o recurso na rede
        return fetch(event.request);
      })
  );

});
