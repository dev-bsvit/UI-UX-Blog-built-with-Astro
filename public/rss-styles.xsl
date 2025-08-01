<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="uk">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="rss/channel/title"/> - RSS Feed</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
          }
          
          .header h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
          }
          
          .header p {
            color: #666;
            font-size: 1.1em;
            margin-bottom: 20px;
          }
          
          .rss-info {
            background: #f8f9ff;
            border: 2px dashed #667eea;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .rss-info h3 {
            color: #667eea;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          
          .rss-info h3::before {
            content: "📡";
            margin-right: 10px;
            font-size: 1.2em;
          }
          
          .rss-url {
            background: white;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            word-break: break-all;
            border: 1px solid #ddd;
            margin: 10px 0;
          }
          
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          
          .stat-item {
            background: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          }
          
          .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            display: block;
          }
          
          .stat-label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
          }
          
          .articles {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          
          .articles h2 {
            color: #333;
            margin-bottom: 30px;
            font-size: 1.8em;
            display: flex;
            align-items: center;
          }
          
          .articles h2::before {
            content: "📚";
            margin-right: 15px;
            font-size: 1.2em;
          }
          
          .article {
            border-bottom: 1px solid #eee;
            padding: 25px 0;
            transition: all 0.3s ease;
          }
          
          .article:last-child {
            border-bottom: none;
          }
          
          .article:hover {
            background: #f8f9ff;
            margin: 0 -20px;
            padding: 25px 20px;
            border-radius: 15px;
          }
          
          .article-title {
            font-size: 1.3em;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .article-title a {
            color: #333;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          
          .article-title a:hover {
            color: #667eea;
          }
          
          .article-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
          }
          
          .article-meta span {
            display: flex;
            align-items: center;
          }
          
          .article-meta span::before {
            margin-right: 5px;
          }
          
          .article-date::before { content: "📅"; }
          .article-category::before { content: "🏷️"; }
          .article-reading-time::before { content: "⏱️"; }
          
          .article-description {
            color: #555;
            line-height: 1.7;
          }
          
          .article-tags {
            margin-top: 15px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .tag {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            text-decoration: none;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            color: white;
            opacity: 0.8;
          }
          
          .footer a {
            color: white;
            text-decoration: none;
          }
          
          @media (max-width: 600px) {
            .container {
              padding: 10px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 2em;
            }
            
            .articles {
              padding: 20px;
            }
            
            .article:hover {
              margin: 0 -10px;
              padding: 25px 10px;
            }
            
            .stats {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p><xsl:value-of select="rss/channel/description"/></p>
            
            <div class="rss-info">
              <h3>RSS Feed</h3>
              <p>Це RSS фід нашого блогу. Скопіюйте URL нижче у ваш RSS читач:</p>
              <div class="rss-url">
                <xsl:value-of select="rss/channel/atom:link/@href"/>
              </div>
              <p><small>Рекомендовані RSS читачі: Feedly, Inoreader, NewsBlur</small></p>
            </div>
            
            <div class="stats">
              <div class="stat-item">
                <span class="stat-number"><xsl:value-of select="count(rss/channel/item)"/></span>
                <div class="stat-label">Статей</div>
              </div>
              <div class="stat-item">
                <span class="stat-number">🔄</span>
                <div class="stat-label">Оновлюється</div>
              </div>
              <div class="stat-item">
                <span class="stat-number">🆓</span>
                <div class="stat-label">Безкоштовно</div>
              </div>
            </div>
          </div>
          
          <!-- Articles -->
          <div class="articles">
            <h2>Останні статті</h2>
            
            <xsl:for-each select="rss/channel/item">
              <div class="article">
                <div class="article-title">
                  <a href="{link}" target="_blank">
                    <xsl:value-of select="title"/>
                  </a>
                </div>
                
                <div class="article-meta">
                  <span class="article-date">
                    <xsl:value-of select="substring(pubDate, 1, 16)"/>
                  </span>
                  <xsl:if test="category">
                    <span class="article-category">
                      <xsl:value-of select="category[1]"/>
                    </span>
                  </xsl:if>
                  <xsl:if test="readingTime">
                    <span class="article-reading-time">
                      <xsl:value-of select="readingTime"/>
                    </span>
                  </xsl:if>
                </div>
                
                <div class="article-description">
                  <xsl:value-of select="description"/>
                </div>
                
                <xsl:if test="category[position() > 1]">
                  <div class="article-tags">
                    <xsl:for-each select="category[position() > 1]">
                      <span class="tag">
                        #<xsl:value-of select="."/>
                      </span>
                    </xsl:for-each>
                  </div>
                </xsl:if>
              </div>
            </xsl:for-each>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>
              © <xsl:value-of select="substring(rss/channel/lastBuildDate, 1, 4)"/> 
              <a href="{rss/channel/link}"><xsl:value-of select="rss/channel/title"/></a>
            </p>
            <p>Згенеровано: <xsl:value-of select="rss/channel/lastBuildDate"/></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 