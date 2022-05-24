# Github_Active_Committer_Calculator 

This repo is created to help Github users to calculate and extract active Github committer in your organization in a given time range.  One user case that motivated me to create this tool was to get the active committer under our organization evaluating Github Advance Security Feature. Currently, Github API does not provide this feature to pull the active committers in a time range as the list commits API is only single repo based. This tool is able to pull the active committers of the organization by 1) Pull the commits and get the committers for each repo 2) Aggregate all the committers to get total unique committers
 
## Support

If you are experienceing any bugs or issue or you want to add more functions that could benefits more people, please create an issue so that we could work on it

## Getting Started

To begin, you just need get npm and nodejs (v12 above) installed.

After installing the above software, clone this repo:

```bash
$ git clone git@github.com:dingjiedanielyang-sec/Github_Active_Committer_Calculator.git
```


Navigate into the directory and install the dependencies:

```bash
$ npm install
```

After installing all the dependencies, you could run the script by providing arguments for *organizatoin_name, github_token* and *timeDate_ISO_Format*. If sinceTime argument is missing, the default value is the date of one month ago.

```bash
$  node index.js --orgName={YOUR_Github_Orgaization_Name} --githubAPIToken={Github_Token} --sinceTime={Time_in_ISO_Format}
```
If you are members of the organization, your Gihtub API token is authorized to access both public and private repos. If you are not a member of the orgainzation, the above commmand will only pull the active committers for all the public accesssible repos.


For example, to check the active committers under Github Organization since 2022-04-24, you could run the following command

```bash
$  node index.js --orgName=Github --githubAPIToken=ghp_xxxxxxxxxxxxxxxxxxxxxx --sinceTime=2022-04-24T00:00:00.000Z
```

**Results**
The script will generate two csv reports, one containing the list of Github repos with, repository_name, last_updated_time, last_pushed_time and  created_at_time; another one contains the list of the active committers and the total commits under this organization. 


**Note**
The script may take a while to run as it is going to pull the commits based on the time range for every single repo under the organization.