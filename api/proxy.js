module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { user_id, year = '2026' } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Geen user_id' });

  const url = `https://waarneming.nl/users/${user_id}/species/?period=life&species_group_id=1&filter_year=${year}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'nl-NL,nl;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://waarneming.nl/',
      'Cookie': 'sessionid=r39oo7t53bcizqmolb5g5mw3mx00vtpi',
    }
  });

  const html = await response.text();
  return res.status(200).send(html.substring(0, 3000));
}
