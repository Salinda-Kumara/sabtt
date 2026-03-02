import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding specific Batches...');

    const batches = [
        "17B MOHE /WD",
        "18A WD",
        "19A WE /MOHE WE",
        "3AWE /MOHE WE (BMBA)",
        "18C WD",
        "2C WD (BMBA)",
        "18A WE/18C EX - CA,MAAT",
        "2A WE (BMBA)",
        "17C WD/WE",
        "16A MOHE WE/WD,16C /D WD WE ,17BEX ,18A EX",
        "18C WE",
        "2C WE (BMBA)",
        "19C WD",
        "15D WE and 16A MOHE WD, 16B WD/WE",
        "19C WE",
        "3C WE (BMBA)",
        "1A WE (BMBA)",
        "3B WD/ MOHE WD (BMBA)",
        "19B MOHE WD",
        "19B WD",
        "18B WD",
        "17A WE/17A WD",
        "19B Ex",
        "19B MOHE WE",
        "19B WE",
        "3BWE /MOHE WE (BMBA)",
        "17B MOHE/ WE",
        "18B WE",
        "2B WD WE (BMBA)",
        "19A WD/ MOHE WD",
        "3A WD/ MOHE WD (BMBA)"
    ];

    try {
        let added = 0;
        const colors = [
            '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
            '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e',
        ];

        for (let i = 0; i < batches.length; i++) {
            const name = batches[i].trim();
            const color = colors[i % colors.length];

            const existing = await prisma.batch.findUnique({ where: { name } });
            if (!existing) {
                await prisma.batch.create({
                    data: { name, color }
                });
                added++;
                console.log(`  ➕ Added: ${name}`);
            } else {
                console.log(`  ⚡ Skipped (already exists): ${name}`);
            }
        }

        console.log(`\n🎉 Batch seed complete! Added ${added} new batches.`);

    } catch (error) {
        console.error('Error during batch seed:', error);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
