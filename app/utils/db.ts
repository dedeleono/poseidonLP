export async function getDbTrtnUsdc() {
    const response = await fetch(`/api/trtn/usdc`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });
    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
}

export async function getDbTrtnCirc() {
    const response = await fetch(`/api/trtn/circ`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    });
    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
}
