/// <reference lib="deno.ns" />

Deno.test('Test 890481', () => {
  console.log(
    decodeURI(
      'https://danbooru.donmai.us/artists?commit=Search&search%5Border%5D=created_at&search%5Burl_matches%5D=',
    ),
  )
})
Deno.test('Test 137338', () => {
  const uri = new URL('https://danbooru.donmai.us/artists')
  uri.searchParams.set('commit', 'Search')
  uri.searchParams.set('search[order]', 'created_at')
  uri.searchParams.set('search[url_matches]', '')
})
