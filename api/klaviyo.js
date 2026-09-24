// Alta en Klaviyo desde los formularios de la web.
//
// Por qué existe esto y no se llama a Klaviyo desde el navegador: la API pública de cliente
// (/client/subscriptions/ y /client/profiles/) contesta 202 y luego no crea nada en esta cuenta.
// La API de servidor sí es fiable, pero necesita una clave privada, que no puede vivir en el
// navegador. De ahí esta función.
//
// Necesita una variable de entorno en Vercel: KLAVIYO_PRIVATE_KEY (clave privada pk_…).

const REVISION = '2024-10-15';
const LIST = 'V93kUA'; // Preview List — leads web policia.academy

const call = (path, body, key) =>
  fetch('https://a.klaviyo.com' + path, {
    method: 'POST',
    headers: {
      Authorization: 'Klaviyo-API-Key ' + key,
      'content-type': 'application/json',
      accept: 'application/json',
      revision: REVISION,
    },
    body: JSON.stringify(body),
  });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const key = process.env.KLAVIYO_PRIVATE_KEY;
  if (!key) return res.status(500).json({ error: 'falta KLAVIYO_PRIVATE_KEY' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'correo no válido' });

  const name = String(body.name || '').trim().slice(0, 80);
  const origen = String(body.origen || '').slice(0, 80);
  const pagina = String(body.pagina || '').slice(0, 120);
  let tel = String(body.phone || '').replace(/[^\d+]/g, '');
  if (tel && tel[0] !== '+') tel = '+34' + tel.replace(/^0+/, '');
  const telOk = /^\+\d{9,15}$/.test(tel);

  const attrs = { email, properties: { origen_web: origen, pagina } };
  if (name) attrs.first_name = name;
  if (tel) attrs.properties.telefono = tel;
  if (telOk) attrs.phone_number = tel;

  // De dónde es. Vercel resuelve la geolocalización por IP en el borde y la pasa en cabeceras, así que
  // no hay que preguntarle nada al visitante ni cargar ningún rastreador. La ciudad viene percent-encoded
  // («Alcal%C3%A1%20de%20Henares»). Klaviyo pinta esto en la columna «Ubicación» del perfil.
  const h = (n) => { const v = req.headers[n]; return v ? String(Array.isArray(v) ? v[0] : v) : ''; };
  const dec = (v) => { try { return decodeURIComponent(v); } catch (_) { return v; } };
  const loc = {};
  if (h('x-vercel-ip-city')) loc.city = dec(h('x-vercel-ip-city'));
  if (h('x-vercel-ip-country-region')) loc.region = dec(h('x-vercel-ip-country-region'));
  if (h('x-vercel-ip-country')) loc.country = h('x-vercel-ip-country');
  if (h('x-vercel-ip-timezone')) loc.timezone = h('x-vercel-ip-timezone');
  const ip = h('x-forwarded-for').split(',')[0].trim();
  if (ip) loc.ip = ip;
  if (Object.keys(loc).length) attrs.location = loc;

  // Y de dónde llega: buscador, redes, campaña o entrada directa. Se manda desde el navegador porque el
  // servidor solo ve su propia página, no la anterior.
  const ref = String(body.referrer || '').slice(0, 300);
  attrs.properties.procedencia = ref ? (() => { try { return new URL(ref).hostname.replace(/^www\./, ''); } catch (_) { return ref; } })() : 'directo';
  if (ref) attrs.properties.referencia_completa = ref;
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
    const v = body[k]; if (v) attrs.properties[k] = String(v).slice(0, 120);
  });

  try {
    // 1) El perfil, con correo y teléfono. Se reintenta sin teléfono si Klaviyo no acepta el formato,
    //    porque perder el alta entera por un número mal escrito sería absurdo: queda en «telefono».
    let r = await call('/api/profile-import/', { data: { type: 'profile', attributes: attrs } }, key);
    if (!r.ok && telOk) {
      const sinTel = { ...attrs }; delete sinTel.phone_number;
      r = await call('/api/profile-import/', { data: { type: 'profile', attributes: sinTel } }, key);
    }
    if (!r.ok) return res.status(502).json({ error: 'perfil', detalle: (await r.text()).slice(0, 300) });

    // 2) La suscripción a la lista, con el consentimiento explícito que dio en el formulario.
    const sub = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          custom_source: 'Web policia.academy · ' + (origen || 'formulario'),
          profiles: { data: [{ type: 'profile', attributes: { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } } }] },
        },
        relationships: { list: { data: { type: 'list', id: LIST } } },
      },
    };
    const s = await call('/api/profile-subscription-bulk-create-jobs/', sub, key);
    if (!s.ok) return res.status(502).json({ error: 'suscripción', detalle: (await s.text()).slice(0, 300) });

    return res.status(200).json({ ok: true, telefono: telOk });
  } catch (e) {
    return res.status(502).json({ error: 'klaviyo', detalle: String(e).slice(0, 200) });
  }
};
