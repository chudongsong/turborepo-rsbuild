import { getFileIcon } from '../src/file-icons'

describe('file icons', () => {
  it('match known extensions', () => {
    expect(getFileIcon('readme.md')).toBe('file')
    expect(getFileIcon('archive.zip')).toBe('zip')
    expect(getFileIcon('image.png')).toBe('png')
    expect(getFileIcon('VIDEO.mp4')).toBe('mp4')
    expect(getFileIcon('photo.JPG')).toBe('JPG') // list包含大写 JPG
  })
  it('fallback to file', () => {
    expect(getFileIcon('noext')).toBe('file')
    expect(getFileIcon('unknown.xyz')).toBe('file')
  })
})