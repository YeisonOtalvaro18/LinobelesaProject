const API_URL = "http://localhost:8000/api/reviews"; 

const Reviews = {
  async getAll() {
    const res = await fetch(API_URL);
    return await res.json();
  },
  async create(comentario) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comentario),
    });
    return await res.json();
  },
  async addReply(id, respuesta) {
    const res = await fetch(`${API_URL}/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(respuesta),
    });
    return await res.json();
  },
  async react(id, tipo) {
    const res = await fetch(`${API_URL}/${id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });
    return await res.json();
  },
  async reactReply(id, idxResp, tipo) {
    const res = await fetch(`${API_URL}/${id}/reply/${idxResp}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });
    return await res.json();
  },
};

export default Reviews;
Reviews