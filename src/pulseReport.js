import chalk from 'chalk';
import Table from 'cli-table3';
import { getLatestPrices } from './storage/sqlStore.js';
import { getNewsByRunId } from './storage/noSqlStore.js';
import { connectDB } from './config/database.js';
import { initSqlDb } from './storage/sqlStore.js';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style:                 'currency',
    currency:              'USD',
    minimumFractionDigits: 2,
  }).format(price);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function printPulseBlock(priceRecord, newsItems) {
  console.log('\n' + chalk.yellow('━'.repeat(60)));

  console.log(chalk.bold.cyan("           GLOBAL PULSE REPORT"));
  console.log(chalk.yellow('━'.repeat(60)));

  const priceTable = new Table({
    style: { head: ['cyan'] },
  });

  priceTable.push(
    { [chalk.bold('Asset')]:     chalk.green(priceRecord.asset.toUpperCase()) },
    { [chalk.bold('Price')]:     chalk.green.bold(formatPrice(priceRecord.price)) },
    { [chalk.bold('Currency')]:  priceRecord.currency.toUpperCase() },
    { [chalk.bold('Timestamp')]: formatDate(priceRecord.timestamp) },
    { [chalk.bold('Run ID')]:    chalk.dim(priceRecord.run_id) }
  );

  console.log(priceTable.toString());

  console.log(chalk.bold.cyan("\n  NEWS CONTEXT\n"));

  if (!newsItems || newsItems.length === 0) {
    console.log(chalk.red("  No news found for this run.\n"));
    return;
  }

  newsItems.forEach((item, index) => {
    console.log(chalk.bold.white(`  [${index + 1}] ${item.title}`));
    console.log(chalk.dim(`       Source : ${item.source}`));
    console.log(chalk.blue(`       URL    : ${item.url}`));
    console.log(chalk.dim(`       Published : ${formatDate(item.publishedAt)}\n`));
  });

  console.log(chalk.yellow('━'.repeat(60)));
}

async function generateReport() {
  try {
    initSqlDb();
    await connectDB();

    console.log(chalk.bold.green("\nGenerating Global Pulse Report...\n"));

    const prices = getLatestPrices(5);

    if (prices.length === 0) {
      console.log(chalk.red("No data found. Run pipeline first: npm run pipeline"));
      process.exit(0);
    }

    for (const price of prices) {
      const news = await getNewsByRunId(price.run_id);
      printPulseBlock(price, news);
    }

    console.log(chalk.bold.green("\nReport complete!\n"));
    process.exit(0);

  } catch (err) {
    console.error(chalk.red("Report failed:"), err.message);
    process.exit(1);
  }
}

generateReport();