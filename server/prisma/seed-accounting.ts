import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🎓 Adding BSc. Applied Accounting subjects...\n');

    // Create or find the department
    let dept = await prisma.department.findFirst({ where: { code: 'BSAA' } });
    if (!dept) {
        dept = await prisma.department.create({
            data: { name: 'Applied Accounting', code: 'BSAA', color: '#0891b2' },
        });
        console.log('  ✅ Department "Applied Accounting" created');
    } else {
        console.log('  ℹ️  Department "Applied Accounting" already exists');
    }

    const subjects = [
        // Year I: Semester I
        { code: 'BSAA 11013', name: 'Financial Accounting', classType: 'LECTURE' as const },
        { code: 'BSAA 11023', name: 'Management Fundamentals', classType: 'LECTURE' as const },
        { code: 'BSAA 11032', name: 'Principles of Economics', classType: 'LECTURE' as const },
        { code: 'BSAA 11043', name: 'Financial Mathematics', classType: 'LECTURE' as const },
        { code: 'BSAA 11052', name: 'Business Law', classType: 'LECTURE' as const },
        { code: 'BSAA 11062', name: 'Business Communication & Skill Development I', classType: 'LECTURE' as const },

        // Year I: Semester II
        { code: 'BSAA 12013', name: 'Information Technology in Business', classType: 'LECTURE' as const },
        { code: 'BSAA 12023', name: 'Cost & Management Accounting', classType: 'LECTURE' as const },
        { code: 'BSAA 12033', name: 'Marketing Management', classType: 'LECTURE' as const },
        { code: 'BSAA 12042', name: 'Business Economics', classType: 'LECTURE' as const },
        { code: 'BSAA 12052', name: 'Business Statistics & Forecasting', classType: 'LECTURE' as const },
        { code: 'BSAA 12062', name: 'Business Taxation', classType: 'LECTURE' as const },

        // Year II: Semester I
        { code: 'BSAA 21013', name: 'Financial Reporting', classType: 'LECTURE' as const },
        { code: 'BSAA 21023', name: 'Business Processes, Controls & Audits', classType: 'LECTURE' as const },
        { code: 'BSAA 21032', name: 'Human Resource Management', classType: 'LECTURE' as const },
        { code: 'BSAA 21042', name: 'Management Information Systems', classType: 'LECTURE' as const },
        { code: 'BSAA 21053', name: 'Business Finance', classType: 'LECTURE' as const },
        { code: 'BSAA 21062', name: 'Business Communication & Skill Development II', classType: 'LECTURE' as const },

        // Year II: Semester II
        { code: 'BSAA 22013', name: 'Accounting in Digital Environment', classType: 'LECTURE' as const },
        { code: 'BSAA 22023', name: 'Advanced Management Accounting', classType: 'LECTURE' as const },
        { code: 'BSAA 22033', name: 'Audit & Assurance', classType: 'LECTURE' as const },
        { code: 'BSAA 22043', name: 'Operations Management', classType: 'LECTURE' as const },
        { code: 'BSAA 22053', name: 'Corporate Law', classType: 'LECTURE' as const },

        // Year III: Semester I
        { code: 'BSAA 31013', name: 'Corporate Reporting', classType: 'LECTURE' as const },
        { code: 'BSAA 31023', name: 'Digital Business Strategy', classType: 'LECTURE' as const },
        { code: 'BSAA 31033', name: 'Research Methodology', classType: 'LECTURE' as const },
        { code: 'BSAA 31044', name: 'Internship in Accounting I', classType: 'TUTORIAL' as const },
        { code: 'BSAA 31052', name: 'Skills in Leadership & Innovation', classType: 'LECTURE' as const },

        // Year III: Semester II
        { code: 'BSAA 32013', name: 'Governance, Ethics and Risk Management', classType: 'LECTURE' as const },
        { code: 'BSAA 32024', name: 'Corporate Taxation', classType: 'LECTURE' as const },
        { code: 'BSAA 32034', name: 'Package Based Data Analysis', classType: 'LAB' as const },
        { code: 'BSAA 32044', name: 'Business Research Project', classType: 'TUTORIAL' as const },
        { code: 'BSAA 32054', name: 'Internship in Accounting II', classType: 'TUTORIAL' as const },

        // Year IV: Semester I
        { code: 'BSAA 41012', name: 'Entrepreneurship', classType: 'LECTURE' as const },
        { code: 'BSAA 41022', name: 'International Business', classType: 'LECTURE' as const },
        { code: 'BSAA 41032', name: 'Organizational Behaviour', classType: 'LECTURE' as const },
        { code: 'BSAA 41043', name: 'Corporate Finance & Risk Management', classType: 'LECTURE' as const },
        { code: 'BSAA 41054', name: 'Internship in Accounting III', classType: 'TUTORIAL' as const },
        { code: 'BSAA 41063', name: 'Business Intelligence', classType: 'LAB' as const },
        { code: 'BSAA 41073', name: 'Business Analytics', classType: 'LAB' as const },
        { code: 'BSAA 41083', name: 'Information Security & Fraud Analytics', classType: 'LAB' as const },
        { code: 'BSAA 41093', name: 'Forensic Accounting', classType: 'LECTURE' as const },
        { code: 'BSAA 41103', name: 'Security Analysis & Business Valuation', classType: 'LECTURE' as const },
        { code: 'BSAA 41113', name: 'Financial Modeling & Forecasting', classType: 'LAB' as const },

        // Year IV: Semester II
        { code: 'BSAA 42012', name: 'Contemporary Issues in Accounting', classType: 'LECTURE' as const },
        { code: 'BSAA 42023', name: 'Strategic Management', classType: 'LECTURE' as const },
        { code: 'BSAA 42036', name: 'Dissertation', classType: 'TUTORIAL' as const },
        { code: 'BSAA 42044', name: 'Internship in Accounting IV', classType: 'TUTORIAL' as const },
    ];

    let created = 0;
    let skipped = 0;

    for (const subj of subjects) {
        const existing = await prisma.course.findUnique({ where: { code: subj.code } });
        if (existing) {
            skipped++;
            continue;
        }
        await prisma.course.create({
            data: {
                code: subj.code,
                name: subj.name,
                classType: subj.classType,
                departmentId: dept.id,
            },
        });
        created++;
    }

    console.log(`  ✅ ${created} subjects created, ${skipped} already existed`);
    console.log(`\n🎉 Done! Total BSc. Applied Accounting subjects: ${subjects.length}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
