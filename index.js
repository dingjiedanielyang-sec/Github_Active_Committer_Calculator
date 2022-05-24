let parseArgs = require('minimist')

const githubAPI = require("./githubAPI");
const fileHandler = require("./middleware/fileHandler");

/**
 * @description: entry function
 */

async function run(){

  let startTime = new Date();
  console.log("Execution Started: "+startTime.toISOString());

  let args = parseArgs(process.argv.slice(2));

  let oneMonthAgo = new Date(); 
  oneMonthAgo.setDate(oneMonthAgo.getDate()-30);
  let orgName = args["orgName"] ||  process.env.orgName;           
  let sinceTime = args["sinceTime"] || oneMonthAgo.toISOString();   //Default is one month ago

  let githubAPIToken = args["githubAPIToken"] || process.env.GITHUBAPITOKEN;

  console.log(orgName+ " ---  "+sinceTime + "---" + githubAPIToken);

  let activeCommitterSet = await getTotalActiveCommitters(orgName, sinceTime, githubAPIToken);

  let commitorOutputDataCsvFormat = [];
  let commitorOutputColumnsCsvFormat = {
      Commitor_Name : 'Committer Name',
      Total_Number_Of_Commit: 'NO. Commits since '+sinceTime,
      Last_Commit_Time: 'Latest Commit Time'
  }

  let fileNameCommitterOuput = "Github_Active_Committer_Info_"+orgName+".csv";
  

  activeCommitterSet.forEach(function(value, key) {
    commitorOutputDataCsvFormat.push([key,value.total_commits,value.last_commit_date])
  });

  //Push the Data into a CSV file
  fileHandler.writeToCSVFile(fileNameCommitterOuput,commitorOutputColumnsCsvFormat,commitorOutputDataCsvFormat);
  console.log("Total Active Committer for the organziation "+activeCommitterSet.size)

  let endTime = new Date();
  console.log("Execution  Ended: "+  endTime.toISOString())
  let timeCost = endTime-startTime
  console.log("Total Execution Time is (in ms): "+ timeCost);

}

/**
 * 
 * @param {string} organization 
 * @param {string} sinceTime 
 * @param {string} githubAPIToken 
 * @returns A hashmap contains active committers in the given time range
 */

async function getTotalActiveCommitters(organization, sinceTime, githubAPIToken){
  let totalactiveCommitterMap = new Map();      
  let activeRepos = await githubAPI.fetchActiveGithubRepoLists(organization,sinceTime,githubAPIToken);
  console.log("Total Active Repos : "+activeRepos.length);
    
  for(let repo of activeRepos){
    let committerMap = await githubAPI.getCommitterFromRepo(organization,repo,sinceTime,githubAPIToken);
    console.log("Total NO. Active Commitor for repo "+repo + " is "+ committerMap.size + " since "+sinceTime);
    if(committerMap.size >=1) {
      committerMap.forEach(function(value, key) {
        if(totalactiveCommitterMap.has(key) == false){
          totalactiveCommitterMap.set(key,value);
        }
        else{ 
          //Aggregate the total committerss and compare the latest commit date
          let numberofCommitforCurrentRepo =  parseInt(value.total_commits);
          let lastCommitDate = totalactiveCommitterMap.get(key).last_commit_date;
          if(lastCommitDate <= value.last_commit_date){
              lastCommitDate = value.last_commit_date;
          }
          let aggregatedTotalCommits = parseInt(totalactiveCommitterMap.get(key).total_commits)+numberofCommitforCurrentRepo;
          totalactiveCommitterMap.set(key,JSON.parse("{\"total_commits\":"+aggregatedTotalCommits+",\"last_commit_date\":\""+lastCommitDate+"\"}"));
          }
       });
      }
    }
   return totalactiveCommitterMap;
}

//Exectuion Entry
run();
