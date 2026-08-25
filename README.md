# ◈ PromptFlow — Premium AI Prompt Library

<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="PromptFlow icon" />
</p>

<p align="center">
  <strong>500+ prompts profesionales × 15 IAs</strong> — ChatGPT · Claude · Gemini · Midjourney · DALL·E 3 · Stable Diffusion · Perplexity · Grok · Copilot · Llama 3 · Mistral · Leonardo · Runway · Flux · DeepSeek<br/>
  Vite + Tailwind · Animaciones · Filtros avanzados · 100% offline-ready
</p>

<p align="center">
  <a href="#-stack"><img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" /></a>
  <a href="#-stack"><img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white" /></a>
  <a href="#-características"><img alt="Prompts" src="https://img.shields.io/badge/Prompts-500+-8b5cf6" /></a>
  <a href="#-modelos-ia-soportados"><img alt="IAs" src="https://img.shields.io/badge/IAs-15-10b981" /></a>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-slate" />
</p>

---

## ✨ Características

- **Librería curada** — 500+ prompts premium en 8 categorías: Marketing, Business, Content, Dev, Design, Education, Personal, Data & Analytics.
- **15+ Modelos IA** — más allá de ChatGPT: Claude, Gemini, Midjourney, DALL·E 3, Stable Diffusion, Perplexity, Grok, Copilot, Llama 3, Mistral, Leonardo AI, Runway, Flux, DeepSeek.
- **Buscador y filtrador pro** — búsqueda instantánea con debounce (título, texto, tags, categoría, modelo), chips de categoría, dropdown multi-IA con iconos, dificultad, tag cloud, filtro solo favoritos, orden (popular / más nuevo / A–Z), contador de resultados y filtros activos con “limpiar”.
- **UX premium** — animaciones de entrada (stagger + IntersectionObserver), blobs degradados, glassmorphism, hover elevados, micro-interacciones, toasts, modal con backdrop blur, copy 1-click, favoritos persistentes (localStorage), export CSV, “Sorpréndeme” aleatorio, atajos (`/` para buscar, `Ctrl+K`, `Esc`).
- **Favicon e icono de pestaña** — `public/favicon.svg` con gradiente PromptFlow visible en la pestaña del navegador.
- **Framework moderno** — Vite 5 + Tailwind CSS 3 + ES Modules. Código modular en `src/`, HMR en desarrollo y build optimizado a `dist/`.
- **Offline-ready & sin tracking** — todo en cliente, sin backend, sin cookies.

---

## 🧱 Stack

| Capa | Tecnología |
|------|------------|
| Build | **Vite 5** (`vite.config.js`) |
| Estilos | **Tailwind CSS 3** + PostCSS + Autoprefixer (`tailwind.config.js`, `src/styles/main.css`) |
| Lenguaje | HTML5 semántico + CSS moderno + JavaScript ES Modules |
| Datos | `src/data/prompts.js` — `PROMPTS`, `AI_MODELS`, `CATEGORIES` |
| Lógica | `src/main.js` — estado, filtrado, render, favoritos, modal, toasts |
| Assets | `public/favicon.svg` |

> Antes: un único `index.html` monolítico + `styles.css`. Ahora: proyecto Vite estructurado, mantenible y escalable.

---

## 📁 Estructura

```
PROMPTFLOW/
├── index.html              # Entry Vite (hero, filtros, grid, modal, footer)
├── public/
│   └── favicon.svg         # Icono de pestaña (gradiente ◈)
├── src/
│   ├── main.js             # App: filtros, búsqueda, favoritos, copy, modal
│   ├── styles/main.css     # Tailwind base + utilidades + animaciones
│   └── data/prompts.js     # 15 IAs + 8 categorías + prompts con tags/popularity
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── dist/                   # Build producción (tras npm run build)
```

---

## 🚀 Inicio rápido

```bash
# 1) Instalar dependencias
npm install

# 2) Desarrollo con HMR
npm run dev
# → http://localhost:5173

# 3) Build producción
npm run build

# 4) Previsualizar build
npm run preview
```

Sin Node también funciona: abre `dist/index.html` tras el build, o sirve la carpeta con cualquier servidor estático.

---

## 🔍 Guía de uso

### Buscar y filtrar
1. **Búsqueda** — escribe en la barra superior (busca en título, texto, tags y modelo). Atajo: pulsa `/` o `Ctrl+K`.
2. **Categoría** — click en chips (Todas + 8 categorías). Se refleja en `#active-filters`.
3. **Modelo IA** — abre el dropdown “Todas las IAs (15)” y elige una (ej. `Midjourney`, `Flux`, `Runway`). Cada modelo muestra icono y vendor.
4. **Dificultad** — Principiante / Intermedio / Avanzado.
5. **Tags** — nube de tags (`#seo`, `#react`, `#midjourney`…). Click para activar/desactivar.
6. **Solo favoritos** — botón `♡ Solo favoritos` (persiste en `localStorage`).
7. **Orden** — Popular (por `popularity`), Más nuevo (por `id`), A–Z.
8. **Filtros activos** — pills con `✕` individual y “Limpiar todo”.

### Acciones
- **Copiar** — botón `▸ Copiar` en cada card o dentro del modal (usa `navigator.clipboard` con fallback).
- **Ver** — abre modal con texto completo, meta, tags y acciones (copiar / favorito / cerrar). Cierra con `Esc` o click fuera.
- **Favorito** — `♡/♥` en card y modal. Contador en nav.
- **Exportar CSV** — exporta los prompts *filtrados* (con tags incluidos).
- **Sorpréndeme** — `🎲 Sorpréndeme` abre un prompt aleatorio.
- **Cargar más** — paginación progresiva (12 por página).

---

## 🤖 Modelos IA soportados

| Modelo | Vendor | Uso típico |
|--------|--------|------------|
| ChatGPT | OpenAI | Copy, código, estrategia |
| Claude | Anthropic | Escritura larga, análisis |
| Gemini | Google | Multimodal, research |
| Midjourney | Midjourney | Imágenes artísticas |
| DALL·E 3 | OpenAI | Imágenes precisas |
| Stable Diffusion | Stability AI | Open-source imágenes |
| Perplexity | Perplexity | Research + citas |
| Grok | xAI | X/Twitter, viral |
| Copilot | Microsoft | Código, docs |
| Llama 3 | Meta | Código, EDA |
| Mistral | Mistral AI | Rápido, EU |
| Leonardo AI | Leonardo | Assets, personajes |
| Runway | Runway | Vídeo generativo |
| Flux | Black Forest Labs | Fotorrealismo |
| DeepSeek | DeepSeek | SQL, razonamiento |

Añadir uno nuevo: edita `AI_MODELS` en `src/data/prompts.js` y úsalo en cualquier prompt (`model: 'Grok'`).

---

## 📂 Categorías (8)

1. **Marketing & Sales** — social, ads, email, launch, SEO
2. **Business & Productivity** — plan de negocio, OKR, pitch, SOP
3. **Content Creation** — blog, YouTube, X threads, newsletter, podcast
4. **Software Development** — React, DB schema, OpenAPI, Docker, testing, a11y
5. **Design & Creativity** — Midjourney/Flux/Leonardo/Runway, paletas, design system
6. **Education & Learning** — lesson plans, quizzes, currículos
7. **Personal Development** — CV ATS, entrevistas STAR, hábitos, negociación
8. **Data & Analytics** — SQL, dashboards, EDA Python

---

## 🎨 Animaciones y calidad visual

- **Hero** con mesh gradient + 3 blobs animados (`@keyframes blob`), patrón sutil y glass pills.
- **Reveal on scroll** — `IntersectionObserver` + stagger por card (`transition-delay: i*40ms`).
- **Cards** — `hover:-translate-y-1`, `hover:border-indigo-300`, `hover:shadow-xl`, badges con color semántico por dificultad.
- **Micro-interacciones** — botones con `active` y `hover`, toasts con auto-dismiss, modal con `backdrop-blur`.
- **Contadores animados** en hero (`data-count`).
- **Shimmer**, **float** y **fade-in/slide-up** definidos en `tailwind.config.js` y `src/styles/main.css`.

---

## ➕ Añadir prompts

Edita `src/data/prompts.js`:

```js
{
  id: 1001,
  title: "Tu título",
  category: "Software Development", // una de CATEGORIES
  model: "ChatGPT",                 // uno de AI_MODELS[].id
  difficulty: "Intermediate",
  tags: ["react","hooks"],
  popularity: 88,                   // 0-100 para ordenar por popular
  text: `Instrucciones con placeholders como [TU_TEMA]...`
}
```

Guarda y Vite recarga al instante.

---

## 🌐 Compatibilidad

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, iOS Safari y Chrome Mobile. Build genera assets con gzip (`≈5 kB CSS`, `≈11 kB JS`).

---

## 🔒 Privacidad

100% cliente. Favoritos en `localStorage` (`pf:favs`). Sin tracking, sin cuenta, sin backend.

---

## 📄 Licencia

MIT — uso personal y comercial. No redistribuyas la librería como producto competidor.

---

## 🔄 Changelog

- **v2.0 (2026)** — Migración a **Vite + Tailwind**, 15 IAs (de 5 → 15), nueva categoría Data & Analytics, buscador con debounce + tag cloud + filtros activos, favoritos, paginación, modal mejorado, animaciones premium, favicon SVG, README reescrito.
- **v1.0** — Single-file `index.html` + `styles.css` con 5 IAs y filtros básicos.

---

<p align="center"><strong>Happy prompting! 🚀✨</strong><br/><em>PromptFlow — Tu gateway a la excelencia con IA.</em></p>
