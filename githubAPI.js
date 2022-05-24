const { Octokit } = require("@octokit/core");
const fileHandler = require("./middleware/fileHandler")
const PAGINATION_CONTROL_INDICATOR = 'rel="next", <https';
const FILENAME_PREFIX_REPOLIST = 'Gihtub_Repo_Lists_';  // Outout format will be FILENAME_PREFIX_REPOLIST+{ogranization}.csv

/**
 * 
 * @param {string} organization 
 * @param {string} sinceTime 
 * @param {string} githubAPIToken 
 * @returns Arraylist of Github Repo Name 
 */

async function fetchActiveGithubRepoLists(organization,sinceTime,githubAPIToken){
    const octokit = new Octokit({ auth: githubAPIToken });
    let activeGithubArrayList = [];
    let activeRepoData = [];
    let columns = {
         RepoName: 'Repo Name',
         LastUpdatedAt: 'Last Updated At',
         LastPushedAt: 'Last Pushed At',
         CreatedAt : 'Created At'
    };

    let fileName = FILENAME_PREFIX_REPOLIST+organization+".csv"

    let cursor = "";
    let rel = "next";                   // check whether the search reaches the end        
    let page = 1;               
    let testGithubRepoHooks = "/orgs/"+organization+"/repos?per_page=100&sort=pushed&direction=desc"

    // Pagination Control 
    while (rel!=='prev'){
        let githubRepoListURI = testGithubRepoHooks;
        if(cursor!==""){
                githubRepoListURI = githubRepoListURI +cursor;
        }
        console.log("Current URI: "+githubRepoListURI);
        await new Promise(resolve => setTimeout(resolve, 1000));    // Set a Timeout before next Execution to avoid rate limit issue
        let githubRepoListRes=  await octokit.request("GET "+githubRepoListURI);

        let githubRepoListJSONObject= JSON.parse(JSON.stringify(githubRepoListRes))

        let linkResHeader = githubRepoListJSONObject.headers.link;

        if(linkResHeader == undefined)
        {
                rel = 'prev' ;  // If there is not cursor or next page, skip the next loop
        }
        else{
           if(linkResHeader.indexOf(PAGINATION_CONTROL_INDICATOR)>=0){
                rel = 'next'
                page = page+1
                cursor="&page="+page   // This is the pagination control;
           }
           else{
               rel = 'prev'
           }
        }
        let githubListJSONArray = githubRepoListJSONObject.data;
        console.log("Current Github Repo List length :"+githubListJSONArray.length)

        for (let githubRepo of githubRepoListJSONObject.data) {
            if(githubRepo.name){
            //  let updatedCommit_Date = githubRepo.updated_at;
                activeRepoData.push([githubRepo.name,githubRepo.updated_at,githubRepo.pushed_at,githubRepo.created_at]) 
                // The following if statement is removed before last_update_time is not the same with the last commit time
            //  if(updatedCommit_Date && updatedCommit_Date>sinceTime){
                activeGithubArrayList.push(githubRepo.name);
            //  }
            }
        }
    }
    fileHandler.writeToCSVFile(fileName,columns,activeRepoData);
    console.log("Total NO. of Active Repos List : "+activeGithubArrayList.length);
    return activeGithubArrayList;
}

/**
 * @description This function is to get a hashMap with commiter as key and last commit time as value
 * @param {string} organization 
 * @param {string} repoName 
 * @param {string} sinceTime 
 * @param {string} githubAPIToken 
 * @returns list
 */

async function getCommitterFromRepo(organization,repoName,sinceTime,githubAPIToken){
    const octokit = new Octokit({ auth: githubAPIToken });
    let committerHashMap = new Map();        //The format will be [{'Committer_ID':{'total_commit':number_of_commit, 'last_commit_time',}}]
    let baseGetCommitURI = "/repos/"+organization+"/"+repoName+"/commits?since="+sinceTime+"&per_page=100";
    let cursor = "";
    let rel = "next";       //check whether the search reaches the end
    let count = 0;
    let page = 1;
    while (rel!=='prev'){
        let getCommitURI = baseGetCommitURI;
        if(cursor!==""){
            getCommitURI = baseGetCommitURI +cursor;

        }
        await new Promise(resolve => setTimeout(resolve, 1000));                // Set a TimeOut before next Executtion
        let githubCommitRes = "";
        try{
            console.log("Current URI request to pull the commits "+getCommitURI);
            githubCommitRes=  await octokit.request("GET "+getCommitURI);
        }catch (e){
            console.log("Exception Occured when making a request to "+getCommitURI);
            break;
        }
      
        let githubCommitsJSONObject= JSON.parse(JSON.stringify(githubCommitRes))

        let linkResHeader = githubCommitsJSONObject.headers.link;
        if(linkResHeader == undefined)
        {
                rel = 'prev' ;           // If there is not cursor or next page, just not going to start next loop
        }
        else{
           if(linkResHeader.indexOf(PAGINATION_CONTROL_INDICATOR)>=0){
                rel = 'next'
                page = page+1
                cursor="&page="+page   // This is the pagination control;
           }
           else{
               rel = 'prev'
           }
        }
        if(githubCommitsJSONObject.data || githubCommitsJSONObject.data.length >= 1)
        for(let commitEntry of githubCommitsJSONObject.data){
            let lastcommitDate = commitEntry.commit.author.date;
              let commiterID = "";
              if(commitEntry.author!=null){
                 commiterID= commitEntry.author.login;
              }else{
                  commiterID= commitEntry.commit.author.name;
              }
              if(committerHashMap.has(commiterID) == false){                    // Since the commit is sorted as desc, the first commit added is the latest one
                 committerHashMap.set(commiterID, JSON.parse("{\"total_commits\":1,\"last_commit_date\":\""+lastcommitDate+"\"}"));
              }else{
                  //Update the total commit numbers if a committer has already been added.
                  let totalCommits = committerHashMap.get(commiterID).total_commits;
                  totalCommits++;
                  committerHashMap.set(commiterID,JSON.parse("{\"total_commits\":"+totalCommits+",\"last_commit_date\":\""+lastcommitDate+"\"}"))
              }
            count++;
        }
    }

    console.log("Total Commits Since "+sinceTime + " for repo " + repoName+ " is "+count + " since "+sinceTime);
    return committerHashMap;
    
}

module.exports = {getCommitterFromRepo,fetchActiveGithubRepoLists}

