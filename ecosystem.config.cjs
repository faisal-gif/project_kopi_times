export default {
  apps: [
    {
      name: "kopi-worker",
      script: "artisan",
      args: "queue:work --sleep=3 --tries=3 --max-time=3600",
      interpreter: "php",
    },
    {
      name: "kopi-ssr",
      script: "artisan",
      args: "inertia:start-ssr",
      interpreter: "php",
    }
  ],
};