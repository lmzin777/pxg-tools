'use client';

import { useMemo, useState } from 'react';
import { Calculator, CircleDot, Dices, Gauge, Sparkles, Table2 } from 'lucide-react';
import {
  ballCatalog,
  boostTypes,
  buildBoostTable,
  calculateBoostCost,
  elementalBallByType,
  formatCurrency,
  formatMoneyLabel,
  getBallIconSrc,
  getCombinedMultiplier,
  getTypeIconSrc,
  pokemonTypes,
  type PokemonType,
} from '@/lib/tools-data';

type ToolId = 'lucky' | 'average' | 'balls' | 'boost' | 'types' | 'boost-table';

const tools: Array<{
  id: ToolId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'lucky',
    title: 'Chance de Drop Lucky',
    description: 'Cheque rapidamente a chance de drop com Lucky e Elixir.',
    icon: Sparkles,
  },
  {
    id: 'average',
    title: 'Media de Balls',
    description: 'Estime a media de balls e custo por tentativa de captura.',
    icon: Calculator,
  },
  {
    id: 'balls',
    title: 'Tipos de Balls',
    description: 'Revise melhores usos e taxas das principais pokebolas.',
    icon: CircleDot,
  },
  {
    id: 'boost',
    title: 'Calculadora de Boost',
    description: 'Calcule stones comuns, Boost Stones e custo total.',
    icon: Gauge,
  },
  {
    id: 'types',
    title: 'Tabela de Tipos',
    description: 'Confira efetividade contra um ou dois tipos defensivos.',
    icon: Dices,
  },
  {
    id: 'boost-table',
    title: 'Tabela de Boost',
    description: 'Veja stones necessarias por nivel e tipo de boost.',
    icon: Table2,
  },
];

export function ToolsDashboard() {
  const [activeTool, setActiveTool] = useState<ToolId>('lucky');

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          ferramentas disponiveis
        </span>
        <h2 className="mt-1 text-2xl font-black text-white">Calculadoras e tabelas</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          As ferramentas do site antigo foram recriadas no frontend Next oficial para consulta rapida de captura,
          boosts, balls e efetividade.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              className={[
                'grid min-h-28 grid-cols-[44px_1fr] gap-3 rounded-lg border p-3 text-left transition',
                isActive
                  ? 'border-cyan-300/70 bg-cyan-300/12'
                  : 'border-white/10 bg-white/[0.035] hover:border-amber-300/60 hover:bg-white/[0.06]',
              ].join(' ')}
            >
              <span className="rounded-md border border-white/10 bg-slate-900 p-2 text-cyan-200">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="text-sm font-black text-white">
                  {index + 1}. {tool.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">{tool.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        {activeTool === 'lucky' ? <LuckyDropTool /> : null}
        {activeTool === 'average' ? <AverageBallsTool /> : null}
        {activeTool === 'balls' ? <BallTypesTool /> : null}
        {activeTool === 'boost' ? <BoostCalculatorTool /> : null}
        {activeTool === 'types' ? <TypeChartTool /> : null}
        {activeTool === 'boost-table' ? <BoostTableTool /> : null}
      </section>
    </div>
  );
}

function NumberField({
  label,
  value,
  min = 0,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-300"
      />
    </label>
  );
}

function TypeSelect({
  label,
  value,
  includeNone,
  onChange,
}: {
  label: string;
  value: PokemonType | '';
  includeNone?: boolean;
  onChange: (value: PokemonType | '') => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as PokemonType | '')}
        className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-300"
      >
        {includeNone ? <option value="">Nenhum</option> : null}
        {pokemonTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultPanel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/8 p-4 text-sm text-cyan-50">{children}</div>;
}

function LuckyDropTool() {
  const [dropPercentage, setDropPercentage] = useState(1);
  const [hasElixir, setHasElixir] = useState(true);
  const luckyLevels = [
    { label: 'Lucky 1', multiplier: 0.1 },
    { label: 'Lucky 2', multiplier: 0.2 },
    { label: 'Lucky 3', multiplier: 0.35 },
    { label: 'Lucky 4', multiplier: 0.5 },
    { label: 'Lucky 5', multiplier: 0.65 },
    { label: 'Lucky 6', multiplier: 0.8 },
    { label: 'Lucky 7', multiplier: 1 },
    { label: 'Lucky 9', multiplier: 1.5 },
  ];

  return (
    <div className="grid gap-4">
      <ToolTitle title="Chance de Drop Lucky" />
      <div className="grid gap-3 md:grid-cols-[260px_1fr]">
        <div className="grid content-start gap-3">
          <NumberField label="Porcentagem de drop" value={dropPercentage} min={0} step={0.01} onChange={setDropPercentage} />
          <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <input type="checkbox" checked={hasElixir} onChange={(event) => setHasElixir(event.target.checked)} />
            Usar Elixir
          </label>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {luckyLevels.map((level) => {
            const base = dropPercentage * (1 + level.multiplier);
            return (
              <ResultPanel key={level.label}>
                <strong className="text-white">{level.label}</strong>
                <span className="mt-2 block">Base: {base.toFixed(2)}%</span>
                {hasElixir ? (
                  <>
                    <span className="block">+20%: {(dropPercentage * (1 + level.multiplier + 0.2)).toFixed(2)}%</span>
                    <span className="block">+80%: {(dropPercentage * (1 + level.multiplier + 0.8)).toFixed(2)}%</span>
                  </>
                ) : null}
              </ResultPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AverageBallsTool() {
  const [npcPrice, setNpcPrice] = useState(100000);
  const [primaryType, setPrimaryType] = useState<PokemonType | ''>('Fire');
  const [secondaryType, setSecondaryType] = useState<PokemonType | ''>('');
  const [primaryBallPrice, setPrimaryBallPrice] = useState(2500);
  const [secondaryBallPrice, setSecondaryBallPrice] = useState(2500);

  const result = useMemo(() => {
    const elementalAverage = 2 * (npcPrice / 250);
    const ultraAverage = 2 * (npcPrice / 130);
    const ultraCost = Math.ceil((ultraAverage * 130) / 1000);
    const selectedTypes = [primaryType, secondaryType].filter(Boolean) as PokemonType[];
    return { elementalAverage, ultraAverage, ultraCost, selectedTypes };
  }, [npcPrice, primaryType, secondaryType]);

  return (
    <div className="grid gap-4">
      <ToolTitle title="Media de Balls" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="grid gap-3">
          <NumberField label="Preco no NPC" value={npcPrice} min={0} onChange={setNpcPrice} />
          <TypeSelect label="Tipo primario" value={primaryType} onChange={setPrimaryType} />
          <TypeSelect label="Tipo secundario" value={secondaryType} includeNone onChange={setSecondaryType} />
          <NumberField label="Preco da ball elemental primaria" value={primaryBallPrice} min={0} onChange={setPrimaryBallPrice} />
          <NumberField label="Preco da ball elemental secundaria" value={secondaryBallPrice} min={0} onChange={setSecondaryBallPrice} />
        </div>
        <div className="grid content-start gap-3">
          <ResultPanel>
            <BallLabel name="Ultra Ball" />
            <span className="mt-2 block">
              {Math.ceil(result.ultraAverage)} media ({formatMoneyLabel(result.ultraCost * 1000)})
            </span>
          </ResultPanel>
          {result.selectedTypes.map((type, index) => {
            const ballPrice = index === 0 ? primaryBallPrice : secondaryBallPrice;
            const cost = Math.ceil((result.elementalAverage * ballPrice) / 1000);
            return (
              <ResultPanel key={type}>
                <BallLabel name={elementalBallByType[type] || 'Elemental Ball'} />
                <span className="mt-2 block">
                  {Math.ceil(result.elementalAverage)} media para <TypeBadge type={type} /> ({formatMoneyLabel(cost * 1000)})
                </span>
              </ResultPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BallTypesTool() {
  return (
    <div className="grid gap-4">
      <ToolTitle title="Tipos de Balls" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ballCatalog.map((ball) => (
          <div key={ball.name} className="grid grid-cols-[56px_1fr] gap-3 rounded-lg border border-white/10 bg-slate-950/50 p-4">
            <BallIcon name={ball.name} className="h-14 w-14" />
            <div className="min-w-0">
              <strong className="text-white">{ball.name}</strong>
              <span className="mt-2 block text-sm text-slate-300">{ball.bestFor}</span>
              <span className="mt-2 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
                {ball.rate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoostCalculatorTool() {
  const [boostType, setBoostType] = useState(2);
  const [useSpecial, setUseSpecial] = useState(false);
  const [currentBoost, setCurrentBoost] = useState(0);
  const [targetBoost, setTargetBoost] = useState(50);
  const [stonePrice, setStonePrice] = useState(1000);
  const [boostStonePrice, setBoostStonePrice] = useState(0);
  const result = calculateBoostCost({ currentBoost, targetBoost, boostType, useSpecial, stonePrice, boostStonePrice });

  return (
    <div className="grid gap-4">
      <ToolTitle title="Calculadora de Boost" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <BoostControls
          boostType={boostType}
          setBoostType={setBoostType}
          useSpecial={useSpecial}
          setUseSpecial={setUseSpecial}
          currentBoost={currentBoost}
          setCurrentBoost={setCurrentBoost}
          targetBoost={targetBoost}
          setTargetBoost={setTargetBoost}
          stonePrice={stonePrice}
          setStonePrice={setStonePrice}
          boostStonePrice={boostStonePrice}
          setBoostStonePrice={setBoostStonePrice}
        />
        <ResultPanel>
          {'error' in result ? (
            <span>{result.error}</span>
          ) : (
            <div className="grid gap-2">
              <span>Boost atual: +{currentBoost}</span>
              <span>Boost desejado: +{targetBoost}</span>
              <span>Stones comuns usadas: {result.commonStones}</span>
              <span>Boost Stones usadas: {result.boostStones}</span>
              {result.boostStoneLevels.length ? (
                <span>Boosts feitos com Boost Stone: {result.boostStoneLevels.map((level) => `+${level}`).join(', ')}</span>
              ) : null}
              <span>Custo com stone comum: {formatCurrency(result.totalStoneCost)}</span>
              <span>Custo com Boost Stone: {formatCurrency(result.totalBoostCost)}</span>
              <strong className="text-white">Custo total: {formatCurrency(result.totalCost)}</strong>
            </div>
          )}
        </ResultPanel>
      </div>
    </div>
  );
}

function TypeChartTool() {
  const [primaryType, setPrimaryType] = useState<PokemonType | ''>('Fire');
  const [secondaryType, setSecondaryType] = useState<PokemonType | ''>('');
  const defenseTypes = [primaryType, secondaryType].filter(Boolean) as PokemonType[];
  const results = pokemonTypes
    .map((attackType) => ({
      attackType,
      multiplier: getCombinedMultiplier(attackType, defenseTypes),
    }))
    .sort((left, right) => right.multiplier - left.multiplier || left.attackType.localeCompare(right.attackType));

  return (
    <div className="grid gap-4">
      <ToolTitle title="Tabela de Tipos" />
      <div className="grid gap-3 sm:grid-cols-2">
        <TypeSelect label="Tipo defensivo primario" value={primaryType} onChange={setPrimaryType} />
        <TypeSelect label="Tipo defensivo secundario" value={secondaryType} includeNone onChange={setSecondaryType} />
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
        <span className="font-bold uppercase tracking-[0.14em] text-slate-500">Defesa</span>
        {defenseTypes.map((type) => (
          <span key={type} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
            <TypeBadge type={type} />
          </span>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Super efetivo', filter: (value: number) => value > 1 },
          { title: 'Dano normal', filter: (value: number) => value === 1 },
          { title: 'Pouco efetivo', filter: (value: number) => value > 0 && value < 1 },
          { title: 'Sem efeito', filter: (value: number) => value === 0 },
        ].map((group) => (
          <div key={group.title} className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
            <h3 className="font-black text-white">{group.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {results.filter((entry) => group.filter(entry.multiplier)).map((entry) => (
                <span key={entry.attackType} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-slate-200">
                  <TypeBadge type={entry.attackType} />
                  <span>{entry.multiplier}x</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoostTableTool() {
  const [boostType, setBoostType] = useState(2);
  const [useSpecial, setUseSpecial] = useState(false);
  const rows = buildBoostTable(boostType, useSpecial);

  return (
    <div className="grid gap-4">
      <ToolTitle title="Tabela de Boost" />
      <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
        <label className="grid gap-2 text-sm font-bold text-slate-300">
          Tipo de boost
          <select
            value={boostType}
            onChange={(event) => setBoostType(Number(event.target.value))}
            className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-300"
          >
            {boostTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-3 text-sm font-bold text-slate-300">
          <input type="checkbox" checked={useSpecial} onChange={(event) => setUseSpecial(event.target.checked)} />
          Usar stone especial
        </label>
      </div>
      <div className="max-h-[520px] overflow-auto rounded-lg border border-white/10">
        <table className="w-full min-w-80 text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase tracking-[0.16em] text-cyan-200">
            <tr>
              <th className="px-3 py-2">Nivel</th>
              <th className="px-3 py-2">Stones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.level} className="border-t border-white/10">
                <td className="px-3 py-2 font-bold text-white">+{row.level}</td>
                <td className="px-3 py-2 text-slate-300">{row.stones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BoostControls({
  boostType,
  setBoostType,
  useSpecial,
  setUseSpecial,
  currentBoost,
  setCurrentBoost,
  targetBoost,
  setTargetBoost,
  stonePrice,
  setStonePrice,
  boostStonePrice,
  setBoostStonePrice,
}: {
  boostType: number;
  setBoostType: (value: number) => void;
  useSpecial: boolean;
  setUseSpecial: (value: boolean) => void;
  currentBoost: number;
  setCurrentBoost: (value: number) => void;
  targetBoost: number;
  setTargetBoost: (value: number) => void;
  stonePrice: number;
  setStonePrice: (value: number) => void;
  boostStonePrice: number;
  setBoostStonePrice: (value: number) => void;
}) {
  return (
    <div className="grid gap-3">
      <label className="grid gap-2 text-sm font-bold text-slate-300">
        Tipo de boost
        <select
          value={boostType}
          onChange={(event) => setBoostType(Number(event.target.value))}
          className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-cyan-300"
        >
          {boostTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
        <input type="checkbox" checked={useSpecial} onChange={(event) => setUseSpecial(event.target.checked)} />
        Usar stone especial
      </label>
      <NumberField label="Boost atual" value={currentBoost} min={0} onChange={setCurrentBoost} />
      <NumberField label="Boost desejado" value={targetBoost} min={0} onChange={setTargetBoost} />
      <NumberField label="Preco da stone" value={stonePrice} min={0} onChange={setStonePrice} />
      <NumberField label="Preco da Boost Stone" value={boostStonePrice} min={0} onChange={setBoostStonePrice} />
    </div>
  );
}

function ToolTitle({ title }: { title: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">ferramenta</span>
      <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
    </div>
  );
}

function BallIcon({ name, className = 'h-8 w-8' }: { name: string; className?: string }) {
  const iconSrc = getBallIconSrc(name);

  if (!iconSrc) {
    return <span className={`${className} rounded-full border border-white/10 bg-slate-900`} />;
  }

  return <img src={iconSrc} alt="" className={`${className} object-contain`} loading="lazy" />;
}

function BallLabel({ name }: { name: string }) {
  return (
    <strong className="inline-flex items-center gap-2 text-white">
      <BallIcon name={name} />
      {name}
    </strong>
  );
}

function TypeBadge({ type }: { type: PokemonType }) {
  const iconSrc = getTypeIconSrc(type);

  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {iconSrc ? <img src={iconSrc} alt="" className="h-4 w-4 object-contain" loading="lazy" /> : null}
      <span>{type}</span>
    </span>
  );
}
