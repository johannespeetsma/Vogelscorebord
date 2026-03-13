export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { user_id, year = '2026' } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Geen user_id' });

  const sessionCookie = 'sessionid=r39oo7t53bcizqmolb5g5mw3mx00vtpi';
  const url = `https://waarneming.nl/users/${user_id}/species/?period=year&species_group_id=1&filter_year=${year}`;

  const response = await fetch(url, {
    headers: {
      'Cookie': sessionCookie,
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html',
    }
  });

  const html = await response.text();
  
  // Zoek alle getallen na "soort" in de tekst
  const matches = [...html.matchAll(/(\d+)\s*soort/gi)];
  const counts = matches.map(m => parseInt(m[1]));
  
  // Zoek ook links naar soorten
  const speciesLinks = new Set(html.match(/\/species\/\d+\//g) || []);

  return res.status(200).json({ 
    counts_found: counts,
    species_links: speciesLinks.size,
    html_around_soort: (html.match(/.{50}soort.{50}/gi) || []).slice(0, 5)
