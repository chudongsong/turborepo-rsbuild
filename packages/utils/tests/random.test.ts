import { getRandomChart, getRandomPwd, getRandom } from '../src/random'

describe('random utils', () => {
  it('getRandomChart', () => {
    const s = getRandomChart(10)
    expect(s.length).toBe(10)
  })
  it('getRandomChart default params', () => {
    const s = getRandomChart()
    expect(s.length).toBe(10)
  })
  it('getRandomPwd', () => {
    const s = getRandomPwd(16)
    expect(s.length).toBe(16)
    const s2 = getRandomPwd()
    expect(s2.length).toBe(16)
  })
  it('getRandom', () => {
    const s = getRandom(8)
    expect(s.length).toBe(8)
    const s2 = getRandom()
    expect(s2.length).toBe(8)
  })
  it('getRandomChart variant types', () => {
    const letters = getRandomChart(5, 'letter')
    expect(/^[A-Za-z]{5}$/.test(letters)).toBe(true)
    const pw = getRandomChart(12, 'password')
    expect(pw.length).toBe(12)
    const wp = getRandomChart(5, 'wp')
    expect(wp.length).toBe(5)
  })
})