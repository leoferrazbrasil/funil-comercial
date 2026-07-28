export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};

export default async function middleware(request) {
  const accept = request.headers.get('accept') || '';
  
  if (accept.includes('text/markdown')) {
    const url = new URL('/.well-known/llms.txt', request.url);
    const response = await fetch(url);
    
    // Create a new response to ensure Content-Type is text/markdown
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Type', 'text/markdown; charset=utf-8');
    return newResponse;
  }
}
