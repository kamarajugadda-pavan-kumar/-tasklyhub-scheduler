export interface ICallbackRegistry<T1> {
  registerCallback(name: string, callback: T1): void;
  getCallback(name: string): T1 | undefined;
}
