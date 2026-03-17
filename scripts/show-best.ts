import { db } from '../db';
import { aiArticleVariants, aiVariantScores } from '../db/schema';
import { sql, eq } from 'drizzle-orm';
import type { WriterStyle } from '../src/pipeline/agents/types';

const WRITER_STYLES: WriterStyle[] = ['punchy', 'storyteller', 'analyst'];

async function main() {
  const styleArg = process.argv[2];
  const style: WriterStyle = styleArg && WRITER_STYLES.includes(styleArg as WriterStyle)
    ? styleArg as WriterStyle
    : 'punchy';

  const rows = await db
    .select({
      title: aiArticleVariants.title,
      subtitle: aiArticleVariants.subtitle,
      body: aiArticleVariants.body,
      summary: aiArticleVariants.summary,
      style: aiArticleVariants.writerStyle,
      sourceTitle: aiArticleVariants.sourceTitle,
      score: aiVariantScores.totalScore,
    })
    .from(aiArticleVariants)
    .innerJoin(aiVariantScores, sql`${aiVariantScores.variantId} = ${aiArticleVariants.id}`)
    .where(eq(aiArticleVariants.writerStyle, style))
    .orderBy(sql`${aiVariantScores.totalScore} DESC`)
    .limit(1);

  if (!rows.length) {
    console.log(`No scored ${style} variants found`);
    return;
  }

  const a = rows[0]!;
  console.log(`SCORE: ${(a.score / 10).toFixed(1)}/10`);
  console.log(`SOURCE: ${a.sourceTitle}`);
  console.log(`STYLE: ${a.style}`);
  console.log('');
  console.log('══════════════════════════════════════');
  console.log(`HEADLINE: ${a.title}`);
  console.log(`SUBTITLE: ${a.subtitle}`);
  console.log('══════════════════════════════════════');
  console.log('');
  console.log(a.body);
  console.log('');
  console.log('──────────────────────────────────────');
  console.log(`SUMMARY: ${a.summary}`);
}

main().catch((e) => console.error(e));
