addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const variantAPI = 'https://cfw-takehome.developers.workers.dev/api/variants'
  var variantIndex = null

  const urlArray = await fetch(variantAPI)
  if (!urlArray.ok) {
    throw Error('Error Fetching Variant URL\'s')
  }
  
  const apiResponse = await urlArray.json()

  const cookie = request.headers.get('cookie')
  console.log(cookie)

  if (cookie) {
    const ca = cookie.split(';')
    for (var i = 0; i < ca.length; i++) {
      var cookieName = ca[i].split('=')
      if (cookieName[0] == 'variantIndex') {
        variantIndex = parseInt(cookieName[1])
      }
    }
  } 

  if (variantIndex == null) {
    variantIndex = Math.round(Math.random() * apiResponse.variants.length)
  }

  const variantURL = apiResponse.variants[variantIndex]
  const variantResponse = await fetch(variantURL)
  if (!variantResponse.ok) {
    throw Error('Error Fetching Variant ' + variantIndex)
  }

  const response = await new HTMLRewriter().on('*', new ElementHandler(variantIndex + 1)).transform(variantResponse)
  response.headers.append('Set-Cookie', 'variantIndex=' + variantIndex + ';')
  response.body
  return response
}

class ElementHandler {
  constructor(variantNum) {
    this.variantNum = variantNum
    this.requirementsCheckList = 
    '<br>\
    <i>Requirements</i>\
    <div class="border-t py-4"><input class="mx-4" type="checkbox" name="requirement1"><span class>1. Request the URLs from the API</span></div>\
    <div class="border-t py-4"><input class="mx-4" type="checkbox" name="requirement2"><span class>2. Request a (random: see #3) variant</span></div>\
    <div class="border-t py-4"><input class="mx-4" type="checkbox" name="requirement3"><span class>3. Distribute requests between variants</span></div>\
    <i>Extra Credits</i>\
    <div class="border-t py-4"><input class="mx-4" type="checkbox" name="requirement4"><span class>4. Changing copy/URLs</span></div>\
    <div class="border-t py-4"><input class="mx-4" type="checkbox" name="requirement5"><span class>5. Persisting variants</span></div>\
    <div class="border-t py-4"><input class="mx-4" type="checkbox" name="requirement6"><span class>6. Publish to a domain</span></div>'

  }

  element(element) {
    if (element.tagName == 'title') {
      element.setInnerContent('Full Stack Project Submission By Hamid Haris');
    }

    if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
      element.setInnerContent('Hamid\'s version of Variant ' + this.variantNum)
    }

    if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
      element.setInnerContent('The following is a requirements checklist that I think would help you evaluate my submission.')
    }

    if (element.tagName == 'div' && element.getAttribute('class') == 'mt-2'){
      element.append(this.requirementsCheckList, {html: true})
    }

    if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
      element.setInnerContent('Please visit my Github Account :)');
      element.setAttribute('href', 'https://github.com/hhamid35');
    }
  }
}
