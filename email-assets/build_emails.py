#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_emails.py — Genera los 7 correos de bienvenida de Policía Academy en HTML,
listos para pegar en Klaviyo (bloque de Texto en modo </> Source code).

Cada correo se pega ENTERO. Personalización de nombre con la sintaxis de Klaviyo:
{% if first_name %} {{ first_name }}{% endif %}. La etiqueta {% unsubscribe %}
es obligatoria (va en el pie).

Marca policía: fondo #0A1A38 · oro #FDB813 · tarjetas #12244A · texto #9FB0CE.
Remitente sugerido: Pierre · hola@policia.academy (Reply-to el mismo, nada de no-reply).
"""
import os, html

BG      = "#0A1A38"
CARD    = "#12244A"
BORDER  = "rgba(255,255,255,.09)"
GOLD    = "#FDB813"
HEAD    = "#F0F4FF"
BODY    = "#9FB0CE"
MUTE    = "#6F82A6"
SANS    = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif"
SITE    = "https://policia.academy"
APP     = "https://alumno.policia.academy"

MEDIA = """<style>
  @media only screen and (max-width:600px){
    .marco{padding:0 !important;} .marca{padding:22px 20px 24px !important;}
    .tarjeta{padding:28px 20px 26px !important;}
    .tarjeta,.caja{border-radius:0 !important;border-left:0 !important;border-right:0 !important;}
    .hueco{padding-top:10px !important;} .suelto{padding-left:20px !important;padding-right:20px !important;}
    .titular{font-size:25px !important;line-height:1.14 !important;} .titulo2{font-size:21px !important;}
    .boton{display:block !important;text-align:center !important;padding:16px 12px !important;}
    .ancho{width:100% !important;max-width:100% !important;}
  }
</style>"""

def eyebrow(t):
    return (f'<p style="margin:0 0 12px;font:700 11px/1 \'JetBrains Mono\',Consolas,monospace;'
            f'letter-spacing:2px;text-transform:uppercase;color:{GOLD};">{t}</p>')

def para(t, color=BODY, size=16, mb=22):
    return (f'<p style="margin:0 0 {mb}px;font:400 {size}px/1.6 {SANS};color:{color};">{t}</p>')

def b(t):
    return f'<b style="color:{HEAD}">{t}</b>'

def button(label, href):
    return (f'<a href="{href}" class="boton" style="display:inline-block;background:{GOLD};'
            f'color:{BG};text-decoration:none;border-radius:999px;padding:16px 28px;'
            f'font:700 15px/1 {SANS};margin:0;">{label}</a>')

def main_card(eb, headline, paras, cta):
    inner = eyebrow(eb) if eb else ""
    inner += (f'<h1 class="titular" style="margin:0 0 18px;font:700 29px/1.15 {SANS};'
              f'color:{HEAD};letter-spacing:-0.8px;">{headline}</h1>')
    inner += "".join(paras)
    inner += cta
    return (f'<tr><td class="tarjeta" style="background:{CARD};border:1px solid {BORDER};'
            f'border-radius:20px;padding:36px 32px 30px;">{inner}</td></tr>')

def second_card(eb, headline, paras):
    inner = eyebrow(eb)
    inner += (f'<h2 class="titulo2" style="margin:0 0 16px;font:700 23px/1.25 {SANS};'
              f'color:{HEAD};letter-spacing:-0.5px;">{headline}</h2>')
    inner += "".join(paras)
    return (f'<tr><td class="hueco" style="padding:14px 0 0;">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
            f'class="caja" style="background:{CARD};border:1px solid {BORDER};border-radius:20px;">'
            f'<tr><td class="tarjeta" style="padding:32px 32px 30px;">{inner}</td></tr></table></td></tr>')

def footer():
    return (f'<tr><td class="suelto" style="padding:30px 4px 0;border-top:1px solid {BORDER};margin-top:8px;">'
            f'<p style="margin:22px 0 14px;font:400 15px/1.6 {SANS};color:{BODY};">Pierre<br>'
            f'<span style="color:{MUTE};">Policía Academy · Respóndeme a este correo si algo no te cuadra, lo leo yo.</span></p>'
            f'<p style="margin:0;font:400 12px/1.6 {SANS};color:{MUTE};">Recibes esto porque pediste el plan de estudio en '
            f'<a href="{SITE}" style="color:{MUTE};text-decoration:underline;">policia.academy</a>. '
            f'<a href="{{% unsubscribe %}}" style="color:{MUTE};text-decoration:underline;">Darme de baja</a>.<br>'
            f'Policía Academy es una preparación independiente y no está afiliada a la Policía Nacional ni al Ministerio del Interior.</p>'
            f'</td></tr>')

def render(email):
    marca = (f'<tr><td class="marca" style="padding:0 0 30px;font:700 20px/1 {SANS};'
             f'color:{HEAD};letter-spacing:-0.4px;">POLICÍA <span style="color:{GOLD};font-style:italic;">Academy</span></td></tr>')
    body = marca + email["main"]
    if email.get("second"):
        body += email["second"]
    body += footer()
    comment = (f'<!--\n  Policía Academy · Correo {email["n"]} de 7 · Día {email["day"]}\n'
               f'  Asunto A · {email["subA"]}\n  Asunto B · {email["subB"]}\n'
               f'  Preencabezado · {email["pre"]}\n'
               f'  De: Pierre · hola@policia.academy  ·  Responder a: el mismo\n'
               f'  Se pega entero en un bloque de Texto en modo </> Source code.\n-->\n')
    return (comment + MEDIA +
            f'\n<div style="background:{BG};margin:0;padding:0;">\n'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{BG};">\n'
            f'<tr><td align="center" class="marco" style="padding:32px 16px;">\n'
            f'<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" class="ancho" style="width:560px;max-width:100%;">\n'
            f'{body}\n</table>\n</td></tr>\n</table>\n</div>\n')

HOLA = "Hola{% if first_name %} {{ first_name }}{% endif %}: "

EMAILS = [
 {"n":1,"day":0,"file":"01-bienvenida.html",
  "subA":"Tu plan de estudio ya está dentro","subB":"El temario de Policía Nacional, gratis y ordenado",
  "pre":"Empieza por aquí. Te cuento en diez segundos qué hacer.",
  "main":main_card("Bienvenida","Tu preparación empieza hoy.",
     [para(HOLA+"acabas de dar el primer paso, y es más importante de lo que parece. Los que aprueban no son los que estudian más un sábado, sino los que estudian "+b("un poco todos los días")+". Vamos a construir eso juntos."),
      eyebrow("Dónde empezar"),
      para(f'<span style="font-family:\'JetBrains Mono\',monospace;color:{HEAD}">alumno.policia.academy &rarr; Estudiar &rarr; Temarios</span>', size=15),
      para("Tienes los "+b("45 temas oficiales")+" de la Escala Básica, gratis y sin tarjeta, organizados en tres niveles: primero lo básico de todos los temas, luego lo importante y por último lo específico.")],
     button("Abrir el temario &rarr;", APP+"/?ref=email1")),
  "second":second_card("¿Por dónde sigo?","Un tema al día. El reto diario cada mañana.",
     [para("No intentes abarcarlo todo. Abre tu tema en curso, léelo y haz su quiz. Y cada mañana, el "+b("reto diario")+": 10 preguntas en 5 minutos. Ese clic diario es lo que de verdad aprueba.", mb=0)])},

 {"n":2,"day":2,"file":"02-metodo.html",
  "subA":"Por qué releer el temario no sirve de nada","subB":"El domingo ya has olvidado casi todo lo del lunes",
  "pre":"No estudias poco. Es que se te cae por el camino.",
  "main":main_card("El método","Releer no es estudiar.",
     [para(HOLA+"en 1885 Hermann Ebbinghaus midió algo incómodo: "+b("olvidamos el 70&nbsp;% de lo nuevo en 48 horas")+" si no lo repasamos. Por eso relees un tema, te suena todo… y en el examen no sale. No es falta de cabeza: es la curva del olvido."),
      para("La solución tiene nombre: "+b("repetición espaciada (SRS)")+". En vez de releerlo todo, el sistema te muestra cada concepto <i>justo antes</i> de que lo olvides. Menos horas, y se queda de verdad."),
      para("En la app son las "+b("flashcards")+": las que fallas vuelven pronto; las que dominas, tardan semanas en reaparecer.")],
     button("Probar las flashcards &rarr;", APP+"/?ref=email2"))},

 {"n":3,"day":4,"file":"03-retos.html",
  "subA":"Para los días en que no da la vida","subB":"5 minutos hoy valen más que 3 horas el domingo",
  "pre":"10 preguntas. El hábito que aprueba.",
  "main":main_card("El hábito","El día que no tienes tiempo de estudiar.",
     [para(HOLA+"habrá días que no puedas sentarte una hora. No pasa nada: para eso está el "+b("reto diario")+". 10 preguntas, 5 minutos, y no rompes la racha."),
      para("Parece poco, pero es justo lo contrario de lo que hace que la gente abandone. El enemigo del opositor no es el temario: es el "+b("día que deja de estudiar")+". El reto diario existe para que ese día no llegue."),
      para("Y no vas solo: hay "+b("liga semanal")+" con otros opositores y ranking en tiempo real. Si aflojas, se nota.")],
     button("Hacer el reto de hoy &rarr;", APP+"/?ref=email3"))},

 {"n":4,"day":6,"file":"04-psicotecnicos.html",
  "subA":"Los psicotécnicos no miden tu inteligencia","subB":"Los psicotécnicos se entrenan, no se aprueban",
  "pre":"Miden cuántas veces has visto ya ese problema.",
  "main":main_card("Psicotécnicos","Los psicotécnicos tienen truco.",
     [para(HOLA+"la primera vez que ves una serie de números o una matriz de figuras, no ves nada. Es normal. Un psicotécnico "+b("no mide lo listo que eres")+": mide cuántas veces has visto antes ese tipo de problema."),
      para("Y eso se entrena. Detrás de cada ejercicio hay "+b("una regla")+", y las reglas son pocas. Cuando las conoces, dejas de pensar y empiezas a reconocer."),
      para("Tienes el módulo de psicotécnicos en la app: aptitud numérica, verbal, espacial, memoria y atención. Primero el "+b("método")+" de cada tipo, luego "+b("tests ilimitados")+", distintos cada vez.")],
     button("Entrenar psicotécnicos &rarr;", APP+"/?ref=email4"))},

 {"n":5,"day":9,"file":"05-tests.html",
  "subA":"Lo que preguntan de verdad","subB":"Miles de preguntas tipo test, solo las que importan",
  "pre":"¿Por dónde aprieta el examen? Por aquí.",
  "main":main_card("Tipo examen","Practica con el formato real.",
     [para(HOLA+"el examen de la Escala Básica es tipo test con "+b("tres opciones")+" y una sola correcta. Cuanto más practiques con ese formato exacto, menos te sorprenderá el día D."),
      para("En la app tienes "+b("miles de preguntas tipo test")+" con explicación en cada una, para que aprendas del fallo. Y el "+b("modo fallos")+": repasa solo lo que has fallado, hasta que deje de caer."),
      para("Aprobar no es saberlo todo: es fallar hoy, entender por qué, y no volver a fallarlo.")],
     button("Empezar un test &rarr;", APP+"/?ref=email5"))},

 {"n":6,"day":12,"file":"06-memoria.html",
  "subA":"Cómo memorizar lo que no se entiende","subB":"Los artículos no se entienden: se memorizan",
  "pre":"Un castillo para acordarte de todo.",
  "main":main_card("Memoria","Hay datos que no se entienden. Se memorizan.",
     [para(HOLA+"parte del temario es pura lógica y se razona. Pero otra parte —artículos, plazos, números de leyes— "+b("no hay nada que entender")+": hay que retenerlo. Y para eso existe una técnica de hace siglos."),
      para("Es la "+b("mnemotecnia")+": conviertes cada número en una palabra y cada palabra en una imagen. «17» &rarr; una teja que cae a las cinco de la tarde: el artículo 17 de la Constitución, la detención. Suena raro, y funciona."),
      para("En la app tienes el "+b("castillo de la memoria")+" y los mapas conceptuales para fijar lo que no se razona.")],
     button("Ver las técnicas &rarr;", APP+"/?ref=email6"))},

 {"n":7,"day":15,"file":"07-premium.html",
  "subA":"Cuando estés listo para ir en serio","subB":"Todo el contenido, sin límites — y el precio Founder",
  "pre":"Sin tope diario, todo abierto. Cancela cuando quieras.",
  "main":main_card("Premium","¿Listo para quitar los límites?",
     [para(HOLA+"si has llegado hasta aquí, ya no estás probando: estás preparando la oposición en serio. Y en algún momento el plan gratuito se te queda corto."),
      para("Con "+b("Premium")+" tienes todo el temario, tests y flashcards "+b("ilimitados")+", sin tope diario, más psicotécnicos y mapas conceptuales completos. Todo el contenido, sin frenos."),
      para("Y mientras queden plazas, el "+b("acceso de por vida Founder")+": un pago único y ya está, para siempre.")],
     button("Ver los planes &rarr;", SITE+"/precios.html?ref=email7")),
  "second":second_card("Sin compromiso","Cancela cuando quieras.",
     [para("Las suscripciones se cancelan en un clic desde los ajustes de tu cuenta. Sin llamadas, sin letra pequeña. Si algo no te encaja, respóndeme a este correo.", mb=0)])},
]

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "html")
    os.makedirs(out, exist_ok=True)
    for e in EMAILS:
        path = os.path.join(out, e["file"])
        with open(path, "w", encoding="utf-8") as f:
            f.write(render(e))
        print("escrito", e["file"])

if __name__ == "__main__":
    main()
