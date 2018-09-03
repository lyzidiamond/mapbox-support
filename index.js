// TODO:
// - add auth (env vars?)

const octokit = require('@octokit/rest')({
  timeout: 0, // 0 means no request timeout
  headers: {
    accept: 'application/vnd.github.v3+json',
    'user-agent': 'octokit/rest.js v1.2.3' // v1.2.3 will be current version
  },
 
  // Node only: advanced request options can be passed as http(s) agent
  agent: undefined
});

async function paginate(method) {
  let response = await method({per_page: 100});
  let {data} = response;
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response);
    data = data.concat(response.data);
  }
  return data;
}

function getPublicMembers(org) {
  return octokit.orgs.getPublicMembers({org: org});
}

function getPublicRepos(org) {
  return octokit.repos.getForOrg({org: org, type: 'public'});
}

function getRepoIssues(org, repo, daysAgo) {
  return octokit.issues.getForRepo({owner: org, repo: repo, state: 'open', since: getDate(daysAgo)});
}

async function runAfterPagination(func, args) {
  if (!Array.isArray(args)) args = [args];
  try {
    let data = await paginate(() => func(...args));
    return data;
  } catch(err) {  
    console.err;
  }
}

// returns date determined by days ago input
function getDate(daysAgo) {
  let now = new Date();
  let daysAgoDate = new Date();
  daysAgoDate.setDate(now.getDate() - daysAgo);
  return daysAgoDate.toISOString();
}

const members = runAfterPagination(getPublicMembers, 'mapbox');
// const repos = runAfterPagination(getPublicRepos, 'mapbox');
// let issues = runAfterPagination(getRepoIssues, 'mapbox', repos[0], 30);

members.then(data => console.log(data.length));
// console.log(repos);
// console.log(issues);

// get members, save
// get repos, save
// get issues for each repo if author is not a member


// function getMembers(page, callback) {
//   console.log("getting members page " + page);
//   github.orgs.getMembers({
//     org: 'mapbox',
//     page: page,
//     per_page: 100
//   }, function(err, res) {
//     for (i = 0; i < res.length; i++) {
//       if (res[i].login) {
//         teamMembers.push(res[i].login);
//       }
//     }
//     var linkString = res.meta.link;
//     var linksArray = linkString.split(',');
//     var nextPage;
//     var lastPage;
//     for (i = 0; i < linksArray.length; i++) {
//       if (linksArray[i].match(/rel="next"/)) {
//         nextPage = parseInt(linksArray[i].match(/page=\d+/)[0].match(/\d+/)[0]);
//       } else if (linksArray[i].match(/rel="last"/)) {
//         lastPage = parseInt(linksArray[i].match(/page=\d+/)[0].match(/\d+/)[0]);
//       }
//     }
//     if (nextPage <= lastPage) {
//       getMembers(parseInt(nextPage), callback);
//     } else {
//       callback();
//     }
//   })
// }

// function getPublicRepos(page, callback) {
//   console.log("getting public repos page " + page);
//   github.orgs.getTeamRepos({
//     id: 36666, // team-mapbox ID
//     page: page,
//     per_page: 100
//   }, function(err, res) {
//     if (err) {
//       console.log(error);
//     }
//     for (i = 0; i < res.length; i++) {
//       if (res[i].name && !res[i].private) {
//         var repo = {
//           name: res[i].name,
//           id: res[i].id
//         }
//         mapboxRepos.push(res[i].name);
//       }
//     }
//     var linkString = res.meta.link;
//     var linksArray = linkString.split(',');
//     var nextPage;
//     var lastPage;
//     for (i = 0; i < linksArray.length; i++) {
//       if (linksArray[i].match(/rel="next"/)) {
//         nextPage = parseInt(linksArray[i].match(/page=\d+/)[0].match(/\d+/)[0]);
//       } else if (linksArray[i].match(/rel="last"/)) {
//         lastPage = parseInt(linksArray[i].match(/page=\d+/)[0].match(/\d+/)[0]);
//       }
//     }
//     if (nextPage <= lastPage) {
//       getPublicRepos(parseInt(nextPage), callback);
//     } else {
//       callback();
//     }
//   })
// }

// function getRepoIssues(page, repo, callback) {
//   console.log("getting issues for " + repo + " page " + page);
//   github.issues.repoIssues({
//     user: 'mapbox',
//     repo: repo,
//     state: 'open',
//     since: getDate(30), // TODO: take as arg
//     page: page,
//     per_page: 100
//   }, function(err, res) {
//     if (err) {
//       return callback(err);
//     }
//     var issues = [];
//     for (i = 0; i < res.length; i++) {
//       if (res[i].user && (teamMembers.indexOf(res[i].user.login) === -1)) {
//         var issue = {
//           url: res[i].html_url,
//           title: res[i].title,
//           repo: repo,
//           user: res[i].user.login
//         }
//         issues.push(issue);
// //        createSupportTicket(issue)
//       }
//     }
//     if (res.meta.link) {
//       var linkString = res.meta.link;
//       var linksArray = linkString.split(',');
//       var nextPage;
//       var lastPage;
//       for (i = 0; i < linksArray.length; i++) {
//         if (linksArray[i].match(/rel="next"/)) {
//           nextPage = parseInt(linksArray[i].match(/page=\d+/)[0].match(/\d+/)[0]);
//         } else if (linksArray[i].match(/rel="last"/)) {
//           lastPage = parseInt(linksArray[i].match(/page=\d+/)[0].match(/\d+/)[0]);
//         }
//       }
//       if (nextPage <= lastPage) {
//         getRepoIssues(parseInt(nextPage), repo, function(err, nextIssues) {
//           if (err) {
//             callback(err);
//             return;
//           }
//           callback(null, issues.concat(nextIssues));
//         });
//       } else {
//         callback(null, issues);
//       }
//     } else {
//       callback(null, issues);
//     }
//   })
// }

// function createMassSupportTicket(supportIssues) {
//   if (supportIssues.length > 0) {
//     var then = new Date(getDate(30));
//     var now = new Date(getDate(0));
//     console.log("create mass support ticket for " + supportIssues.length + " issues in " + supportIssues[0].repo);
//     var issueTitle = "Support tickets in " + supportIssues[0].repo + " updated from " + then.toDateString() + " to " + now.toDateString();
//     var bodyText = '';
//     for (i = 0; i < supportIssues.length; i++) {
//       bodyText += '- [ ] <a href="' + supportIssues[i].url + '">' + supportIssues[i].title + '</a>\n';
//     }
//     github.issues.create({
//       user: 'lyzidiamond',
//       repo: 'mapbox-support',
//       title: issueTitle,
//       body: bodyText,
//       labels: ['gh-support']
//     })
//   }
// }

// getMembers(1, function(err) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   getPublicRepos(1, function(err) {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     for (i = 0; i < mapboxRepos.length; i++) {
//       getRepoIssues(1, mapboxRepos[i], function(err, issues) {
//         if (err) {
//           console.log(err);
//           return;
//         }
//         createMassSupportTicket(issues);
//       });
//     }
//   });
// });
