import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🏢 Adding Buildings & Rooms from ALL.xlsx...\n');

    // Building 1: SAB Campus
    let sabCampus = await prisma.building.findFirst({ where: { name: 'SAB Campus' } });
    if (!sabCampus) {
        sabCampus = await prisma.building.create({
            data: { name: 'SAB Campus', abbreviation: 'SAB' },
        });
    }

    const sabRooms = [
        { name: 'Level 02 - Hall 01', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 02 - Hall 02', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 02 - Hall 03', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 02 - Hall 04', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 03 - Hall 01', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 03 - Hall 02', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 03 - Hall 03', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 03 - Hall 04', capacity: 60, buildingId: sabCampus.id },
        { name: 'Level 04 - Hall 01', capacity: 100, buildingId: sabCampus.id },
        { name: 'Level 04 - Hall 02', capacity: 100, buildingId: sabCampus.id },
        { name: 'Level 04 - IT LAB 01', capacity: 40, buildingId: sabCampus.id },
        { name: 'Level 04 - IT LAB 02', capacity: 40, buildingId: sabCampus.id },
    ];

    // Building 2: New Building SAB Campus
    let newSAB = await prisma.building.findFirst({ where: { name: 'New Building SAB Campus' } });
    if (!newSAB) {
        newSAB = await prisma.building.create({
            data: { name: 'New Building SAB Campus', abbreviation: 'NSAB' },
        });
    }

    const newSABRooms = [
        { name: 'Level 01', capacity: 50, buildingId: newSAB.id },
        { name: 'Level 02', capacity: 50, buildingId: newSAB.id },
        { name: 'Level 03', capacity: 50, buildingId: newSAB.id },
        { name: 'Level 04', capacity: 50, buildingId: newSAB.id },
    ];

    let created = 0;
    let skipped = 0;

    for (const r of [...sabRooms, ...newSABRooms]) {
        const existing = await prisma.room.findFirst({
            where: { name: r.name, buildingId: r.buildingId }
        });
        if (existing) {
            skipped++;
            continue;
        }
        await prisma.room.create({ data: r });
        created++;
    }

    console.log(`✅ ${created} rooms created, ${skipped} already existed\n`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
