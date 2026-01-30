const express = require('express');
const router = express.Router();

/**
 * Generate XML sitemap dynamically
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseURL = process.env.SITE_URL || 'https://parsa.dev';
    
    // Define all pages
    const pages = [
      {
        url: '/',
        changefreq: 'weekly',
        priority: 1.0,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        url: '/projects',
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        url: '/skills',
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        url: '/experience',
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        url: '/about',
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString().split('T')[0]
      },
      {
        url: '/contact',
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString().split('T')[0]
      }
    ];

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    pages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseURL}${page.url}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * Generate robots.txt
 */
router.get('/robots.txt', (req, res) => {
  const baseURL = process.env.SITE_URL || 'https://parsa.dev';
  
  const robots = `# Robots.txt for ${baseURL}
# Allow all user agents to crawl and index the site

User-agent: *
Allow: /
Disallow: /admin-parsa-7734
Disallow: /api/
Disallow: /.git/
Disallow: /node_modules/
Disallow: /.env*
Disallow: /uploads/

# Specific crawlers
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

# Block bad bots
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

# Sitemap
Sitemap: ${baseURL}/sitemap.xml

# Crawl delay in seconds (optional)
Crawl-delay: 1

# Request rate (pages per second)
Request-rate: 1/1s
`;

  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = router;
