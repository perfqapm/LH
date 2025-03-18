const sendEmail = require('./Run_StartMail.js');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './.env' });

const performanceScore = process.env.performanceScore;
const firstContentfulPaint = process.env.firstContentfulPaint;

// Gather the variable values
const Failures = performanceScore;
const Failures1 = firstContentfulPaint;


const attachmentPaths = ['reports/lighthouse-report.html'];


// Call the sendEmail function with the variable values
sendEmail(Failures, Failures1, attachmentPaths);
