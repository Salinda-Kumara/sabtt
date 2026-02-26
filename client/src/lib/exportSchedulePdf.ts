import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ScheduleEntry, DayOfWeek } from '@/types/database';

const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
    MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday',
    FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

const DAYS_ORDER: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function getDayOfWeekFromDate(date: Date): DayOfWeek {
    const jsDay = date.getDay();
    return DAYS_ORDER[jsDay === 0 ? 6 : jsDay - 1];
}

function formatDateForFilename(date: Date): string {
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${day}${suffix} ${month} ${year} - ${dayOfWeek}`;
}

interface ExportOptions {
    schedules: ScheduleEntry[];
    universityName: string;
    mode: 'day' | 'week';
    selectedDay?: DayOfWeek;
    date?: Date;
}

export function exportSchedulePdf({ schedules, universityName, mode, selectedDay, date }: ExportOptions) {
    const exportDate = date || new Date();
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ---- Header ----
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(universityName, 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Timetable Schedule', 14, 18);

    // Date on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const dateStr = formatDateForFilename(exportDate);
    doc.text(dateStr, pageWidth - 14, 12, { align: 'right' });

    if (mode === 'day') {
        exportDayView(doc, schedules, selectedDay || getDayOfWeekFromDate(exportDate));
    } else {
        exportWeekView(doc, schedules);
    }

    // ---- Footer ----
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, pageHeight - 6);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 6, { align: 'right' });
    }

    // ---- Save ----
    const filename = mode === 'day'
        ? `${formatDateForFilename(exportDate)}.pdf`
        : `Weekly Timetable.pdf`;
    doc.save(filename);
}

function exportDayView(doc: jsPDF, schedules: ScheduleEntry[], day: DayOfWeek) {
    const daySchedules = schedules
        .filter(s => s.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Group by room
    const roomMap = new Map<string, ScheduleEntry[]>();
    for (const s of daySchedules) {
        const key = s.room.name;
        if (!roomMap.has(key)) roomMap.set(key, []);
        roomMap.get(key)!.push(s);
    }

    // Day title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`${DAY_FULL_LABELS[day]} Schedule`, 14, 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${daySchedules.length} classes scheduled`, 14, 35);

    // Build table with exact columns: Batch | Time Slot | Subject Code | Subject | Lecturer Name | Week Number | Session Mode | Location
    const tableData = daySchedules.map(s => [
        s.batch || '-',
        `${s.startTime} - ${s.endTime}`,
        s.course.code,
        s.course.name,
        s.lecturer.name,
        s.weekNumber?.toString() || '1',
        s.sessionMode ? s.sessionMode.charAt(0) + s.sessionMode.slice(1).toLowerCase() : 'Physical',
        `${s.room.name}\n${s.room.building?.name || ''}`,
    ]);

    autoTable(doc, {
        startY: 39,
        head: [['Batch', 'Time Slot', 'Subject\nCode', 'Subject', 'Lecturer\nName', 'Week\nNumber', 'Session\nMode', 'Location']],
        body: tableData,
        theme: 'grid',
        styles: {
            fontSize: 8.5,
            cellPadding: 3,
            lineColor: [226, 232, 240],
            lineWidth: 0.3,
            textColor: [30, 41, 59],
        },
        headStyles: {
            fillColor: [51, 65, 85],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8.5,
            halign: 'center',
            valign: 'middle',
        },
        columnStyles: {
            0: { cellWidth: 25, halign: 'center' },
            1: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
            2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 50 },
            4: { cellWidth: 40 },
            5: { cellWidth: 18, halign: 'center' },
            6: { cellWidth: 25, halign: 'center' },
            7: { cellWidth: 35, halign: 'center' },
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
            // Color-code session mode
            if (data.section === 'body' && data.column.index === 6) {
                const mode = (data.cell.raw as string).toUpperCase();
                if (mode === 'PHYSICAL') data.cell.styles.textColor = [22, 163, 74];
                else if (mode === 'ONLINE') data.cell.styles.textColor = [37, 99, 235];
                else if (mode === 'HYBRID') data.cell.styles.textColor = [147, 51, 234];
                data.cell.styles.fontStyle = 'bold';
            }
        },
    });

    // Summary by room
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    if (finalY + 30 < doc.internal.pageSize.getHeight()) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text('Room Summary', 14, finalY + 10);

        const roomSummary = Array.from(roomMap.entries()).map(([room, entries]) => [
            room,
            entries.length.toString(),
            entries.map(e => e.course.code).join(', '),
        ]);

        autoTable(doc, {
            startY: finalY + 14,
            head: [['Room', 'Classes', 'Courses']],
            body: roomSummary,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2.5,
                lineColor: [226, 232, 240],
                lineWidth: 0.3,
                textColor: [30, 41, 59],
            },
            headStyles: {
                fillColor: [71, 85, 105],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
            },
            margin: { left: 14, right: 14 },
        });
    }
}

function exportWeekView(doc: jsPDF, schedules: ScheduleEntry[]) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Weekly Schedule', 14, 30);

    // Build a time-slot grid: rows = unique time slots, cols = days
    const timeSlots = [...new Set(schedules.map(s => `${s.startTime}-${s.endTime}`))].sort();

    const tableHead = ['Time', ...DAYS_ORDER.map(d => DAY_FULL_LABELS[d].slice(0, 3))];

    const tableData = timeSlots.map(slot => {
        const [start, end] = slot.split('-');
        const row: string[] = [`${start}\n${end}`];
        for (const day of DAYS_ORDER) {
            const entries = schedules.filter(s => s.dayOfWeek === day && s.startTime === start && s.endTime === end);
            if (entries.length > 0) {
                row.push(entries.map(e => `${e.course.code}\n${e.room.name}\n${e.lecturer.name.split(' ').pop()}`).join('\n---\n'));
            } else {
                row.push('');
            }
        }
        return row;
    });

    autoTable(doc, {
        startY: 34,
        head: [tableHead],
        body: tableData,
        theme: 'grid',
        styles: {
            fontSize: 7,
            cellPadding: 2,
            lineColor: [226, 232, 240],
            lineWidth: 0.3,
            textColor: [30, 41, 59],
            valign: 'middle',
        },
        headStyles: {
            fillColor: [51, 65, 85],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'center',
        },
        columnStyles: {
            0: { cellWidth: 22, halign: 'center', fontStyle: 'bold', fontSize: 7 },
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14 },
    });
}
