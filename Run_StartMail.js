const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

const performanceScore = process.env.performanceScore;
const firstContentfulPaint = process.env.firstContentfulPaint;

const emailAddress = 'lokeshwar.reddy@robosoftin.com';

try {
    // Removing all spaces
    let temp = emailAddress.replace(/\s/g, '');

    // Splitting emails if multiple exist
    if (temp.includes(',')) {
        emailAddress = temp.split(',');
    } else {
        emailAddress = [temp]; // Ensure it's always an array
    }

    console.log(emailAddress);
} catch (error) {
    console.error("Error processing emails:", error.message);
}

async function sendEmail(performanceScore,firstContentfulPaint,attachmentPaths) {
  try {
    // Create a transporter using Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ramsnotification@gmail.com', // Set this in .env
        pass: 'uwyvhdauoxuabayb' // Set this in .env
      }
    });

    const html = `
      <h1>APPNAME Web UI Performance Light House Report</h1>
      <h2 style="color: #6082B6;">Web Performance Score: ${performanceScore}</h2>
      <h2 style="color: #6082B6;">First Contentful Paint: ${firstContentfulPaint}</h2>
    `;

    const info = await transporter.sendMail({
      from: `Performance Monitoring>`,
      to: emailAddress,
      subject: 'APPNAME Lighthouse Report',
      html: html,
      attachments: attachmentPaths.map((path) => ({ path }))
    });

    console.log('Email sent: ' + info.response);
    console.log('Email accepted: ', info.accepted);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}


module.exports = sendEmail;
