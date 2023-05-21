/**
 * Determines if the screen is in landscape mode.
 * @returns True or false.
 */
function isLandscape() {
  const doc = document.documentElement;
  return doc.scrollWidth > doc.scrollHeight;
}

export default isLandscape;
