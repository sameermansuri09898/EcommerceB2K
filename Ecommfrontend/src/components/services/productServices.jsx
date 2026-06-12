import axios from "axios";

const API = "http://127.0.0.1:8000/api";

const authHeaders = (isFormData = false) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  };
  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
};

export const getMyProducts  = ()           => axios.get(`${API}/user/productlist/`,  { headers: authHeaders() }).then(r => r.data);
export const updateVariant  = (id, data)   => axios.patch(`${API}/variant/${id}/`,   data, { headers: authHeaders(data instanceof FormData) });
export const deleteVariant  = (id)         => axios.delete(`${API}/variant/${id}/`,  { headers: authHeaders() });
export const createVariant  = (data)       => axios.post(`${API}/variant/`,          data, { headers: authHeaders(data instanceof FormData) });