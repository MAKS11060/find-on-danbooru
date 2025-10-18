/// <reference types="@types/chrome" />

interface SitePattern {
  patterns: URLPattern[]
  resolve({pathname}: URLPatternResult, pattern: URLPattern): string
}

// --- PATTERNS ---
const SITE_PATTERNS: SitePattern[] = [
  { // X.com (Twitter)
    patterns: [
      new URLPattern({hostname: 'x.com', pathname: '/:username/*'}),
      new URLPattern({hostname: 'twitter.com', pathname: '/:username/*'}),
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
]

// Function to normalize the URL based on the configured patterns
function normalizeUrl(urlString: string) {
  try {
    const url = new URL(urlString)
    for (const {patterns, resolve} of SITE_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(url)) {
          return resolve(
            pattern.exec(url)!,
            pattern,
          )
        }
      }
    }

    console.log(`The URL does not match known normalization patterns: ${urlString}`)
    return urlString
  } catch (e) {
    console.error('Error when parsing the URL for normalization:', e)
    return urlString
  }
}

// Function to check if the URL matches any of the configured patterns
function isValidUrl(urlString: string) {
  try {
    const url = new URL(urlString)
    for (const {patterns} of SITE_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(url)) {
          return true
        }
      }
    }
  } catch (e) {
    console.error('validate failed URL:', {input: urlString, e})
    return false
  }
}

// Listen for clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'findArtistOnDanbooru') {
    // Determine the URL to use based on how the context menu was invoked

    let urlToUse: string | undefined
    if (info.linkUrl) { // If a link was right-clicked, use that link's URL
      urlToUse = info.linkUrl
    } else { // Otherwise, use the current tab's URL
      urlToUse = tab?.url
    }

    if (info.mediaType === 'image') { //
      urlToUse = info.frameUrl!
    }

    // Validate the URL
    if (urlToUse && isValidUrl(urlToUse)) {
      // Normalize the URL
      const normalizedUrl = normalizeUrl(urlToUse)

      // Construct the Danbooru search URL
      const uri = new URL('https://danbooru.donmai.us/artists')
      uri.searchParams.set('commit', 'Search')
      uri.searchParams.set('search[order]', 'created_at')
      uri.searchParams.set('search[url_matches]', normalizedUrl)
      chrome.tabs.create({url: uri.toString()})
    } else {
      console.log('Invalid or unsupported URL detected for Danbooru search:', urlToUse, info)
    }
  }

  if (info.menuItemId === 'searchImageOnIQDB') {
    const imageUrl = info.srcUrl
    if (imageUrl) {
      const uri = new URL('https://danbooru.donmai.us/iqdb_queries')
      uri.searchParams.set('search[url]', imageUrl)
      chrome.tabs.create({url: uri.toString()})
    } else {
      console.log('empty url')
    }
  }
})

// Create the context menu item (moved here for clarity, but placement doesn't strictly matter for this example)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'findArtistOnDanbooru',
    title: 'Find Artist',
    contexts: ['page', 'selection', 'link'], // Show for page, selected text, or links
  })

  // Search image
  chrome.contextMenus.create({
    id: 'searchImageOnIQDB',
    title: 'Find Image',
    contexts: ['image'], // Show only when right-clicking an image
  })
})
