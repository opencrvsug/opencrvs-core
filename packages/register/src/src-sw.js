importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
)

const queue = new workbox.backgroundSync.Queue('registerQueue', {
  callbacks: {
    queueDidReplay: function(requestArray) {
      let requestSynced = 0
      requestArray.forEach(item => {
        if (!item.error) {
          requestSynced++
        }
      })

      if (requestSynced > 0) {
        new BroadcastChannel('backgroundSynBroadCastChannel').postMessage(
          requestSynced
        )
      }
    }
  }
})
const GraphQLMatch = /graphql(\S+)?/

self.addEventListener('fetch', event => {
  if (
    null !== event.request.url.match(GraphQLMatch) &&
    navigator.onLine === false
  ) {
    const promiseChain = fetch(event.request.clone()).catch(err => {
      return queue.addRequest(event.request)
    })

    event.waitUntil(promiseChain)
  }
})

self.addEventListener('message', event => {
  if (!event.data) {
    return
  }

  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting()
      break
    default:
      break
  }
})

workbox.precaching.precacheAndRoute([])

/*
 * As the config file can change after the app is built, we cannot precache it
 * as we do with other assets. Instead, we use the NetworkFirst strategy that
 * tries to load the file, but falls back to the cached version. This version is updated
 * when a new version is succesfully loaded.
 * https://developers.google.com/web/tools/workbox/modules/workbox-strategies#network_first_network_falling_back_to_cache
 */

workbox.routing.registerRoute(
  '/config.js',
  new workbox.strategies.NetworkFirst()
)

/*
 *   Alternate for navigateFallback & navigateFallbackBlacklist
 */
workbox.routing.registerNavigationRoute('/index.html', {
  blacklist: [/^\/__.*$/]
})
