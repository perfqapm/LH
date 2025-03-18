const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

const performanceScore = process.env.performanceScore;
const firstContentfulPaint = process.env.firstContentfulPaint;

const emailAddress = 'lokeshwar.reddy@robosoftin.com';

console.log('Email Ids: ' + emailAddress);

async function mailFun(performanceScore,firstContentfulPaint) {
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
      <h1>Light House Report</h1>
      <h2>Web Performance Score: ${performanceScore}.</h2>
      <h2>First Contentful Paint: ${firstContentfulPaint}.</h2>
    `;

    const info = await transporter.sendMail({
      from: `Monitoring Service>`,
      to: emailAddress,
      subject: 'Lighthouse Report Run',
      html: html
    });

    console.log('Email sent: ' + info.response);
    console.log('Email accepted: ', info.accepted);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Call the function
mailFun(performanceScore,firstContentfulPaint);
