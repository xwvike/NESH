export async function loadBinary(path: string) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()
    req.open('GET', path)
    req.overrideMimeType('text/plain; charset=x-user-defined')
    req.onload = function () {
      if (this.status === 200) {
        if (req.responseText.match(/^<!doctype html>/i)) {
          reject(new Error('Page not found'))
        }

        resolve(this.responseText)
      } else if (this.status === 0) {
        // Aborted, so ignore error
      } else {
        reject(new Error(req.statusText))
      }
    }
    req.onerror = function () {
      reject(new Error(req.statusText))
    }
    req.onprogress = function () {
      // console.log('Downloading...', req.responseText.length)
    }
    req.send()
  })
}
