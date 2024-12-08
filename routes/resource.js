import client from "../db/db.js";

// Utility function to sanitize input
function sanitizeInput(input) {
    if (!input) return '';
    return input.replace(/[^a-zA-Z0-9_\- ]/g, '').substring(0, 255);
}

// Utility function to escape output for JSON
function escapeForJSON(input) {
    if (!input) return '';
    return input.replace(/[<>"'&]/g, (char) => {
        const escapeMap = {
            '<': '\\u003C',
            '>': '\\u003E',
            '"': '\\u0022',
            "'": '\\u0027',
            '&': '\\u0026',
        };
        return escapeMap[char];
    });
}

export async function getResources(req) {
    const query = `SELECT resource_id, resource_name, resource_description FROM zephyr_resources`;
    try {
        const result = await client.queryObject(query);

        // Escape all data before sending in JSON response
        const escapedRows = result.rows.map(row => ({
            resource_id: row.resource_id,
            resource_name: escapeForJSON(row.resource_name),
            resource_description: escapeForJSON(row.resource_description),
        }));

        return new Response(JSON.stringify(escapedRows), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function registerResource(req) {
    let resourceName = req.get("resource_name");
    let resourceDescription = req.get("resource_description");

    // Sanitize inputs before storing them
    resourceName = sanitizeInput(resourceName);
    resourceDescription = sanitizeInput(resourceDescription);

    try {
        const query = `INSERT INTO zephyr_resources (resource_name, resource_description) VALUES ($1, $2)`;
        await client.queryArray(query, [resourceName, resourceDescription]);
        return new Response(null, { status: 302, headers: { Location: "/", }, });
    } catch (error) {
        console.error("Error during adding resource:", error.message);
        return new Response("Error during adding resource", { status: 500 });
    }
}
