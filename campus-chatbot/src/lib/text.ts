// strip HTML that comes from Google (e.g., "<b>Turn right</b>")
export function htmlToText(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
