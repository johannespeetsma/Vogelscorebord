export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { user_id, year = '2026' } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Geen user_id opgegeven' });
  }

  const sessionCookie = 'sessionid=r39oo7t53bcizqmolb5g5mw3mx00vtpi';
  const url = `https://waarneming.nl/users/${user_id}/species/?period=year&species_group_id=1&filter_year=${year}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Cookie': sessionCookie,
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; vogelswachtenniet.nl)',
        'Referer': 'https://waarneming.nl/',
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: `HTTP ${response.status}` });
    }

    const html = await response.text();

    // Zoek het aantal soorten in de HTML
    // De pagina toont bijv. "123 soorten" of een tabel met soorten
    // Probeer het totaal te vinden
    const match = html.match(/(\d+)\s*soort(?:en)?/i) ||
                  html.match(/<span[^>]*class="[^"]*count[^"]*"[^>]*>(\d+)<\/span>/i) ||
                  html.match(/Totaal[^<]*<[^>]+>(\d+)/i);

    if (match) {
      return res.status(200).json({ species_count: parseInt(match[1]) });
    }

    // Tabel tellen als fallback: tel het aantal rijen in de soortenlijst
    const rows = (html.match(/<tr[^>]*class="[^"]*species[^"]*"/gi) || []).length ||
                 (html.match(/\/species\/\d+\//g) || new Set(html.match(/\/species\/\d+\//g) || [])).size;

    if (rows > 0) {
      return res.status(200).json({ species_count: rows });
    }

    // Debug: stuur een stukje HTML terug
    return res.status(200).json({ 
      error: 'Kon aantal niet vinden', 
      html_preview: html.substring(0, 500) 
    });

  } catch (e) {
    return res.status(500).json({ error: 'Serverfout', detail: e.message });
  }
}
