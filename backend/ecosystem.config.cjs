/**
 * PM2 Ecosystem Configuration for Kissan Mithar Backend on AWS EC2
 *
 * Usage on EC2:
 *   npm install -g pm2
 *   npm run build
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'kissan-mithar-backend',
      script: 'dist/server.js',
      instances: 'max', // Scale to all available CPU cores on EC2
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      time: true,
    },
  ],
};

