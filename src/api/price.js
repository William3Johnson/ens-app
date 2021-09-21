import 'whatwg-fetch'

export default function getEtherPrice() {
  return fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=energy-web-token&vs_currencies=EUR'
  )
    .then(res => res.json())
    .catch(() => '') // ignore error
}
