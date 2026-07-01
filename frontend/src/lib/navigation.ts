import { Boxes, FlaskConical, Hammer, Heart, Shield, Sparkles, Wrench } from 'lucide-react';
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
    href: '/tools',
    label: 'Ferramentas',
    description: 'Calculadoras e tabelas rapidas',
    icon: Wrench,
    ready: true,
  },
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
    href: '/favorites',
    label: 'Favoritos',
    description: 'Itens salvos localmente',
    icon: Heart,
    ready: true,
  },
];
