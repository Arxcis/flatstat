export function useSearch(inputSelector, onSearch) {
  const input = document.querySelector(inputSelector);

  input.addEventListener("input", (e) => {
    onSearch(e.target.value)
  })
}
