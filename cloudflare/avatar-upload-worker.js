const MAX_UPLOAD_BYTES = 256 * 1024;

const parseAllowedOrigins = (rawValue = '') => String(rawValue)
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

const pickAllowedOrigin = (origin, allowedOrigins) => {
  if (!origin) return allowedOrigins[0] || '*';
  if (!allowedOrigins.length) return origin;
  return allowedOrigins.includes(origin) ? origin : '';
};

const buildCorsHeaders = (origin, allowedOrigin) => ({
  'Access-Control-Allow-Origin': allowedOrigin || '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
});

const json = (body, { status = 200, headers = {} } = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    ...headers
  }
});

const sanitizeSegment = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9-_]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const dataUrlToBytes = (dataUrl) => {
  const match = String(dataUrl || '').match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Formato de imagem inválido.');
  }

  const [, mimeType, base64] = match;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return {
    mimeType,
    bytes
  };
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = pickAllowedOrigin(origin, parseAllowedOrigins(env.ALLOWED_ORIGINS || ''));
    const corsHeaders = buildCorsHeaders(origin, allowedOrigin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
    }

    if (origin && !allowedOrigin) {
      return json({ error: 'Origin não permitida.' }, { status: 403, headers: corsHeaders });
    }

    try {
      const payload = await request.json();
      const { userId, userName, imageDataUrl, fileName } = payload || {};

      if (!userId || !imageDataUrl) {
        return json({ error: 'userId e imageDataUrl são obrigatórios.' }, { status: 400, headers: corsHeaders });
      }

      const { mimeType, bytes } = dataUrlToBytes(imageDataUrl);
      if (!['image/webp', 'image/png', 'image/jpeg'].includes(mimeType)) {
        return json({ error: 'Tipo de imagem não suportado.' }, { status: 415, headers: corsHeaders });
      }

      if (bytes.byteLength > MAX_UPLOAD_BYTES) {
        return json({ error: 'Imagem grande demais para upload.' }, { status: 413, headers: corsHeaders });
      }

      const safeUserId = sanitizeSegment(userId);
      const safeUserName = sanitizeSegment(userName || 'avatar');
      const safeFileName = sanitizeSegment(fileName || 'avatar') || 'avatar';
      const key = `avatars/${safeUserId}/${Date.now()}-${safeUserName || safeFileName}.webp`;

      await env.AVATARS_BUCKET.put(key, bytes, {
        httpMetadata: {
          contentType: 'image/webp'
        }
      });

      const publicBaseUrl = String(env.PUBLIC_AVATAR_BASE_URL || '').replace(/\/$/, '');
      const avatarUrl = publicBaseUrl ? `${publicBaseUrl}/${key}` : '';

      return json({
        ok: true,
        key,
        avatarUrl
      }, { headers: corsHeaders });
    } catch (error) {
      return json({
        error: error.message || 'Falha ao processar avatar.'
      }, { status: 500, headers: corsHeaders });
    }
  }
};
