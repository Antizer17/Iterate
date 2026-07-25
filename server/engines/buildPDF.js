import PDFDocument from 'pdfkit';

const generateSolutionPDF = (material, activeQuizArray) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // PDF Header Style
    doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold').text('Iterate Prep // Official Solution Key', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#475569').font('Helvetica-Oblique').text(`Topic: ${material.topic}`);
    doc.moveDown(1.5);

    // Loop through questions to build structural text sheets
    activeQuizArray.forEach((q) => {
      const qNum = q.levelNumber || q.questionNumber;
      
      doc.fillColor('#0369a1').font('Helvetica-Bold').fontSize(12).text(`Concept Check #${qNum}`);
      doc.fillColor('#0f172a').font('Helvetica').fontSize(11).text(`${q.questionBody}`);
      doc.moveDown(0.5);

      // Print available choices
      q.options.forEach(opt => {
        doc.fillColor('#334155').fontSize(10).text(`  ${opt}`);
      });
      doc.moveDown(0.5);

      // Highlight the correct solution marker
      doc.fillColor('#15803d').font('Helvetica-Bold').fontSize(11).text(`Correct Answer: Option ${q.correctAnswer}`);
      doc.moveDown(0.3);
      
      // Print detailed design explanation
      doc.fillColor('#1e293b').font('Helvetica-Oblique').fontSize(10).text(`Explanation: ${q.solutionExplanation}`, {
        align: 'justify',
        lineGap: 2
      });
      
      doc.moveDown(2); // Spacing between questions
    });

    doc.end();
  });
};
export default generateSolutionPDF;