import { useState, useEffect } from "react";

export default function ProductCards() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {

    const controller = new AbortController();

    const fetchProducts = async () => {

      setLoading(true);
      setError(null);

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/productlist/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setUsers(data);

      } catch (error) {

        if (error.name !== "AbortError") {
          setError(error.message);
        }

      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => controller.abort();

  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Products</h1>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
          </li>
        ))}
        {console.log(users)}

      </ul>
    </div>
  );
}