import * as utils from '../src'

describe('index exports', () => {
  it('exposes expected modules', () => {
    expect(typeof utils.checkUrl).toBe('function')
    expect(typeof utils.formatTime).toBe('function')
    expect(typeof utils.hexToRgb).toBe('function')
    expect(typeof utils.getRandom).toBe('function')
    expect(typeof utils.clearBlankSpace).toBe('function')
  })
})