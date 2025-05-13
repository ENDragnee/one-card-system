'use client'

import React, { useState, useEffect } from 'react';
import { RegistrationForm } from '@/components/RegistrationForm';
import { ParticipantTable } from '@/components/ParticipantTable';
import { Users } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button"


interface Participant {
  id: string;
  fullName: string;
  photo: string;
  phoneNumber: string;
  university: string;
  responsibility: string;
  barcode: string;
  honor: string;
}

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [activeTab, setActiveTab] = useState("register");

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/participants?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete participant');
      }

      fetchParticipants();
    } catch (error) {
      console.error('Error deleting participant:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center">Sports Festival Management</h1>
        <Button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          Sign Out
        </Button>
      </div>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("register")}
          className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 ${
            activeTab === "register"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Registration
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 ${
            activeTab === "manage"
              ? "bg-green-500 text-white shadow-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <Users className="w-5 h-5 inline-block mr-2" />
          Manage Participants
        </button>
      </div>
      <div className="mt-6">
        {activeTab === "register" && (
          <RegistrationForm editingParticipant={editingParticipant} />
        )}
        {activeTab === "manage" && (
          <ParticipantTable
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
