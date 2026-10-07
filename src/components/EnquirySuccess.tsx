import React from 'react';
import { CheckCircle, Calendar, Users, MapPin, Mail, ArrowLeft } from 'lucide-react';

interface EnquirySuccessProps {
  formData: {
    name: string;
    email: string;
    destination: string;
    travelDate: string;
    travelers: string | number;
    message?: string;
  };
  onReset: () => void;
}

export default function EnquirySuccess({ formData, onReset }: EnquirySuccessProps) {
  return (
    <div className="bg-white p-8 md:p-12 border border-[#EADCC9] max-w-2xl mx-auto shadow-md">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-[#C5A880] mx-auto mb-4 stroke-[1.2]" />
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#132E20] mb-2 tracking-wide">
          Your Safari Design Begins
        </h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto">
          Thank you, <span className="font-semibold text-[#132E20]">{formData.name}</span>. Your enquiry has been received by KAGZ. A personal travel designer is reviewing your details.
        </p>
      </div>

      <div className="bg-[#FAF7F2] p-6 border-l-4 border-[#C5A880] space-y-4 mb-8">
        <h3 className="font-serif text-lg font-bold text-[#132E20] tracking-wide border-b border-stone-200 pb-2">
          Summary of Your Request
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C5A880]" />
            <span><strong>Destination:</strong> {formData.destination || 'To Be Selected'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C5A880]" />
            <span><strong>Preferred Date:</strong> {formData.travelDate || 'Flexible'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#C5A880]" />
            <span><strong>Travelers:</strong> {formData.travelers} {Number(formData.travelers) === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C5A880]" />
            <span><strong>Contact Email:</strong> {formData.email}</span>
          </div>
        </div>

        {formData.message && (
          <div className="pt-2 text-xs text-stone-500 italic border-t border-stone-200">
            &ldquo;{formData.message}&rdquo;
          </div>
        )}
      </div>

      <div className="space-y-4 text-center">
        <div className="text-xs text-stone-400">
          We will contact you via email or phone within <span className="font-semibold text-[#132E20]">12 to 24 business hours</span> with an initial custom itinerary.
        </div>
        
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#132E20] text-white hover:bg-[#1B3B2B] text-xs uppercase font-semibold tracking-wider transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Explorer</span>
        </button>
      </div>
    </div>
  );
}
