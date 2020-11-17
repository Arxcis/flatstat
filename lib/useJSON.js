export async function useJSON(path) {
    const res = await fetch(path);
    console.log({ res })

    const json = await res.json();
    console.log({ json })

    return json;
}