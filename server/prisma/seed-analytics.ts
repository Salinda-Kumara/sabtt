import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🎓 Adding Bachelor of Management Honours in Business Analytics subjects...\n');

    // Create or find the department
    let dept = await prisma.department.findFirst({ where: { code: 'BMBA' } });
    if (!dept) {
        dept = await prisma.department.create({
            data: { name: 'Business Analytics', code: 'BMBA', color: '#7c3aed' },
        });
        console.log('  ✅ Department "Business Analytics" created');
    } else {
        console.log('  ℹ️  Department "Business Analytics" already exists');
    }

    const subjects = [
        // Year I: Semester I
        { code: 'BMBA1113', name: 'Introduction to Business Management', classType: 'LECTURE' as const },
        { code: 'BMBA1123', name: 'Mathematics for Data Science', classType: 'LECTURE' as const },
        { code: 'BMBA1133', name: 'Introduction to Data Analytics', classType: 'LAB' as const },
        { code: 'BMBA1143', name: 'Accounting for Business', classType: 'LECTURE' as const },
        { code: 'BMBA1152', name: 'Personal Development and Academic Writing', classType: 'LECTURE' as const },
        { code: 'BMBA1162', name: 'Legal Environment', classType: 'LECTURE' as const },

        // Year I: Semester II
        { code: 'BMBA1212', name: 'Human Resource Management', classType: 'LECTURE' as const },
        { code: 'BMBA1223', name: 'Statistical Methods for Management Decisions', classType: 'LECTURE' as const },
        { code: 'BMBA1232', name: 'Principles of Economics', classType: 'LECTURE' as const },
        { code: 'BMBA1242', name: 'Leadership in Organizations', classType: 'LECTURE' as const },
        { code: 'BMBA1253', name: 'Foundations of Business Analytics', classType: 'LAB' as const },
        { code: 'BMBA1262', name: 'Accounting Information Systems', classType: 'LAB' as const },

        // Year II: Semester I
        { code: 'BMBA2112', name: 'Business Analytical Techniques', classType: 'LAB' as const },
        { code: 'BMBA2123', name: 'Financial Management', classType: 'LECTURE' as const },
        { code: 'BMBA2132', name: 'Marketing Management', classType: 'LECTURE' as const },
        { code: 'BMBA2142', name: 'Descriptive Analytics & Data Management', classType: 'LAB' as const },
        { code: 'BMBA2153', name: 'Cost and Management Accounting', classType: 'LECTURE' as const },
        { code: 'BMBA2163', name: 'Digital Transformation', classType: 'LECTURE' as const },

        // Year II: Semester II
        { code: 'BMBA2212', name: 'Customer Analytics', classType: 'LAB' as const },
        { code: 'BMBA2223', name: 'Predictive Analytics with Excel', classType: 'LAB' as const },
        { code: 'BMBA2233', name: 'Data Science and Visualization for Business', classType: 'LAB' as const },
        { code: 'BMBA2243', name: 'Big Data Analytics', classType: 'LAB' as const },
        { code: 'BMBA2253', name: 'Operations Analytics', classType: 'LAB' as const },
        { code: 'BMBA2262', name: 'Competitor Analysis and Market Intelligence', classType: 'LECTURE' as const },

        // Year III: Semester I
        { code: 'BMBA3113', name: 'Introduction to Machine Learning for Data Analysis', classType: 'LAB' as const },
        { code: 'BMBA3123', name: 'Information Security and Fraud Analytics', classType: 'LAB' as const },
        { code: 'BMBA3133', name: 'Marketing Analytics', classType: 'LAB' as const },
        { code: 'BMBA3142', name: 'Applied Modeling for Management Decisions', classType: 'LAB' as const },
        { code: 'BMBA3153', name: 'Simulation for Complex Business Problems', classType: 'LAB' as const },
        { code: 'BMBA3163', name: 'Database Design', classType: 'LAB' as const },

        // Year III: Semester II
        { code: 'BMBA3213', name: 'Artificial Neural Network for Business Analytics', classType: 'LAB' as const },
        { code: 'BMBA3223', name: 'People Analytics', classType: 'LAB' as const },
        { code: 'BMBA3232', name: 'Supply Chain Analytics', classType: 'LAB' as const },
        { code: 'BMBA3243', name: 'Decision Support Systems', classType: 'LAB' as const },
        { code: 'BMBA3253', name: 'Artificial Intelligence', classType: 'LAB' as const },
        { code: 'BMBA3263', name: 'Data Mining and Data Warehousing', classType: 'LAB' as const },

        // Year IV: Semester I
        { code: 'BMBA4113', name: 'Business Strategy', classType: 'LECTURE' as const },
        { code: 'BMBA4123', name: 'Strategic Information Systems', classType: 'LECTURE' as const },
        { code: 'BMBA4133', name: 'Research Methodology', classType: 'LECTURE' as const },
        { code: 'BMBA4143', name: 'Introduction to Blockchain Technology', classType: 'LAB' as const },
        { code: 'BMBA4153', name: 'Social Media Strategy', classType: 'LECTURE' as const },
        { code: 'BMBA4163', name: 'Forensic Data Analytics', classType: 'LAB' as const },

        // Year IV: Semester II
        { code: 'BMBA4214', name: 'Business Analytics Internship', classType: 'TUTORIAL' as const },
        { code: 'BMBA4226', name: 'Dissertation', classType: 'TUTORIAL' as const },

        // Electives
        { code: 'BMBA4232', name: 'Advance Business Intelligence', classType: 'LAB' as const },
        { code: 'BMBA4242', name: 'Business Strategic Analysis', classType: 'LECTURE' as const },
        { code: 'BMBA4252', name: 'Business Metrics for Data Driven Companies', classType: 'LAB' as const },
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
    console.log(`\n🎉 Done! Total Business Analytics subjects: ${subjects.length}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
