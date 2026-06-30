'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CraftExplorer } from '@/components/craft-explorer';
import { EntityLink, entityQueryHref } from '@/components/entity-link';
import { FavoriteButton } from '@/components/favorite-button';
import type { Craft } from '@/types/crafts';
import type {
  AdventurerMapsPayload,
  MonumentsPayload,
  ProfessionDetail,
  ProfessionLink,
  ProfessorStudentsPayload,
} from '@/types/professions';

type ProfessionDetailViewProps = {
  profession: ProfessionDetail;
  crafts: Craft[];
  studentsData: ProfessorStudentsPayload;
  monumentsData: MonumentsPayload;
  adventurerMapsData: AdventurerMapsPayload;
};

const professionTabLabels: Record<string, string> = {
  engenheiro: 'Engenheiro',
  professor: 'Professor',
  estilista: 'Estilista',
  aventureiro: 'Aventureiro',
};

export function ProfessionDetailView({
  profession,
  crafts,
  studentsData,
  monumentsData,
  adventurerMapsData,
}: ProfessionDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const specialTabs = profession.specializations.map((link) => ({
    id: link.slug,
    label: link.title,
    link,
  }));
  const featureTabs = getFeatureTabs(profession);
  const allTabs = [
    { id: 'overview', label: professionTabLabels[profession.slug] || profession.name },
    ...specialTabs.map((tab) => ({ id: tab.id, label: tab.label })),
    ...featureTabs.map((tab) => ({ id: tab.id, label: tab.label })),
    { id: 'general-crafts', label: 'Crafts gerais' },
  ];
  const activeSpecialization = profession.specializations.find((link) => link.slug === activeTab);
  const activeFeature = featureTabs.find((tab) => tab.id === activeTab);
  const generalCrafts = crafts.filter((craft) => !craft.subprofessionSlug);
  const specializationCrafts = activeSpecialization
    ? crafts.filter((craft) => craft.subprofessionSlug === activeSpecialization.slug)
    : [];

  return (
    <article className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-[84px_1fr]">
            {profession.iconUrl ? (
              <img src={profession.iconUrl} alt={profession.name} className="h-20 w-20 object-contain" loading="lazy" />
            ) : null}
            <div>
              <Link href="/professions" className="inline-flex items-center gap-2 text-sm font-black text-cyan-200 hover:text-cyan-100">
                <ArrowLeft className="h-4 w-4" />
                Voltar para profissoes
              </Link>
              <h2 className="mt-3 text-3xl font-black text-white">{profession.name}</h2>
              <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-300">{profession.summary}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <a
              href={profession.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 text-sm font-black text-slate-100 hover:border-amber-300/50 hover:text-amber-100"
            >
              Wiki
              <ExternalLink className="h-4 w-4" />
            </a>
            <FavoriteButton
              entity={{
                type: 'Profissao',
                slug: profession.slug,
                title: profession.name,
                url: `/professions/${profession.slug}`,
                imageUrl: profession.iconUrl,
                summary: profession.summary,
              }}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'min-h-10 rounded-lg border px-3 text-sm font-black transition',
              activeTab === tab.id
                ? 'border-cyan-300/70 bg-cyan-300/15 text-white'
                : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <ProfessionOverview
          profession={profession}
          crafts={crafts}
          generalCraftIcon={profession.crafts[0]?.iconUrl || profession.iconUrl}
          setActiveTab={setActiveTab}
        />
      ) : null}

      {activeSpecialization ? (
        <SpecializationPanel link={activeSpecialization} crafts={specializationCrafts} professionSlug={profession.slug} />
      ) : null}

      {activeFeature ? (
        <FeaturePanel
          featureId={activeFeature.id}
          profession={profession}
          studentsData={studentsData}
          monumentsData={monumentsData}
          adventurerMapsData={adventurerMapsData}
        />
      ) : null}

      {activeTab === 'general-crafts' ? (
        <CraftExplorer
          crafts={generalCrafts}
          compact
          showRankFilter
          title="Crafts gerais"
          description="Crafts da profissao que nao dependem de especializacao."
        />
      ) : null}
    </article>
  );
}

function ProfessionOverview({
  profession,
  crafts,
  generalCraftIcon,
  setActiveTab,
}: {
  profession: ProfessionDetail;
  crafts: Craft[];
  generalCraftIcon: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Especializacoes</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {profession.specializations.map((link) => (
            <LinkCard key={link.slug} link={link} onClick={() => setActiveTab(link.slug)} kind="especializacao" />
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">Caracteristicas</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {getFeatureTabs(profession).map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => setActiveTab(feature.id)}
              className="grid grid-cols-[42px_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3 text-left transition hover:border-cyan-300/60"
            >
              {feature.iconUrl ? <img src={feature.iconUrl} alt="" className="h-10 w-10 object-contain" loading="lazy" /> : <span />}
              <span>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">{feature.kind}</span>
                <span className="mt-1 block text-base font-black text-white">{feature.label}</span>
                <span className="mt-1 block text-sm text-slate-300">{feature.summary}</span>
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setActiveTab('general-crafts')}
            className="grid grid-cols-[42px_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3 text-left transition hover:border-cyan-300/60"
          >
            {generalCraftIcon ? <img src={generalCraftIcon} alt="" className="h-10 w-10 object-contain" loading="lazy" /> : <span />}
            <span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">crafts</span>
              <span className="mt-1 block text-base font-black text-white">Crafts gerais</span>
              <span className="mt-1 block text-sm text-slate-300">Crafts sem influencia direta de especializacao, organizados por rank.</span>
            </span>
          </button>
        </div>
      </section>
      <ImportantProfessionItems crafts={crafts} />
    </div>
  );
}

function ImportantProfessionItems({ crafts }: { crafts: Craft[] }) {
  const items = useMemo(() => {
    const byKey = new Map<string, { name: string; slug: string; imageUrl: string; count: number }>();
    for (const craft of crafts) {
      const key = craft.itemSlug || craft.itemName;
      const current = byKey.get(key);
      byKey.set(key, {
        name: craft.itemName,
        slug: craft.itemSlug || craft.itemName,
        imageUrl: craft.imageUrl,
        count: (current?.count || 0) + 1,
      });
    }
    return [...byKey.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR')).slice(0, 18);
  }, [crafts]);

  if (!items.length) return null;

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-lg font-black text-white">Itens importantes</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <EntityLink key={item.slug} href={entityQueryHref('/crafts', 'item', item.slug)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-2.5 py-1 text-xs">
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-5 w-5 object-contain" loading="lazy" /> : null}
              {item.name}
            </span>
          </EntityLink>
        ))}
      </div>
    </section>
  );
}

function SpecializationPanel({ link, crafts, professionSlug }: { link: ProfessionLink; crafts: Craft[]; professionSlug: string }) {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="grid gap-4 sm:grid-cols-[64px_1fr]">
          {link.iconUrl ? <img src={link.iconUrl} alt={link.title} className="h-16 w-16 object-contain" loading="lazy" /> : null}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">especializacao</span>
            <h3 className="mt-1 text-2xl font-black text-white">{link.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{link.summary}</p>
            <a href={link.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-black text-cyan-200 hover:text-cyan-100">
              Abrir na Wiki
            </a>
          </div>
        </div>
      </section>
      <ResourceNotes professionSlug={professionSlug} specializationSlug={link.slug} />
      <CraftExplorer
        crafts={crafts}
        compact
        showRankFilter={false}
        title="Crafts exclusivos"
        description={`Crafts relacionados a ${link.title}, com busca por item ou ingrediente.`}
      />
    </div>
  );
}

function FeaturePanel({
  featureId,
  profession,
  studentsData,
  monumentsData,
  adventurerMapsData,
}: {
  featureId: string;
  profession: ProfessionDetail;
  studentsData: ProfessorStudentsPayload;
  monumentsData: MonumentsPayload;
  adventurerMapsData: AdventurerMapsPayload;
}) {
  if (featureId === 'students') return <StudentsPanel data={studentsData} />;
  if (featureId === 'monuments') return <MonumentsPanel data={monumentsData} />;
  if (featureId === 'map-finder') return <AdventurerMapPanel data={adventurerMapsData} />;

  const link = [...profession.subsections, ...profession.crafts].find((item) => item.slug === featureId);
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-xl font-black text-white">{link?.title || 'Caracteristica'}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{link?.summary || 'Conteudo em preparacao.'}</p>
      {link?.sourceUrl ? (
        <a href={link.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-black text-cyan-200 hover:text-cyan-100">
          Abrir na Wiki
        </a>
      ) : null}
    </section>
  );
}

function StudentsPanel({ data }: { data: ProfessorStudentsPayload }) {
  const [clan, setClan] = useState(data.groups[0]?.clan || '');
  const group = data.groups.find((item) => item.clan === clan) || data.groups[0];
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-xl font-black text-white">Estudantes</h3>
      <div className="mt-3 max-w-xs">
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          Cla
          <select value={group?.clan || ''} onChange={(event) => setClan(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
            {data.groups.map((item) => <option key={item.clan} value={item.clan}>{item.clan}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-cyan-300/10 text-left text-cyan-100">
            <tr><th className="border border-white/10 p-3">Card</th><th className="border border-white/10 p-3">Level</th><th className="border border-white/10 p-3">Pokemon</th></tr>
          </thead>
          <tbody>
            {(group?.students || []).map((student) => (
              <tr key={student.name} className="bg-white/[0.03]">
                <td className="border border-white/10 p-3 font-bold text-white">{student.iconUrl ? <img src={student.iconUrl} alt="" className="mr-2 inline h-8 w-8 object-contain" /> : null}{student.name}</td>
                <td className="border border-white/10 p-3 text-slate-300">{student.level}</td>
                <td className="border border-white/10 p-3">
                  <div className="flex flex-wrap gap-2">
                    {student.pokemon.map((pokemon) => (
                      <span key={`${student.name}-${pokemon.name}`} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs font-bold text-slate-200">
                        {pokemon.iconUrl ? <img src={pokemon.iconUrl} alt="" className="h-5 w-5 object-contain" /> : null}
                        {pokemon.name}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MonumentsPanel({ data }: { data: MonumentsPayload }) {
  const [area, setArea] = useState('');
  const groups = area ? data.groups.filter((group) => group.area === area) : data.groups;
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-xl font-black text-white">Monumentos</h3>
      <p className="mt-2 text-sm text-slate-300">{data.intro}</p>
      <div className="mt-3 max-w-xs">
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          Area
          <select value={area} onChange={(event) => setArea(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
            <option value="">Todas as areas</option>
            {data.groups.map((group) => <option key={group.area} value={group.area}>{group.area}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.area} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
            <h4 className="font-black text-white">{group.area}</h4>
            <div className="mt-2 grid gap-2">
              {group.monuments.map((monument) => <span key={`${group.area}-${monument.number}`} className="text-sm text-slate-300">#{monument.number} - {monument.coordinates}</span>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdventurerMapPanel({ data }: { data: AdventurerMapsPayload }) {
  const [typeId, setTypeId] = useState('');
  const [locationName, setLocationName] = useState('');
  const selectedType = data.mapTypes.find((type) => type.id === typeId);
  const selectedLocation = selectedType?.locations.find((location) => location.name === locationName);
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-xl font-black text-white">Buscador de Mapas</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          Tipo de Mapa
          <select value={typeId} onChange={(event) => { setTypeId(event.target.value); setLocationName(''); }} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300">
            <option value="">Selecione</option>
            {data.mapTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          Local do X
          <select value={locationName} onChange={(event) => setLocationName(event.target.value)} disabled={!selectedType} className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-300 disabled:opacity-50">
            <option value="">Selecione</option>
            {selectedType?.locations.map((location) => <option key={location.name} value={location.name}>{location.name}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(selectedLocation?.maps || []).slice(0, 48).map((map) => (
          <article key={map.id} className="rounded-lg border border-white/10 bg-slate-950/50 p-3">
            {map.imageUrl ? <img src={map.imageUrl} alt={`Mapa ${map.id}`} className="aspect-[4/3] w-full rounded-md object-cover" loading="lazy" /> : null}
            <h4 className="mt-2 font-black text-white">Mapa {map.id}</h4>
            <p className="text-sm text-slate-300">{map.local} - {map.coordinates}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LinkCard({ link, onClick, kind }: { link: ProfessionLink; onClick: () => void; kind: string }) {
  return (
    <button type="button" onClick={onClick} className="grid grid-cols-[48px_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-3 text-left transition hover:border-cyan-300/60">
      {link.iconUrl ? <img src={link.iconUrl} alt="" className="h-12 w-12 object-contain" loading="lazy" /> : <span />}
      <span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">{kind}</span>
        <span className="mt-1 block text-base font-black text-white">{link.title}</span>
        <span className="mt-1 line-clamp-3 block text-sm text-slate-300">{link.summary}</span>
      </span>
    </button>
  );
}

function ResourceNotes({ professionSlug, specializationSlug }: { professionSlug: string; specializationSlug: string }) {
  const notes = getResourceNotes(professionSlug, specializationSlug);
  if (!notes.length) return null;
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {notes.map((note) => (
        <div key={note.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-lg font-black text-white">{note.title}</h3>
          <ul className="mt-2 grid gap-2 text-sm text-slate-300">
            {note.items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
}

function getFeatureTabs(profession: ProfessionDetail) {
  if (profession.slug === 'engenheiro') {
    return profession.subsections
      .filter((link) => link.slug === 'mini-ammunition-factory')
      .map((link) => ({ id: link.slug, label: link.title, summary: link.summary, iconUrl: link.iconUrl, kind: 'sistema' }));
  }
  if (profession.slug === 'professor') {
    const students = profession.subsections.find((link) => link.slug === 'estudantes');
    return students ? [{ id: 'students', label: 'Estudantes', summary: students.summary, iconUrl: students.iconUrl, kind: 'sistema' }] : [];
  }
  if (profession.slug === 'estilista') {
    const monuments = profession.subsections.find((link) => link.slug === 'monumentos');
    return monuments ? [{ id: 'monuments', label: 'Monumentos', summary: monuments.summary, iconUrl: monuments.iconUrl, kind: 'sistema' }] : [];
  }
  if (profession.slug === 'aventureiro') {
    const maps = profession.subsections.find((link) => link.slug === 'mapas-de-aventureiro');
    return maps ? [{ id: 'map-finder', label: 'Buscador de Mapas', summary: maps.summary, iconUrl: maps.iconUrl, kind: 'sistema' }] : [];
  }
  return [];
}

function getResourceNotes(professionSlug: string, specializationSlug: string) {
  const common = {
    engenheiro: ['Recurso comum compartilhado pelas especializacoes do Engenheiro.', 'Usado em crafts tecnologicos e equipamentos avancados.'],
    professor: ['Recursos ligados a estudos, alunos, berries e alquimia.', 'Parte dos recursos pode ser convertida com High-Tech Device.'],
    estilista: ['Purpleheart Log e recurso comum de Decorador e Designer.', 'Usado em itens Rank S como totens, capsulas e cameras.'],
    aventureiro: ['Recursos vem de exploracao, loot e Nightmare Chests.', 'Corrupted Gold Bars e Strange Gold Bars aparecem em crafts avancados.'],
  }[professionSlug] || ['Recursos coletados conforme a especializacao.'];
  const exclusive = `${specializationSlug} possui recursos e crafts exclusivos listados na Wiki oficial.`;
  return [
    { title: 'Recurso comum', items: common },
    { title: 'Recurso exclusivo', items: [exclusive, 'Consulte os crafts abaixo para ver onde cada recurso e usado.'] },
  ];
}
