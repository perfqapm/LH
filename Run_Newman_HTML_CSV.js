const newman = require('newman');
const yargs = require('yargs');

let assertionErrorCount = 0;
let assertionOkCount = 0;
let statusNotOkCount = 0;
let statusOkCount = 0;

let params = yargs.argv;

let sCollectionURL;
let iCount;
let sEnvironmentJson;
let iRequestTimeout;
let gitUrl;
let gitRunid;
let inputDataFilePath;

try {
    console.log(process.argv);
    sCollectionURL = params.curl;
    iCount = parseInt(params.icnt) || 1;
    sEnvironmentJson = params.ejson;
    iRequestTimeout = parseInt(params.timeout);
    gitUrl = params.gurl;
    gitRunid = params.grunid;
    inputDataFilePath = params.input;
    
    console.log('Iteration count: ' + iCount);
    console.log('Environment JSON: ' + sEnvironmentJson);
    console.log('Collection URL: ' + sCollectionURL);
    
} catch (error) {
    console.log('Error reading the git action variables:' + error.message);
}

async function runNewman() {
    // call newman.run to pass `options` object and wait for callback
    newman.run({
        collection: sCollectionURL,
        reporters: ['htmlextra', 'csv'],  // cli, json, junit, progress and emojitrain
        iterationCount: iCount,
        iterationData: inputDataFilePath,
        environment: sEnvironmentJson,
        timeoutRequest: iRequestTimeout,
        reporter: {
            htmlextra: {
                browserTitle: "Execution report",
                title: "API/WebService Execution Report",
                timezone: "Asia/Kolkata",
                //displayProgressBar: true
            },
            csv: {
                browserTitle: "Execution report",
                title: "API/WebService Execution Report",
                timezone: "Asia/Kolkata",
                //displayProgressBar: true
            }
        }
    }).on('start', function (err, args) { // on start of run, log to console
        console.log('------- Start collection run...');    
    }).on('assertion', (error, summary) => {
        if (error || summary.error) {
            assertionErrorCount++;
            requestName = summary.item.name;
        } else {
            assertionOkCount++; //count for successful Assertions
        }
    }).on('request', function (err, args) {
        if (err) {
          console.error(err);
       
          return;
        }
        if(args.response.code > 299){
            statusNotOkCount++;
        } else {
            statusOkCount++; //count for successful status codes
        }
        // Log request details
        console.log(`Request: ${args.request.method} ${args.request.url} ${args.response.code}`);
    }).on('done', function (err, summary) {
        if (err || summary.error) {
            console.error('collection run encountered an error.');
            throw err;
        }
        else {
            console.log('------- Collection run completed! --------');
            console.log('No of assert failed: '+ assertionErrorCount);
    }

    // get totalAPIsCount in the collection
    const totalRequestCount = summary.run.stats.requests.total;
    console.log(`Number of requests during execution: ${totalRequestCount}`);
    let totalAPIsCount = parseInt(totalRequestCount) / parseInt(iCount);

const fs = require('fs');

// Read the existing .env file
const envFilePath = '.env';
const envFileContent = fs.readFileSync(envFilePath, 'utf8');

// Define the dynamic variable and its value
const dynamicVariableName = 'assertionErrorCount';
const dynamicVariableValue = assertionErrorCount;
const dynamicVariableName1 = 'statusNotOkCount';
const dynamicVariableValue1 = statusNotOkCount;
const dynamicVariableName2 = 'assertionOkCount';
const dynamicVariableValue2 = assertionOkCount; 
const dynamicVariableName3 = 'statusOkCount';
const dynamicVariableValue3 = statusOkCount;
const dynamicVariableName4 = 'iterationCount';
const dynamicVariableValue4 = iCount;
const dynamicVariableName5 = 'totalAPIsCount';
const dynamicVariableValue5 = totalAPIsCount;

// Create or update the dynamic variable in the .env file content
let updatedEnvFileContent = '';
if (envFileContent.includes(dynamicVariableName) || envFileContent.includes(dynamicVariableName1) || envFileContent.includes(dynamicVariableName2) || envFileContent.includes(dynamicVariableName3) || envFileContent.includes(dynamicVariableName4) || envFileContent.includes(dynamicVariableName5)) {
  // If the variable already exists, update its value
  const regex = new RegExp(`${dynamicVariableName}=.*\n${dynamicVariableName1}=.*\n${dynamicVariableName2}=.*\n${dynamicVariableName3}=.*\n${dynamicVariableName4}=.*\n${dynamicVariableName5}=.*`);
  updatedEnvFileContent = envFileContent.replace(regex, `${dynamicVariableName}=${dynamicVariableValue}\n${dynamicVariableName1}=${dynamicVariableValue1}\n${dynamicVariableName2}=${dynamicVariableValue2}\n${dynamicVariableName3}=${dynamicVariableValue3}\n${dynamicVariableName4}=${dynamicVariableValue4}\n${dynamicVariableName5}=${dynamicVariableValue5}`);
} else {
  // If the variable does not exist, append it to the content
  updatedEnvFileContent = `${envFileContent}\n${dynamicVariableName}=${dynamicVariableValue}\n${dynamicVariableName1}=${dynamicVariableValue1}\n${dynamicVariableName2}=${dynamicVariableValue2}\n${dynamicVariableName3}=${dynamicVariableValue3}\n${dynamicVariableName4}=${dynamicVariableValue4}\n${dynamicVariableName5}=${dynamicVariableValue5}`;
}

// Write the updated .env file content
fs.writeFileSync(envFilePath, updatedEnvFileContent);
        
          });
} //runNewman

runNewman();
