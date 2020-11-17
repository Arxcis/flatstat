export async function useJSON(path) {
    const res = await fetch(path);
    const json = await res.json();

    return json;
}