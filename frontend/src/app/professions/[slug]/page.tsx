import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfessionDetailView } from '@/components/profession-detail';
import { ApiError, getCrafts, getProfessionDetail } from '@/lib/api';
import { getAdventurerMapsData, getMonumentsData, getProfessorStudentsData } from '@/lib/local-data';

export const dynamic = 'force-dynamic';

type ProfessionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProfessionPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profession = await getProfessionDetail(slug);
    return { title: `${profession.name} | PXG Tools` };
  } catch {
    return { title: 'Profissao | PXG Tools' };
  }
}

export default async function ProfessionPage({ params }: ProfessionPageProps) {
  const { slug } = await params;

  try {
    const [profession, craftData, studentsData, monumentsData, adventurerMapsData] = await Promise.all([
      getProfessionDetail(slug),
      getCrafts({ profession: slug }),
      getProfessorStudentsData(),
      getMonumentsData(),
      getAdventurerMapsData(),
    ]);

    return (
      <ProfessionDetailView
        profession={profession}
        crafts={craftData.crafts}
        studentsData={studentsData}
        monumentsData={monumentsData}
        adventurerMapsData={adventurerMapsData}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
