/**
 * /sitemap.xsl — the stylesheet /sitemap.xml points at, so the raw XML renders
 * as a readable, branded page in a browser while staying a valid sitemap for
 * crawlers.
 *
 * Served from a route handler rather than public/ on purpose: vercel.json sets
 * `X-Content-Type-Options: nosniff` on every path, and a static .xsl file is
 * served with a generic content type that the browser would then refuse to
 * apply. Emitting `text/xsl` explicitly is what makes the transform run.
 */
export const dynamic = 'force-static'

// XSLT 1.0 — that is all any browser's built-in transformer supports.
const STYLESHEET = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:rihla="https://rihla-global.com/ns/sitemap">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:key name="by-group" match="sm:url" use="rihla:group"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>XML Sitemap — Rihla Global</title>
        <style>
          :root {
            --navy-900: #0F1D3D;
            --navy-800: #17295A;
            --green-600: #1F7A46;
            --green-500: #2FA35E;
            --ink: #101828;
            --muted: #5b6478;
            --line: #e4e7ef;
            --bg: #F6F7FB;
            --card: #ffffff;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --ink: #e9edf7;
              --muted: #99a3ba;
              --line: #24304f;
              --bg: #0b1327;
              --card: #101c36;
            }
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: var(--bg);
            color: var(--ink);
            font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px 64px; }
          header {
            background: linear-gradient(135deg, var(--navy-900), var(--navy-800));
            color: #fff;
            padding: 40px 0 46px;
            margin-bottom: 28px;
          }
          header .wrap { padding-bottom: 0; }
          .brand {
            display: inline-flex; align-items: center; gap: 9px;
            font-weight: 700; letter-spacing: .02em; font-size: 14px;
            text-transform: uppercase; color: var(--green-500);
          }
          .brand span.dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: var(--green-500); display: inline-block;
          }
          h1 { margin: 12px 0 6px; font-size: 30px; line-height: 1.2; font-weight: 700; }
          .sub { margin: 0; color: rgba(255,255,255,.72); font-size: 15px; }
          .count {
            display: inline-block; margin-top: 18px; padding: 6px 13px;
            border: 1px solid rgba(255,255,255,.22); border-radius: 999px;
            font-size: 13px; color: rgba(255,255,255,.9);
          }
          .note {
            background: var(--card); border: 1px solid var(--line);
            border-left: 3px solid var(--green-500);
            border-radius: 8px; padding: 13px 16px; margin-bottom: 30px;
            color: var(--muted); font-size: 14px;
          }
          h2 {
            font-size: 13px; text-transform: uppercase; letter-spacing: .07em;
            color: var(--muted); margin: 32px 0 10px; font-weight: 700;
          }
          .card {
            background: var(--card); border: 1px solid var(--line);
            border-radius: 10px; overflow-x: auto;
          }
          table { width: 100%; border-collapse: collapse; min-width: 640px; }
          th {
            text-align: left; font-size: 12px; text-transform: uppercase;
            letter-spacing: .05em; color: var(--muted); font-weight: 600;
            padding: 12px 16px; border-bottom: 1px solid var(--line); white-space: nowrap;
          }
          td { padding: 12px 16px; border-bottom: 1px solid var(--line); vertical-align: middle; }
          tr:last-child td { border-bottom: 0; }
          tr:hover td { background: rgba(47,163,94,.05); }
          .title { font-weight: 600; display: block; }
          a { color: var(--green-600); text-decoration: none; word-break: break-all; font-size: 13px; }
          a:hover { text-decoration: underline; }
          @media (prefers-color-scheme: dark) { a { color: var(--green-500); } }
          .meta { color: var(--muted); font-size: 13px; white-space: nowrap; }
          .bar { width: 74px; height: 6px; border-radius: 999px; background: var(--line); overflow: hidden; }
          .bar > i { display: block; height: 100%; background: var(--green-500); }
          .prio { display: flex; align-items: center; gap: 9px; }
          footer {
            margin-top: 38px; padding-top: 18px; border-top: 1px solid var(--line);
            color: var(--muted); font-size: 13px;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="wrap">
            <div class="brand"><span class="dot"></span>Rihla Global</div>
            <h1>XML Sitemap</h1>
            <p class="sub">Every public page on this site, listed for search engines.</p>
            <div class="count">
              <xsl:value-of select="count(sm:urlset/sm:url)"/> URLs
            </div>
          </div>
        </header>

        <div class="wrap">
          <div class="note">
            This file is meant for search engines such as Google and Bing. The styling
            you see is applied by a stylesheet — crawlers read the underlying XML.
          </div>

          <xsl:for-each select="sm:urlset/sm:url[generate-id() = generate-id(key('by-group', rihla:group)[1])]">
            <xsl:variable name="group" select="rihla:group"/>
            <h2><xsl:value-of select="$group"/></h2>
            <div class="card">
              <table>
                <tr>
                  <th>Page</th>
                  <th>Last modified</th>
                  <th>Frequency</th>
                  <th>Priority</th>
                </tr>
                <xsl:for-each select="key('by-group', $group)">
                  <tr>
                    <td>
                      <span class="title"><xsl:value-of select="rihla:title"/></span>
                      <a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a>
                    </td>
                    <td class="meta"><xsl:value-of select="substring(sm:lastmod, 1, 10)"/></td>
                    <td class="meta"><xsl:value-of select="sm:changefreq"/></td>
                    <td>
                      <div class="prio">
                        <div class="bar">
                          <i style="width: {round(sm:priority * 100)}%"></i>
                        </div>
                        <span class="meta"><xsl:value-of select="sm:priority"/></span>
                      </div>
                    </td>
                  </tr>
                </xsl:for-each>
              </table>
            </div>
          </xsl:for-each>

          <footer>
            Generated by Rihla Global &#8212;
            <a href="https://rihla-global.com">rihla-global.com</a>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`

export function GET() {
  return new Response(STYLESHEET, {
    headers: {
      'Content-Type': 'text/xsl; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Robots-Tag': 'noindex',
    },
  })
}
