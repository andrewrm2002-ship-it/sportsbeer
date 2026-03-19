/**
 * Sport-specific placeholder images using free Unsplash source URLs.
 * These are used when articles don't have their own cover photo.
 * Each sport has 6+ images to minimize same-day duplication.
 */

const SPORT_IMAGES: Record<string, string[]> = {
  soccer: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop',
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504450758481-7338bbe75005?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1559692048-79a3f837883d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800&h=400&fit=crop',
  ],
  'american-football': [
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1567169866456-62658abb7f65?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495434942770-3a4e234de67b?w=800&h=400&fit=crop',
  ],
  baseball: [
    'https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1527952826407-d8ba039f9e3f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1562077772-3bd90f703808?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1566577134665-2c32e5bb5e45?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1578432156115-4147f1fce106?w=800&h=400&fit=crop',
  ],
  'ice-hockey': [
    'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580692475446-c2fabbbbf835?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1617361004590-f6d0124d77c3?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800&h=400&fit=crop',
  ],
  tennis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530915534664-4ac6423816b7?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1545809761-7d0a78fbc89b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=400&fit=crop',
  ],
  golf: [
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1611374243147-44a702c2d44c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1623076574510-660da6be02b4?w=800&h=400&fit=crop',
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580629905303-faaa03e8e7a8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1624971497044-3b338527dc4c?w=800&h=400&fit=crop',
  ],
  'rugby-union': [
    'https://images.unsplash.com/photo-1544298621-35a764866aeb?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580705038002-efa2ca1a2b6d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1528856497823-a5e7c834daf6?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519781542704-957ff19eff00?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
  ],
  'rugby-league': [
    'https://images.unsplash.com/photo-1580705038002-efa2ca1a2b6d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544298621-35a764866aeb?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1528856497823-a5e7c834daf6?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519781542704-957ff19eff00?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop',
  ],
  mma: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1615117972428-28de87cf8e28?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1596025867193-f12e8f4e7e06?w=800&h=400&fit=crop',
  ],
  f1: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552642986-ccb41e7059e7?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558981033-f5e2dfd67618?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504817343863-5092a923803e?w=800&h=400&fit=crop',
  ],
  volleyball: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553005746-9245ba190489?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547347298-4c3bf4754e3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1562552052-c77f0d7f4549?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580692475446-c2fabbbbf835?w=800&h=400&fit=crop',
  ],
  'australian-football': [
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495434942770-3a4e234de67b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1567169866456-62658abb7f65?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=400&fit=crop',
  ],
  'field-hockey': [
    'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-bd45ba048b7b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
  ],
  lacrosse: [
    'https://images.unsplash.com/photo-1461896836934-bd45ba048b7b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
  ],
  'water-polo': [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=400&fit=crop',
  ],
  boxing: [
    'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1615117972428-28de87cf8e28?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1596025867193-f12e8f4e7e06?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop',
  ],
  handball: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553005746-9245ba190489?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547347298-4c3bf4754e3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1562552052-c77f0d7f4549?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
  ],
  swimming: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
  ],
  'track-and-field': [
    'https://images.unsplash.com/photo-1461896836934-bd45ba048b7b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=400&fit=crop',
  ],
  cycling: [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605945449415-f012e4f1c3de?w=800&h=400&fit=crop',
  ],
  gymnastics: [
    'https://images.unsplash.com/photo-1566164266942-9c0e63832c69?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-bd45ba048b7b?w=800&h=400&fit=crop',
  ],
  wrestling: [
    'https://images.unsplash.com/photo-1564415637254-92c66292cd64?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1615117972428-28de87cf8e28?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1596025867193-f12e8f4e7e06?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=400&fit=crop',
  ],
  skiing: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1548133464-29abc661eb5c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488197047962-b48492212cda?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800&h=400&fit=crop',
  ],
  surfing: [
    'https://images.unsplash.com/photo-1502680390548-bdbac40e4a9f?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1455729552457-5c322b382024?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1468581264429-2548ef9eb732?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800&h=400&fit=crop',
  ],
  'table-tennis': [
    'https://images.unsplash.com/photo-1611251135345-18c56206b863?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-bd45ba048b7b?w=800&h=400&fit=crop',
  ],
  badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-bd45ba048b7b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&h=400&fit=crop',
  ],
  esports: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558742619-fd82741daa9e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=400&fit=crop',
  ],
  sailing: [
    'https://images.unsplash.com/photo-1534854638093-bada1813ca19?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1500930287596-c1ecaa210c07?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504387432042-8aca549e4729?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop',
  ],
};

/**
 * Get a date seed that changes daily, so same-day articles
 * within a sport get spread across different images.
 */
function getDaySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/**
 * Get a deterministic placeholder image for a sport based on article ID.
 * Mixes article ID hash with daily rotation to minimize same-day duplication.
 */
export function getSportPlaceholderImage(sportSlug: string, articleId: string): string {
  const images = SPORT_IMAGES[sportSlug] || SPORT_IMAGES['soccer']!;
  const daySeed = getDaySeed();

  // Hash from article ID
  let hash = 0;
  for (let i = 0; i < articleId.length; i++) {
    hash = ((hash << 5) - hash + articleId.charCodeAt(i)) | 0;
  }

  // Mix in the day seed so articles rotate daily even with same IDs
  const mixed = Math.abs(hash ^ daySeed);
  const index = mixed % images.length;
  return images[index]!;
}

/**
 * Get the image URL for an article, falling back to sport placeholder.
 */
export function getArticleImage(imageUrl: string | null | undefined, sportSlug: string, articleId: string): string {
  if (imageUrl) return imageUrl;
  return getSportPlaceholderImage(sportSlug, articleId);
}
