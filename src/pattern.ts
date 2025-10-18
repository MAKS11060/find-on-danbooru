interface SitePattern {
  patterns: URLPattern[]
  exclude?: URLPattern[]
  resolve({pathname}: URLPatternResult, pattern: URLPattern): string | undefined
}

export const SITE_PATTERNS: SitePattern[] = [
  { // X.com (Twitter)
    patterns: [
      new URLPattern({hostname: 'x.com', pathname: '/:username/*?'}),
      new URLPattern({hostname: 'twitter.com', pathname: '/:username/*?'}),
    ],
    exclude: [
      new URLPattern({hostname: 'x.com', pathname: '/'}),
      new URLPattern({hostname: 'x.com', pathname: '/home'}),
      new URLPattern({hostname: 'x.com', pathname: '/explore'}),
      new URLPattern({hostname: 'x.com', pathname: '/notifications'}),
      new URLPattern({hostname: 'x.com', pathname: '/messages'}),
      new URLPattern({hostname: 'x.com', pathname: '/settings/*'}),
      new URLPattern({hostname: 'x.com', pathname: '/i/*'}), // /i/user, /i/flow, /i/keyboard_shortcuts etc.
      new URLPattern({hostname: 'x.com', pathname: '/search'}),
      new URLPattern({hostname: 'x.com', pathname: '/search/*'}),
      new URLPattern({hostname: 'x.com', pathname: '/compose/*'}),
      new URLPattern({hostname: 'x.com', pathname: '/tos'}),
      new URLPattern({hostname: 'x.com', pathname: '/privacy'}),
      new URLPattern({hostname: 'x.com', pathname: '/rules'}),
      new URLPattern({hostname: 'x.com', pathname: '/help/*'}),
      new URLPattern({hostname: 'x.com', pathname: '/*/communities/*?'}),
    ],
    resolve: (
      {pathname: {groups: {username}}},
    ) => `https://x.com/${username}`,
  },
  { // Pixiv
    patterns: [
      new URLPattern({hostname: 'www.pixiv.net', pathname: '/:lang/users/:userId'}),
    ],
    resolve: (
      {pathname: {groups: {userId}}},
    ) => `https://www.pixiv.net/en/users/${userId}`,
  },
  { // Pixiv img
    patterns: [
      new URLPattern({hostname: 'www.pixiv.net', pathname: '/:lang/artworks/:postId'}),
    ],
    resolve: (
      {pathname: {groups: {postId}}},
    ) => `https://www.pixiv.net/en/artworks/${postId}`,
  },

  { // short url
    patterns: [
      new URLPattern({hostname: 'www.pixiv.net', pathname: '/jump.php', search: 'url=:target'}),
    ],
    resolve: (
      {search: {groups: {target}}},
    ) => target && decodeURIComponent(target),
  },
]
