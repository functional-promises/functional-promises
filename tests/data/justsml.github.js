const data = {
  "login": "justsml",
  "id": 397632,
  "avatar_url": "https://avatars2.githubusercontent.com/u/397632?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/justsml",
  "html_url": "https://github.com/justsml",
  "followers_url": "https://api.github.com/users/justsml/followers",
  "following_url": "https://api.github.com/users/justsml/following{/other_user}",
  "gists_url": "https://api.github.com/users/justsml/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/justsml/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/justsml/subscriptions",
  "organizations_url": "https://api.github.com/users/justsml/orgs",
  "repos_url": "https://api.github.com/users/justsml/repos",
  "events_url": "https://api.github.com/users/justsml/events{/privacy}",
  "received_events_url": "https://api.github.com/users/justsml/received_events",
  "type": "User",
  "site_admin": false,
  "name": "Dan Levy",
  "company": "Lead Instructor @ Galvanize",
  "blog": "http://www.danlevy.net/",
  "location": "Centennial, CO",
  "email": null,
  "hireable": true,
  "bio": "❤️ OSS, I share software dev know-how & contribute to the projects I rely on (and admire) most: @nodejs @lodash @mongodb @docker @minio @bluebird, et al.",
  "public_repos": 191,
  "public_gists": 80,
  "followers": 83,
  "following": 132,
  "created_at": "2010-09-13T15:25:43Z",
  "updated_at": "2018-01-12T17:48:42Z"
}

module.exports = function fakeFetch(url, opts) {
  return {
    ok: true,
    json: () => data
  }
}

