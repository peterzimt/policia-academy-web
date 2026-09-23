# Serie de bienvenida · Policía Academy

**Nombre del flujo en Klaviyo:** `Serie de bienvenida · Policía Academy`
**Disparador:** *Subscribed to list* → Lista `V93kUA` (leads web policia.academy)
**Remitente:** Pierre · `hola@policia.academy` · *Reply-to* el mismo (nada de `no-reply`)
**Cadencia:** días **0, 2, 4, 6, 9, 12, 15**. Apretado al principio (donde está la atención), espaciado al final.

> Cada correo se pega **entero** en un bloque de **Texto → `</>` Source code**.
> Personalización de nombre ya incluida: `{% if first_name %} {{ first_name }}{% endif %}`.
> El pie ya lleva `{% unsubscribe %}` (obligatorio) y el disclaimer legal.

## Los siete

| # | Día | Fichero | Tema | Asunto A | Asunto B | Preencabezado |
|---|-----|---------|------|----------|----------|---------------|
| 1 | 0  | `01-bienvenida.html`   | Bienvenida + temario gratis | Tu plan de estudio ya está dentro | El temario de Policía Nacional, gratis y ordenado | Empieza por aquí. Te cuento en diez segundos qué hacer. |
| 2 | 2  | `02-metodo.html`       | Método SRS / curva del olvido | Por qué releer el temario no sirve de nada | El domingo ya has olvidado casi todo lo del lunes | No estudias poco. Es que se te cae por el camino. |
| 3 | 4  | `03-retos.html`        | Reto diario + liga | Para los días en que no da la vida | 5 minutos hoy valen más que 3 horas el domingo | 10 preguntas. El hábito que aprueba. |
| 4 | 6  | `04-psicotecnicos.html`| Psicotécnicos | Los psicotécnicos no miden tu inteligencia | Los psicotécnicos se entrenan, no se aprueban | Miden cuántas veces has visto ya ese problema. |
| 5 | 9  | `05-tests.html`        | Tests tipo examen | Lo que preguntan de verdad | Miles de preguntas tipo test, solo las que importan | ¿Por dónde aprieta el examen? Por aquí. |
| 6 | 12 | `06-memoria.html`      | Técnicas de memoria | Cómo memorizar lo que no se entiende | Los artículos no se entienden: se memorizan | Un castillo para acordarte de todo. |
| 7 | 15 | `07-premium.html`      | Premium / Founder (conversión) | Cuando estés listo para ir en serio | Todo el contenido, sin límites — y el precio Founder | Sin tope diario, todo abierto. Cancela cuando quieras. |

## A/B de asuntos
En cada correo del flujo → **Create A/B test** → variar solo el asunto (A vs B), 50/50, y que decida por **clics**, no por aperturas (desde iOS 15 las aperturas están infladas por Apple Mail Privacy).

## Antes de activar (Live)
- **Verificar el dominio de envío** `policia.academy` en Klaviyo (Settings → Domains) para poder enviar desde `hola@policia.academy`. Sin esto no envía.
- **Texto plano**: Klaviyo lo autogenera; revisa 3-4 líneas a mano por correo (los filtros antispam lo miran).
- **Sustituir** cualquier flujo de bienvenida por defecto que estuviera activo, para no duplicar.
- El correo 7 (Premium) puede condicionarse a que el lead ya haya empezado a estudiar, para no vender a quien no ha probado.

## Regenerar los HTML
`python3 build_emails.py` → reescribe `html/*.html`. Edita el contenido en `build_emails.py`, no en los HTML.
