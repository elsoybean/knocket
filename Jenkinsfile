pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                nodejs(nodeJSInstallationName:"nodejs12.x") {
                    sh label: 'Build', script: '''
                        lerna bootstrap --no-ci
                        lerna link
                        '''
                }
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                samDeploy(region: 'us-east-1', credentialsId: 'knocket-aws', s3Bucket: 'knocket', s3Prefix: 'deployment', templateFile: 'packages/kkt-aws/template.yaml', stackName: 'knocket')
            }
        }
    }
}