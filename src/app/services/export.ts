import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToExcel(data: any[], filename: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // Adjust column widths
    const maxWidth = data.reduce((w, r) => Math.max(w, JSON.stringify(r).length), 10);
    worksheet['!cols'] = [
      { wch: 30 }, // Nombre
      { wch: 15 }, // Precio
      { wch: 12 }, // Cantidad
      { wch: 15 }, // Valor alerta
      { wch: 18 }, // Fecha vencimiento
      { wch: 15 }  // Disponibilidad
    ];

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  exportToPDF(data: any[], filename: string): void {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Inventario de Medicamentos', 14, 20);

    // Date
    doc.setFontSize(11);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 28);

    // Table
    const tableData = data.map(item => [
      item.nombre,
      item.precio,
      item.cantidad,
      item.valorAlerta,
      item.fechaVencimiento,
      item.disponibilidad
    ]);

    autoTable(doc, {
      head: [['Nombre', 'Precio', 'Cantidad', 'Valor Alerta', 'Vencimiento', 'Estado']],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });

    doc.save(`${filename}.pdf`);
  }
}
