import type { WeddingConfig } from '../types';

type ConfigRecord = WeddingConfig & Record<string, unknown>;
type FloralNamespace = 'botanical_art' | 'envelope_floral' | 'paper_floral';

export interface FloralDecorConfig {
  enabled: boolean;
  style: string;
  density: string;
  opacity: number;
  cardDecorEnabled: boolean;
}

function getBool(config: ConfigRecord, key: string, fallback: boolean): boolean {
  const value = config[key];
  return typeof value === 'boolean' ? value : fallback;
}

function getString(config: ConfigRecord, key: string, fallback: string): string {
  const value = config[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getNumber(config: ConfigRecord, key: string, fallback: number): number {
  const value = config[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function getFloralDecorConfig(config: WeddingConfig, namespace: FloralNamespace = 'botanical_art'): FloralDecorConfig {
  const cfg = config as ConfigRecord;
  const defaultStyle = getString(cfg, 'botanical_art_style', 'watercolor-eucalyptus');
  const defaultDensity = getString(cfg, 'botanical_art_density', 'balanced');
  const defaultOpacity = getNumber(cfg, 'botanical_art_opacity', 0.62);
  const defaultEnabled = getBool(cfg, 'botanical_art_enabled', true);
  const defaultCardDecor = getBool(cfg, 'botanical_art_card_decor_enabled', true);

  if (namespace === 'botanical_art') {
    return {
      enabled: defaultEnabled,
      style: defaultStyle,
      density: defaultDensity,
      opacity: defaultOpacity,
      cardDecorEnabled: defaultCardDecor,
    };
  }

  return {
    enabled: getBool(cfg, `${namespace}_decor_enabled`, defaultEnabled),
    style: getString(cfg, `${namespace}_decor_style`, defaultStyle),
    density: getString(cfg, `${namespace}_decor_density`, defaultDensity),
    opacity: getNumber(cfg, `${namespace}_decor_opacity`, defaultOpacity),
    cardDecorEnabled: getBool(cfg, `${namespace}_card_decor_enabled`, defaultCardDecor),
  };
}
