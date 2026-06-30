import { Boxes, Database, FlaskConical, Hammer, Heart, Shield, Sparkles, Wrench } from 'lucide-react';
import type { ComponentType } from 'react';

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  ready: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Clas',
    description: 'Lista e detalhes dos clas',
    icon: Shield,
    ready: true,
  },
  {
    href: '/professions',
    label: 'Profissoes',
    description: 'Especializacoes, crafts e recursos',
    icon: Hammer,
    ready: true,
  },
  {
    href: '/pokedex',
    label: 'Pokedex',
    description: 'Pokemon, tiers e funcoes',
    icon: Sparkles,
    ready: true,
  },
  {
    href: '/items',
    label: 'Itens',
    description: 'Categorias e atributos',
    icon: Boxes,
    ready: true,
  },
  {
    href: '/crafts',
    label: 'Crafts',
    description: 'Busca por item, profissao e ingrediente',
    icon: FlaskConical,
    ready: true,
  },
  {
    href: '/wiki-data',
    label: 'Wiki Data',
    description: 'Novos dominios da Wiki',
    icon: Database,
    ready: true,
  },
  {
    href: '/admin',
    label: 'Admin',
    description: 'Saude dos dados e scrapers',
    icon: Wrench,
    ready: true,
  },
  {
    href: '/favorites',
    label: 'Favoritos',
    description: 'Itens salvos localmente',
    icon: Heart,
    ready: true,
  },
];
