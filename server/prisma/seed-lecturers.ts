import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('👨‍🏫 Adding Lecturers from ALL.xlsx...\n');

    // Get departments
    const bsaaDept = await prisma.department.findFirst({ where: { code: 'BSAA' } });
    const bmbaDept = await prisma.department.findFirst({ where: { code: 'BMBA' } });

    if (!bsaaDept || !bmbaDept) {
        console.error('❌ Departments not found. Run seed-accounting.ts and seed-analytics.ts first.');
        return;
    }

    // Lecturers from the "Lec names Semester I" sheet
    const lecturers = [
        { name: 'Ms. Ama Hingurala', dept: 'BSAA' },
        { name: 'Mr. Amal Perera', dept: 'BSAA' },
        { name: 'Ms. Amanda Nishamini Perera', dept: 'BSAA' },
        { name: 'Prof. Aruna Gamage', dept: 'BSAA' },
        { name: 'Mr. Ashane Jayasekara', dept: 'BSAA' },
        { name: 'Mr. Ashen Rajapakshe', dept: 'BSAA' },
        { name: 'Dr. Chamal Hasaranga', dept: 'BSAA' },
        { name: 'Ms. Chamika Dahanayake', dept: 'BSAA' },
        { name: 'Mr. Chandana Wijekoone', dept: 'BSAA' },
        { name: 'Ms. Chathurangi Karunasekara', dept: 'BSAA' },
        { name: 'Mr. Chiranga Pera', dept: 'BSAA' },
        { name: 'Mr. Dharshan Pathmanathan', dept: 'BSAA' },
        { name: 'Mr. Dilan Rathnayake', dept: 'BSAA' },
        { name: 'Ms. Dilini Aruppala', dept: 'BSAA' },
        { name: 'Mr. Dilshan Dissanayake', dept: 'BSAA' },
        { name: 'Ms. Hansini Palihawadana', dept: 'BSAA' },
        { name: 'Mr. Hasitha Sanjeewa', dept: 'BSAA' },
        { name: 'Mr. Himal Muthunayake', dept: 'BSAA' },
        { name: 'Ms. Ishara Ranasinghe', dept: 'BSAA' },
        { name: 'Ms. Isuri Chandeepa', dept: 'BSAA' },
        { name: 'Ms. Isuri Samarawickrama', dept: 'BSAA' },
        { name: 'Ms. Isuri Udara', dept: 'BSAA' },
        { name: 'Dr. Isuru Manawadu', dept: 'BSAA' },
        { name: 'Ms. Lakdinithi Subasinha', dept: 'BSAA' },
        { name: 'Mr. M B G Wimalarathna', dept: 'BSAA' },
        { name: 'Mr. Malinda Herath', dept: 'BSAA' },
        { name: 'Mr. Malintha Perera', dept: 'BSAA' },
        { name: 'Ms. Mekhala Avanthi', dept: 'BSAA' },
        { name: 'Ms. Nathasha Kaumadhi', dept: 'BSAA' },
        { name: 'Mr. Nihal Chandrathilake', dept: 'BSAA' },
        { name: 'Mr. Nilantha Agampodi', dept: 'BSAA' },
        { name: 'Mr. Nipun Hewapathirana', dept: 'BSAA' },
        { name: 'Ms. Nipunee Jayasuriya', dept: 'BSAA' },
        { name: 'Ms. Nishanthini Simons', dept: 'BMBA' },
        { name: 'Dr. Pasan Edirisinghe', dept: 'BMBA' },
        { name: 'Mr. Prabath Weerasinghe', dept: 'BMBA' },
        { name: 'Mr. Pubudu Disanayake', dept: 'BMBA' },
        { name: 'Mr. Rangajeewa Herath', dept: 'BMBA' },
        { name: 'Mr. Ranil Abeywardhena', dept: 'BMBA' },
        { name: 'Prof. Roshan Ajward', dept: 'BMBA' },
        { name: 'Mr. Ruwan Peiris', dept: 'BMBA' },
        { name: 'Ms. Sachini Madushani', dept: 'BMBA' },
        { name: 'Mr. Sahan J. Fernando', dept: 'BMBA' },
        { name: 'Prof. Samantha Kaluarachchi', dept: 'BMBA' },
        { name: 'Dr. Sampath Kongahawatte', dept: 'BMBA' },
        { name: 'Ms. Sirini Punsara', dept: 'BMBA' },
        { name: 'Mr. Supun Madushanka', dept: 'BMBA' },
        { name: 'Mr. Surath Edirisinghe', dept: 'BMBA' },
        { name: 'Mr. Uditha Jayasinghe', dept: 'BMBA' },
        { name: 'Mr. Uditha Bandara', dept: 'BMBA' },
        { name: 'Mr. Udula Subodha', dept: 'BMBA' },
        { name: 'Ms. Umeshi Rabel', dept: 'BMBA' },
        { name: 'Mr. Upendra Wijesinghe', dept: 'BMBA' },
        { name: 'Mr. Viraj Weerawickrama', dept: 'BMBA' },
        { name: 'Ms. Wathsala Wimansi', dept: 'BMBA' },
        { name: 'Mr. Saman Dissanayake', dept: 'BSAA' },
    ];

    let lecCreated = 0;
    let lecSkipped = 0;

    for (const lec of lecturers) {
        const deptId = lec.dept === 'BSAA' ? bsaaDept.id : bmbaDept.id;
        // Generate email from name
        const email = lec.name
            .replace(/^(Ms\.|Mr\.|Dr\.|Prof\.?)\s*/i, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '.')
            + '@sabaragamuwa.ac.lk';

        const existing = await prisma.lecturer.findFirst({ where: { email } });
        if (existing) {
            lecSkipped++;
            continue;
        }

        await prisma.lecturer.create({
            data: {
                name: lec.name,
                email,
            },
        });
        lecCreated++;
    }

    console.log(`  ✅ ${lecCreated} lecturers created, ${lecSkipped} already existed`);
    console.log(`  Total lecturers in list: ${lecturers.length}\n`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
