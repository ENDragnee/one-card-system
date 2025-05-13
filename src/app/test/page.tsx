'use client';

import { useState, useEffect } from 'react';
import React, { Suspense } from 'react';
import IdCards from '@/components/id-card-atm';
import { IdCardProps } from '../../../types/id-card';
import { useSearchParams } from 'next/navigation';

const PageContent = () => {
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<IdCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const universityId = searchParams.get('uni') || '';
        if (!universityId) {
          throw new Error('University ID is required');
        }

        const response = await fetch(`/api/download?university=${universityId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data: IdCardProps[] = await response.json();
        setCards(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return <IdCards cards={cards} />;
};

const Page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
