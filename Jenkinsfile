/*
 * Chapter 7: Complete MERN CI/CD Pipeline
 * 
 * Pipeline Overview:
 * 1. Trigger: Developer pushes code to GitHub
 * 2. Checkout: Jenkins pulls the latest code
 * 3. Build: Create Docker images for backend and frontend
 * 4. Test: Verify the application works correctly
 * 5. Deploy: Run the complete MERN stack
 * 6. Cleanup: Clean up resources for the next build
 * 
 * Prerequisites Setup
 * The Complete Jenkinsfile
 */

pipeline {
    agent any
    
    environment {
        // Define image names as variables for easy maintenance
        BACKEND_IMAGE = "mern-backend:jenkins"
        FRONTEND_IMAGE = "mern-frontend:jenkins"
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '🔄 Checking out source code from GitHub...'
                // Explicitly check out the main branch of the repository
                git branch: 'main', url: 'https://github.com/Nitheskumars/deveops_project'
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
                    // Build backend image
                    echo "Building backend image: ${BACKEND_IMAGE}"
                    sh "docker build -t ${BACKEND_IMAGE} ./server"
                    
                    // Build frontend image with API URL
                    echo "Building frontend image: ${FRONTEND_IMAGE}"
                    sh """
                    docker build -t ${FRONTEND_IMAGE} ./client \
                    --build-arg VITE_API_URL=http://localhost:5000/api
                    """
                    
                    // Verify images were created
                    sh "docker images | grep mern"
                }
            }
        }
        
        stage('Start Application Services') {
            steps {
                echo '🚀 Starting MERN application...'
                script {
                    // Start the complete application stack
                    sh 'docker compose up -d'
                    
                    // Wait for services to be ready
                    echo "Waiting for services to start..."
                    sleep(time: 30, unit: "SECONDS")
                    
                    // Show running containers
                    sh 'docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}"'
                }
            }
        }
        
        stage('Health Check & Testing') {
            steps {
                echo '🩺 Running health checks...'
                script {
                    // Test backend API
                    echo "Testing backend API..."
                    sh '''
                    curl -f http://localhost:5000/health || {
                        echo "❌ Backend health check failed"
                        exit 1
                    }
                    echo "✅ Backend is healthy"
                    '''
                    
                    // Test frontend
                    echo "Testing frontend..."
                    sh '''
                    curl -f http://localhost:5173 || {
                        echo "❌ Frontend health check failed"
                        exit 1
                    }
                    echo "✅ Frontend is accessible"
                    '''
                    
                    // Test database connection through API
                    echo "Testing database connectivity..."
                    sh '''
                    curl -f http://localhost:5000/api/tasks || {
                        echo "❌ Database connection failed"
                        exit 1
                    }
                    echo "✅ Database is connected"
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                echo '🧪 Running integration tests...'
                script {
                    // Create a test task
                    sh '''
                    echo "Creating test task..."
                    curl -X POST http://localhost:5000/api/tasks \
                    -H "Content-Type: application/json" \
                    -d '{"title": "Jenkins CI Test Task", "completed": false}' \
                    -f || exit 1
                    '''
                    
                    // Verify task was created
                    sh '''
                    echo "Verifying task creation..."
                    curl -s http://localhost:5000/api/tasks | grep "Jenkins CI Test Task" || {
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
                echo '⚡ Running basic performance checks...'
                script {
                    // Simple response time check
                    sh '''
                    echo "Checking API response time..."
                    time curl -s http://localhost:5000/api/tasks > /dev/null
                    echo "Checking frontend load time..."
                    time curl -s http://localhost:5173 > /dev/null
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleaning up resources...'
            script {
                // Always clean up, regardless of build result
                sh '''
                echo "Stopping application containers..."
                docker compose down || true
                echo "Removing test containers..."
                docker rm -f $(docker ps -aq --filter "label=jenkins-test") || true
                echo "Cleaning up unused images..."
                docker image prune -f || true
                '''
            }
        }
        success {
            echo '✅ Pipeline completed successfully!'
            script {
                // Additional success actions
                sh 'echo "Build #${BUILD_NUMBER} succeeded at $(date)"'
            }
        }
        failure {
            echo '❌ Pipeline failed!'
            script {
                // Capture logs for debugging
                sh '''
                echo "Capturing container logs for debugging..."
                docker compose logs || true
                '''
            }
        }
        unstable {
            echo '⚠️ Pipeline completed with warnings'
        }
    }
}
