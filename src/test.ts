import {expect} from 'jsr:@std/expect/expect'

Deno.test('Test 103147', async (t) => {
  const p = new URLPattern({hostname: 'x.com', pathname: '/:username/*?'})

  const validLinks = [
    'https://x.com/user',
    'https://x.com/user/',
    'https://x.com/user/media',
    'https://x.com/user/media/123421',
    'https://x.com/user/status/123456',
    'https://x.com/user/any/thing/here',
  ]

  for (const url of validLinks) {
    console.log(p.test(url), url)
    expect(p.test(url)).toBeTruthy()
    expect(p.exec(url)?.pathname.groups.username).toEqual('user')
  }
})

Deno.test('Test 578801', async (t) => {
  const p = new URLPattern({hostname: 'www.pixiv.net', pathname: '/jump.php', search: 'url=:target'})
  const url = 'https://www.pixiv.net/jump.php?url=https%3A%2F%2Fx.com%2Fmiych111'

  console.log(p.exec(url)?.search.groups.target)
  console.log(decodeURIComponent(p.exec(url)?.search.groups.target!))
})

Deno.test('Test 062369', async (t) => {
  const p = new URLPattern({hostname: ':username.fanbox.cc'})
  const url = 'https://miychi.fanbox.cc/'

  console.log(p.exec(url))
})
