// X/Twitter cards don't fall back to the Open Graph image file convention, so
// the same generated card is re-exported under the twitter-image route.
export { default, alt, size, contentType } from "./opengraph-image";
