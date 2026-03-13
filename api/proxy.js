export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { user_id, date_after = '2026-01-01', date_before = '2026-12-31' } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Geen user_id opgegeven' });
  }

  const sessionCookie = 'sessionid=r39oo7t53bcizqmolb5g5mw3mx00vtpi';
  const speciesSet = new Set();
 let url = `https://waarneming.nl/api/v1/observations/?user_id=${user_id}&species_group=1&date_after=${date_after}&date_before=${date_before}&limit=100`;
  let pages = 0;

  try {
    while (url && pages < 100) {
      const response = await fetch(url, {
        headers: {
          'Cookie': sessionCookie,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; vogelswachtenniet.nl)',
          'Referer': 'https://waarneming.nl/',
        }
      });

      if (response.status === 401 || response.status === 403) {
        return res.status(403).json({ error: 'Sessie verlopen', http: response.status });
      }
      if (!response.ok) {
        const text = await response.text();
        return res.status(502).json({ error: `API fout HTTP ${response.status}`, detail: text.substring(0, 300) });
      }

      const data = await response.json();
      if (data.results) {
        for (const obs of data.results) {
          if (obs.species) speciesSet.add(obs.species);
        }
      }
      url = data.next || null;
      pages++;
    }

    return res.status(200).json({ species_count: speciesSet.size });
  } catch (e) {
    return res.status(500).json({ error: 'Serverfout', detail: e.message });
  }
}
