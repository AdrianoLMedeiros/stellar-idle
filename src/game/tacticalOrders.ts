import { TACTICAL_ORDERS, getTacticalOrder } from '../data/tacticalOrders';
import type { GameState, TacticalOrderEffectType, TacticalOrderState } from './types';

export function createInitialTacticalOrders(): TacticalOrderState[] {
  return TACTICAL_ORDERS.map((order) => ({
    id: order.id,
    cooldown: 0,
  }));
}

export function tickTacticalOrders(state: GameState, deltaSeconds: number): void {
  for (const order of state.tacticalOrders) {
    order.cooldown = Math.max(0, order.cooldown - deltaSeconds);
  }

  state.activeTacticalOrderEffects = (state.activeTacticalOrderEffects ?? [])
    .map((effect) => ({
      ...effect,
      remaining: effect.remaining - deltaSeconds,
    }))
    .filter((effect) => effect.remaining > 0);
}

export function getTacticalOrderEffectValue(state: GameState, type: TacticalOrderEffectType): number {
  return (state.activeTacticalOrderEffects ?? []).reduce((sum, activeEffect) => {
    return sum + activeEffect.effects
      .filter((effect) => effect.type === type)
      .reduce((effectSum, effect) => effectSum + effect.value, 0);
  }, 0);
}

export function getTacticalOrderMultiplier(state: GameState, type: TacticalOrderEffectType): number {
  if (type === 'incoming_damage_reduction') {
    return Math.max(0.1, 1 - getTacticalOrderEffectValue(state, type));
  }

  return 1 + getTacticalOrderEffectValue(state, type);
}

export function consumeTacticalOrderEffect(state: GameState, type: TacticalOrderEffectType): void {
  const activeEffect = state.activeTacticalOrderEffects.find((effect) => {
    return effect.effects.some((candidate) => candidate.type === type);
  });
  if (!activeEffect) return;

  state.activeTacticalOrderEffects = state.activeTacticalOrderEffects.filter((effect) => effect.id !== activeEffect.id);
}

export function activateTacticalOrder(state: GameState, orderId: string): string | null {
  const orderState = state.tacticalOrders.find((candidate) => candidate.id === orderId);
  if (!orderState || orderState.cooldown > 0) return null;

  const order = getTacticalOrder(orderId);
  orderState.cooldown = order.cooldown;
  state.activeTacticalOrderEffects = state.activeTacticalOrderEffects.filter((effect) => effect.id !== order.id);
  state.activeTacticalOrderEffects.push({
    id: order.id,
    name: order.name,
    remaining: order.duration,
    effects: order.effects,
  });

  return order.name;
}
