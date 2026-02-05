import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import type { Booking, ServiceHistory, Vehicle } from '@/types';

export interface PDFReportData {
  booking: Booking;
  vehicle: Vehicle;
  serviceHistory: ServiceHistory;
  clientName: string;
}

export const generateServiceReport = async (data: PDFReportData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fillColor('#40E0FF')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('BESPOKE CAR PRESERVATION', { align: 'center' });

      doc
        .fillColor('#E6E8EE')
        .fontSize(14)
        .font('Helvetica')
        .text('Digital Service Report', { align: 'center' })
        .moveDown(2);

      // Report Info Bar
      doc
        .fillColor('#2B2F36')
        .rect(50, doc.y, 495, 60)
        .fill();

      doc
        .fillColor('#E6E8EE')
        .fontSize(10)
        .font('Helvetica')
        .text('Service Date', 60, doc.y - 50)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(new Date(data.serviceHistory.completed_at || '').toLocaleDateString('en-ZA'), 60, doc.y + 5);

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Report ID', 200, doc.y - 27)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(data.booking.id.substring(0, 8).toUpperCase(), 200, doc.y + 5);

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('Technician', 340, doc.y - 27)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Certified Specialist', 340, doc.y + 5);

      doc.moveDown(3);

      // Vehicle Information
      doc
        .fillColor('#40E0FF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('VEHICLE INFORMATION')
        .moveDown(0.5);

      doc
        .fillColor('#E6E8EE')
        .fontSize(11)
        .font('Helvetica')
        .text(`Make & Model: ${data.vehicle.brand} ${data.vehicle.model}`, { continued: true })
        .text(`     License Plate: ${data.vehicle.license_plate}`)
        .text(`Year: ${data.vehicle.year || 'N/A'}`, { continued: true })
        .text(`     Color: ${data.vehicle.color || 'N/A'}`)
        .text(`Category: ${data.vehicle.size_category.toUpperCase()}`)
        .moveDown(1.5);

      // Service Details
      doc
        .fillColor('#40E0FF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('SERVICE PERFORMED')
        .moveDown(0.5);

      doc
        .fillColor('#E6E8EE')
        .fontSize(11)
        .font('Helvetica')
        .text(`Service Type: ${data.booking.service_type.replace('_', ' ').toUpperCase()}`)
        .text(`Location: ${data.booking.address}, ${data.booking.suburb}`)
        .moveDown(0.5);

      // Treatments Applied
      if (data.serviceHistory.treatments_applied && data.serviceHistory.treatments_applied.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('Treatments Applied:').moveDown(0.3);

        data.serviceHistory.treatments_applied.forEach((treatment) => {
          doc
            .fillColor('#40E0FF')
            .fontSize(10)
            .text('•', { continued: true })
            .fillColor('#E6E8EE')
            .text(` ${treatment}`);
        });
        doc.moveDown(1);
      }

      // Paint Condition Assessment
      doc
        .fillColor('#40E0FF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('CONDITION ASSESSMENT')
        .moveDown(0.5);

      const conditionColor =
        data.serviceHistory.paint_condition === 'excellent'
          ? '#00FF00'
          : data.serviceHistory.paint_condition === 'good'
          ? '#40E0FF'
          : data.serviceHistory.paint_condition === 'fair'
          ? '#FFA500'
          : '#FF0000';

      doc
        .fillColor('#E6E8EE')
        .fontSize(11)
        .font('Helvetica')
        .text('Paint Condition: ', { continued: true })
        .fillColor(conditionColor)
        .font('Helvetica-Bold')
        .text(data.serviceHistory.paint_condition.toUpperCase());

      doc
        .fillColor('#E6E8EE')
        .font('Helvetica')
        .text(`Swirl Marks: ${data.serviceHistory.swirl_marks_detected ? 'Detected' : 'None Detected'}`)
        .text(`Scratches: ${data.serviceHistory.scratches_detected ? 'Detected' : 'None Detected'}`)
        .moveDown(1);

      // Technician Notes
      if (data.serviceHistory.technician_notes) {
        doc
          .fillColor('#40E0FF')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Technician Observations:')
          .moveDown(0.3);

        doc
          .fillColor('#E6E8EE')
          .fontSize(10)
          .font('Helvetica')
          .text(data.serviceHistory.technician_notes, {
            width: 495,
            align: 'justify',
          })
          .moveDown(1.5);
      }

      // Photo Documentation
      doc
        .fillColor('#40E0FF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('PHOTO DOCUMENTATION')
        .moveDown(0.5);

      doc
        .fillColor('#E6E8EE')
        .fontSize(10)
        .font('Helvetica')
        .text(`Before Photos: ${data.serviceHistory.before_photos?.length || 0} images captured`)
        .text(`After Photos: ${data.serviceHistory.after_photos?.length || 0} images captured`)
        .text('High-resolution photos available in your digital portal.')
        .moveDown(2);

      // QR Code for digital access
      const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/portal/booking/${data.booking.id}`;

      QRCode.toDataURL(portalUrl, { width: 150, margin: 1 })
        .then((qrDataUrl) => {
          doc.image(qrDataUrl, 50, doc.y, { width: 100 });

          doc
            .fillColor('#E6E8EE')
            .fontSize(9)
            .font('Helvetica')
            .text('Scan to view photos', 160, doc.y - 95)
            .text('and full service history', 160, doc.y)
            .text('in your digital portal', 160, doc.y);

          doc.moveDown(6);

          // Protection Recommendations
          doc
            .fillColor('#2B2F36')
            .rect(50, doc.y, 495, 80)
            .fill();

          doc
            .fillColor('#40E0FF')
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('NEXT SERVICE RECOMMENDATION', 60, doc.y - 70);

          doc
            .fillColor('#E6E8EE')
            .fontSize(10)
            .font('Helvetica')
            .text('Your polymer protection will maintain optimal performance for 21 days.', 60, doc.y + 5)
            .text('We recommend booking your next service within 3 weeks for continued protection.', 60, doc.y);

          // Footer
          doc
            .moveDown(2)
            .fillColor('#E6E8EE')
            .fontSize(8)
            .font('Helvetica')
            .text('Bespoke Car Preservation | www.bespokepreservation.co.za | info@bespokepreservation.co.za', {
              align: 'center',
            })
            .text('This is a digital-first service report. All photos and history available online.', {
              align: 'center',
            });

          doc.end();
        })
        .catch((error) => {
          console.error('QR code generation error:', error);
          doc.end();
        });
    } catch (error) {
      reject(error);
    }
  });
};
