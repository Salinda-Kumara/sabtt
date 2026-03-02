import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Batches from ALL.xlsx...');

    try {
        const workbook = xlsx.readFile('d:/TimeT/ALL.xlsx');
        const batches = new Set<string>();

        // We know from earlier inspection that sheet "AA" has the "Year I: Semester I" style names
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

            data.forEach(row => {
                row.forEach(cell => {
                    if (typeof cell === 'string') {
                        // Match strings like "Year I: Semester I", "Year I Semester I"
                        const match = cell.match(/Year\s*I+[:\s]*Semester\s*I+/i);
                        if (match) {
                            batches.add(match[0].trim());
                        }
                    }
                });
            });
        });

        const batchList = Array.from(batches);
        console.log(`Found ${batchList.length} distinct batches in Excel.`);

        if (batchList.length === 0) {
            console.log('No batches found to seed.');
            return;
        }

        let added = 0;
        const colors = [
            '#ef4444', // red
            '#f97316', // orange
            '#f59e0b', // amber
            '#84cc16', // lime
            '#10b981', // emerald
            '#06b6d4', // cyan
            '#3b82f6', // blue
            '#6366f1', // indigo
            '#8b5cf6', // violet
            '#d946ef', // fuchsia
            '#f43f5e', // rose
        ];

        for (let i = 0; i < batchList.length; i++) {
            const name = batchList[i];
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
