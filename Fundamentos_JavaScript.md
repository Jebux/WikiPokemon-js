# Fundamentos de JavaScript: Del paradigma a la práctica a través de un proyecto de desarrollo web

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Fundamentos de JavaScript](#fundamentos-de-javascript)
3. [Interacción con el Documento (DOM)](#interacción-con-el-documento-dom)
4. [El Reto Práctico: Creando una Wiki Pokémon ⚡](#el-reto-práctico-creando-una-wiki-pokémon-)
5. [Conclusión](#conclusión)

---

## Introducción

JavaScript es el lenguaje de programación que da vida a la web moderna. Mientras que HTML proporciona la estructura de una página web (como los huesos de un cuerpo) y CSS define su apariencia (como la piel y la ropa), JavaScript es el que aporta el comportamiento y la interactividad (como los músculos y el sistema nervioso).

En la tríada del desarrollo web:
- **HTML** (HyperText Markup Language): Define la estructura y el contenido
- **CSS** (Cascading Style Sheets): Controla la presentación y el diseño
- **JavaScript**: Proporciona la funcionalidad e interactividad

JavaScript permite que las páginas web respondan a las acciones del usuario, actualicen contenido dinámicamente, validen formularios, y se comuniquen con servidores para obtener datos en tiempo real. Es el único lenguaje de programación que funciona nativamente en todos los navegadores web, convirtiéndolo en una herramienta esencial para cualquier desarrollador web.

---

## Fundamentos de JavaScript

### Sintaxis y Tipos de Datos

JavaScript utiliza una sintaxis clara y legible. Los elementos básicos incluyen:

#### Variables
Las variables son contenedores que almacenan datos. En JavaScript moderno utilizamos:

```javascript
// let: para variables que pueden cambiar
let nombre = "Pikachu";
let nivel = 25;

// const: para valores constantes
const tipo = "Eléctrico";
const PI = 3.14159;
```

#### Tipos de Datos Primitivos

1. **Números**: Representan valores numéricos
   ```javascript
   let edad = 25;
   let altura = 1.75;
   ```

2. **Strings (Cadenas de texto)**: Texto entre comillas
   ```javascript
   let mensaje = "¡Hola mundo!";
   let nombre = 'JavaScript';
   ```

3. **Booleanos**: Valores de verdadero o falso
   ```javascript
   let esVisible = true;
   let estaCompleto = false;
   ```

#### Estructuras de Datos Básicas

1. **Arrays (Arreglos)**: Listas ordenadas de elementos
   ```javascript
   let pokemonTypes = ["Fuego", "Agua", "Planta"];
   let numeros = [1, 2, 3, 4, 5];
   ```

2. **Objetos**: Colecciones de propiedades clave-valor
   ```javascript
   let pokemon = {
       nombre: "Charizard",
       tipo: "Fuego",
       nivel: 50,
       habilidades: ["Llamarada", "Vuelo"]
   };
   ```

### Lógica y Control de Flujo

#### Condicionales
Permiten tomar decisiones en el código:

```javascript
let nivel = 16;

if (nivel >= 16) {
    console.log("¡Tu Pokémon puede evolucionar!");
} else {
    console.log("Tu Pokémon necesita más experiencia.");
}
```

#### Bucles
Automatizan tareas repetitivas:

```javascript
// Bucle for: cuando conocemos el número de iteraciones
for (let i = 0; i < 5; i++) {
    console.log("Pokémon número: " + (i + 1));
}

// Bucle while: cuando la condición determina las iteraciones
let hp = 100;
while (hp > 0) {
    hp -= 10;
    console.log("HP restante: " + hp);
}
```

### Funciones

Las funciones son bloques de código reutilizable que realizan tareas específicas:

```javascript
// Función básica
function saludar(nombre) {
    return "¡Hola, " + nombre + "!";
}

// Función con múltiples parámetros
function calcularDaño(ataque, defensa) {
    let daño = ataque - defensa;
    return daño > 0 ? daño : 1;
}

// Uso de las funciones
let mensaje = saludar("Entrenador");
let dañoFinal = calcularDaño(80, 60);
```

---

## Consumo de APIs en JavaScript

### ¿Qué es una API?

Una **API (Application Programming Interface)** es un conjunto de reglas y protocolos que permite que diferentes aplicaciones se comuniquen entre sí. En el desarrollo web, las APIs nos permiten obtener datos de servidores externos para enriquecer nuestras aplicaciones.

### Conceptos Clave

#### HTTP y Métodos de Petición
- **GET**: Obtener datos del servidor
- **POST**: Enviar datos al servidor
- **PUT**: Actualizar datos existentes
- **DELETE**: Eliminar datos

#### Formato JSON
JSON (JavaScript Object Notation) es el formato estándar para intercambiar datos:

```javascript
{
    "id": 25,
    "name": "pikachu",
    "types": [
        {
            "type": {
                "name": "electric"
            }
        }
    ]
}
```

### La Fetch API

La **Fetch API** es la forma moderna de realizar peticiones HTTP en JavaScript:

#### Sintaxis Básica
```javascript
fetch(url)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
```

#### Usando Async/Await (Recomendado)
```javascript
async function obtenerDatos() {
    try {
        const response = await fetch('https://api.ejemplo.com/datos');

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
}
```

### Ejemplo Práctico: Consumiendo PokéAPI

#### Paso 1: Obtener Lista de Pokémon
```javascript
async function obtenerListaPokemon() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
        const data = await response.json();

        console.log('Total de Pokémon:', data.count);
        console.log('Lista:', data.results);

        return data.results;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### Paso 2: Obtener Detalles de un Pokémon
```javascript
async function obtenerDetallesPokemon(url) {
    try {
        const response = await fetch(url);
        const pokemon = await response.json();

        return {
            id: pokemon.id,
            nombre: pokemon.name,
            altura: pokemon.height / 10, // Convertir a metros
            peso: pokemon.weight / 10,   // Convertir a kg
            tipos: pokemon.types.map(t => t.type.name),
            imagen: pokemon.sprites.front_default
        };
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        return null;
    }
}
```

#### Paso 3: Procesar Múltiples Pokémon
```javascript
async function procesarPokemon() {
    try {
        // Obtener lista
        const lista = await obtenerListaPokemon();

        // Obtener detalles de cada uno
        const pokemonCompletos = [];

        for (const pokemon of lista) {
            const detalles = await obtenerDetallesPokemon(pokemon.url);
            if (detalles) {
                pokemonCompletos.push(detalles);
            }
        }

        console.log('Pokémon procesados:', pokemonCompletos);
        return pokemonCompletos;
    } catch (error) {
        console.error('Error en procesamiento:', error);
    }
}
```

### Manejo de Estados de Carga

Es importante proporcionar feedback visual al usuario:

```javascript
async function cargarDatosConEstados() {
    // Mostrar indicador de carga
    mostrarCargando(true);

    try {
        const datos = await fetch('https://api.ejemplo.com/datos');
        const resultado = await datos.json();

        // Mostrar datos exitosamente
        mostrarDatos(resultado);

    } catch (error) {
        // Mostrar mensaje de error
        mostrarError('Error al cargar los datos');
    } finally {
        // Ocultar indicador de carga
        mostrarCargando(false);
    }
}

function mostrarCargando(mostrar) {
    const loading = document.getElementById('loading');
    if (mostrar) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}
```

### Mejores Prácticas

#### 1. Siempre Manejar Errores
```javascript
async function peticionSegura(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en petición:', error);
        // Mostrar mensaje amigable al usuario
        mostrarError('No se pudieron cargar los datos');
        return null;
    }
}
```

#### 2. Implementar Cache Simple
```javascript
const cache = new Map();

async function obtenerConCache(url) {
    // Verificar si ya tenemos los datos
    if (cache.has(url)) {
        return cache.get(url);
    }

    // Obtener datos y guardar en cache
    const datos = await fetch(url).then(r => r.json());
    cache.set(url, datos);

    return datos;
}
```

#### 3. Limitar Peticiones Concurrentes
```javascript
async function procesarEnLotes(urls, tamañoLote = 5) {
    const resultados = [];

    for (let i = 0; i < urls.length; i += tamañoLote) {
        const lote = urls.slice(i, i + tamañoLote);

        // Procesar lote en paralelo
        const promesasLote = lote.map(url => fetch(url).then(r => r.json()));
        const resultadosLote = await Promise.all(promesasLote);

        resultados.push(...resultadosLote);

        // Pequeña pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return resultados;
}
```

---

## Interacción con el Documento (DOM)

### ¿Qué es el DOM?

El **Modelo de Objetos del Documento (DOM)** es la representación que hace el navegador de la estructura HTML de una página web. JavaScript puede interactuar con el DOM para:
- Seleccionar elementos HTML
- Modificar contenido y estilos
- Responder a eventos del usuario
- Crear nuevos elementos dinámicamente

### Métodos de Selección

#### getElementById
Selecciona un elemento por su ID único:
```javascript
let titulo = document.getElementById("titulo-principal");
```

#### querySelector
Selecciona el primer elemento que coincida con un selector CSS:
```javascript
let primerBoton = document.querySelector(".boton");
let titulo = document.querySelector("#titulo");
```

#### querySelectorAll
Selecciona todos los elementos que coincidan con un selector:
```javascript
let todosLosBotones = document.querySelectorAll(".boton");
let todasLasImagenes = document.querySelectorAll("img");
```

### Manipulación de Elementos

Una vez seleccionados, podemos modificar los elementos:

```javascript
// Cambiar texto
titulo.textContent = "Nueva Wiki Pokémon";

// Cambiar HTML interno
contenedor.innerHTML = "<p>Contenido nuevo</p>";

// Modificar estilos
elemento.style.color = "red";
elemento.style.display = "none";

// Cambiar atributos
imagen.src = "nueva-imagen.jpg";
enlace.href = "https://nueva-url.com";
```

---

## El Reto Práctico: Creando una Wiki Pokémon ⚡

### Descripción del Proyecto

Vamos a crear una aplicación web interactiva que consuma la **PokéAPI** (https://pokeapi.co/) para mostrar información sobre Pokémon. Este proyecto integrará todos los conceptos aprendidos y nos permitirá crear una experiencia de usuario completa.

### Objetivos del Proyecto

1. **Listar Pokémon**: Obtener y mostrar una lista de Pokémon desde la API
2. **Paginación**: Navegar entre diferentes páginas de resultados
3. **Tabla de datos**: Organizar la información en una tabla HTML
4. **Botón "Ver Detalle"**: Mostrar información detallada de cada Pokémon
5. **Modal de información**: Ventana emergente con detalles completos

### Herramientas Necesarias

- **HTML**: Estructura de la página
- **Tailwind CSS**: Framework de estilos (vía CDN)
- **JavaScript**: Lógica de la aplicación
- **Fetch API**: Para realizar peticiones HTTP
- **PokéAPI**: Fuente de datos de Pokémon

### Desarrollo Paso a Paso

#### Paso 1: Estructura HTML Básica

Crear el archivo `index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wiki Pokémon</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Encabezado -->
        <header class="text-center mb-8">
            <h1 class="text-4xl font-bold text-blue-600 mb-2">Wiki Pokémon ⚡</h1>
            <p class="text-gray-600">Descubre el mundo de los Pokémon</p>
        </header>

        <!-- Controles de paginación -->
        <div class="flex justify-center mb-6 space-x-4">
            <button id="prevBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400">
                Anterior
            </button>
            <span id="pageInfo" class="flex items-center px-4 py-2 bg-white rounded shadow">
                Página 1
            </span>
            <button id="nextBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Siguiente
            </button>
        </div>

        <!-- Tabla de Pokémon -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <table class="w-full">
                <thead class="bg-blue-500 text-white">
                    <tr>
                        <th class="px-6 py-3 text-left">ID</th>
                        <th class="px-6 py-3 text-left">Imagen</th>
                        <th class="px-6 py-3 text-left">Nombre</th>
                        <th class="px-6 py-3 text-left">Tipos</th>
                        <th class="px-6 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody id="pokemonTableBody">
                    <!-- Los datos se cargarán aquí dinámicamente -->
                </tbody>
            </table>
        </div>

        <!-- Loading indicator -->
        <div id="loading" class="text-center py-8 hidden">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p class="mt-2 text-gray-600">Cargando Pokémon...</p>
        </div>
    </div>

    <!-- Modal para detalles del Pokémon -->
    <div id="pokemonModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 id="modalTitle" class="text-2xl font-bold text-blue-600"></h2>
                <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div id="modalContent">
                <!-- El contenido del modal se cargará aquí -->
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

#### Paso 2: JavaScript - Configuración Inicial

Crear el archivo `script.js`:

```javascript
// Configuración global
const API_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_PER_PAGE = 10;

// Variables de estado
let currentPage = 1;
let totalPokemon = 0;
let pokemonList = [];

// Referencias a elementos del DOM
const pokemonTableBody = document.getElementById('pokemonTableBody');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');
const loading = document.getElementById('loading');
const pokemonModal = document.getElementById('pokemonModal');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadPokemonList();
    setupEventListeners();
});
```

#### Paso 3: Funciones para Cargar Datos

```javascript
// Función para cargar la lista de Pokémon
async function loadPokemonList() {
    try {
        showLoading(true);
        
        const offset = (currentPage - 1) * POKEMON_PER_PAGE;
        const response = await fetch(`${API_BASE_URL}/pokemon?limit=${POKEMON_PER_PAGE}&offset=${offset}`);
        const data = await response.json();
        
        totalPokemon = data.count;
        pokemonList = data.results;
        
        await displayPokemonList();
        updatePaginationControls();
        
    } catch (error) {
        console.error('Error al cargar la lista de Pokémon:', error);
        showError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
        showLoading(false);
    }
}

// Función para mostrar la lista de Pokémon en la tabla
async function displayPokemonList() {
    pokemonTableBody.innerHTML = '';
    
    for (let i = 0; i < pokemonList.length; i++) {
        const pokemon = pokemonList[i];
        const pokemonData = await fetchPokemonDetails(pokemon.url);
        
        if (pokemonData) {
            const row = createPokemonRow(pokemonData);
            pokemonTableBody.appendChild(row);
        }
    }
}

// Función para obtener detalles de un Pokémon específico
async function fetchPokemonDetails(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error al obtener detalles del Pokémon:', error);
        return null;
    }
}
```

#### Paso 4: Creación de Elementos de la Tabla

```javascript
// Función para crear una fila de la tabla
function createPokemonRow(pokemon) {
    const row = document.createElement('tr');
    row.className = 'border-b hover:bg-gray-50';
    
    // Obtener tipos del Pokémon
    const types = pokemon.types.map(type => type.type.name).join(', ');
    
    row.innerHTML = `
        <td class="px-6 py-4 font-medium">#${pokemon.id}</td>
        <td class="px-6 py-4">
            <img src="${pokemon.sprites.front_default}" 
                 alt="${pokemon.name}" 
                 class="w-16 h-16 object-contain">
        </td>
        <td class="px-6 py-4 font-medium capitalize">${pokemon.name}</td>
        <td class="px-6 py-4">
            ${createTypesBadges(pokemon.types)}
        </td>
        <td class="px-6 py-4">
            <button onclick="showPokemonDetails(${pokemon.id})" 
                    class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                Ver Detalle
            </button>
        </td>
    `;
    
    return row;
}

// Función para crear badges de tipos
function createTypesBadges(types) {
    return types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        const colorClass = getTypeColor(typeName);
        return `<span class="inline-block px-2 py-1 text-xs rounded-full text-white mr-1 ${colorClass}">
                    ${typeName}
                </span>`;
    }).join('');
}

// Función para obtener colores según el tipo
function getTypeColor(type) {
    const colors = {
        normal: 'bg-gray-400',
        fire: 'bg-red-500',
        water: 'bg-blue-500',
        electric: 'bg-yellow-400',
        grass: 'bg-green-500',
        ice: 'bg-blue-300',
        fighting: 'bg-red-700',
        poison: 'bg-purple-500',
        ground: 'bg-yellow-600',
        flying: 'bg-indigo-400',
        psychic: 'bg-pink-500',
        bug: 'bg-green-400',
        rock: 'bg-yellow-800',
        ghost: 'bg-purple-700',
        dragon: 'bg-indigo-700',
        dark: 'bg-gray-800',
        steel: 'bg-gray-500',
        fairy: 'bg-pink-300'
    };
    return colors[type] || 'bg-gray-400';
}
```

#### Paso 5: Modal de Detalles

```javascript
// Función para mostrar detalles del Pokémon en modal
async function showPokemonDetails(pokemonId) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/pokemon/${pokemonId}`);
        const pokemon = await response.json();
        
        modalTitle.textContent = `#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;
        
        modalContent.innerHTML = `
            <div class="text-center mb-4">
                <img src="${pokemon.sprites.front_default}" 
                     alt="${pokemon.name}" 
                     class="w-32 h-32 mx-auto">
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <h3 class="font-semibold text-gray-700">Altura:</h3>
                    <p>${pokemon.height / 10} m</p>
                </div>
                <div>
                    <h3 class="font-semibold text-gray-700">Peso:</h3>
                    <p>${pokemon.weight / 10} kg</p>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="font-semibold text-gray-700 mb-2">Tipos:</h3>
                ${createTypesBadges(pokemon.types)}
            </div>
            
            <div class="mb-4">
                <h3 class="font-semibold text-gray-700 mb-2">Habilidades:</h3>
                <ul class="list-disc list-inside">
                    ${pokemon.abilities.map(ability => 
                        `<li class="capitalize">${ability.ability.name.replace('-', ' ')}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div>
                <h3 class="font-semibold text-gray-700 mb-2">Estadísticas Base:</h3>
                ${createStatsDisplay(pokemon.stats)}
            </div>
        `;
        
        pokemonModal.classList.remove('hidden');
        pokemonModal.classList.add('flex');
        
    } catch (error) {
        console.error('Error al cargar detalles del Pokémon:', error);
        showError('Error al cargar los detalles del Pokémon.');
    } finally {
        showLoading(false);
    }
}

// Función para crear display de estadísticas
function createStatsDisplay(stats) {
    return stats.map(stat => {
        const statName = stat.stat.name.replace('-', ' ');
        const statValue = stat.base_stat;
        const percentage = Math.min((statValue / 200) * 100, 100);
        
        return `
            <div class="mb-2">
                <div class="flex justify-between text-sm">
                    <span class="capitalize">${statName}</span>
                    <span>${statValue}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}
```

#### Paso 6: Controles de Paginación y Eventos

```javascript
// Función para configurar event listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadPokemonList();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            loadPokemonList();
        }
    });
    
    closeModal.addEventListener('click', () => {
        pokemonModal.classList.add('hidden');
        pokemonModal.classList.remove('flex');
    });
    
    // Cerrar modal al hacer clic fuera de él
    pokemonModal.addEventListener('click', (e) => {
        if (e.target === pokemonModal) {
            pokemonModal.classList.add('hidden');
            pokemonModal.classList.remove('flex');
        }
    });
}

// Función para actualizar controles de paginación
function updatePaginationControls() {
    const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);
    
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    if (prevBtn.disabled) {
        prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    if (nextBtn.disabled) {
        nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Funciones auxiliares
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

function showError(message) {
    alert(message); // En una aplicación real, usaríamos un sistema de notificaciones más elegante
}
```

### Funcionalidades Implementadas

1. **Lista de Pokémon**: Muestra 10 Pokémon por página con imagen, nombre y tipos
2. **Paginación**: Navegación entre páginas con botones anterior/siguiente
3. **Tabla responsiva**: Organización clara de la información
4. **Modal de detalles**: Ventana emergente con información completa del Pokémon
5. **Indicador de carga**: Feedback visual durante las peticiones a la API
6. **Manejo de errores**: Gestión básica de errores de red

---

## Conclusión

A través de este proyecto de Wiki Pokémon, hemos aplicado de manera práctica todos los conceptos fundamentales de JavaScript:

- **Variables y tipos de datos** para almacenar información de los Pokémon
- **Funciones** para organizar y reutilizar código
- **Estructuras de control** para manejar la lógica de paginación y validaciones
- **Manipulación del DOM** para crear interfaces dinámicas
- **APIs y fetch** para obtener datos externos
- **Eventos** para responder a las interacciones del usuario

La programación se aprende practicando, y este proyecto proporciona una base sólida para entender cómo JavaScript puede transformar una página web estática en una aplicación interactiva y funcional. Al completar este ejercicio, habrás adquirido las habilidades esenciales para crear aplicaciones web dinámicas que consuman APIs externas y proporcionen experiencias de usuario ricas e interactivas.

El siguiente paso en tu aprendizaje sería explorar frameworks como React, Vue.js o Angular, que facilitan el desarrollo de aplicaciones más complejas, pero siempre construyendo sobre estos fundamentos sólidos de JavaScript vanilla que acabas de dominar.

---

## 🚀 Taller Avanzado: PokéDex con Filtros Interactivos

### Descripción del Reto

Una vez completado el proyecto básico de Wiki Pokémon, es momento de llevar tus habilidades al siguiente nivel. Este taller avanzado te desafía a crear una versión más sofisticada con una estructura de página profesional y sistema de filtros interactivos.

### 🎯 Objetivos del Taller Avanzado

#### Funcionalidades Requeridas

1. **Estructura de Página Completa**
   - **Header**: Navegación principal con branding
   - **Sidebar**: Panel de filtros y controles
   - **Main Content**: Grid de tarjetas de Pokémon
   - **Footer**: Información adicional y créditos

2. **Sistema de Filtros Interactivos**
   - **Búsqueda por nombre**: Campo de texto con filtrado en tiempo real
   - **Filtro por tipo**: Botones para cada tipo de Pokémon
   - **Filtro por generación**: Dropdown con las 7 generaciones
   - **Ordenamiento**: Por ID, nombre, altura, peso
   - **Limpiar filtros**: Botón para resetear todos los filtros

3. **Experiencia de Usuario Mejorada**
   - **Responsive design**: Adaptable a móviles y desktop
   - **Loading states**: Indicadores visuales de carga
   - **Estados vacíos**: Mensaje cuando no hay resultados
   - **Animaciones**: Transiciones suaves y efectos hover
   - **Feedback visual**: Contadores y estadísticas en tiempo real

### 🎨 Especificaciones de Diseño

#### Paleta de Colores
**Tema libre**: Elige una paleta de colores que refleje tu estilo personal o inspírate en:
- Pokémon Sol y Luna (naranjas, azules, morados)
- Pokémon Espada y Escudo (rojos, azules, dorados)
- Pokémon Escarlata y Púrpura (rojos, morados, naranjas)
- O crea tu propia combinación única

#### Estructura Visual Requerida
```
┌─────────────────────────────────────────┐
│                HEADER                   │
├─────────────┬───────────────────────────┤
│             │                           │
│   SIDEBAR   │       MAIN CONTENT        │
│             │                           │
│  - Búsqueda │   ┌─────┬─────┬─────┐     │
│  - Filtros  │   │ 🔥  │ 💧  │ 🌱  │     │
│  - Orden    │   └─────┴─────┴─────┘     │
│  - Stats    │                           │
│             │   ┌─────┬─────┬─────┐     │
│             │   │ ⚡  │ 🧊  │ 👻  │     │
│             │   └─────┴─────┴─────┘     │
├─────────────┴───────────────────────────┤
│                FOOTER                   │
└─────────────────────────────────────────┘
```

### 📋 Requisitos Técnicos

#### HTML Semántico
```html
<header>
  <!-- Navegación principal -->
</header>

<div class="layout">
  <aside class="sidebar">
    <!-- Filtros y controles -->
  </aside>

  <main class="content">
    <!-- Grid de Pokémon -->
  </main>
</div>

<footer>
  <!-- Información adicional -->
</footer>
```

#### JavaScript Avanzado
- **Gestión de estado**: Variables para filtros activos
- **Funciones de filtrado**: Múltiples criterios simultáneos
- **Optimización**: Cache de datos y lazy loading
- **Event delegation**: Manejo eficiente de eventos
- **Debouncing**: Para búsqueda en tiempo real

#### CSS/Framework
- **Flexbox/Grid**: Para layouts responsivos
- **Tailwind CSS**: Recomendado para estilos rápidos
- **Animaciones CSS**: Transiciones y efectos
- **Media queries**: Responsive design

### 🔧 Funcionalidades Específicas a Implementar

#### 1. Sistema de Búsqueda
```javascript
// Implementar búsqueda con debouncing
function setupSearch() {
    const searchInput = document.getElementById('search');
    let timeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            filterPokemon();
        }, 300);
    });
}
```

#### 2. Filtros por Tipo
```javascript
// Crear botones dinámicos para cada tipo
const pokemonTypes = ['fire', 'water', 'grass', 'electric', ...];

function createTypeFilters() {
    pokemonTypes.forEach(type => {
        const button = createFilterButton(type);
        button.addEventListener('click', () => toggleTypeFilter(type));
    });
}
```

#### 3. Filtro por Generación
```javascript
// Rangos de ID por generación
const generations = {
    1: { start: 1, end: 151, name: 'Kanto' },
    2: { start: 152, end: 251, name: 'Johto' },
    // ... más generaciones
};
```

#### 4. Sistema de Ordenamiento
```javascript
function sortPokemon(criteria) {
    switch(criteria) {
        case 'name':
            return pokemon.sort((a, b) => a.name.localeCompare(b.name));
        case 'id':
            return pokemon.sort((a, b) => a.id - b.id);
        case 'height':
            return pokemon.sort((a, b) => a.height - b.height);
        // ... más criterios
    }
}
```

### 📊 Criterios de Evaluación

#### Funcionalidad (40%)
- ✅ Todos los filtros funcionan correctamente
- ✅ Búsqueda en tiempo real operativa
- ✅ Paginación con filtros aplicados
- ✅ Modal de detalles mejorado
- ✅ Manejo de estados de error

#### Diseño y UX (30%)
- ✅ Estructura de página completa (header, sidebar, footer)
- ✅ Diseño responsive y atractivo
- ✅ Paleta de colores coherente
- ✅ Animaciones y transiciones suaves
- ✅ Feedback visual apropiado

#### Código (20%)
- ✅ JavaScript bien estructurado
- ✅ Funciones modulares y reutilizables
- ✅ Manejo adecuado de APIs
- ✅ Optimización de rendimiento
- ✅ Código comentado y limpio

#### Innovación (10%)
- ✅ Características adicionales creativas
- ✅ Mejoras en la experiencia de usuario
- ✅ Implementación de patrones avanzados
- ✅ Personalización única del diseño

### 🎯 Entregables

1. **Código fuente completo**
   - `index.html` con estructura semántica
   - `script.js` con todas las funcionalidades
   - `styles.css` (si usas CSS personalizado)

2. **Documentación**
   - `README.md` explicando el proyecto
   - Instrucciones de instalación y uso
   - Descripción de funcionalidades implementadas

3. **Demo funcional**
   - Aplicación desplegada y accesible
   - Todas las funcionalidades operativas
   - Responsive en diferentes dispositivos

### 💡 Consejos para el Desarrollo

#### Planificación
1. **Diseña primero**: Crea wireframes de la interfaz
2. **Divide y vencerás**: Implementa una funcionalidad a la vez
3. **Prueba constantemente**: Verifica cada función antes de continuar

#### Desarrollo
1. **Estructura HTML sólida**: Base semántica bien definida
2. **JavaScript modular**: Funciones pequeñas y específicas
3. **CSS organizado**: Clases reutilizables y consistentes

#### Optimización
1. **Cache inteligente**: Evita peticiones innecesarias
2. **Lazy loading**: Carga datos según se necesiten
3. **Debouncing**: Optimiza búsquedas en tiempo real

### 🚀 Extensiones Opcionales (Puntos Extra)

- **Favoritos**: Sistema para guardar Pokémon favoritos
- **Comparación**: Comparar estadísticas entre Pokémon
- **Modo oscuro**: Toggle entre temas claro y oscuro
- **Exportar datos**: Descargar lista filtrada como JSON/CSV
- **Gráficos**: Visualización de estadísticas con charts
- **PWA**: Convertir en Progressive Web App


---

**¡Este taller te permitirá demostrar un dominio avanzado de JavaScript y crear una aplicación web profesional! 🎉**

*Recuerda: La clave está en la planificación, la implementación incremental y la atención al detalle en la experiencia de usuario.*
