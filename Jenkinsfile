pipeline {
    agent any
    environment {
        mongo_url = "mongodb+srv://nikhilpuppala03:Buncuski2BlCmygA@cluster0.6z92y.mongodb.net/"
        jwtSecret = "ewrgfrtyjnyujtrtgyret"

    }
    stages {
        stage('Stage 1: Git Clone') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Nikhilpuppa/booking_app.git'
            }
        }
        stage('client build') {
            steps {
                dir('client'){
                sh "npm install"
                sh 'docker build -t frontend-image .'
            }
            }
        }
        stage("Server build") {
            steps {
                dir('api'){
                sh "npm install"
                sh 'docker build -t backend-image .'
            }}
        }
        // stage('Push to Docker Hub') {
        //     steps {
        //         script {
        //                 // sh "docker login --username bean6792 --password Vivek@1383"
        //                 // sh 'docker tag frontend-image bean6792/frontend-image:latest'
        //                 // sh 'docker push bean6792/frontend-image:latest'
        //                 // sh "docker tag backend-image bean6792/backend-image:latest"
        //                 // sh "docker push bean6792/backend-image:latest"
                    
        //         }
        //     }
        // }
        // stage('Ansible Deployment') {
        //     steps {
        //         script { 
        //             sh 'ansible-playbook -i inventory-k8 playbook-k8.yml -vvv'
        //         }
        //     }
        // }
    }
}