// orval.config.js
module.exports = {
    dockerManager: {
      input: './openapi/docker-manager.json',
      output: {
        target: './src/types/docker-manager.ts',
        client: 'react-query',
        mode: 'single', 
        override: {
          mutator: {
            path: './src/utils/docker-manager-api.ts',
            name: 'docker_manager_api',
          },
        },
      },
    },
    backend: {
        input: './openapi/backend.json',
        output: {
          target: './src/types/backend.ts',
          client: 'react-query',
          mode: 'single', 
          override: {
            mutator: {
              path: './src/utils/backend-api.ts',
              name: 'backend_api',
            },
          },
        },
      },
    attackerAgent: {
        input: './openapi/attacker-agent.json',
        output: {
          target: './src/types/attacker-agent.ts',
          client: 'react-query',
          mode: 'single', 
          override: {
            mutator: {
              path: './src/utils/attacker-agent-api.ts',
              name: 'attacker_agent_api',
            },
          },
        },
      },
  };