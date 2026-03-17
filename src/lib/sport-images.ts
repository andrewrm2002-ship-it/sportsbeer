/**
 * Sport-specific placeholder images using free Unsplash source URLs.
 * These are used when articles don't have their own cover photo.
 * Each sport has multiple images to add variety.
 */

const SPORT_IMAGES: Record<string, string[]> = {
  soccer: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop',
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504450758481-7338bbe75005?w=800&h=400&fit=crop',
  ],
  'american-football': [
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop',
  ],
  baseball: [
    'https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&h=400&fit=crop',
  ],
  'ice-hockey': [
    'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580692475446-c2fabbbbf835?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1617361004590-f6d0124d77c3?w=800&h=400&fit=crop',
  ],
  tennis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=400&fit=crop',
  ],
  golf: [
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=400&fit=crop',
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=400&fit=crop',
  ],
  'rugby-union': [
    'https://images.unsplash.com/photo-1544298621-35a764866aeb?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580705038002-efa2ca1a2b6d?w=800&h=400&fit=crop',
  ],
  'rugby-league': [
    'https://images.unsplash.com/photo-1544298621-35a764866aeb?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580705038002-efa2ca1a2b6d?w=800&h=400&fit=crop',
  ],
  'mma-ufc': [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&h=400&fit=crop',
  ],
  'f1-racing': [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=800&h=400&fit=crop',
  ],
  volleyball: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553005746-9245ba190489?w=800&h=400&fit=crop',
  ],
  'australian-football': [
    'https://images.unsplash.com/photo-1544298621-35a764866aeb?w=800&h=400&fit=crop',
  ],
  'field-hockey': [
    'https://images.unsplash.com/photo-1544298621-35a764866aeb?w=800&h=400&fit=crop',
  ],
  lacrosse: [
    'https://images.unsplash.com/photo-1544298621-35a764866aeb?w=800&h=400&fit=crop',
  ],
  'water-polo': [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=400&fit=crop',
  ],
  boxing: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&h=400&fit=crop',
  ],
  handball: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
  ],
  swimming: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=400&fit=crop',
  ],
  'track-and-field': [
    'https://images.unsplash.com/photo-1461896836934-bd45ba048b7b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800&h=400&fit=crop',
  ],
  cycling: [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=400&fit=crop',
  ],
  gymnastics: [
    'https://images.unsplash.com/photo-1566164266942-9c0e63832c69?w=800&h=400&fit=crop',
  ],
  wrestling: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop',
  ],
  skiing: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&h=400&fit=crop',
  ],
  surfing: [
    'https://images.unsplash.com/photo-1502680390548-bdbac40e4a9f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1455729552457-5c322b382024?w=800&h=400&fit=crop',
  ],
  'table-tennis': [
    'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=800&h=400&fit=crop',
  ],
  badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop',
  ],
  esports: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop',
  ],
  sailing: [
    'https://images.unsplash.com/photo-1534854638093-bada1813ca19?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=400&fit=crop',
  ],
};

/**
 * Get a deterministic placeholder image for a sport based on article ID.
 * Uses the article ID hash to pick a consistent image per article.
 */
export function getSportPlaceholderImage(sportSlug: string, articleId: string): string {
  const images = SPORT_IMAGES[sportSlug] || SPORT_IMAGES['soccer'];
  // Simple hash from article ID to pick an image
  let hash = 0;
  for (let i = 0; i < articleId.length; i++) {
    hash = ((hash << 5) - hash + articleId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
}

/**
 * Get the image URL for an article, falling back to sport placeholder.
 */
export function getArticleImage(imageUrl: string | null | undefined, sportSlug: string, articleId: string): string {
  if (imageUrl) return imageUrl;
  return getSportPlaceholderImage(sportSlug, articleId);
}
