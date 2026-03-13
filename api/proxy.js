module.exports = async function handler(req, res) {
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

  // Tel tabelrijen maar trek navigatie-rijen eraf
  const tableRows = (html.match(/<tr>/g) || []).length;
  
  // Zoek de tabel met soorten - rijen met species links
  const speciesRows = (html.match(/\/species\/\d+/g) || []);
  const uniqueSpecies = new Set(speciesRows).size;

  // Zoek ook naar het getal direct in de paginatitel of header
  const titleMatch = html.match(/(\d+)\s*soort(?:en)?\s*gezien/i) ||
                     html.match(/Totaal[^\d]*(\d+)/i) ||
                     html.match(/<h[1-4][^>]*>.*?(\d+).*?<\/h[1-4]>/i);

  return res.status(200).json({ 
    species_count: uniqueSpecies || tableRows,
    unique_species: uniqueSpecies,
    table_rows: tableRows,
    title_match: titleMatch ? titleMatch[1] : null
  });
}
