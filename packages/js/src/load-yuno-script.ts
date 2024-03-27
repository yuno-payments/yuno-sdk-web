import {
  findYunoScript,
  getYunoNamespace,
  insertYunoScriptElement,
  isServer,
} from "./internal/utils";

export function loadYunoScript() {
  if (isServer)
    throw new Error(
      `You're trying to use @yuno-sdk-web/js in a server environment. This is not supported by default.`,
    );

  const yunoInstanceFound = getYunoInstance();
  if (yunoInstanceFound) return yunoInstanceFound;

  const yunoInstance = insertYunoScriptElement();
  return yunoInstance
}

function getYunoInstance() {
  const scriptFound = findYunoScript();
  const yunoNamespace = getYunoNamespace();

  if (scriptFound && yunoNamespace) {
    return yunoNamespace;
  }
}
