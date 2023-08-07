import { useHotkeys, isHotkeyPressed } from "react-hotkeys-hook";
import { toStudlyCaps } from "strman";
import { keymap } from "./keymap";

export type Hotkey = {
  title: string,
  shortcut?: string,
  macos?: string,
  other?: string
}

const readableShortcut = (shortcut: string|[string]) => {
  if (Array.isArray(shortcut)) {
    return shortcut.map(sc=>sc.split('+').map(str => toStudlyCaps(str)).join(' + ')).join(' or ');
  }
  return shortcut.split('+').map(str => toStudlyCaps(str)).join(' + ');
};

const useShortcut = (
  actionName: keyof typeof keymap,
  callback: () => void,
  options = { showShortcut: true },
  dependencies = undefined,
) => {
  const action = keymap[actionName] as Hotkey;
  const isMacos = /mac/i.test(navigator.platform);
  const shortcut = action.shortcut ?? (isMacos ? action.macos : action.other) as string;

  useHotkeys(shortcut, () => {
    callback();
  }, {
    keyup: false,
    element: document.body,
  } as any, dependencies);

  const title = action.title + (options.showShortcut ? `: [ ${readableShortcut(shortcut)} ]` : '');

  return title;
};

const isShortcutPressed = (
  actionName: keyof typeof keymap
) => {
  const action = keymap[actionName] as Hotkey;
  const isMacos = /mac/i.test(navigator.platform);
  const shortcut = action.shortcut ?? (isMacos ? action.macos : action.other) as string;
  return isHotkeyPressed(shortcut);
}

export { useShortcut, isShortcutPressed };
