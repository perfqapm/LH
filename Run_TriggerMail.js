const sendEmail = require('./Run_StartMail_HTML_CSV.js');
require('dotenv').config({path: './1.env'}); 
assertionErrorCount = process.env.assertionErrorCount;
assertionOkCount = process.env.assertionOkCount;
statusNotOkCount = process.env.statusNotOkCount;
statusOkCount = process.env.statusOkCount;
iterationCount = process.env.iterationCount;
const totalAPIsCount = process.env.totalAPIsCount;

// Gather the variable values
const Failures = assertionErrorCount;
const Failures1 = statusNotOkCount;
const Failures2 = assertionOkCount;
const Failures3 = statusOkCount;


const attachmentPaths = ['newman/HTMLReport.html', 'newman/CSVReport.csv'];


// Call the sendEmail function with the variable values
sendEmail(Failures, Failures1, Failures2, Failures3, attachmentPaths);
