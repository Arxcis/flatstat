export function useSearch(inputSelector, onSearch) {

  const searchValue = window.location.search
    .split("&")
    .find(it => it.includes("search="))
    ?.split("search=")[1]

  const input = document.querySelector(inputSelector);
  if (searchValue) {
    input.value = searchValue
  }

  input.addEventListener("input", (e) => {
    onSearch(e.target.value)
  })

  return input;
}
