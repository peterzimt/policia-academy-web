# Policía Academy — Web

Landing y funnel de suscripción para [policia.academy](https://policia.academy).

HTML/CSS/JS estático. **Sin build step**: lo que ves es lo que se sirve.
Hosted en GitHub Pages, gratis.

## Estructura

```
policia-academy-web/
├── index.html              ← landing principal
├── precios.html            ← página de suscripción
├── privacidad.html         ← política de privacidad (RGPD/LOPDGDD)
├── aviso-legal.html        ← LSSI-CE
├── cookies.html            ← política de cookies
├── css/style.css           ← estilos mobile-first
├── js/main.js              ← banner cookies + año dinámico
├── assets/favicon.svg
├── CNAME                   ← dominio custom (policia.academy)
├── .nojekyll               ← evita procesamiento Jekyll en GitHub Pages
├── robots.txt
└── sitemap.xml
```

## Antes de publicar — checklist

### 1. Rellenar datos del titular

En **dos sitios** hay un bloque `⚠️ Rellena estos datos antes de publicar` con `[placeholders]`:

- `privacidad.html` → § 1. Responsable del tratamiento
- `aviso-legal.html` → § 1. Datos del titular

Sustituye **Nombre/Razón social, NIF/CIF, Domicilio** por los datos reales.

### 2. Embeber los formularios Klaviyo

Busca los bloques marcados con `KLAVIYO_FORM_EMBED` en:

- `index.html` (sección "Recibe la guía gratuita")
- `precios.html` (sección "Acceso anticipado")

Sustituye el `<div class="klaviyo-form-placeholder">…</div>` por el snippet que te genera Klaviyo:

```html
<div class="klaviyo-form-XXXXXXXX"></div>
<script async type="text/javascript"
        src="https://static.klaviyo.com/onsite/js/PUBLIC_API_KEY/klaviyo.js"></script>
```

Reemplaza `XXXXXXXX` (Form ID) y `PUBLIC_API_KEY` con tus valores reales (Klaviyo → Sign-up Forms → Embed).

### 3. Imagen Open Graph (compartir en redes)

Crea `assets/og-image.png` (1200×630px) con el logo + tagline. Sin ella, los previews en WhatsApp/Twitter/LinkedIn salen vacíos.

### 4. (Opcional) Analítica

Si añades Google Analytics, Plausible o similar:
1. Añade el script en `<head>` cargado **condicionalmente** según `localStorage.getItem('pa_consent') === 'all'`.
2. Actualiza la lista de cookies en `cookies.html` § 2.2.

## Deploy en GitHub Pages

### Una vez

1. **Crear el repo en GitHub**:
   ```bash
   cd /Users/claragarciavega/Documents/policia-academy-web
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create policia-academy-web --public --source=. --push
   ```
   (Si no tienes `gh`, crea el repo manualmente en github.com y haz `git remote add origin … && git push -u origin main`.)

2. **Activar Pages**:
   - GitHub → Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)**
   - Save

   En 30-60 segundos tendrás el sitio en `https://TUUSER.github.io/policia-academy-web/`.

3. **Conectar el dominio custom**:
   - El archivo `CNAME` ya está creado con `policia.academy`. GitHub lo detecta automáticamente.
   - En GitHub → Settings → Pages → **Custom domain** debería aparecer `policia.academy`. Si no, escríbelo manualmente.
   - Marca ✅ **Enforce HTTPS** una vez Let's Encrypt haya provisionado el certificado (~10 min después).

4. **Configurar DNS en tu registrador** (Cloudflare/Namecheap/etc.). Crea estos records:

   **Si usas el ápex (policia.academy sin www)** — usa records A:
   ```
   A   @   185.199.108.153
   A   @   185.199.109.153
   A   @   185.199.110.153
   A   @   185.199.111.153
   ```

   **Y también para www** — CNAME al subdominio de GitHub:
   ```
   CNAME   www   TUUSER.github.io
   ```

   Tras propagar (5 min - 1 hora), https://policia.academy y https://www.policia.academy responden.

### Cada vez que actualices el sitio

```bash
git add .
git commit -m "Actualiza X"
git push
```

GitHub Pages republica solo en ~30 segundos.

## Testing local

No necesitas instalar nada. Cualquier servidor estático sirve:

```bash
# Python (ya viene en macOS)
cd /Users/claragarciavega/Documents/policia-academy-web
python3 -m http.server 8000
# → http://localhost:8000

# O con Node si lo tienes
npx serve .
```

## Mantenimiento legal

- **Revisar privacidad.html y aviso-legal.html cada 6 meses** y cuando cambien proveedores (Supabase, Klaviyo, etc.).
- **Actualizar la fecha** "Última actualización" cuando cambies algo sustantivo.
- Si llegas a >€100k/año de facturación o tratas datos sensibles, valora **registrar el tratamiento** ante la AEPD y nombrar **DPO**.

## Brand

- Color principal: `#0A1A38` (azul institucional)
- Acento: `#FDB813` (dorado escudo)
- Tipografía: system-ui (sin fuentes externas → más rápido + sin temas RGPD por carga de Google Fonts).
