module.exports = {
  apps: [
    {
      name: "larooms",
      script: "node_modules/.bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "500M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/larooms/error.log",
      out_file: "/var/log/larooms/out.log",
    },
  ],
};
