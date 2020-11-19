export function useSearch(inputSelector, onSearch) {

  const searchValue = window.location.search
    .split("&")
    .find(it => it.includes("search="))
    ?.split("search=")[1]?.replace("%20", " ").replace(/%22/g, "")

  const input = document.querySelector(inputSelector);
  if (searchValue) {
    input.value = searchValue
  }

  input.addEventListener("input", (e) => {
    onSearch(e.target.value)
  })

  return input;
}
