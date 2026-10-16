# flkochu.github.io

Portafolio de **Adán López Lozano**, estudiante de Ingeniería Mecatrónica y Sistemas Ciberfísicos en la Universidad Iberoamericana.

**Sitio:** https://flkochu.github.io/

La página es un plano de ingeniería: cada proyecto tiene su número (`ALL-01` a `ALL-12`), los filtros son capas con su tipo de línea como en CAD y abajo está el cajetín. Tiene versión en español y en inglés.

## Estructura

```
index.html        la página completa (HTML, CSS, JS y dibujos en SVG generados en el navegador)
proton/           PROTÓN en 3D: sim.js (three.js), proton_arm.glb (piezas CAD del brazo) y página a pantalla completa
media/            foto y video de PROTÓN
atlas/            documentación de Atlas con su gemelo 3D
docs/             documentación de cada proyecto: qué hice, herramientas, arquitectura y estado
assets/img/       pon aquí perfil.jpg (foto vertical 3:4) y aparece sola en "Acerca de mí"
.nojekyll         para que GitHub Pages sirva los archivos tal cual
```

## Publicar

1. Crea un repositorio público llamado exactamente **`flkochu.github.io`**.
2. Sube estos archivos a la raíz.
3. **Settings → Pages → Source:** *Deploy from a branch*, rama `main`, carpeta `/ (root)`.

Tus guías siguen funcionando en sus mismas direcciones (`flkochu.github.io/Guia-...`).

## Editar

Todo lo que cambia seguido está al principio del `<script>` de `index.html`:

| Qué | Dónde |
|---|---|
| Correo, GitHub, LinkedIn | constantes `EMAIL`, `GITHUB`, `LINKEDIN` |
| Fecha de actualización | `UPDATED` (y la fila de revisiones en el pie) |
| Textos de la página en ES/EN | objeto `UI` |
| Proyectos | arreglo `P`: cada uno tiene `es` y `en` con título, resumen, mi parte, estado, contexto, qué hice y siguiente |
| Dibujo de cada proyecto | objeto `DRAW` |

Para enlazar un proyecto directo: `https://flkochu.github.io/#ALL-04` abre la ficha de Atlas.

Para agregar un proyecto nuevo (por ejemplo Roverto cuando esté listo): copia un objeto de `P`, cambia el texto, elige un dibujo de `DRAW` o agrega uno, ponlo en `ORDER` y crea su archivo en `docs/`. Su número sale del orden en que está en `P`, así que agrégalo al final para no mover los demás.

La sección de PROTÓN en 3D carga `proton/sim.js` cuando se acerca a la vista; necesita servirse desde un servidor (GitHub Pages o `python -m http.server`), no abriendo el archivo directo.
