pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "mern-backend:jenkins"
        FRONTEND_IMAGE = "mern-frontend:jenkins"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo '🔄 Checking out source code from GitHub...'

                git branch: 'main',
                    url: 'https://github.com/Nitheskumars/deveops_project'

                script {
                    echo "Building commit: ${env.GIT_COMMIT}"
                    echo "Branch: ${env.GIT_BRANCH}"
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🏗️ Building Docker images...'

                script {

                    echo "Building backend image: ${BACKEND_IMAGE}"
                    sh "docker build -t ${BACKEND_IMAGE} ./server"

                    echo "Building frontend image: ${FRONTEND_IMAGE}"
                    sh """
                    docker build -t ${FRONTEND_IMAGE} ./client \
                    --build-arg VITE_API_URL=http://localhost:5000/api
                    """

                    sh "docker images | grep mern"
                }
            }
        }

        stage('Start Application Services') {
            steps {

                echo '🚀 Starting MERN application...'

                withCredentials([
                    string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
                    string(credentialsId: 'PORT', variable: 'PORT')
                ]) {

                    script {

                        echo "Creating .env file..."

                        sh '''
                        cat > server/.env << EOF
PORT=$PORT
MONGO_URI=$MONGO_URI
EOF
                        '''

                        echo "Generated .env file successfully"

                        sh 'docker compose up -d'

                        echo "Waiting for services to start..."
                        sleep(time: 30, unit: 'SECONDS')

                        sh 'docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}"'
                    }
                }
            }
        }

        stage('Basic Test') {
            steps {
                echo '🩺 Running simple health check...'
                script {
                    sh '''
                    echo "Testing if backend API is up..."
                    docker exec backend wget -qO- http://localhost:5000/api/tasks > /dev/null || {
                        echo "❌ Backend API check failed"
                        exit 1
                    }
                    echo "✅ Application is running successfully"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up resources...'
            sh '''
            echo "Cleaning up unused images..."
            docker image prune -f || true
            '''
        }
        success {
            echo '✅ Pipeline completed successfully!'
            sh '''
            echo "Build #${BUILD_NUMBER} succeeded at $(date)"
            echo "=========================================================="
            echo "🚀 APPLICATION IS LIVE!"
            echo "Frontend URL: http://localhost:5173  (Replace localhost with your server IP if remote)"
            echo "Backend API:  http://localhost:5000/api"
            echo "=========================================================="
            '''
        }
        failure {
            echo '❌ Pipeline failed!'
            sh '''
            echo "Capturing container logs..."
            docker compose logs || true
            '''
        }
        unstable {
            echo '⚠️ Pipeline completed with warnings'
        }
    }
}