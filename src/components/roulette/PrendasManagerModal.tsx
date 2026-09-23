import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, RotateCcw, Check, Sparkles, Edit2, Percent, Sliders } from 'lucide-react';
import { PrendaItem } from '../../types';
import { DEFAULT_PRENDAS } from '../../data/defaultPrendas';
import { sound } from '../../hooks/useAudio';

interface PrendasManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PrendaItem[];
  onUpdateItems: (items: PrendaItem[]) => void;
}

const COLOR_PALETTE = [
  '#FF5964', // Red
  '#FB8500', // Orange
  '#FFB703', // Yellow
  '#06D6A0', // Green
  '#118AB2', // Blue
  '#8338EC', // Purple
  '#FF70A6', // Hot Pink
  '#4D908E', // Teal
];

export const PrendasManagerModal: React.FC<PrendasManagerModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
}) => {
  const [newText, setNewText] = useState('');
  const [newWeight, setNewWeight] = useState<number>(20);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  if (!isOpen) return null;

  // Total weight among active items for live percentage calculation
  const totalActiveWeight = items
    .filter((i) => i.active)
    .reduce((sum, i) => sum + Math.max(i.weight || 1, 1), 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    sound.playPop();
    const newItem: PrendaItem = {
      id: Date.now().toString(),
      text: newText.trim(),
      color: selectedColor,
      active: true,
      weight: Math.max(1, Math.min(100, Number(newWeight) || 20)),
    };

    onUpdateItems([...items, newItem]);
    setNewText('');
    setNewWeight(20);
    // Rotate to next palette color automatically
    const nextIdx = (COLOR_PALETTE.indexOf(selectedColor) + 1) % COLOR_PALETTE.length;
    setSelectedColor(COLOR_PALETTE[nextIdx]);
  };

  const handleToggleActive = (id: string) => {
    sound.playTick(550);
    onUpdateItems(
      items.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  const handleWeightChange = (id: string, weightVal: number) => {
    const safeWeight = Math.max(1, Math.min(100, weightVal));
    onUpdateItems(
      items.map((item) =>
        item.id === id ? { ...item, weight: safeWeight } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    sound.playTick(350);
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  const handleStartEdit = (item: PrendaItem) => {
    sound.playPop();
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    sound.playPop();
    onUpdateItems(
      items.map((item) => (item.id === id ? { ...item, text: editText.trim() } : item))
    );
    setEditingId(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar as prendas originais com as probabilidades padrão?')) {
      sound.playWin();
      onUpdateItems(DEFAULT_PRENDAS);
    }
  };

  const activeCount = items.filter((i) => i.active).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-soft-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A0C4FF] to-[#FFC6FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Gerenciar Prendas & Chances</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {activeCount} de {items.length} itens ativos na roleta
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form to Add New Prenda */}
          <form onSubmit={handleAddItem} className="p-4 bg-slate-50 border-b border-slate-100 space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Ex: Pague um lanche, Faça massagem..."
                className="flex-1 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A0C4FF]"
                maxLength={40}
              />
              <button
                type="submit"
                disabled={!newText.trim()}
                className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  newText.trim()
                    ? 'bg-slate-800 text-white shadow-sm hover:bg-slate-900 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Weight and Color Settings */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              {/* Color Palette Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Cor:</span>
                <div className="flex items-center gap-1">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform ${
                        selectedColor === color
                          ? 'border-slate-800 scale-110 shadow-sm'
                          : 'border-white opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Initial Weight Slider */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-slate-400" />
                  Peso inicial:
                </span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                  className="w-20 accent-slate-800 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 w-6 text-right">
                  {newWeight}
                </span>
              </div>
            </div>
          </form>

          {/* Items List with Live Weight and Probability Sliders */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhuma prenda cadastrada. Adicione uma acima!
              </div>
            ) : (
              items.map((item) => {
                const weight = Math.max(item.weight || 1, 1);
                const percent =
                  totalActiveWeight > 0 && item.active
                    ? ((weight / totalActiveWeight) * 100).toFixed(1)
                    : '0.0';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.active
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-50/60 border-slate-100 opacity-60'
                    }`}
                  >
                    {/* Top Row: Checkbox, Color, Text, Probability Badge, Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-1">
                        {/* Toggle Active Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item.id)}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors border flex-shrink-0 ${
                            item.active
                              ? 'bg-slate-800 border-slate-800 text-white'
                              : 'border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>

                        {/* Color dot */}
                        <div
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />

                        {/* Text / Inline Edit */}
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-2 py-0.5 text-sm border border-slate-300 rounded-lg focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="px-2 py-1 bg-slate-800 text-white text-xs rounded-lg font-bold"
                            >
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`text-sm font-semibold truncate ${
                              item.active ? 'text-slate-800' : 'text-slate-400 line-through'
                            }`}
                          >
                            {item.text}
                          </span>
                        )}
                      </div>

                      {/* Percentage Badge & Action Icons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-0.5 ${
                            item.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title={`Probabilidade de sorteio: ${percent}%`}
                        >
                          <Percent className="w-2.5 h-2.5" />
                          <span>{percent}%</span>
                        </span>

                        {editingId !== item.id && (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Editar texto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          title="Excluir prenda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Weight Slider and Stepper Controls */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span>Peso:</span>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(item.id, weight - 1)}
                          disabled={weight <= 1}
                          className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-slate-800 min-w-[20px] text-center">
                          {weight}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleWeightChange(item.id, weight + 1)}
                          disabled={weight >= 100}
                          className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Interactive Weight Range Slider */}
                      <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={weight}
                          onChange={(e) =>
                            handleWeightChange(item.id, Number(e.target.value))
                          }
                          className="w-full accent-slate-800 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Reset Defaults and Done button */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 py-2 px-3 rounded-xl hover:bg-slate-200/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#A0C4FF] to-[#FFC6FF] text-slate-900 font-bold text-xs shadow-sm hover:opacity-95"
            >
              Pronto
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
