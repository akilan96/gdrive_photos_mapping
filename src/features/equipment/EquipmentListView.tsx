import React, { useState } from 'react';
import { Camera, Plus, Search, Filter, Edit, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStudioStore } from '../../stores/useStudioStore';
import { Equipment, EquipmentCategory, EquipmentCondition } from '../../types';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const CATEGORIES: EquipmentCategory[] = [
  'DSLR Camera',
  'Mirrorless Camera',
  'Cinema Camera',
  'Lens',
  'Drone',
  'Gimbal',
  'Tripod',
  'Lighting',
  'Audio Equipment',
  'Memory Cards',
  'Accessories',
];

export const EquipmentListView: React.FC = () => {
  const equipment = useStudioStore((s) => s.equipment);
  const events = useStudioStore((s) => s.events);
  const addEquipment = useStudioStore((s) => s.addEquipment);
  const updateEquipment = useStudioStore((s) => s.updateEquipment);
  const deleteEquipment = useStudioStore((s) => s.deleteEquipment);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('Mirrorless Camera');
  const [brand, setBrand] = useState('Sony');
  const [model, setModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<EquipmentCondition>('Good');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Mirrorless Camera');
    setBrand('Sony');
    setModel('');
    setQuantity(1);
    setCondition('Good');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setBrand(item.brand);
    setModel(item.model);
    setQuantity(item.quantity);
    setCondition(item.condition);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter equipment name.');
      return;
    }

    if (editingItem) {
      updateEquipment(editingItem.id, {
        name,
        category,
        brand,
        model,
        quantity: Number(quantity),
        condition,
        notes,
      });
    } else {
      addEquipment({
        name,
        category,
        brand,
        model,
        quantity: Number(quantity),
        condition,
        notes,
        assignedEventIds: [],
      });
    }

    setIsModalOpen(false);
  };

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27555C]/50">
        <div>
          <h1 className="text-2xl font-black text-white font-heading tracking-tight">
            Equipment & Gear Inventory
          </h1>
          <p className="text-xs sm:text-sm text-[#AEC5C7]">
            Maintain high-end cameras, prime lenses, cinema drones, lighting rigs, and audio kits.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black transition-all shadow-lg shadow-[#50E2E5]/20"
        >
          <Plus size={16} />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#092328]/80 border border-[#27555C] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by gear name, brand, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-white placeholder-gray-400 focus:outline-none focus:border-[#50E2E5]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-gray-300 focus:outline-none focus:border-[#50E2E5]"
        >
          <option value="ALL">All Categories ({equipment.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipment.map((item) => {
          const linkedEvents = events.filter((e) => item.assignedEventIds.includes(e.id));

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#092328]/85 border border-[#27555C] hover:border-[#50E2E5]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#50E2E5]/15 text-[#50E2E5] border border-[#50E2E5]/30">
                    {item.category}
                  </span>
                  <Badge variant={item.condition === 'New' || item.condition === 'Good' ? 'green' : 'amber'}>
                    {item.condition}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-white mb-0.5">{item.name}</h3>
                <p className="text-xs text-[#AEC5C7]">
                  {item.brand} • Model: <span className="text-white font-mono">{item.model}</span>
                </p>

                {item.notes && (
                  <p className="text-xs text-gray-400 mt-2.5 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#27555C]/50 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400">Qty: </span>
                  <span className="font-bold text-white">{item.quantity}</span>
                  <span className="text-gray-400 ml-2">
                    ({linkedEvents.length} shoots assigned)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit Item"
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(item.id)}
                    title="Delete Item"
                    className="p-1.5 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-[#092328] border border-[#27555C] rounded-3xl shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-base font-bold text-white font-heading mb-4">
              {editingItem ? 'Edit Equipment Gear' : 'Add New Equipment'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony FX3 Cinema Line"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as EquipmentCondition)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Needs Service">Needs Service</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="Sony"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="ILME-FX3"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Battery condition, special usage notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#000F13] border border-[#27555C] text-white focus:outline-none focus:border-[#50E2E5]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-[#50E2E5] hover:bg-[#3bc8cb] text-black rounded-xl shadow-lg shadow-[#50E2E5]/20"
                >
                  Save Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Delete Gear Item"
        message="Are you sure you want to remove this equipment from the inventory?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteEquipment(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

