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

        stage('Health Check & Testing') {
            steps {

                echo '🩺 Running health checks...'

                script {

                    sh '''
                    echo "Testing backend API..."

                    docker exec backend wget -qO- http://localhost:5000/api/tasks > /dev/null || {
                        echo "❌ Backend API check failed"
                        exit 1
                    }

                    echo "✅ Backend API is healthy"
                    '''

                    sh '''
                    echo "Testing frontend..."

                    docker exec frontend wget -qO- http://localhost:5173 > /dev/null || {
                        echo "❌ Frontend check failed"
                        exit 1
                    }

                    echo "✅ Frontend is accessible"
                    '''
                }
            }
        }

        stage('Integration Tests') {
            steps {

                echo '🧪 Running integration tests...'

                script {

                    sh '''
                    echo "Creating test task..."

                    docker exec backend wget -qO- --post-data '{"title":"Jenkins CI Test Task","completed":false}' --header="Content-Type: application/json" http://localhost:5000/api/tasks > /dev/null || {
                        echo "❌ Task creation failed"
                        exit 1
                    }
                    '''

                    sh '''
                    echo "Verifying task creation..."

                    docker exec backend wget -qO- http://localhost:5000/api/tasks | grep "Jenkins CI Test Task" || {
                        echo "❌ Task creation test failed"
                        exit 1
                    }

                    echo "✅ Integration test passed"
                    '''
                }
            }
        }

        stage('Performance Check') {
            steps {

                echo '⚡ Running performance checks...'

                script {

                    sh '''
                    echo "Checking API response time..."
                    time docker exec backend wget -qO- http://localhost:5000/api/tasks > /dev/null

                    echo "Checking frontend response time..."
                    time docker exec frontend wget -qO- http://localhost:5173 > /dev/null
                    '''
                }
            }
        }
    }

    post {

        always {

            echo '🧹 Cleaning up resources...'

            sh '''
            echo "Stopping application containers..."
            docker compose down || true

            echo "Removing test containers..."
            docker ps -aq --filter "label=jenkins-test" | xargs -r docker rm -f || true

            echo "Cleaning up unused images..."
            docker image prune -f || true
            '''
        }

        success {

            echo '✅ Pipeline completed successfully!'

            sh '''
            echo "Build #${BUILD_NUMBER} succeeded at $(date)"
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