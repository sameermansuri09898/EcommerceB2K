import { useState } from "react";
import { Pencil, Trash2, CheckCircle2, MapPin, Home, Briefcase, MoreHorizontal, Star, Phone, User, Plus, ChevronRight, ArrowLeft } from "lucide-react";

// --- ADDRESS CARD COMPONENT ---
const TYPE_CONFIG = {
  home:  { icon: Home,          label: "Home",  color: "text-violet-600 bg-violet-50 border-violet-100" },
  work:  { icon: Briefcase,     label: "Work",  color: "text-sky-600 bg-sky-50 border-sky-100" },
  other: { icon: MoreHorizontal,label: "Other", color: "text-slate-600 bg-slate-50 border-slate-200" },
};

function AddressCard({ address, onEdit, onDelete, onDefault }) {
  const type = TYPE_CONFIG[address.address_type] || TYPE_CONFIG.other;
  const TypeIcon = type.icon;

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        address.is_default
          ? "border-slate-900 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm"
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {address.is_default && (
        <div className="absolute -top-px left-5 right-5 h-0.5 bg-slate-900 rounded-b-full" />
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${type.color}`}>
            <TypeIcon size={11} />
            {type.label}
          </span>

          {address.is_default && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Default
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <User size={12} className="text-slate-400 shrink-0" />
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              {address.full_name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Phone size={11} className="text-slate-400 shrink-0" />
            <span>+91 {address.mobile_number}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl px-4 py-3 flex gap-2.5">
          <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600 leading-relaxed">
            <p className="line-clamp-2">{address.address_line}</p>
            {(address.landmark || address.opposite_of) && (
              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                {[address.landmark, address.opposite_of].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="font-semibold text-slate-800 mt-1">
              {address.city}, {address.state}&nbsp;
              <span className="font-bold text-slate-900 tracking-wide">{address.zip_code}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(address)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl transition-all duration-150"
          >
            <Pencil size={12} />
            Edit
          </button>

          {!address.is_default && (
            <button
              onClick={() => onDelete(address.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50/50 hover:bg-red-50 border border-transparent hover:border-red-200 px-3 py-2 rounded-xl transition-all duration-150"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>

        {!address.is_default && (
          <button
            onClick={() => onDefault(address.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-900 hover:text-white border border-slate-900 px-3 py-2 rounded-xl transition-all duration-150"
          >
            <Star size={12} />
            Set Default
          </button>
        )}
      </div>
    </div>
  );
}

// --- MAIN PARENT PROFILE COMPONENT ---
export default function AddressManagementDashboard() {
  // Mock Initialization Data
  const [addresses, setAddresses] = useState([
    { id: 1, full_name: "Rahul Sharma", mobile_number: "9876543210", address_line: "Flat No. 405, Sapphire Heights, Sector 62", city: "Noida", state: "Uttar Pradesh", zip_code: "201301", address_type: "home", is_default: true, landmark: "Near Fortis Hospital" },
    { id: 2, full_name: "Rahul Sharma (Office)", mobile_number: "9123456789", address_line: "Tech Park, Tower B, 7th Floor, Sector 135", city: "Noida", state: "Uttar Pradesh", zip_code: "201304", address_type: "work", is_default: false, landmark: "Opposite Metro Station" }
  ]);

  // Core Visibility Engine States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Form State Bindings
  const [formData, setFormData] = useState({ full_name: "", mobile_number: "", address_line: "", city: "", state: "", zip_code: "", address_type: "home", landmark: "" });

  // Switch views and auto-populate if Editing
  const handleOpenForm = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({ ...address });
    } else {
      setEditingAddress(null);
      setFormData({ full_name: "", mobile_number: "", address_line: "", city: "", state: "", zip_code: "", address_type: "home", landmark: "" });
    }
    setIsFormOpen(true); // Toggle State view to absolute isolated Form view
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAddress) {
      // Logic for Update
      setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? { ...addr, ...formData } : addr));
    } else {
      // Logic for Create New One
      const newAddress = { id: Date.now(), ...formData, is_default: addresses.length === 0 };
      setAddresses(prev => [...prev, newAddress]);
    }
    handleCloseForm(); // CRITICAL FIX: Form hides instantly, returning back to the pure list view
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this address?")) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(addr => ({ ...addr, is_default: addr.id === id })));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* BREADCRUMB */}
        <nav className="text-xs font-semibold text-slate-400 mb-6 flex gap-2 items-center tracking-wider uppercase">
          <span className="hover:text-slate-600 cursor-pointer">Account</span>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-bold">Manage Addresses</span>
        </nav>

        {/* CONDITION-1: ISOLATED FORM VIEW */}
        {isFormOpen ? (
          <div className="max-w-2xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100 p-6 sm:p-8 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleCloseForm} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {editingAddress ? "Modify Delivery Address" : "Add New Delivery Address"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Please fill accurate shipping info for seamless logistics counters.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
                  <input required type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition" placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">10-Digit Mobile Number *</label>
                  <input required type="tel" pattern="[0-9]{10}" name="mobile_number" value={formData.mobile_number} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition" placeholder="e.g. 9876543210" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Flat/House No., Building, Street Name *</label>
                <textarea required rows="2" name="address_line" value={formData.address_line} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition resize-none" placeholder="Complete street address parameters..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">City *</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition" placeholder="Noida" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">State *</label>
                  <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition" placeholder="Uttar Pradesh" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Pincode *</label>
                  <input required type="text" name="zip_code" value={formData.zip_code} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition" placeholder="201301" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Landmark / Nearby Identifiers (Optional)</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900 transition" placeholder="e.g. Near Fortis Hospital" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Address Type</label>
                <div className="flex gap-3">
                  {["home", "work", "other"].map(t => (
                    <button key={t} type="button" onClick={() => setFormData(prev => ({ ...prev, address_type: t }))} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition ${formData.address_type === t ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={handleCloseForm} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition shadow-md shadow-slate-900/10">
                  {editingAddress ? "Save Configuration" : "Deploy Address"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          
          // CONDITION-2: PURE DIRECTORY LIST VIEW
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Saved Addresses</h1>
                <p className="text-sm text-slate-500 mt-0.5">Configure your primary accounts logistics pipelines.</p>
              </div>
              <button
                onClick={() => handleOpenForm()}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-slate-800 transition shadow-md shadow-slate-900/15 group"
              >
                <Plus size={14} className="group-hover:rotate-90 transition duration-200" />
                Add New Address
              </button>
            </div>

            {/* RESPONSIVE DYNAMIC GRID */}
            {addresses.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                <MapPin className="mx-auto text-slate-300 mb-3" size={36} />
                <h3 className="font-bold text-slate-800 text-base">No Address Found</h3>
                <p className="text-xs text-slate-400 max-w-[240px] mx-auto mt-1">Please insert a valid shipping location to resume product configurations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={handleOpenForm} // Changes state context immediately to display the isolated form
                    onDelete={handleDelete}
                    onDefault={handleSetDefault}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}