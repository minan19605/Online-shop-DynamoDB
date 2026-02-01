'use client'

import { useActionState, useState, useEffect } from "react";
import { createVendorAction, ActionState } from "@/app/actions/vendor-actions";
import { ResultModal } from "@/components/ResultModal";

const VENDOR_OPTIONS = [
  { id: "COSTCO", name: "Costco Wholesale", logo: '/vendors/Costco-Logo.png'},
  { id: "ALDI", name: "ALDI U.S.", logo: '/vendors/Aldi-Logo.png' },
  { id: "TARGET", name: "Target" , logo: '/vendors/Target-Logo.png'},
  { id: "WALMART", name: "Walmart", logo: '/vendors/Walmart-Logo.png' },
];

const initialState: ActionState = {
    success: false,
    message: ''
}

export default function AddVendorPage() {
    const [state, formAction, pending] = useActionState(
        createVendorAction,
        initialState,
    )

    const [modalOpen, setModalOpen] = useState(false)
    const [selectedId, setSelectedId] = useState('')
    const selectedVendor = VENDOR_OPTIONS.find(v => v.id === selectedId)

    useEffect(() => {
        if (state.message) {
            setModalOpen(true)
            // 成功后重置表单
            // const form = document.querySelector("form") as HTMLFormElement;
            // form?.reset();
            setSelectedId('')

        }
    }, [state])

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add new Vendor</h1>
      
      <form action={formAction} className="flex flex-col gap-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor ID</label>
          <select 
            name="vendorId"
            value={selectedId}
            onChange={(e)=> setSelectedId(e.target.value)}
            className="w-full border border-gray-300 p-2.5 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">-- Please select --</option>
            {VENDOR_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.id}</option>
            ))}
          </select>
        <input 
          name="name" 
          placeholder="Vendor Name" 
          className="border p-2 rounded text-black cursor-not-allowed"
          value={selectedVendor?.name || ''}
          readOnly
          required 
        />
        <input 
          name="logo" 
          placeholder="Vendor logo" 
          className="border p-2 rounded text-black/40 cursor-not-allowed"
          value={selectedVendor?.logo || ''}
          readOnly
          required 
        />
        <select name="type" className="border p-2 rounded text-black">
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
        </select>
        
        <button 
          type="submit" 
          disabled={pending}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </form>

      {/* 只在成功时显示中间弹窗 */}
      <ResultModal
        open={modalOpen}
        success={state.success}
        message={state.message}
        onClose={() => setModalOpen(false)}
      />
      
    </div>
  );
}