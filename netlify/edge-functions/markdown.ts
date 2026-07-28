export default async (request, context) => {
  const accept = request.headers.get("Accept") || "";
  
  if (accept.includes("text/markdown")) {
    const url = new URL("/.well-known/llms.txt", request.url);
    const response = await fetch(url);
    
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Content-Type", "text/markdown; charset=utf-8");
    return newResponse;
  }
  
  return context.next();
};

export const config = {
  path: "/*",
  excludedPath: ["/*.css", "/*.js", "/*.svg", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.gif"]
};
