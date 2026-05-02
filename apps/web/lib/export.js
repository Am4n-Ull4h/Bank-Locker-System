import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function getNestedValue(row, key) {
  if (!key || !String(key).includes('.')) return row?.[key];
  return String(key).split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), row);
}

export function exportToExcel(data, fileName, columns) {
  const formattedData = data.map((row) => {
    const newRow = {};
    columns.forEach((col) => {
      const value = col.render ? col.render(getNestedValue(row, col.key), row) : getNestedValue(row, col.key);
      newRow[col.label] = value && typeof value === 'object' ? String(value) : value;
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToPDF(data, fileName, columns, title = '') {
  const doc = new jsPDF('l', 'mm', 'a4');
  
  if (title) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });
  }

  const tableColumns = columns.filter((col) => col.key !== 'actions' && col.key !== 'action');
  const tableData = data.map((row) =>
    tableColumns.map((col) => {
      const value = getNestedValue(row, col.key);
      if (!value) return '—';
      if (typeof value === 'object') return JSON.stringify(value).substring(0, 30);
      return String(value).substring(0, 50);
    })
  );

  doc.autoTable({
    startY: title ? 25 : 10,
    head: [tableColumns.map((col) => col.label)],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 58, 109],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8, textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [240, 245, 250] },
    margin: { top: title ? 25 : 10, left: 10, right: 10 },
    didDrawPage: (data) => {
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      const pageWidth = pageSize.getWidth();
      
      doc.setFontSize(8);
      doc.text(`Page ${doc.internal.getPages().length}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    },
  });

  doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
}
