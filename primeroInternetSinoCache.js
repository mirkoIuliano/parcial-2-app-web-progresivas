console.log('service worker funciona')

// primero creamos un cache cuando sw se isntala y a ese cache le agregamos todos los archivos para que funcione nuestra app sin internet
self.addEventListener('install', evento =>{
    const cache = caches.open('mi-cache-5') // cuando se instala sw se crea mi-cache-5 que guardo en la const 'cache'
    .then( cache =>{
        return cache.addAll([
            '/',
            'index.html',
            'main.js',
            'primeroInternetSinoCache.js',
            'manifest.json',
            'imagenes/error.jpg',
            'imagenes/icono.png',
            'imagenes/logo.png',
            'imagenes/portadaDePrueba.jpg',
            'estilos/estilo.css',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
        ])
    })
    evento.waitUntil(cache) // con esto esperamos hasta que la promesa se resuleva porque sino puede generar errores en otro de los pasos
})

/* Segundo momento del ciclo de vida: Cuando el SW está activado */
self.addEventListener('activate', (evento) =>{
    console.log('SW activado')
})


self.addEventListener('fetch', evento => {
    const respuesta = fetch(evento.request).then( respuestaInternet => {
        return caches.open( 'mi-cache-5' ).then( cache => {
            cache.put( evento.request, respuestaInternet.clone() );
            return respuestaInternet;
        })
    }).catch ( error => {
        return caches.match( evento.request )
    })
    evento.respondWith(respuesta)
})