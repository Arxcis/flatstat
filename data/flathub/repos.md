## repos.js

This is how a full repo-object looks coming from `GET api.github.com/repos`. We remove the fields we don't care about before writing to `repos.js`. The Github API v3 does not offer a way to request partial responses, so we always get the full object over the wire, and then transform it on our side.

```json
  {
    "id": 87900586,
    "node_id": "MDEwOlJlcG9zaXRvcnk4NzkwMDU4Ng==",
    "name": "org.gnome.Recipes",
    "full_name": "flathub/org.gnome.Recipes",
    "private": false,
    "owner": {
      "login": "flathub",
      "id": 27268838,
      "node_id": "MDEyOk9yZ2FuaXphdGlvbjI3MjY4ODM4",
      "avatar_url": "https://avatars2.githubusercontent.com/u/27268838?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/flathub",
      "html_url": "https://github.com/flathub",
      "followers_url": "https://api.github.com/users/flathub/followers",
      "following_url": "https://api.github.com/users/flathub/following{/other_user}",
      "gists_url": "https://api.github.com/users/flathub/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/flathub/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/flathub/subscriptions",
      "organizations_url": "https://api.github.com/users/flathub/orgs",
      "repos_url": "https://api.github.com/users/flathub/repos",
      "events_url": "https://api.github.com/users/flathub/events{/privacy}",
      "received_events_url": "https://api.github.com/users/flathub/received_events",
      "type": "Organization",
      "site_admin": false
    },
    "html_url": "https://github.com/flathub/org.gnome.Recipes",
    "description": null,
    "fork": false,
    "url": "https://api.github.com/repos/flathub/org.gnome.Recipes",
    "forks_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/forks",
    "keys_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/teams",
    "hooks_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/hooks",
    "issue_events_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/issues/events{/number}",
    "events_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/events",
    "assignees_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/assignees{/user}",
    "branches_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/branches{/branch}",
    "tags_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/tags",
    "blobs_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/languages",
    "stargazers_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/stargazers",
    "contributors_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/contributors",
    "subscribers_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/subscribers",
    "subscription_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/subscription",
    "commits_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/contents/{+path}",
    "compare_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/merges",
    "archive_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/downloads",
    "issues_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/issues{/number}",
    "pulls_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/labels{/name}",
    "releases_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/releases{/id}",
    "deployments_url": "https://api.github.com/repos/flathub/org.gnome.Recipes/deployments",
    "created_at": "2017-04-11T06:57:06Z",
    "updated_at": "2020-03-12T00:39:53Z",
    "pushed_at": "2020-03-12T00:39:54Z",
    "git_url": "git://github.com/flathub/org.gnome.Recipes.git",
    "ssh_url": "git@github.com:flathub/org.gnome.Recipes.git",
    "clone_url": "https://github.com/flathub/org.gnome.Recipes.git",
    "svn_url": "https://github.com/flathub/org.gnome.Recipes",
    "homepage": "https://flathub.org/apps/details/org.gnome.Recipes",
    "size": 12,
    "stargazers_count": 3,
    "watchers_count": 3,
    "language": null,
    "has_issues": true,
    "has_projects": false,
    "has_downloads": true,
    "has_wiki": false,
    "has_pages": false,
    "forks_count": 6,
    "mirror_url": null,
    "archived": false,
    "disabled": false,
    "open_issues_count": 0,
    "license": null,
    "forks": 6,
    "open_issues": 0,
    "watchers": 3,
    "default_branch": "master",
    "permissions": {
      "admin": false,
      "push": false,
      "pull": true
    }
  },
```
