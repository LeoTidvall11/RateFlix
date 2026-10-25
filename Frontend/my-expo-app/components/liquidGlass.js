import { TurboModuleRegistry } from 'react-native';

let LiquidGlassView = null;
let isLiquidGlassSupported = false;

if (TurboModuleRegistry.get('NativeLiquidGlassModule')) {
  const lib = require('@callstack/liquid-glass');
  LiquidGlassView = lib.LiquidGlassView;
  isLiquidGlassSupported = lib.isLiquidGlassSupported;
}

export { LiquidGlassView, isLiquidGlassSupported };
