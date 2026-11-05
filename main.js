const productos = [
  {
    id: 1,
    marca: "Cotopaxi Works",
    nombre: "Hiker Low Páramo",
    categoria: "zapatos",
    precio: 110.0,
    antes: null,
    img: "assets/img/hiker-paramo.jpg",
    ajuste: "contain",
    colores: "Café chocolate",
    etiqueta: "Más vendido",
    tallas: [39, 40, 41, 42, 43, 44],
  },
  {
    id: 2,
    marca: "La Floresta",
    nombre: "Oxford Plataforma Perla",
    categoria: "zapatos",
    precio: 98.0,
    antes: null,
    img: "assets/img/oxford-perla.jpg",
    ajuste: "contain",
    colores: "Negro",
    etiqueta: "Nuevo",
    tallas: [35, 36, 37, 38, 39, 40],
  },
  {
    id: 3,
    marca: "La Ronda",
    nombre: "Botín Charol Ronda",
    categoria: "botas",
    precio: 135.0,
    antes: null,
    img: "assets/img/botin-ronda.jpg",
    colores: "Negro craquelado",
    etiqueta: "Nuevo",
    tallas: [35, 36, 37, 38, 39],
  },
  {
    id: 4,
    marca: "Guápulo",
    nombre: "Bota Western Guápulo",
    categoria: "botas",
    precio: 149.0,
    antes: 179.0,
    img: "assets/img/bota-western.jpg",
    colores: "Café envejecido",
    etiqueta: "Oferta",
    tallas: [36, 37, 38, 39, 40],
  },
  {
    id: 5,
    marca: "Mitad del Mundo",
    nombre: "Sandalia Cuentas Montañita",
    categoria: "sandalias",
    precio: 45.0,
    antes: null,
    img: "assets/img/sandalia-cuentas.jpg",
    colores: "Café",
    etiqueta: "Hecho a mano",
    tallas: [35, 36, 37, 38, 39, 40],
  },
  {
    id: 6,
    marca: "Ruta 593",
    nombre: "Bota Harness Rosa",
    categoria: "botas",
    precio: 165.0,
    antes: null,
    img: "assets/img/bota-harness.jpg",
    colores: "Rosa palo",
    etiqueta: null,
    tallas: [36, 37, 38, 39, 40, 41],
  },
  {
    id: 7,
    marca: "La Ronda",
    nombre: "Bota Slouch Gamuza",
    categoria: "botas",
    precio: 139.0,
    antes: 159.0,
    img: "assets/img/bota-slouch.jpg",
    colores: "Camel",
    etiqueta: "Oferta",
    tallas: [35, 36, 37, 38, 39],
  },
];

const IVA = 0.15;
const ENVIO_GRATIS_DESDE = 75;
const COSTO_ENVIO = 5;

let carrito = cargarCarrito();
let filtroActual = "todos";
const tallaElegida = {};

const $ = (id) => document.getElementById(id);
const $productos = $("productos");
const $lista = $("lista-carrito");
const $panel = $("carrito");
const $overlay = $("overlay");

const formatear = (n) => "$" + n.toFixed(2);
const buscar = (id) => productos.find((p) => p.id === id);
const separarClave = (clave) => {
  const [id, talla] = clave.split("-").map(Number);
  return { id, talla };
};

function guardarCarrito() {
  try {
    localStorage.setItem("qo-carrito", JSON.stringify(carrito));
  } catch (e) {}
}
function cargarCarrito() {
  try {
    return JSON.parse(localStorage.getItem("qo-carrito")) || {};
  } catch (e) {
    return {};
  }
}

function toast(mensaje) {
  const t = $("toast");
  t.textContent = mensaje;
  t.classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("visible"), 1800);
}

function renderProductos() {
  const lista =
    filtroActual === "todos"
      ? productos
      : productos.filter((p) => p.categoria === filtroActual);

  $("cantidad-resultados").textContent = `${lista.length} productos`;

  $productos.innerHTML = lista
    .map(
      (p) => `
    <article class="producto">
      <div class="foto">
        ${p.etiqueta ? `<span class="etiqueta">${p.etiqueta}</span>` : ""}
        <img src="${p.img}" alt="${p.nombre}" loading="lazy" style="object-fit:${p.ajuste || "cover"}">
      </div>
      <div class="info">
        <span class="marca">${p.marca}</span>
        <span class="nombre">${p.nombre}</span>
        <span class="precio">
          ${
            p.antes
              ? `<span class="oferta">${formatear(p.precio)}</span><span class="antes">${formatear(p.antes)}</span>`
              : formatear(p.precio)
          }
        </span>
        <span class="colores">${p.colores}</span>
        <div class="tallas">
          ${p.tallas
            .map(
              (t) => `
            <button class="talla ${tallaElegida[p.id] === t ? "seleccionada" : ""}"
                    data-producto="${p.id}" data-talla="${t}">${t}</button>`,
            )
            .join("")}
        </div>
        <button class="btn-negro" data-agregar="${p.id}">Añadir al carrito</button>
      </div>
    </article>
  `,
    )
    .join("");
}

function renderCarrito() {
  const claves = Object.keys(carrito);

  $lista.innerHTML = claves
    .map((clave) => {
      const { id, talla } = separarClave(clave);
      const p = buscar(id);
      const cant = carrito[clave];
      return `
      <li class="item">
        <div class="mini"><img src="${p.img}" alt="${p.nombre}"></div>
        <div>
          <div class="nombre">${p.nombre}</div>
          <div class="detalle">${p.marca} · ${p.colores} · Talla ${talla}</div>
          <div class="detalle">${formatear(p.precio)} c/u</div>
          <div class="controles">
            <button data-restar="${clave}">−</button>
            <span>${cant}</span>
            <button data-sumar="${clave}">+</button>
            <button class="quitar" data-quitar="${clave}">Quitar</button>
          </div>
        </div>
        <span class="total-item">${formatear(p.precio * cant)}</span>
      </li>`;
    })
    .join("");

  $("carrito-vacio").style.display = claves.length ? "none" : "block";

  const subtotal = claves.reduce(
    (acc, c) => acc + buscar(separarClave(c).id).precio * carrito[c],
    0,
  );
  const envio =
    subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  const iva = subtotal * IVA;
  const total = subtotal + iva + envio;
  const unidades = claves.reduce((acc, c) => acc + carrito[c], 0);

  $("subtotal").textContent = formatear(subtotal);
  $("envio").textContent =
    subtotal === 0 ? "$0.00" : envio === 0 ? "Gratis" : formatear(envio);
  $("iva").textContent = formatear(iva);
  $("total").textContent = formatear(total);
  $("contador").textContent = unidades;

  const falta = ENVIO_GRATIS_DESDE - subtotal;
  const progreso = Math.min(subtotal / ENVIO_GRATIS_DESDE, 1) * 100;
  $("barra-envio").innerHTML = `
    ${
      falta > 0
        ? `Te faltan <strong>${formatear(falta)}</strong> para envío gratis`
        : `<strong>¡Tienes envío gratis!</strong>`
    }
    <div class="pista"><div class="relleno" style="width:${progreso}%"></div></div>`;

  guardarCarrito();
}

function agregar(id) {
  const talla = tallaElegida[id];
  if (!talla) {
    toast("Primero elige una talla");
    return;
  }
  const clave = `${id}-${talla}`;
  carrito[clave] = (carrito[clave] || 0) + 1;
  renderCarrito();
  toast(`${buscar(id).nombre} (talla ${talla}) añadido`);
  const btn = $("btn-carrito");
  btn.classList.remove("pulso");
  void btn.offsetWidth;
  btn.classList.add("pulso");
}

function cambiarCantidad(clave, delta) {
  carrito[clave] += delta;
  if (carrito[clave] <= 0) delete carrito[clave];
  renderCarrito();
}

function abrirCarrito() {
  $panel.classList.add("abierto");
  $overlay.classList.add("abierto");
  $panel.setAttribute("aria-hidden", "false");
}
function cerrarCarrito() {
  $panel.classList.remove("abierto");
  $overlay.classList.remove("abierto");
  $panel.setAttribute("aria-hidden", "true");
}

function aplicarFiltro(filtro) {
  filtroActual = filtro;
  document
    .querySelectorAll(".filtro")
    .forEach((b) => b.classList.toggle("activo", b.dataset.filtro === filtro));
  renderProductos();
}

$productos.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.talla) {
    tallaElegida[b.dataset.producto] = Number(b.dataset.talla);
    renderProductos();
  }
  if (b.dataset.agregar) agregar(Number(b.dataset.agregar));
});

$lista.addEventListener("click", (e) => {
  const { sumar, restar, quitar } = e.target.dataset;
  if (sumar) cambiarCantidad(sumar, 1);
  if (restar) cambiarCantidad(restar, -1);
  if (quitar) {
    delete carrito[quitar];
    renderCarrito();
  }
});

document.querySelectorAll("[data-filtro]").forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    aplicarFiltro(el.dataset.filtro);
  }),
);

$("btn-carrito").addEventListener("click", abrirCarrito);
$("cerrar-carrito").addEventListener("click", cerrarCarrito);
$overlay.addEventListener("click", cerrarCarrito);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarCarrito();
});

$("vaciar").addEventListener("click", () => {
  carrito = {};
  renderCarrito();
});
$("pagar").addEventListener("click", () => {
  if (!Object.keys(carrito).length) return toast("Tu carrito está vacío");
  toast("¡Gracias por tu compra en Quito Outfitters!");
  carrito = {};
  renderCarrito();
  cerrarCarrito();
});

renderProductos();
renderCarrito();
