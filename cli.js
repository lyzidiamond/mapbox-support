const getTickets = require('./index');

// take days ago

let org = process.argv[2];
let daysAgo = process.argv[3];

const members = getTickets.runAfterPagination(getPublicMembers, org);
const repos = getTickets.runAfterPagination(getPublicRepos, org);
let issues = getTickets.runAfterPagination(getRepoIssues, org, repos[0], daysAgo);

console.log(members);
console.log(repos);
console.log(issues);