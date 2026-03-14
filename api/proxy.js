module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { user_id = '360639', year = '2026' } = req.query;

  const url = `https://waarneming.nl/users/${user_id}/species/?period=life&species_group_id=1&filter_year=${year}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'text/html',
    }
  });

  const status = response.status;
  const html = await response.text();
  return res.status(200).json({ status, preview: html.substring(0, 500) });
}
