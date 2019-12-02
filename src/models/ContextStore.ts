import { ExtensionContext } from "vscode";

class ContextStore {
  private static context: ExtensionContext | null = null;

  private constructor() {}

  public static getContext(): ExtensionContext | null {
    return ContextStore.context;
  }

  public static storeContext(context: ExtensionContext): void {
    ContextStore.context = context;
  }
}

export default ContextStore;
