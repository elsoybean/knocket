# knocket

## Set up a local Jenkins server

```
docker pull jenkins/jenkins:lts
docker run -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

Install the following plugins

- AWS SAM
- Http Request
- File Operations
- NodeJS

Add a NodeJS version

- Manage Jenkins > Global tool configuration
- Name it `nodejs12.x`
- Choose any NodeJS 12.x version

Add credentials

- Manage Jenkins > Credentials > System > global
- Add AWS credentials, id is `knocket-aws`

Create a new Item

- Named `Knocket`
- Pipeline
- Pipeline definition: Pipeline script from SCM
- Script path: `Jenkinsfile`
