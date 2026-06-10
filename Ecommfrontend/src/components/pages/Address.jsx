import { useEffect, useState } from "react";
import AddressForm from "../forms/AddressForm";
import AddressCard from "../AddressCard";

import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  createAddress
} from "../services/addressService";

export default function Address() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Fetch
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Delete
  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Default
  const handleDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  // OPEN CREATE
  const handleAdd = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  // OPEN EDIT
  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  // SAVE (CREATE + UPDATE)
  const handleSave = async (formData) => {
    try {
      if (editingAddress) {
        // UPDATE
        await updateAddress(editingAddress.id, formData);
      } else {
        // CREATE
        await createAddress(formData);
      }

      setShowForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">My Addresses</h1>

        <button
          onClick={handleAdd}
          className="bg-black text-white px-5 py-2 rounded-lg"
        >
          Add New Address
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="mb-6">
          <AddressForm
            onSubmit={handleSave}
            initialData={editingAddress}
          />
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">

          {addresses.length === 0 ? (
            <p className="text-gray-500">No addresses found.</p>
          ) : (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onDelete={handleDelete}
                onDefault={handleDefault}
                onEdit={handleEdit}
              />
            ))
          )}

        </div>
      )}
    </div>
  );
}