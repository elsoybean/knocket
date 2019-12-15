# knocket

## Set up a local Jenkins server

```
docker pull jenkins/jenkins:lts
docker run -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

Install the following plugins

- AWS CodeDeploy
- AWS CodeBuild
- Http Request
- File Operations
