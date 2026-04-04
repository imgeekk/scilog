import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const seedLogs = [
  {
    body: "Woke before sunrise and wrote down a clean timeline for the day. The rest of the schedule felt much easier to navigate after that.",
    tag: "reflection",
  },
  {
    body: "Campus was quieter than usual today, which made it easier to focus between classes and actually retain what I was studying.",
    tag: "campus",
  },
  {
    body: "Wrapped a difficult chunk of work late in the evening. It took longer than expected, but I finished it without cutting corners.",
    tag: "work",
  },
];

async function main() {
  const existingCount = await prisma.logEntry.count();

  if (existingCount > 0) {
    console.log("Seed skipped: log entries already exist.");
    return;
  }

  await prisma.logEntry.createMany({
    data: seedLogs,
  });

  console.log(`Seeded ${seedLogs.length} log entries.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed logs.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
