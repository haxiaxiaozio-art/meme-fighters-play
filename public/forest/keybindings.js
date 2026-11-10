(function (root) {
  'use strict';
  const STORAGE_KEY = 'forest-sword.keybindings.v1';
  const ACTIONS = Object.freeze([
    { id: 'left', label: '向左' }, { id: 'right', label: '向右' },
    { id: 'up', label: '技能向上' }, { id: 'down', label: '技能向下' },
    { id: 'jump', label: '跳跃' }, { id: 'attack', label: '攻击' },
    { id: 'dash', label: '冲刺' }, { id: 'special', label: '特殊键' },
    { id: 'defense', label: '格挡 / 空中回避' }, { id: 'trainingShot', label: '练习弹' },
    { id: 'switchWeapon', label: '切换武器' }
  ].map(Object.freeze));
  const DEFAULTS = Object.freeze({
    left: Object.freeze(['ArrowLeft', 'KeyA']), right: Object.freeze(['ArrowRight', 'KeyD']),
    up: Object.freeze(['ArrowUp', 'KeyW']), down: Object.freeze(['ArrowDown', 'KeyS']),
    jump: Object.freeze(['Space']), attack: Object.freeze(['KeyJ', 'KeyZ']),
    dash: Object.freeze(['KeyK', 'KeyX', 'ShiftLeft', 'ShiftRight']), special: Object.freeze(['KeyL', 'KeyC']),
    defense: Object.freeze(['KeyF']), trainingShot: Object.freeze(['KeyT']), switchWeapon: Object.freeze(['KeyU'])
  });
  const names = Object.freeze({
    ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Space: '空格',
    ShiftLeft: '左Shift', ShiftRight: '右Shift', ControlLeft: '左Ctrl', ControlRight: '右Ctrl',
    AltLeft: '左Alt', AltRight: '右Alt', Enter: 'Enter', Tab: 'Tab', Backspace: '退格',
    CapsLock: 'Caps', Delete: 'Delete', Insert: 'Insert', Home: 'Home', End: 'End',
    PageUp: 'PageUp', PageDown: 'PageDown', Escape: 'Esc',
    Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
    Semicolon: ';', Quote: "'", Backquote: '`', Comma: ',', Period: '.', Slash: '/',
    NumpadAdd: '数字+', NumpadSubtract: '数字-', NumpadMultiply: '数字*',
    NumpadDivide: '数字/', NumpadDecimal: '数字.', NumpadEnter: '数字Enter'
  });
  function assignable(code) {
    return typeof code === 'string' && code !== 'Escape' &&
      (/^(Key[A-Z]|Digit[0-9]|Numpad[0-9]|F([1-9]|1[0-2]))$/.test(code) || Object.hasOwn(names, code));
  }
  function copy(bindings = DEFAULTS) { return Object.fromEntries(ACTIONS.map(a => [a.id, [...bindings[a.id]]])); }
  function label(code) {
    if (names[code]) return names[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad[0-9]$/.test(code)) return '数字' + code.slice(6);
    return code;
  }
  function validate(bindings) {
    if (!bindings || typeof bindings !== 'object' || Array.isArray(bindings)) return false;
    const seen = new Set();
    for (const { id } of ACTIONS) {
      const keys = bindings[id];
      if (!Array.isArray(keys) || keys.length < 1 || keys.length > 4) return false;
      for (const code of keys) {
        if (!assignable(code) || seen.has(code)) return false;
        seen.add(code);
      }
    }
    return true;
  }
  function keymap(bindings) { return Object.fromEntries(ACTIONS.flatMap(a => bindings[a.id].map(code => [code, a.id]))); }
  function assign(bindings, action, code) {
    if (!ACTIONS.some(a => a.id === action) || !validate(bindings)) return { ok: false, error: '键位配置无效。' };
    if (!assignable(code)) return { ok: false, error: code === 'Escape' ? 'Esc 固定用于暂停或返回，请选择其他按键。' : '暂不支持这个按键，请换一个。' };
    const conflict = ACTIONS.find(a => a.id !== action && bindings[a.id].includes(code));
    if (conflict) return { ok: false, error: label(code) + ' 已用于“' + conflict.label + '”，请先调整该操作。' };
    const next = copy(bindings); next[action] = [code];
    return { ok: true, bindings: next };
  }
  function load(storage) {
    try {
      const stored = JSON.parse(storage.getItem(STORAGE_KEY));
      if (stored?.version === 1 && validate(stored.bindings)) return copy(stored.bindings);
      // Preserve pre-weapon custom keys; a previously occupied U is never silently stolen.
      if (stored?.version === 1 && stored.bindings && !Object.hasOwn(stored.bindings, 'switchWeapon')) {
        const used = Object.values(stored.bindings).flat();
        const available = ['KeyU', 'KeyV', 'KeyB', 'KeyN', ...Array.from({ length: 12 }, (_, i) => 'F' + (i + 1))].find(code => !used.includes(code));
        const upgraded = { ...stored.bindings, switchWeapon: [available] };
        if (validate(upgraded)) return copy(upgraded);
      }
    } catch { /* An unavailable or damaged store falls back to a fully usable layout. */ }
    return copy();
  }
  function save(storage, bindings) {
    if (!validate(bindings)) return false;
    try { storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, bindings })); return true; } catch { return false; }
  }
  function primary(bindings, action) { return label(bindings[action][0]); }
  function abilityKey(bindings, id) {
    const key = action => primary(bindings, action), skill = key('special');
    return ({ specialNeutral: skill, specialUp: key('up') + ' ' + skill,
      specialDown: key('down') + ' ' + skill, specialSide: key('left') + '/' + key('right') + ' ' + skill,
      dashAttack: key('dash') + ' → ' + key('attack'), specialDash: key('dash') + ' → ' + skill,
      dash: key('dash'), defense: key('defense') })[id];
  }
  const api = { STORAGE_KEY, ACTIONS, DEFAULTS, copy, assignable, label, validate, keymap, assign, load, save, primary, abilityKey };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ForestKeys = api;
})(typeof window !== 'undefined' ? window : globalThis);
