pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                nodejs(nodeJSInstallationName:"nodejs12.x") {
                    sh label: 'Build', script: '''
                        npm install
                        npm run bootstrap
                        '''
                }
            }
        }
        stage('Test') {
            steps {
                nodejs(nodeJSInstallationName:"nodejs12.x") {
                    sh label: 'Test', script: '''
                        npm test
                        '''
                }
            }
        }
        stage('Deploy AWS CloudFormation') {
            steps {
                samDeploy(region: 'us-east-1', credentialsId: 'knocket-aws', s3Bucket: 'knocket', s3Prefix: 'deployment', templateFile: 'packages/kkt-aws/template.yaml', stackName: 'knocket')
            }
        }
    }
    
    post {
        success {
            cleanWs()
        }
    }
}