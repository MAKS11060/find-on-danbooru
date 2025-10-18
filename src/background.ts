/// <reference types="@types/chrome" />

import {SITE_PATTERNS} from './pattern.ts'

const MenuItem = {
  findArtistOnDanbooru: 'findArtistOnDanbooru',
  findArtistByNameOnDanbooru: 'findArtistByNameOnDanbooru',
  searchImageOnIQDB: 'searchImageOnIQDB',
} as const

// Listen for clicks on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MenuItem.findArtistOnDanbooru) {
    // Determine the URL to use based on how the context menu was invoked
    let urlToUse: string | undefined
    if (info.linkUrl) { // If a link was right-clicked, use that link's URL
      urlToUse = info.linkUrl
    } else { // Otherwise, use the current tab's URL
      urlToUse = tab?.url
    }

    if (info.mediaType === 'image') { //
      urlToUse = info.linkUrl
      // urlToUse = info.frameUrl!
    }

    // console.log(info, isValidUrl(urlToUse!))

    // Validate the URL
    if (!urlToUse || !isValidUrl(urlToUse)) {
      console.log('Invalid or unsupported URL detected for Danbooru search:', urlToUse, info)
      return
    }

    // Normalize the URL
    const normalizedUrl = normalizeUrl(urlToUse)
    if (!normalizedUrl) {
      console.log('normalizeUrl failed', urlToUse)
      return
    }

    // Construct the Danbooru search URL
    const uri = new URL('https://danbooru.donmai.us/artists')
    uri.searchParams.set('commit', 'Search')
    uri.searchParams.set('search[order]', 'created_at')
    uri.searchParams.set('search[url_matches]', normalizedUrl)
    chrome.tabs.create({url: uri.toString()})
  }

  if (info.menuItemId === MenuItem.findArtistByNameOnDanbooru) {
    const uri = new URL('https://danbooru.donmai.us/artists')
    uri.searchParams.set('commit', 'Search')
    uri.searchParams.set('search[order]', 'created_at')
    uri.searchParams.set('search[any_name_matches]', String(info.selectionText))
    chrome.tabs.create({url: uri.toString()})
  }

  if (info.menuItemId === MenuItem.searchImageOnIQDB) {
    const imageUrl = info.srcUrl
    if (!imageUrl) {
      console.log('empty url')
      return
    }

    const uri = new URL('https://danbooru.donmai.us/iqdb_queries')
    uri.searchParams.set('search[url]', imageUrl)
    chrome.tabs.create({url: uri.toString()})
  }
})

// Create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  // Search Artist
  chrome.contextMenus.create({
    id: MenuItem.findArtistOnDanbooru,
    title: 'Find Artist',
    contexts: ['page', 'link'], // Show for page or links
  })

  // Search Artist by name
  chrome.contextMenus.create({
    id: MenuItem.findArtistByNameOnDanbooru,
    title: 'Find Artist by name',
    contexts: ['selection'], // Show for  selected text
  })

  // Search image
  chrome.contextMenus.create({
    id: MenuItem.searchImageOnIQDB,
    title: 'Find Image',
    contexts: ['image'], // Show only when right-clicking an image
  })
})

// Function to normalize the URL based on the configured patterns
function normalizeUrl(urlString: string) {
  try {
    const url = new URL(urlString)
    for (const {patterns, resolve} of SITE_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(url)) {
          if (!resolve) return urlString // pass
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
    for (const {patterns, exclude} of SITE_PATTERNS) {
      for (const pattern of exclude ?? []) {
        if (pattern.test(url)) {
          return false
        }
      }

      for (const pattern of patterns) {
        if (pattern.test(url)) {
          return true
        }
      }
    }
  } catch (e) {
    console.error('Failed to validate URL:', {input: urlString, e})
    return false
  }
}
