import { ICallbackRegistry } from "../interfaces/ICallbackRegistry";
import { Callback } from "../types";

export class CallbackRegistry implements ICallbackRegistry<Callback> {
  private static instance: CallbackRegistry;
  private callbacks: Map<string, Callback>;

  private constructor() {
    this.callbacks = new Map<string, Callback>();
  }

  public static getInstance(): CallbackRegistry {
    if (!CallbackRegistry.instance) {
      CallbackRegistry.instance = new CallbackRegistry();
    }
    return CallbackRegistry.instance;
  }

  public registerCallback(name: string, callback: Callback): void {
    this.callbacks.set(name, callback);
  }

  public getCallback(name: string): Callback | undefined {
    return this.callbacks.get(name);
  }
}
