    const nodemailer = require('nodemailer');
    const fs = require('fs');
    require('dotenv').config({ path: './.env' });
    const performanceScore = process.env.performanceScore;

    let emailAddress;
    let gmailPassword;
emailAddress = 'lokeshwar.reddy@robosoftin.com';
console.log('Email Ids: ' + emailAddress);

async function mailFun(performanceScore) {
  // Create a transporter using Gmail SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ramsnotification@gmail.com',
      pass: 'uwyvhdauoxuabayb'
    }
  });

  const html = `
    <h1>Light House Report</h1>
    <h2>No. of Request with failed respone status: ${performanceScore}.</h2>
    `;

  const info = await transporter.sendMail({
    from: 'Monitoring Service <ramsnotification@gmail.com>',
    to: emailAddress,
    subject: 'Light House Report Run',
    //text: 'This is a test email sent from Node.js using Nodemailer',
    html: '<html><body>',
  })

  console.log('Email sent: ' + info.response);
  console.log('Email accepted: ' + info.accepted);

} // mailFun
