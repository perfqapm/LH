    const nodemailer = require('nodemailer');
    const fs = require('fs');
    const csvParser = require('csv-parser');
    const moment = require('moment-timezone');
    require('dotenv').config({ path: './.env' });
    const assertionErrorCount = parseInt(process.env.assertionErrorCount);
    const assertionOkCount = parseInt(process.env.assertionOkCount);
    const statusNotOkCount = parseInt(process.env.statusNotOkCount);
    const statusOkCount = parseInt(process.env.statusOkCount);
    const iterationCount = parseInt(process.env.iterationCount);
    const totalAPIsCount = parseInt(process.env.totalAPIsCount);
    const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
    const zlib = require('zlib'); // Import the zlib module for compression

    let totalAssertions = parseInt(assertionErrorCount) + parseInt(assertionOkCount);
    let totalRequestCount = parseInt(statusNotOkCount) + parseInt(statusOkCount);

    const yargs = require('yargs');
    let params = yargs.argv;

    let emailAddress;
    let gmailPassword;

    try {
      // if more than one email ids are there, split
      let temp = params.emails.replace(' ', '');
      if (temp.includes(',')) {
        emailAddress = temp.split(',');
      } else {
        emailAddress = temp;
      }

      console.log('Email Ids: ' + emailAddress);

    } catch (error) {
      console.log('Error reading the git action variables:' + error.message);
    }

    // Helper function to generate a CSS class based on sort key
    function getSortClass(sortKey, header) {
      return sortKey === header ? 'sorted-column' : '';
    }

    // Function to compress a file
    function compressFile(inputFilePath, outputFilePath) {
      return new Promise((resolve, reject) => {
        const gzip = zlib.createGzip();
        const inputStream = fs.createReadStream(inputFilePath);
        const outputStream = fs.createWriteStream(outputFilePath + '.gz');

        inputStream.pipe(gzip).pipe(outputStream);

        outputStream.on('finish', () => {
          resolve(outputFilePath + '.gz');
        });

        outputStream.on('error', (error) => {
          reject(error);
        });
      });
    }

async function generatePieCharts(statusOkCount, statusNotOkCount, assertionOkCount, assertionErrorCount, responseTimes) {
  const width = 300;
  const height = 300;
  const chartCallback = (ChartJS) => {
    if (ChartJS.defaults) {
      if (!ChartJS.defaults.global) {
        ChartJS.defaults.global = {};
      }
      ChartJS.defaults.global.responsive = true;
      ChartJS.defaults.global.maintainAspectRatio = false;
    }
  };
  const canvas = new ChartJSNodeCanvas({ width, height, chartCallback });

// Generating pie chart for Status Counts
const statusChartConfiguration = {
  type: 'pie', // Type of chart - in this case, a pie chart
  data: {
    labels: [`Failed (${statusNotOkCount})`, `Passed (${statusOkCount})`], // Labels for each segment of the pie chart
    datasets: [{
      data: [statusNotOkCount, statusOkCount], // Data values corresponding to each segment
      backgroundColor: ['#FF0000', '#00FF00'] // Background color for each segment
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Response Code Validation', // Title or heading for the pie chart
        padding: {
          top: 10,
          bottom: 30
        },
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    legend: {
      display: true,
      position: 'bottom'
    },
    responsive: false, // Option to make the chart responsive or not
    maintainAspectRatio: false // Option to maintain aspect ratio when resizing
  }
};

// Generating pie chart for Assertion Counts
const assertionChartConfiguration = {
  type: 'pie',
  data: {
    labels: [`Assertion Failed (${assertionErrorCount})`, `Assertion Passed (${assertionOkCount})`],
    datasets: [{
      data: [assertionErrorCount, assertionOkCount],
      backgroundColor: ['#FF0000', '#00FF00']
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Assertion Validation', // Title or heading for the pie chart
        padding: {
          top: 10,
          bottom: 30
        },
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  }
};

  // Generating pie chart for Response Times
// Pre-calculate API counts for each response time category
const apiCounts = [0, 0, 0];
for (const time of responseTimes) {
  if (time < 200) {
    apiCounts[0]++;
  } else if (time >= 200 && time <= 500) {
    apiCounts[1]++;
  } else {
    apiCounts[2]++;
  }
}

// Generate labels with API counts for the pie chart
const responseTimeLabels = [
  `<200ms (${apiCounts[0]})`,
  `200-500ms (${apiCounts[1]})`,
  `>500ms (${apiCounts[2]})`
];

const responseTimeChartConfiguration = {
  type: 'pie',
  data: {
    labels: responseTimeLabels,
    datasets: [{
      data: apiCounts, // Use pre-calculated API counts here
      backgroundColor: ['#00FF00', '#FFA500', '#FF0000']
    }]
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Response Time Distribution', // Title or heading for the pie chart
        padding: {
          top: 10,
          bottom: 30
        },
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: 'bottom'
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          const value = data.datasets[0].data[tooltipItem.index];
          const percentage = Math.round(value / data.datasets[0].data.reduce((acc, cur) => acc + cur) * 100);

          return `${data.labels[tooltipItem.index]}: ${value} APIs (${percentage}%)`;
        }
      }
    }
  }
};

  const statusChartBuffer = await canvas.renderToBuffer(statusChartConfiguration);
  const assertionChartBuffer = await canvas.renderToBuffer(assertionChartConfiguration);
  const responseTimeChartBuffer = await canvas.renderToBuffer(responseTimeChartConfiguration);

  return { statusChartBuffer, assertionChartBuffer, responseTimeChartBuffer };
}


    async function sendEmail(assertionErrorCount, statusNotOkCount, assertionOkCount, statusOkCount, attachmentPaths) {
      try {
        // Set your desired timezone
        const timezone = 'Asia/Kolkata';

        // Get the current time in the specified timezone
        const timestamp = moment().tz(timezone).format('MMMM Do YYYY, h:mm a');

        const transporter = nodemailer.createTransport({
          service: 'gmail', // e.g., 'Gmail'
          auth: {
            user: 'ramsnotification@gmail.com',
            pass: 'uwyvhdauoxuabayb',
          },
        });

    // Read and compress the attachments
       const compressedAttachmentPaths = [];
       for (const path of attachmentPaths) {
       const compressedPath = await compressFile(path, path);
       compressedAttachmentPaths.push(compressedPath);
       }

        // Read the CSV file and extracting insights
        const csvData = [];
        fs.createReadStream('newman/CSVReport.csv')
          .pipe(csvParser())
          .on('data', (row) => {
            csvData.push(row);
          })
          .on('end', async () => {
            const headers = Object.keys(csvData[0]);

        // Extract response times from CSV data
        const responseTimes = csvData.map(row => parseInt(row['responseTime']));

        // Sort the CSV data by "response time" in descending order
        const sortedByResponseTime = csvData.slice(0).sort((a, b) => b['responseTime'] - a['responseTime']);
        const top10ByResponseTime = sortedByResponseTime.slice(0, 10);

        // Sort the CSV data by "code" in descending order and then by "failedCount" in descending order
        const sortedByCode = csvData.slice(0).sort((a, b) => {
          if (a['code'] !== b['code']) {
            return b['code'] - a['code']; // Sort by "code" in descending order
          } else {
            return b['failedCount'] - a['failedCount']; // If codes are equal, sort by "failedCount" in descending order
          }
          });
          const top10ByCode = sortedByCode.slice(0, 10);

// Generate HTML table for top 10 rows by "response time" with special background color for failedCount > 0
let htmlTableResponseTime = '<h4 style="color: #6082B6;">Top Response Time:</h4>';
htmlTableResponseTime += '<table border="1" style="border-collapse: collapse; width: 100%; text-align: center; background-color: #F0F8FF;">'; // Lighter background color for the entire table
htmlTableResponseTime += '<tr style="background-color: #B0C4DE;">';
for (const header of headers) {
  htmlTableResponseTime += `<th style="padding: 8px; font-weight: bold; color: #6082B6;">${header}</th>`;
}
htmlTableResponseTime += '</tr>';
for (const row of top10ByResponseTime) {
  htmlTableResponseTime += '<tr style="background-color: #ADD8E6;">';
  for (const key in row) {
    const sortClass = getSortClass('responseTime', key); // Check if this column is sorted
    let cellStyle = 'color: #6082B6;'; // Default text color

    if (key === 'responseTime') {
      // Determine the background color based on the response time value
      if (row[key] >= 500) {
        cellStyle += 'background-color: #FF0000; font-weight: bold;'; // Red for response time >= 500 ms
      } else if (row[key] >= 200) {
        cellStyle += 'background-color: #FFA500;'; // Orange for response time >= 200 ms
      } else {
        cellStyle += 'background-color: #00FF00;'; // Green for response time < 200 ms
      }
    }

    // Applying color to the value of 'failedCount' based on conditions
    if (key === 'failedCount' && row[key] > 0) {
      cellStyle += 'color: #FF0000; font-weight: bold;'; // Red for failedCount > 0
    }

    // Applying color to the value of 'code' column if value greater than 0
    if (key === 'code' && row[key] > 300) {
      cellStyle += 'color: #FF0000; font-weight: bold;'; // Red for code > 300
    }

    // Apply the CSS class and inline style to the cell
    htmlTableResponseTime += `<td class="${sortClass}" style="padding: 8px; font-weight: ${sortClass ? 'bold' : 'normal'}; ${cellStyle}">${row[key]}</td>`;
  }
  htmlTableResponseTime += '</tr>';
}
htmlTableResponseTime += '</table>';

// Generate HTML table for rows where either code > 300 or failedCount > 0
let htmlTableCode = '<h4 style="color: #6082B6;">Top Response Codes:</h4>';
htmlTableCode += '<table border="1" style="border-collapse: collapse; width: 100%; text-align: center; background-color: #F0F8FF;">'; // Lighter background color for the entire table
htmlTableCode += '<tr style="background-color: #B0C4DE;">';
for (const header of headers) {
  const sortClass = getSortClass('code', header); // Check if this column is sorted
  const failedCountSortClass = header === 'failedCount' ? 'sorted-column' : ''; // Add custom class to "failedCount" header
  htmlTableCode += `<th class="${sortClass} ${failedCountSortClass}" style="padding: 8px; font-weight: bold; color: #6082B6;">${header}</th>`;
}
htmlTableCode += '</tr>';

for (const row of top10ByCode) {
  // Check if either code > 300 or failedCount > 0 for the current row
  if (row.code > 300 || row.failedCount > 0) {
    htmlTableCode += '<tr style="background-color: #ADD8E6;">';
    for (const key in row) {
      const sortClass = getSortClass('code', key); // Check if this column is sorted
      let cellStyle = 'color: #6082B6;'; // Default text color

      if (key === 'code' && row[key] > 300) {
        // Determine the background color based on the "code" value
        cellStyle += 'background-color: #FF0000; font-weight: bold;'; // Red for code > 300
      } else if (key === 'failedCount' && row[key] > 0) {
        // Determine the background color based on the "failedCount" value
        cellStyle = 'background-color: #FFA500; color: #FF0000; font-weight: bold;'; // Amber background and red text for failedCount > 0
      }

      // Apply the CSS class and inline style to the cell
      htmlTableCode += `<td class="${sortClass}" style="padding: 8px; font-weight: ${sortClass ? 'bold' : 'normal'}; ${cellStyle}">${row[key]}</td>`;
    }
    htmlTableCode += '</tr>';
  }
}

htmlTableCode += '</table>';


            // Adding initial HTML content
            const AdditionalhtmlContent = `
              <h2 style="color: #6082B6;">API/WebServices Monitoring Solution Run Details!</h2>
              <h4 style="color: #6082B6;">Total Requests in the Collection : ${totalAPIsCount}</h4>
              <h4 style="color: #6082B6;">Total Assertions in the Collection : ${totalAssertions}</h4>
              <h4 style="color: #6082B6;">No. of Iterations executed : ${iterationCount}</h4>
              <br> <!-- Add a line break for space -->
              <img src="cid:statusPieChart@rams.com" alt="Pie Chart" /> <!-- Embedding pie chart image -->
              <img src="cid:assertionPieChart@rams.com" alt="Pie Chart" /> <!-- Embedding pie chart image -->
              <img src="cid:responseTimePieChart@rams.com" alt="Response Time Pie Chart" /> <!-- Embedding response time pie chart image -->
            `;

            // Generate pie charts with response times
            const { statusChartBuffer, assertionChartBuffer, responseTimeChartBuffer } = await generatePieCharts(statusOkCount, statusNotOkCount, assertionOkCount, assertionErrorCount, responseTimes);

            const mailOptions = {
              from: 'ramsnotification@gmail.com',
              to: emailAddress,
              subject: '[API/WebServices Monitoring Solution] Run Status ! ' + timestamp,
              html: `<html><body>${AdditionalhtmlContent}${htmlTableResponseTime}${htmlTableCode}</body></html>`,
              attachments: [
                  { filename: 'statusPieChart.png', content: statusChartBuffer, cid: 'statusPieChart@rams.com' },
                  { filename: 'assertionPieChart.png', content: assertionChartBuffer, cid: 'assertionPieChart@rams.com' },
                  { filename: 'responseTimePieChart.png', content: responseTimeChartBuffer, cid: 'responseTimePieChart@rams.com' },
                  ...compressedAttachmentPaths.map((path) => ({ path }))
                ]
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Error sending email:', error);
              } else {
                console.log('Email sent:', info.response);
              }
            });
          });
      } catch (error) {
        console.error('Error:', error);
      }
    }

    module.exports = sendEmail;