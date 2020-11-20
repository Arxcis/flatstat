export function useActiveLink(fallbackID) {
  renderLink(fallbackID);
  window.addEventListener("hashchange", () => renderLink(fallbackID));
}

function renderLink(fallbackID) {
  const sectionLink = document.getElementById(window.location.hash);
  if (sectionLink) {
    const links = document.querySelectorAll("main nav a");
    for (const link of links) {
      link.classList.remove("active");
    }
    sectionLink?.classList.add("active");
  } else {
    document.getElementById(fallbackID).classList.add("active");
  }
}
