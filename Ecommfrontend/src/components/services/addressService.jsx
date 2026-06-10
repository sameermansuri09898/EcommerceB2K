const API = "http://127.0.0.1:8000/api";

const getToken = () =>
  localStorage.getItem("access");

export const getAddresses = async () => {
  const res = await fetch(
    `${API}/shipping/list/`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return await res.json();
};

export const createAddress = async (data) => {
  const res = await fetch(
    `${API}/shipping/create/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    }
  );

  return await res.json();
};

export const updateAddress = async (
  id,
  data
) => {
  const res = await fetch(
    `${API}/shipping/update/${id}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    }
  );

  return await res.json();
};

export const deleteAddress = async (id) => {
  const res = await fetch(
    `${API}/shipping/delete/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return await res.json();
};

export const setDefaultAddress = async (
  id
) => {
  const res = await fetch(
    `${API}/shipping/default/${id}/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );

  return await res.json();
};