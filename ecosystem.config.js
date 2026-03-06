module.exports = {
  apps: [
    {
      name: 'dating-app',
      script: 'npm',
      args: 'start -- -p 3004',
      cwd: '/root/dating-app',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
