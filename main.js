/* el if lo hacemos para poder ver si nuestro navegador soporta sw. ('serviceWorker' in navigator) va a dar true si nuestro navegador soporta sw */
if ('serviceWorker' in navigator){
    /* esto sirve para registrar el archivo de service worker. Esto va a crear un archivo JS */
    navigator.serviceWorker.register('primeroInternetSinoCache.js')
} else {
    alert("Tu navegador no soporta service worker")
}


/* Selecciono los elementos */
const inputPelicula = document.querySelector('#peliculaBuscada');
const botonBuscar = document.querySelector('#botonBuscar');
const contenedorResultados = document.querySelector('#contenedorResultados');
const apiKey ='8d5f610f';
const contenedorFavoritos = document.querySelector('#articuloContenedorFavoritos');

console.log(inputPelicula);
console.log(botonBuscar);
console.log(contenedorResultados);



/* Función para cargar favoritos desde localStorage */
const cargarFavoritos = () => {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    /* en LocalStorage los datos están guardados en cadenas de texto. Con JSON.parse convertimos esta cadena en un objeto
    localStorage.getItem('favoritos') -> buscamos en el localstorage con el método getItem la cadena de texto almacenada bajo la clave 'favoritos'
    si no encuentra nada entonces va a devolver un array vacío */
    return favoritos;
};


/* Función para guardar en localStorage la lista de películas favoritas */
const guardarFavoritos = (favoritos) => {
    /* favoritos es un array (lista) de películas favoritas */
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    /* con JSON.stringify convertimos esta lista en una cadena de texto JSON
    localStorage.setItem('favoritos' -> con setItem guardamos en localStorage esta cadena de texto JSON bajo el nombre 'favoritos'*/
};


/* Función para que se actualice el contenedor de la lista de películas favoritas */
const actualizarInterfazFavoritos = () => {
    const favoritos = cargarFavoritos(); // guardamos en la const favoritos el array con todas las películas favoritas guardadas en el localStorage

    const contenedorFavoritos = document.querySelector('.favoritos'); // guardo en la const el contenedor de cada película guardada en la lista de favoritos

    contenedorFavoritos.innerHTML = ''; // borramos el contenedor con la lista de favoritos cada vez que vamos actualizarlo para que no se pisen los datos

    favoritos.forEach((pelicula, index) => {
        contenedorFavoritos.innerHTML += `
            <div class="contenedorPeliculaFavorita">
                <h3>${pelicula.Title}</h3>
                <div class="contenedorBotonesFavorito">
                    <button class="btn btn-outline-info detalleBtn">Detalles</button>
                    <button class="btn btn-outline-danger eliminarBtn">Eliminar</button>
                </div>
            </div>
        `;

        //al boton para ver detalles le agrego un evento 'click' que active la función verDetalles
        const botonDetalle = document.querySelectorAll('.detalleBtn')
        botonDetalle.forEach((boton, id) => {
            boton.addEventListener('click', () => 
                verDetalles(id)
            )
        })

        //al boton para eliminar de favoritos le agrego un evento 'click' que active la función eliminarFavorito
        const botonEliminar = document.querySelectorAll('.eliminarBtn')
        botonEliminar.forEach((boton, id) => {
            boton.addEventListener('click', () => 
                eliminarFavorito(id)
            )
        })

    });
};


/* Función para agregar la película buscada en la lista de películas favoritas */
const agregarAFavoritos = (pelicula) => { 
    console.log(pelicula)
    const favoritos = cargarFavoritos(); // guardamos en la const favoritos el array con todas las películas favoritas guardadas en el localStorage
    console.log(favoritos)

    // validamos de que la película no se encuentre ya agregada en la lista de películas favoritas para no repetirla
    let peliculaExiste = false;
    for (let i = 0; i < favoritos.length; i++) {
        if (favoritos[i].imdbID === pelicula.imdbID) { // imdbID es un atributo que viene en el json de la película desde la API. Lo usamos como un identificador único
            peliculaExiste = true;
        }
    }
    if (peliculaExiste) {
        alert("No se puede agregar dos veces la misma película en tus favoritos");
    } else {
        favoritos.push(pelicula); // al array favoritos le agregamos la película que nos llegó como parámetro 
        guardarFavoritos(favoritos); // guardamos el array favoritos con las películas anteriores y la nueva película en el localStorage
        actualizarInterfazFavoritos(); // llamamos a la función para actualizar el contenedor de favoritos y que se muestre la última versión actualizada
    }
};


/* Función para eliminar una película específica de la lista de películas favoritas */
const eliminarFavorito = (index) => { // como argumento va a recibir la posición que tiene la película en el array de películas favoritos
    const favoritos = cargarFavoritos(); // guardamos en la const favoritos el array con todas las películas favoritas guardadas en el localStorage
    favoritos.splice(index, 1); // con el método splice elimino la película del array favoritos
    guardarFavoritos(favoritos); // guardamos el array favoritos sin la película eliminada en localStorage
    actualizarInterfazFavoritos(); // llamamos a la función para actualizar el contenedor de favoritos y que se muestre la última versión actualizada
};


/* Función para ver detalles de las películas que están en la lista de películas favoritas */
const verDetalles = (index) => { // como argumento va a recibir la posición que tiene la película en el array de películas favoritos
    const favoritos = cargarFavoritos(); // guardamos en la const favoritos el array con todas las películas favoritas guardadas en el localStorage
    const pelicula = favoritos[index]; // guardamos en la const pelicula la película que queremos ver los detalles
    contenedorResultados.innerHTML = `
        <h2 class="fw-semibold">${pelicula.Title}</h2>
        <figure class="contenedorPortadaPeliculaBuscada">
            <img src="${pelicula.Poster}" alt="Portada de ${pelicula.Title}">
        </figure>
        <h3 class="h4 fw-normal">Director: ${pelicula.Director}</h3>
        <p class="fs-6">Género: ${pelicula.Genre}</p>
        <p class="fs-6">Fecha de lanzamiento: ${pelicula.Released}</p>
        <p class="fs-6">Duración: ${pelicula.Runtime}</p>
        <p class="fs-6">Puntaje en Metascore: ${pelicula.Metascore}</p>
    `;
};



/* Creo una función para buscar la película solicitada de la API */
const buscarPelicula = async () => {
    const tituloPelicula = inputPelicula.value;
    console.log(tituloPelicula);

    /* Primero validamos que el usuario haya puesto alguna palabra o letra y si no lo hizo le pedimos que antes de realizar la búsqueda escriba algo */
    if (tituloPelicula == '') {
        alert('Primero debe ingresar el nombre de alguna palícula antes de realizar la búsqueda');
        return;
    }

    /* Creo una constante con la url de la api, que use tanto la apiKey para estar autorizado y el titulo de la película que se ingresó */
    const apiUrl = `https://www.omdbapi.com/?apikey=${apiKey}&t=${tituloPelicula}`;

    /* Utilizamos un try para verificar que no hayan ocurrido errores en el proceso */
    try {
        const response = await fetch(apiUrl); /* await indica que tiene que esperar a que se realice el fetch() antes de seguir. fetch() lo que hace es realizar una solicitud HTTP GET al servidor. Acá estamos haciendo que la const response sea igual a la respuesta entera del servidor */
        console.log(response); /* Este console.log lo hago para poder ver los atributos del objeto que recibo del fetch */
        
        if (response.ok == false) { /* Si la respuesta de la solicitud fue exitosa la propiedad ok va a ser true y si algo falló va a ser false */
            throw new Error('Ocurrió un error inesperado al obtener los datos de la película');
            /* Si ocurre el error va a ir directo al catch */
        }
        
        /* Creamos una variable que contenga el json de la constante response ya que es dentro de este json que vamos a tener todos los datos de la película que necesitamos */
        const data = await response.json(); /* el .json() convierte al response en un formato json */
        console.log(data) /* Este console.log lo hago para poder ver los atributos del json */
        
        if (data.Response == 'False') { /* Entre los atributos de data se encuentra 'Response', que en el caso de no encontrarse la película será 'False' (no es un booleano, es un string) */
            throw new Error('La película que solicitó no ha sido encontrada en nuestra colección');
            /* Si ocurre el error va a ir directo al catch */
        }
        
        /* Si no hay ningún error entonces enviamos el json a la función mostrarPelicula */
        mostrarPelicula(data);

    } catch (error) {
        console.error(error);
        mostrarError(error);
    }

    /* Esto es para que cada vez que se haga una búsqueda se borre la búsqueda anterior del input y se pueda realizar otra sin necesidad de borrar lo que previamente buscamos */
    inputPelicula.value = '';
};


/* Añadimos un addEventListener a nuestro botón, para que cuando ocurra el evento 'click' se realice la función buscarPelicula */
botonBuscar.addEventListener('click', buscarPelicula);


/* Esta función va a imprimir el resultado de la búsqueda y los detalles pertinentes */
const mostrarPelicula = (pelicula) => {
contenedorResultados.innerHTML = `
    <h2 class="fw-semibold">${pelicula.Title}</h2>
    <figure class="contenedorPortadaPeliculaBuscada">
        <img src="${pelicula.Poster}" alt="Portada de ${pelicula.Title}">
    </figure>
    <h3 class="h4 fw-normal">Director: ${pelicula.Director}</h3>
    <p class="fs-6 mb-1">Género: ${pelicula.Genre}</p>
    <p class="fs-6">Fecha de lanzamiento: ${pelicula.Released}</p>
    <button id="agregarAFavoritosBtn" class="btn btn-outline-success favoritosBtn">Agregar a favoritos</button>
`;

/* Añadimos un addEventListener a nuestro botón de agregar a favoritos, para que cuando ocurra el evento 'click' se realice la función agregarAFavoritos */
document.getElementById('agregarAFavoritosBtn').addEventListener('click', () => {
    agregarAFavoritos(pelicula);
});
};


/* Función para mostrar mensaje de error en pantalla */
const mostrarError = (mensaje) => {
contenedorResultados.innerHTML = `
    <div class="alert alert-warning" role="alert">
        ${mensaje}
    </div>
    `;
};


/* Lo primero que hacemos al ingresar a la página es actaulizar el contenedor de favoritos para que si hay en localStorage se impriman de una */
actualizarInterfazFavoritos();


/* Estos dos eventos sirven para mostrar o no si estamos en modo offline */
window.addEventListener('offline', () => {
    document.getElementById('offline').style.display = 'block';
});

window.addEventListener('online', () => {
    document.getElementById('offline').style.display = 'none';
});