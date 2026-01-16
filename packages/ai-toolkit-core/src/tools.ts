/**
 * Tool registry pro web operations
 */

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Web fetch tool - načte HTML z URL
 */
export async function webFetch(url: string): Promise<ToolResult<string>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIG-Platform/1.0)',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    return {
      success: true,
      data: html,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Web extract tool - extrahuje základní informace z HTML
 */
export async function webExtract(html: string): Promise<ToolResult<{
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  headings?: string[];
  links?: Array<{ text: string; href: string }>;
}>> {
  try {
    // Jednoduchá extrakce pomocí regex (pro PART 2, v produkci bych použil cheerio nebo podobně)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const metaKeywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
    
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    // Extract headings
    const headingMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
    const headings = headingMatches.map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean);

    // Extract links (simplified)
    const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi) || [];
    const links = linkMatches.slice(0, 50).map(link => {
      const hrefMatch = link.match(/href=["']([^"']+)["']/i);
      const textMatch = link.match(/>([^<]+)</i);
      return {
        text: textMatch ? textMatch[1].trim() : '',
        href: hrefMatch ? hrefMatch[1] : '',
      };
    }).filter(l => l.href && l.text);

    return {
      success: true,
      data: {
        title: titleMatch?.[1]?.trim(),
        description: metaDescMatch?.[1]?.trim(),
        keywords: metaKeywordsMatch?.[1]?.trim(),
        ogTitle: ogTitleMatch?.[1]?.trim(),
        ogDescription: ogDescMatch?.[1]?.trim(),
        ogImage: ogImageMatch?.[1]?.trim(),
        headings,
        links,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Tool registry
 */
export const TOOLS = {
  'web.fetch': webFetch,
  'web.extract': webExtract,
} as const;

export type ToolName = keyof typeof TOOLS;
