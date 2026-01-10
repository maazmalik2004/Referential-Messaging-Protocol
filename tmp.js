import Logger from "./logging/logger.js";

let logger = new Logger()

logger.reset();

for(let i = 0;i < 1000000;i++){
//     logger.logMessage({
//   app: {
//     name: "MegaPlatform",
//     version: "3.14.7",
//     environment: "production",
//     build: {
//       commit: "a9f3c21e",
//       date: "2026-01-10T08:45:00Z",
//       ci: "github-actions",
//       artifacts: ["api.bundle.js", "worker.bundle.js", "ui.bundle.js"]
//     }
//   },

//   config: {
//     server: {
//       host: "0.0.0.0",
//       port: 8080,
//       timeoutMs: 30000,
//       cors: {
//         enabled: true,
//         origins: ["https://example.com", "https://admin.example.com"],
//         credentials: true
//       }
//     },
//     database: {
//       primary: {
//         type: "postgres",
//         host: "db-primary.internal",
//         port: 5432,
//         pool: {
//           min: 5,
//           max: 50,
//           idleTimeoutMs: 10000
//         }
//       },
//       replicas: [
//         { host: "db-replica-1.internal", port: 5432 },
//         { host: "db-replica-2.internal", port: 5432 }
//       ]
//     },
//     cache: {
//       type: "redis",
//       nodes: [
//         { host: "cache-1.internal", port: 6379 },
//         { host: "cache-2.internal", port: 6379 }
//       ],
//       ttlSeconds: 3600
//     }
//   },

//   users: [
//     {
//       id: "u_001",
//       profile: {
//         name: "Alice Johnson",
//         email: "alice@example.com",
//         roles: ["admin", "developer"],
//         preferences: {
//           theme: "dark",
//           language: "en",
//           notifications: {
//             email: true,
//             sms: false,
//             push: true
//           }
//         }
//       },
//       activity: {
//         lastLogin: "2026-01-09T19:22:11Z",
//         sessions: [
//           { ip: "192.168.1.10", device: "Chrome/Windows", active: false },
//           { ip: "10.0.0.5", device: "Firefox/Linux", active: true }
//         ]
//       }
//     },
//     {
//       id: "u_002",
//       profile: {
//         name: "Rahul Mehta",
//         email: "rahul@example.com",
//         roles: ["user"],
//         preferences: {
//           theme: "light",
//           language: "hi",
//           notifications: {
//             email: true,
//             sms: true,
//             push: false
//           }
//         }
//       },
//       activity: {
//         lastLogin: "2026-01-10T06:05:44Z",
//         sessions: [
//           { ip: "172.16.0.12", device: "Edge/Windows", active: true }
//         ]
//       }
//     }
//   ],

//   permissions: {
//     admin: {
//       canCreateUser: true,
//       canDeleteUser: true,
//       canAccessBilling: true,
//       canDeploy: true
//     },
//     developer: {
//       canCreateUser: false,
//       canDeleteUser: false,
//       canAccessBilling: false,
//       canDeploy: true
//     },
//     user: {
//       canCreateUser: false,
//       canDeleteUser: false,
//       canAccessBilling: false,
//       canDeploy: false
//     }
//   },

//   features: {
//     flags: {
//       newDashboard: true,
//       betaSearch: false,
//       aiAssistant: true,
//       realtimeAnalytics: true
//     },
//     rollout: {
//       percentage: 35,
//       regions: {
//         us: true,
//         eu: true,
//         in: false,
//         apac: false
//       }
//     }
//   },

//   metrics: {
//     uptimeSeconds: 983424,
//     requests: {
//       total: 18234567,
//       perMinute: 1240,
//       errors: {
//         "4xx": 23412,
//         "5xx": 321
//       }
//     },
//     performance: {
//       p50: 120,
//       p90: 280,
//       p99: 900
//     }
//   },

//   logs: [
//     {
//       level: "info",
//       message: "Server started",
//       timestamp: "2026-01-10T00:00:01Z"
//     },
//     {
//       level: "warn",
//       message: "High memory usage detected",
//       timestamp: "2026-01-10T03:14:09Z",
//       meta: {
//         usagePercent: 82,
//         threshold: 80
//       }
//     },
//     {
//       level: "error",
//       message: "Database connection timeout",
//       timestamp: "2026-01-10T04:55:21Z",
//       meta: {
//         host: "db-primary.internal",
//         retry: true
//       }
//     }
//   ],

//   tasksQueue: {
//     pending: [
//       { id: "t_101", type: "email", priority: 2 },
//       { id: "t_102", type: "report", priority: 1 }
//     ],
//     processing: [
//       { id: "t_099", type: "backup", startedAt: "2026-01-10T06:00:00Z" }
//     ],
//     completed: [
//       { id: "t_098", type: "cleanup", durationMs: 3421 }
//     ]
//   },

//   metadata: {
//     generatedAt: new Date().toISOString(),
//     checksum: "9f86d081884c7d659a2feaa0c55ad015",
//     tags: ["production", "stable", "v3"]
//   }
// }

// )
}