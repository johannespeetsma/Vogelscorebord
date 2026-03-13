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

  // Tel unieke soorten
  const speciesIds = (html.match(/\/species\/\d+/g) || []);
  const uniqueSpecies = new Set(speciesIds).size;

  // Haal zeldzame soorten op
  const rarityLabel = { 4: 'Zeer zeldzaam', 3: 'Zeldzaam', 2: 'Vrij algemeen', 1: 'Algemeen' };
  const rarityColor = { 4: '#e53935', 3: '#f9a825', 2: '#1e88e5', 1: '#43a047' };
  const rarityMap = { 'rare-4': 4, 'rare-3': 3, 'rare-2': 2, 'rare-1': 1 };

  const species = [];
  const rowRegex = /<tr>([\s\S]*?)<\/tr>/g;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const row = match[1];
    const nameMatch = row.match(/class="species-common-name"[^>]*>([\s\S]*?)<\/a>/);
    const rarityMatch = row.match(/fa-triangle (rare-\d)/);
    if (nameMatch && rarityMatch) {
      const name = nameMatch[1].replace(/<[^>]+>/g, '').trim();
      const rarityLevel = rarityMap[rarityMatch[1]] || 0;
      if (name && rarityLevel >= 2) {
        species.push({ name, rarity: rarityLevel, label: rarityLabel[rarityLevel], color: rarityColor[rarityLevel] });
      }
    }
  }

  species.sort((a, b) => b.rarity - a.rarity);
  const top3 =
