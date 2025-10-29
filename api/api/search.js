export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests allowed' });
  }

  const { q, from, to } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Missing search keyword (q)' });
  }

  const encodedQuery = encodeURIComponent(q);
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodedQuery}&limit=20&fields=title,authors,year,abstract,venue,url,externalIds`;

  try {
    const apiResponse = await fetch(url, {
      headers: { 'User-Agent': 'PaperFollow-AI/1.0 (+https://paperfollow.ai)' }
    });

    if (!apiResponse.ok) {
      throw new Error(`Semantic Scholar returned ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    let papers = data.data || [];

    const yearFrom = from ? parseInt(from, 10) : 0;
    const yearTo = to ? parseInt(to, 10) : 3000;
    papers = papers.filter(paper => {
      return paper.year && paper.year >= yearFrom && paper.year <= yearTo;
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.status(200).json({ success: true, papers });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch research papers' });
  }
}
