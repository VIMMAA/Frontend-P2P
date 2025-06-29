export async function getPostType(api, id) {
    const response = await api.fetchWithAuth(`/Task/${id}/CheckType`);
    const responseData = await response.json();
    return responseData === "Work";
}

export function formatDate (isoUTC){
    const date = new Date(isoUTC); // создаём объект Date

// преобразуем в формат "YYYY-MM-DDTHH:MM"
    const localISO = date.toISOString().slice(0, 16);
    return localISO;
}