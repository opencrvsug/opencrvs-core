import * as Good from 'good'
import * as Rate from 'hapi-rate-limitor'

export default function getPlugins() {
  const plugins: any[] = [
    {
      plugin: Good,
      options: {
        ops: {
          interval: 1000
        },
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [
                {
                  log: '*',
                  response: '*',
                  request: '*',
                  error: '*'
                }
              ]
            },
            {
              module: 'good-console'
            },
            'stdout'
          ]
        }
      }
    }
  ]

  if (process.env.RATE_LIMIT !== 'false') {
    plugins.push({
      plugin: Rate,
      options: {
        userAttribute: 'id',
        max: 2,
        duration: 60 * 1000 // per minute (the value is in milliseconds)
      }
    })
  }

  return plugins
}
