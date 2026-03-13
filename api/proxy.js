module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { user_id, year = '2026' } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Geen user_id' });

  const url = `https://waarneming.nl/users/${user_id}/species/?period=life&species_group_id=1&filter_year=${year}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html',
    }
  });

  const html = await response.text();
  const speciesRows = (html.match(/\/species\/\d+/g) || []);
  const uniqueSpecies = new Set(speciesRows).size;

  return res.status(200).json({ species_count: uniqueSpecies });
}
